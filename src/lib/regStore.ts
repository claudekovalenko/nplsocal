import type { Registration } from './registrations';
import { isShared, supabase } from './supabaseClient';

/**
 * Where sign-ups are kept.
 *  - 'local': this device only. Used until a shared database is connected;
 *    the form also emails the organizer so nothing is lost.
 *  - 'shared': a Supabase table. Anyone may submit; only signed-in members with
 *    the admin or leads role can read the roster (names, emails and phones are
 *    private). Sign-in itself lives in `./auth`, not here: it is the same
 *    session for every table in the app.
 */
export interface RegistrationStore {
  readonly kind: 'local' | 'shared';
  list(eventId?: string): Promise<Registration[]>;
  add(reg: Registration): Promise<void>;
  addMany(regs: Registration[]): Promise<void>;
  /** Moves a sign-up to the trash. Reversible for TRASH_DAYS. */
  remove(id: string): Promise<void>;
  /** Sign-ups in the trash, newest first. Admin only on the shared store. */
  listTrash(eventId?: string): Promise<Registration[]>;
  /** Puts a trashed sign-up back on the roster. */
  restore(id: string): Promise<void>;
  /** Deletes for good, now, skipping the retention window. */
  purge(id: string): Promise<void>;
  subscribe(cb: () => void): () => void;
}

const KEY = 'npl:registrations';

class LocalRegStore implements RegistrationStore {
  readonly kind = 'local' as const;
  private subs = new Set<() => void>();
  private read(): Registration[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]');
    } catch {
      return [];
    }
  }
  private write(rows: Registration[]) {
    localStorage.setItem(KEY, JSON.stringify(rows));
    this.subs.forEach((cb) => cb());
  }
  private select(eventId: string | undefined, trashed: boolean) {
    return this.read()
      .filter((r) => (trashed ? !!r.deletedAt : !r.deletedAt))
      .filter((r) => !eventId || r.eventId === eventId)
      .sort((a, b) => (trashed ? (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '') : b.createdAt.localeCompare(a.createdAt)));
  }
  async list(eventId?: string) {
    return this.select(eventId, false);
  }
  async listTrash(eventId?: string) {
    return this.select(eventId, true);
  }
  async add(reg: Registration) {
    this.write([...this.read(), reg]);
  }
  async addMany(regs: Registration[]) {
    this.write([...this.read(), ...regs]);
  }
  async remove(id: string) {
    const when = new Date().toISOString();
    this.write(this.read().map((r) => (r.id === id ? { ...r, deletedAt: when } : r)));
  }
  async restore(id: string) {
    this.write(this.read().map((r) => (r.id === id ? { ...r, deletedAt: null } : r)));
  }
  async purge(id: string) {
    this.write(this.read().filter((r) => r.id !== id));
  }
  subscribe(cb: () => void) {
    this.subs.add(cb);
    const onStorage = (e: StorageEvent) => e.key === KEY && cb();
    window.addEventListener('storage', onStorage);
    return () => {
      this.subs.delete(cb);
      window.removeEventListener('storage', onStorage);
    };
  }
}

interface Row {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  party: number;
  city: string;
  church: string;
  days: string[];
  notes: string;
  created_at: string;
  deleted_at: string | null;
}

const toReg = (r: Row): Registration => ({
  id: r.id,
  eventId: r.event_id,
  name: r.name,
  email: r.email ?? '',
  phone: r.phone ?? '',
  party: r.party ?? 1,
  city: r.city ?? '',
  church: r.church ?? '',
  days: r.days ?? [],
  notes: r.notes ?? '',
  createdAt: r.created_at,
  deletedAt: r.deleted_at,
});

const toRow = (r: Registration) => ({
  id: r.id,
  event_id: r.eventId,
  name: r.name,
  email: r.email,
  phone: r.phone,
  party: r.party,
  city: r.city,
  church: r.church,
  days: r.days,
  notes: r.notes,
});

class SharedRegStore implements RegistrationStore {
  readonly kind = 'shared' as const;
  private subs = new Set<() => void>();
  constructor() {
    supabase()
      .channel('registrations-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'npl_registrations' }, () =>
        this.subs.forEach((cb) => cb()),
      )
      .subscribe();
  }
  async list(eventId?: string) {
    // Row-level security already hides the trash from the leads role, but an
    // admin can see everything, so the filter has to be here too.
    let q = supabase()
      .from('npl_registrations')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (eventId) q = q.eq('event_id', eventId);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Row[]).map(toReg);
  }
  async listTrash(eventId?: string) {
    let q = supabase()
      .from('npl_registrations')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (eventId) q = q.eq('event_id', eventId);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Row[]).map(toReg);
  }
  async add(reg: Registration) {
    const { error } = await supabase().from('npl_registrations').insert(toRow(reg));
    if (error) throw error;
  }
  async addMany(regs: Registration[]) {
    const { error } = await supabase().from('npl_registrations').insert(regs.map(toRow));
    if (error) throw error;
  }
  async remove(id: string) {
    const { error } = await supabase()
      .from('npl_registrations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }
  async restore(id: string) {
    const { error } = await supabase().from('npl_registrations').update({ deleted_at: null }).eq('id', id);
    if (error) throw error;
  }
  async purge(id: string) {
    const { error } = await supabase().from('npl_registrations').delete().eq('id', id);
    if (error) throw error;
  }
  subscribe(cb: () => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }
}

let instance: RegistrationStore | null = null;
export function getRegStore(): RegistrationStore {
  if (!instance) instance = isShared ? new SharedRegStore() : new LocalRegStore();
  return instance;
}

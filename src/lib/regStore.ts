import type { Registration } from './registrations';
import { isShared, supabase } from './supabaseClient';

/**
 * Where sign-ups are kept.
 *  - 'local': this device only. Used until a shared database is connected;
 *    the form also emails the organizer so nothing is lost.
 *  - 'shared': a Supabase table. Anyone may submit; only signed-in
 *    organizers can read the roster (names, emails and phones are private).
 */
export interface RegistrationStore {
  readonly kind: 'local' | 'shared';
  list(eventId?: string): Promise<Registration[]>;
  add(reg: Registration): Promise<void>;
  addMany(regs: Registration[]): Promise<void>;
  remove(id: string): Promise<void>;
  subscribe(cb: () => void): () => void;
  auth?: {
    user(): Promise<{ email: string } | null>;
    signIn(email: string): Promise<void>;
    signOut(): Promise<void>;
    onChange(cb: () => void): () => void;
  };
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
  async list(eventId?: string) {
    const all = this.read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return eventId ? all.filter((r) => r.eventId === eventId) : all;
  }
  async add(reg: Registration) {
    this.write([...this.read(), reg]);
  }
  async addMany(regs: Registration[]) {
    this.write([...this.read(), ...regs]);
  }
  async remove(id: string) {
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
  network: string;
  notes: string;
  created_at: string;
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
  network: r.network ?? '',
  notes: r.notes ?? '',
  createdAt: r.created_at,
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
  network: r.network,
  notes: r.notes,
});

class SharedRegStore implements RegistrationStore {
  readonly kind = 'shared' as const;
  private subs = new Set<() => void>();
  constructor() {
    supabase()
      .channel('registrations-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () =>
        this.subs.forEach((cb) => cb()),
      )
      .subscribe();
  }
  async list(eventId?: string) {
    let q = supabase().from('registrations').select('*').order('created_at', { ascending: false });
    if (eventId) q = q.eq('event_id', eventId);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Row[]).map(toReg);
  }
  async add(reg: Registration) {
    const { error } = await supabase().from('registrations').insert(toRow(reg));
    if (error) throw error;
  }
  async addMany(regs: Registration[]) {
    const { error } = await supabase().from('registrations').insert(regs.map(toRow));
    if (error) throw error;
  }
  async remove(id: string) {
    const { error } = await supabase().from('registrations').delete().eq('id', id);
    if (error) throw error;
  }
  subscribe(cb: () => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }
  auth = {
    async user() {
      const { data } = await supabase().auth.getUser();
      return data.user?.email ? { email: data.user.email } : null;
    },
    async signIn(email: string) {
      const { error } = await supabase().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      });
      if (error) throw error;
    },
    async signOut() {
      await supabase().auth.signOut();
    },
    onChange(cb: () => void) {
      const { data } = supabase().auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },
  };
}

let instance: RegistrationStore | null = null;
export function getRegStore(): RegistrationStore {
  if (!instance) instance = isShared ? new SharedRegStore() : new LocalRegStore();
  return instance;
}

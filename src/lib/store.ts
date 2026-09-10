import type { Group } from './groups';

/**
 * Storage adapter for the tracker.
 *  - LocalStore: this device only (default). Works offline, no setup.
 *  - SupabaseStore: shared, live across the network. Activates when
 *    VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set at build time.
 */
export interface GroupStore {
  readonly kind: 'local' | 'supabase';
  list(): Promise<Group[]>;
  upsert(group: Group): Promise<void>;
  remove(id: string): Promise<void>;
  /** Called whenever data changes (locally or remotely). Returns an unsubscribe. */
  subscribe(cb: () => void): () => void;
  /** Auth is only meaningful for the shared store. */
  auth?: {
    user(): Promise<{ email: string } | null>;
    signIn(email: string): Promise<void>;
    signOut(): Promise<void>;
    onChange(cb: () => void): () => void;
  };
}

const KEY = 'npl:groups';

class LocalStore implements GroupStore {
  readonly kind = 'local' as const;
  private subs = new Set<() => void>();
  private read(): Group[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]');
    } catch {
      return [];
    }
  }
  private write(groups: Group[]) {
    localStorage.setItem(KEY, JSON.stringify(groups));
    this.subs.forEach((cb) => cb());
  }
  async list() {
    return this.read();
  }
  async upsert(group: Group) {
    const all = this.read();
    const i = all.findIndex((g) => g.id === group.id);
    if (i >= 0) all[i] = group;
    else all.push(group);
    this.write(all);
  }
  async remove(id: string) {
    this.write(this.read().filter((g) => g.id !== id));
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

let instance: GroupStore | null = null;

export async function getStore(): Promise<GroupStore> {
  if (instance) return instance;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) {
    const { createSupabaseStore } = await import('./supabaseStore');
    instance = createSupabaseStore(url, key);
  } else {
    instance = new LocalStore();
  }
  return instance;
}

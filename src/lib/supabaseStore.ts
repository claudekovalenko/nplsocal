import { createClient } from '@supabase/supabase-js';
import type { Group } from './groups';
import type { GroupStore } from './store';

/** Row shape in Postgres (snake_case) ↔ Group (camelCase). */
interface Row {
  id: string;
  name: string;
  hub: 'la' | 'oc';
  area: string;
  leader: string;
  parent_id: string | null;
  status: 'group' | 'church';
  started: string;
  attending: number;
  believers: number;
  baptized: number;
  elements: Group['elements'];
  notes: string;
  updated_at: string;
}

const toGroup = (r: Row): Group => ({
  id: r.id,
  name: r.name,
  hub: r.hub,
  area: r.area ?? '',
  leader: r.leader ?? '',
  parentId: r.parent_id,
  status: r.status,
  started: r.started,
  attending: r.attending ?? 0,
  believers: r.believers ?? 0,
  baptized: r.baptized ?? 0,
  elements: r.elements ?? {},
  notes: r.notes ?? '',
  updatedAt: r.updated_at,
});

const toRow = (g: Group): Omit<Row, 'updated_at'> => ({
  id: g.id,
  name: g.name,
  hub: g.hub,
  area: g.area,
  leader: g.leader,
  parent_id: g.parentId,
  status: g.status,
  started: g.started,
  attending: g.attending,
  believers: g.believers,
  baptized: g.baptized,
  elements: g.elements,
  notes: g.notes,
});

export function createSupabaseStore(url: string, key: string): GroupStore {
  const sb = createClient(url, key);
  const subs = new Set<() => void>();
  const notify = () => subs.forEach((cb) => cb());

  sb.channel('groups-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, notify)
    .subscribe();

  return {
    kind: 'supabase',
    async list() {
      const { data, error } = await sb.from('groups').select('*').order('started');
      if (error) throw error;
      return (data as Row[]).map(toGroup);
    },
    async upsert(group) {
      const { error } = await sb.from('groups').upsert(toRow(group));
      if (error) throw error;
      notify();
    },
    async remove(id) {
      const { error } = await sb.from('groups').delete().eq('id', id);
      if (error) throw error;
      notify();
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    auth: {
      async user() {
        const { data } = await sb.auth.getUser();
        return data.user?.email ? { email: data.user.email } : null;
      },
      async signIn(email) {
        const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
        if (error) throw error;
      },
      async signOut() {
        await sb.auth.signOut();
      },
      onChange(cb) {
        const { data } = sb.auth.onAuthStateChange(() => cb());
        return () => data.subscription.unsubscribe();
      },
    },
  };
}

import { useCallback, useEffect, useState } from 'react';
import type { Group } from '@/lib/groups';
import { getStore, type GroupStore } from '@/lib/store';

export function useGroups() {
  const [store, setStore] = useState<GroupStore | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const refresh = useCallback(async (s: GroupStore) => {
    try {
      setGroups(await s.list());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let off = () => {};
    let offAuth = () => {};
    getStore().then((s) => {
      setStore(s);
      refresh(s);
      off = s.subscribe(() => refresh(s));
      if (s.auth) {
        s.auth.user().then(setUser);
        offAuth = s.auth.onChange(() => s.auth!.user().then(setUser));
      }
    });
    return () => {
      off();
      offAuth();
    };
  }, [refresh]);

  const upsert = useCallback(
    async (g: Group) => {
      if (!store) return;
      await store.upsert({ ...g, updatedAt: new Date().toISOString() });
      await refresh(store);
    },
    [store, refresh],
  );
  const remove = useCallback(
    async (id: string) => {
      if (!store) return;
      await store.remove(id);
      await refresh(store);
    },
    [store, refresh],
  );

  const canEdit = !store?.auth || !!user;
  return { store, groups, loading, error, upsert, remove, user, canEdit };
}

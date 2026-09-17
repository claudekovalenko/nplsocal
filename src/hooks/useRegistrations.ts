import { useCallback, useEffect, useState } from 'react';
import type { Registration } from '@/lib/registrations';
import { getRegStore } from '@/lib/regStore';

export function useRegistrations(eventId?: string) {
  const store = getRegStore();
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRows(await store.list(eventId));
      setError(null);
    } catch (e) {
      // A permission error here is expected when signed out on the shared store.
      setError((e as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [store, eventId]);

  useEffect(() => {
    refresh();
    const off = store.subscribe(refresh);
    let offAuth = () => {};
    if (store.auth) {
      store.auth.user().then(setUser);
      offAuth = store.auth.onChange(() => {
        store.auth!.user().then(setUser);
        refresh();
      });
    }
    return () => {
      off();
      offAuth();
    };
  }, [store, refresh]);

  const add = useCallback(
    async (reg: Registration) => {
      await store.add(reg);
      await refresh();
    },
    [store, refresh],
  );
  const addMany = useCallback(
    async (regs: Registration[]) => {
      await store.addMany(regs);
      await refresh();
    },
    [store, refresh],
  );
  const remove = useCallback(
    async (id: string) => {
      await store.remove(id);
      await refresh();
    },
    [store, refresh],
  );

  const canRead = !store.auth || !!user;
  return { store, rows, loading, error, add, addMany, remove, user, canRead };
}

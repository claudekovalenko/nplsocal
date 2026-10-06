import { useCallback, useEffect, useState } from 'react';
import type { Registration } from '@/lib/registrations';
import { getRegStore } from '@/lib/regStore';
import { onAuthChange } from '@/lib/auth';

export function useRegistrations(eventId?: string) {
  const store = getRegStore();
  const [rows, setRows] = useState<Registration[]>([]);
  const [trash, setTrash] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRows(await store.list(eventId));
      // Only an admin can read the trash; for anyone else this comes back empty
      // rather than failing, so one rejection must not blank the roster.
      setTrash(await store.listTrash(eventId).catch(() => []));
      setError(null);
    } catch (e) {
      // Signed out, row-level security returns nothing rather than an error, so
      // this is a real fault: no network, or a table that has gone away.
      setError((e as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [store, eventId]);

  useEffect(() => {
    refresh();
    const off = store.subscribe(refresh);
    // Signing in changes what the database will hand back, so reload with it.
    const offAuth = onAuthChange(refresh);
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
  const restore = useCallback(
    async (id: string) => {
      await store.restore(id);
      await refresh();
    },
    [store, refresh],
  );
  const purge = useCallback(
    async (id: string) => {
      await store.purge(id);
      await refresh();
    },
    [store, refresh],
  );

  return { store, rows, trash, loading, error, add, addMany, remove, restore, purge, refresh };
}

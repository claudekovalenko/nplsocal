import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTotals, type DayTotals } from '@/lib/pushStore';
import { isShared } from '@/lib/supabaseClient';

export type LiveStatus = 'connecting' | 'live' | 'offline' | 'local';

/**
 * Push totals that keep themselves current.
 *
 * Built for a crowd: hundreds of phones may have the tracker open at once, so
 * each one asks every 30 seconds give or take a few (the jitter keeps them from
 * all arriving in the same second), stops asking while the app is in the
 * background, and asks straight away when it comes back or regains signal. The
 * database function returns sums only, so the request is tiny.
 *
 * The last numbers are kept on the phone, so a team in a dead zone still sees
 * them, marked as not live.
 */
const EVERY_MS = 30_000;
const JITTER_MS = 8_000;
const cacheKey = (ids: string[]) => `npl:totals:${ids.join('+')}`;

function readCache(ids: string[]): { rows: DayTotals[]; at: number } | null {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(ids)) ?? 'null');
  } catch {
    return null;
  }
}

/**
 * Totals per day for one event, or several added together (the tracker counts
 * the push and the rest of the year's field reports side by side). Rows carry
 * the event they came from.
 */
export function useLiveTotals(eventIds: string | string[]) {
  const ids = typeof eventIds === 'string' ? [eventIds] : eventIds;
  const key = ids.join('+');
  const cached = useRef(readCache(ids));
  const [rows, setRows] = useState<(DayTotals & { eventId?: string })[]>(cached.current?.rows ?? []);
  const [updatedAt, setUpdatedAt] = useState<number | null>(cached.current?.at ?? null);
  const [status, setStatus] = useState<LiveStatus>(isShared ? 'connecting' : 'local');
  const timer = useRef<number>();

  const refresh = useCallback(async () => {
    if (!isShared) return;
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }
    try {
      const next = (
        await Promise.all(key.split('+').map(async (id) => (await fetchTotals(id)).map((r) => ({ ...r, eventId: id }))))
      ).flat();
      const at = Date.now();
      setRows(next);
      setUpdatedAt(at);
      setStatus('live');
      try {
        localStorage.setItem(cacheKey(key.split('+')), JSON.stringify({ rows: next, at }));
      } catch {}
    } catch {
      setStatus('offline');
    }
  }, [key]);

  useEffect(() => {
    if (!isShared) return;
    let stopped = false;
    const schedule = () => {
      window.clearTimeout(timer.current);
      if (stopped || document.visibilityState === 'hidden') return;
      timer.current = window.setTimeout(async () => {
        await refresh();
        schedule();
      }, EVERY_MS + Math.random() * JITTER_MS);
    };
    const wake = () => {
      if (document.visibilityState === 'visible') refresh().then(schedule);
      else window.clearTimeout(timer.current);
    };
    const offline = () => setStatus('offline');
    refresh().then(schedule);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    window.addEventListener('offline', offline);
    return () => {
      stopped = true;
      window.clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      window.removeEventListener('offline', offline);
    };
  }, [refresh]);

  return { rows, updatedAt, status, refresh };
}

/** "just now", "40s ago", "3 min ago": re-renders itself every few seconds. */
export function useAgo(at: number | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 5000);
    return () => window.clearInterval(t);
  }, []);
  if (!at) return '';
  const s = Math.round((Date.now() - at) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

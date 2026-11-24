import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSpots, type Spot } from '@/lib/spotsStore';
import { isShared } from '@/lib/supabaseClient';

/**
 * Outreach spots, kept current the same way as the live totals: every 30
 * seconds or so with jitter (so a crowd of phones never asks in the same
 * second), paused in the background, refreshed on return and on regaining
 * signal. Until the spots table exists it simply reports no spots.
 */
const EVERY_MS = 30_000;
const JITTER_MS = 8_000;

export function useLiveSpots(eventIds: string[]) {
  const key = eventIds.join('+');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [ready, setReady] = useState(false);
  const timer = useRef<number>();

  const refresh = useCallback(async () => {
    if (!isShared || !navigator.onLine) return;
    try {
      setSpots(await fetchSpots(key.split('+')));
      setReady(true);
    } catch {
      // No table yet, or no signal: keep what we have.
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
    refresh().then(schedule);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      stopped = true;
      window.clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
    };
  }, [refresh]);

  return { spots, ready, refresh };
}

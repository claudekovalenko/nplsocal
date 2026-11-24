import { isShared, supabase } from './supabaseClient';
import { uid } from './pushStore';

/**
 * Outreach spots: where teams went, pinned from the field and shown live on
 * the Push map. Public by design: a place and a day, never a name or number.
 * Table: npl_push_spots (supabase/2026-11-24_push_spots.sql).
 */
export interface Spot {
  id: string;
  eventId: string;
  /** YYYY-MM-DD, Pacific. */
  day: string;
  region: string;
  place: string;
  lat: number;
  lon: number;
  createdAt?: string;
}

const PENDING = 'npl:pending-spots';

/** About 100 m: enough to see the neighborhood, not someone's front door. */
const coarse = (n: number) => Math.round(n * 1000) / 1000;

const row = (s: Spot) => ({
  id: s.id,
  event_id: s.eventId,
  day: s.day,
  region: s.region,
  place: s.place,
  lat: coarse(s.lat),
  lon: coarse(s.lon),
});

function readQueue(): Spot[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING) ?? '[]');
  } catch {
    return [];
  }
}
function writeQueue(list: Spot[]) {
  try {
    if (list.length) localStorage.setItem(PENDING, JSON.stringify(list));
    else localStorage.removeItem(PENDING);
  } catch {}
}

export const pendingSpots = () => readQueue().length;

/** One at a time; a duplicate key means it already arrived (the reply was lost). */
async function send(list: Spot[]): Promise<Spot[]> {
  const left: Spot[] = [];
  for (const s of list) {
    try {
      const { error } = await supabase().from('npl_push_spots').insert(row(s));
      if (error && error.code !== '23505') left.push(s);
    } catch {
      left.push(s);
    }
  }
  return left;
}

let flushing: Promise<void> | null = null;
export function flushSpots(): Promise<void> {
  if (!isShared) return Promise.resolve();
  flushing ??= (async () => {
    const queued = readQueue();
    writeQueue([]);
    const left = await send(queued);
    writeQueue([...left, ...readQueue()]);
  })().finally(() => (flushing = null));
  return flushing;
}

/** Add a spot. Saved on the phone first if there is no signal, or no table yet. */
export async function addSpot(spot: Omit<Spot, 'id'>): Promise<{ queued: boolean; spot: Spot }> {
  const s: Spot = { ...spot, id: uid(), lat: coarse(spot.lat), lon: coarse(spot.lon) };
  if (!isShared) {
    writeQueue([...readQueue(), s]);
    return { queued: true, spot: s };
  }
  await flushSpots();
  const left = await send([s]);
  if (left.length) {
    writeQueue([...readQueue(), s]);
    return { queued: true, spot: s };
  }
  return { queued: false, spot: s };
}

/** Every spot for these events, newest first. */
export async function fetchSpots(eventIds: string[]): Promise<Spot[]> {
  if (!isShared) return [];
  const { data, error } = await supabase()
    .from('npl_push_spots')
    .select('id, event_id, day, region, place, lat, lon, created_at')
    .in('event_id', eventIds)
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error) throw error;
  return (data ?? []).map(
    (r: { id: string; event_id: string; day: string; region: string; place: string; lat: number; lon: number; created_at: string }) => ({
      id: r.id,
      eventId: r.event_id,
      day: r.day,
      region: r.region,
      place: r.place,
      lat: r.lat,
      lon: r.lon,
      createdAt: r.created_at,
    }),
  );
}

import { isShared, supabase } from './supabaseClient';
import { uid } from './pushStore';

/** One person a team met who wants a follow-up. The phone number is the point. */
export interface FollowUp {
  name: string;
  phone: string;
  wants: string[];
  notes: string;
}

/**
 * What a team sends from one stretch in the field: where they were, how many
 * red / yellow / green lights they found (optional), and the people to call back.
 */
export interface FieldLog {
  id: string;
  eventId: string;
  day: string;
  region: string;
  area: string;
  foundBy: string;
  red: number;
  yellow: number;
  green: number;
  people: FollowUp[];
}

export interface RegionTotals {
  region: string;
  red: number;
  yellow: number;
  green: number;
  followUps: number;
  logs: number;
}

export type FollowUpRow = FollowUp & {
  id: string;
  logId: string;
  eventId: string;
  day: string;
  region: string;
  area: string;
  foundBy: string;
  createdAt: string;
};

export const emptyPerson = (): FollowUp => ({ name: '', phone: '', wants: [], notes: '' });

export const emptyLog = (eventId: string, day: string): FieldLog => ({
  id: '',
  eventId,
  day,
  region: '',
  area: '',
  foundBy: '',
  red: 0,
  yellow: 0,
  green: 0,
  people: [emptyPerson()],
});

/** A person card counts once anything is typed into it; untouched cards are dropped. */
export const isBlank = (p: FollowUp) => !p.name.trim() && !p.phone.trim() && !p.notes.trim() && !p.wants.length;

const PENDING = 'npl:pending-followups';

function queue(log: FieldLog) {
  try {
    const all = JSON.parse(localStorage.getItem(PENDING) ?? '[]') as FieldLog[];
    all.push(log);
    localStorage.setItem(PENDING, JSON.stringify(all));
  } catch {}
}

function drain(): FieldLog[] {
  try {
    const all = JSON.parse(localStorage.getItem(PENDING) ?? '[]') as FieldLog[];
    localStorage.removeItem(PENDING);
    return all;
  } catch {
    return [];
  }
}

export function pendingFollowUps() {
  try {
    return JSON.parse(localStorage.getItem(PENDING) ?? '[]').length as number;
  } catch {
    return 0;
  }
}

const logRow = (l: FieldLog) => ({
  id: l.id,
  event_id: l.eventId,
  day: l.day,
  region: l.region,
  area: l.area,
  found_by: l.foundBy,
  red: l.red,
  yellow: l.yellow,
  green: l.green,
});

// Ids are derived from the log id, so a retry after a half-finished send
// upserts the same rows instead of duplicating them.
const personRows = (l: FieldLog) =>
  l.people.map((p, i) => ({
    id: `${l.id}-${i}`,
    log_id: l.id,
    event_id: l.eventId,
    day: l.day,
    region: l.region,
    area: l.area,
    found_by: l.foundBy,
    name: p.name,
    phone: p.phone,
    wants: p.wants,
    notes: p.notes,
  }));

/** Postgres unique violation: the row is already there from an earlier try. */
const DUPLICATE = '23505';

async function send(log: FieldLog) {
  const db = supabase();
  // Anonymous visitors may insert but not read, and Postgres checks the read
  // policy on INSERT … ON CONFLICT, so upsert is refused. Plain inserts with
  // fixed ids instead: on a retry, "already exists" means it made it last time.
  const a = await db.from('npl_push_field_logs').insert(logRow(log));
  if (a.error && a.error.code !== DUPLICATE) throw a.error;
  if (log.people.length) {
    const rows = personRows(log);
    const b = await db.from('npl_push_followups').insert(rows);
    if (b.error?.code === DUPLICATE) {
      // Some made it, some may not have: send them one at a time.
      for (const r of rows) {
        const c = await db.from('npl_push_followups').insert(r);
        if (c.error && c.error.code !== DUPLICATE) throw c.error;
      }
    } else if (b.error) throw b.error;
  }
}

/** Retry anything saved on the device while there was no signal. */
export async function flushFollowUps() {
  if (!isShared) return;
  const waiting = drain();
  for (const log of waiting) {
    try {
      await send(log);
    } catch {
      queue(log);
    }
  }
}

/**
 * Send one field log. Teams are often on a weak signal, so a failure keeps the
 * log on the phone and it goes out the next time anything is sent.
 */
export async function submitFieldLog(log: FieldLog) {
  const row: FieldLog = {
    ...log,
    id: log.id || uid(),
    people: log.people.filter((p) => !isBlank(p)),
  };
  if (!isShared) {
    queue(row);
    return { queued: true };
  }
  try {
    await flushFollowUps();
    await send(row);
    return { queued: false };
  } catch {
    queue(row);
    return { queued: true };
  }
}

/**
 * Lights and follow-up counts per region. A database function that returns
 * sums only — no names, no numbers — so it is safe on the public push page.
 */
export async function fetchRegionTotals(eventId: string): Promise<RegionTotals[]> {
  if (!isShared) return [];
  const { data, error } = await supabase().rpc('npl_push_region_totals', { p_event_id: eventId });
  if (error) throw error;
  return (data ?? []).map(
    (d: { region: string; red: number; yellow: number; green: number; follow_ups: number; logs: number }) => ({
      region: d.region,
      red: Number(d.red) || 0,
      yellow: Number(d.yellow) || 0,
      green: Number(d.green) || 0,
      followUps: Number(d.follow_ups) || 0,
      logs: Number(d.logs) || 0,
    }),
  );
}

/** Every follow-up for an event, newest first. Leads and admins only (row-level security). */
export async function listFollowUps(eventId: string): Promise<FollowUpRow[]> {
  if (!isShared) return [];
  const { data, error } = await supabase()
    .from('npl_push_followups')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(
    (r: {
      id: string;
      log_id: string;
      event_id: string;
      day: string;
      region: string;
      area: string;
      found_by: string;
      name: string;
      phone: string;
      wants: string[];
      notes: string;
      created_at: string;
    }) => ({
      id: r.id,
      logId: r.log_id,
      eventId: r.event_id,
      day: r.day ?? '',
      region: r.region ?? '',
      area: r.area ?? '',
      foundBy: r.found_by ?? '',
      name: r.name ?? '',
      phone: r.phone ?? '',
      wants: r.wants ?? [],
      notes: r.notes ?? '',
      createdAt: r.created_at,
    }),
  );
}

export function followUpsToCsv(rows: FollowUpRow[]): string {
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const head = ['Phone', 'Name', 'Wants', 'What they said', 'Region', 'Where', 'Found by', 'Day', 'Logged'];
  const body = rows.map((r) =>
    [r.phone, r.name, r.wants.join('; '), r.notes, r.region, r.area, r.foundBy, r.day, r.createdAt]
      .map((v) => cell(String(v ?? '')))
      .join(','),
  );
  return [head.join(','), ...body].join('\n');
}

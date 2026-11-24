import { isShared, supabase } from './supabaseClient';

export interface PushReport {
  id: string;
  eventId: string;
  day: string;
  reporter: string;
  team: string;
  area: string;
  conversations: number;
  gospelShared: number;
  responded: number;
  baptized: number;
  groupsStarted: number;
  story: string;
  prayer: string;
}

export interface DayTotals {
  day: string;
  conversations: number;
  gospelShared: number;
  responded: number;
  baptized: number;
  groupsStarted: number;
  reports: number;
}

export interface Interest {
  id: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  church: string;
  wants: string[];
  notes: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const emptyReport = (eventId: string, day: string): PushReport => ({
  id: '',
  eventId,
  day,
  reporter: '',
  team: '',
  area: '',
  conversations: 0,
  gospelShared: 0,
  responded: 0,
  baptized: 0,
  groupsStarted: 0,
  story: '',
  prayer: '',
});

export const emptyInterest = (source: string): Interest => ({
  id: '',
  source,
  name: '',
  email: '',
  phone: '',
  city: '',
  church: '',
  wants: [],
  notes: '',
});

/** Queue anything we could not send, so a dead signal in the field is not lost. */
const PENDING_REPORTS = 'npl:pending-reports';
const PENDING_INTEREST = 'npl:pending-interest';

function queue<T>(key: string, item: T) {
  try {
    const all = JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
    all.push(item);
    localStorage.setItem(key, JSON.stringify(all));
  } catch {}
}

function drain<T>(key: string): T[] {
  try {
    const all = JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
    localStorage.removeItem(key);
    return all;
  } catch {
    return [];
  }
}

export function pendingCount() {
  try {
    const r = JSON.parse(localStorage.getItem(PENDING_REPORTS) ?? '[]').length;
    const i = JSON.parse(localStorage.getItem(PENDING_INTEREST) ?? '[]').length;
    return r + i;
  } catch {
    return 0;
  }
}

const reportRow = (r: PushReport) => ({
  id: r.id,
  event_id: r.eventId,
  day: r.day,
  reporter: r.reporter,
  team: r.team,
  area: r.area,
  conversations: r.conversations,
  gospel_shared: r.gospelShared,
  responded: r.responded,
  baptized: r.baptized,
  groups_started: r.groupsStarted,
  story: r.story,
  prayer: r.prayer,
});

const interestRow = (i: Interest) => ({
  id: i.id,
  source: i.source,
  name: i.name,
  email: i.email,
  phone: i.phone,
  city: i.city,
  church: i.church,
  wants: i.wants,
  notes: i.notes,
});

/**
 * Insert rows one at a time. A phone on a weak signal can send a row, have the
 * database save it, and lose the reply; it then resends the same row. Postgres
 * answers that with a duplicate-key error (23505), which here means "already
 * saved", not failure. Sent in one batch, that single duplicate failed the
 * whole batch on every retry and stuck everything queued behind it. (Ignoring
 * duplicates in the database would need read access the public does not have.)
 * Returns the rows that still need sending.
 */
async function insertEach<T>(table: string, rows: T[], toRow: (r: T) => object): Promise<T[]> {
  const left: T[] = [];
  for (const r of rows) {
    try {
      const { error } = await supabase().from(table).insert(toRow(r));
      if (error && error.code !== '23505') left.push(r);
    } catch {
      left.push(r);
    }
  }
  return left;
}

/**
 * Send a daily report. Teams fill these in at the end of a day in the field,
 * often on a weak signal, so a failure queues the report on the device and
 * retries the next time anything is sent.
 */
export async function submitReport(report: PushReport) {
  const row = { ...report, id: report.id || uid() };
  if (!isShared) {
    queue(PENDING_REPORTS, row);
    return { queued: true };
  }
  await flushPending();
  const left = await insertEach('npl_push_reports', [row], reportRow);
  if (left.length) {
    queue(PENDING_REPORTS, row);
    return { queued: true };
  }
  return { queued: false };
}

export async function submitInterest(interest: Interest) {
  const row = { ...interest, id: interest.id || uid() };
  if (!isShared) {
    queue(PENDING_INTEREST, row);
    return { queued: true };
  }
  await flushPending();
  const left = await insertEach('npl_interest', [row], interestRow);
  if (left.length) {
    queue(PENDING_INTEREST, row);
    return { queued: true };
  }
  return { queued: false };
}

/**
 * Retry anything queued while offline. Safe to call often; does nothing when empty.
 *
 * Each row is sent on its own (see insertEach), so one bad row never holds
 * back the rest, and only rows that truly failed go back on the queue.
 */
let flushing: Promise<void> | null = null;
export function flushPending(): Promise<void> {
  if (!isShared) return Promise.resolve();
  // Two calls at once (page load and a submit) must not drain the queue twice.
  flushing ??= (async () => {
    const reports = drain<PushReport>(PENDING_REPORTS);
    const interest = drain<Interest>(PENDING_INTEREST);
    (await insertEach('npl_push_reports', reports, reportRow)).forEach((r) => queue(PENDING_REPORTS, r));
    (await insertEach('npl_interest', interest, interestRow)).forEach((i) => queue(PENDING_INTEREST, i));
  })().finally(() => (flushing = null));
  return flushing;
}

/**
 * Totals per day. Comes from a database function that returns sums only — no
 * names and no stories — so it is safe to show on a public page.
 */
export async function fetchTotals(eventId: string): Promise<DayTotals[]> {
  if (!isShared) return [];
  const { data, error } = await supabase().rpc('npl_push_totals', { p_event_id: eventId });
  if (error) throw error;
  return (data ?? []).map(
    (d: {
      day: string;
      conversations: number;
      gospel_shared: number;
      responded: number;
      baptized: number;
      groups_started: number;
      reports: number;
    }) => ({
      day: d.day,
      conversations: Number(d.conversations) || 0,
      gospelShared: Number(d.gospel_shared) || 0,
      responded: Number(d.responded) || 0,
      baptized: Number(d.baptized) || 0,
      groupsStarted: Number(d.groups_started) || 0,
      reports: Number(d.reports) || 0,
    }),
  );
}

export const sumTotals = (rows: DayTotals[]) =>
  rows.reduce(
    (a, r) => ({
      day: 'all',
      conversations: a.conversations + r.conversations,
      gospelShared: a.gospelShared + r.gospelShared,
      responded: a.responded + r.responded,
      baptized: a.baptized + r.baptized,
      groupsStarted: a.groupsStarted + r.groupsStarted,
      reports: a.reports + r.reports,
    }),
    { day: 'all', conversations: 0, gospelShared: 0, responded: 0, baptized: 0, groupsStarted: 0, reports: 0 },
  );

/**
 * Everyone who left their details asking to hear more. Readable by the admin and
 * leads roles; row-level security returns nothing to anyone else, so an empty
 * list here means "not yours to see" as much as "nobody yet".
 */
export async function listInterest(): Promise<(Interest & { createdAt: string })[]> {
  if (!isShared) return [];
  const { data, error } = await supabase()
    .from('npl_interest')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(
    (r: {
      id: string;
      source: string;
      name: string;
      email: string;
      phone: string;
      city: string;
      church: string;
      wants: string[];
      notes: string;
      created_at: string;
    }) => ({
      id: r.id,
      source: r.source ?? '',
      name: r.name,
      email: r.email ?? '',
      phone: r.phone ?? '',
      city: r.city ?? '',
      church: r.church ?? '',
      wants: r.wants ?? [],
      notes: r.notes ?? '',
      createdAt: r.created_at,
    }),
  );
}

/** One row per person, as a spreadsheet. Same shape as the roster export. */
export function interestToCsv(rows: (Interest & { createdAt: string })[]): string {
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const head = ['Name', 'Email', 'Phone', 'City', 'Church / Network', 'Asked about', 'Notes', 'Where', 'When'];
  const body = rows.map((r) =>
    [r.name, r.email, r.phone, r.city, r.church, r.wants.join('; '), r.notes, r.source, r.createdAt]
      .map((v) => cell(String(v ?? '')))
      .join(','),
  );
  return [head.join(','), ...body].join('\n');
}

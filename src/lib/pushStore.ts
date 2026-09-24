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
  try {
    await flushPending();
    const { error } = await supabase().from('npl_push_reports').insert(reportRow(row));
    if (error) throw error;
    return { queued: false };
  } catch {
    queue(PENDING_REPORTS, row);
    return { queued: true };
  }
}

export async function submitInterest(interest: Interest) {
  const row = { ...interest, id: interest.id || uid() };
  if (!isShared) {
    queue(PENDING_INTEREST, row);
    return { queued: true };
  }
  try {
    await flushPending();
    const { error } = await supabase().from('npl_interest').insert(interestRow(row));
    if (error) throw error;
    return { queued: false };
  } catch {
    queue(PENDING_INTEREST, row);
    return { queued: true };
  }
}

/** Retry anything queued while offline. Safe to call often; does nothing when empty. */
export async function flushPending() {
  if (!isShared) return;
  const reports = drain<PushReport>(PENDING_REPORTS);
  const interest = drain<Interest>(PENDING_INTEREST);
  if (!reports.length && !interest.length) return;
  try {
    if (reports.length) {
      const { error } = await supabase().from('npl_push_reports').insert(reports.map(reportRow));
      if (error) throw error;
    }
    if (interest.length) {
      const { error } = await supabase().from('npl_interest').insert(interest.map(interestRow));
      if (error) throw error;
    }
  } catch {
    // Put them back rather than losing them.
    reports.forEach((r) => queue(PENDING_REPORTS, r));
    interest.forEach((i) => queue(PENDING_INTEREST, i));
  }
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

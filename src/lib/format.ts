const TZ = 'America/Los_Angeles';

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

/** Same calendar day in Pacific time (not the viewer's or server's zone). */
export function sameDay(a: string, b: string) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date(a)) === f.format(new Date(b));
}

export function formatRange(start: string, end?: string) {
  if (!end) return `${formatDate(start)} · ${formatTime(start)}`;
  if (sameDay(start, end)) return `${formatDate(start)} · ${formatTime(start)}–${formatTime(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function monthDay(iso: string) {
  const d = new Date(iso);
  return {
    month: new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short' }).format(d),
    day: new Intl.DateTimeFormat('en-US', { timeZone: TZ, day: 'numeric' }).format(d),
  };
}

export function monthKey(iso: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'long', year: 'numeric' }).format(new Date(iso));
}

/** ISO YYYY-MM-DD for a moment, in Pacific time. */
export function isoDay(iso: string) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(iso),
  );
  return p; // en-CA formats as YYYY-MM-DD
}

/** Every calendar day an event covers, Pacific time. One entry for a single-day event. */
export function eventDays(start: string, end?: string): string[] {
  const first = isoDay(start);
  const last = isoDay(end ?? start);
  const days: string[] = [];
  let cursor = new Date(start);
  for (let i = 0; i < 60; i++) {
    const day = isoDay(cursor.toISOString());
    days.push(day);
    if (day >= last) break;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return days.length ? days : [first];
}

/**
 * Is this really a calendar day (not just three numbers shaped like one)?
 * `new Date(Date.UTC(2025, 1, 30))` quietly rolls Feb 30 over into March, so
 * format-only checks like `/^\d{4}-\d{2}-\d{2}$/` let bad data — a typo in a
 * CSV, a hand-edited record — through as a wrong-but-plausible date. This
 * round-trips the value and rejects anything that didn't survive intact.
 */
export function isValidDay(day: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, mo - 1, d, 12));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** "Fri Jan 15" for a YYYY-MM-DD day string. Falls back to the raw string for anything malformed. */
export function dayLabel(day: string) {
  if (!isValidDay(day)) return day;
  const [y, m, d] = day.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' }).format(
    new Date(Date.UTC(y, m - 1, d, 20)),
  );
}

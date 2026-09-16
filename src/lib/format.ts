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

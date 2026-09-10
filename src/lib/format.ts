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

export function formatRange(start: string, end?: string) {
  const s = new Date(start);
  if (!end) return `${formatDate(start)} · ${formatTime(start)}`;
  const e = new Date(end);
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) return `${formatDate(start)} · ${formatTime(start)}–${formatTime(end)}`;
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

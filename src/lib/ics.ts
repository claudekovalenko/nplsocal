/**
 * Calendar files (.ics) for events.
 *
 * Used in two places, so it imports nothing but types and plain content:
 *  - the build (vite.config.ts) writes `calendar.ics`, the feed people subscribe
 *    to, and `cal/<event id>.ics`, one file per event for "Add to calendar";
 *  - the browser builds Google Calendar links from the same data.
 *
 * Every event carries two reminders (a day before and two hours before), so
 * whoever adds it gets a notification from their own calendar app — no
 * account, no permission prompt, and it works on every phone.
 */
import type { Event } from '../content/types';
import { venues } from '../content/venues';

export interface IcsOptions {
  /** Absolute site URL with trailing slash, e.g. "https://nplsocal.net/". Empty leaves links out. */
  siteUrl?: string;
  /** Name of the hub an event belongs to, for "Hosted by" when no host is set. */
  hubName?: (e: Event) => string;
  /** Stamp written into every event; the build passes one time so the file is stable. */
  now?: Date;
}

/** Events with real dates. Ones still marked "Early 2027" stay off calendars until they are fixed. */
export const calendarable = (e: Event) => !e.dateLabel;

/** 20261230T020000Z */
const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Commas, semicolons, backslashes and newlines are syntax in .ics text. */
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lines longer than 75 bytes must be folded, or strict readers (Outlook) drop the event. */
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  let len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
      len = 0;
    }
    cur += ch;
    len += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

/** Where to type into a maps app: the check-in venue with its street address, when known. */
export function eventLocation(e: Event) {
  const name = e.venue ?? e.location;
  const v = venues[name];
  if (v?.address) return `${v.name}, ${v.address}`;
  return e.city ? `${name}, ${e.city}` : name;
}

export function eventDetails(e: Event, opts: IcsOptions = {}) {
  const host = e.host ?? opts.hubName?.(e);
  const lines = [e.description];
  if (host) lines.push(`Hosted by ${host}`);
  if (e.venue) lines.push(`Check in at ${e.venue}`);
  if (e.signalUrl) lines.push(`Signal chat: ${e.signalUrl}`);
  if (opts.siteUrl) lines.push(`Details and registration: ${opts.siteUrl}${e.id === 'la-metro-gospel-push-2027' ? 'push' : `register/${e.id}`}`);
  return lines.join('\n\n');
}

function vevent(e: Event, opts: IcsOptions) {
  // An event with no end time gets two hours, which is what calendar apps assume anyway.
  const end = e.end ?? new Date(new Date(e.start).getTime() + 2 * 3600_000).toISOString();
  const lines = [
    'BEGIN:VEVENT',
    `UID:${e.id}@nplsocal`,
    `DTSTAMP:${utc((opts.now ?? new Date()).toISOString())}`,
    `DTSTART:${utc(e.start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(eventDetails(e, opts))}`,
    `LOCATION:${esc(eventLocation(e))}`,
  ];
  if (opts.siteUrl) lines.push(`URL:${opts.siteUrl}${e.id === 'la-metro-gospel-push-2027' ? 'push' : `register/${e.id}`}`);
  for (const [trigger, when] of [
    ['-P1D', 'tomorrow'],
    ['-PT2H', 'in two hours'],
  ]) {
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${trigger}`, `DESCRIPTION:${esc(`${e.title} starts ${when}`)}`, 'END:VALARM');
  }
  lines.push('END:VEVENT');
  return lines;
}

/** A complete calendar: one event for "Add to calendar", or the whole feed for "Subscribe". */
export function buildIcs(list: Event[], opts: IcsOptions & { name?: string } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//No Place Left SoCal//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(opts.name ?? 'No Place Left SoCal')}`,
    'X-WR-TIMEZONE:America/Los_Angeles',
    // How often a subscribed calendar checks for new events. Apple and Outlook
    // honour this; Google refreshes on its own schedule (roughly daily).
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...list.filter(calendarable).flatMap((e) => vevent(e, opts)),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** "Add to Google Calendar" link — Google cannot open a downloaded .ics on a phone. */
export function googleCalendarUrl(e: Event, opts: IcsOptions = {}) {
  const end = e.end ?? new Date(new Date(e.start).getTime() + 2 * 3600_000).toISOString();
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${utc(e.start)}/${utc(end)}`,
    details: eventDetails(e, opts),
    location: eventLocation(e),
    ctz: 'America/Los_Angeles',
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

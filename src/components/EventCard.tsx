import { Link } from 'react-router-dom';
import { MapPin, Video, ArrowUpRight, CalendarDays, Users } from 'lucide-react';
import type { Event } from '@/content';
import { hubById, hostFor, mapsUrl, venueFor } from '@/content';
import { AddToCalendar, SignalButton } from '@/components/EventActions';
import { formatRange, monthDay, formatDate, formatTime, sameDay } from '@/lib/format';

/**
 * The street address for a named venue, with a tap-to-navigate link. Renders
 * nothing until the address is filled in, so a half-known venue never shows a
 * dead link.
 */
export function VenueAddress({
  location,
  className = 'mt-1',
  // The registration form deliberately has nothing to click out of, so there
  // the address is plain text.
  link = true,
}: {
  location: string;
  className?: string;
  link?: boolean;
}) {
  const venue = venueFor(location);
  if (!venue?.address) return null;
  return (
    <p className={`text-sm ${className}`}>
      {link ? (
        <a
          href={mapsUrl(venue)}
          target="_blank"
          rel="noreferrer"
          className="text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {venue.address}
        </a>
      ) : (
        <span className="text-muted">{venue.address}</span>
      )}
      {venue.arrival && <span className="mt-0.5 block text-xs text-faint">{venue.arrival}</span>}
    </p>
  );
}

export const typeLabel: Record<Event['type'], string> = {
  training: 'Training',
  summit: 'Summit',
  gathering: 'Iron on Iron',
  prayer: 'Prayer',
  outreach: 'Outreach',
  online: 'Online',
  push: 'Push',
};

/** One colour per kind of event, so the calendar can be read at a glance. */
export const typeTone: Record<Event['type'], string> = {
  training: '#3b82f6',
  summit: '#8b5cf6',
  gathering: '#14b8a6',
  prayer: '#f59e0b',
  outreach: '#f97316',
  online: '#06b6d4',
  push: '#f43f5e',
};
export const toneStyle = (e: Event) => ({ '--tone': typeTone[e.type] }) as React.CSSProperties;

const hubName = (e: Event) => hubById(e.hub)?.shortName ?? 'All SoCal';

/**
 * Where people physically turn up. Usually the event's location; for something
 * that spans a region, the named check-in place instead.
 */
export const venueName = (e: Event) => e.venue ?? e.location;
const isReal = (url?: string) => !!url && /^https?:\/\//.test(url);

/** Real sign-up link opens in a new tab; otherwise the built-in registration form. */
export function RegisterLink({ event, className }: { event: Event; className: string }) {
  if (isReal(event.registerUrl)) {
    return (
      <a href={event.registerUrl} target="_blank" rel="noreferrer" className={className}>
        Register <ArrowUpRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <Link to={`/register/${event.id}`} className={className}>
      Register <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

/** "Hosted by …" — always shown, so nobody has to wonder who is behind an event. */
export function HostLine({ event, className = '' }: { event: Event; className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-sm ${className}`}>
      <Users className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
      <span className="text-muted">
        Hosted by <span className="text-fg">{hostFor(event)}</span>
      </span>
    </p>
  );
}

/** Month over day, on the event's colour. */
function DateTile({ event, size = 'lg' }: { event: Event; size?: 'lg' | 'sm' }) {
  const { month, day } = monthDay(event.start);
  const big = size === 'lg';
  return (
    <div
      style={toneStyle(event)}
      className={`tone-tile flex shrink-0 flex-col items-center justify-center rounded-lg ${big ? 'h-[4.5rem] w-[4.5rem]' : 'h-14 w-14'}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--tone)' }}>
        {event.dateLabel ? 'TBA' : month}
      </span>
      <span className={`${big ? 'text-3xl' : 'text-2xl'} font-light leading-none tracking-tight`}>
        {event.dateLabel ? '—' : day}
      </span>
    </div>
  );
}

function when(event: Event) {
  if (event.dateLabel) return `${event.dateLabel} · dates to be confirmed`;
  if (event.end && !sameDay(event.start, event.end)) {
    return `${formatDate(event.start)} – ${formatDate(event.end)} · starts ${formatTime(event.start)}`;
  }
  return formatRange(event.start, event.end);
}

/** Big card for network-tier events: the ones everyone should know about. */
export function FeaturedEvent({ event }: { event: Event }) {
  // The push has a hub of its own; send people there rather than to a bare form.
  const hub = event.id === 'la-metro-gospel-push-2027' ? '/push' : null;
  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:border-line-strong">
      <div className="rule-gradient h-1 w-full opacity-80" />
      <div className="pointer-events-none absolute inset-0 aurora opacity-[0.22]" />
      <div className="relative flex flex-1 flex-col p-6 md:p-8">
        <div className="flex items-start gap-4">
          <DateTile event={event} />
          <div className="min-w-0 pt-0.5">
            <span style={toneStyle(event)} className="tone-chip">
              {typeLabel[event.type]} · {hubName(event)}
            </span>
            <h3 className="mt-2.5 text-2xl leading-tight md:text-3xl">{event.title}</h3>
          </div>
        </div>
        <p className="mt-5 text-muted">{event.description}</p>

        <div className="mt-5 space-y-2.5 border-t border-line pt-5">
          <p className="flex items-start gap-2 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
            <span>{when(event)}</span>
          </p>
          <div className="flex items-start gap-2 text-sm">
            {event.online ? (
              <Video className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
            ) : (
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
            )}
            <div>
              <span>{event.city ? `${event.location} · ${event.city}` : event.location}</span>
              {event.venue && <span className="block text-muted">Check in at {event.venue}</span>}
              <VenueAddress location={venueName(event)} className="mt-0.5" />
            </div>
          </div>
          <HostLine event={event} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-7">
          {hub ? (
            <Link to={hub} className="btn-primary">
              Open the hub <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <RegisterLink event={event} className="btn-primary" />
          )}
          <AddToCalendar event={event} />
          <SignalButton url={event.signalUrl} />
        </div>
      </div>
    </article>
  );
}

/** Compact row for the calendar list. */
export function EventRow({ event, showHub = true }: { event: Event; showHub?: boolean }) {
  return (
    <li className="flex gap-4 py-5 sm:items-center sm:gap-5">
      <DateTile event={event} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-base font-medium">{event.title}</span>
          <span style={toneStyle(event)} className="tone-chip !px-2 !py-0.5 !text-[10px]">
            {typeLabel[event.type]}
            {showHub ? ` · ${hubName(event)}` : ''}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted">
          <span>{formatRange(event.start, event.end)}</span>
          <span className="inline-flex items-center gap-1">
            {event.online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {event.city ?? event.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {hostFor(event)}
          </span>
          {event.audience && <span className="text-faint">For {event.audience}</span>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RegisterLink event={event} className="btn-secondary !h-8 !px-3 !text-xs" />
          <AddToCalendar event={event} className="btn-ghost !h-8 !px-3 !text-xs" label="Calendar" />
          <SignalButton url={event.signalUrl} className="btn-ghost !h-8 !px-3 !text-xs" label="Signal" />
        </div>
      </div>
    </li>
  );
}

/** Kept for places that still want a card. */
export default function EventCard({ event, detailed = false }: { event: Event; detailed?: boolean }) {
  const { month, day } = monthDay(event.start);
  return (
    <article className="card flex gap-5 p-6 transition hover:border-line-strong">
      <div className="flex w-12 shrink-0 flex-col items-center border-r border-line pr-5">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{month}</span>
        <span className="mt-0.5 text-3xl font-light leading-none tracking-tight">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="eyebrow">
          {typeLabel[event.type]} · {hubName(event)}
        </div>
        <h3 className="mt-2 text-lg">{event.title}</h3>
        <p className="mt-1 text-sm text-muted">{event.dateLabel ?? formatRange(event.start, event.end)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          {event.online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
          {event.city ?? event.location}
        </p>
        {detailed && <p className="mt-3 text-sm leading-relaxed text-muted/80">{event.description}</p>}
        <RegisterLink event={event} className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline" />
      </div>
    </article>
  );
}

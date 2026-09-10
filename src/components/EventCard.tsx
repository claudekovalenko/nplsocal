import { MapPin, Video, ArrowUpRight } from 'lucide-react';
import type { Event } from '@/content';
import { hubById } from '@/content';
import { formatRange, monthDay, formatDate } from '@/lib/format';

export const typeLabel: Record<Event['type'], string> = {
  training: 'Training',
  gathering: 'Iron on Iron',
  prayer: 'Prayer',
  outreach: 'Outreach',
  online: 'Online',
  push: 'Push',
};

const hubName = (e: Event) => hubById(e.hub)?.shortName ?? 'All SoCal';
const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

/** Big card for network-tier events: the ones everyone should know about. */
export function FeaturedEvent({ event }: { event: Event }) {
  return (
    <article className="card group relative flex flex-col justify-between overflow-hidden p-7 transition hover:border-line-strong md:p-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_100%_0%,var(--glow),transparent_70%)] opacity-25" />
      <div className="relative">
        <div className="eyebrow">
          {typeLabel[event.type]} · {hubName(event)}
        </div>
        <h3 className="mt-4 text-3xl md:text-4xl">{event.title}</h3>
        <p className="mt-3 text-muted">{event.description}</p>
      </div>
      <div className="relative mt-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-light tracking-tight">{event.dateLabel ?? formatDate(event.start, { weekday: undefined })}</div>
          {event.dateLabel ? (
            <div className="text-sm text-muted">Dates to be confirmed</div>
          ) : event.end && !sameDay(event.start, event.end) ? (
            <div className="text-sm text-muted">through {formatDate(event.end, { weekday: undefined })}</div>
          ) : (
            <div className="text-sm text-muted">{formatRange(event.start, event.end).split(' · ')[1] ?? ''}</div>
          )}
        </div>
        {event.registerUrl && (
          <a href={event.registerUrl} className="btn-primary">
            Register <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}

/** Compact row for the calendar. */
export function EventRow({ event, showHub = true }: { event: Event; showHub?: boolean }) {
  const { month, day } = monthDay(event.start);
  return (
    <li className="flex items-center gap-5 py-4">
      <div className="flex w-10 shrink-0 flex-col items-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{month}</span>
        <span className="text-2xl font-light leading-none tracking-tight">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-base">{event.title}</span>
          <span className="text-xs text-muted">
            {typeLabel[event.type]}
            {showHub ? ` · ${hubName(event)}` : ''}
            {event.audience ? ` · ${event.audience}` : ''}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted">
          <span>{formatRange(event.start, event.end)}</span>
          <span className="inline-flex items-center gap-1">
            {event.online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {event.city ?? event.location}
          </span>
        </div>
      </div>
      {event.registerUrl && (
        <a href={event.registerUrl} className="hidden text-sm font-medium underline-offset-4 hover:underline sm:inline-flex sm:items-center sm:gap-1">
          Register <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
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
        {event.registerUrl && (
          <a href={event.registerUrl} className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
            Register <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

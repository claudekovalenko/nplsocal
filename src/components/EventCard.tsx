import { MapPin, Video, ExternalLink } from 'lucide-react';
import type { Event } from '@/content';
import { hubById } from '@/content';
import { formatRange, monthDay } from '@/lib/format';

const typeLabel: Record<Event['type'], string> = {
  training: 'Training',
  gathering: 'Iron on Iron',
  prayer: 'Prayer',
  outreach: 'Outreach',
  online: 'Online',
};

export default function EventCard({ event }: { event: Event }) {
  const { month, day } = monthDay(event.start);
  const hub = hubById(event.hub);
  return (
    <article className="card flex gap-4 p-5">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-ink-900 text-white dark:bg-white dark:text-ink-950">
        <span className="text-[11px] font-semibold uppercase tracking-wider">{month}</span>
        <span className="text-2xl font-bold leading-none">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-sun-100 px-2 py-0.5 font-semibold text-sun-800 dark:bg-sun-900/40 dark:text-sun-200">
            {typeLabel[event.type]}
          </span>
          <span className="text-ink-400">{hub ? hub.shortName : 'SoCal'}</span>
        </div>
        <h3 className="mt-1.5 text-base font-bold">{event.title}</h3>
        <p className="text-sm text-ink-500 dark:text-ink-300">{formatRange(event.start, event.end)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300">
          {event.online ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          {event.location}
          {event.city ? ` · ${event.city}` : ''}
        </p>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-200">{event.description}</p>
        {event.registerUrl && (
          <a
            href={event.registerUrl}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sun-600 hover:underline dark:text-sun-400"
          >
            Register <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

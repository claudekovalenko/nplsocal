import { MapPin, Video, ArrowUpRight } from 'lucide-react';
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
    <article className="card flex gap-5 p-6 transition hover:border-line-strong">
      <div className="flex w-12 shrink-0 flex-col items-center border-r border-line pr-5">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{month}</span>
        <span className="mt-0.5 text-3xl font-light leading-none tracking-tight">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="eyebrow">
          {typeLabel[event.type]} · {hub ? hub.shortName : 'SoCal'}
        </div>
        <h3 className="mt-2 text-lg">{event.title}</h3>
        <p className="mt-1 text-sm text-muted">{formatRange(event.start, event.end)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          {event.online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
          {event.location}
          {event.city ? ` · ${event.city}` : ''}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted/80">{event.description}</p>
        {event.registerUrl && (
          <a href={event.registerUrl} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fg underline-offset-4 hover:underline">
            Register <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

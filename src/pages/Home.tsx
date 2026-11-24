import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { site, featuredEvents } from '@/content';
import NetworkMap from '@/components/NetworkMap';
import { DateTile, RegisterLink, hubName, toneStyle, typeLabel } from '@/components/EventCard';
import { AddToCalendar } from '@/components/EventActions';
import { formatDate, sameDay } from '@/lib/format';
import type { Event } from '@/content';

/**
 * A compact card for the home page: what, when, where and one action. The
 * full details live on the Events page; three of these sit evenly in a row.
 */
function NextCard({ event }: { event: Event }) {
  const hub = event.id === 'la-metro-gospel-push-2027' ? '/push' : null;
  const when = event.dateLabel
    ? event.dateLabel
    : event.end && !sameDay(event.start, event.end)
      ? `${formatDate(event.start)} – ${formatDate(event.end)}`
      : formatDate(event.start);
  return (
    <article className="card relative flex flex-col overflow-hidden transition hover:border-line-strong">
      <div style={toneStyle(event)} className="rule-tone h-1 w-full opacity-80" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-4">
          <DateTile event={event} size="sm" />
          <span style={toneStyle(event)} className="tone-chip">
            {typeLabel[event.type]} · {hubName(event)}
          </span>
        </div>
        <h3 className="mt-5 text-2xl leading-tight">{event.title}</h3>
        <p className="mt-2 text-sm text-muted">{when}</p>
        <p className="text-sm text-muted">{event.venue ?? event.city ?? event.location}</p>
        <div className="mt-auto flex items-center gap-2 pt-6">
          {hub ? (
            <Link to={hub} className="btn-primary !h-9 !px-4">
              Open the hub
            </Link>
          ) : (
            <RegisterLink event={event} className="btn-primary !h-9 !px-4" />
          )}
          <AddToCalendar event={event} className="btn-secondary !h-9 !px-3" label="Calendar" />
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const featured = featuredEvents().slice(0, 3);

  return (
    <>
      {/* Hero */}
      {/* No overflow-hidden: it sliced a hard horizontal line across the
          bottom of the map, where the fade had not finished. */}
      <section className="relative flex flex-col">
        {/* The map hangs below this section on a negative margin, so a glow
            bounded by the section ended in a hard line partway down the map.
            Extend it past the section and centre it on the map, so it fades out
            on its own before it reaches any edge. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -bottom-16 aurora opacity-70 md:-bottom-24" />
        <div className="container-x relative z-10 flex flex-col items-center pt-[calc(var(--header-h)_+_1rem)] text-center md:pt-[calc(var(--header-h)_+_1.5rem)]">
          <div className="eyebrow fade-up">
            {site.hashtag} · <span className="hidden sm:inline">Los Angeles · Orange County</span>
            <span className="sm:hidden">LA · OC</span>
          </div>
          <h1 className="text-gradient fade-up fade-up-2 mt-5 pb-2 text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">No Place Left.</h1>
          <div className="fade-up fade-up-3 mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/events" className="btn-primary min-w-40">
              Events
            </Link>
            <Link to="/push" className="btn-secondary min-w-40">
              The Push
            </Link>
          </div>
        </div>
        <div className="relative z-0 mx-auto -mb-6 mt-6 w-full max-w-md px-4 sm:max-w-xl md:-mb-10 md:mt-8 md:max-w-2xl">
          <NetworkMap variant="hero" className="h-auto w-full" />
        </div>
      </section>

      {/* Next up. No top border: the map fades into this section, and a hairline
          there read as a hard cut across the bottom of the map. */}
      <section id="next">
        <div className="container-x py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="eyebrow">For everyone</div>
              <h2 className="mt-3 text-3xl md:text-5xl">Next up.</h2>
            </div>
            <Link to="/events" className="btn-ghost shrink-0 whitespace-nowrap">
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featured.map((e) => (
              <NextCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

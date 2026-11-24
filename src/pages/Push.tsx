import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, CalendarDays, Ticket, Plus } from 'lucide-react';
import { push, outreach, PUSH_EVENT_ID, type ScheduleDay } from '@/content/push';

const PushMap = lazy(() => import('@/components/PushMap'));
import { events } from '@/content';
import { dayLabel, formatRange } from '@/lib/format';
import { flushPending, pendingCount, sumTotals } from '@/lib/pushStore';
import { useLiveTotals, useAgo } from '@/hooks/useLiveTotals';
import { useLiveSpots } from '@/hooks/useLiveSpots';
import { VenueAddress, venueName } from '@/components/EventCard';
import { AddToCalendar } from '@/components/EventActions';
import InterestForm from '@/components/InterestForm';



/** One day of the schedule as a card, so all four sit side by side. */
function DayCard({ day }: { day: ScheduleDay }) {
  return (
    <li data-day={day.date} className="card flex flex-col p-5">
      <div className="eyebrow">{dayLabel(day.date)}</div>
      {day.summary && <p className="mt-2 text-sm text-muted">{day.summary}</p>}
      {day.place && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" /> {day.place}
        </p>
      )}
      <ol className="mt-4 space-y-3">
        {day.blocks.map((b) => (
          <li key={b.time + b.title} className="border-l-2 border-line pl-3" style={b.kind === 'celebrate' ? { borderColor: 'var(--accent)' } : undefined}>
            <span className="block text-xs tabular-nums text-faint">{b.time}</span>
            <span className={b.kind === 'celebrate' ? 'text-accent' : ''}>{b.title}</span>
            {b.detail && <span className="mt-0.5 block text-sm text-muted">{b.detail}</span>}
          </li>
        ))}
      </ol>
    </li>
  );
}

/** Every section shares one shape: a heading column and a content column. */
function Block({
  id,
  eyebrow,
  title,
  lead,
  aside,
  children,
  wide = false,
  tint = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  /** Content runs full width under the heading instead of beside it. */
  wide?: boolean;
  tint?: boolean;
}) {
  const head = (
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-3 text-3xl leading-tight md:text-4xl">{title}</h2>
      {lead && <p className="mt-3 max-w-md text-muted">{lead}</p>}
      {aside}
    </div>
  );
  return (
    <section id={id} className={`scroll-mt-[calc(var(--header-h)_+_3.5rem)] border-t border-line ${tint ? 'bg-elev' : ''}`}>
      <div className={`container-x py-14 md:py-20 ${wide ? '' : 'grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14'}`}>
        {head}
        <div className={wide ? 'mt-10' : 'min-w-0'}>{children}</div>
      </div>
    </section>
  );
}

const NAV = [
  ['schedule', 'Schedule'],
  ['map', 'Live map'],
  ['about', 'About'],
  ['faq', 'FAQ'],
  ['connect', 'Stay connected'],
] as const;

export default function Push() {
  const event = events.find((e) => e.id === PUSH_EVENT_ID);
  const [queued, setQueued] = useState(0);
  const { rows, status, updatedAt } = useLiveTotals(PUSH_EVENT_ID);
  const { spots } = useLiveSpots([PUSH_EVENT_ID]);
  const ago = useAgo(updatedAt);
  const all = sumTotals(rows);
  const navigate = useNavigate();

  useEffect(() => {
    // Anything captured while offline goes out as soon as the page opens.
    flushPending().finally(() => setQueued(pendingCount()));
  }, []);

  // The forms moved to the tracker; old links to #report and #follow-up follow them.
  useEffect(() => {
    const h = location.hash.slice(1);
    if (h === 'report') navigate('/tracker', { replace: true });
    if (h === 'follow-up') navigate('/tracker?tool=follow-up', { replace: true });
  }, [navigate]);

  return (
    <>
      {/* Hero. Runs up behind the floating header, like the homepage's. */}
      <section className="relative -mt-[var(--header-h)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
        <div className="container-x relative pb-12 pt-[calc(var(--header-h)_+_2.5rem)] md:pb-16 md:pt-[calc(var(--header-h)_+_4rem)]">
          <div className="eyebrow">#NoPlaceLeft · Los Angeles</div>
          <h1 className="mt-4 text-5xl leading-[0.95] md:text-7xl">
            {push.name} <span className="text-gradient">{push.year}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{push.tagline}</p>

          <dl className="mt-8 grid max-w-3xl gap-4 text-sm sm:grid-cols-3">
            <div className="flex gap-2.5">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
              <div>
                <dt className="sr-only">When</dt>
                <dd>{event ? formatRange(event.start, event.end) : 'Dec 30 – Jan 2'}</dd>
                <dd className="text-muted">Starts 6pm with dinner</dd>
              </div>
            </div>
            <div className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
              <div>
                <dt className="sr-only">Check in</dt>
                <dd>Check in at {event?.venue ?? 'Neighbors and Nations'}</dd>
                {event && <VenueAddress location={venueName(event)} className="mt-0" />}
              </div>
            </div>
            <div className="flex gap-2.5">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
              <div>
                <dt className="sr-only">Cost</dt>
                <dd>Free</dd>
                <dd className="text-muted">Please register so we can plan food</dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={`/register/${PUSH_EVENT_ID}`} className="btn-primary min-w-40">
              Register
            </Link>
            {event && <AddToCalendar event={event} />}
            {push.signalUrl && (
              <a href={push.signalUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                <MessageCircle className="h-4 w-4" /> Join the Signal chat
              </a>
            )}
          </div>
          {!push.signalUrl && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-faint">
              <MessageCircle className="h-3.5 w-3.5" /> Signal group chat: link coming soon.
            </p>
          )}
        </div>
      </section>

      {/* Section bar: stays under the header so the long page is easy to move around. */}
      <nav
        aria-label="On this page"
        className="sticky top-[var(--header-h)] z-20 border-y border-line bg-bg/85 backdrop-blur-xl"
      >
        <div className="container-x flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-fg/5 hover:text-fg">
              {label}
            </a>
          ))}
        </div>
      </nav>

      {queued > 0 && (
        <div className="container-x pt-6">
          <p className="card px-4 py-3 text-sm text-muted">
            {queued} report{queued > 1 ? 's' : ''} saved on this device, waiting for signal. They will send by themselves.
          </p>
        </div>
      )}

      {/* Schedule: all four days at once. */}
      <Block id="schedule" eyebrow="Schedule" title="Four days, start to finish." wide>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {push.schedule.map((d) => (
            <DayCard key={d.date} day={d} />
          ))}
        </ol>
      </Block>

      {/* Live: where the teams are and what is happening, in one place. Teams
          add places from the tracker and they appear here for everyone. */}
      <Block
        id="map"
        eyebrow="Live"
        title="Where the teams are."
        lead={`Every day starts at ${outreach.base.name} in Buena Park. Teams go out across these regions and pin the places they go; the numbers come from their daily reports.`}
        wide
      >
        {/* Old links to the "In the field" section land here. */}
        <span id="field" className="block scroll-mt-[calc(var(--header-h)_+_3.5rem)]" />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
          {(
            [
              ['Conversations', all.conversations],
              ['Heard the gospel', all.gospelShared],
              ['Responded', all.responded],
              ['Baptized', all.baptized],
              ['Groups started', all.groupsStarted],
            ] as const
          ).map(([label, n], i) => (
            <div key={label} className={`bg-bg px-2 py-4 text-center ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <dd className="text-2xl font-light tabular-nums tracking-tight md:text-3xl">{n.toLocaleString('en-US')}</dd>
              <dt className="eyebrow mt-1 !tracking-[0.12em]">{label}</dt>
            </div>
          ))}
        </dl>
        <p className="mb-6 mt-2 text-xs text-faint">
          {status === 'live' ? `Live · updated ${ago}` : status === 'offline' ? `No signal · last updated ${ago || 'never'}` : ''}
          {status === 'live' || status === 'offline' ? ' · ' : ''}
          {all.reports ? `${all.reports} team report${all.reports === 1 ? '' : 's'} so far.` : 'Numbers appear as teams turn in their reports.'}
        </p>
        <Suspense fallback={<div className="h-[min(70vh,560px)] rounded-xl border border-line" />}>
          <PushMap live={spots} />
        </Suspense>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/tracker?tool=spot" className="btn-primary">
            Add your place to the map
          </Link>
          <Link to="/tracker" className="btn-secondary">
            Report your day
          </Link>
          <Link to="/tracker?tool=follow-up" className="btn-secondary">
            Log a follow-up
          </Link>
        </div>
      </Block>

      {/* What is a PUSH? */}
      <Block id="about" eyebrow="About" title="What is a PUSH?" lead={push.what.lead}>
        <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {push.what.focus.map((f) => (
            <li key={f.letter} className="bg-bg p-5 md:p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-light leading-none text-accent">{f.letter}</span>
                <h3 className="text-lg">{f.word}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <div className="eyebrow">Who is hosting</div>
            <p className="mt-3 text-sm text-muted">{push.hosts.lead}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {push.hosts.names.map((n) => (
                <li key={n} className="rounded-full border border-line px-2.5 py-0.5 text-sm">
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">{push.hosts.more}</p>
          </div>
          <div className="card p-5">
            <div className="eyebrow">Where to stay</div>
            {push.stay.map((x) => (
              <p key={x} className="mt-3 text-sm text-muted">
                {x}
              </p>
            ))}
          </div>
        </div>
      </Block>

      {/* FAQ */}
      <Block
        id="faq"
        eyebrow="FAQ"
        title="Questions people ask."
        aside={
          <Link to={`/register/${PUSH_EVENT_ID}`} className="btn-primary mt-6 min-w-40">
            Register
          </Link>
        }
      >
        <div className="divide-y divide-line border-y border-line">
          {push.faq.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                {f.q}
                <Plus className="h-4 w-4 shrink-0 text-faint transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Block>

      {/* Stay connected */}
      <Block
        id="connect"
        eyebrow="Stay connected"
        title="Want to hear more?"
        lead="Not ready to register, or met a team on the street? Leave your name and someone near you will reach out."
      >
        <InterestForm source="push" />
      </Block>
    </>
  );
}

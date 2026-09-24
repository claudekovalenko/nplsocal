import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageCircle, MapPin } from 'lucide-react';
import { push, blockKindLabel, PUSH_EVENT_ID, type ScheduleDay } from '@/content/push';
import { events } from '@/content';
import { dayLabel, eventDays, formatRange } from '@/lib/format';
import { fetchTotals, flushPending, pendingCount, sumTotals, type DayTotals } from '@/lib/pushStore';
import PushReportForm from '@/components/PushReportForm';
import InterestForm from '@/components/InterestForm';

const SECTIONS = [
  ['schedule', 'Schedule'],
  ['report', 'Daily report'],
  ['connect', 'Stay connected'],
] as const;

function Totals({ rows }: { rows: DayTotals[] }) {
  const all = sumTotals(rows);
  if (!all.reports) return null;
  const tiles = [
    ['Conversations', all.conversations],
    ['Heard the gospel', all.gospelShared],
    ['Responded', all.responded],
    ['Baptized', all.baptized],
    ['Groups started', all.groupsStarted],
  ] as const;
  return (
    <section className="container-x pb-4">
      <div className="eyebrow">So far</div>
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
        {tiles.map(([label, n]) => (
          <div key={label} className="bg-bg px-4 py-6 text-center">
            <dd className="text-3xl font-light tracking-tight md:text-4xl">{n}</dd>
            <dt className="eyebrow mt-1">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-faint">From {all.reports} team reports. Numbers only — no names leave the organizers.</p>
    </section>
  );
}

function Day({ day }: { day: ScheduleDay }) {
  return (
    <div>
      <h3 className="text-2xl md:text-3xl">{day.title}</h3>
      <p className="mt-2 text-muted">{day.summary}</p>
      {day.place && (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" /> {day.place}
        </p>
      )}
      <ol className="mt-6 divide-y divide-line border-y border-line">
        {day.blocks.map((b) => (
          <li key={b.time + b.title} className="flex gap-5 py-4">
            <span className="w-14 shrink-0 tabular-nums text-sm text-muted">{b.time}</span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-base">{b.title}</span>
                <span className="text-xs text-faint">{blockKindLabel[b.kind]}</span>
              </span>
              {b.detail && <span className="mt-0.5 block text-sm text-muted">{b.detail}</span>}
              {b.place && (
                <span className="mt-0.5 block text-xs text-faint">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {b.place}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Push() {
  const isDraft = push.scheduleStatus === 'draft';
  const event = events.find((e) => e.id === PUSH_EVENT_ID);
  const days = useMemo(() => (event ? eventDays(event.start, event.end) : push.schedule.map((d) => d.date)), [event]);
  const [active, setActive] = useState(0);
  const [totals, setTotals] = useState<DayTotals[]>([]);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    // Anything captured while offline goes out as soon as the page opens.
    flushPending().finally(() => setQueued(pendingCount()));
    fetchTotals(PUSH_EVENT_ID).then(setTotals).catch(() => setTotals([]));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent_70%)] opacity-40" />
        <div className="container-x relative py-16 md:py-24">
          <div className="eyebrow">#NoPlaceLeft · Los Angeles</div>
          <h1 className="mt-4 text-5xl leading-[0.95] md:text-7xl">
            {push.name}
            <span className="block text-muted">{push.year}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">{push.tagline}</p>
          <p className="mt-4 text-muted">{event ? formatRange(event.start, event.end) : 'Dec 30 – Jan 2'}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`/register/${PUSH_EVENT_ID}`} className="btn-primary min-w-40">
              Register
            </Link>
            {push.signalUrl ? (
              <a href={push.signalUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                <MessageCircle className="h-4 w-4" /> Join the Signal chat
              </a>
            ) : (
              <button type="button" className="btn-secondary" disabled title="The Signal invite link has not been added yet">
                <MessageCircle className="h-4 w-4" /> Signal chat — link coming
              </button>
            )}
            <a href="#connect" className="btn-ghost">
              Not sure yet?
            </a>
          </div>

          <nav className="mt-10 flex flex-wrap gap-2" aria-label="On this page">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="pill">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {queued > 0 && (
        <div className="container-x pt-6">
          <p className="card px-4 py-3 text-sm text-muted">
            {queued} report{queued > 1 ? 's' : ''} saved on this device, waiting for signal. They will send by themselves.
          </p>
        </div>
      )}

      <div className="pt-12 md:pt-16">
        <Totals rows={totals} />
      </div>

      {/* Schedule */}
      <section id="schedule" className="scroll-mt-16 border-t border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">Schedule</div>
          <h2 className="mt-3 text-3xl md:text-5xl">What happens each day.</h2>
          {isDraft && (
            <p className="mt-4 max-w-xl text-muted">
              These times are a placeholder while the plan is being set. The shape of the days is right; do not book
              travel around the exact hours yet.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {push.schedule.map((d, i) => (
              <button key={d.date} onClick={() => setActive(i)} className={i === active ? 'pill-active' : 'pill'}>
                {dayLabel(d.date)}
              </button>
            ))}
          </div>

          <div className="mt-10">
            <Day day={push.schedule[active]} />
            {isDraft && <p className="mt-4 text-xs text-faint">Placeholder schedule — times will change.</p>}
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <div>
              <div className="eyebrow">Bring</div>
              <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
                {push.bring.map((b) => (
                  <li key={b} className="py-3">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">New to this?</div>
              <p className="mt-3 text-muted">{push.intro}</p>
              <Link to="/tools" className="btn-secondary mt-5">
                See the tools you'll use
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily report */}
      <section id="report" className="scroll-mt-16 border-t border-line bg-elev">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">Daily report</div>
          <h2 className="mt-3 text-3xl md:text-5xl">End of the day, two minutes.</h2>
          <p className="mt-4 max-w-xl text-muted">
            Every team turns in their numbers and one story. It works with no signal — the report waits on your phone and
            sends itself later.
          </p>
          <div className="mt-10 max-w-3xl">
            <PushReportForm eventId={PUSH_EVENT_ID} days={days} />
          </div>
        </div>
      </section>

      {/* Stay connected */}
      <section id="connect" className="scroll-mt-16 border-t border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">Stay connected</div>
          <h2 className="mt-3 text-3xl md:text-5xl">Want to hear more?</h2>
          <p className="mt-4 max-w-xl text-muted">
            Not ready to register, or you met a team on the street and want to know what this is. Leave your name and
            someone near you will reach out.
          </p>
          <div className="mt-10 max-w-3xl">
            <InterestForm source="push" />
          </div>

          <p className="mt-10 text-sm text-muted">
            Already coming?{' '}
            <Link to={`/register/${PUSH_EVENT_ID}`} className="text-fg underline-offset-4 hover:underline">
              Register here
            </Link>
            , or see{' '}
            <Link to="/gatherings" className="text-fg underline-offset-4 hover:underline">
              everything else on the calendar
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-x py-10 text-center text-sm text-muted">
          Organizers:{' '}
          <Link to={`/roster/${PUSH_EVENT_ID}`} className="inline-flex items-center gap-1 text-fg underline-offset-4 hover:underline">
            push roster <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}

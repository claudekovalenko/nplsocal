import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin } from 'lucide-react';
import { push, blockKindLabel, PUSH_EVENT_ID, type ScheduleDay } from '@/content/push';
import { events } from '@/content';
import { dayLabel, eventDays, formatRange } from '@/lib/format';
import { fetchTotals, flushPending, pendingCount, sumTotals, type DayTotals } from '@/lib/pushStore';
import { VenueAddress, venueName } from '@/components/EventCard';
import { AddToCalendar } from '@/components/EventActions';
import PushReportForm from '@/components/PushReportForm';
import InterestForm from '@/components/InterestForm';
import FollowUpForm from '@/components/FollowUpForm';
import { fetchRegionTotals, flushFollowUps, pendingFollowUps, type RegionTotals } from '@/lib/followUpStore';

const SECTIONS = [
  ['schedule', 'Schedule'],
  ['about', 'What is a PUSH?'],
  ['faq', 'FAQ'],
  ['follow-up', 'Follow-ups'],
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
    <section className="container-x pb-4 pt-12 md:pt-16">
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

/** Where people were found: lights and follow-ups per region. Counts only. */
function ByRegion({ rows }: { rows: RegionTotals[] }) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.red + r.yellow + r.green), 1);
  return (
    <div className="mt-12">
      <div className="eyebrow">Where people were found</div>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {rows.map((r) => {
          const total = r.red + r.yellow + r.green;
          return (
            <li key={r.region} className="grid gap-2 py-4 sm:grid-cols-[14rem_1fr_auto] sm:items-center sm:gap-6">
              <span className="text-sm">{r.region}</span>
              <span
                className="flex h-2 overflow-hidden rounded-full bg-line"
                style={{ width: `${Math.max(8, (total / max) * 100)}%` }}
                title={`${r.red} red · ${r.yellow} yellow · ${r.green} green`}
              >
                {total > 0 && (
                  <>
                    <span className="bg-red-500" style={{ width: `${(r.red / total) * 100}%` }} />
                    <span className="bg-yellow-400" style={{ width: `${(r.yellow / total) * 100}%` }} />
                    <span className="bg-green-500" style={{ width: `${(r.green / total) * 100}%` }} />
                  </>
                )}
              </span>
              <span className="flex gap-4 text-xs text-muted tabular-nums">
                <span><span className="text-red-400">●</span> {r.red}</span>
                <span><span className="text-yellow-400">●</span> {r.yellow}</span>
                <span><span className="text-green-400">●</span> {r.green}</span>
                <span className="text-fg">{r.followUps} follow-up{r.followUps === 1 ? '' : 's'}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-faint">Counts only. Names and numbers stay with the follow-up team.</p>
    </div>
  );
}

function Day({ day }: { day: ScheduleDay }) {
  return (
    <div>
      <h3 className="text-2xl md:text-3xl">{day.title}</h3>
      {day.summary && <p className="mt-2 text-muted">{day.summary}</p>}
      {day.place && (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" /> {day.place}
        </p>
      )}
      <ol className="mt-6 divide-y divide-line border-y border-line">
        {day.blocks.map((b) => (
          <li key={b.time + b.title} className="flex gap-5 py-4">
            <span className="w-28 shrink-0 text-sm text-muted">{b.time}</span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className={b.kind === 'celebrate' ? 'text-base text-accent' : 'text-base'}>{b.title}</span>
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
  const event = events.find((e) => e.id === PUSH_EVENT_ID);
  const days = useMemo(() => (event ? eventDays(event.start, event.end) : push.schedule.map((d) => d.date)), [event]);
  const [active, setActive] = useState(0);
  const [totals, setTotals] = useState<DayTotals[]>([]);
  const [queued, setQueued] = useState(0);
  const [regions, setRegions] = useState<RegionTotals[]>([]);

  useEffect(() => {
    // Anything captured while offline goes out as soon as the page opens.
    Promise.allSettled([flushPending(), flushFollowUps()]).finally(() => {
      setQueued(pendingCount() + pendingFollowUps());
      fetchRegionTotals(PUSH_EVENT_ID).then(setRegions).catch(() => setRegions([]));
    });
    fetchTotals(PUSH_EVENT_ID).then(setTotals).catch(() => setTotals([]));
  }, []);

  return (
    <>
      {/* Hero */}
      {/* The hero runs up behind the floating header, like the homepage's, so the
          glow has no hard edge under it. */}
      <section className="relative -mt-[var(--header-h)] overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 aurora opacity-80" />
        <div className="container-x relative pb-16 pt-[calc(var(--header-h)_+_2.5rem)] md:pb-20 md:pt-[calc(var(--header-h)_+_4rem)]">
          <div className="eyebrow">#NoPlaceLeft · Los Angeles</div>
          <h1 className="mt-4 text-5xl leading-[0.95] md:text-7xl">
            {push.name}
            <span className="text-gradient block pb-1">{push.year}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">{push.tagline}</p>
          <p className="mt-4 text-muted">{event ? formatRange(event.start, event.end) : 'Dec 30 – Jan 2'}</p>
          {/* Teams scatter across the metro, so the one fixed place matters. */}
          {event?.venue && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-muted">
              <MapPin className="h-4 w-4" /> Check in at {event.venue}
            </p>
          )}
          {event && <VenueAddress location={venueName(event)} className="mt-1" />}

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
            {event && <AddToCalendar event={event} />}
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
            {queued} {queued > 1 ? 'entries' : 'entry'} saved on this device, waiting for signal. They will send by themselves.
          </p>
        </div>
      )}

      <Totals rows={totals} />

      {/* Schedule */}
      <section id="schedule" className="scroll-mt-[var(--header-h)] border-t border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">Schedule</div>
          <h2 className="mt-3 text-3xl md:text-5xl">What happens each day.</h2>

          <div className="mt-8 flex flex-wrap gap-2">
            {push.schedule.map((d, i) => (
              <button key={d.date} onClick={() => setActive(i)} className={i === active ? 'pill-active' : 'pill'}>
                {dayLabel(d.date)}
              </button>
            ))}
          </div>

          <div className="mt-10">
            <Day day={push.schedule[active]} />
          </div>
        </div>
      </section>

      {/* What is a PUSH? */}
      <section id="about" className="scroll-mt-[var(--header-h)] border-t border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">What is a PUSH?</div>
          <h2 className="mt-3 max-w-3xl text-3xl md:text-5xl">{push.what.lead}</h2>
          <p className="mt-6 text-muted">We will focus on:</p>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {push.what.focus.map((f) => (
              <li key={f.letter} className="bg-bg p-6 md:p-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-light leading-none text-accent">{f.letter}</span>
                  <h3 className="text-xl">{f.word}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{f.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            <div>
              <div className="eyebrow">Who is hosting the PUSH?</div>
              <p className="mt-4 text-muted">{push.hosts.lead}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {push.hosts.names.map((n) => (
                  <li key={n} className="rounded-full border border-line px-3 py-1 text-sm">
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">{push.hosts.more}</p>
            </div>
            <div>
              <div className="eyebrow">Where should we stay?</div>
              {push.stay.map((s) => (
                <p key={s} className="mt-4 text-muted">
                  {s}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-[var(--header-h)] border-t border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">FAQ</div>
          <h2 className="mt-3 text-3xl md:text-5xl">Questions people ask.</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {push.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  {f.q}
                  <span className="text-faint transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <Link to={`/register/${PUSH_EVENT_ID}`} className="btn-primary mt-10 min-w-40">
            Register
          </Link>
        </div>
      </section>

      {/* Follow-ups */}
      <section id="follow-up" className="scroll-mt-[var(--header-h)] border-t border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">Follow-ups</div>
          <h2 className="mt-3 text-3xl md:text-5xl">Found someone? Log the follow-up.</h2>
          <p className="mt-4 max-w-xl text-muted">
            Someone wants a Bible study, or is fired up to learn to share the gospel. Get their phone number, tell us what
            they asked for and where you met them, and a laborer near them will reach out. Counting red, yellow and green
            lights is optional.
          </p>
          <div className="mt-10 max-w-3xl">
            <FollowUpForm eventId={PUSH_EVENT_ID} days={days} />
          </div>
          <ByRegion rows={regions} />
        </div>
      </section>

      {/* Daily report */}
      <section id="report" className="scroll-mt-[var(--header-h)] border-t border-line bg-elev">
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
      <section id="connect" className="scroll-mt-[var(--header-h)] border-t border-line">
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
        </div>
      </section>

    </>
  );
}

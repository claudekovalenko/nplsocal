import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CloudOff, RefreshCw } from 'lucide-react';
import { push, PUSH_EVENT_ID, FIELD_EVENT_ID } from '@/content/push';
import { events } from '@/content';
import { addDays, dayLabel, eventDays, todayPacific, weekStart } from '@/lib/format';
import { flushPending, pendingCount, sumTotals, type DayTotals } from '@/lib/pushStore';
import { useLiveTotals, useAgo, type LiveStatus } from '@/hooks/useLiveTotals';
import { useOnline } from '@/hooks/useOnline';
import PushReportForm from '@/components/PushReportForm';
import FollowUpForm from '@/components/FollowUpForm';
import SpotForm from '@/components/SpotForm';
import { flushSpots, pendingSpots } from '@/lib/spotsStore';

const STATS = [
  ['conversations', 'Conversations', 'Talks'],
  ['gospelShared', 'Heard the gospel', 'Gospel'],
  ['responded', 'Responded', 'Resp.'],
  ['baptized', 'Baptized', 'Bapt.'],
  ['groupsStarted', 'Groups started', 'Groups'],
] as const;

type Stat = (typeof STATS)[number][0];
type View = 'week' | 'push' | 'all';
type Tool = 'report' | 'follow-up' | 'spot';
interface Row extends DayTotals {
  label: string;
  highlight?: boolean;
}

const empty = (day: string): DayTotals => ({ day, conversations: 0, gospelShared: 0, responded: 0, baptized: 0, groupsStarted: 0, reports: 0 });
const add = (a: DayTotals, b: DayTotals): DayTotals => ({
  day: a.day,
  conversations: a.conversations + b.conversations,
  gospelShared: a.gospelShared + b.gospelShared,
  responded: a.responded + b.responded,
  baptized: a.baptized + b.baptized,
  groupsStarted: a.groupsStarted + b.groupsStarted,
  reports: a.reports + b.reports,
});
const shortDate = (day: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));

/** A number that briefly lights up when it goes up, so a live change is noticed. */
function LiveNumber({ value, className = '' }: { value: number; className?: string }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (value > prev.current) {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 1600);
      prev.current = value;
      return () => window.clearTimeout(t);
    }
    prev.current = value;
  }, [value]);
  return (
    <span className={`tabular-nums transition-colors duration-700 ${flash ? 'text-accent' : ''} ${className}`}>
      {value.toLocaleString('en-US')}
    </span>
  );
}

function StatusPill({ status, ago, onRefresh }: { status: LiveStatus; ago: string; onRefresh: () => void }) {
  const text =
    status === 'live'
      ? `Live · updated ${ago}`
      : status === 'offline'
        ? `No signal · last updated ${ago || 'never'}`
        : status === 'connecting'
          ? 'Connecting…'
          : 'Not connected to the shared database';
  return (
    <button
      type="button"
      onClick={onRefresh}
      title="Refresh now"
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-line-strong hover:text-fg"
    >
      {status === 'live' ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
      ) : status === 'offline' ? (
        <CloudOff className="h-3.5 w-3.5" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      {text}
    </button>
  );
}

/** The rows for a view: one per day (this week, the push) or one per week (all time). */
function rowsFor(view: View, byDay: Map<string, DayTotals>, today: string, pushDays: string[]): Row[] {
  if (view === 'week') {
    const start = weekStart(today);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((d) => ({
      ...(byDay.get(d) ?? empty(d)),
      label: dayLabel(d),
      highlight: d === today,
    }));
  }
  if (view === 'push') {
    return pushDays.map((d) => ({ ...(byDay.get(d) ?? empty(d)), label: dayLabel(d), highlight: d === today }));
  }
  const weeks = new Map<string, DayTotals>();
  for (const [d, r] of byDay) {
    const w = weekStart(d);
    weeks.set(w, add(weeks.get(w) ?? empty(w), r));
  }
  const thisWeek = weekStart(today);
  return [...weeks.keys()]
    .sort()
    .reverse()
    .map((w) => ({ ...weeks.get(w)!, label: `Week of ${shortDate(w)}`, highlight: w === thisWeek }));
}

/**
 * The tracker: a section of its own, open any day of the year. Teams turn in
 * what happened in the field, the follow-ups they found, and everyone sees the
 * numbers move live. Reports dated during the push count toward the push; any
 * other day counts toward the network's ongoing work.
 */
export default function Tracker() {
  const pushEvent = events.find((e) => e.id === PUSH_EVENT_ID);
  const pushDays = useMemo(() => (pushEvent ? eventDays(pushEvent.start, pushEvent.end) : push.schedule.map((d) => d.date)), [pushEvent]);
  const today = todayPacific();
  const duringPush = pushDays.includes(today);
  const { rows, updatedAt, status, refresh } = useLiveTotals([PUSH_EVENT_ID, FIELD_EVENT_ID]);
  const ago = useAgo(updatedAt);
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const tool: Tool = params.get('tool') === 'follow-up' ? 'follow-up' : params.get('tool') === 'spot' ? 'spot' : 'report';
  const view: View = (['week', 'push', 'all'] as const).find((v) => v === params.get('view')) ?? (duringPush ? 'push' : 'week');
  const [queued, setQueued] = useState(pendingCount() + pendingSpots());

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null) next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  // Anything saved without signal goes out as soon as there is some.
  useEffect(() => {
    const send = () =>
      Promise.allSettled([flushPending(), flushSpots()]).finally(() => setQueued(pendingCount() + pendingSpots()));
    send();
    window.addEventListener('online', send);
    return () => window.removeEventListener('online', send);
  }, []);

  // Both events added together, one total per calendar day.
  const byDay = useMemo(() => {
    const m = new Map<string, DayTotals>();
    for (const r of rows) m.set(r.day, add(m.get(r.day) ?? empty(r.day), r));
    return m;
  }, [rows]);
  const list = rowsFor(view, byDay, today, pushDays);
  const all = sumTotals(list);

  // The days a report can be for: the push while it runs, otherwise the past week.
  const reportDays = duringPush ? pushDays : Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const eventFor = (day: string) => (pushDays.includes(day) ? PUSH_EVENT_ID : FIELD_EVENT_ID);

  const views: [View, string][] = [
    ['week', 'This week'],
    ['push', 'The push'],
    ['all', 'All time'],
  ];
  const caption =
    view === 'week' ? `Week of ${shortDate(weekStart(today))}` : view === 'push' ? `${push.name} ${push.year}` : 'Every report so far';

  return (
    <div className="container-x max-w-4xl py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">#NoPlaceLeft · LA &amp; OC</div>
          <h1 className="mt-2 text-4xl md:text-5xl">Tracker</h1>
          <p className="mt-2 max-w-lg text-muted">What God is doing through the teams in the field, live. Turn in your numbers any day of the week.</p>
        </div>
        <StatusPill status={online ? status : 'offline'} ago={ago} onRefresh={refresh} />
      </div>

      {/* Which numbers */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Period" className="inline-flex rounded-full border border-line-strong p-1">
          {views.map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setParam('view', v === (duringPush ? 'push' : 'week') ? null : v)}
              className={`h-8 rounded-full px-3.5 text-[13px] font-medium transition ${view === v ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-faint">{caption}</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
        {STATS.map(([key, label], i) => (
          // Five tiles in two columns on a phone: the last one takes the full row.
          <div key={key} className={`bg-bg px-4 py-5 text-center ${i === STATS.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}>
            <dd>
              <LiveNumber value={all[key]} className="text-3xl font-light tracking-tight md:text-4xl" />
            </dd>
            <dt className="eyebrow mt-1 !tracking-[0.12em]">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-faint">
        {all.reports
          ? `From ${all.reports} team report${all.reports === 1 ? '' : 's'}. Numbers only: names and stories stay with the organizers.`
          : 'No reports here yet. Numbers appear as teams turn in their reports.'}
      </p>

      {/* Row by row. Phones get a compact row; the full table fits from tablet width up. */}
      {list.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">Nothing reported yet.</p>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line sm:hidden">
            {list.map((r) => (
              <li key={r.day} className={`px-4 py-3 ${r.highlight ? 'bg-accent/10' : ''}`}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{r.label}</span>
                  <span className="text-xs text-muted">{r.reports ? `${r.reports} report${r.reports === 1 ? '' : 's'}` : 'No reports'}</span>
                </div>
                {r.reports > 0 && (
                  <dl className="mt-2 grid grid-cols-5 gap-1 text-center">
                    {STATS.map(([key, , short]) => (
                      <div key={key}>
                        <dd className="text-base">
                          <LiveNumber value={r[key as Stat]} />
                        </dd>
                        <dt className="text-[10px] uppercase tracking-[0.06em] text-faint">{short}</dt>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden overflow-x-auto rounded-xl border border-line sm:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-4 py-2.5 font-medium">{view === 'all' ? 'Week' : 'Day'}</th>
                  {STATS.map(([key, label]) => (
                    <th key={key} className="px-3 py-2.5 text-right font-medium">
                      {label}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right font-medium">Reports</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.day} className={`border-b border-line last:border-0 ${r.highlight ? 'bg-accent/10' : ''}`}>
                    <td className="whitespace-nowrap px-4 py-3">{r.label}</td>
                    {STATS.map(([key]) => (
                      <td key={key} className="px-3 py-3 text-right">
                        {r.reports ? <LiveNumber value={r[key as Stat]} /> : <span className="text-faint">–</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right text-muted">{r.reports ? <LiveNumber value={r.reports} /> : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {queued > 0 && (
        <p className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-elev px-4 py-3 text-sm text-muted">
          <CloudOff className="h-4 w-4 shrink-0" />
          {queued} {queued > 1 ? 'entries' : 'entry'} saved on this phone, waiting to send. They go by themselves.
        </p>
      )}

      {/* The two forms, one at a time */}
      <div className="mt-12">
        <div role="tablist" aria-label="Team tools" className="inline-flex max-w-full overflow-x-auto rounded-full border border-line-strong p-1 [scrollbar-width:none]">
          {(
            [
              ['report', 'Report your day'],
              ['spot', 'Add a place'],
              ['follow-up', 'Log a follow-up'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tool === id}
              onClick={() => setParam('tool', id === 'report' ? null : id)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition sm:px-4 ${tool === id ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tool === 'report' ? (
          <div id="report" role="tabpanel" className="mt-6">
            <p className="max-w-xl text-sm text-muted">
              Two minutes: your team's numbers and one story, for today or any day this past week. It works with no signal
              — the report waits on your phone and sends itself later.
            </p>
            <div className="mt-6">
              <PushReportForm
                eventId={FIELD_EVENT_ID}
                eventFor={eventFor}
                days={reportDays}
                onSent={() => {
                  refresh();
                  setQueued(pendingCount());
                }}
              />
            </div>
          </div>
        ) : tool === 'spot' ? (
          <div id="spot" role="tabpanel" className="mt-6">
            <p className="max-w-xl text-sm text-muted">
              Where did your team go? Pin it and it appears on the push map for everyone, live. No names, just the place.
            </p>
            <div className="mt-6">
              <SpotForm days={reportDays} eventFor={eventFor} />
            </div>
          </div>
        ) : (
          <div id="follow-up" role="tabpanel" className="mt-6">
            <p className="max-w-xl text-sm text-muted">
              Met someone who wants a Bible study, or to learn to share the gospel? Get their phone number, say what they
              asked for and where you met them. Tapping Send opens your email with it all written out — just hit send and it
              goes to the follow-up team.
            </p>
            <div className="mt-6">
              <FollowUpForm days={reportDays} />
            </div>
          </div>
        )}
      </div>

      {!duringPush && (
        <Link to="/push" className="card card-hover mt-12 flex items-center justify-between gap-4 p-5">
          <span>
            <span className="block font-medium">{push.name} {push.year}</span>
            <span className="mt-0.5 block text-sm text-muted">Dec 30 – Jan 2. Everything about the push.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
        </Link>
      )}
    </div>
  );
}

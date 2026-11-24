import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CloudOff, RefreshCw } from 'lucide-react';
import { push, PUSH_EVENT_ID } from '@/content/push';
import { events } from '@/content';
import { dayLabel, eventDays, isoDay } from '@/lib/format';
import { flushPending, pendingCount, sumTotals, type DayTotals } from '@/lib/pushStore';
import { useLiveTotals, useAgo, type LiveStatus } from '@/hooks/useLiveTotals';
import { useOnline } from '@/hooks/useOnline';
import PushReportForm from '@/components/PushReportForm';
import FollowUpForm from '@/components/FollowUpForm';

const STATS = [
  ['conversations', 'Conversations', 'Talks'],
  ['gospelShared', 'Heard the gospel', 'Gospel'],
  ['responded', 'Responded', 'Resp.'],
  ['baptized', 'Baptized', 'Bapt.'],
  ['groupsStarted', 'Groups started', 'Groups'],
] as const;

type Stat = (typeof STATS)[number][0];

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

type Tool = 'report' | 'follow-up';

/**
 * The push tracker: live numbers for the whole push, and the two forms teams
 * use in the field. Its own page so it can be opened straight from a phone's
 * home screen and stay open all day, without the event information around it.
 */
export default function PushTracker() {
  const event = events.find((e) => e.id === PUSH_EVENT_ID);
  const days = useMemo(() => (event ? eventDays(event.start, event.end) : push.schedule.map((d) => d.date)), [event]);
  const { rows, updatedAt, status, refresh } = useLiveTotals(PUSH_EVENT_ID);
  const ago = useAgo(updatedAt);
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const tool: Tool = params.get('tool') === 'follow-up' ? 'follow-up' : 'report';
  const [queued, setQueued] = useState(pendingCount());
  const today = isoDay(new Date().toISOString());

  // Anything saved without signal goes out as soon as there is some.
  useEffect(() => {
    const send = () => flushPending().finally(() => setQueued(pendingCount()));
    send();
    window.addEventListener('online', send);
    return () => window.removeEventListener('online', send);
  }, []);

  const all = sumTotals(rows);
  const byDay: Record<string, DayTotals> = Object.fromEntries(rows.map((r) => [r.day, r]));

  return (
    <div className="container-x max-w-4xl py-8 md:py-12">
      <Link to="/push" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> {push.name}
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Push {push.year}</div>
          <h1 className="mt-2 text-4xl md:text-5xl">Tracker</h1>
        </div>
        <StatusPill status={online ? status : 'offline'} ago={ago} onRefresh={refresh} />
      </div>

      {/* Totals for the whole push */}
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
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
          : 'No reports yet. Numbers appear here as teams turn in their daily reports.'}
      </p>

      {/* Day by day. Phones get a compact row per day; a six-column table only
          fits from tablet width up. */}
      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line sm:hidden">
        {days.map((d) => {
          const r = byDay[d];
          return (
            <li key={d} className={`px-4 py-3 ${d === today ? 'bg-accent/10' : ''}`}>
              <div className="flex items-baseline justify-between text-sm">
                <span>
                  {dayLabel(d)}
                  {d === today && <span className="ml-2 text-xs text-accent">Today</span>}
                </span>
                <span className="text-xs text-muted">{r ? `${r.reports} report${r.reports === 1 ? '' : 's'}` : 'No reports'}</span>
              </div>
              {r && (
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
          );
        })}
      </ul>
      <div className="mt-8 hidden overflow-x-auto rounded-xl border border-line sm:block">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-faint">
              <th className="px-4 py-2.5 font-medium">Day</th>
              {STATS.map(([key, label]) => (
                <th key={key} className="px-3 py-2.5 text-right font-medium">
                  {label}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right font-medium">Reports</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const r = byDay[d];
              return (
                <tr key={d} className={`border-b border-line last:border-0 ${d === today ? 'bg-accent/10' : ''}`}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {dayLabel(d)}
                    {d === today && <span className="ml-2 text-xs text-accent">Today</span>}
                  </td>
                  {STATS.map(([key]) => (
                    <td key={key} className="px-3 py-3 text-right">
                      {r ? <LiveNumber value={r[key as Stat]} /> : <span className="text-faint">–</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-muted">{r ? <LiveNumber value={r.reports} /> : '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {queued > 0 && (
        <p className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-elev px-4 py-3 text-sm text-muted">
          <CloudOff className="h-4 w-4 shrink-0" />
          {queued} {queued > 1 ? 'reports' : 'report'} saved on this phone, waiting for signal. They send by themselves.
        </p>
      )}

      {/* The two forms, one at a time */}
      <div className="mt-12">
        <div role="tablist" aria-label="Team tools" className="inline-flex rounded-full border border-line-strong p-1">
          {(
            [
              ['report', 'Daily report'],
              ['follow-up', 'Log a follow-up'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tool === id}
              onClick={() => setParams(id === 'report' ? {} : { tool: id }, { replace: true })}
              className={`h-9 rounded-full px-4 text-sm font-medium transition ${tool === id ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tool === 'report' ? (
          <div id="report" role="tabpanel" className="mt-6">
            <p className="max-w-xl text-sm text-muted">
              End of the day, two minutes: your team's numbers and one story. It works with no signal — the report waits on
              your phone and sends itself later.
            </p>
            <div className="mt-6">
              <PushReportForm
                eventId={PUSH_EVENT_ID}
                days={days}
                onSent={() => {
                  refresh();
                  setQueued(pendingCount());
                }}
              />
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
              <FollowUpForm days={days} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { CalendarDays, List, Bell } from 'lucide-react';
import { upcomingEvents, events as allEvents, hubs, site, type Event } from '@/content';
import { FeaturedEvent, EventRow } from '@/components/EventCard';
import { SignalButton, SubscribeCalendar } from '@/components/EventActions';
import MonthCalendar from '@/components/MonthCalendar';
import { monthKey } from '@/lib/format';

type View = 'month' | 'list';

export default function Events() {
  const [hub, setHub] = useState<string>('all');
  const [showGroups, setShowGroups] = useState(false);
  const [view, setView] = useState<View>('month');

  const upcoming = useMemo(() => upcomingEvents(), []);
  const featured = upcoming.filter((e) => e.tier === 'network');
  const matches = (e: Event) =>
    (hub === 'all' || e.hub === hub || e.hub === 'socal') && (showGroups || e.tier !== 'group');

  // The month grid can be paged back, so it gets past events too; the list is
  // what's coming.
  const forMonth = allEvents.filter(matches);
  const forList = upcoming.filter(matches);
  const byMonth = forList.reduce<Record<string, Event[]>>((acc, e) => {
    (acc[monthKey(e.start)] ??= []).push(e);
    return acc;
  }, {});
  const groupCount = upcoming.filter((e) => e.tier === 'group' && (hub === 'all' || e.hub === hub)).length;

  return (
    <>
      {/* For everyone */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 aurora opacity-60" />
        <div className="container-x relative py-16 md:py-24">
          <div className="eyebrow">For everyone</div>
          <h1 className="text-gradient mt-4 pb-1 text-5xl md:text-7xl">What's next.</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Trainings, prayer and pushes across Los Angeles and Orange County. Add them to your calendar and your phone
            will remind you.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {featured.map((e) => (
              <FeaturedEvent key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>

      {/* Never miss one */}
      <section className="container-x pt-12 md:pt-16">
        <div className="card relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 aurora opacity-40" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl md:text-2xl">Get every event on your phone.</h2>
                <p className="mt-1.5 max-w-xl text-sm text-muted">
                  Subscribe once and new events appear in your calendar by themselves, with a reminder the day before and
                  two hours before.{site.contact.signal ? ' Join the Signal group for updates on the day.' : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SubscribeCalendar />
              <SignalButton url={site.contact.signal} label="Join on Signal" />
            </div>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="container-x py-12 md:py-16">
        <div className="eyebrow">Calendar</div>
        <h2 className="mt-3 text-3xl md:text-5xl">Everything on the calendar.</h2>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button className={hub === 'all' ? 'pill-active' : 'pill'} onClick={() => setHub('all')}>
              All
            </button>
            {hubs.map((h) => (
              <button key={h.id} className={hub === h.id ? 'pill-active' : 'pill'} onClick={() => setHub(h.id)}>
                {h.shortName}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {groupCount > 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={showGroups} onChange={(e) => setShowGroups(e.target.checked)} className="accent-current" />
                Include group-only events ({groupCount})
              </label>
            )}
            <div className="inline-flex rounded-full border border-line p-0.5" role="group" aria-label="Calendar view">
              {(
                [
                  ['month', 'Month', CalendarDays],
                  ['list', 'List', List],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition ${
                    view === v ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {view === 'month' ? (
            <MonthCalendar key={`${hub}-${showGroups}`} events={forMonth} showHub={hub === 'all'} />
          ) : Object.keys(byMonth).length === 0 ? (
            <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">Nothing scheduled.</p>
          ) : (
            Object.entries(byMonth).map(([month, list]) => (
              <div key={month} className="mt-10 first:mt-0">
                <div className="eyebrow">{month}</div>
                <ul className="mt-2 divide-y divide-line border-y border-line">
                  {list.map((e) => (
                    <EventRow key={e.id} event={e} showHub={hub === 'all'} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

    </>
  );
}

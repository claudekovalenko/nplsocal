import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { upcomingEvents, hubs, type Event } from '@/content';
import { FeaturedEvent, EventRow } from '@/components/EventCard';
import { monthKey } from '@/lib/format';

export default function Events() {
  const [hub, setHub] = useState<string>('all');
  const [showGroups, setShowGroups] = useState(false);

  const all = useMemo(() => upcomingEvents(), []);
  const featured = all.filter((e) => e.tier === 'network');
  const calendar = all.filter(
    (e) =>
      e.tier !== 'network' &&
      (hub === 'all' || e.hub === hub || e.hub === 'socal') &&
      (showGroups || e.tier !== 'group'),
  );
  const byMonth = calendar.reduce<Record<string, Event[]>>((acc, e) => {
    (acc[monthKey(e.start)] ??= []).push(e);
    return acc;
  }, {});
  const groupCount = all.filter((e) => e.tier === 'group' && (hub === 'all' || e.hub === hub)).length;

  return (
    <>
      {/* For everyone */}
      <section className="border-b border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">For everyone</div>
          <h1 className="mt-4 text-4xl md:text-6xl">What's next.</h1>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <FeaturedEvent key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="container-x py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
          {groupCount > 0 && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={showGroups} onChange={(e) => setShowGroups(e.target.checked)} className="accent-current" />
              Include group gatherings ({groupCount})
            </label>
          )}
        </div>

        {Object.keys(byMonth).length === 0 ? (
          <p className="py-16 text-center text-muted">Nothing scheduled.</p>
        ) : (
          Object.entries(byMonth).map(([month, list]) => (
            <div key={month} className="mt-10">
              <div className="eyebrow">{month}</div>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {list.map((e) => (
                  <EventRow key={e.id} event={e} showHub={hub === 'all'} />
                ))}
              </ul>
            </div>
          ))
        )}

        <p className="mt-12 text-center text-xs text-faint">
          Trainings on the pathway are on the{' '}
          <Link to="/training" className="text-muted underline-offset-4 hover:underline">
            Training
          </Link>{' '}
          page. Hosting something?{' '}
          <Link to="/connect" className="text-muted underline-offset-4 hover:underline">
            Tell us
          </Link>
          .
        </p>
      </section>
    </>
  );
}

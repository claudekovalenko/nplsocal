import { useMemo, useState } from 'react';
import { upcomingEvents, hubs } from '@/content';
import PageHeader from '@/components/PageHeader';
import EventCard from '@/components/EventCard';

const types = [
  { id: 'all', label: 'All' },
  { id: 'training', label: 'Trainings' },
  { id: 'gathering', label: 'Iron on Iron' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'outreach', label: 'Outreach' },
];

export default function Events() {
  const [hub, setHub] = useState('all');
  const [type, setType] = useState('all');

  const list = useMemo(
    () =>
      upcomingEvents().filter(
        (e) => (hub === 'all' || e.hub === hub || e.hub === 'socal') && (type === 'all' || e.type === type),
      ),
    [hub, type],
  );

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 text-ink-600 hover:bg-ink-100 dark:bg-ink-800 dark:text-ink-200'
    }`;

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Trainings, prayer, and gatherings."
        lead="Everything happening across both hubs. Times are Pacific."
      >
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-ink-400">Hub</span>
            <button className={pill(hub === 'all')} onClick={() => setHub('all')}>All SoCal</button>
            {hubs.map((h) => (
              <button key={h.id} className={pill(hub === h.id)} onClick={() => setHub(h.id)}>
                {h.shortName}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-ink-400">Type</span>
            {types.map((t) => (
              <button key={t.id} className={pill(type === t.id)} onClick={() => setType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="container-x py-10">
        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-ink-500">Nothing scheduled for that filter yet.</p>
        )}
        <p className="mt-10 text-center text-xs text-ink-400">
          Hosting something? Send it to us on the Connect page and we'll add it here.
        </p>
      </section>
    </>
  );
}

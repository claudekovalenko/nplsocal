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

  return (
    <>
      <PageHeader eyebrow="Calendar" title="Trainings, prayer, gatherings." lead="Everything happening across both hubs. Times are Pacific.">
        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            <button className={hub === 'all' ? 'pill-active' : 'pill'} onClick={() => setHub('all')}>
              All SoCal
            </button>
            {hubs.map((h) => (
              <button key={h.id} className={hub === h.id ? 'pill-active' : 'pill'} onClick={() => setHub(h.id)}>
                {h.shortName}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {types.map((t) => (
              <button key={t.id} className={type === t.id ? 'pill-active' : 'pill'} onClick={() => setType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="container-x py-12 md:py-16">
        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted">Nothing scheduled for that filter yet.</p>
        )}
        <p className="mt-12 text-center text-xs text-faint">Hosting something? Send it through the Connect page and we'll add it here.</p>
      </section>
    </>
  );
}

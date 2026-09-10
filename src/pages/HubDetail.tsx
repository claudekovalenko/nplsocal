import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Mail } from 'lucide-react';
import { hubById, upcomingEvents } from '@/content';
import EventCard from '@/components/EventCard';
import Section from '@/components/Section';

export default function HubDetail() {
  const { id = '' } = useParams();
  const hub = hubById(id);
  if (!hub) return <Navigate to="/hubs" replace />;
  const events = upcomingEvents().filter((e) => e.hub === hub.id || e.hub === 'socal');

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${hub.accent} opacity-30`} />
        <div className="container-x relative py-16 md:py-20">
          <Link to="/hubs" className="inline-flex items-center gap-1 text-sm text-ink-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All hubs
          </Link>
          <div className="eyebrow mt-6 !text-sun-300">#NoPlaceLeft</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">{hub.name}</h1>
          <p className="mt-3 text-lg text-ink-200">{hub.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/connect" className="btn-primary">
              Connect with {hub.shortName} <ArrowRight className="h-4 w-4" />
            </Link>
            {hub.contactEmail && (
              <a href={`mailto:${hub.contactEmail}`} className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15">
                <Mail className="h-4 w-4" /> {hub.contactEmail}
              </a>
            )}
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold">About the hub</h2>
            <p className="mt-3 text-ink-700 dark:text-ink-200">{hub.description}</p>
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-ink-400">Where we're working</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {hub.regions.map((r) => (
                <li key={r} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-4">
            <div className="card p-5">
              <div className="eyebrow">Rhythms</div>
              <ul className="mt-3 space-y-3">
                {hub.gatherings.map((g) => (
                  <li key={g.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{g.name}</span>
                      <span className="text-xs text-ink-400">{g.cadence}</span>
                    </div>
                    {g.note && <p className="text-xs text-ink-500 dark:text-ink-300">{g.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
            {hub.legacyUrl && (
              <a
                href={hub.legacyUrl}
                target="_blank"
                rel="noreferrer"
                className="card flex items-center justify-between p-4 text-sm font-semibold hover:shadow-lg"
              >
                Previous {hub.shortName} site <ExternalLink className="h-4 w-4 text-ink-400" />
              </a>
            )}
          </aside>
        </div>
      </Section>

      <section className="bg-white dark:bg-ink-900">
        <Section eyebrow="Calendar" title={`Coming up in ${hub.shortName}`}>
          {events.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-ink-500">Nothing posted yet.</p>
          )}
        </Section>
      </section>
    </>
  );
}

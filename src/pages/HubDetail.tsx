import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { hubById, upcomingEvents } from '@/content';
import EventCard from '@/components/EventCard';
import Section from '@/components/Section';
import NetworkMap from '@/components/NetworkMap';

export default function HubDetail() {
  const { id = '' } = useParams();
  const hub = hubById(id);
  if (!hub) return <Navigate to="/hubs" replace />;
  const events = upcomingEvents().filter((e) => e.hub === hub.id || e.hub === 'socal');

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_50%,var(--glow),transparent_70%)] opacity-30" />
        <div className="container-x relative grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <Link to="/hubs" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
              <ArrowLeft className="h-4 w-4" /> All hubs
            </Link>
            <div className="eyebrow mt-8">#NoPlaceLeft · {hub.shortName}</div>
            <h1 className="mt-4 text-4xl md:text-6xl">{hub.name}</h1>
            <p className="mt-4 text-lg text-muted">{hub.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link to="/connect" className="btn-primary">
                Connect with {hub.shortName}
              </Link>
              {hub.contactEmail && (
                <a href={`mailto:${hub.contactEmail}`} className="btn-secondary">
                  {hub.contactEmail}
                </a>
              )}
            </div>
          </div>
          <NetworkMap variant="hero" className="h-auto w-full" />
        </div>
      </section>

      <Section>
        <div className="grid gap-14 md:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="eyebrow">About the hub</div>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{hub.description}</p>
            <div className="eyebrow mt-12">Where we're working</div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {hub.regions.map((r) => (
                <li key={r} className="py-3 text-sm">
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-10">
            <div>
              <div className="eyebrow">Rhythms</div>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {hub.gatherings.map((g) => (
                  <li key={g.name} className="py-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm">{g.name}</span>
                      <span className="text-xs text-faint">{g.cadence}</span>
                    </div>
                    {g.note && <p className="mt-0.5 text-xs text-muted">{g.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
            {hub.legacyUrl && (
              <a
                href={hub.legacyUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-sm text-muted transition hover:text-fg"
              >
                Previous {hub.shortName} site <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </aside>
        </div>
      </Section>

      <section className="border-t border-line bg-elev">
        <Section eyebrow="Calendar" title={`Coming up in ${hub.shortName}.`}>
          {events.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Nothing posted yet.</p>
          )}
        </Section>
      </section>
    </>
  );
}

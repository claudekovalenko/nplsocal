import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { site, hubs, tools, upcomingEvents, fields } from '@/content';
import NetworkMap from '@/components/NetworkMap';
import FourFieldsDiagram from '@/components/FourFieldsDiagram';
import ToolCard from '@/components/ToolCard';
import EventCard from '@/components/EventCard';

const starterSlugs = ['411', '3-circles', '3-thirds'];

const stats = [
  { n: '2', label: 'Counties' },
  { n: '122', label: 'Cities' },
  { n: '13M+', label: 'People' },
  { n: '200+', label: 'Languages' },
];

export default function Home() {
  const starters = starterSlugs.map((s) => tools.find((t) => t.slug === s)!);
  const events = upcomingEvents().slice(0, 3);

  return (
    <>
      {/* ── Hero: full viewport, map as the object ── */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_100%,var(--glow),transparent_70%)] opacity-40" />
        <div className="container-x relative z-10 flex flex-col items-center pt-24 text-center md:pt-32">
          <div className="eyebrow fade-up">{site.hashtag} · Southern California</div>
          <h1 className="fade-up fade-up-2 mt-5 text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
            No Place Left.
          </h1>
          <p className="fade-up fade-up-3 mt-6 max-w-xl text-base text-muted md:text-lg">
            Multiplying disciples, churches, and leaders across Los Angeles and Orange County — one network, until every
            neighborhood is reached.
          </p>
          <div className="fade-up fade-up-3 mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/training" className="btn-primary min-w-40">
              Get trained
            </Link>
            <Link to="/tools" className="btn-secondary min-w-40">
              Toolbox
            </Link>
          </div>
        </div>
        <div className="relative z-0 mx-auto mt-4 w-full max-w-3xl flex-1 px-2 md:mt-6">
          <NetworkMap variant="hero" className="h-auto w-full" />
        </div>
        <a
          href="#network"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-faint transition hover:text-fg md:block"
          aria-label="Scroll"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* ── Network: stats + hubs ── */}
      <section id="network" className="border-t border-line">
        <div className="container-x py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">One network</div>
            <h2 className="mt-3 text-3xl md:text-5xl">Two counties. One vision.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              LA and OC each run their own trainings, gatherings, and prayer rhythms — close to where people live — and
              labor as one network across the whole metro.
            </p>
          </div>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-bg px-6 py-7 text-center">
                <dt className="order-2 eyebrow">{s.label}</dt>
                <dd className="text-3xl font-light tracking-tight md:text-4xl">{s.n}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
            {hubs.map((h) => (
              <Link key={h.id} to={`/hubs/${h.id}`} className="group bg-bg p-8 transition hover:bg-surface md:p-10">
                <div className="eyebrow">{h.shortName}</div>
                <h3 className="mt-3 text-2xl md:text-3xl">{h.tagline}</h3>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{h.description}</p>
                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {h.regions.slice(0, 4).map((r) => (
                    <span key={r}>{r.replace(/\s*\(.*\)/, '')}</span>
                  ))}
                </div>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Four Fields ── */}
      <section className="border-t border-line bg-elev">
        <div className="container-x grid items-center gap-14 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="eyebrow">The framework</div>
            <h2 className="mt-3 text-3xl md:text-5xl">Four Fields.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              A farmer, a field, a harvest (Mark 4:26–29). One shared picture of the whole process — from empty field to
              reproducing church — and one shared language for what's next.
            </p>
            <ol className="mt-8 divide-y divide-line border-y border-line">
              {fields.map((f) => (
                <li key={f.id} className="flex items-baseline gap-5 py-3.5">
                  <span className="w-6 text-xs text-faint">0{f.number}</span>
                  <span className="w-28 shrink-0 text-sm font-medium">{f.name}</span>
                  <span className="text-sm text-muted">{f.question}</span>
                </li>
              ))}
            </ol>
            <Link to="/four-fields" className="btn-secondary mt-8">
              Learn the Four Fields
            </Link>
          </div>
          <FourFieldsDiagram />
        </div>
      </section>

      {/* ── Starter tools ── */}
      <section className="border-t border-line">
        <div className="container-x py-20 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="eyebrow">Start here</div>
              <h2 className="mt-3 text-3xl md:text-5xl">Three tools for this week.</h2>
              <p className="mt-4 text-muted">Simple enough to learn in an afternoon. Reproducible enough to pass on the same day.</p>
            </div>
            <Link to="/tools" className="btn-ghost">
              All tools <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {starters.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Events ── */}
      <section className="border-t border-line bg-elev">
        <div className="container-x py-20 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Coming up</div>
              <h2 className="mt-3 text-3xl md:text-5xl">Trainings & gatherings.</h2>
            </div>
            <Link to="/events" className="btn-ghost">
              Full calendar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {events.length ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-muted">No upcoming events posted yet.</p>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_120%,var(--glow),transparent_70%)] opacity-40" />
        <div className="container-x relative py-24 text-center md:py-36">
          <div className="eyebrow">Join the network</div>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl md:text-6xl">Ordinary disciples. One vision.</h2>
          <p className="mx-auto mt-6 max-w-lg text-muted">
            No membership, no cost. Tell us where you are and we'll connect you with a practitioner near you.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/connect" className="btn-primary min-w-40">
              Get connected
            </Link>
            <Link to="/vision" className="btn-secondary min-w-40">
              Our vision
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

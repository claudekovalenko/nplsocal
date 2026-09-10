import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { site, hubs, tools, featuredEvents } from '@/content';
import NetworkMap from '@/components/NetworkMap';
import ToolCard from '@/components/ToolCard';
import { FeaturedEvent } from '@/components/EventCard';

const starterSlugs = ['411', '3-circles', '100-list'];

export default function Home() {
  const starters = starterSlugs.map((s) => tools.find((t) => t.slug === s)!);
  const featured = featuredEvents().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_100%,var(--glow),transparent_70%)] opacity-40" />
        <div className="container-x relative z-10 flex flex-col items-center pt-24 text-center md:pt-32">
          <div className="eyebrow fade-up">{site.hashtag} · Los Angeles · Orange County</div>
          <h1 className="fade-up fade-up-2 mt-5 text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">No Place Left.</h1>
          <p className="fade-up fade-up-3 mt-5 text-muted md:text-lg">Tools, regions, and what's next — for everyone in the network.</p>
          <div className="fade-up fade-up-3 mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/three-thirds" className="btn-primary min-w-40">
              Run a 3/3rds
            </Link>
            <Link to="/tools" className="btn-secondary min-w-40">
              Tools
            </Link>
          </div>
        </div>
        <div className="relative z-0 mx-auto mt-4 w-full max-w-3xl flex-1 px-2 md:mt-6">
          <NetworkMap variant="hero" className="h-auto w-full" />
        </div>
        <a href="#next" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-faint transition hover:text-fg md:block" aria-label="Scroll">
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* Next up: network-wide */}
      <section id="next" className="border-t border-line">
        <div className="container-x py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="eyebrow">For everyone</div>
              <h2 className="mt-3 text-3xl md:text-5xl">Next up.</h2>
            </div>
            <Link to="/events" className="btn-ghost">
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <FeaturedEvent key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>

      {/* The format */}
      <section className="border-t border-line bg-elev">
        <div className="container-x grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="eyebrow">The format</div>
            <h2 className="mt-3 text-3xl md:text-5xl">Everything runs on 3/3rds.</h2>
            <p className="mt-4 text-muted">Look back. Look up. Look forward. One pattern for every group, so anyone can lead.</p>
            <div className="mt-8 flex gap-3">
              <Link to="/three-thirds" className="btn-primary">
                Run a meeting
              </Link>
              <Link to="/tools/3-thirds" className="btn-secondary">
                Learn it
              </Link>
            </div>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line">
            {[
              ['Look back', 'Care · Worship · Accountability · Vision'],
              ['Look up', 'Read · Retell · Discuss · Obey'],
              ['Look forward', 'Practice · Goals · Pray'],
            ].map(([t, d], i) => (
              <li key={t} className="flex items-baseline gap-5 bg-bg p-6">
                <span className="w-6 text-xs text-faint">0{i + 1}</span>
                <span>
                  <span className="block text-lg">{t}</span>
                  <span className="block text-sm text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Regions */}
      <section className="border-t border-line">
        <div className="container-x py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-3xl md:text-5xl">Your region.</h2>
            <Link to="/regions" className="btn-ghost">
              Map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
            {hubs.map((h) => (
              <Link key={h.id} to={`/regions/${h.id}`} className="group flex items-end justify-between gap-6 bg-bg p-8 transition hover:bg-surface md:p-10">
                <div>
                  <div className="eyebrow">{h.shortName}</div>
                  <h3 className="mt-3 text-2xl md:text-3xl">{h.tagline}</h3>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="border-t border-line bg-elev">
        <div className="container-x py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-3xl md:text-5xl">Start here.</h2>
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

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_120%,var(--glow),transparent_70%)] opacity-40" />
        <div className="container-x relative py-24 text-center md:py-36">
          <h2 className="mx-auto max-w-2xl text-4xl md:text-6xl">Find your people.</h2>
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

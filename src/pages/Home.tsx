import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { site, featuredEvents } from '@/content';
import NetworkMap from '@/components/NetworkMap';
import { FeaturedEvent } from '@/components/EventCard';

export default function Home() {
  const featured = featuredEvents().slice(0, 4);

  return (
    <>
      {/* Hero */}
      {/* No overflow-hidden: it sliced a hard horizontal line across the
          bottom of the map, where the fade had not finished. */}
      <section className="relative flex flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_100%,var(--glow),transparent_70%)] opacity-40" />
        <div className="container-x relative z-10 flex flex-col items-center pt-24 text-center md:pt-32">
          <div className="eyebrow fade-up">{site.hashtag} · Los Angeles · Orange County</div>
          <h1 className="fade-up fade-up-2 mt-5 text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">No Place Left.</h1>
          <div className="fade-up fade-up-3 mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/gatherings" className="btn-primary min-w-40">
              Gatherings
            </Link>
            <Link to="/tools" className="btn-secondary min-w-40">
              Tools
            </Link>
          </div>
        </div>
        <div className="relative z-0 mx-auto -mb-12 mt-2 w-full max-w-3xl px-2 md:-mb-20 md:mt-4">
          <NetworkMap variant="hero" className="h-auto w-full" />
        </div>
      </section>

      {/* Next up. No top border: the map fades into this section, and a hairline
          there read as a hard cut across the bottom of the map. */}
      <section id="next">
        <div className="container-x py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="eyebrow">For everyone</div>
              <h2 className="mt-3 text-3xl md:text-5xl">Next up.</h2>
            </div>
            <Link to="/gatherings" className="btn-ghost">
              All gatherings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {featured.map((e) => (
              <FeaturedEvent key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

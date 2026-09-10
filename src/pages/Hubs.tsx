import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { hubs } from '@/content';
import NetworkMap from '@/components/NetworkMap';

export default function Hubs() {
  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-16 text-center md:py-24">
          <div className="eyebrow">The network</div>
          <h1 className="mt-4 text-4xl md:text-6xl">Same vision. Same tools. Your neighborhood.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted md:text-lg">
            Two local hubs so practitioners can gather, train, and pray close to where they live — laboring as one
            network across the LA metro.
          </p>
        </div>
        <div className="container-x pb-8">
          <NetworkMap variant="full" className="mx-auto h-auto w-full max-w-4xl" />
          <p className="mt-2 text-center text-xs text-faint">Select a county to open its hub.</p>
        </div>
      </section>

      <section className="container-x py-16 md:py-24">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {hubs.map((h) => (
            <div key={h.id} className="bg-bg p-8 md:p-10">
              <div className="eyebrow">{h.shortName}</div>
              <h2 className="mt-3 text-2xl md:text-3xl">{h.name}</h2>
              <p className="mt-1 text-muted">{h.tagline}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted">{h.description}</p>
              <div className="eyebrow mt-7">Areas</div>
              <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
                {h.regions.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link to={`/hubs/${h.id}`} className="btn-primary">
                  Explore hub <ArrowRight className="h-4 w-4" />
                </Link>
                {h.contactEmail && (
                  <a href={`mailto:${h.contactEmail}`} className="btn-secondary">
                    Email
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          Somewhere else in Southern California — Inland Empire, San Diego, Ventura?{' '}
          <Link to="/connect" className="text-fg underline-offset-4 hover:underline">
            Reach out
          </Link>
          . We'd love to connect you with practitioners near you.
        </p>
      </section>
    </>
  );
}

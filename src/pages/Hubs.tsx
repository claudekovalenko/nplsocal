import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { hubs } from '@/content';
import NetworkMap from '@/components/NetworkMap';

export default function Hubs() {
  return (
    <>
      <section className="border-b border-line">
        <div className="container-x pt-16 text-center md:pt-24">
          <div className="eyebrow">The network</div>
          <h1 className="mt-4 text-4xl md:text-6xl">Your neighborhood.</h1>
        </div>
        <div className="container-x pb-6 pt-6">
          <NetworkMap variant="full" className="mx-auto h-auto w-full max-w-4xl" />
          <p className="mt-2 text-center text-xs text-faint">Select a county.</p>
        </div>
      </section>
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {hubs.map((h) => (
            <Link key={h.id} to={`/regions/${h.id}`} className="group flex items-end justify-between gap-6 bg-bg p-8 transition hover:bg-surface md:p-10">
              <div>
                <div className="eyebrow">{h.shortName}</div>
                <h2 className="mt-3 text-2xl md:text-3xl">{h.tagline}</h2>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" />
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          Somewhere else in SoCal?{' '}
          <Link to="/connect" className="text-fg underline-offset-4 hover:underline">
            Reach out
          </Link>
          .
        </p>
      </section>
    </>
  );
}

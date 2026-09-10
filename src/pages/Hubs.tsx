import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { hubs } from '@/content';
import PageHeader from '@/components/PageHeader';

export default function Hubs() {
  return (
    <>
      <PageHeader
        eyebrow="Hubs"
        title="Same vision. Same tools. Your neighborhood."
        lead="NPL SoCal is organized around two local hubs so practitioners can gather, train, and pray close to where they live. We come together as one SoCal network several times a year."
      />
      <section className="container-x grid gap-6 py-12 md:grid-cols-2">
        {hubs.map((h) => (
          <div key={h.id} className="card relative overflow-hidden p-6 md:p-8">
            <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${h.accent}`} />
            <div className="eyebrow">{h.shortName}</div>
            <h2 className="mt-2 font-display text-2xl font-bold">{h.name}</h2>
            <p className="mt-1 font-medium text-ink-500 dark:text-ink-300">{h.tagline}</p>
            <p className="mt-4 text-sm text-ink-600 dark:text-ink-200">{h.description}</p>
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-400">Areas</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {h.regions.map((r) => (
                  <span key={r} className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-200">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to={`/hubs/${h.id}`} className="btn-secondary">
                Explore hub <ArrowRight className="h-4 w-4" />
              </Link>
              {h.contactEmail && (
                <a href={`mailto:${h.contactEmail}`} className="btn-ghost">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </div>
        ))}
      </section>
      <section className="container-x pb-16">
        <div className="rounded-3xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-300">
          Somewhere else in Southern California — Inland Empire, San Diego, Ventura? <Link to="/connect" className="font-semibold text-sun-600 dark:text-sun-400">Reach out</Link>; we'd love to connect you with practitioners near you.
        </div>
      </section>
    </>
  );
}

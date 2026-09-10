import { Link } from 'react-router-dom';
import { trainings, upcomingEvents } from '@/content';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';
import EventCard from '@/components/EventCard';

export default function Training() {
  const nextTrainings = upcomingEvents().filter((e) => e.type === 'training').slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Training"
        title="From first step to multiplying leader."
        lead="Every training is hands-on, free, and taught by practitioners doing the work in LA and OC right now. Start with the 411, go deeper with 4 Fields, and stay sharp with Iron on Iron."
      />

      <Section>
        <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {trainings.map((t, i) => (
            <li key={t.slug} className="bg-bg p-8 md:p-10">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Step 0{i + 1}</span>
                <span className="text-xs text-faint">{t.length}</span>
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl">{t.name}</h2>
              <p className="mt-1 text-sm text-muted">{t.audience}</p>
              <p className="mt-5 leading-relaxed text-muted">{t.summary}</p>
              <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
                {t.outcomes.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                    <span className="text-muted">{o}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <section className="border-t border-line bg-elev">
        <Section eyebrow="Next up" title="Upcoming trainings.">
          {nextTrainings.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {nextTrainings.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-muted">No trainings scheduled yet — reach out and we'll get one on the calendar near you.</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/connect" className="btn-primary">
              Request a training
            </Link>
            <Link to="/events" className="btn-secondary">
              All events
            </Link>
          </div>
        </Section>
      </section>
    </>
  );
}

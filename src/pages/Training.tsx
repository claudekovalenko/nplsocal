import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users } from 'lucide-react';
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
        title="A clear pathway from first step to multiplying leader."
        lead="Every training is hands-on, free, and taught by practitioners who are doing the work in LA and OC right now. Start with the 411, go deeper with 4 Fields, and stay sharp with Iron on Iron."
      />

      <Section>
        <ol className="relative space-y-6 border-l-2 border-ink-100 pl-6 dark:border-ink-800">
          {trainings.map((t, i) => (
            <li key={t.slug} className="relative">
              <span className="absolute -left-[33px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-sun-500 text-xs font-bold text-white ring-4 ring-sand-50 dark:ring-ink-950">
                {i + 1}
              </span>
              <div className="card p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-300">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t.length}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {t.audience}</span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold">{t.name}</h2>
                <p className="mt-2 text-ink-600 dark:text-ink-200">{t.summary}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {t.outcomes.map((o) => (
                    <div key={o} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <section className="bg-white dark:bg-ink-900">
        <Section eyebrow="Next up" title="Upcoming trainings">
          {nextTrainings.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {nextTrainings.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-ink-500">No trainings scheduled yet — reach out and we'll get one on the calendar near you.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/events" className="btn-ghost">All events</Link>
            <Link to="/connect" className="btn-primary">
              Request a training <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </section>
    </>
  );
}

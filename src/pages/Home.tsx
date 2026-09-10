import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Sparkles, Wrench, CalendarDays, Users } from 'lucide-react';
import { site, hubs, tools, upcomingEvents, fields } from '@/content';
import Section from '@/components/Section';
import FourFieldsDiagram from '@/components/FourFieldsDiagram';
import ToolCard from '@/components/ToolCard';
import EventCard from '@/components/EventCard';

const starterSlugs = ['411', '3-circles', '3-thirds'];

export default function Home() {
  const starters = starterSlugs.map((s) => tools.find((t) => t.slug === s)!);
  const events = upcomingEvents().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(60% 50% at 80% 10%, rgba(249,115,22,0.35), transparent 60%), radial-gradient(50% 40% at 10% 90%, rgba(56,189,248,0.25), transparent 60%)',
          }}
        />
        <div className="container-x relative py-20 md:py-28">
          <div className="eyebrow !text-sun-300">{site.hashtag} · Los Angeles & Orange County</div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {site.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-200">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/training" className="btn-primary">
              Get trained <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/tools" className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15">
              Open the toolbox
            </Link>
            <Link to="/hubs" className="btn bg-transparent text-white hover:bg-white/10">
              <MapPin className="h-4 w-4" /> Find your hub
            </Link>
          </div>
          <blockquote className="mt-12 max-w-xl border-l-2 border-sun-400 pl-4 text-sm text-ink-300">
            "{site.scripture.text}" <span className="text-ink-400">— {site.scripture.ref}</span>
          </blockquote>
        </div>
      </section>

      {/* Quick paths */}
      <section className="container-x -mt-8 relative z-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: '/training', icon: Sparkles, title: 'New here?', text: 'Start with a 411 Training in your hub.' },
            { to: '/tools', icon: Wrench, title: 'Practitioner?', text: 'Every tool, offline, in your pocket.' },
            { to: '/events', icon: CalendarDays, title: 'This month', text: 'Trainings, prayer, and Iron on Iron.' },
          ].map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="card flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="rounded-xl bg-sun-100 p-2 text-sun-700 dark:bg-sun-900/40 dark:text-sun-200">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-ink-500 dark:text-ink-300">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hubs */}
      <Section eyebrow="Two hubs, one vision" title="Rooted locally. Laboring together.">
        <div className="grid gap-4 md:grid-cols-2">
          {hubs.map((h) => (
            <Link
              key={h.id}
              to={`/hubs/${h.id}`}
              className="card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${h.accent}`} />
              <div className="eyebrow">{h.shortName}</div>
              <h3 className="mt-2 font-display text-2xl font-bold">{h.tagline}</h3>
              <p className="mt-3 line-clamp-3 text-sm text-ink-500 dark:text-ink-300">{h.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {h.regions.slice(0, 4).map((r) => (
                  <span key={r} className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-200">
                    {r}
                  </span>
                ))}
                {h.regions.length > 4 && <span className="text-xs text-ink-400">+{h.regions.length - 4} more</span>}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2">
                Explore {h.shortName} <ArrowRight className="h-4 w-4 transition" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Four Fields */}
      <section className="bg-white dark:bg-ink-900">
        <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2">
          <div>
            <div className="eyebrow">The framework</div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Four Fields of Kingdom Growth</h2>
            <p className="mt-4 text-ink-500 dark:text-ink-300">
              Jesus described the kingdom like a farmer and his field (Mark 4:26–29). The Four Fields give every
              practitioner in the network a shared picture of the whole process — from empty field to reproducing
              church — and a shared language for diagnosing what is next.
            </p>
            <ul className="mt-6 space-y-3">
              {fields.map((f) => (
                <li key={f.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white dark:bg-white dark:text-ink-950">
                    {f.number}
                  </span>
                  <span>
                    <span className="font-semibold">{f.name}</span>
                    <span className="text-ink-500 dark:text-ink-300"> — {f.question}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/four-fields" className="btn-secondary mt-8">
              Learn the Four Fields <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <FourFieldsDiagram />
        </div>
      </section>

      {/* Starter tools */}
      <Section eyebrow="Start here" title="Three tools you can use this week" lead="Simple enough to learn in an afternoon. Reproducible enough to pass on the same day.">
        <div className="grid gap-4 md:grid-cols-3">
          {starters.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
        <Link to="/tools" className="btn-ghost mt-6">
          See the whole toolbox
        </Link>
      </Section>

      {/* Events */}
      <section className="bg-white dark:bg-ink-900">
        <Section eyebrow="Coming up" title="Trainings & gatherings">
          {events.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-ink-500">No upcoming events posted yet. Check back soon.</p>
          )}
          <Link to="/events" className="btn-ghost mt-6">
            All events
          </Link>
        </Section>
      </section>

      {/* CTA */}
      <section className="container-x py-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-8 text-white md:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ background: 'radial-gradient(50% 60% at 90% 20%, rgba(249,115,22,0.4), transparent 60%)' }}
          />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <div className="eyebrow !text-sun-300">Join the network</div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
                Ordinary disciples. Extraordinary vision.
              </h2>
              <p className="mt-3 max-w-xl text-ink-200">
                No membership, no cost — just a family of practitioners who pray, go, and multiply together across
                Southern California. Tell us where you are and we will connect you with a coach near you.
              </p>
            </div>
            <Link to="/connect" className="btn-primary">
              <Users className="h-4 w-4" /> Get connected
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

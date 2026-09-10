import { Link } from 'react-router-dom';
import { fields, toolBySlug } from '@/content';
import PageHeader from '@/components/PageHeader';
import FourFieldsDiagram from '@/components/FourFieldsDiagram';
import ToolCard from '@/components/ToolCard';

export default function FourFields() {
  return (
    <>
      <PageHeader
        eyebrow="Mark 4:26–29"
        title="Four Fields of Kingdom Growth"
        lead="A farmer goes to an empty field, sows seed, tends what grows, and gathers a harvest that seeds the next field. Jesus used that picture for the kingdom — and it gives us a whole-process map for making disciples that multiply."
      />

      <section className="container-x grid items-start gap-10 py-12 md:grid-cols-[1fr_1.2fr] md:py-16">
        <div className="md:sticky md:top-24">
          <FourFieldsDiagram />
          <p className="mt-4 text-center text-xs text-ink-400">Tap a field to jump to it.</p>
        </div>
        <div className="space-y-4">
          {fields.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="card flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 font-bold text-white dark:bg-white dark:text-ink-950">
                {f.number}
              </span>
              <span>
                <span className="block font-bold">{f.name}</span>
                <span className="block text-sm text-ink-500 dark:text-ink-300">{f.question}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {fields.map((f, i) => (
        <section
          key={f.id}
          id={f.id}
          className={`scroll-mt-20 ${i % 2 === 0 ? 'bg-white dark:bg-ink-900' : ''}`}
        >
          <div className="container-x py-14">
            <div className="eyebrow">Field {f.number}</div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">{f.name}</h2>
            <p className="mt-1 text-lg font-medium text-ink-500 dark:text-ink-300">{f.question}</p>
            <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
              <p className="text-ink-700 dark:text-ink-200">{f.description}</p>
              <blockquote className="rounded-2xl border-l-4 border-sun-500 bg-sun-50 p-5 text-sm text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                "{f.scripture.text}"
                <footer className="mt-2 text-xs font-semibold text-sun-700 dark:text-sun-300">{f.scripture.ref}</footer>
              </blockquote>
            </div>
            <h3 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink-400">Tools for this field</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {f.toolSlugs.map((s) => {
                const t = toolBySlug(s);
                return t ? <ToolCard key={s} tool={t} /> : null;
              })}
            </div>
          </div>
        </section>
      ))}

      <section className="container-x py-16 text-center">
        <p className="text-ink-500 dark:text-ink-300">Want to learn the whole framework hands-on?</p>
        <Link to="/training" className="btn-primary mt-4">
          Come to a 4 Fields Training
        </Link>
      </section>
    </>
  );
}

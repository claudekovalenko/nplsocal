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
        title="Four Fields of Kingdom Growth."
        lead="A farmer goes to an empty field, sows seed, tends what grows, and gathers a harvest that seeds the next field. Jesus used that picture for the kingdom — and it gives us a whole-process map for making disciples that multiply."
      />

      <section className="container-x grid items-start gap-12 py-16 md:grid-cols-[1fr_1.2fr] md:py-24">
        <div className="md:sticky md:top-24">
          <FourFieldsDiagram />
          <p className="mt-4 text-center text-xs text-faint">Select a field to jump to it.</p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {fields.map((f) => (
            <li key={f.id}>
              <a href={`#${f.id}`} className="group flex items-baseline gap-6 py-5 transition hover:bg-fg/5 md:px-3">
                <span className="w-6 text-xs text-faint">0{f.number}</span>
                <span>
                  <span className="block text-xl">{f.name}</span>
                  <span className="block text-sm text-muted">{f.question}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {fields.map((f, i) => (
        <section key={f.id} id={f.id} className={`scroll-mt-16 border-t border-line ${i % 2 === 0 ? 'bg-elev' : ''}`}>
          <div className="container-x py-16 md:py-24">
            <div className="eyebrow">Field 0{f.number}</div>
            <h2 className="mt-3 text-3xl md:text-5xl">{f.name}</h2>
            <p className="mt-2 text-lg text-muted">{f.question}</p>
            <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
              <p className="text-[17px] leading-relaxed text-muted">{f.description}</p>
              <blockquote className="border-l border-line-strong pl-5 text-sm leading-relaxed text-muted">
                "{f.scripture.text}"
                <footer className="mt-2 text-xs uppercase tracking-[0.18em] text-faint">{f.scripture.ref}</footer>
              </blockquote>
            </div>
            <div className="eyebrow mt-12">Tools for this field</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {f.toolSlugs.map((s) => {
                const t = toolBySlug(s);
                return t ? <ToolCard key={s} tool={t} /> : null;
              })}
            </div>
          </div>
        </section>
      ))}

      <section className="container-x border-t border-line py-20 text-center">
        <p className="text-muted">Want to learn the whole framework hands-on?</p>
        <Link to="/training" className="btn-primary mt-6">
          Come to a 4 Fields Training
        </Link>
      </section>
    </>
  );
}

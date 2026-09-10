import { Link } from 'react-router-dom';
import { faqs } from '@/content';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';

const values = [
  'Scripture is the authority',
  'Prayer is the work',
  'Every believer is a disciple-maker',
  'Obedience over information',
  'Reproduce at every level',
  'Autonomous, interdependent',
];

export default function Vision() {
  return (
    <>
      <PageHeader eyebrow="Romans 15:23" title="A vision, not an organization." lead="Reproducing disciples, churches, and leaders until there is no place left where Christ is not known." />

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="eyebrow">What we are</div>
            <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
              <li className="py-3">A shared vision</li>
              <li className="py-3">Free, reproducible tools</li>
              <li className="py-3">Practitioners who sharpen one another</li>
              <li className="py-3">Two hubs, one network</li>
            </ul>
          </div>
          <div>
            <div className="eyebrow">What we are not</div>
            <ul className="mt-3 divide-y divide-line border-y border-line text-sm text-muted">
              <li className="py-3">A church or denomination</li>
              <li className="py-3">An organization with staff or dues</li>
              <li className="py-3">A funding source</li>
              <li className="py-3">A replacement for your church</li>
            </ul>
          </div>
        </div>
        <p className="mt-12 max-w-2xl text-muted">
          We follow Jesus' pattern in Luke 10 and the apostles' pattern in Acts. We call it the{' '}
          <Link to="/four-fields" className="text-fg underline-offset-4 hover:underline">
            Four Fields
          </Link>
          .
        </p>
      </Section>

      <section className="border-y border-line bg-elev">
        <Section eyebrow="Convictions">
          <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <li key={v} className="bg-bg p-7">
                <span className="eyebrow">0{i + 1}</span>
                <h3 className="mt-2 text-lg">{v}</h3>
              </li>
            ))}
          </ol>
        </Section>
      </section>

      <Section eyebrow="FAQ">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                {f.q}
                <span className="text-faint transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}

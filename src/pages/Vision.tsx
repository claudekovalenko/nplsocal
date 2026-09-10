import { Link } from 'react-router-dom';
import { site, faqs } from '@/content';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';

const values = [
  { title: 'Scripture is the authority', text: 'We do what Jesus and the apostles did, the way they did it — and let the Word, not a method, have the last word.' },
  { title: 'Prayer is the work', text: 'Movements are born in prayer. We pray for laborers, for households of peace, and for the lost by name.' },
  { title: 'Every believer is a disciple-maker', text: 'Not a program for professionals. The tools are simple on purpose so anyone can obey and pass them on.' },
  { title: 'Obedience over information', text: 'We measure what people do with the Word, not how much they know. Every gathering ends with "what will you obey?"' },
  { title: 'Reproduce at every level', text: 'Disciples that make disciples, churches that plant churches, leaders that raise leaders — to the fourth generation and beyond.' },
  { title: 'Autonomous, interdependent', text: 'No hierarchy, no funding conduit. Churches and apostolic teams partner freely around one shared vision.' },
];

export default function Vision() {
  return (
    <>
      <PageHeader eyebrow="What is #NoPlaceLeft?" title="A vision, not an organization." lead={site.vision} />

      <Section>
        <div className="grid gap-14 md:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5 text-[17px] leading-relaxed text-muted">
            <p>
              Paul wrote that "from Jerusalem all the way around to Illyricum I have fulfilled the ministry of the gospel
              of Christ… but now, since I no longer have any room for work in these regions" — literally, since there is{' '}
              <em className="text-fg">no place left</em> — he was ready to move on to Spain (Romans 15:19–24).
            </p>
            <p>
              That is the vision: reproducing disciples, churches, and leaders among the lost until there is no place left
              where Christ is not known. Not a denomination, not a brand, not a program. A movement of movements, with
              ordinary believers learning to do what Jesus and the apostles did.
            </p>
            <p>
              In Southern California that means more than thirteen million people, hundreds of languages, thousands of
              neighborhoods — and far too many who have never had a real conversation about Jesus. NPL SoCal exists so
              disciple-makers across Los Angeles and Orange County can find each other, share the same simple tools,
              sharpen one another, and labor together toward that day.
            </p>
            <p>
              We follow Jesus' pattern in Luke 10 and the apostles' pattern in Acts. We call it the{' '}
              <Link to="/four-fields" className="text-fg underline-offset-4 hover:underline">
                Four Fields
              </Link>
              .
            </p>
          </div>
          <aside className="space-y-8 text-sm">
            <div>
              <div className="eyebrow">What we are not</div>
              <ul className="mt-3 space-y-2 text-muted">
                <li>Not a church or denomination</li>
                <li>Not an organization with staff or dues</li>
                <li>Not a funding source or conduit</li>
                <li>Not a replacement for your local church</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow">What we are</div>
              <ul className="mt-3 space-y-2 text-muted">
                <li>A shared vision (Romans 15:23)</li>
                <li>A shared set of free, reproducible tools</li>
                <li>A family of practitioners who sharpen one another</li>
                <li>Two local hubs, one SoCal network</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <section className="border-y border-line bg-elev">
        <Section eyebrow="Convictions" title="What shapes the way we work.">
          <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="bg-bg p-7">
                <h3 className="text-lg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section eyebrow="FAQ" title="Common questions.">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base">
                {f.q}
                <span className="text-faint transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <Link to="/connect" className="btn-primary mt-10">
          Talk to someone
        </Link>
      </Section>
    </>
  );
}

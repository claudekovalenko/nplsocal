import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { site, faqs } from '@/content';
import PageHeader from '@/components/PageHeader';
import Section from '@/components/Section';

const values = [
  { title: 'Scripture is the authority', text: 'We do what Jesus and the apostles did, the way they did it — and we let the Word, not a method, have the last word.' },
  { title: 'Prayer is the work', text: 'Movements are born in prayer. We pray for laborers, for households of peace, and for the lost by name.' },
  { title: 'Every believer is a disciple-maker', text: 'Not a program for professionals. The tools are simple on purpose so that anyone can obey and pass them on.' },
  { title: 'Obedience over information', text: 'We measure what people do with the Word, not how much they know. Each gathering ends with "what will you obey?"' },
  { title: 'Reproduce at every level', text: 'Disciples that make disciples, churches that plant churches, leaders that raise leaders — to the fourth generation and beyond.' },
  { title: 'Autonomous, interdependent', text: 'No hierarchy, no funding conduit. Churches and apostolic teams partner freely around one shared vision.' },
];

export default function Vision() {
  return (
    <>
      <PageHeader eyebrow="What is #NoPlaceLeft?" title="A vision, not an organization." lead={site.vision} />

      <Section>
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="prose-tight max-w-none text-ink-700 dark:text-ink-200">
            <p>
              Paul wrote to the Romans that "from Jerusalem all the way around to Illyricum I have fulfilled the
              ministry of the gospel of Christ… but now, since I no longer have any room for work in these regions" —
              literally, since there is <em>no place left</em> — he was ready to move on to Spain (Romans 15:19–24).
            </p>
            <p>
              That is the vision: reproducing disciples, churches, and leaders among the lost until there is no place
              left where Christ is not known. Not a new denomination, not a brand, not a program. A movement of
              movements, with ordinary believers learning to do what Jesus and the apostles did.
            </p>
            <p>
              In Southern California that means more than fourteen million people — hundreds of languages, thousands
              of neighborhoods, and far too many who have never had a real conversation about Jesus. NPL SoCal exists so
              that disciple-makers across Los Angeles and Orange County can find each other, share the same simple
              tools, sharpen one another, and labor together toward that day.
            </p>
            <h2 className="mt-8 font-display text-2xl font-bold text-ink-900 dark:text-white">How we do it</h2>
            <p>
              We follow Jesus' pattern in Luke 10 and the apostles' pattern in Acts: pray, go, find the person of peace,
              share the gospel clearly, help new believers obey Jesus in short-term and long-term discipleship, gather
              them into simple biblical churches, and develop leaders at every level. We call this the{' '}
              <Link to="/four-fields" className="font-semibold text-sun-600 underline-offset-2 hover:underline dark:text-sun-400">
                Four Fields
              </Link>
              .
            </p>
          </div>
          <aside className="card h-fit p-6">
            <div className="eyebrow">What we are not</div>
            <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-ink-200">
              <li>· Not a church or denomination</li>
              <li>· Not an organization with staff or dues</li>
              <li>· Not a funding source or conduit</li>
              <li>· Not a replacement for your local church</li>
            </ul>
            <div className="eyebrow mt-6">What we are</div>
            <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-ink-200">
              <li>· A shared vision (Romans 15:23)</li>
              <li>· A shared set of free, reproducible tools</li>
              <li>· A family of practitioners who sharpen one another</li>
              <li>· Two local hubs, one SoCal network</li>
            </ul>
          </aside>
        </div>
      </Section>

      <section className="bg-white dark:bg-ink-900">
        <Section eyebrow="Convictions" title="What shapes the way we work">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-ink-100 p-5 dark:border-ink-800">
                <h3 className="font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{v.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section eyebrow="FAQ" title="Common questions">
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-ink-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 max-w-3xl text-sm text-ink-600 dark:text-ink-200">{f.a}</p>
            </details>
          ))}
        </div>
        <Link to="/connect" className="btn-primary mt-8">
          Talk to someone <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>
    </>
  );
}

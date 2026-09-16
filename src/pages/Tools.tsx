import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Play } from 'lucide-react';
import { tools, fields } from '@/content';
import ToolCard from '@/components/ToolCard';

export default function Tools() {
  const [q, setQ] = useState('');
  const [field, setField] = useState<string>('all');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tools.filter((t) => {
      if (field !== 'all' && t.field !== field) return false;
      if (!needle) return true;
      const hay = [t.name, t.tagline, t.summary, t.description, ...(t.tags ?? [])].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [q, field]);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-16 md:py-24">
          <div className="eyebrow">Tools</div>
          <h1 className="mt-4 text-4xl md:text-6xl">Simple. Reproducible. Yours.</h1>

          {/* Practitioner tools */}
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {[
              { to: '/three-thirds', eyebrow: 'House church', title: 'Run a 3/3rds', text: 'Live meeting guide with timers.', icon: Play },
              { to: '/track', eyebrow: 'Live map', title: 'Tracker', text: 'Groups, churches, generations.', icon: ArrowRight },
              { to: '/my-100', eyebrow: 'Personal', title: 'My 100 List', text: 'The people in your life.', icon: ArrowRight },
              { to: '/four-fields', eyebrow: 'Framework', title: 'Four Fields', text: 'The whole process, one drawing.', icon: ArrowRight },
              { to: '/training', eyebrow: 'Pathway', title: 'Training', text: '411 → 4 Fields → Iron on Iron.', icon: ArrowRight },
            ].map(({ to, eyebrow, title, text, icon: Icon }) => (
              <Link key={to} to={to} className="group bg-bg p-6 transition hover:bg-surface">
                <div className="eyebrow">{eyebrow}</div>
                <div className="mt-3 flex items-center gap-2 text-xl">
                  {title} <Icon className="h-4 w-4 text-faint transition group-hover:text-fg" />
                </div>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-12 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all', name: 'All' }, ...fields].map((f) => (
              <button key={f.id} type="button" onClick={() => setField(f.id)} className={field === f.id ? 'pill-active' : 'pill'}>
                {f.name}
              </button>
            ))}
          </div>
          <label className="relative block md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="field !py-2 !pl-10" />
          </label>
        </div>
        {filtered.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted">No tools match "{q}".</p>
        )}
      </section>
    </>
  );
}

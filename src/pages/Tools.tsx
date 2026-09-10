import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { tools, fields } from '@/content';
import PageHeader from '@/components/PageHeader';
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
      <PageHeader
        eyebrow="Toolbox"
        title="Simple tools that reproduce."
        lead="Everything here is freely given and works offline once opened. Learn a tool, use it this week, then teach it to someone else."
      >
        <div className="mx-auto mt-10 max-w-2xl">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools"
              className="field !pl-10"
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[{ id: 'all', name: 'All' }, ...fields].map((f) => (
              <button key={f.id} type="button" onClick={() => setField(f.id)} className={field === f.id ? 'pill-active' : 'pill'}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="container-x py-12 md:py-16">
        {filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

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
        lead="Everything here is freely given and works offline once you've opened it. Learn a tool, use it this week, then teach it to someone else."
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools…"
              className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200 dark:border-ink-700 dark:bg-ink-950 dark:focus:ring-sun-900"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[{ id: 'all', name: 'All' }, ...fields].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setField(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                field === f.id
                  ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950'
                  : 'bg-ink-50 text-ink-600 hover:bg-ink-100 dark:bg-ink-800 dark:text-ink-200'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </PageHeader>

      <section className="container-x py-10">
        {filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-ink-500">No tools match "{q}".</p>
        )}
      </section>
    </>
  );
}

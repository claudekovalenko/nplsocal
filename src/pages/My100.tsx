import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2, Download, Upload, Lock } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PageHeader from '@/components/PageHeader';

type Stage = 'none' | 'seed' | 'gospel' | 'responded' | 'discipled';

interface Person {
  id: string;
  name: string;
  note: string;
  stage: Stage;
  updated: string;
}

const stages: { id: Stage; label: string; hint: string; color: string }[] = [
  { id: 'none', label: 'Praying', hint: 'No spiritual conversation yet', color: 'bg-ink-200 dark:bg-ink-700' },
  { id: 'seed', label: 'Seed', hint: 'Heard my testimony / something', color: 'bg-emerald-400' },
  { id: 'gospel', label: 'Gospel', hint: 'Heard the gospel clearly', color: 'bg-sun-400' },
  { id: 'responded', label: 'Responded', hint: 'Repented & believed', color: 'bg-sky-400' },
  { id: 'discipled', label: 'Discipled', hint: 'In a group / obeying', color: 'bg-violet-400' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export default function My100() {
  const [people, setPeople] = useLocalStorage<Person[]>('npl:my100', []);
  const [name, setName] = useState('');
  const [filter, setFilter] = useState<Stage | 'all'>('all');

  const counts = useMemo(
    () => stages.map((s) => ({ ...s, n: people.filter((p) => p.stage === s.id).length })),
    [people],
  );

  const add = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    setPeople((p) => [{ id: uid(), name: n, note: '', stage: 'none', updated: new Date().toISOString() }, ...p]);
    setName('');
  };

  const patch = (id: string, data: Partial<Person>) =>
    setPeople((p) => p.map((x) => (x.id === id ? { ...x, ...data, updated: new Date().toISOString() } : x)));

  const remove = (id: string) => setPeople((p) => p.filter((x) => x.id !== id));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(people, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-100-list-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    file.text().then((t) => {
      try {
        const data = JSON.parse(t) as Person[];
        if (Array.isArray(data)) setPeople(data);
      } catch {}
    });
  };

  const visible = people.filter((p) => filter === 'all' || p.stage === filter);

  return (
    <>
      <PageHeader
        eyebrow="Personal tool"
        title="My 100 List"
        lead="The people God has already put in your life. Add names, pray through them, and move each one forward one step at a time."
      >
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-500 dark:bg-ink-800 dark:text-ink-300">
          <Lock className="h-3.5 w-3.5" /> Stored only on this device. Nothing is sent anywhere.
        </p>
      </PageHeader>

      <section className="container-x py-10">
        {/* Progress */}
        <div className="card p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold">{people.length}</span>
            <span className="text-xs text-ink-400">of 100</span>
          </div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            {counts
              .filter((c) => c.n)
              .map((c) => (
                <div key={c.id} className={c.color} style={{ width: `${(c.n / Math.max(people.length, 1)) * 100}%` }} title={`${c.label}: ${c.n}`} />
              ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${filter === 'all' ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-800'}`}>
              All · {people.length}
            </button>
            {counts.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                title={c.hint}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${filter === c.id ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-800'}`}
              >
                <span className={`h-2 w-2 rounded-full ${c.color}`} /> {c.label} · {c.n}
              </button>
            ))}
          </div>
        </div>

        {/* Add */}
        <form onSubmit={add} className="mt-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a name…"
            aria-label="Name"
            className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200 dark:border-ink-700 dark:bg-ink-950 dark:focus:ring-sun-900"
          />
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        {/* List */}
        <ul className="mt-6 space-y-2">
          {visible.length === 0 && (
            <li className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-300">
              {people.length === 0
                ? 'Start with family, then friends, coworkers, neighbors, and the people you see every week.'
                : 'No one in this stage yet.'}
            </li>
          )}
          {visible.map((p) => (
            <li key={p.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    value={p.name}
                    onChange={(e) => patch(p.id, { name: e.target.value })}
                    className="w-full bg-transparent font-semibold outline-none"
                    aria-label="Name"
                  />
                  <input
                    value={p.note}
                    onChange={(e) => patch(p.id, { note: e.target.value })}
                    placeholder="Prayer, next step, what happened…"
                    className="mt-0.5 w-full bg-transparent text-sm text-ink-500 outline-none placeholder:text-ink-300 dark:text-ink-300 dark:placeholder:text-ink-600"
                    aria-label="Note"
                  />
                </div>
                <button onClick={() => remove(p.id)} className="rounded-full p-2 text-ink-300 hover:bg-ink-50 hover:text-rose-500 dark:hover:bg-ink-800" aria-label={`Remove ${p.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stages.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => patch(p.id, { stage: s.id })}
                    title={s.hint}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      p.stage === s.id ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 text-ink-500 hover:bg-ink-100 dark:bg-ink-800 dark:text-ink-300'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${s.color}`} /> {s.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>

        {/* Backup */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={exportJson} className="btn-ghost" disabled={!people.length}>
            <Download className="h-4 w-4" /> Back up
          </button>
          <label className="btn-ghost cursor-pointer">
            <Upload className="h-4 w-4" /> Restore
            <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </label>
        </div>
      </section>
    </>
  );
}

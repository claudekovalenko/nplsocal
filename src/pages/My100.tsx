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

const stages: { id: Stage; label: string; hint: string; opacity: string }[] = [
  { id: 'none', label: 'Praying', hint: 'No spiritual conversation yet', opacity: 'opacity-20' },
  { id: 'seed', label: 'Seed', hint: 'Heard my testimony / something', opacity: 'opacity-40' },
  { id: 'gospel', label: 'Gospel', hint: 'Heard the gospel clearly', opacity: 'opacity-60' },
  { id: 'responded', label: 'Responded', hint: 'Repented & believed', opacity: 'opacity-80' },
  { id: 'discipled', label: 'Discipled', hint: 'In a group / obeying', opacity: 'opacity-100' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export default function My100() {
  const [people, setPeople] = useLocalStorage<Person[]>('npl:my100', []);
  const [name, setName] = useState('');
  const [filter, setFilter] = useState<Stage | 'all'>('all');

  const counts = useMemo(() => stages.map((s) => ({ ...s, n: people.filter((p) => p.stage === s.id).length })), [people]);

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
      <PageHeader eyebrow="Personal tool" title="My 100 List." lead="The people God has already put in your life. Add names, pray through them, and move each one forward a step at a time.">
        <p className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-xs text-faint">
          <Lock className="h-3 w-3" /> Stored only on this device. Nothing is sent anywhere.
        </p>
      </PageHeader>

      <section className="container-x max-w-3xl py-12 md:py-16">
        <div className="flex items-baseline justify-between">
          <span className="text-5xl font-light tracking-tight">{people.length}</span>
          <span className="eyebrow">of 100</span>
        </div>
        <div className="mt-3 flex h-1 overflow-hidden rounded-full bg-line">
          {counts
            .filter((c) => c.n)
            .map((c) => (
              <div key={c.id} className={`bg-fg ${c.opacity}`} style={{ width: `${(c.n / Math.max(people.length, 1)) * 100}%` }} title={`${c.label}: ${c.n}`} />
            ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'pill-active' : 'pill'}>
            All · {people.length}
          </button>
          {counts.map((c) => (
            <button key={c.id} onClick={() => setFilter(c.id)} title={c.hint} className={filter === c.id ? 'pill-active' : 'pill'}>
              {c.label} · {c.n}
            </button>
          ))}
        </div>

        <form onSubmit={add} className="mt-8 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a name" aria-label="Name" className="field" />
          <button type="submit" className="btn-primary shrink-0" disabled={!name.trim()}>
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {visible.length === 0 && (
            <li className="py-12 text-center text-sm text-muted">
              {people.length === 0 ? 'Start with family, then friends, coworkers, neighbors, and the people you see every week.' : 'No one in this stage yet.'}
            </li>
          )}
          {visible.map((p) => (
            <li key={p.id} className="py-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <input value={p.name} onChange={(e) => patch(p.id, { name: e.target.value })} className="w-full bg-transparent text-base outline-none" aria-label="Name" />
                  <input
                    value={p.note}
                    onChange={(e) => patch(p.id, { note: e.target.value })}
                    placeholder="Prayer, next step, what happened"
                    className="mt-0.5 w-full bg-transparent text-sm text-muted outline-none placeholder:text-faint"
                    aria-label="Note"
                  />
                </div>
                <button onClick={() => remove(p.id)} className="p-2 text-faint transition hover:text-fg" aria-label={`Remove ${p.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stages.map((s) => (
                  <button key={s.id} onClick={() => patch(p.id, { stage: s.id })} title={s.hint} className={`${p.stage === s.id ? 'pill-active' : 'pill'} !h-7 !text-[11px]`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={exportJson} className="btn-secondary" disabled={!people.length}>
            <Download className="h-4 w-4" /> Back up
          </button>
          <label className="btn-secondary cursor-pointer">
            <Upload className="h-4 w-4" /> Restore
            <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </label>
        </div>
      </section>
    </>
  );
}

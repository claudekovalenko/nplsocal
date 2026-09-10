import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { emptyGroup, uid, ELEMENTS, type Group } from '@/lib/groups';
import { hubs } from '@/content';

export default function TrackEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const { groups, loading, upsert, remove, canEdit } = useGroups();
  const [g, setG] = useState<Group>(() => ({ ...emptyGroup(), id: uid() }));
  const isNew = !id;

  useEffect(() => {
    if (id) {
      const found = groups.find((x) => x.id === id);
      if (found) setG(found);
    }
  }, [id, groups]);

  const set = <K extends keyof Group>(k: K, v: Group[K]) => setG((x) => ({ ...x, [k]: v }));
  const num = (k: 'attending' | 'believers' | 'baptized') => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Math.max(0, Number(e.target.value) || 0));

  if (!loading && !canEdit) {
    return (
      <section className="container-x py-24 text-center">
        <p className="text-muted">Sign in on the Track page to edit.</p>
        <Link to="/track" className="btn-secondary mt-6">
          Back
        </Link>
      </section>
    );
  }

  const parents = groups.filter((x) => x.id !== g.id);

  return (
    <section className="container-x max-w-2xl py-12 md:py-16">
      <Link to="/track" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Track
      </Link>
      <h1 className="mt-6 text-3xl md:text-5xl">{isNew ? 'New group' : g.name || 'Edit'}</h1>

      <form
        className="mt-10 space-y-8"
        onSubmit={async (e) => {
          e.preventDefault();
          await upsert(g);
          nav('/track');
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="eyebrow">Name</span>
            <input required className="field mt-2" value={g.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Nguyen family, Tuesday night" />
          </label>
          <label className="block">
            <span className="eyebrow">Region</span>
            <select className="field mt-2" value={g.hub} onChange={(e) => set('hub', e.target.value as Group['hub'])}>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.shortName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Area / city</span>
            <input className="field mt-2" value={g.area} onChange={(e) => set('area', e.target.value)} placeholder="Santa Ana" />
          </label>
          <label className="block">
            <span className="eyebrow">Leader</span>
            <input className="field mt-2" value={g.leader} onChange={(e) => set('leader', e.target.value)} />
          </label>
          <label className="block">
            <span className="eyebrow">Started</span>
            <input type="date" className="field mt-2" value={g.started} onChange={(e) => set('started', e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="eyebrow">Came out of</span>
            <select className="field mt-2" value={g.parentId ?? ''} onChange={(e) => set('parentId', e.target.value || null)}>
              <option value="">First generation (no parent)</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || 'Untitled'} · {p.area}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="eyebrow">Status</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['group', 'church'] as const).map((s) => (
              <label key={s} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 text-sm transition ${g.status === s ? 'border-fg' : 'border-line hover:border-line-strong'}`}>
                <input type="radio" name="status" value={s} checked={g.status === s} onChange={() => set('status', s)} className="accent-current" />
                {s === 'group' ? 'Group (dotted)' : 'Church (solid)'}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-5">
          {(['attending', 'believers', 'baptized'] as const).map((k) => (
            <label key={k} className="block">
              <span className="eyebrow">{k}</span>
              <input type="number" min={0} className="field mt-2" value={g[k]} onChange={num(k)} />
            </label>
          ))}
        </div>

        <fieldset>
          <legend className="eyebrow">Acts 2 elements present</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {ELEMENTS.map(([k, label]) => (
              <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2.5 text-sm transition ${g.elements[k] ? 'border-fg' : 'border-line hover:border-line-strong'}`}>
                <input type="checkbox" checked={!!g.elements[k]} onChange={(e) => set('elements', { ...g.elements, [k]: e.target.checked })} className="accent-current" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="eyebrow">Notes</span>
          <textarea rows={3} className="field mt-2" value={g.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Next step, prayer, what's stuck" />
        </label>

        <div className="flex items-center justify-between">
          <button type="submit" className="btn-primary min-w-32">
            Save
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={async () => {
                if (confirm('Remove this group?')) {
                  await remove(g.id);
                  nav('/track');
                }
              }}
              className="btn-ghost text-muted"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

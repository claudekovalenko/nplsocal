import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { emptyInterest, submitInterest, type Interest } from '@/lib/pushStore';

const WANTS = [
  'Come to the push',
  'Get trained',
  'Join a group',
  'Find a coach',
  'Host a team',
  'Just keep me posted',
];

/**
 * The low-commitment door. Someone who is not ready to register but wants to
 * hear more, or who met a team on the street and wants to stay connected.
 * Four fields, because anything longer does not get filled in.
 */
export default function InterestForm({ source, compact = false }: { source: string; compact?: boolean }) {
  const [form, setForm] = useState<Interest>(() => emptyInterest(source));
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  const set = <K extends keyof Interest>(k: K, v: Interest[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (w: string) =>
    setForm((f) => ({ ...f, wants: f.wants.includes(w) ? f.wants.filter((x) => x !== w) : [...f.wants, w] }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');
    await submitInterest(form);
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-accent" strokeWidth={1.5} />
        <h3 className="mt-4 text-2xl">We've got you.</h3>
        <p className="mt-2 text-sm text-muted">Someone from your area will reach out.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-5' : 'card space-y-6 p-6 md:p-8'}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Name</span>
          <input required className="field mt-2" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
        </label>
        <label className="block">
          <span className="eyebrow">Email or phone</span>
          <input
            required
            className="field mt-2"
            value={form.email || form.phone}
            onChange={(e) => {
              const v = e.target.value;
              // One box, because asking for both loses people. Route it by shape.
              if (v.includes('@')) {
                set('email', v);
                set('phone', '');
              } else {
                set('phone', v);
                set('email', '');
              }
            }}
          />
        </label>
        <label className="block">
          <span className="eyebrow">City</span>
          <input className="field mt-2" value={form.city} onChange={(e) => set('city', e.target.value)} />
        </label>
        <label className="block">
          <span className="eyebrow">Church / Network</span>
          <input className="field mt-2" value={form.church} onChange={(e) => set('church', e.target.value)} />
        </label>
      </div>

      <fieldset>
        <legend className="eyebrow">What are you after?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {WANTS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => toggle(w)}
              aria-pressed={form.wants.includes(w)}
              className={form.wants.includes(w) ? 'pill-active' : 'pill'}
            >
              {w}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn-primary min-w-40" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Keep me posted'}
      </button>
    </form>
  );
}

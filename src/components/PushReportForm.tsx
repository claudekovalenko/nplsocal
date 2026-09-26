import { useState, type FormEvent } from 'react';
import { CheckCircle2, CloudOff } from 'lucide-react';
import { dayLabel } from '@/lib/format';
import { emptyReport, submitReport, type PushReport } from '@/lib/pushStore';
import { LIMITS } from '@/lib/limits';

const COUNTS: { key: keyof PushReport; label: string; hint: string }[] = [
  { key: 'conversations', label: 'Conversations', hint: 'Spiritual conversations started' },
  { key: 'gospelShared', label: 'Gospel shared', hint: 'Heard the whole gospel' },
  { key: 'responded', label: 'Responded', hint: 'Repented and believed' },
  { key: 'baptized', label: 'Baptized', hint: '' },
  { key: 'groupsStarted', label: 'Groups started', hint: '' },
];

/**
 * End-of-day report from a team in the field. Short on purpose: five numbers
 * and two optional boxes, so it can be filled in standing on a sidewalk.
 */
export default function PushReportForm({ eventId, days }: { eventId: string; days: string[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<PushReport>(() =>
    emptyReport(eventId, days.includes(today) ? today : days[0]),
  );
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'queued'>('idle');

  const set = <K extends keyof PushReport>(k: K, v: PushReport[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (k: keyof PushReport) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Math.max(0, Number(e.target.value) || 0) as never);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');
    const { queued } = await submitReport(form);
    setState(queued ? 'queued' : 'sent');
  };

  if (state === 'sent' || state === 'queued') {
    return (
      <div className="card p-8 text-center">
        {state === 'sent' ? (
          <CheckCircle2 className="mx-auto h-8 w-8 text-accent" strokeWidth={1.5} />
        ) : (
          <CloudOff className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
        )}
        <h3 className="mt-4 text-2xl">{state === 'sent' ? 'Report received.' : 'Saved on your phone.'}</h3>
        <p className="mt-2 text-sm text-muted">
          {state === 'sent'
            ? 'It is counted in the totals above.'
            : 'No signal right now. It will send by itself the next time you report.'}
        </p>
        <button
          className="btn-secondary mt-6"
          onClick={() => {
            setForm(emptyReport(eventId, form.day));
            setState('idle');
          }}
        >
          Report another day
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-7 p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="eyebrow">Day</span>
          <select className="field mt-2" value={form.day} onChange={(e) => set('day', e.target.value)}>
            {days.map((d) => (
              <option key={d} value={d}>
                {dayLabel(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Your name</span>
          <input required className="field mt-2" value={form.reporter} onChange={(e) => set('reporter', e.target.value)} maxLength={LIMITS.reporter} />
        </label>
        <label className="block">
          <span className="eyebrow">Team or area</span>
          <input className="field mt-2" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="South LA" maxLength={LIMITS.area} />
        </label>
      </div>

      <fieldset>
        <legend className="eyebrow">Today's numbers</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {COUNTS.map((c) => (
            <label key={String(c.key)} className="block">
              <span className="block text-sm">{c.label}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                className="field mt-1.5 text-center text-lg"
                max={LIMITS.count}
                value={form[c.key] as number}
                onChange={num(c.key)}
              />
              {c.hint && <span className="mt-1 block text-[11px] leading-tight text-faint">{c.hint}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="eyebrow">A story worth telling</span>
        <textarea
          rows={3}
          className="field mt-2"
          maxLength={LIMITS.story}
          value={form.story}
          onChange={(e) => set('story', e.target.value)}
          placeholder="Who did you meet? What happened?"
        />
      </label>

      <label className="block">
        <span className="eyebrow">Anything to pray for</span>
        <textarea rows={2} className="field mt-2" maxLength={LIMITS.prayer} value={form.prayer} onChange={(e) => set('prayer', e.target.value)} />
      </label>

      <button type="submit" className="btn-primary min-w-40" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send report'}
      </button>
    </form>
  );
}

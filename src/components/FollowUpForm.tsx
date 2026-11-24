import { useState, type FormEvent } from 'react';
import { Copy, Mail, Minus, Plus, Phone, Trash2, UserPlus } from 'lucide-react';
import { dayLabel, isoDay } from '@/lib/format';
import { followUp, type LightKey } from '@/content/push';
import { emptyLog, emptyPerson, followUpMessage, isBlank, type FieldLog, type FollowUp } from '@/lib/followUpStore';
import { LIMITS } from '@/lib/limits';

const DOT: Record<LightKey, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
};

function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const clamp = (n: number) => Math.max(0, Math.min(LIMITS.count, n));
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:mt-2">
      <button type="button" className="btn-ghost !px-3" onClick={() => onChange(clamp(value - 1))} aria-label={`One fewer ${label}`}>
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={0}
        max={LIMITS.count}
        inputMode="numeric"
        aria-label={label}
        className="field !w-16 text-center text-lg"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
      />
      <button type="button" className="btn-ghost !px-3" onClick={() => onChange(clamp(value + 1))} aria-label={`One more ${label}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function PersonCard({
  n,
  person,
  onChange,
  onRemove,
}: {
  n: number;
  person: FollowUp;
  onChange: (p: FollowUp) => void;
  onRemove?: () => void;
}) {
  const set = <K extends keyof FollowUp>(k: K, v: FollowUp[K]) => onChange({ ...person, [k]: v });
  const toggle = (w: string) =>
    set('wants', person.wants.includes(w) ? person.wants.filter((x) => x !== w) : [...person.wants, w]);
  // Phone is what makes a follow-up possible, so it is required once a card is in use.
  const needsPhone = !isBlank(person);

  return (
    <div className="rounded-xl border border-line p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Person {n}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="btn-ghost !px-2 !py-1 text-xs" aria-label={`Remove person ${n}`}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1.3fr_1fr]">
        <label className="block">
          <span className="flex items-center gap-1.5 text-sm">
            <Phone className="h-3.5 w-3.5 text-accent" /> Phone number
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="off"
            required={needsPhone}
            placeholder="(555) 555-5555"
            className="field mt-1.5 text-lg"
            maxLength={LIMITS.phone}
            value={person.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm">
            First name <span className="text-faint">(optional)</span>
          </span>
          <input
            className="field mt-1.5"
            autoComplete="off"
            maxLength={LIMITS.name}
            value={person.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm">What do they want?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {followUp.wants.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => toggle(w)}
              aria-pressed={person.wants.includes(w)}
              className={person.wants.includes(w) ? 'pill-active' : 'pill'}
            >
              {w}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="text-sm">In a sentence or two, what did they ask for?</span>
        <textarea
          rows={2}
          className="field mt-1.5"
          maxLength={LIMITS.followUpNote}
          value={person.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="e.g. Wants to read the Bible with her sister on Tuesday nights. Speaks Spanish."
        />
      </label>
    </div>
  );
}

/**
 * Follow-ups from the field. Built to be filled in on a sidewalk: pick the
 * region, tap in the lights if you counted them, and get phone numbers down
 * before anything else.
 */
export default function FollowUpForm({ days }: { days: string[] }) {
  // Pacific, not UTC: reports come in after 4pm, when UTC is already tomorrow.
  const today = isoDay(new Date().toISOString());
  const firstDay = days.includes(today) ? today : days[0];
  const [form, setForm] = useState<FieldLog>(() => emptyLog(firstDay));
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FieldLog>(k: K, v: FieldLog[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setPerson = (i: number, p: FollowUp) =>
    setForm((f) => ({ ...f, people: f.people.map((x, j) => (j === i ? p : x)) }));
  const removePerson = (i: number) => setForm((f) => ({ ...f, people: f.people.filter((_, j) => j !== i) }));
  const addPerson = () =>
    setForm((f) => (f.people.length >= LIMITS.people ? f : { ...f, people: [...f.people, emptyPerson()] }));

  const people = form.people.filter((p) => !isBlank(p));
  const lights = form.red + form.yellow + form.green;
  const message = followUpMessage(form);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!people.length && !lights) {
      setError('Add a phone number or count at least one light before sending.');
      return;
    }
    setError('');
    // Hand off to the phone's email app with everything written out.
    window.location.href = message.mailto;
    setOpened(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${message.subject}\n\n${message.body}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (opened) {
    return (
      <div className="card p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-accent" strokeWidth={1.5} />
        <h3 className="mt-4 text-2xl">Now hit send in your email.</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Your email app opened with the follow-up written out to {followUp.sendTo}. It is not sent until you press send
          there.
        </p>
        <pre className="mx-auto mt-6 max-w-md whitespace-pre-wrap rounded-xl border border-line bg-bg p-4 text-left text-xs leading-relaxed text-muted">
          {message.body}
        </pre>
        <p className="mt-4 text-xs text-faint">Email app didn't open? Copy this and send it to {followUp.sendTo}.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={message.mailto} className="btn-secondary">
            <Mail className="h-4 w-4" /> Open email again
          </a>
          <button type="button" onClick={copy} className="btn-secondary">
            <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy message'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              // Keep where you are and who you are; clear the rest.
              setForm({ ...emptyLog(form.day), region: form.region, area: form.area, foundBy: form.foundBy });
              setOpened(false);
              setCopied(false);
            }}
          >
            Log more
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-8 p-6 md:p-8">
      {/* Where */}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Region you were in</span>
          <select required className="field mt-2" value={form.region} onChange={(e) => set('region', e.target.value)}>
            <option value="" disabled>
              Choose a region
            </option>
            {followUp.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Neighborhood or street</span>
          <input
            className="field mt-2"
            placeholder="e.g. Koreatown, Western & 6th"
            maxLength={LIMITS.area}
            value={form.area}
            onChange={(e) => set('area', e.target.value)}
          />
        </label>
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
          <input
            className="field mt-2"
            autoComplete="name"
            maxLength={LIMITS.reporter}
            value={form.foundBy}
            onChange={(e) => set('foundBy', e.target.value)}
            placeholder="So the follow-up team can ask you"
          />
        </label>
      </div>

      {/* Lights */}
      <fieldset>
        <legend className="eyebrow">Lights you found (optional)</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {followUp.lights.map((l) => (
            <div key={l.key} className="flex items-center justify-between gap-3 rounded-xl border border-line p-4 sm:block">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${DOT[l.key]}`} aria-hidden /> {l.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-faint">{l.hint}</div>
              </div>
              <Stepper label={l.label} value={form[l.key]} onChange={(n) => set(l.key, n)} />
            </div>
          ))}
        </div>
      </fieldset>

      {/* People */}
      <fieldset>
        <legend className="eyebrow">People to follow up with</legend>
        <p className="mt-1 text-sm text-muted">Get the phone number first. Everything else is a bonus.</p>
        <div className="mt-4 space-y-4">
          {form.people.map((p, i) => (
            <PersonCard
              key={i}
              n={i + 1}
              person={p}
              onChange={(np) => setPerson(i, np)}
              onRemove={form.people.length > 1 ? () => removePerson(i) : undefined}
            />
          ))}
        </div>
        {form.people.length < LIMITS.people && (
          <button type="button" onClick={addPerson} className="btn-secondary mt-4">
            <UserPlus className="h-4 w-4" /> Add another person
          </button>
        )}
      </fieldset>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <button type="submit" className="btn-primary min-w-40">
          <Mail className="h-4 w-4" />
          {people.length ? `Send ${people.length} follow-up${people.length > 1 ? 's' : ''}` : 'Send'}
        </button>
        <p className="mt-2 text-xs text-faint">Opens your email, written out to {followUp.sendTo}.</p>
      </div>
    </form>
  );
}

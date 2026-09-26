import { useState, type FormEvent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { events, site, hubById } from '@/content';
import { formatRange, eventDays, dayLabel } from '@/lib/format';
import { emptyRegistration, uid, type Registration } from '@/lib/registrations';
import { LIMITS } from '@/lib/limits';
import { useRegistrations } from '@/hooks/useRegistrations';

export default function Register() {
  const { eventId = '' } = useParams();
  const event = events.find((e) => e.id === eventId);
  const { store, add } = useRegistrations(eventId);
  const [form, setForm] = useState<Registration>(() => emptyRegistration(eventId));
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return <Navigate to="/events" replace />;

  const days = eventDays(event.start, event.end);
  const multiDay = days.length > 1;
  const toggleDay = (d: string) =>
    setForm((f) => ({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort() }));

  const set = <K extends keyof Registration>(k: K, v: Registration[K]) => setForm((f) => ({ ...f, [k]: v }));
  const text = (k: keyof Registration) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(k, e.target.value as never);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const reg: Registration = { ...form, id: uid(), eventId, createdAt: new Date().toISOString() };
    try {
      await add(reg);
      // Until a shared database is connected, also send it to the organizer
      // so a sign-up never sits unseen on someone's phone.
      if (store.kind === 'local') {
        const body = [
          `Event: ${event.title}`,
          `Name: ${reg.name}`,
          `Party size: ${reg.party}`,
          `Email: ${reg.email}`,
          `Phone: ${reg.phone}`,
          `City: ${reg.city}`,
          `Church / network: ${reg.church}`,
          reg.days.length ? `Days: ${reg.days.map(dayLabel).join(', ')}` : '',
          reg.notes ? `Notes: ${reg.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(
          `[NPL SoCal] Registration: ${event.title}`,
        )}&body=${encodeURIComponent(body)}`;
      }
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <section className="container-x max-w-xl py-20 text-center md:py-28">
        <CheckCircle2 className="mx-auto h-9 w-9 text-accent" strokeWidth={1.5} />
        <h1 className="mt-6 text-3xl md:text-4xl">You're registered.</h1>
        <p className="mt-4 text-muted">
          {form.name}, we have you down for {event.title}
          {form.party > 1 ? ` with ${form.party - 1} other${form.party > 2 ? 's' : ''}` : ''}. We'll be in touch at{' '}
          {form.email}.
        </p>
        {store.kind === 'local' && (
          <p className="mt-4 text-xs text-faint">
            Your email app should have opened with the details. If it didn't, send them to {site.contact.email}.
          </p>
        )}
      </section>
    );
  }

  const hub = hubById(event.hub);

  return (
    <section className="container-x max-w-2xl py-12 md:py-16">
      {/* No way back on purpose: this link is sent to someone whose only job is
          to fill the form in. A return link goes in once there is somewhere
          useful to send them. */}
      <div className="eyebrow">Register · {hub ? hub.shortName : 'All SoCal'}</div>
      <h1 className="mt-3 text-4xl md:text-5xl">{event.title}</h1>
      <p className="mt-3 text-muted">
        {event.dateLabel ?? formatRange(event.start, event.end)} · {event.city ?? event.location}
      </p>

      <form onSubmit={submit} className="mt-10 space-y-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="eyebrow">Your name</span>
            <input required className="field mt-2" value={form.name} onChange={text('name')} autoComplete="name" maxLength={LIMITS.name} />
          </label>
          <label className="block">
            <span className="eyebrow">Email</span>
            <input required type="email" className="field mt-2" value={form.email} onChange={text('email')} autoComplete="email" maxLength={LIMITS.email} />
          </label>
          <label className="block">
            <span className="eyebrow">Phone</span>
            <input required type="tel" className="field mt-2" value={form.phone} onChange={text('phone')} autoComplete="tel" maxLength={LIMITS.phone} />
          </label>
          <label className="block">
            <span className="eyebrow">How many in your party?</span>
            <input
              required
              type="number"
              min={1}
              max={LIMITS.partyForm}
              className="field mt-2"
              value={form.party}
              onChange={(e) => set('party', Math.max(1, Number(e.target.value) || 1))}
            />
            <span className="mt-1 block text-xs text-faint">Including you.</span>
          </label>
          <label className="block">
            <span className="eyebrow">City</span>
            <input required className="field mt-2" value={form.city} onChange={text('city')} placeholder="Santa Ana" maxLength={LIMITS.city} />
          </label>
          <label className="block sm:col-span-2">
            <span className="eyebrow">Church / Network</span>
            <input
              required
              className="field mt-2"
              value={form.church}
              onChange={text('church')}
              maxLength={LIMITS.church}
              placeholder="Grace Fullerton, NPL SoCal, or both"
            />
          </label>
          {multiDay && (
            <fieldset className="sm:col-span-2">
              <legend className="eyebrow">Which days can you come?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    aria-pressed={form.days.includes(d)}
                    className={form.days.includes(d) ? 'pill-active' : 'pill'}
                  >
                    {dayLabel(d)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, days: f.days.length === days.length ? [] : [...days] }))}
                  className="pill"
                >
                  {form.days.length === days.length ? 'Clear' : 'All days'}
                </button>
              </div>
              <span className="mt-2 block text-xs text-faint">
                {event.dateLabel
                  ? 'Dates are still being confirmed — pick what looks likely and we will follow up.'
                  : 'Pick every day you expect to be there.'}
              </span>
            </fieldset>
          )}

          <label className="block sm:col-span-2">
            <span className="eyebrow">Anything else?</span>
            <textarea rows={3} className="field mt-2" maxLength={LIMITS.notes} value={form.notes} onChange={text('notes')} placeholder="Questions, dietary needs, arrival time" />
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-primary min-w-40" disabled={busy}>
            {busy ? 'Sending…' : 'Register'}
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-faint">
            <Lock className="h-3 w-3" /> Only the organizers see your details.
          </span>
        </div>
      </form>
    </section>
  );
}

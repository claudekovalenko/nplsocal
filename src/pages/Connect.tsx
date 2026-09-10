import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { site, hubs } from '@/content';
import PageHeader from '@/components/PageHeader';

type Interest = 'training' | 'coach' | 'practitioner' | 'host' | 'other';

const interests: { id: Interest; label: string }[] = [
  { id: 'training', label: 'I want to get trained' },
  { id: 'coach', label: 'I want a coach' },
  { id: 'practitioner', label: "I'm a practitioner — connect me" },
  { id: 'host', label: 'I want to host a training or event' },
  { id: 'other', label: 'Something else' },
];

export default function Connect() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', hub: '', interest: 'training' as Interest, message: '' });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  /**
   * Framework default: opens the user's mail client with a pre-filled message.
   * Swap for a form backend (Netlify Forms, Formspree, Supabase, Airtable) — see README.
   */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const hub = hubs.find((h) => h.id === form.hub);
    const to = hub?.contactEmail ?? site.contact.email;
    const subject = encodeURIComponent(`[NPL SoCal] ${interests.find((i) => i.id === form.interest)?.label ?? 'Contact'}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nHub: ${hub?.shortName ?? 'Not sure'}\n\n${form.message}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Connect"
        title="Tell us where you are."
        lead="Someone from your hub will reach out."
      />
      <section className="container-x grid gap-14 py-14 md:grid-cols-[1.4fr_1fr] md:py-20">
        {sent ? (
          <div className="card flex flex-col items-center p-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-accent" strokeWidth={1.5} />
            <h2 className="mt-5 text-2xl">Your email client should have opened.</h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              If it didn't, write to {site.contact.email} with your name, city, and what you're looking for.
            </p>
            <button className="btn-secondary mt-8" onClick={() => setSent(false)}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="eyebrow">Name</span>
                <input required className="field mt-2" value={form.name} onChange={update('name')} autoComplete="name" />
              </label>
              <label className="block">
                <span className="eyebrow">Email</span>
                <input required type="email" className="field mt-2" value={form.email} onChange={update('email')} autoComplete="email" />
              </label>
            </div>
            <label className="block">
              <span className="eyebrow">Closest hub</span>
              <select className="field mt-2" value={form.hub} onChange={update('hub')}>
                <option value="">Not sure / somewhere else</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortName}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="eyebrow">What are you looking for?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {interests.map((i) => (
                  <label
                    key={i.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 text-sm transition ${
                      form.interest === i.id ? 'border-fg' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <input type="radio" name="interest" value={i.id} checked={form.interest === i.id} onChange={update('interest')} className="accent-current" />
                    {i.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="eyebrow">Anything else?</span>
              <textarea rows={4} className="field mt-2" value={form.message} onChange={update('message')} placeholder="Your city, your church, how you heard about NPL" />
            </label>
            <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-40">
              Send
            </button>
          </form>
        )}

        <aside className="space-y-10 text-sm">
          <div>
            <div className="eyebrow">Direct</div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              <li className="flex items-center justify-between py-3">
                <span className="text-muted">SoCal</span>
                <a href={`mailto:${site.contact.email}`} className="transition hover:text-accent">
                  {site.contact.email}
                </a>
              </li>
              {hubs.map((h) =>
                h.contactEmail ? (
                  <li key={h.id} className="flex items-center justify-between py-3">
                    <span className="text-muted">{h.shortName}</span>
                    <a href={`mailto:${h.contactEmail}`} className="transition hover:text-accent">
                      {h.contactEmail}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}

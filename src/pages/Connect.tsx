import { useState, type FormEvent } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { site, hubs } from '@/content';
import PageHeader from '@/components/PageHeader';

type Interest = 'training' | 'coach' | 'practitioner' | 'host' | 'other';

const interests: { id: Interest; label: string }[] = [
  { id: 'training', label: 'I want to get trained' },
  { id: 'coach', label: 'I want a coach' },
  { id: 'practitioner', label: "I'm a practitioner — connect me to a hub" },
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
   * Swap this for a form backend (Netlify Forms, Formspree, Supabase, Airtable)
   * when the network picks one — see README.
   */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const hub = hubs.find((h) => h.id === form.hub);
    const to = hub?.contactEmail ?? site.contact.email;
    const subject = encodeURIComponent(`[NPL SoCal] ${interests.find((i) => i.id === form.interest)?.label ?? 'Contact'}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nHub: ${hub?.shortName ?? 'Not sure'}\n\n${form.message}`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const input =
    'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200 dark:border-ink-700 dark:bg-ink-950 dark:focus:ring-sun-900';

  return (
    <>
      <PageHeader
        eyebrow="Connect"
        title="Tell us where you are. We'll find you a coach."
        lead="Whether you're brand new or already working the fields, the next step is a real person in your area. Fill this out and someone from your hub will reach out."
      />
      <section className="container-x grid gap-10 py-12 md:grid-cols-[1.3fr_1fr]">
        {sent ? (
          <div className="card flex flex-col items-center p-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h2 className="mt-4 font-display text-2xl font-bold">Your email client should have opened.</h2>
            <p className="mt-2 max-w-md text-sm text-ink-500 dark:text-ink-300">
              If it didn't, just write to {site.contact.email} with your name, city, and what you're looking for.
            </p>
            <button className="btn-ghost mt-6" onClick={() => setSent(false)}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-5 p-6 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Name
                <input required className={`${input} mt-1.5`} value={form.name} onChange={update('name')} autoComplete="name" />
              </label>
              <label className="block text-sm font-medium">
                Email
                <input required type="email" className={`${input} mt-1.5`} value={form.email} onChange={update('email')} autoComplete="email" />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Closest hub
              <select className={`${input} mt-1.5`} value={form.hub} onChange={update('hub')}>
                <option value="">Not sure / somewhere else</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.shortName}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="text-sm font-medium">What are you looking for?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {interests.map((i) => (
                  <label
                    key={i.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      form.interest === i.id
                        ? 'border-sun-400 bg-sun-50 dark:bg-sun-900/20'
                        : 'border-ink-200 dark:border-ink-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interest"
                      value={i.id}
                      checked={form.interest === i.id}
                      onChange={update('interest')}
                      className="accent-sun-500"
                    />
                    {i.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-medium">
              Anything else?
              <textarea rows={4} className={`${input} mt-1.5`} value={form.message} onChange={update('message')} placeholder="Your city, your church, how you heard about NPL…" />
            </label>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        )}

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="eyebrow">Direct</div>
            <a href={`mailto:${site.contact.email}`} className="mt-3 flex items-center gap-2 text-sm font-semibold hover:text-sun-600 dark:hover:text-sun-400">
              <Mail className="h-4 w-4" /> {site.contact.email}
            </a>
            <ul className="mt-4 space-y-2 text-sm">
              {hubs.map((h) =>
                h.contactEmail ? (
                  <li key={h.id} className="flex items-center justify-between">
                    <span className="text-ink-500 dark:text-ink-300">{h.shortName}</span>
                    <a href={`mailto:${h.contactEmail}`} className="font-medium hover:text-sun-600 dark:hover:text-sun-400">
                      {h.contactEmail}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
          <div className="card p-5 text-sm text-ink-600 dark:text-ink-200">
            <div className="eyebrow">What happens next</div>
            <ol className="mt-3 list-decimal space-y-1.5 pl-4">
              <li>A practitioner from your hub replies, usually within a few days.</li>
              <li>You'll be invited to the next 411 Training or Iron on Iron.</li>
              <li>You start your 100 List and begin praying and sharing.</li>
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}

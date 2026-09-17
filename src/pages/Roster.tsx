import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Search, Trash2, Lock, Wifi, HardDrive } from 'lucide-react';
import { events, hubById } from '@/content';
import { formatRange, formatDate, eventDays, dayLabel } from '@/lib/format';
import { countBy, fromCsv, peoplePerDay, toCsv, totalPeople } from '@/lib/registrations';
import { useRegistrations } from '@/hooks/useRegistrations';

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  if (!rows.length) return null;
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
        {rows.slice(0, 8).map(([label, n]) => (
          <li key={label} className="flex items-center justify-between py-2.5">
            <span>{label}</span>
            <span className="text-muted">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Roster() {
  const { eventId } = useParams();
  const { store, rows, loading, error, addMany, remove, user, canRead } = useRegistrations(eventId);
  const [q, setQ] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const event = events.find((e) => e.id === eventId);

  const days = event ? eventDays(event.start, event.end) : [];
  const perDay = days.length > 1 ? peoplePerDay(rows, days) : [];

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return rows;
    return rows.filter((r) => [r.name, r.email, r.phone, r.city, r.church].join(' ').toLowerCase().includes(n));
  }, [rows, q]);

  const download = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event ? event.id : 'registrations'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = (file: File) => {
    file.text().then(async (t) => {
      const parsed = fromCsv(t, eventId ?? '');
      if (parsed.length) await addMany(parsed);
    });
  };

  // Index page: one card per event with counts.
  if (!eventId) {
    return (
      <section className="container-x py-12 md:py-16">
        <div className="eyebrow">Rosters</div>
        <h1 className="mt-3 text-4xl md:text-5xl">Who's coming.</h1>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {events.map((e) => {
            const mine = rows.filter((r) => r.eventId === e.id);
            return (
              <li key={e.id}>
                <Link to={`/roster/${e.id}`} className="flex items-center justify-between gap-4 py-4 transition hover:bg-fg/5 md:px-2">
                  <div>
                    <div className="text-base">{e.title}</div>
                    <div className="text-sm text-muted">
                      {e.dateLabel ?? formatDate(e.start)} · {hubById(e.hub)?.shortName ?? 'All SoCal'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-light tracking-tight">{totalPeople(mine)}</div>
                    <div className="eyebrow">People</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="container-x py-12 md:py-16">
      <Link to="/roster" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> All rosters
      </Link>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="eyebrow">Roster</div>
          <h1 className="mt-3 text-3xl md:text-5xl">{event ? event.title : 'Registrations'}</h1>
          {event && <p className="mt-2 text-muted">{event.dateLabel ?? formatRange(event.start, event.end)}</p>}
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-faint">
          {store.kind === 'shared' ? <Wifi className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
          {store.kind === 'shared' ? 'Shared · live' : 'This device only'}
        </span>
      </div>

      {store.auth && !user && (
        <div className="card mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 text-sm text-muted">
            <Lock className="h-4 w-4" /> Sign in to see who registered.
          </span>
          {sent ? (
            <span className="text-sm">Check your email for a sign-in link.</span>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                await store.auth!.signIn(email);
                setSent(true);
              }}
            >
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="field !py-2 sm:w-56" />
              <button className="btn-secondary !h-9">Send link</button>
            </form>
          )}
        </div>
      )}

      {canRead && (
        <>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {[
              ['People', totalPeople(rows)],
              ['Sign-ups', rows.length],
              ['Church / network', countBy(rows, 'church').length],
              ['Cities', countBy(rows, 'city').length],
            ].map(([label, n]) => (
              <div key={String(label)} className="bg-bg px-5 py-6 text-center">
                <dd className="text-3xl font-light tracking-tight md:text-4xl">{n}</dd>
                <dt className="eyebrow mt-1">{label}</dt>
              </div>
            ))}
          </dl>

          {perDay.length > 0 && (
            <div className="mt-10">
              <div className="eyebrow">People per day</div>
              <ul className="mt-3 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
                {perDay.map(([day, n]) => (
                  <li key={day} className="bg-bg px-4 py-4 text-center">
                    <div className="text-2xl font-light tracking-tight">{n}</div>
                    <div className="mt-0.5 text-xs text-muted">{dayLabel(day)}</div>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-faint">Anyone who did not pick days is counted on every day.</p>
            </div>
          )}

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Breakdown title="By church / network" rows={countBy(rows, 'church')} />
            <Breakdown title="By city" rows={countBy(rows, 'city')} />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
            <label className="relative block w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, church, city" className="field !py-2 !pl-10" />
            </label>
            <div className="flex gap-2">
              <button onClick={download} className="btn-secondary" disabled={!filtered.length}>
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <label className="btn-secondary cursor-pointer">
                <Upload className="h-4 w-4" /> Import CSV
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            </div>
          </div>

          {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

          {loading ? (
            <p className="py-16 text-center text-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-muted">
              {rows.length ? 'Nobody matches that search.' : 'No sign-ups yet. Import a CSV to bring in the people who already registered.'}
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-line text-left">
                    {['Name', 'Party', 'Contact', 'City', 'Church / Network', ''].map((h) => (
                      <th key={h} className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-line align-top">
                      <td className="py-3 pr-4">
                        {r.name}
                        {r.days.length > 0 && (
                          <div className="mt-0.5 text-xs text-muted">{r.days.map(dayLabel).join(' · ')}</div>
                        )}
                        {r.notes && <div className="mt-0.5 text-xs text-faint">{r.notes}</div>}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{r.party}</td>
                      <td className="py-3 pr-4 text-muted">
                        <a href={`mailto:${r.email}`} className="underline-offset-4 hover:underline">
                          {r.email}
                        </a>
                        <div>
                          <a href={`tel:${r.phone}`} className="underline-offset-4 hover:underline">
                            {r.phone}
                          </a>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted">{r.city}</td>
                      <td className="py-3 pr-4 text-muted">{r.church}</td>
                      <td className="py-3">
                        <button onClick={() => confirm(`Remove ${r.name}?`) && remove(r.id)} className="p-1.5 text-faint transition hover:text-fg" aria-label={`Remove ${r.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

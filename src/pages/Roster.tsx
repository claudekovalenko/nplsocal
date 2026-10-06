import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Search, Trash2, Wifi, HardDrive, Undo2 } from 'lucide-react';
import { events, hubById } from '@/content';
import { formatRange, formatDate, eventDays, dayLabel } from '@/lib/format';
import { countBy, daysLeftInTrash, fromCsv, peoplePerDay, toCsv, totalPeople, TRASH_DAYS, type Registration } from '@/lib/registrations';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useAuth } from '@/hooks/useAuth';
import { NoAccess, SignedInBar, SignIn } from '@/components/SignIn';
import Confirm from '@/components/Confirm';

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
  const { store, rows, trash, loading, error, addMany, remove, restore, purge } = useRegistrations(eventId);
  const auth = useAuth();
  const [q, setQ] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  // What the open confirmation is about: trash a row, or destroy one for good.
  const [confirming, setConfirming] = useState<{ row: Registration; forever: boolean } | null>(null);
  const event = events.find((e) => e.id === eventId);
  // Leads may look; only an admin may change the roster. The database enforces
  // the same split, so a hidden button is a courtesy, not the lock.
  const canRead = auth.canSeeLeads;
  const canEdit = auth.isAdmin;

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
    setImportError(null);
    file
      .text()
      .then(async (t) => {
        const parsed = fromCsv(t, eventId ?? '');
        if (!parsed.length) {
          setImportError('No rows found in that file — check it has a header row and at least one sign-up.');
          return;
        }
        await addMany(parsed);
      })
      .catch((err) => {
        // A batch import is one database call: if any row is rejected (bad data,
        // dropped connection), none of it is saved. Say so — a silent failure here
        // would look like the import worked when nothing came in.
        setImportError(
          `Import failed, nothing was saved: ${(err as Error).message || 'unknown error'}. Fix the file and try again.`,
        );
      });
  };

  /**
   * Everything on these pages is somebody else's name, email and phone number,
   * so nothing renders until we know who is asking.
   */
  if (!canRead) {
    return (
      <section className="container-x py-12 md:py-16">
        <div className="eyebrow">Rosters</div>
        <h1 className="mt-3 text-4xl md:text-5xl">Who's coming.</h1>
        {auth.loading ? (
          <p className="py-16 text-muted">Checking your sign-in…</p>
        ) : auth.email ? (
          <NoAccess auth={auth} what="The roster" />
        ) : (
          <SignIn auth={auth} what="Registrations are private. Sign in to see who has registered." />
        )}
      </section>
    );
  }

  // Index page: one card per event with counts.
  if (!eventId) {
    return (
      <section className="container-x py-12 md:py-16">
        <div className="eyebrow">Rosters</div>
        <h1 className="mt-3 text-4xl md:text-5xl">Who's coming.</h1>
        <SignedInBar auth={auth} />
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

      <SignedInBar auth={auth} />

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
          {/* Importing writes to the shared table, which the database only lets
              an admin do. Showing the button to a leads account would just hand
              them a permission error. */}
          {canEdit && (
            <label className="btn-secondary cursor-pointer">
              <Upload className="h-4 w-4" /> Import CSV
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      {importError && <p className="mt-6 text-sm text-red-400">{importError}</p>}

      {loading ? (
        <p className="py-16 text-center text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-muted">
          {rows.length
            ? 'Nobody matches that search.'
            : canEdit
              ? 'No sign-ups yet. Import a CSV to bring in the people who already registered.'
              : 'No sign-ups yet.'}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line text-left">
                {['Name', 'Party', 'Contact', 'City', 'Church / Network', ...(canEdit ? [''] : [])].map((h) => (
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
                  {canEdit && (
                    <td className="py-3">
                      <button
                        onClick={() => setConfirming({ row: r, forever: false })}
                        className="p-1.5 text-faint transition hover:text-fg"
                        aria-label={`Remove ${r.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/*
        The trash. Only an admin can read it — row-level security hides it from
        the leads role — and only until the retention window runs out.
      */}
      {canEdit && trash.length > 0 && (
        <div className="mt-14">
          <div className="eyebrow">Removed</div>
          <p className="mt-2 text-sm text-muted">
            Kept for {TRASH_DAYS} days, then deleted for good. Put anything back before then.
          </p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {trash.map((r) => {
              const left = r.deletedAt ? daysLeftInTrash(r.deletedAt) : TRASH_DAYS;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <div className="text-sm">
                      {r.name} <span className="text-muted">· {r.party}</span>
                    </div>
                    <div className="text-xs text-faint">
                      {r.email || r.phone || r.city || '—'} · {left === 0 ? 'deleted today' : `${left} day${left === 1 ? '' : 's'} left`}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => restore(r.id)} className="btn-secondary !h-8 !px-3 !text-xs">
                      <Undo2 className="h-3.5 w-3.5" /> Put back
                    </button>
                    <button
                      onClick={() => setConfirming({ row: r, forever: true })}
                      className="btn-ghost !h-8 !px-3 !text-xs text-faint"
                    >
                      Delete now
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Confirm
        open={!!confirming}
        danger={!!confirming?.forever}
        title={confirming?.forever ? 'Delete for good?' : `Remove ${confirming?.row.name}?`}
        confirmLabel={confirming?.forever ? 'Delete for good' : 'Remove'}
        body={
          confirming?.forever ? (
            <>
              <strong className="text-fg">{confirming.row.name}</strong> and their contact details will be deleted
              immediately. This cannot be undone.
            </>
          ) : (
            <>
              <strong className="text-fg">{confirming?.row.name}</strong> comes off the roster and goes to Removed,
              where you can put them back for {TRASH_DAYS} days. After that they are deleted for good.
            </>
          )
        }
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          if (!confirming) return;
          const { row, forever } = confirming;
          setConfirming(null);
          void (forever ? purge(row.id) : remove(row.id));
        }}
      />
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download, RefreshCw, Users, MessageSquare, Map } from 'lucide-react';
import { events, hubById } from '@/content';
import { formatDate } from '@/lib/format';
import { totalPeople } from '@/lib/registrations';
import { interestToCsv, listInterest, type Interest } from '@/lib/pushStore';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useAuth } from '@/hooks/useAuth';
import { NoAccess, SignedInBar, SignIn } from '@/components/SignIn';

type InterestRow = Interest & { createdAt: string };

/** Everyone who asked to hear more, newest first. */
function Leads() {
  const [rows, setRows] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listInterest()
      .then((r) => {
        setRows(r);
        setError(null);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const download = () => {
    const blob = new Blob([interestToCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `npl-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="leads" className="scroll-mt-[var(--header-h)] border-t border-line">
      <div className="container-x py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Keep me posted</div>
            <h2 className="mt-3 text-2xl md:text-4xl">Who asked to hear more.</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-ghost" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={download} className="btn-secondary" disabled={!rows.length}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="py-12 text-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-muted">Nobody has left their details yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-y border-line text-left">
                  {['Name', 'Contact', 'City', 'Church / Network', 'Asked about', 'When'].map((h) => (
                    <th key={h} className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line align-top">
                    <td className="py-3 pr-4">
                      {r.name}
                      {r.notes && <div className="mt-0.5 text-xs text-faint">{r.notes}</div>}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {r.email && (
                        <a href={`mailto:${r.email}`} className="underline-offset-4 hover:underline">
                          {r.email}
                        </a>
                      )}
                      {r.phone && (
                        <div>
                          <a href={`tel:${r.phone}`} className="underline-offset-4 hover:underline">
                            {r.phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted">{r.city}</td>
                    <td className="py-3 pr-4 text-muted">{r.church}</td>
                    <td className="py-3 pr-4 text-muted">{r.wants.join(', ')}</td>
                    <td className="py-3 pr-4 text-faint">{formatDate(r.createdAt, { weekday: undefined })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The back end: one place to sign in and reach everything that is not public.
 * Linked from the home page and the header so an organizer never has to
 * remember a URL.
 */
export default function Admin() {
  const auth = useAuth();
  // No event id: every sign-up across every event.
  const { rows, loading } = useRegistrations();

  const byEvent = useMemo(
    () =>
      events
        .map((e) => ({ event: e, mine: rows.filter((r) => r.eventId === e.id) }))
        .filter(({ mine }) => mine.length > 0)
        .sort((a, b) => b.mine.length - a.mine.length),
    [rows],
  );

  if (!auth.canSeeLeads) {
    return (
      <section className="container-x py-12 md:py-20">
        <div className="eyebrow">Organizers</div>
        <h1 className="mt-3 text-4xl md:text-5xl">Sign in.</h1>
        {auth.loading ? (
          <p className="py-16 text-muted">Checking your sign-in…</p>
        ) : auth.email ? (
          <NoAccess auth={auth} what="This page" />
        ) : (
          <>
            <p className="mt-4 max-w-md text-muted">
              Everything behind here is somebody's name, email and phone number, so it is not public.
            </p>
            <SignIn auth={auth} what="Use the email and password you were given." />
          </>
        )}
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-12 md:py-16">
          <div className="eyebrow">Organizers</div>
          <h1 className="mt-3 text-4xl md:text-6xl">The back end.</h1>
          <SignedInBar auth={auth} />

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {[
              ['People registered', totalPeople(rows)],
              ['Sign-ups', rows.length],
              ['Events with sign-ups', byEvent.length],
            ].map(([label, n]) => (
              <div key={String(label)} className="bg-bg px-5 py-6 text-center">
                <dd className="text-3xl font-light tracking-tight md:text-4xl">{n}</dd>
                <dt className="eyebrow mt-1">{label}</dt>
              </div>
            ))}
          </dl>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="On this page">
            <a href="#signups" className="pill">
              Sign-ups
            </a>
            <a href="#leads" className="pill">
              Keep me posted
            </a>
          </nav>
        </div>
      </section>

      {/* Sign-ups per event, straight through to each roster. */}
      <section id="signups" className="scroll-mt-[var(--header-h)]">
        <div className="container-x py-14 md:py-20">
          <div className="eyebrow">Sign-ups</div>
          <h2 className="mt-3 text-2xl md:text-4xl">Who registered.</h2>

          {loading ? (
            <p className="py-12 text-muted">Loading…</p>
          ) : byEvent.length === 0 ? (
            <p className="py-12 text-muted">
              Nobody has registered yet. Sign-ups land here the moment somebody submits the form.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {byEvent.map(({ event, mine }) => (
                <li key={event.id}>
                  <Link
                    to={`/roster/${event.id}`}
                    className="flex items-center justify-between gap-4 py-4 transition hover:bg-fg/5 md:px-2"
                  >
                    <div className="min-w-0">
                      <div className="text-base">{event.title}</div>
                      <div className="text-sm text-muted">
                        {event.dateLabel ?? formatDate(event.start)} · {hubById(event.hub)?.shortName ?? 'All SoCal'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-light tracking-tight">{totalPeople(mine)}</div>
                        <div className="eyebrow">People</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-faint" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/roster" className="btn-secondary">
              <Users className="h-4 w-4" /> All rosters
            </Link>
            <a href="#leads" className="btn-secondary">
              <MessageSquare className="h-4 w-4" /> Keep me posted
            </a>
            {/* The tracker holds group names and leaders, so it is admin only. */}
            {auth.isAdmin && (
              <Link to="/track" className="btn-secondary">
                <Map className="h-4 w-4" /> Tracker
              </Link>
            )}
          </div>
        </div>
      </section>

      <Leads />
    </>
  );
}

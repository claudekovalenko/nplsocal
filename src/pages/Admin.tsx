import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download, RefreshCw, Users, MessageSquare, Map, Phone, MessageCircle } from 'lucide-react';
import { events, hubById } from '@/content';
import { formatDate } from '@/lib/format';
import { totalPeople } from '@/lib/registrations';
import { interestToCsv, listInterest, type Interest } from '@/lib/pushStore';
import { followUpsToCsv, listFollowUps, type FollowUpRow } from '@/lib/followUpStore';
import { PUSH_EVENT_ID, push } from '@/content/push';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useAuth } from '@/hooks/useAuth';
import { NoAccess, SignedInBar, SignIn } from '@/components/SignIn';

type InterestRow = Interest & { createdAt: string };

function saveCsv(csv: string, name: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** People found on the push who want a follow-up, by the region they were found in. */
function FollowUps() {
  const [rows, setRows] = useState<FollowUpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('');

  const load = () => {
    setLoading(true);
    listFollowUps(PUSH_EVENT_ID)
      .then((r) => {
        setRows(r);
        setError(null);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const counts = useMemo(() => {
    const m = new globalThis.Map<string, number>();
    rows.forEach((r) => m.set(r.region, (m.get(r.region) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const shown = region ? rows.filter((r) => r.region === region) : rows;

  return (
    <section id="follow-ups" className="scroll-mt-[var(--header-h)] border-t border-line">
      <div className="container-x py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">{push.name} · Follow-ups</div>
            <h2 className="mt-3 text-2xl md:text-4xl">Who to call back.</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-ghost" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => saveCsv(followUpsToCsv(shown), region ? `npl-followups-${region.replace(/\W+/g, '-').toLowerCase()}` : 'npl-followups')}
              className="btn-secondary"
              disabled={!shown.length}
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {counts.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setRegion('')} className={region ? 'pill' : 'pill-active'}>
              All · {rows.length}
            </button>
            {counts.map(([r, n]) => (
              <button key={r} onClick={() => setRegion(r)} className={region === r ? 'pill-active' : 'pill'}>
                {r} · {n}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="py-12 text-muted">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="py-12 text-muted">No follow-ups logged yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <thead>
                <tr className="border-y border-line text-left">
                  {['Phone', 'Wants', 'What they said', 'Found in', 'Found by', 'Day'].map((h) => (
                    <th key={h} className="py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-line align-top">
                    <td className="py-3 pr-4">
                      {r.phone ? (
                        <span className="flex items-center gap-3 whitespace-nowrap">
                          <a href={`tel:${r.phone}`} className="underline-offset-4 hover:underline">
                            {r.phone}
                          </a>
                          <a href={`tel:${r.phone}`} aria-label={`Call ${r.phone}`} className="text-faint hover:text-fg">
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a href={`sms:${r.phone}`} aria-label={`Text ${r.phone}`} className="text-faint hover:text-fg">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </span>
                      ) : (
                        <span className="text-faint">No number</span>
                      )}
                      {r.name && <div className="mt-0.5 text-xs text-muted">{r.name}</div>}
                    </td>
                    <td className="py-3 pr-4 text-muted">{r.wants.join(', ')}</td>
                    <td className="max-w-xs py-3 pr-4 text-muted">{r.notes}</td>
                    <td className="py-3 pr-4 text-muted">
                      {r.region}
                      {r.area && <div className="text-xs text-faint">{r.area}</div>}
                    </td>
                    <td className="py-3 pr-4 text-muted">{r.foundBy}</td>
                    <td className="py-3 pr-4 text-faint">{r.day ? formatDate(`${r.day}T12:00:00`, { weekday: undefined }) : ''}</td>
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

  const download = () => saveCsv(interestToCsv(rows), 'npl-leads');

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
            <a href="#follow-ups" className="pill">
              Push follow-ups
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

      <FollowUps />
      <Leads />
    </>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Wifi, HardDrive } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { summarize, generations, ELEMENTS, type Group } from '@/lib/groups';
import { hubs } from '@/content';

function Circle({ g, gen }: { g: Group; gen: number }) {
  const filled = ELEMENTS.filter(([k]) => g.elements[k]).length;
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeDasharray={g.status === 'church' ? undefined : '3 3'} />
      <circle cx="20" cy="20" r={4 + (filled / ELEMENTS.length) * 9} fill="var(--accent)" opacity={0.25 + (filled / ELEMENTS.length) * 0.6} />
      <text x="20" y="24" textAnchor="middle" fontSize="11" fill="var(--fg)" fontWeight="500">
        G{gen}
      </text>
    </svg>
  );
}

export default function Track() {
  const { store, groups, loading, error, user, canEdit } = useGroups();
  const [hub, setHub] = useState<'all' | 'la' | 'oc'>('all');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const stats = useMemo(() => summarize(groups), [groups]);
  const gens = useMemo(() => generations(groups), [groups]);
  const list = groups.filter((g) => hub === 'all' || g.hub === hub);
  const view = hub === 'all' ? stats.all : stats[hub];

  // Tree order: parents first, children indented beneath.
  const ordered = useMemo(() => {
    const byParent = new Map<string | null, Group[]>();
    list.forEach((g) => {
      const p = g.parentId && list.some((x) => x.id === g.parentId) ? g.parentId : null;
      (byParent.get(p) ?? byParent.set(p, []).get(p)!).push(g);
    });
    const out: { g: Group; depth: number }[] = [];
    const walk = (p: string | null, depth: number) =>
      (byParent.get(p) ?? [])
        .sort((a, b) => a.started.localeCompare(b.started))
        .forEach((g) => {
          out.push({ g, depth });
          walk(g.id, depth + 1);
        });
    walk(null, 0);
    return out;
  }, [list]);

  const tiles = [
    ['Churches', view.churches],
    ['Groups', view.groups],
    ['Believers', view.believers],
    ['Baptized', view.baptized],
    ['Generations', view.maxGen],
  ] as const;

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Track</div>
              <h1 className="mt-3 text-4xl md:text-6xl">The map, live.</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                {store?.kind === 'supabase' ? <Wifi className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
                {store?.kind === 'supabase' ? 'Shared · live' : 'This device only'}
              </span>
              {canEdit && (
                <Link to="/track/new" className="btn-primary">
                  <Plus className="h-4 w-4" /> Add
                </Link>
              )}
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
            {tiles.map(([label, n]) => (
              <div key={label} className="bg-bg px-5 py-6 text-center">
                <dd className="text-3xl font-light tracking-tight md:text-4xl">{n}</dd>
                <dt className="eyebrow mt-1">{label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <button className={hub === 'all' ? 'pill-active' : 'pill'} onClick={() => setHub('all')}>
              All
            </button>
            {hubs.map((h) => (
              <button key={h.id} className={hub === h.id ? 'pill-active' : 'pill'} onClick={() => setHub(h.id as 'la' | 'oc')}>
                {h.shortName}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-10 md:py-14">
        {store?.auth && !user && (
          <div className="card mb-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-sm text-muted">
              <Lock className="h-4 w-4" /> Sign in to add or edit. Anyone can view.
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
        {store?.auth && user && (
          <div className="mb-8 flex items-center justify-between text-xs text-faint">
            <span>Signed in as {user.email}</span>
            <button onClick={() => store.auth!.signOut()} className="underline-offset-4 hover:underline">
              Sign out
            </button>
          </div>
        )}

        {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="py-16 text-center text-muted">Loading…</p>
        ) : ordered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted">No groups yet.</p>
            {canEdit && (
              <Link to="/track/new" className="btn-primary mt-6">
                Add the first one
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {ordered.map(({ g, depth }) => (
              <li key={g.id}>
                <Link to={`/track/${g.id}`} className="flex items-center gap-4 py-3.5 transition hover:bg-fg/5 md:px-2" style={{ paddingLeft: `${depth * 1.75}rem` }}>
                  <Circle g={g} gen={gens[g.id] ?? 1} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-base">{g.name || 'Untitled'}</span>
                      <span className="text-xs text-muted">
                        {g.status === 'church' ? 'Church' : 'Group'} · {hubs.find((h) => h.id === g.hub)?.shortName}
                        {g.area ? ` · ${g.area}` : ''}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm text-muted">
                      {g.leader && <span>{g.leader} · </span>}
                      {g.attending} attending · {g.believers} believers · {g.baptized} baptized
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-xs text-faint">
          Dotted circle = group. Solid = church. The center fills as Acts 2 elements are present.
          {store?.kind === 'local' && ' Data lives on this device until a shared database is connected.'}
        </p>
      </section>
    </>
  );
}

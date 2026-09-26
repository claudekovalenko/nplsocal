import { useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { roleLabel } from '@/lib/auth';
import type { Auth } from '@/hooks/useAuth';

/**
 * The gate in front of anything holding other people's details. Email and
 * password — no emailed link, because organizers open these pages on a phone
 * mid-event and a round trip through an inbox is where that falls down.
 */
export function SignIn({ auth, what }: { auth: Auth; what: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="card mt-8 max-w-md p-6">
      <h2 className="flex items-center gap-2 text-base">
        <Lock className="h-4 w-4 text-muted" /> Sign in
      </h2>
      <p className="mt-1.5 text-sm text-muted">{what}</p>
      <form
        className="mt-5 grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await auth.signIn(email, password);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary mt-1" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

/** Who you are and the way out, once signed in. */
export function SignedInBar({ auth, className = 'mt-8' }: { auth: Auth; className?: string }) {
  if (!auth.enabled || !auth.email) return null;
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-y border-line py-3 text-xs text-faint ${className}`}
    >
      <span>
        {auth.email}
        {auth.role && <span className="ml-2 text-muted">{roleLabel[auth.role]}</span>}
      </span>
      <button onClick={auth.signOut} className="inline-flex items-center gap-1.5 transition hover:text-fg">
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </div>
  );
}

/** Signed in, but this screen is above their level. */
export function NoAccess({ auth, what }: { auth: Auth; what: string }) {
  return (
    <div className="card mt-8 max-w-md p-6">
      <h2 className="flex items-center gap-2 text-base">
        <Lock className="h-4 w-4 text-muted" /> Not your screen
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        {auth.unlisted
          ? `${auth.email} is signed in but is not on the members list yet. Ask an admin to add it.`
          : `${what} is admin only. You are signed in as ${auth.email}.`}
      </p>
      <button onClick={auth.signOut} className="btn-secondary mt-5">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

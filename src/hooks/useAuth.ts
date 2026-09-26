import { useCallback, useEffect, useState } from 'react';
import { authEnabled, currentSession, onAuthChange, signIn, signOut, type Session } from '@/lib/auth';

/**
 * The signed-in person and what they are allowed to see.
 *
 * With no shared database configured the app is a single-device tool, so there
 * is nothing to sign in to and every screen is open — that keeps the audit
 * build and offline use working without a special case on every page.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(authEnabled);

  useEffect(() => {
    if (!authEnabled) return;
    let live = true;
    const load = () =>
      currentSession()
        .catch(() => null)
        .then((s) => {
          if (!live) return;
          setSession(s);
          setLoading(false);
        });
    load();
    const off = onAuthChange(load);
    return () => {
      live = false;
      off();
    };
  }, []);

  const doSignIn = useCallback(async (email: string, password: string) => {
    await signIn(email, password);
    setSession(await currentSession());
  }, []);

  const doSignOut = useCallback(async () => {
    await signOut();
    setSession(null);
  }, []);

  const role = session?.role ?? null;
  return {
    enabled: authEnabled,
    loading,
    email: session?.email ?? null,
    role,
    /** Rosters, the tracker, push reports — everything. */
    isAdmin: !authEnabled || role === 'admin',
    /** Who registered and who asked to hear more. Admins included. */
    canSeeLeads: !authEnabled || role === 'admin' || role === 'leads',
    /** Signed in, but the address is not on the members list. */
    unlisted: authEnabled && !!session && role === null,
    signIn: doSignIn,
    signOut: doSignOut,
  };
}

export type Auth = ReturnType<typeof useAuth>;

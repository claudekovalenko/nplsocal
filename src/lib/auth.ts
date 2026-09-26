import { isShared, supabase } from './supabaseClient';

/**
 * Who can see what.
 *
 *  - 'admin'  — everything: rosters, the tracker, push reports.
 *  - 'leads'  — the leads only: who registered, and who asked to hear more.
 *
 * Roles live in the `npl_members` table, keyed by email, and the database
 * enforces them in row-level security. The checks in this file exist so the
 * screen matches what the database will allow — they are not the security
 * boundary. Someone who edits their own browser gets a page with buttons on it
 * and nothing behind them.
 */
export type Role = 'admin' | 'leads';

export interface Session {
  email: string;
  /** null when the signed-in address is not on the members list. */
  role: Role | null;
}

/**
 * Sign-in only exists once a shared database is configured. Without one the app
 * keeps everything on the device, where there is nobody else's data to protect,
 * so every screen is open.
 */
export const authEnabled = isShared;

export async function currentSession(): Promise<Session | null> {
  if (!authEnabled) return null;
  const { data } = await supabase().auth.getUser();
  const email = data.user?.email;
  if (!email) return null;
  // The role comes from the database rather than the token, so revoking access
  // takes effect on the next page load instead of when a session expires.
  const { data: role, error } = await supabase().rpc('npl_role');
  if (error) return { email, role: null };
  return { email, role: (role as Role | null) ?? null };
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    // Supabase says "Invalid login credentials" for a wrong password and for an
    // address that has no account at all. Neither is worth spelling out.
    throw new Error(
      /invalid login/i.test(error.message)
        ? 'That email and password do not match an account.'
        : error.message,
    );
  }
}

export async function signOut(): Promise<void> {
  if (!authEnabled) return;
  await supabase().auth.signOut();
}

/** Fires on sign-in, sign-out and token refresh. Returns an unsubscribe. */
export function onAuthChange(cb: () => void): () => void {
  if (!authEnabled) return () => {};
  const { data } = supabase().auth.onAuthStateChange(() => cb());
  return () => data.subscription.unsubscribe();
}

export const roleLabel: Record<Role, string> = {
  admin: 'Admin',
  leads: 'Leads',
};

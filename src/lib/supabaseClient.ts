import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when a shared database is configured at build time. */
export const isShared = !!(url && key);

let client: SupabaseClient | null = null;

/** Single shared client for every table in the app. */
export function supabase(): SupabaseClient {
  if (!isShared) throw new Error('Supabase is not configured');
  if (!client) client = createClient(url!, key!);
  return client;
}

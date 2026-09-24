/**
 * Keeps the Supabase project awake.
 *
 * A free-tier project is paused after roughly seven days of low database
 * activity. If that happened mid-event the registration form would simply stop
 * working, so a scheduled job runs this once a day: it reads and touches a
 * single heartbeat row, which counts as real user activity.
 *
 *   node scripts/db-keepalive.mjs
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the environment,
 * falling back to the committed .env. Exits non-zero if the database cannot be
 * reached, so a paused or broken project is noticed rather than discovered by a
 * person trying to sign up.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function fromEnvFile(key) {
  try {
    const text = readFileSync(resolve(import.meta.dirname, '..', '.env'), 'utf8');
    return text.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const url = process.env.VITE_SUPABASE_URL || fromEnvFile('VITE_SUPABASE_URL');
const key = process.env.VITE_SUPABASE_ANON_KEY || fromEnvFile('VITE_SUPABASE_ANON_KEY');

if (!url || !key) {
  console.error('No Supabase URL or key found in the environment or .env.');
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const endpoint = `${url.replace(/\/$/, '')}/rest/v1/npl_heartbeat`;

async function withRetry(label, run, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await run();
    } catch (e) {
      if (i === attempts) throw new Error(`${label} failed after ${attempts} attempts: ${e.message}`);
      const wait = 2 ** i * 1000;
      console.warn(`${label} attempt ${i} failed (${e.message}); retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

// Read: proves the project is awake and serving queries.
const rows = await withRetry('read', async () => {
  const res = await fetch(`${endpoint}?select=last_ping`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  return res.json();
});

// Write: a little more activity, and leaves a timestamp you can eyeball.
await withRetry('touch', async () => {
  const res = await fetch(`${endpoint}?id=eq.1`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ last_ping: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
});

console.log(`Database awake. Previous ping: ${rows?.[0]?.last_ping ?? 'never'}; stamped a new one.`);

/**
 * One command to check the whole interface: build, serve, crawl, drive the
 * critical journeys, then do it again with sign-in switched on to check the
 * gates hold.
 *
 *   npm run audit
 *
 * Pass one builds with no Supabase credentials on purpose, so the app falls back
 * to keeping data on the device and the journey tests can submit real forms
 * without writing rows to the live database.
 *
 * Pass two builds with credentials, which turns sign-in on. It never reaches the
 * real database — it does not need to. What it proves is that a signed-out
 * visitor is met by a sign-in form and not by somebody's phone number.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

/** Ask the OS for a port nobody is using, rather than guessing and colliding. */
const freePort = () =>
  new Promise((res, rej) => {
    const s = createServer();
    s.on('error', rej);
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => res(port));
    });
  });

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: false, ...opts });

/**
 * Build into its own folder, serve it, and hand back the base URL plus a way to
 * shut the server down. Returns null if the build or the server failed.
 */
async function buildAndServe({ env, outDir }) {
  // The build's three steps are run directly rather than through `npm run
  // build`, because npm forwards extra arguments only to the last command in
  // the chain and vite would never see --outDir.
  const withEnv = { env: { ...process.env, ...env } };
  const steps = [
    ['npx', ['tsc', '-b']],
    ['npx', ['vite', 'build', '--outDir', outDir]],
    ['node', ['scripts/postbuild.mjs', '--outDir', outDir]],
  ];
  for (const [cmd, args] of steps) {
    if (run(cmd, args, withEnv).status !== 0) {
      console.error('Build failed; nothing to audit.');
      return null;
    }
  }

  const port = await freePort();
  const base = `http://localhost:${port}`;
  console.log(`\nServing ${outDir} at ${base}`);

  const server = spawn(
    'npx',
    ['vite', 'preview', '--outDir', outDir, '--port', String(port), '--strictPort'],
    { cwd: root, stdio: 'ignore' },
  );
  const stop = () => {
    try {
      server.kill('SIGTERM');
    } catch {}
  };
  process.on('exit', stop);

  // Wait for the server to answer rather than sleeping a fixed amount.
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(base + '/', { signal: AbortSignal.timeout(1000) })).ok) return { base, stop };
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  console.error('Preview server never came up.');
  stop();
  return null;
}

let failed = false;

// ── Pass one: no database. Everything is open, forms write to the device. ──
console.log('Building without database credentials, so form tests stay local...');
const local = await buildAndServe({
  env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  outDir: 'dist',
});
if (!local) process.exit(1);

failed ||= run('node', ['scripts/ui-audit.mjs', '--base', local.base, '--json', 'ui-audit-report.json']).status !== 0;
failed ||= run('node', ['scripts/ui-flows.mjs', '--base', local.base]).status !== 0;
local.stop();

// ── Pass two: database configured, nobody signed in. ──
console.log('\nBuilding with database credentials, to check the sign-in gates...');
const gated = await buildAndServe({
  env: {
    // Not the real project: these only have to be non-empty for the app to
    // switch into shared mode and put sign-in in front of private pages.
    VITE_SUPABASE_URL: 'https://audit.invalid',
    VITE_SUPABASE_ANON_KEY: 'audit-anon-key',
  },
  outDir: 'dist-gated',
});
if (!gated) process.exit(1);

failed ||= run('node', ['scripts/ui-gate.mjs', '--base', gated.base]).status !== 0;
gated.stop();

console.log(`\n${failed ? 'Audit found problems.' : 'Audit clean.'}`);
process.exit(failed ? 1 : 0);

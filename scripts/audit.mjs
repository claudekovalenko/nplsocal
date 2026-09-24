/**
 * One command to check the whole interface: build, serve, crawl, drive the
 * critical journeys, stop the server.
 *
 *   npm run audit
 *
 * The build runs with no Supabase credentials on purpose, so the app falls back
 * to keeping data on the device and the journey tests can submit real forms
 * without writing rows to the live database.
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

console.log('Building without database credentials, so form tests stay local...');
const build = run('npm', ['run', 'build'], {
  env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
});
if (build.status !== 0) {
  console.error('Build failed; nothing to audit.');
  process.exit(build.status ?? 1);
}

const port = await freePort();
const base = `http://localhost:${port}`;
console.log(`\nServing the build at ${base}`);

const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
  detached: false,
});

const stop = () => {
  try {
    server.kill('SIGTERM');
  } catch {}
};
process.on('exit', stop);
process.on('SIGINT', () => {
  stop();
  process.exit(130);
});

// Wait for the server to answer rather than sleeping a fixed amount.
let up = false;
for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(base + '/', { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      up = true;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 250));
}
if (!up) {
  console.error('Preview server never came up.');
  stop();
  process.exit(1);
}

const crawl = run('node', ['scripts/ui-audit.mjs', '--base', base, '--json', 'ui-audit-report.json']);
const flows = run('node', ['scripts/ui-flows.mjs', '--base', base]);

stop();

const failed = (crawl.status ?? 1) !== 0 || (flows.status ?? 1) !== 0;
console.log(`\n${failed ? 'Audit found problems.' : 'Audit clean.'}`);
process.exit(failed ? 1 : 0);

/**
 * The pages that hold other people's names, emails and phone numbers must be
 * shut to a visitor who is not signed in. Run against a build that HAS database
 * credentials — `npm run audit` does that in its second pass.
 *
 *   node scripts/ui-gate.mjs [--base http://localhost:4173]
 *
 * No real database is reached, and none is needed: signed out is signed out.
 */
import { launch } from './browser.mjs';

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const BASE = arg('base', 'http://localhost:4173').replace(/\/$/, '');

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const jsErrors = [];
page.on('pageerror', (e) => jsErrors.push(String(e.message)));

console.log(`\nSign-in gates at ${BASE}`);

const PRIVATE = [
  ['/roster', 'roster index'],
  ['/roster/socal-gospel-conversation-nov', 'one event roster'],
  ['/track', 'tracker'],
  ['/track/new', 'new group form'],
];

for (const [path, label] of PRIVATE) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  // The gate waits on a session lookup, which here hangs and then fails.
  await page.waitForTimeout(1200);
  const state = await page.evaluate(() => ({
    password: document.querySelectorAll('input[type="password"]').length,
    // A table or an Import control means real rows reached the page.
    tables: document.querySelectorAll('table').length,
    body: document.body.innerText,
  }));
  const gated = state.password > 0 || /Sign in as an admin/i.test(state.body);
  check(`${label} asks for a sign-in`, gated, gated ? '' : state.body.slice(0, 120).replace(/\s+/g, ' '));
  check(`${label} shows no rows while signed out`, state.tables === 0, `${state.tables} tables`);
}

// Registering must stay open to everyone — the gate is on reading, never on
// signing up.
await page.goto(BASE + '/register/socal-gospel-conversation-nov', { waitUntil: 'networkidle' });
const formFields = await page.locator('input[required]').count();
check('the registration form is still open to everyone', formFields >= 5, `${formFields} required fields`);

// The push hub is the event's front door: it must not ask anybody to sign in.
await page.goto(BASE + '/push', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const pushAsks = await page.locator('input[type="password"]').count();
check('the push hub asks nobody to sign in', pushAsks === 0);

// A sign-in that cannot reach the database must say so and give the form back,
// not sit on "Signing in…" forever.
await page.goto(BASE + '/roster', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.locator('input[type="email"]').fill('nobody@example.com');
await page.locator('input[type="password"]').fill('wrong-password');
await page.getByRole('button', { name: /^Sign in$/ }).click();
await page.waitForTimeout(4000);
const afterTry = await page.evaluate(() => ({
  button: document.querySelector('button[class*="btn-primary"]')?.textContent?.trim() ?? '',
  red: !!document.querySelector('.text-red-400'),
}));
check('a failed sign-in reports back instead of hanging', afterTry.button === 'Sign in', afterTry.button);
check('a failed sign-in shows why', afterTry.red);

check('no uncaught errors on the gated pages', jsErrors.length === 0, jsErrors.join(' | '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} gate checks passed`);
process.exit(failed.length ? 1 : 0);

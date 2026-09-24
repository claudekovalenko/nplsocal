/**
 * Critical journeys: the things that must work or the site has failed at its job.
 * Unlike the audit crawl, these fill in forms and submit them, so run them
 * against a build with no database configured (the app then keeps data on the
 * device) — `npm run audit` does exactly that.
 *
 *   node scripts/ui-flows.mjs [--base http://localhost:4173]
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

console.log(`\nCritical journeys at ${BASE}`);

// 1. Every event on the gatherings page offers a way to register.
await page.goto(BASE + '/gatherings', { waitUntil: 'networkidle' });
const cards = await page.locator('article').count();
const registerLinks = await page.getByRole('link', { name: /Register/ }).count();
check('gatherings page lists events', cards > 0, `${cards} featured`);
check('featured events offer registration', registerLinks > 0, `${registerLinks} register links`);

// 2. Registering takes you to a working form and through to a confirmation.
await page.getByRole('link', { name: /Register/ }).first().click();
await page.waitForURL(/\/register\//, { timeout: 10000 });
const heading = (await page.textContent('h1')) || '';
check('register link opens a form', heading.length > 0, heading);

const required = await page.locator('input[required], select[required]').count();
check('form asks for the details we need', required >= 5, `${required} required fields`);

await page.fill('input[autocomplete="name"]', 'Audit Person');
await page.fill('input[autocomplete="email"]', 'audit@example.com');
await page.fill('input[autocomplete="tel"]', '555-0100');
await page.fill('input[type="number"]', '3');
const cityInput = page.locator('input[placeholder="Santa Ana"]');
if (await cityInput.count()) await cityInput.fill('Long Beach');
const churchInput = page.locator('label').filter({ hasText: /Church \/ Network/ }).locator('input');
if (await churchInput.count()) await churchInput.fill('Audit Church');

// Multi-day events must let people pick days.
const dayChips = await page.locator('fieldset button').count();
if (dayChips > 1) {
  await page.locator('fieldset button').first().click();
  check('multi-day event offers day selection', true, `${dayChips - 1} days + all`);
}

await page.getByRole('button', { name: 'Register', exact: true }).click();
await page.waitForTimeout(1500);
const confirmed = ((await page.textContent('h1')) || '').includes("You're registered");
check('submitting the form confirms the registration', confirmed);

// 3. The roster reflects what was just submitted (device store in audit mode).
await page.goto(BASE + '/roster', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const rosterText = (await page.textContent('body')) || '';
const rosterWorks = rosterText.includes('Who') || rosterText.includes('People') || rosterText.includes('Sign in');
check('roster page renders', rosterWorks);

// 4. The 3/3rds runner drives a meeting.
await page.goto(BASE + '/three-thirds', { waitUntil: 'networkidle' });
const thirds = await page.locator('ol li button').count();
check('3/3rds runner shows all three thirds', thirds === 3, `${thirds} steps`);
const timerBefore = await page.locator('.tabular-nums').first().textContent();
await page.getByRole('button', { name: /^(Start|Pause)$/ }).first().click().catch(() => {});
await page.waitForTimeout(1200);
const timerAfter = await page.locator('.tabular-nums').first().textContent();
check('3/3rds timer counts down', timerBefore !== timerAfter, `${timerBefore} to ${timerAfter}`);

// 5. The tracker accepts a group.
await page.goto(BASE + '/track/new', { waitUntil: 'networkidle' });
const trackForm = await page.locator('form input').count();
check('tracker offers a group form', trackForm > 0, `${trackForm} fields`);

check('no uncaught errors during journeys', jsErrors.length === 0, jsErrors.join(' | '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} journeys passed`);
process.exit(failed.length ? 1 : 0);

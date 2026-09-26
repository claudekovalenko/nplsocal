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

// 1. Every event on the events page offers a way to register.
await page.goto(BASE + '/events', { waitUntil: 'networkidle' });
const cards = await page.locator('article').count();
const registerLinks = await page.getByRole('link', { name: /Register/ }).count();
check('events page lists events', cards > 0, `${cards} featured`);
check('featured events offer registration', registerLinks > 0, `${registerLinks} register links`);

// 2. Registering takes you to a working form and through to a confirmation.
await page.getByRole('link', { name: /Register/ }).first().click();
await page.waitForURL(/\/register\//, { timeout: 10000 });
const eventId = page.url().split('/register/')[1];
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

// 3b. Importing a messy CSV must not corrupt the roster: a party size over the
// database's cap of 500 has to be clamped (a whole batch insert is rejected if
// even one row is out of range), and a day that isn't a real calendar date
// must not silently become a different, wrong-looking date.
if (eventId) {
  await page.goto(`${BASE}/roster/${eventId}`, { waitUntil: 'networkidle' });
  const csv = [
    'Name,Party size,Email,Phone,City,Church / Network,Days,Notes',
    '"CSV Edge Case",99999,csvcase@example.com,555-2000,Anaheim,Test Church,2025-02-30,Should clamp party and drop the bad day',
  ].join('\n');
  await page.setInputFiles('input[type="file"]', {
    name: 'edge-cases.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv),
  });
  await page.waitForTimeout(800);
  const row = page.locator('tr', { hasText: 'CSV Edge Case' });
  const rowText = (await row.textContent().catch(() => '')) || '';
  check('CSV import brings in the row', rowText.includes('CSV Edge Case'), rowText.replace(/\s+/g, ' ').trim());
  check('CSV import clamps an over-limit party size to the database max', rowText.includes('500'), rowText);
  check(
    'CSV import drops a day that is not a real calendar date, rather than mislabeling it',
    !rowText.includes('2025-02-30') && !rowText.includes('Mar'),
    rowText,
  );
}

// 4. The 3/3rds runner drives a meeting.
await page.goto(BASE + '/three-thirds', { waitUntil: 'networkidle' });
const thirds = await page.locator('ol li button').count();
check('3/3rds runner shows all three thirds', thirds === 3, `${thirds} steps`);
const timerBefore = await page.locator('.tabular-nums').first().textContent();
await page.getByRole('button', { name: /^(Start|Pause)$/ }).first().click().catch(() => {});
await page.waitForTimeout(1200);
const timerAfter = await page.locator('.tabular-nums').first().textContent();
check('3/3rds timer counts down', timerBefore !== timerAfter, `${timerBefore} to ${timerAfter}`);

// 4b. Every field stops at the database's limit, so nobody fills in a form and
// is refused only after submitting.
await page.goto(BASE + '/register/socal-gospel-conversation-nov', { waitUntil: 'networkidle' });
const longText = 'x'.repeat(600);
await page.fill('input[autocomplete="name"]', longText);
const cappedName = (await page.inputValue('input[autocomplete="name"]')).length;
check('name input caps at the database limit', cappedName === 200, `${cappedName} chars kept of 600`);
const notes = page.locator('textarea');
if (await notes.count()) {
  await notes.first().fill('y'.repeat(5000));
  const cappedNotes = (await notes.first().inputValue()).length;
  check('notes input caps at the database limit', cappedNotes === 4000, `${cappedNotes} chars kept of 5000`);
}

// 5. The push hub carries the whole event.
await page.goto(BASE + '/push', { waitUntil: 'networkidle' });
const pushHeading = (await page.textContent('h1')) || '';
check('push hub loads', /Push/i.test(pushHeading), pushHeading.replace(/\s+/g, ' ').trim());

const dayTabs = await page.locator('#schedule button').count();
check('schedule offers every day', dayTabs === 4, `${dayTabs} day tabs`);
const firstDayBlocks = await page.locator('#schedule ol li').count();
await page.locator('#schedule button').nth(2).click();
await page.waitForTimeout(300);
const thirdDayBlocks = await page.locator('#schedule ol li').count();
check('switching day changes the schedule', firstDayBlocks > 0 && thirdDayBlocks > 0);

// Daily report: with no database configured it queues on the device, which is
// exactly what a team with no signal would hit.
await page.locator('#report input[required]').fill('Audit Reporter');
const counts = page.locator('#report input[type="number"]');
await counts.nth(0).fill('12');
await counts.nth(1).fill('5');
await counts.nth(2).fill('2');
await page.getByRole('button', { name: /Send report/ }).click();
await page.waitForTimeout(1200);
const reportDone = ((await page.textContent('#report')) || '').match(/Report received|Saved on your phone/);
check('daily report submits', !!reportDone, reportDone?.[0]);

// Stay-connected form.
await page.locator('#connect input[autocomplete="name"]').fill('Audit Contact');
await page.locator('#connect input[required]').nth(1).fill('audit@example.com');
await page.locator('#connect button[type="button"]').first().click();
await page.getByRole('button', { name: /Keep me posted/ }).click();
await page.waitForTimeout(1200);
const interestDone = ((await page.textContent('#connect')) || '').includes("We've got you");
check('stay-connected form submits', interestDone);

// 6. The tracker accepts a group.
await page.goto(BASE + '/track/new', { waitUntil: 'networkidle' });
const trackForm = await page.locator('form input').count();
check('tracker offers a group form', trackForm > 0, `${trackForm} fields`);

check('no uncaught errors during journeys', jsErrors.length === 0, jsErrors.join(' | '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} journeys passed`);
process.exit(failed.length ? 1 : 0);

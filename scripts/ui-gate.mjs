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
  ['/admin', 'the back end'],
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

// The account menu is the only way in now, so it has to be present on an
// ordinary page at phone width, and open to a sign-in.
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const acct = page.getByRole('button', { name: /^Account/ });
check('the header offers an account menu', (await acct.count()) > 0);
if (await acct.count()) {
  await acct.first().click();
  await page.waitForTimeout(250);
  const menuText = await page.evaluate(() => document.querySelector('[role="menu"]')?.textContent ?? '');
  check('the account menu offers a sign-in', /Sign in/i.test(menuText), menuText.trim());
  // Text in the DOM is not the same as text on the screen. The header's pill
  // once clipped this menu to a 5px sliver and every text-based check still
  // passed, so measure how much of it a person can actually see.
  const seen = await page.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return null;
    const m = menu.getBoundingClientRect();
    let clipBottom = window.innerHeight;
    for (let el = menu.parentElement; el; el = el.parentElement) {
      if (getComputedStyle(el).overflow !== 'visible') {
        clipBottom = Math.min(clipBottom, el.getBoundingClientRect().bottom);
      }
    }
    return { height: Math.round(m.height), visible: Math.round(Math.min(m.bottom, clipBottom) - m.top) };
  });
  check(
    'the account menu is not clipped by the header',
    !!seen && seen.visible >= seen.height - 1,
    seen ? `${seen.visible}px of ${seen.height}px visible` : 'no menu',
  );
  await page.keyboard.press('Escape');
}

// The About dropdown hangs out of the same pill and had the same bug.
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /^About/ }).click();
await page.waitForTimeout(250);
{
  const seen = await page.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return null;
    const m = menu.getBoundingClientRect();
    let clipBottom = window.innerHeight;
    for (let el = menu.parentElement; el; el = el.parentElement) {
      if (getComputedStyle(el).overflow !== 'visible') {
        clipBottom = Math.min(clipBottom, el.getBoundingClientRect().bottom);
      }
    }
    return { height: Math.round(m.height), visible: Math.round(Math.min(m.bottom, clipBottom) - m.top) };
  });
  check(
    'the About menu is not clipped by the header',
    !!seen && seen.visible >= seen.height - 1,
    seen ? `${seen.visible}px of ${seen.height}px visible` : 'no menu',
  );
  await page.keyboard.press('Escape');
}

// The three-lines menu must carry the same obvious way in, not only the icon.
await page.setViewportSize({ width: 390, height: 800 });
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Toggle menu/i }).click();
await page.waitForTimeout(250);
const burger = await page.evaluate(() => document.querySelector('#mobile-nav')?.textContent ?? '');
check('the three-lines menu offers a sign-in', /Sign in/i.test(burger), burger.replace(/\s+/g, ' ').trim());
await page.setViewportSize({ width: 1280, height: 900 });

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
// Scoped to the form: the header's account button is also labelled "Sign in".
await page.locator('form').getByRole('button', { name: /^Sign in$/ }).click();
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

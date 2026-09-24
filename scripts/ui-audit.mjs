/**
 * UI audit: walks every page of the built site in a real browser, clicks the
 * things a person would click, and reports anything broken.
 *
 *   node scripts/ui-audit.mjs [--base http://localhost:4173] [--json report.json]
 *
 * Exits non-zero when it finds a problem, so CI fails on a broken interface.
 *
 * What it checks, per page:
 *   - uncaught errors and console errors
 *   - requests that failed or returned 4xx/5xx
 *   - every internal link resolves to a real route (not the 404 page)
 *   - every link and button has an accessible name a screen reader can read
 *   - images have alt text
 *   - no horizontal overflow at phone width
 *   - clicking safe controls does not throw or blank the page
 *
 * It deliberately does not click destructive controls (remove, delete, sign
 * out) or submit forms; critical form journeys live in scripts/ui-flows.mjs.
 */
import { launch } from './browser.mjs';
import { writeFileSync } from 'node:fs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const BASE = (arg('base', 'http://localhost:4173')).replace(/\/$/, '');
const JSON_OUT = arg('json', '');

/** Controls we must not click: they destroy data or end the session. */
const UNSAFE = /remove|delete|sign out|log out|clear|reset|discard/i;
/** Console noise that is not the site's fault (sandboxed network, extensions). */
const IGNORABLE = /ERR_TUNNEL_CONNECTION_FAILED|ERR_PROXY|net::ERR_INTERNET_DISCONNECTED|Failed to load resource: net::ERR_/i;

const findings = [];
const add = (severity, page, kind, detail) => findings.push({ severity, page, kind, detail });

/** Routes to start from. Everything else is discovered by following links. */
const SEEDS = ['/', '/events', '/tools', '/about', '/regions', '/connect', '/track', '/roster'];

const seen = new Set();
const queue = [];
const enqueue = (path) => {
  const clean = path.split('#')[0];
  if (!clean.startsWith('/') || seen.has(clean)) return;
  seen.add(clean);
  queue.push(clean);
};

async function auditPage(page, path) {
  const errors = [];
  const badRequests = [];
  const onPageError = (e) => errors.push(String(e.message || e));
  const onConsole = (m) => {
    if (m.type() === 'error' && !IGNORABLE.test(m.text())) errors.push(m.text());
  };
  const onResponse = (r) => {
    if (r.status() >= 400) badRequests.push(`${r.status()} ${r.url()}`);
  };
  const onFailed = (r) => {
    if (!IGNORABLE.test(r.failure()?.errorText ?? '')) {
      badRequests.push(`failed ${r.url()} (${r.failure()?.errorText})`);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('response', onResponse);
  page.on('requestfailed', onFailed);

  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    // Did we land on the 404 page?
    const is404 = await page.locator('h1', { hasText: "There's no page here." }).count();
    if (is404 && path !== '/404') add('error', path, 'broken-route', 'renders the 404 page');

    // Collect internal links and queue unseen ones.
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') || ''));
    for (const href of hrefs) {
      if (href.startsWith('/')) enqueue(href);
      else if (!/^(https?:|mailto:|tel:|#)/.test(href) && href) {
        add('warn', path, 'odd-href', href);
      }
    }

    // Accessible names on interactive elements.
    const unnamed = await page.$$eval('a, button', (els) =>
      els
        .filter((el) => {
          const label =
            (el.textContent || '').trim() ||
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            el.querySelector('img[alt]')?.getAttribute('alt');
          return !label;
        })
        .map((el) => el.outerHTML.slice(0, 120)),
    );
    for (const el of unnamed) add('error', path, 'unnamed-control', el);

    // Images need alt text (empty alt is fine: it means decorative).
    const noAlt = await page.$$eval('img:not([alt])', (els) => els.map((e) => e.getAttribute('src') || '(no src)'));
    for (const src of noAlt) add('warn', path, 'image-missing-alt', src);

    // Horizontal overflow at phone width.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) add('error', path, 'horizontal-overflow', `${overflow}px wider than the screen at 390px`);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(250);

    // Click safe controls. After each click, make sure the page still has
    // content. Re-query by index every time rather than holding element
    // handles: clicking a control re-renders the page, which detaches any
    // handle grabbed beforehand and would report a false "click failed".
    const controls = page.locator('button:not([disabled])');
    const count = await controls.count();
    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);
      let label = '';
      try {
        label = ((await control.textContent()) || (await control.getAttribute('aria-label')) || '').trim();
        if (UNSAFE.test(label)) continue;
        if ((await control.getAttribute('type')) === 'submit') continue;
        if (!(await control.isVisible())) continue;
        await control.click({ timeout: 4000 });
        await page.waitForTimeout(150);
        const bodyLen = (await page.textContent('body'))?.trim().length ?? 0;
        if (bodyLen < 40) add('error', path, 'blank-after-click', label || `button #${i}`);
        if (!page.url().startsWith(BASE + path)) {
          await page.goto(BASE + path, { waitUntil: 'networkidle' });
          await page.waitForTimeout(200);
        }
      } catch (e) {
        const msg = String(e.message || e);
        // Controls that disappear as a result of an earlier click are expected,
        // not defects: a menu that closes, a step that advances.
        const expected = /not visible|outside of the viewport|intercepts pointer|not attached|element is not stable|waiting for element/i;
        if (!expected.test(msg)) {
          add('warn', path, 'click-failed', `${label || `button #${i}`}: ${msg.split('\n')[0]}`);
        }
      }
    }
  } catch (e) {
    add('error', path, 'navigation-failed', String(e.message || e).split('\n')[0]);
  }

  for (const e of errors) add('error', path, 'js-error', e);
  for (const r of badRequests) add('error', path, 'bad-request', r);

  page.off('pageerror', onPageError);
  page.off('console', onConsole);
  page.off('response', onResponse);
  page.off('requestfailed', onFailed);
}

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

SEEDS.forEach(enqueue);
let visited = 0;
while (queue.length) {
  const path = queue.shift();
  visited++;
  await auditPage(page, path);
}

await browser.close();

const errors = findings.filter((f) => f.severity === 'error');
const warnings = findings.filter((f) => f.severity === 'warn');

const report = { base: BASE, pagesVisited: visited, pages: [...seen].sort(), errors, warnings };
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));

console.log(`\nUI audit — ${visited} pages at ${BASE}`);
console.log([...seen].sort().map((p) => `  ${p}`).join('\n'));

const show = (list, heading) => {
  if (!list.length) return;
  console.log(`\n${heading}`);
  const byPage = list.reduce((acc, f) => ((acc[f.page] ??= []).push(f), acc), {});
  for (const [p, items] of Object.entries(byPage)) {
    console.log(`  ${p}`);
    for (const i of items) console.log(`    [${i.kind}] ${i.detail}`);
  }
};
show(warnings, `${warnings.length} warning(s)`);
show(errors, `${errors.length} error(s)`);

if (!errors.length && !warnings.length) console.log('\nNo problems found.');
process.exit(errors.length ? 1 : 0);

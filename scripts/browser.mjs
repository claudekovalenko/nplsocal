/**
 * Launching Chromium in a way that works both in this sandbox, which ships a
 * browser at a fixed path and blocks downloads, and on a CI runner, where
 * Playwright installs and resolves its own.
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

/** Sandbox images pin a Chromium build here and skip the download step. */
const SANDBOX_PATHS = [
  process.env.PLAYWRIGHT_CHROMIUM,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
].filter(Boolean);

export function launchOptions() {
  const found = SANDBOX_PATHS.find((p) => existsSync(p));
  // No executablePath means "use the browser Playwright installed", which is
  // what a CI runner wants.
  return found ? { executablePath: found } : {};
}

export const launch = () => chromium.launch(launchOptions());

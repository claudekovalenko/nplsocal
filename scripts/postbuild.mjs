// GitHub Pages has no SPA rewrite; serving index.html as 404.html makes deep links work.
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const i = process.argv.indexOf('--outDir');
const outDir = i > -1 ? process.argv[i + 1] : 'dist';
const dist = resolve(import.meta.dirname, '..', outDir);
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
console.log(`wrote ${outDir}/404.html`);

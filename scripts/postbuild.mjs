// GitHub Pages has no SPA rewrite; serving index.html as 404.html makes deep links work.
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
const dist = resolve(import.meta.dirname, '../dist');
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
console.log('wrote dist/404.html');

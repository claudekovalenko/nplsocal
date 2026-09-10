// Renders public/icons/icon.svg to the PNG sizes the manifest needs.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const svg = readFileSync(resolve(root, 'public/icons/icon.svg'));
const out = (name) => resolve(root, 'public/icons', name);

const jobs = [
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['apple-touch-icon.png', 180, 0],
  // maskable: keep artwork inside the safe zone by padding ~10%
  ['icon-maskable-512.png', 512, 52],
];

for (const [name, size, pad] of jobs) {
  const inner = size - pad * 2;
  const art = await sharp(svg).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: '#000000' },
  })
    .composite([{ input: art, left: pad, top: pad }])
    .png()
    .toFile(out(name));
  console.log('wrote', name);
}

// favicon.ico (32px png inside .ico container is widely accepted)
await sharp(svg).resize(32, 32).png().toFile(resolve(root, 'public/favicon.ico'));
console.log('wrote favicon.ico');

// Builds src/content/pray/peoples.json: for every ZIP code area on the Pray
// map, an estimate (and margin of error) of each community in
// src/content/pray/peoples.ts, from the Census Bureau's American Community
// Survey 5-year tables by ZIP Code Tabulation Area.
//
//   npm run peoples
//
// The tables are streamed from www2.census.gov (no API key needed) and only
// the rows for ZIP codes on the map are kept. Set CENSUS_DIR to a folder of
// already-filtered files (acsdt5y<year>-b02015.dat …) to skip the download.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PEOPLES } from '../src/content/pray/peoples.ts';

const YEAR = 2024; // 5-year estimates for 2020–2024
const root = resolve(import.meta.dirname, '..');
const map = JSON.parse(readFileSync(resolve(root, 'src/content/pray/map.json'), 'utf8'));
const zips = new Set(map.s.map((s) => s.z));
const TABLES = { A: 'b02015', P: 'b02016', N: 'b04006', B: 'b05006' };

async function table(code) {
  const name = `acsdt5y${YEAR}-${code}.dat`;
  const local = process.env.CENSUS_DIR && resolve(process.env.CENSUS_DIR, name);
  let text;
  if (local && existsSync(local)) text = readFileSync(local, 'utf8');
  else {
    const url = `https://www2.census.gov/programs-surveys/acs/summary_file/${YEAR}/table-based-SF/data/5YRData/${name}`;
    console.log('downloading', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    // Keep the header and the map's ZIP codes; the full file covers the whole country.
    const keep = [];
    let rest = '';
    const decoder = new TextDecoder();
    for await (const chunk of res.body) {
      const lines = (rest + decoder.decode(chunk, { stream: true })).split('\n');
      rest = lines.pop();
      for (const l of lines) if (!keep.length || (l.startsWith('860Z200US') && zips.has(l.slice(9, 14)))) keep.push(l);
    }
    text = keep.join('\n');
  }
  const [head, ...rows] = text.trim().split('\n');
  const cols = head.split('|');
  const out = {};
  for (const r of rows) {
    const v = r.split('|');
    const z = v[0].slice(-5);
    if (!zips.has(z)) continue;
    out[z] = Object.fromEntries(cols.map((c, i) => [c, v[i]]));
  }
  return { code: code.toUpperCase(), rows: out };
}

const t = {};
for (const [k, code] of Object.entries(TABLES)) t[k] = await table(code);

// The census writes negative codes for "not available"; those count as nothing.
const num = (s) => {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const ids = PEOPLES.map((p) => p.id);
const byZip = {};
for (const z of [...zips].sort()) {
  const list = [];
  PEOPLES.forEach((p, i) => {
    // Each source is a floor; take the largest, with its own margin of error.
    let best = [0, 0];
    for (const s of p.src) {
      const tab = t[s[0]];
      const row = tab.rows[z];
      if (!row) continue;
      const line = s.slice(1);
      const e = num(row[`${tab.code}_E${line}`]);
      const m = num(row[`${tab.code}_M${line}`]);
      if (e > best[0]) best = [e, m];
    }
    // Tiny counts never reach a display threshold even when added up, so leave them out.
    if (best[0] >= 15) list.push([i, best[0], best[1]]);
  });
  if (list.length) byZip[z] = list;
}

const out = {
  source: `Census Bureau, American Community Survey ${YEAR - 4}–${YEAR} 5-year estimates (B02015, B02016, B04006, B05006), by ZIP Code Tabulation Area`,
  ids,
  zips: byZip,
};
writeFileSync(resolve(root, 'src/content/pray/peoples.json'), JSON.stringify(out));
console.log('wrote peoples.json:', Object.keys(byZip).length, 'ZIP codes,', ids.length, 'communities');

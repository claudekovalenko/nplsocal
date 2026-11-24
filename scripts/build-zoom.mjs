// Builds src/components/zoom-data.json for the home page zoom-out: world land,
// the United States outline and state lines, Los Angeles and Orange County,
// and the network's places, all as longitude/latitude for an orthographic
// globe drawn at runtime. Run: npm run zoom
//
// Sources: world-atlas (Natural Earth, public domain) and us-atlas (U.S.
// Census Bureau). Shapes are simplified to what each zoom level shows, and
// coordinates rounded, to keep the file small.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as topojson from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import { geoArea } from 'd3-geo';

const root = resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(readFileSync(resolve(root, 'node_modules', p), 'utf8'));
const round = (g, dp) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? +v.toFixed(dp) : v)));
const slim = (topo, minWeight) => simplify(presimplify(topo), minWeight);

// World land: seen from the US view outward, so the 1:110m coastline is plenty.
const world = read('world-atlas/land-110m.json');
const land = round(topojson.merge(world, world.objects.land.geometries ?? [world.objects.land]), 2);

// The United States: outline and the lines between states.
const us = slim(read('us-atlas/states-10m.json'), 0.02);
const nation = round(topojson.merge(us, us.objects.nation.geometries ?? [us.objects.nation]), 2);
const states = round(topojson.mesh(us, us.objects.states, (a, b) => a !== b), 2);

// LA and OC at full detail: they fill the screen at the start.
const c = read('us-atlas/counties-10m.json');
const mainland = (f) => {
  if (f.geometry.type !== 'MultiPolygon') return f.geometry;
  const polys = f.geometry.coordinates.map((p) => ({ p, a: geoArea({ type: 'Polygon', coordinates: p }) }));
  polys.sort((x, y) => y.a - x.a);
  return { type: 'Polygon', coordinates: polys[0].p };
};
const all = topojson.feature(c, c.objects.counties).features;
const county = (id) => round(mainland(all.find((f) => f.id === id)), 4);

const places = [
  // id, label, lon, lat, hub, size (3 = hub centre)
  ['dtla', 'Downtown LA', -118.2437, 34.0522, 'la', 3],
  ['pasadena', 'Pasadena', -118.1445, 34.1478, 'la', 2],
  ['long-beach', 'Long Beach', -118.1937, 33.7701, 'la', 2],
  ['sfv', 'San Fernando Valley', -118.449, 34.1867, 'la', 2],
  ['santa-monica', 'Santa Monica', -118.4912, 34.0195, 'la', 1],
  ['torrance', 'South Bay', -118.3406, 33.8358, 'la', 1],
  ['pomona', 'Pomona', -117.75, 34.0551, 'la', 1],
  ['el-monte', 'San Gabriel Valley', -118.0276, 34.0686, 'la', 1],
  ['south-la', 'South LA', -118.287, 33.96, 'la', 1],
  ['santa-clarita', 'Santa Clarita', -118.5426, 34.3917, 'la', 1],
  ['santa-ana', 'Santa Ana', -117.8678, 33.7455, 'oc', 3],
  ['anaheim', 'Anaheim', -117.9143, 33.8366, 'oc', 2],
  ['irvine', 'Irvine', -117.8265, 33.6846, 'oc', 2],
  ['huntington', 'Huntington Beach', -117.9992, 33.6595, 'oc', 1],
  ['fullerton', 'Fullerton', -117.9243, 33.8704, 'oc', 1],
  ['westminster', 'Westminster', -117.994, 33.7514, 'oc', 1],
  ['mission-viejo', 'Mission Viejo', -117.658, 33.6, 'oc', 1],
  ['san-clemente', 'San Clemente', -117.612, 33.427, 'oc', 1],
].map(([id, label, lon, lat, hub, size]) => ({ id, label, lon, lat, hub, size }));

const out = { land, nation, states, la: county('06037'), oc: county('06059'), places };
const json = JSON.stringify(out);
writeFileSync(resolve(root, 'src/components/zoom-data.json'), json);
console.log('wrote zoom-data.json', (json.length / 1024).toFixed(0), 'KB');

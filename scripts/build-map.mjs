// Generates src/components/map-data.ts: Los Angeles and Orange County, their
// neighbours, the Channel Islands, a lat/long graticule, a scale bar, landmark
// labels and the network's places, all projected into one SVG coordinate space.
//
// Boundaries come from scripts/data/socal-counties.geojson (U.S. Census county
// outlines, via github.com/codeforgermany/click_that_hood), which carries about
// three times the coastline detail of the us-atlas file this used to read.
//
//   Run: npm run map
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { geoMercator, geoPath, geoArea, geoGraticule, geoDistance } from 'd3-geo';

const root = resolve(import.meta.dirname, '..');
const data = JSON.parse(readFileSync(resolve(root, 'scripts/data/socal-counties.geojson'), 'utf8'));
const byName = (n) => data.features.find((f) => f.properties.name === n);

/** Split a county into its mainland and its islands (Catalina, San Clemente, …). */
function split(f) {
  if (f.geometry.type !== 'MultiPolygon') return { mainland: f, islands: [] };
  const polys = f.geometry.coordinates
    .map((c) => ({ c, a: geoArea({ type: 'Polygon', coordinates: c }) }))
    .sort((x, y) => y.a - x.a);
  return {
    mainland: { ...f, geometry: { type: 'Polygon', coordinates: polys[0].c } },
    islands: polys.slice(1).map((p) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: p.c } })),
  };
}

const la = split(byName('Los Angeles'));
const oc = split(byName('Orange'));
const neighbours = ['Ventura', 'Kern', 'San Bernardino', 'Riverside', 'San Diego', 'Santa Barbara'].map(byName);

// Landscape frame: wider than tall, so the basin and the coast have room to
// breathe on a desktop screen and the hero crop is not squeezed.
// The fit leaves 70px spare at the bottom so Catalina is not cut off.
const W = 1200, H = 1070, PAD = 50;
const projection = geoMercator().fitExtent(
  [[PAD, PAD], [W - PAD, H - 70 - PAD]],
  { type: 'FeatureCollection', features: [la.mainland, oc.mainland] },
);
const path = geoPath(projection);
const r1 = (n) => +n.toFixed(1);
// One decimal is plenty at this scale and keeps the file small.
const d = (f) => (path(f) ?? '').replace(/(\d+\.\d)\d+/g, '$1');
const pt = (lon, lat) => projection([lon, lat]).map(r1);

// Graticule every half degree, plus where each line meets the frame, for the
// degree labels round the edge.
const graticule = d(geoGraticule().step([0.5, 0.5]).extent([[-120, 32.5], [-116, 35.5]])());
const meridians = [-119, -118.5, -118, -117.5].map((lon) => ({ label: `${Math.abs(lon)}°W`, x: pt(lon, 34)[0] }));
const parallels = [33.5, 34, 34.5].map((lat) => ({ label: `${lat}°N`, y: pt(-118, lat)[1] }));

// Scale bar: how many pixels make 10 miles at the middle of the map.
const [cx, cy] = [W / 2, H / 2];
const [lon0, lat0] = projection.invert([cx, cy]);
const [lon1, lat1] = projection.invert([cx + 100, cy]);
const milesPer100px = geoDistance([lon0, lat0], [lon1, lat1]) * 3958.8;
const scale = { miles: 10, px: r1((10 / milesPer100px) * 100) };

// Landmarks: water, mountains, islands. Lettered like a printed map.
const landmarks = [
  ['Pacific Ocean', -118.62, 33.62, 'water', 0],
  ['Santa Monica Bay', -118.62, 33.92, 'water', 0],
  ['San Pedro Channel', -118.32, 33.53, 'water', 0],
  ['San Gabriel Mountains', -117.98, 34.31, 'range', -8],
  ['Santa Monica Mountains', -118.78, 34.09, 'range', -6],
  ['Santa Ana Mountains', -117.5, 33.74, 'range', 56],
  ['Santa Catalina Island', -118.36, 33.27, 'island', 22],
  ['Mojave Desert', -117.95, 34.75, 'range', 0],
  ['Los Angeles River', -118.235, 33.9, 'river', -70],
].map(([label, lon, lat, kind, rotate]) => {
  const [x, y] = pt(lon, lat);
  return { label, kind, rotate, x, y };
});

const places = [
  // id, label, lon, lat, hub, size(1-3). Size 3 is a hub centre (pulse), size 2
  // is labelled everywhere, size 1 only on the full map.
  ['dtla', 'Downtown LA', -118.2437, 34.0522, 'la', 3],
  ['santa-monica', 'Santa Monica', -118.4912, 34.0195, 'la', 2],
  ['pasadena', 'Pasadena', -118.1445, 34.1478, 'la', 2],
  ['long-beach', 'Long Beach', -118.1937, 33.7701, 'la', 2],
  ['van-nuys', 'Van Nuys', -118.449, 34.1867, 'la', 2],
  ['glendale', 'Glendale', -118.2551, 34.1425, 'la', 1],
  ['burbank', 'Burbank', -118.3090, 34.1808, 'la', 1],
  ['inglewood', 'Inglewood', -118.3531, 33.9617, 'la', 1],
  ['torrance', 'Torrance', -118.3406, 33.8358, 'la', 1],
  ['compton', 'Compton', -118.2201, 33.8958, 'la', 1],
  ['whittier', 'Whittier', -118.0328, 33.9792, 'la', 1],
  ['pomona', 'Pomona', -117.75, 34.0551, 'la', 2],
  ['el-monte', 'El Monte', -118.0276, 34.0686, 'la', 2],
  ['malibu', 'Malibu', -118.7798, 34.0259, 'la', 1],
  ['santa-clarita', 'Santa Clarita', -118.5426, 34.3917, 'la', 2],
  ['lancaster', 'Lancaster', -118.1542, 34.6868, 'la', 2],
  ['palmdale', 'Palmdale', -118.1165, 34.5794, 'la', 1],
  ['santa-ana', 'Santa Ana', -117.8678, 33.7455, 'oc', 3],
  ['anaheim', 'Anaheim', -117.9143, 33.8366, 'oc', 2],
  ['buena-park', 'Buena Park', -117.9982, 33.8675, 'oc', 1],
  ['fullerton', 'Fullerton', -117.9243, 33.8704, 'oc', 1],
  ['garden-grove', 'Garden Grove', -117.9414, 33.7739, 'oc', 1],
  ['westminster', 'Westminster', -117.994, 33.7514, 'oc', 1],
  ['huntington', 'Huntington Beach', -117.9992, 33.6595, 'oc', 2],
  ['costa-mesa', 'Costa Mesa', -117.9187, 33.6411, 'oc', 1],
  ['irvine', 'Irvine', -117.8265, 33.6846, 'oc', 2],
  ['orange', 'Orange', -117.8531, 33.7879, 'oc', 1],
  ['laguna', 'Laguna Beach', -117.7831, 33.5427, 'oc', 1],
  ['mission-viejo', 'Mission Viejo', -117.658, 33.6, 'oc', 1],
  ['san-clemente', 'San Clemente', -117.612, 33.427, 'oc', 2],
].map(([id, label, lon, lat, hub, size]) => {
  const [x, y] = pt(lon, lat);
  return { id, label, hub, size, x, y };
});

const centroid = (f) => path.centroid(f).map(r1);

const out = `// GENERATED by scripts/build-map.mjs — do not edit by hand. Run: npm run map
export const MAP_W = ${W};
export const MAP_H = ${H};
export const counties = {
  la: { path: ${JSON.stringify(d(la.mainland))}, centroid: ${JSON.stringify(centroid(la.mainland))} },
  oc: { path: ${JSON.stringify(d(oc.mainland))}, centroid: ${JSON.stringify(centroid(oc.mainland))} },
};
/** Catalina, San Clemente and the rest: drawn as land, not part of a hub. */
export const islands: string[] = ${JSON.stringify([...la.islands, ...oc.islands].map(d))};
/** Neighbouring counties, for context. */
export const context: string[] = ${JSON.stringify(neighbours.map(d))};
export const graticule = ${JSON.stringify(graticule)};
export const meridians = ${JSON.stringify(meridians)};
export const parallels = ${JSON.stringify(parallels)};
/** Pixels for ${scale.miles} miles at the middle of the map. */
export const scaleBar = ${JSON.stringify(scale)};
export type Landmark = { label: string; kind: 'water' | 'range' | 'island' | 'river'; rotate: number; x: number; y: number };
export const landmarks: Landmark[] = ${JSON.stringify(landmarks)};
export type Place = { id: string; label: string; hub: 'la' | 'oc'; size: number; x: number; y: number };
export const places: Place[] = ${JSON.stringify(places)};
`;
writeFileSync(resolve(root, 'src/components/map-data.ts'), out);
console.log('wrote map-data.ts', out.length, 'bytes; 10 mi =', scale.px, 'px');

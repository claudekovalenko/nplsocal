import { PLAN, REGIONS, PROJ, ES, type PlanDay, type Lang, type RegionId } from '@/content/pray/plan';
import MAP from '@/content/pray/map.json';
import PEOPLES_DATA from '@/content/pray/peoples.json';

export type PlanId = '100' | '365';

/** One day of a plan. `q` is a single neighborhood or town, used by the 365-day plan. */
export interface Day {
  n: number;
  t: PlanDay['t'] | 'q';
  title: string;
  r?: RegionId;
  /** The 100-day entry this day comes from (for a `q` day, the group it belongs to). */
  src: PlanDay;
  /** For a `q` day, the 100-day group day it belongs to. */
  group?: Day;
}

export const DAYS: Record<PlanId, Day[]> = (() => {
  const d100: Day[] = PLAN.map((d, i) => ({ n: i + 1, t: d.t, title: d.title, r: d.r, src: d }));
  const d365: Day[] = [];
  d100.forEach((d) => {
    if (d.t === 'p') (d.src.places ?? []).forEach((pl) => d365.push({ n: 0, t: 'q', title: pl, r: d.r, src: d.src, group: d }));
    else d365.push({ ...d });
  });
  d365.forEach((d, i) => (d.n = i + 1));
  return { '100': d100, '365': d365 };
})();

/** Spanish for any English content string; place names and anything missing stay as they are. */
export const tr = (s: string, lang: Lang) => (lang === 'es' ? (ES[s] ?? s.replace(/ & /g, ' y ')) : s);

// ---------- dates (the 365-day plan has one day per date) ----------
const yearStart = new Date(new Date().getFullYear(), 0, 1);
export const todayN = Math.min(365, Math.floor((Date.now() - yearStart.getTime()) / 864e5) + 1);
export const dateOf = (n: number, locale: string) =>
  new Date(yearStart.getFullYear(), 0, n).toLocaleDateString(locale, { month: 'long', day: 'numeric' });

// ---------- map ----------
// Every ZIP code area in mainland LA and OC is a shape. In the 100-day plan
// each belongs to one neighborhood day; in the 365-day plan a place lights the
// ZIPs carrying its postal name, or its whole group when none do.
export interface Shape {
  i: number;
  d: string;
  /** the 100-day neighborhood day this ZIP belongs to */
  day: number;
  /** postal city name */
  c: string;
  /** ZIP code */
  z: string;
  /** bounds: x0, y0, x1, y1 */
  b: number[];
  r: RegionId;
  hub: 'LA' | 'OC';
  cn: string;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const dayRegion: Record<number, RegionId> = {};
DAYS['100'].forEach((d) => d.t === 'p' && d.r && (dayRegion[d.n] = d.r));

export const MAP_LAND: string[] = MAP.land;
export const MAP_CONTEXT: string[] = MAP.ctx;
export const SHAPES: Shape[] = MAP.s.map((s, i) => {
  const r = dayRegion[s.day];
  return { ...s, i, r, hub: REGIONS[r].hub, cn: norm(s.c || '') };
});
export const FULL_VIEW = [60, 40, 880, 920] as const;

function nearestGroup([x, y]: [number, number]) {
  let best = 0;
  let bd = Infinity;
  DAYS['100'].forEach((d) => {
    if (d.t !== 'p' || !d.src.at) return;
    const [px, py] = PROJ(d.src.at);
    const k = (px - x) ** 2 + (py - y) ** 2;
    if (k < bd) [bd, best] = [k, d.n];
  });
  return best;
}

// ---------- peoples ----------
// Census estimates per ZIP code: [community index, estimate, margin of error].
const PEOPLE_IDS: string[] = PEOPLES_DATA.ids;
const ZIP_PEOPLES = PEOPLES_DATA.zips as unknown as Record<string, [number, number, number][]>;

/** Shown only when the estimate is at least this and larger than its margin of error. */
export const PEOPLE_MIN = 250;

export interface PeopleCount {
  id: string;
  est: number;
  moe: number;
}

/**
 * Communities across a set of ZIP code areas, largest first. Estimates add up;
 * margins of error combine as the square root of the sum of squares, the
 * Census Bureau's approximation for aggregated areas. Only communities that
 * clear PEOPLE_MIN and their margin of error are returned.
 */
export function peoplesIn(shapes: Shape[], only?: string[]): PeopleCount[] {
  const est = new Map<number, number>();
  const moe2 = new Map<number, number>();
  for (const z of new Set(shapes.map((s) => s.z))) {
    for (const [i, e, m] of ZIP_PEOPLES[z] ?? []) {
      est.set(i, (est.get(i) ?? 0) + e);
      moe2.set(i, (moe2.get(i) ?? 0) + m * m);
    }
  }
  return [...est]
    .map(([i, e]) => ({ id: PEOPLE_IDS[i], est: e, moe: Math.round(Math.sqrt(moe2.get(i) ?? 0)) }))
    .filter((p) => p.est >= PEOPLE_MIN && p.est > p.moe && (!only || only.includes(p.id)))
    .sort((a, b) => b.est - a.est);
}

/**
 * A people-group day lights the ZIP areas where its communities are
 * concentrated. One bar does not fit all: at 250 nearly every ZIP code in LA
 * lights for Chinese or Filipino neighbors, which shows nothing, while no ZIP
 * code has 3,000 Samoan residents. So each day steps down from 3,000 until a
 * handful of areas light up, and says which bar it used.
 */
const LIGHT_STEPS = [3000, 1500, 1000, 500, PEOPLE_MIN];
const LIGHT_ENOUGH = 6;
function zipsOver(ids: string[], min: number) {
  const want = new Set(ids.map((id) => PEOPLE_IDS.indexOf(id)));
  return SHAPES.filter((s) => (ZIP_PEOPLES[s.z] ?? []).some(([i, e, m]) => want.has(i) && e >= min && e > m));
}
/** The bar a people-group day lights its map at. */
export function lightBar(ids: string[]) {
  return LIGHT_STEPS.find((min) => zipsOver(ids, min).length >= LIGHT_ENOUGH) ?? PEOPLE_MIN;
}
function shapesWith(ids: string[]) {
  return zipsOver(ids, lightBar(ids));
}

function litOf(d: Day): Shape[] {
  if (d.src.peoples) return shapesWith(d.src.peoples);
  if (d.t === 'p') return SHAPES.filter((s) => s.day === d.n);
  if (d.t === 'q' && d.group && d.r) {
    const hub = REGIONS[d.r].hub;
    const name = norm(d.title);
    const own = SHAPES.filter((s) => s.hub === hub && s.cn === name);
    return own.length ? own : SHAPES.filter((s) => s.day === d.group!.n);
  }
  if (d.t === 'r') return SHAPES.filter((s) => s.r === d.r);
  if (d.src.pins) {
    const groups = new Set(d.src.pins.map((p) => nearestGroup(PROJ(p))));
    return SHAPES.filter((s) => groups.has(s.day));
  }
  return [];
}

/** Which shapes each day lights, per plan, indexed by day number − 1. */
export const LIT: Record<PlanId, Shape[][]> = { '100': DAYS['100'].map(litOf), '365': DAYS['365'].map(litOf) };

/** Tapping a shape goes to the first day that lights it as a place. */
export const SHAPE_DAY: Record<PlanId, number[]> = {
  '100': SHAPES.map((s) => s.day),
  '365': SHAPES.map((s) => {
    const i = DAYS['365'].findIndex((d, k) => d.t === 'q' && LIT['365'][k].includes(s));
    return i >= 0 ? i + 1 : DAYS['365'].findIndex((d) => d.t === 'q' && d.group?.n === s.day) + 1;
  }),
};

export function bounds(list: Shape[]) {
  let b = [Infinity, Infinity, -Infinity, -Infinity];
  list.forEach((s) => (b = [Math.min(b[0], s.b[0]), Math.min(b[1], s.b[1]), Math.max(b[2], s.b[2]), Math.max(b[3], s.b[3])]));
  return b;
}

// ---------- the list of all days, in sections ----------
export interface Section {
  key: string;
  r?: RegionId;
  days: Day[];
}
function sections(list: Day[]): Section[] {
  const out: Section[] = [];
  let sec: Section | null = null;
  list.forEach((d) => {
    const key =
      d.t === 'a' ? (d.n === 1 ? 'start' : 'end') : d.t === 'r' ? d.r! : d.src.sec && sec?.key !== 'both' && d.t === 'f' ? 'both' : null;
    if (key || !sec) {
      sec = { key: key ?? 'start', r: d.t === 'r' ? d.r : undefined, days: [] };
      out.push(sec);
    }
    sec.days.push(d);
  });
  return out;
}
export const SECTIONS: Record<PlanId, Section[]> = { '100': sections(DAYS['100']), '365': sections(DAYS['365']) };

// ---------- peoples per day ----------
/**
 * The communities each day prays for, per plan: on a place or region day the
 * ones living there; on a peoples focus day its own communities across both
 * counties; on the first and last days, everyone. Other focus days have none.
 */
export const DAY_PEOPLES: Record<PlanId, PeopleCount[][]> = (() => {
  const of = (list: Day[], lit: Shape[][]) =>
    list.map((d, k) => {
      if (d.src.peoples) return peoplesIn(SHAPES, d.src.peoples);
      if (d.t === 'a') return peoplesIn(SHAPES);
      if (d.t === 'f') return [];
      return peoplesIn(lit[k]);
    });
  return { '100': of(DAYS['100'], LIT['100']), '365': of(DAYS['365'], LIT['365']) };
})();

/** The peoples focus day(s) that pray for a community in depth, per plan. */
export const PEOPLE_DAY: Record<PlanId, Record<string, number>> = (() => {
  const of = (list: Day[]) => {
    const out: Record<string, number> = {};
    list.forEach((d) => d.src.peoples?.forEach((id) => (out[id] ??= d.n)));
    return out;
  };
  return { '100': of(DAYS['100']), '365': of(DAYS['365']) };
})();

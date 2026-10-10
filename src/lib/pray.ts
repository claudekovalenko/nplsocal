import { PLAN, REGIONS, PROJ, ES, type PlanDay, type Lang, type RegionId } from '@/content/pray/plan';
import MAP from '@/content/pray/map.json';

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

function litOf(d: Day): Shape[] {
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

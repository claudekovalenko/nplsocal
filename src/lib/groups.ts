/** Data model for the tracker: one row per group or church. */
export type HubKey = 'la' | 'oc';

export const ELEMENTS = [
  ['baptism', 'Baptism'],
  ['word', 'Word'],
  ['fellowship', 'Fellowship'],
  ['lordsSupper', "Lord's Supper"],
  ['prayer', 'Prayer'],
  ['giving', 'Giving'],
  ['praise', 'Praise'],
  ['disciples', 'Making disciples'],
  ['leaders', 'Leaders'],
] as const;
export type ElementKey = (typeof ELEMENTS)[number][0];

export interface Group {
  id: string;
  name: string;
  hub: HubKey;
  area: string;
  leader: string;
  /** The group this one came out of. Empty for a first-generation group. */
  parentId: string | null;
  /** 'group' = dotted circle, 'church' = solid (covenanted) circle. */
  status: 'group' | 'church';
  started: string; // YYYY-MM-DD
  attending: number;
  believers: number;
  baptized: number;
  elements: Partial<Record<ElementKey, boolean>>;
  notes: string;
  updatedAt: string;
}

export const emptyGroup = (hub: HubKey = 'la'): Group => ({
  id: '',
  name: '',
  hub,
  area: '',
  leader: '',
  parentId: null,
  status: 'group',
  started: new Date().toISOString().slice(0, 10),
  attending: 0,
  believers: 0,
  baptized: 0,
  elements: {},
  notes: '',
  updatedAt: new Date().toISOString(),
});

/** Generation = 1 + generation of parent. Cycles or missing parents count as 1. */
export function generations(groups: Group[]): Record<string, number> {
  const byId = new Map(groups.map((g) => [g.id, g]));
  const memo: Record<string, number> = {};
  const gen = (id: string, seen: Set<string>): number => {
    if (memo[id]) return memo[id];
    const g = byId.get(id);
    if (!g || !g.parentId || seen.has(id) || !byId.has(g.parentId)) return (memo[id] = 1);
    seen.add(id);
    return (memo[id] = 1 + gen(g.parentId, seen));
  };
  groups.forEach((g) => gen(g.id, new Set()));
  return memo;
}

export function summarize(groups: Group[]) {
  const gens = generations(groups);
  const by = (hub?: HubKey) => {
    const list = hub ? groups.filter((g) => g.hub === hub) : groups;
    return {
      groups: list.filter((g) => g.status === 'group').length,
      churches: list.filter((g) => g.status === 'church').length,
      attending: list.reduce((n, g) => n + g.attending, 0),
      believers: list.reduce((n, g) => n + g.believers, 0),
      baptized: list.reduce((n, g) => n + g.baptized, 0),
      maxGen: list.reduce((n, g) => Math.max(n, gens[g.id] ?? 1), 0),
    };
  };
  return { all: by(), la: by('la'), oc: by('oc'), gens };
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

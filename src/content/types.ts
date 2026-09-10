export type HubId = 'la' | 'oc' | 'socal';

export type FieldId = 'entry' | 'gospel' | 'discipleship' | 'church' | 'leadership';

export interface Hub {
  id: HubId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  regions: string[];
  /** Placeholder until the real hub sites are merged in. */
  legacyUrl?: string;
  contactEmail?: string;
  gatherings: { name: string; cadence: string; note?: string }[];
  accent: string;
}

export interface Field {
  id: FieldId;
  number: number;
  name: string;
  question: string;
  summary: string;
  description: string;
  scripture: { ref: string; text: string };
  toolSlugs: string[];
}

export interface Tool {
  slug: string;
  name: string;
  field: FieldId;
  tagline: string;
  summary: string;
  description: string;
  steps?: { title: string; detail: string }[];
  scripture?: string[];
  tags?: string[];
  /** Optional external reference (video, PDF). Kept optional so the app works offline. */
  links?: { label: string; url: string }[];
}

export interface Training {
  slug: string;
  name: string;
  length: string;
  audience: string;
  summary: string;
  outcomes: string[];
}

export interface Event {
  id: string;
  title: string;
  type: 'training' | 'gathering' | 'prayer' | 'outreach' | 'online';
  hub: HubId;
  /** ISO date, local to America/Los_Angeles */
  start: string;
  end?: string;
  location: string;
  city?: string;
  description: string;
  registerUrl?: string;
  online?: boolean;
}

export interface Faq {
  q: string;
  a: string;
}

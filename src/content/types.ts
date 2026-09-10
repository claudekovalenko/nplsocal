export type HubId = 'la' | 'oc' | 'socal';

export type FieldId = 'entry' | 'gospel' | 'discipleship' | 'church' | 'leadership';

export interface Hub {
  id: HubId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  regions: string[];
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

/**
 * Event tiers keep the calendar readable:
 *  - network: for everyone across SoCal — shown big on Home and the top of Events
 *  - hub:     open to everyone in one hub — the normal calendar
 *  - group:   contained to a specific group or location — hidden unless asked for
 */
export type EventTier = 'network' | 'hub' | 'group';

export interface Event {
  id: string;
  title: string;
  type: 'training' | 'gathering' | 'prayer' | 'outreach' | 'online' | 'push';
  tier: EventTier;
  hub: HubId;
  /** ISO date, Pacific time. For network events with unsettled dates, keep a best guess here and set dateLabel. */
  start: string;
  end?: string;
  /** Human date when exact dates are not set yet, e.g. "Early 2027". */
  dateLabel?: string;
  location: string;
  city?: string;
  /** Who this is for, e.g. "Practitioners", "Santa Ana leaders". Shown on group-tier events. */
  audience?: string;
  description: string;
  registerUrl?: string;
  online?: boolean;
}

export interface Faq {
  q: string;
  a: string;
}

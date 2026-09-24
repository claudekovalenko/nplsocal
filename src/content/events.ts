import type { Event } from './types';

/**
 * Sample events — replace with real dates from the LA and OC hubs.
 * Network-tier events are the big ones everyone should know about.
 */
export const events: Event[] = [
  // ── Network: for everyone ──────────────────────────────────────
  {
    id: 'la-metro-gospel-push-2027',
    title: 'L.A. Metro Gospel Push 2027',
    type: 'push',
    tier: 'network',
    hub: 'la',
    // Runs over New Year: Dec 30 2026 through Jan 2 2027.
    start: '2026-12-30T09:00:00-08:00',
    end: '2027-01-02T21:00:00-08:00',
    location: 'Across the L.A. metro',
    description: 'Four days of prayer, gospel conversations, and training across the L.A. metro. Open to the whole network.',
    registerUrl: '#',
  },
  {
    id: 'oc-mid-level-2027',
    title: 'Orange County Mid-Level',
    type: 'training',
    tier: 'network',
    hub: 'oc',
    // Friday and Saturday, Feb 19–20 2027.
    start: '2027-02-19T09:00:00-08:00',
    end: '2027-02-20T17:00:00-08:00',
    location: 'Orange County',
    description: 'Two-day intensive for practitioners past the 4 Fields, taking a stream toward generations.',
    registerUrl: '#',
  },
  {
    id: 'socal-gospel-conversation-nov',
    title: 'Gospel Conversation Training',
    type: 'training',
    tier: 'network',
    hub: 'socal',
    start: '2026-11-14T09:00:00-08:00',
    end: '2026-11-14T17:00:00-08:00',
    location: 'Neighbors and Nations',
    description: 'A full day on starting and carrying gospel conversations. Open to the whole network.',
    registerUrl: '#',
  },

  // ── Hub: open to a hub ─────────────────────────────────────────
  {
    id: 'socal-prayer-oct',
    title: 'SoCal Prayer Night',
    type: 'prayer',
    tier: 'hub',
    hub: 'socal',
    start: '2026-10-14T20:00:00-07:00',
    end: '2026-10-14T21:00:00-07:00',
    location: 'Zoom',
    description: 'Both hubs together, praying for laborers and for the lost.',
    online: true,
    registerUrl: '#',
  },
  {
    id: 'oc-411-oct',
    title: '411 Training',
    type: 'training',
    tier: 'hub',
    hub: 'oc',
    start: '2026-10-03T09:00:00-07:00',
    end: '2026-10-03T12:00:00-07:00',
    location: 'Host home — sent on registration',
    city: 'Santa Ana',
    description: 'Your first step. Leave with a 100 List, a testimony, and a gospel tool.',
    registerUrl: '#',
  },
  {
    id: 'la-ioi-oct',
    title: 'Iron on Iron',
    type: 'gathering',
    tier: 'hub',
    hub: 'la',
    start: '2026-10-08T19:00:00-07:00',
    end: '2026-10-08T21:00:00-07:00',
    location: 'Shared with practitioners',
    city: 'Los Angeles',
    description: 'Bring your generational map and church circles.',
  },
  {
    id: 'la-4f-nov',
    title: '4 Fields Training',
    type: 'training',
    tier: 'hub',
    hub: 'la',
    start: '2026-11-06T09:00:00-08:00',
    end: '2026-11-07T17:00:00-08:00',
    location: 'Host church — details on registration',
    city: 'Pasadena',
    description: 'Two days, all Four Fields. Prerequisite: 411.',
    registerUrl: '#',
  },
  {
    id: 'oc-walk-nov',
    title: 'Prayer Walk',
    type: 'outreach',
    tier: 'hub',
    hub: 'oc',
    start: '2026-11-14T10:00:00-08:00',
    end: '2026-11-14T12:00:00-08:00',
    location: 'Asian Garden Mall',
    city: 'Westminster',
    description: 'Little Saigon, then lunch.',
  },
  {
    id: 'oc-ioi-nov',
    title: 'Iron on Iron',
    type: 'gathering',
    tier: 'hub',
    hub: 'oc',
    start: '2026-11-19T19:00:00-08:00',
    end: '2026-11-19T21:00:00-08:00',
    location: 'Shared with practitioners',
    city: 'Irvine',
    description: 'Bring your generational map and church circles.',
  },

  // ── Group: contained ───────────────────────────────────────────
  {
    id: 'sa-leaders-oct',
    title: 'Santa Ana leaders huddle',
    type: 'gathering',
    tier: 'group',
    hub: 'oc',
    start: '2026-10-21T19:00:00-07:00',
    end: '2026-10-21T20:30:00-07:00',
    location: 'Host home',
    city: 'Santa Ana',
    audience: 'Santa Ana group leaders',
    description: 'Monthly check-in for leaders of Santa Ana groups.',
  },
  {
    id: 'sgv-3thirds-oct',
    title: 'SGV 3/3rds group',
    type: 'gathering',
    tier: 'group',
    hub: 'la',
    start: '2026-10-16T19:00:00-07:00',
    end: '2026-10-16T20:30:00-07:00',
    location: 'Host home',
    city: 'El Monte',
    audience: 'SGV practitioners',
    description: 'Weekly 3/3rds. Newcomers by invitation.',
  },
];

export const upcomingEvents = (now = new Date()) =>
  events.filter((e) => new Date(e.end ?? e.start) >= now).sort((a, b) => +new Date(a.start) - +new Date(b.start));

export const featuredEvents = (now = new Date()) => upcomingEvents(now).filter((e) => e.tier === 'network');

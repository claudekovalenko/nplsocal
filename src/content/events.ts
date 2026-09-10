import type { Event } from './types';

/**
 * Sample events. Replace with real dates from the LA and OC hubs
 * (or wire this file to a shared calendar / Airtable feed later).
 * Dates are ISO strings in Pacific time.
 */
export const events: Event[] = [
  {
    id: 'oc-411-oct',
    title: '411 Training — Orange County',
    type: 'training',
    hub: 'oc',
    start: '2026-10-03T09:00:00-07:00',
    end: '2026-10-03T12:00:00-07:00',
    location: 'Host home — address sent on registration',
    city: 'Santa Ana',
    description: 'Your first step into the network. Leave with a 100 List, a testimony, and a gospel tool you can use the same week.',
    registerUrl: '#',
  },
  {
    id: 'la-ioi-oct',
    title: 'Iron on Iron — Los Angeles',
    type: 'gathering',
    hub: 'la',
    start: '2026-10-08T19:00:00-07:00',
    end: '2026-10-08T21:00:00-07:00',
    location: 'Location shared with practitioners',
    city: 'Los Angeles',
    description: 'Monthly practitioner gathering. Bring your generational map and church circles.',
  },
  {
    id: 'socal-prayer-oct',
    title: 'SoCal Prayer Night (online)',
    type: 'prayer',
    hub: 'socal',
    start: '2026-10-14T20:00:00-07:00',
    end: '2026-10-14T21:00:00-07:00',
    location: 'Zoom',
    description: 'Both hubs together, praying for laborers and for the lost across Los Angeles and Orange County.',
    online: true,
    registerUrl: '#',
  },
  {
    id: 'la-4f-nov',
    title: '4 Fields Training — Los Angeles',
    type: 'training',
    hub: 'la',
    start: '2026-11-06T09:00:00-08:00',
    end: '2026-11-07T17:00:00-08:00',
    location: 'Host church — details on registration',
    city: 'Pasadena',
    description: 'Two-day intensive covering all Four Fields and leadership. Prerequisite: 411 Training.',
    registerUrl: '#',
  },
  {
    id: 'oc-walk-nov',
    title: 'Prayer Walk — Little Saigon',
    type: 'outreach',
    hub: 'oc',
    start: '2026-11-14T10:00:00-08:00',
    end: '2026-11-14T12:00:00-08:00',
    location: 'Meet at Asian Garden Mall',
    city: 'Westminster',
    description: 'Praying on-site for the neighborhoods of Westminster and Garden Grove, then debrief over lunch.',
  },
  {
    id: 'oc-ioi-nov',
    title: 'Iron on Iron — Orange County',
    type: 'gathering',
    hub: 'oc',
    start: '2026-11-19T19:00:00-08:00',
    end: '2026-11-19T21:00:00-08:00',
    location: 'Location shared with practitioners',
    city: 'Irvine',
    description: 'Monthly practitioner gathering. Bring your generational map and church circles.',
  },
];

export const upcomingEvents = (now = new Date()) =>
  events
    .filter((e) => new Date(e.end ?? e.start) >= now)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

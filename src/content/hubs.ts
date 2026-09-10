import type { Hub } from './types';

export const hubs: Hub[] = [
  {
    id: 'la',
    name: 'No Place Left Los Angeles',
    shortName: 'Los Angeles',
    tagline: 'Every neighborhood. Every language. Every people.',
    description: 'Ten million people from every nation on earth. Disciple-makers from the Westside to the San Gabriel Valley, South LA to the Valley.',
    regions: [
      'Central & Downtown LA',
      'Westside & South Bay',
      'San Fernando Valley',
      'San Gabriel Valley',
      'South LA & Gateway Cities',
      'Long Beach',
      'Antelope & Santa Clarita Valleys',
    ],
    legacyUrl: 'https://noplaceleft-la.org',
    contactEmail: 'la@nplsocal.net',
    gatherings: [
      { name: 'Iron on Iron', cadence: 'Monthly', note: 'Practitioners sharpen one another around the Four Fields.' },
      { name: 'Prayer & Vision Night', cadence: 'Monthly', note: 'Interceding for the lost of LA and for laborers.' },
      { name: '4 Fields Training', cadence: 'Quarterly', note: 'Two-day intensive for new and returning practitioners.' },
    ],
    accent: 'from-sky-500 to-indigo-600',
  },
  {
    id: 'oc',
    name: 'No Place Left Orange County',
    shortName: 'Orange County',
    tagline: 'From the coast to the canyons.',
    description: 'Thirty-four cities, three million people. Disciple-makers across North, Central, and South County.',
    regions: [
      'North County (Fullerton, Anaheim, Brea)',
      'Central County (Santa Ana, Orange, Garden Grove)',
      'West County (Huntington Beach, Westminster)',
      'South County (Irvine, Mission Viejo, San Clemente)',
      'Coastal (Newport, Laguna, Dana Point)',
    ],
    legacyUrl: 'https://www.nplsocal.net',
    contactEmail: 'oc@nplsocal.net',
    gatherings: [
      { name: 'Iron on Iron', cadence: 'Monthly', note: 'Practitioners sharpen one another around the Four Fields.' },
      { name: 'Prayer Walk', cadence: 'Monthly', note: 'Rotating through OC neighborhoods.' },
      { name: '4 Fields Training', cadence: 'Quarterly', note: 'Two-day intensive for new and returning practitioners.' },
    ],
    accent: 'from-amber-400 to-orange-600',
  },
];

export const hubById = (id: string) => hubs.find((h) => h.id === id);

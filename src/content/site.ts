export const site = {
  name: 'No Place Left SoCal',
  shortName: 'NPL SoCal',
  hashtag: '#NoPlaceLeft',
  tagline: 'Until there is no place left.',
  headline: 'Multiplying disciples, churches, and leaders across Southern California.',
  description: 'Ordinary disciples across Los Angeles and Orange County, laboring together until there is no place left.',
  vision:
    'Reproducing disciples, churches, and leaders among the lost across every community of Los Angeles and Orange County, and from here to the ends of the earth.',
  contact: {
    email: 'hello@nplsocal.net',
    whatsapp: '',
    instagram: '',
    youtube: '',
    facebook: '',
  },
  urls: {
    international: 'https://noplaceleft.net',
    la: 'https://noplaceleft-la.org',
    socal: 'https://www.nplsocal.net',
  },
  scripture: {
    ref: 'Romans 15:23',
    text: 'But now, since I no longer have any room for work in these regions…',
    fullRef: 'Romans 15:19–23',
  },
} as const;

/** Five doors. Everything else is reachable from inside one of them. */
export const navigation = [
  { to: '/vision', label: 'Vision' },
  { to: '/tools', label: 'Tools' },
  { to: '/regions', label: 'Regions' },
  { to: '/events', label: 'Events' },
  { to: '/track', label: 'Track' },
] as const;

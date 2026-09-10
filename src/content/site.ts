export const site = {
  name: 'No Place Left SoCal',
  shortName: 'NPL SoCal',
  hashtag: '#NoPlaceLeft',
  tagline: 'Until there is no place left.',
  headline: 'Multiplying disciples, churches, and leaders across Southern California.',
  description:
    'A network of ordinary disciples across Los Angeles and Orange County, laboring together so that every neighborhood, language, and people has a reproducing church — until there is no place left.',
  vision:
    'Reproducing disciples, churches, and leaders among the lost across every community of Los Angeles and Orange County, and from here to the ends of the earth.',
  // Replace with the network's real contact points.
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

export const navigation = [
  { to: '/', label: 'Home', end: true },
  { to: '/vision', label: 'Vision' },
  { to: '/four-fields', label: 'Four Fields' },
  { to: '/tools', label: 'Toolbox' },
  { to: '/training', label: 'Training' },
  { to: '/events', label: 'Events' },
  { to: '/hubs', label: 'Hubs' },
  { to: '/connect', label: 'Connect' },
] as const;

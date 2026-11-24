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
    /** Where people send events they are hosting. Shown quietly under the calendar. */
    events: 'hello@nplsocal.net',
    /**
     * Network-wide Signal group invite (https://signal.group/#…). Shown on the
     * Events page next to the calendar subscription once it is filled in.
     */
    signal: '',
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

/** Two doors, plus an About menu. Everything else lives inside one of them. */
export const navigation = [
  { to: '/push', label: 'The Push' },
  { to: '/events', label: 'Events' },
  { to: '/pray', label: 'Pray' },
  { to: '/tracker', label: 'Tracker' },
] as const;

export const aboutMenu = [
  { to: '/about', label: 'About' },
  { to: '/regions', label: 'Regions' },
  { to: '/connect', label: 'Connect' },
] as const;

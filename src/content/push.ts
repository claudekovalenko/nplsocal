/**
 * The L.A. Metro Gospel Push — the network's central event.
 *
 * Everything on the /push page reads from here. The wording, schedule, hosts,
 * lodging note and FAQ come from lapush2027.com, so keep the two in step.
 */

export interface ScheduleBlock {
  /** As people say it, e.g. "9am – 12pm" or "Evening". Blocks are shown in the order written. */
  time: string;
  title: string;
  detail?: string;
  /** Where it happens, when it differs from the day's base location. */
  place?: string;
  kind: 'gather' | 'train' | 'field' | 'meal' | 'pray' | 'debrief' | 'rest' | 'celebrate';
}

export interface ScheduleDay {
  /** YYYY-MM-DD, Pacific. Must match a day of the event's date range. */
  date: string;
  title: string;
  summary?: string;
  place?: string;
  blocks: ScheduleBlock[];
}

export const PUSH_EVENT_ID = 'la-metro-gospel-push-2027';

export const push = {
  eventId: PUSH_EVENT_ID,
  name: 'L.A. Metro Gospel Push',
  year: '2027',
  tagline: 'There is no better way to start a new year than with the people of God out sharing the only hope for the world!',

  /** Paste the Signal group invite link here to switch the button on. */
  signalUrl: '',
  /** Optional: a printed or downloadable field guide. */
  guideUrl: '',

  schedule: [
    {
      date: '2026-12-30',
      title: 'December 30',
      blocks: [{ time: '6pm', title: 'Arrival and kick-off dinner', kind: 'meal' }],
    },
    {
      date: '2026-12-31',
      title: 'December 31',
      blocks: [
        { time: '9am – 12pm', title: 'Worship, celebration, and training', kind: 'train' },
        { time: '12pm – evening', title: 'Harvest time', kind: 'field' },
        { time: 'Evening', title: "New Year's Eve party!", kind: 'celebrate' },
      ],
    },
    {
      date: '2027-01-01',
      title: 'January 1',
      blocks: [
        { time: '9am – 12pm', title: 'Worship, celebration, and training', kind: 'train' },
        { time: '12pm – evening', title: 'Harvest time', kind: 'field' },
      ],
    },
    {
      date: '2027-01-02',
      title: 'January 2',
      blocks: [
        { time: '9am – 12pm', title: 'Worship, celebration, and training', kind: 'train' },
        { time: '12pm – 6pm', title: 'Harvest time', kind: 'field' },
        { time: '6pm', title: 'Dinner and celebration', kind: 'meal' },
      ],
    },
  ] satisfies ScheduleDay[],

  /** What is a PUSH? */
  what: {
    lead: 'A PUSH is a group of laborers assembling in a place to find where God is at work in the city.',
    focus: [
      {
        letter: 'P',
        word: 'Prayer',
        text: 'Scheduled and guided times of prayer will be given beforehand to hear from God and ask Him for what He told us to ask for: His reign and rule on Earth as it is in Heaven!',
      },
      {
        letter: 'U',
        word: 'Unity',
        text: 'We will come together as a team to be trained, go, make disciples, eat together and celebrate together!',
      },
      {
        letter: 'S',
        word: 'Share',
        text: 'We will sow the seed of the word by sharing stories and the gospel to find where God is at work.',
      },
      {
        letter: 'H',
        word: 'Houses of Peace',
        text: 'As we follow Jesus’ strategy from Luke 10, we will be looking for “houses of peace” (families, networks, communities) that welcome the messenger, message, and mission.',
      },
    ],
  },

  hosts: {
    lead: 'Local church planters in the region, represented by multiple churches and organizations, including:',
    names: ['Neighbors and Nations Church', 'e3 Partners', 'NoPlaceLeft'],
    more: 'And more.',
  },

  stay: [
    'There are hotels and Airbnbs within a 3-mile radius of Neighbors and Nations (6575 Crescent Ave, Buena Park, CA 90620).',
    'Or stay with a friend!',
  ],

  faq: [
    { q: 'Is there a cost?', a: "No! It's a free event, but we need you to register." },
    { q: 'Can I bring my kids?', a: "Yes, but there won't be childcare." },
    {
      q: 'Can I come to only part of it?',
      a: 'Yes, but the training is progressive, so you will miss key parts of what you need if you are unsure how to engage with the gospel and follow up.',
    },
    { q: 'Can I bring whoever?', a: 'Yes, but please register so we can plan for food.' },
  ],
} as const;

export const blockKindLabel: Record<ScheduleBlock['kind'], string> = {
  gather: 'Gather',
  train: 'Training',
  field: 'In the field',
  meal: 'Meal',
  pray: 'Prayer',
  debrief: 'Debrief',
  rest: 'Rest',
  celebrate: 'Celebration',
};

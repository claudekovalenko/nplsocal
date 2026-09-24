/**
 * The L.A. Metro Gospel Push — the network's central event.
 *
 * Everything on the /push page reads from here.
 *
 * The schedule below is a PLACEHOLDER standing in until the real plan is set.
 * While `scheduleStatus` is 'draft' the page says so plainly, so nobody books
 * travel around invented times. Replace the blocks, flip that one word to
 * 'final', and the warnings disappear.
 */

export interface ScheduleBlock {
  /** 24-hour start, e.g. "08:30". Blocks are shown in the order written. */
  time: string;
  title: string;
  detail?: string;
  /** Where it happens, when it differs from the day's base location. */
  place?: string;
  kind: 'gather' | 'train' | 'field' | 'meal' | 'pray' | 'debrief' | 'rest';
}

export interface ScheduleDay {
  /** YYYY-MM-DD, Pacific. Must match a day of the event's date range. */
  date: string;
  title: string;
  summary: string;
  place?: string;
  blocks: ScheduleBlock[];
}

export const PUSH_EVENT_ID = 'la-metro-gospel-push-2027';

export const push = {
  eventId: PUSH_EVENT_ID,
  name: 'L.A. Metro Gospel Push',
  year: '2027',
  tagline: 'Four days. One city. Every neighborhood we can reach.',
  intro:
    'Teams from across the network converge on the L.A. metro to pray, share the gospel, and start new groups. You do not need experience — you will be trained on the first day and sent out with a team.',

  /**
   * 'draft' while the times below are a placeholder; 'final' once the real
   * plan is in. The only thing that needs changing to stop the warnings.
   */
  scheduleStatus: 'draft' as 'draft' | 'final',

  /** Paste the Signal group invite link here to switch the button on. */
  signalUrl: '',
  /** Optional: a printed or downloadable field guide. */
  guideUrl: '',

  bring: [
    'A Bible and something to write with',
    'Comfortable walking shoes',
    'A phone with the site saved to your home screen',
    'Water and a jacket — December evenings get cold',
  ],

  schedule: [
    {
      date: '2026-12-30',
      title: 'Day one · Gather and train',
      summary: 'Everyone arrives, gets trained, and goes out for a first afternoon in the field.',
      place: 'Host site, Downtown L.A.',
      blocks: [
        { time: '09:00', title: 'Arrive and check in', kind: 'gather' },
        { time: '10:00', title: 'Vision and training', detail: 'The Four Fields, your 100 List, and the gospel tools you will use this week.', kind: 'train' },
        { time: '12:00', title: 'Lunch and team assignments', kind: 'meal' },
        { time: '13:30', title: 'Out in the field', detail: 'Teams go to their assigned areas.', kind: 'field' },
        { time: '17:30', title: 'Back together', kind: 'gather' },
        { time: '18:30', title: 'Dinner and debrief', detail: 'Report the day, celebrate, troubleshoot.', kind: 'debrief' },
        { time: '20:00', title: 'Prayer', kind: 'pray' },
      ],
    },
    {
      date: '2026-12-31',
      title: 'Day two · Full day out',
      summary: 'A full day in the field, then bringing in the new year together in prayer.',
      blocks: [
        { time: '08:30', title: 'Prayer and sending', kind: 'pray' },
        { time: '09:30', title: 'Out in the field', kind: 'field' },
        { time: '12:30', title: 'Lunch with your team', kind: 'meal' },
        { time: '13:30', title: 'Back out', kind: 'field' },
        { time: '17:30', title: 'Debrief and daily report', detail: 'Turn in your numbers and stories.', kind: 'debrief' },
        { time: '19:00', title: 'Dinner', kind: 'meal' },
        { time: '21:00', title: 'New year prayer', detail: 'Bringing in the year over the city.', kind: 'pray' },
      ],
    },
    {
      date: '2027-01-01',
      title: 'Day three · Follow up',
      summary: 'Going back to the people who were open, and starting groups where there is interest.',
      blocks: [
        { time: '09:30', title: 'Prayer and sending', kind: 'pray' },
        { time: '10:30', title: 'Follow-up visits', detail: 'Return to households of peace from the first two days.', kind: 'field' },
        { time: '13:00', title: 'Lunch', kind: 'meal' },
        { time: '14:00', title: 'Start groups', detail: 'Where someone is open, begin a first discovery group on the spot.', kind: 'field' },
        { time: '17:30', title: 'Debrief and daily report', kind: 'debrief' },
        { time: '19:00', title: 'Dinner and stories', kind: 'debrief' },
      ],
    },
    {
      date: '2027-01-02',
      title: 'Day four · Hand off and send',
      summary: 'Making sure every new person and group is connected to someone local before we scatter.',
      blocks: [
        { time: '09:30', title: 'Prayer', kind: 'pray' },
        { time: '10:00', title: 'Hand off', detail: 'Connect every new contact and group to a local practitioner.', kind: 'debrief' },
        { time: '12:00', title: 'Lunch', kind: 'meal' },
        { time: '13:00', title: 'Final report and celebration', detail: 'What happened across the four days.', kind: 'debrief' },
        { time: '15:00', title: 'Sending and goodbyes', kind: 'gather' },
      ],
    },
  ] satisfies ScheduleDay[],
} as const;

export const blockKindLabel: Record<ScheduleBlock['kind'], string> = {
  gather: 'Gather',
  train: 'Training',
  field: 'In the field',
  meal: 'Meal',
  pray: 'Prayer',
  debrief: 'Debrief',
  rest: 'Rest',
};

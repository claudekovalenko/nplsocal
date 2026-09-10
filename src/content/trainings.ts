import type { Training } from './types';

export const trainings: Training[] = [
  {
    slug: '411',
    name: '411 Training',
    length: '2–3 hours',
    audience: 'Every believer — first step for anyone new to the network.',
    summary:
      'The on-ramp. Jesus\' four calls, one commission, one vision — then hands-on practice with your 100 List, testimony, and the 3 Circles gospel so you leave ready to share this week.',
    outcomes: [
      'Understand the #NoPlaceLeft vision',
      'Build and pray through your 100 List',
      'Share your 15-second testimony',
      'Share the gospel with 3 Circles',
    ],
  },
  {
    slug: 'four-fields',
    name: '4 Fields Training',
    length: '2 days',
    audience: 'Anyone who has done the 411 and wants the full framework.',
    summary:
      'A deep dive into all Four Fields plus leadership: entry, gospel, discipleship, church, and leadership development. Heavy on practice, with coaching built in.',
    outcomes: [
      'Explain and draw the Four Fields',
      'Lead a 3/3rds group and a SWORD study',
      'Draw a Church Circle and start a generational map',
      'Set 30/60/90-day goals with a coach',
    ],
  },
  {
    slug: 'iron-on-iron',
    name: 'Iron on Iron',
    length: 'Monthly, ~2 hours',
    audience: 'Practitioners actively working the fields.',
    summary:
      'Ongoing peer coaching. Bring your map, report honestly, get sharpened, and commit to next steps. This is where the network actually becomes a network.',
    outcomes: ['Accountability around real goals', 'Peer troubleshooting', 'Celebration of what God is doing', 'Prayer partners'],
  },
  {
    slug: 'coaching',
    name: 'Coaching & Mentoring',
    length: 'Ongoing',
    audience: 'Anyone who wants a practitioner walking with them.',
    summary:
      'One-on-one or small-cohort coaching with an experienced practitioner in your hub, following the MAWL pattern until you are launching others.',
    outcomes: ['A coach in your area', 'Regular check-ins', 'A pathway toward training others'],
  },
];

import type { Field } from './types';

/**
 * The Four Fields of Kingdom Growth (Mark 4:26–29) — the shared framework
 * across the #NoPlaceLeft network. The fifth "field" is leadership,
 * which sits at the center of the other four.
 */
export const fields: Field[] = [
  {
    id: 'entry',
    number: 1,
    name: 'Entry',
    question: 'How do we find people who are open?',
    summary: 'Praying, going, and looking for households of peace.',
    description:
      'Before anything grows, the farmer goes out to the field. Field 1 is about getting among the lost with prayer and intentionality — mapping our relationships, walking our neighborhoods, and looking for the "person of peace" God has already prepared (Luke 10:1–9).',
    scripture: {
      ref: 'Luke 10:5–6',
      text: 'Whatever house you enter, first say, "Peace be to this house!" And if a son of peace is there, your peace will rest upon him.',
    },
    toolSlugs: ['100-list', 'prayer-walking', 'person-of-peace', 'testimony'],
  },
  {
    id: 'gospel',
    number: 2,
    name: 'Gospel',
    question: 'How do we share so people can respond?',
    summary: 'Simple, reproducible ways to tell the good news.',
    description:
      'Seed goes into the ground. Field 2 is sowing the gospel broadly and clearly, in ways that a brand-new believer could pick up and repeat the same week — with a call to respond.',
    scripture: {
      ref: 'Romans 1:16',
      text: 'For I am not ashamed of the gospel, for it is the power of God for salvation to everyone who believes.',
    },
    toolSlugs: ['411', '3-circles', 'testimony'],
  },
  {
    id: 'discipleship',
    number: 3,
    name: 'Discipleship',
    question: 'How do we help new believers obey Jesus and reproduce?',
    summary: 'Short-term and long-term patterns that make obedient disciples.',
    description:
      'The seed sprouts and grows. Field 3 builds a rhythm of hearing and obeying — starting with the basic commands of Christ, then moving into a lifelong pattern of Word, obedience, and reproduction.',
    scripture: {
      ref: 'Matthew 28:19–20',
      text: 'Go therefore and make disciples of all nations… teaching them to observe all that I have commanded you.',
    },
    toolSlugs: ['commands-of-christ', '3-thirds', 'sword-method', 'discovery-bible-study'],
  },
  {
    id: 'church',
    number: 4,
    name: 'Church',
    question: 'How do disciples become a healthy, reproducing church?',
    summary: 'Simple, biblical churches that gather and send.',
    description:
      'The grain matures into a harvest. Field 4 helps groups of disciples become churches — identifying together with Christ, covenanting together, and living out the marks of a healthy church that can reproduce.',
    scripture: {
      ref: 'Acts 2:42',
      text: 'And they devoted themselves to the apostles\' teaching and the fellowship, to the breaking of bread and the prayers.',
    },
    toolSlugs: ['church-circle', 'generational-map'],
  },
  {
    id: 'leadership',
    number: 5,
    name: 'Leadership',
    question: 'How do we raise leaders who raise leaders?',
    summary: 'Model, assist, watch, launch — at every level.',
    description:
      'At the center of all four fields sits leadership development. Multiplication stalls without leaders who are trained to train others. This field is about intentionally developing leaders through every stage of the movement.',
    scripture: {
      ref: '2 Timothy 2:2',
      text: 'What you have heard from me in the presence of many witnesses entrust to faithful men, who will be able to teach others also.',
    },
    toolSlugs: ['mawl', 'five-levels', 'iron-on-iron'],
  },
];

export const fieldById = (id: string) => fields.find((f) => f.id === id);

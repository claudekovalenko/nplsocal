import type { Tool } from './types';

export const tools: Tool[] = [
  // ─── Field 1: Entry ─────────────────────────────────────────────
  {
    slug: '100-list',
    name: '100 List (Oikos Map)',
    field: 'entry',
    tagline: 'Start with the people God has already put in your life.',
    summary: 'Write down 100 people you know who are far from Jesus, then begin praying and sharing.',
    description:
      'Make your mission field visible: names, where each person is, and who you will share with this week.',
    steps: [
      { title: 'List', detail: 'Up to 100 people you know who are not following Jesus.' },
      { title: 'Label', detail: 'Where is each person: praying, seed, gospel, responded, discipled.' },
      { title: 'Pray', detail: 'Pray through the list. Ask who is open.' },
      { title: 'Go', detail: 'A few names each week. Share. Record what happened.' },
    ],
    scripture: ['Acts 10:24', 'John 1:40–42'],
    tags: ['prayer', 'personal', 'starter'],
  },
  {
    slug: 'prayer-walking',
    name: 'Prayer Walking',
    field: 'entry',
    tagline: 'Praying on-site with insight.',
    summary: 'Walk your neighborhood or a target area, praying for the people you see and for a household of peace.',
    description:
      'Pray on-site for the homes, businesses, and people you pass — and watch for open doors.',
    steps: [
      { title: 'Choose an area', detail: 'A block, a park, a complex, a campus. Go in twos.' },
      { title: 'Pray as you go', detail: 'Pray Scripture over the place. Ask for a person of peace.' },
      { title: 'Engage', detail: 'Ask how you can pray for someone. Offer a short story of hope.' },
      { title: 'Debrief', detail: 'Names, needs, next steps. Add them to your 100 List.' },
    ],
    scripture: ['Luke 10:1–2', 'Joshua 1:3'],
    tags: ['prayer', 'group'],
  },
  {
    slug: 'person-of-peace',
    name: 'Person of Peace',
    field: 'entry',
    tagline: 'Find the ones God has prepared.',
    summary: 'Jesus\' strategy in Luke 10: look for the person who receives you, is open to the message, and opens their household.',
    description:
      'Look for the one who welcomes you, responds, and opens their household.',
    steps: [
      { title: 'Look', detail: 'Who is receptive? Who invites you deeper into their world?' },
      { title: 'Stay', detail: 'Do not hop house to house. Invest in the one God opens.' },
      { title: 'Reach the household', detail: 'Ask them to gather friends and family for a first discovery group.' },
    ],
    scripture: ['Luke 10:5–7', 'Acts 16:14–15', 'Acts 16:31–34'],
    tags: ['strategy'],
  },
  {
    slug: 'testimony',
    name: '15-Second Testimony',
    field: 'gospel',
    tagline: 'Your story, short enough to share anywhere.',
    summary: 'A three-part story — before, how, after — you can share in fifteen seconds and hand off to anyone.',
    description:
      'Before, how, after — then a question. Short enough to share anywhere.',
    steps: [
      { title: 'Before', detail: 'One sentence: life before Jesus.' },
      { title: 'How', detail: 'One or two sentences: how you met Jesus and responded.' },
      { title: 'After', detail: 'One sentence: what changed. Then: "Has anything like that happened to you?"' },
    ],
    scripture: ['John 9:25', '1 Peter 3:15'],
    tags: ['starter', 'personal'],
  },

  // ─── Field 2: Gospel ────────────────────────────────────────────
  {
    slug: '411',
    name: '411 Training',
    field: 'gospel',
    tagline: 'Four calls, one command, one vision.',
    summary: 'The foundational one-session training: 4 calls of Jesus, 1 Great Commission, 1 vision of no place left — plus the tools to start today.',
    description:
      'The on-ramp for every believer: four calls, one command, one vision, then practice.',
    steps: [
      { title: '4 Calls', detail: 'Come and see (John 1:39) · Follow me (Mark 1:17) · I will make you fishers of people (Mark 1:17) · Go and make disciples (Matt 28:19).' },
      { title: '1 Command', detail: 'The Great Commission — make disciples of all nations, baptizing and teaching them to obey.' },
      { title: '1 Vision', detail: 'No place left where Christ has not been named (Romans 15:23).' },
      { title: 'Practice', detail: '100 List · 15-second testimony · 3 Circles gospel · pray and go.' },
    ],
    scripture: ['Matthew 28:18–20', 'Romans 15:19–23'],
    tags: ['training', 'starter'],
  },
  {
    slug: '3-circles',
    name: '3 Circles',
    field: 'gospel',
    tagline: 'The gospel on a napkin.',
    summary: 'God\'s design → brokenness → the gospel: a simple drawn presentation anyone can learn in minutes.',
    description:
      'God\'s design, brokenness, the gospel — drawn in a minute, shared the same day.',
    steps: [
      { title: 'God\'s design', detail: 'God created the world good, with a design for our lives.' },
      { title: 'Brokenness', detail: 'We chose our own way. Sin leads to brokenness, and we cannot fix it ourselves.' },
      { title: 'Gospel', detail: 'Jesus lived, died, and rose. Repent and believe, and be restored to God\'s design.' },
      { title: 'Respond', detail: 'Where are you on this drawing? What is keeping you from turning today?' },
    ],
    scripture: ['Genesis 1:31', 'Romans 3:23', 'Romans 6:23', 'Mark 1:15'],
    tags: ['gospel', 'starter'],
  },

  // ─── Field 3: Discipleship ──────────────────────────────────────
  {
    slug: 'commands-of-christ',
    name: 'Commands of Christ',
    field: 'discipleship',
    tagline: 'Short-term discipleship for new believers.',
    summary: 'Seven foundational commands of Jesus, taught through simple stories so a new believer can obey and pass them on.',
    description:
      'Seven basics for a new believer\'s first weeks, taught through simple stories.',
    steps: [
      { title: '1 · Repent, believe, receive the Spirit', detail: 'Mark 1:15; Acts 2:38' },
      { title: '2 · Be baptized', detail: 'Matthew 28:19; Acts 8:26–39' },
      { title: '3 · Pray', detail: 'Matthew 6:9–13' },
      { title: '4 · Make disciples', detail: 'Matthew 28:19–20' },
      { title: '5 · Love', detail: 'Matthew 22:37–39; John 13:34–35' },
      { title: '6 · Lord\'s Supper', detail: 'Luke 22:14–20' },
      { title: '7 · Give', detail: 'Matthew 6:19–21; 2 Corinthians 9:6–7' },
    ],
    scripture: ['Matthew 28:20'],
    tags: ['discipleship', 'new-believers'],
  },
  {
    slug: '3-thirds',
    name: '3/3rds Group',
    field: 'discipleship',
    tagline: 'Look back. Look up. Look forward.',
    summary: 'The reproducible group meeting pattern: care and accountability, Word and worship, then practice and goal-setting.',
    description:
      'Three parts every meeting, so groups grow in obedience and anyone can lead.',
    steps: [
      { title: 'Look Back (1/3)', detail: 'Care · Worship · Accountability: how did you obey, who did you share with? · Vision.' },
      { title: 'Look Up (1/3)', detail: 'Read · Retell · Discuss: God? People? What do we obey?' },
      { title: 'Look Forward (1/3)', detail: 'Practice · Goals: who will you share with, what will you obey? · Pray.' },
    ],
    scripture: ['James 1:22', 'Acts 2:42–47'],
    tags: ['group', 'discipleship'],
  },
  {
    slug: 'sword-method',
    name: 'SWORD Bible Study',
    field: 'discipleship',
    tagline: 'A simple, inductive way to study any passage.',
    summary: 'Draw a sword: God above, people below, sin to the left, obedience to the right. Read any passage and fill it in.',
    description:
      'Read any passage. Ask about God, people, sin, and obedience.',
    steps: [
      { title: 'Read', detail: 'Read the passage twice; have someone retell it.' },
      { title: 'God ↑', detail: 'What does this passage teach about God?' },
      { title: 'People ↓', detail: 'What does it teach about people?' },
      { title: 'Sin ←', detail: 'Is there a sin to avoid or a warning?' },
      { title: 'Obey →', detail: 'What is there to obey? Turn it into an "I will…" statement.' },
    ],
    scripture: ['Hebrews 4:12'],
    tags: ['bible-study', 'group'],
  },
  {
    slug: 'discovery-bible-study',
    name: 'Discovery Group',
    field: 'discipleship',
    tagline: 'Let seekers discover Jesus for themselves.',
    summary: 'A guided reading through Scripture for people not yet following Jesus, using simple discovery questions.',
    description:
      'Let a household hear the story of God and respond together.',
    steps: [
      { title: 'Open', detail: 'Thankful for? Struggling with? How can we help?' },
      { title: 'Discover', detail: 'Read. Retell. God? People? What will you do?' },
      { title: 'Share', detail: 'Who will you tell this story to this week?' },
    ],
    scripture: ['Acts 17:11', 'John 6:44–45'],
    tags: ['group', 'seekers'],
  },

  // ─── Field 4: Church ────────────────────────────────────────────
  {
    slug: 'church-circle',
    name: 'Church Circle',
    field: 'church',
    tagline: 'Diagnose the health of a group in one drawing.',
    summary: 'An Acts 2 diagnostic: draw a circle, fill in the marks of a healthy church, and see what is missing.',
    description:
      'One drawing to answer: are we a church, and are we healthy?',
    steps: [
      { title: 'Draw the circle', detail: 'Dotted for a group, solid for a covenanted church. Note who leads.' },
      { title: 'Fill in the elements', detail: 'Baptism · Word · Fellowship · Lord\'s Supper · Prayer · Giving · Praise · Making disciples · Leaders · Signs & wonders.' },
      { title: 'Count', detail: 'Attending, baptized, believers, generation.' },
      { title: 'Next step', detail: 'What is missing? Who will teach it? When?' },
    ],
    scripture: ['Acts 2:36–47'],
    tags: ['church', 'diagnostic'],
  },
  {
    slug: 'generational-map',
    name: 'Generational Mapping',
    field: 'church',
    tagline: 'See the movement, not just the meeting.',
    summary: 'Chart every group and church by generation so you can see where things are multiplying and where they are stuck.',
    description:
      'Every group by generation, so you can see what is multiplying and what is stuck.',
    steps: [
      { title: 'Plot', detail: 'Draw each group as a circle; connect it to its parent group.' },
      { title: 'Label', detail: 'Leader, start date, generation (G1, G2, G3…), church circle health.' },
      { title: 'Review', detail: 'What is stuck? What broke through? What is next for each group?' },
    ],
    scripture: ['2 Timothy 2:2'],
    tags: ['church', 'diagnostic', 'coaching'],
  },

  // ─── Field 5: Leadership ────────────────────────────────────────
  {
    slug: 'mawl',
    name: 'MAWL',
    field: 'leadership',
    tagline: 'Model · Assist · Watch · Launch.',
    summary: 'The rhythm for handing off any skill or role so that others can do it without you.',
    description:
      'Move people from watching to owning, then get out of the way.',
    steps: [
      { title: 'Model', detail: 'I do it; you watch.' },
      { title: 'Assist', detail: 'You do it; I help.' },
      { title: 'Watch', detail: 'You do it; I watch and give feedback.' },
      { title: 'Launch', detail: 'You do it and train others. I move on.' },
    ],
    scripture: ['Mark 3:14', 'Luke 10:1'],
    tags: ['leadership', 'coaching'],
  },
  {
    slug: 'five-levels',
    name: '5 Levels of Movement Leadership',
    field: 'leadership',
    tagline: 'From seed sower to movement catalyst.',
    summary: 'A map of the leadership roles a movement needs, so we can develop leaders on purpose.',
    description:
      'The leaders a movement needs, and how each one is developed.',
    steps: [
      { title: 'L1 · Seed Sower', detail: 'Shares the gospel and testimony regularly.' },
      { title: 'L2 · Church Planter', detail: 'Gathers new believers into a group / church.' },
      { title: 'L3 · Church Multiplier', detail: 'Trains those churches to plant others (2nd generation).' },
      { title: 'L4 · Multiplication Trainer', detail: 'Coaches leaders across multiple streams toward 4th generation.' },
      { title: 'L5 · Movement Catalyst', detail: 'Catalyzes movements across regions and peoples.' },
    ],
    scripture: ['Ephesians 4:11–13'],
    tags: ['leadership'],
  },
  {
    slug: 'iron-on-iron',
    name: 'Iron on Iron',
    field: 'leadership',
    tagline: 'As iron sharpens iron, so one person sharpens another.',
    summary: 'A regular gathering where practitioners report on the Four Fields, celebrate, troubleshoot, and set goals together.',
    description:
      'Practitioners report, sharpen one another, and leave with next steps.',
    steps: [
      { title: 'Report', detail: 'Each practitioner shares their map and what happened.' },
      { title: 'Sharpen', detail: 'Questions, celebration, and stuck points worked through the Four Fields.' },
      { title: 'Commit', detail: 'Specific goals and a prayer partner.' },
    ],
    scripture: ['Proverbs 27:17', 'Acts 14:27'],
    tags: ['leadership', 'coaching', 'group'],
  },
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const toolsByField = (field: string) => tools.filter((t) => t.field === field);

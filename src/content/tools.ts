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
      'Every believer already has a mission field — family, friends, coworkers, neighbors, the barista who knows your order. The 100 List makes that field visible. Write names, note where each person is spiritually, pray through the list, and let it drive who you share with this week.',
    steps: [
      { title: 'List', detail: 'Write down up to 100 people you have real contact with who are not following Jesus. Family, work, school, neighborhood, hobbies, businesses you frequent.' },
      { title: 'Label', detail: 'Mark each person: no relationship / has heard something / has heard the gospel / responded / being discipled.' },
      { title: 'Pray', detail: 'Pray through the list regularly. Ask God to show you who is open.' },
      { title: 'Go', detail: 'Pick a few names each week to share your testimony or the gospel with. Record what happened.' },
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
      'Prayer walking is simply praying while walking through a community — for the homes, businesses, schools, and people you pass. It sharpens our eyes to see a place as God sees it and often opens doors for gospel conversations along the way.',
    steps: [
      { title: 'Choose an area', detail: 'A block, a park, an apartment complex, a campus. Go in twos where possible.' },
      { title: 'Pray as you go', detail: 'Pray Scripture over the place. Ask God for a person of peace and for laborers.' },
      { title: 'Engage', detail: 'If someone is open, ask how you can pray for them. Offer to share a short story of hope.' },
      { title: 'Debrief', detail: 'Note names, needs, and next steps. Add them to your 100 List.' },
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
      'A person of peace is someone God has already prepared — they welcome you, respond to the gospel, and become the bridge to their family and friends. The goal is not just to win an individual but to reach a household (oikos) through them.',
    steps: [
      { title: 'Look', detail: 'Who is receptive? Who invites you deeper into their world?' },
      { title: 'Stay', detail: 'Do not hop from house to house. Invest in the household God opens.' },
      { title: 'Reach the household', detail: 'Ask the person of peace to gather their friends and family for a first discovery group.' },
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
      'Nobody can argue with your story. A short testimony lowers the barrier to spiritual conversation and naturally leads to "Can I share how that happened?" — the gospel.',
    steps: [
      { title: 'Before', detail: 'One sentence: what your life was like before Jesus (or the struggle Jesus met you in).' },
      { title: 'How', detail: 'One or two sentences: how you encountered Jesus and responded.' },
      { title: 'After', detail: 'One sentence: what has changed. End with a question: "Has anything like that ever happened to you?"' },
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
      'The 411 is the on-ramp for every believer. In one sitting a new or existing disciple learns Jesus\' four calls (come and see, follow me, fish for people, go and make disciples), the one Great Commission, and the one vision of #NoPlaceLeft — then practices the 100 List, a 15-second testimony, and a simple gospel presentation.',
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
      'Three Circles walks a friend from the brokenness we all feel, back to God\'s original design, and to Jesus as the way home. It is drawable, conversational, and easy to hand off — a new believer can share it the same day.',
    steps: [
      { title: 'God\'s design', detail: 'Draw a circle. God created the world good, with a design for our lives.' },
      { title: 'Brokenness', detail: 'Draw a second circle. We chose our own way; sin leads to brokenness. We try to fix it ourselves and stay stuck.' },
      { title: 'Gospel', detail: 'Draw a third circle. Jesus lived, died, and rose for us. Turn and believe — repent and believe — and be restored to God\'s design.' },
      { title: 'Respond', detail: 'Where are you on this drawing? Where would you like to be? What is keeping you from turning today?' },
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
      'Jesus said to teach disciples to obey all He commanded. This series covers the basics a new believer needs in the first weeks: repent & believe, be baptized, pray, make disciples, love, the Lord\'s Supper, and give.',
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
      'The 3/3rds process shapes every discipleship gathering into three parts so that groups grow in obedience, not just knowledge. Because the pattern is simple and repeatable, any group member can lead it — which is how groups multiply.',
    steps: [
      { title: 'Look Back (1/3)', detail: 'Care: how are you? · Worship · Accountability: how did you obey and who did you share with? · Vision casting.' },
      { title: 'Look Up (1/3)', detail: 'Read the passage · Retell in your own words · Discuss: what does it say about God? about people? what do we obey?' },
      { title: 'Look Forward (1/3)', detail: 'Practice the passage or the gospel · Set goals: who will you share with and what will you obey this week? · Pray.' },
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
      'The SWORD method (Hebrews 4:12) helps a group — even brand-new believers — discover what a passage says about God, about people, about sin to avoid, and about commands to obey. It is a pattern for lifelong Bible study that anyone can lead.',
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
      'When a person of peace opens their home, a discovery group lets a whole household hear the story of God — creation to Christ — and respond together. The facilitator asks questions rather than teaching, so the group learns to hear from God through His Word.',
    steps: [
      { title: 'Open', detail: 'What are you thankful for? What is a struggle? How can we help each other?' },
      { title: 'Discover', detail: 'Read the story. Retell it. What does it say about God? About people? What will you do with what you learned?' },
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
      'The Church Circle helps a group answer "are we a church, and are we healthy?" using Acts 2:36–47. A dotted circle becomes solid when the group covenants together as a church. Each element inside is drawn when it is present — and left blank when it is not — giving a clear picture and a clear next step.',
    steps: [
      { title: 'Draw the circle', detail: 'Dotted = a group of disciples. Solid = a covenanted church. Write who leads and who started the group.' },
      { title: 'Fill in the elements', detail: 'Baptism · Word · Fellowship · Lord\'s Supper · Prayer · Giving · Praise · Making disciples · Leaders · Signs & wonders.' },
      { title: 'Count', detail: 'Number attending / baptized / believers. Note the generation.' },
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
      'A generational map plots each group as a church circle connected by lines to the group it came from. Over time the map reveals multiplication (or the lack of it), the health of each generation, and where leaders need coaching.',
    steps: [
      { title: 'Plot', detail: 'Draw each group as a circle; connect it to its parent group.' },
      { title: 'Label', detail: 'Leader, start date, generation (G1, G2, G3…), church circle health.' },
      { title: 'Review', detail: 'In Iron on Iron, ask: what is stuck? What broke through? What is the next step for each group?' },
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
      'MAWL keeps the goal of multiplication in view at every step. Instead of doing ministry for people, we intentionally move them from watching to owning: I model it, I assist you as you do it, I watch you lead, then I launch you and get out of the way.',
    steps: [
      { title: 'Model', detail: 'I do it; you watch.' },
      { title: 'Assist', detail: 'You do it; I help.' },
      { title: 'Watch', detail: 'You do it; I watch and give feedback.' },
      { title: 'Launch', detail: 'You do it and train others; I move on to model somewhere new.' },
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
      'Movements need more than one kind of leader. The five levels describe how leadership grows from sharing the gospel to catalyzing multiple streams of churches — and what training and coaching each level needs.',
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
      'Iron on Iron (IOI) is the heartbeat of a local network. Practitioners come with their generational maps and church circles, share honestly, learn from one another, and leave with concrete next steps. It is peer coaching for people who are actually in the fields.',
    steps: [
      { title: 'Report', detail: 'Each practitioner shares their map and what happened since last time.' },
      { title: 'Sharpen', detail: 'The group asks questions, celebrates, and troubleshoots stuck points using the Four Fields.' },
      { title: 'Commit', detail: 'Everyone leaves with specific, measurable goals and a prayer partner.' },
    ],
    scripture: ['Proverbs 27:17', 'Acts 14:27'],
    tags: ['leadership', 'coaching', 'group'],
  },
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const toolsByField = (field: string) => tools.filter((t) => t.field === field);

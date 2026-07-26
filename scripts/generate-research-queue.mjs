import { readFile, writeFile } from 'node:fs/promises';

const database = JSON.parse(
  await readFile(new URL('../data/content-database.json', import.meta.url), 'utf8'),
);

const gapDefinitions = [
  { id: 'location', label: 'Exact location', description: 'A stable map region, landmark or encounter position is not yet recorded.' },
  { id: 'prerequisites', label: 'Prerequisites', description: 'Chapter, character, item, faction or prior-content requirements remain incomplete.' },
  { id: 'route', label: 'Route or entry path', description: 'The repeatable path from an identifiable starting point has not been verified.' },
  { id: 'objectives', label: 'Objectives or mechanics', description: 'The ordered objective, puzzle, phase or mechanic sequence remains incomplete.' },
  { id: 'completion', label: 'Completion trigger', description: 'The exact condition that closes the activity or awards completion is not verified.' },
  { id: 'rewards', label: 'Rewards', description: 'The current-patch reward screen or item table has not been captured.' },
  { id: 'replayability', label: 'Replayability', description: 'One-time, repeatable or rematch behaviour is not confirmed.' },
  { id: 'rematch', label: 'Rematch access', description: 'A Memory Fragment, rematch point or repeatable encounter route is not verified.' },
  { id: 'current-patch-retest', label: 'Current-patch retest', description: 'Historical blocker evidence exists and the fixed path should be rechecked on the current patch.' },
];

const gapById = new Map(gapDefinitions.map((gap) => [gap.id, gap]));
const typeById = new Map(database.types.map((type) => [type.id, type.label]));
const regionById = new Map(database.regions.map((region) => [region.id, region.label]));

function unique(values) {
  return [...new Set(values)];
}

function gapsFor(record) {
  const gaps = [];
  if (!record.region || record.region === 'unknown') gaps.push('location');
  if (!Array.isArray(record.prerequisites) || record.prerequisites.length === 0) gaps.push('prerequisites');
  if (!record.guidePath || record.guidePath === '/database/') gaps.push('route');
  if (['quest', 'abyss', 'boss', 'stronghold', 'challenge'].includes(record.type)) gaps.push('objectives');
  if (!record.completion?.eligible || !record.completion?.condition) gaps.push('completion');
  if (!Array.isArray(record.rewards) || record.rewards.length === 0) gaps.push('rewards');
  if (!record.replayability || record.replayability === 'unknown') gaps.push('replayability');
  if (record.type === 'boss' && (!record.replayability || record.replayability === 'unknown')) gaps.push('rematch');
  if (Array.isArray(record.knownBlockers) && record.knownBlockers.length > 0) gaps.push('current-patch-retest');
  return unique(gaps);
}

function priorityFor(record, gaps) {
  let score = 0;
  if (record.storyRole === 'story') score += 5;
  if (record.type === 'abyss') score += 4;
  else if (record.type === 'boss') score += 3;
  else if (record.type === 'quest') score += 2;
  if (gaps.includes('completion')) score += 2;
  if (gaps.includes('location')) score += 2;
  if (gaps.includes('current-patch-retest')) score += 2;
  if (record.spoilerLevel === 'full') score += 1;
  if (score >= 9) return 'high';
  if (score >= 5) return 'medium';
  return 'standard';
}

function protocolFor(record) {
  const common = [
    'Record the exact game patch, platform, save state and difficulty before testing.',
    'Capture the map or menu context before the activity begins and again when it completes.',
    'Change only one uncertain condition between attempts and separate observations from conclusions.',
  ];

  const byType = {
    quest: [
      'Identify the start NPC, item, chapter or world trigger and record all visible prerequisites.',
      'Follow the objectives in order, recording required characters, items, dialogue and route transitions.',
      'Capture the completion trigger and the full reward presentation without inferring hidden rewards.',
    ],
    boss: [
      'Record the first stable route to the arena and any quest or world-state prerequisite.',
      'Document visible phase changes, arena hazards and recovery windows without publishing unsupported damage values.',
      'Capture first-defeat rewards, then verify whether a rematch or Memory Fragment route exists.',
    ],
    abyss: [
      'Record the entry point or Abyss Nexus and any required character, skill or world interaction.',
      'Document the puzzle, traversal and combat sequence in exact order, including failure recovery.',
      'Capture the completion trigger, reward state and whether the Abyss can be replayed.',
    ],
    stronghold: [
      'Record the activation point, faction or story prerequisites and the route into the objective area.',
      'Document objective order, reinforcement or defence behaviour and the liberation trigger.',
      'Capture rewards, post-completion world changes and repeatability.',
    ],
    challenge: [
      'Record the challenge activation condition, required equipment or skill and the exact starting location.',
      'Document the success condition and any count, timer or target rule visible in the interface.',
      'Capture completion credit and rewards, preserving evidence for any official total.',
    ],
  };

  return [...(byType[record.type] ?? [
    'Identify the exact start point, trigger and prerequisites.',
    'Record the complete interaction or objective sequence.',
    'Capture the completion state, rewards and replay behaviour.',
  ]), ...common];
}

function confirmedFacts(record) {
  const facts = [
    { label: 'Official identity', value: record.title },
    { label: 'Content type', value: typeById.get(record.type) ?? record.type },
    { label: 'Evidence grade', value: record.evidence },
    { label: 'First supported patch', value: record.firstSupportedPatch },
  ];
  if (record.region && record.region !== 'unknown') facts.push({ label: 'Known region', value: regionById.get(record.region) ?? record.region });
  if (record.storyRole && record.storyRole !== 'unknown') facts.push({ label: 'Story role', value: record.storyRole });
  if (record.characters?.length) facts.push({ label: 'Supported characters', value: record.characters.join(', ') });
  if (record.knownBlockers?.length) facts.push({ label: 'Historical blockers', value: String(record.knownBlockers.length) });
  return facts;
}

const records = database.records
  .filter((record) => record.recordStatus === 'partial')
  .map((record) => {
    const gapIds = gapsFor(record);
    return {
      id: record.id,
      title: record.title,
      summary: record.summary,
      type: record.type,
      typeLabel: typeById.get(record.type) ?? record.type,
      region: record.region,
      regionLabel: regionById.get(record.region) ?? record.region,
      storyRole: record.storyRole,
      characters: record.characters,
      spoilerLevel: record.spoilerLevel,
      priority: priorityFor(record, gapIds),
      firstSupportedPatch: record.firstSupportedPatch,
      confirmedFacts: confirmedFacts(record),
      gapIds,
      gaps: gapIds.map((id) => gapById.get(id)),
      protocol: protocolFor(record),
      evidenceChecklist: [
        'Current-patch screenshot or video showing the relevant screen or world state.',
        'A reproducible start point and ordered steps another player can follow.',
        'Reward, completion or rematch evidence when those fields are being claimed.',
        'A note separating direct observation from interpretation or uncertainty.',
      ],
      knownBlockers: record.knownBlockers,
      guidePath: record.guidePath,
      sources: record.sources,
      searchText: [record.title, record.summary, record.type, record.region, ...record.tags, ...record.knownBlockers, ...gapIds].join(' ').toLowerCase(),
    };
  })
  .sort((a, b) => {
    const priority = { high: 0, medium: 1, standard: 2 };
    return priority[a.priority] - priority[b.priority] || a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
  });

const output = {
  schemaVersion: 1,
  datasetVersion: '1.0.0',
  gamePatch: database.gamePatch,
  lastVerified: database.lastVerified,
  storageKey: 'crimson-desert-guide.research-queue.v1',
  priorities: [
    { id: 'high', label: 'High value', description: 'Story, Abyss, major progression or current-patch blocker verification.' },
    { id: 'medium', label: 'Medium value', description: 'Named encounters and optional content with multiple missing fields.' },
    { id: 'standard', label: 'Standard', description: 'Useful completeness work with lower immediate operational impact.' },
  ],
  gapDefinitions,
  records,
  migrations: { renamedIds: {}, retiredIds: [] },
};

await writeFile(
  new URL('../data/research-queue.json', import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8',
);

console.log(`Generated research queue with ${records.length} evidence-safe records.`);

import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const meta = JSON.parse(await readFile(new URL('data/content/meta.json', root), 'utf8'));
const sourceFiles = [
  'data/content/quests.json',
  'data/content/bosses-rematch.json',
  'data/content/bosses-research.json',
  'data/content/world.json',
];

const sourceGroups = await Promise.all(
  sourceFiles.map(async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))),
);

const canonical = sourceGroups
  .flat()
  .filter((record) => ['quest', 'boss', 'abyss', 'stronghold'].includes(record.type));

const regionLabels = new Map(meta.regions.map((region) => [region.id, region.label]));

const generalPreparation = {
  quest: [
    'Confirm the game is updated to the current guide patch before attempting an old workaround.',
    'Create or verify a recent safe save before entering a progression-sensitive objective.',
    'Check the required character and read the recorded blocker history before continuing.',
  ],
  boss: [
    'Create or verify a recent safe save before entering the encounter or activating a rematch.',
    'Review defence, healing, stamina, camera and loadout readiness in Boss & Encounter Diagnosis.',
    'Confirm the intended character, weapons and consumables before committing to the arena.',
  ],
  abyss: [
    'Create or verify a recent safe save before entering the Abyss sequence.',
    'Confirm the current patch and the relevant ability or interaction controls.',
    'Read the historic blocker before repeating any workaround written for an older patch.',
  ],
  stronghold: [
    'Create or verify a recent safe save before starting liberation or re-blockade activity.',
    'Review crowd control, healing, equipment condition and retreat options.',
    'Confirm the location state before assuming liberation or re-blockade progress has failed.',
  ],
};

const guideLinks = {
  quest: ['/database/', '/start-here/save-storage/'],
  boss: ['/database/', '/systems/boss-diagnosis/', '/systems/gear/'],
  abyss: ['/database/', '/world/', '/systems/boss-diagnosis/'],
  stronghold: ['/database/', '/atlas/', '/systems/combat/'],
};

function detailStatus(record) {
  if (record.recordStatus === 'verified') return 'supported';
  if (record.type === 'boss') return 'research';
  return 'limited';
}

function checkpoints(record) {
  if (record.type === 'boss' && record.subtype === 'rematch') {
    return [
      record.completion.condition,
      `Use the activated Memory Fragment in ${regionLabels.get(record.region) ?? record.region} to begin the rematch.`,
    ];
  }

  if (record.type === 'stronghold' && record.completion?.condition) {
    return [record.completion.condition];
  }

  return [];
}

function recovery(record) {
  const base = [
    'Verify the objective, encounter or location state before restoring an older save.',
    'Return to the title screen and reload the current save before escalating to rollback.',
    'Preserve the newest working save and record the exact failure state if the problem persists.',
  ];

  if (record.knownBlockers.length) {
    base.unshift('Confirm that the historic blocker is still reproducible on the current patch before applying any legacy workaround.');
  }

  return base;
}

function unknowns(record) {
  if (record.type === 'boss') {
    return record.recordStatus === 'verified'
      ? ['Exact phases, weaknesses, damage values and reward tables remain unverified.']
      : ['First-defeat route, arena location, phases, weaknesses, exact statistics, rewards and rematch availability remain unverified.'];
  }

  if (record.type === 'quest') {
    return ['Full objective order, prerequisite chain, exact route and reward table remain unverified.'];
  }

  if (record.type === 'abyss') {
    return ['Full puzzle sequence, prerequisite route, rewards and repeatability remain unverified.'];
  }

  return ['Exact enemy composition, reclaim timing, reward table and optimal route remain unverified.'];
}

const records = canonical.map((record) => ({
  id: `detail-${record.id}`,
  recordId: record.id,
  type: record.type,
  subtype: record.subtype,
  title: record.title,
  summary: record.summary,
  region: record.region,
  regionLabel: regionLabels.get(record.region) ?? record.region,
  characters: record.characters,
  detailStatus: detailStatus(record),
  evidence: record.evidence,
  spoilerLevel: record.spoilerLevel,
  patchStatus: record.patchStatus,
  firstSupportedPatch: record.firstSupportedPatch,
  preparation: generalPreparation[record.type],
  checkpoints: checkpoints(record),
  blockers: record.knownBlockers,
  recovery: recovery(record),
  unknowns: unknowns(record),
  rewards: record.rewards,
  replayability: record.replayability,
  completionCondition: record.completion?.condition ?? null,
  checklist: [
    { id: 'save', label: 'Safe save checked' },
    { id: 'loadout', label: 'Character and loadout checked' },
    { id: 'blockers', label: 'Blocker and recovery notes read' },
  ],
  guideLinks: [...new Set([record.guidePath, ...guideLinks[record.type]])],
  sources: record.sources,
}));

records.sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));

const output = {
  schemaVersion: 1,
  datasetVersion: '1.0.0',
  gamePatch: meta.gamePatch,
  lastVerified: meta.lastVerified,
  migrations: { renamedIds: {}, retiredIds: [] },
  records,
};

await writeFile(
  new URL('data/guide-details.json', root),
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8',
);

console.log(`Generated ${records.length} canonical guide-detail records.`);

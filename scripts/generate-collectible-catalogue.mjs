import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const database = JSON.parse(await readFile(new URL('data/content-database.json', root), 'utf8'));

const weaponSubtypes = new Set(['weapon', 'shield', 'bow']);
const worldChallengeSubtypes = new Set([
  'abyss',
  'maze',
  'constellation',
  'secret-place',
  'ancient-ruins',
  'sanctum',
  'spire',
  'new-power',
  'exploration',
]);

function scopeFor(record) {
  if (record.catalogueScope) return record.catalogueScope;
  if (record.type === 'challenge' && record.id.startsWith('achievement-')) return 'category';
  return 'individual';
}

function supportFor(record, scope) {
  if (scope === 'category' && record.id.startsWith('achievement-')) return 'category-verified';
  if (scope === 'individual' && record.recordStatus === 'verified') return 'individual-verified';
  return 'research';
}

function guidanceFor(record) {
  if (weaponSubtypes.has(record.subtype) || record.tags.includes('weapon')) {
    return [
      'Read the in-game challenge wording before choosing a weapon, character or ammunition setup.',
      'Use a repeatable combat area and change one variable at a time when testing progress.',
      'Do not assume an older patch blocker still applies unless it reproduces on the current patch.',
    ];
  }

  if (worldChallengeSubtypes.has(record.subtype)) {
    return [
      'Record the discovered activity name and region before attempting a route or puzzle solution.',
      'Preserve a recent save before a long, missable or progression-sensitive sequence.',
      'Treat any unpublished total, coordinate or route as unknown until it is independently supported.',
    ];
  }

  if (record.type === 'knowledge') {
    return [
      'Confirm the exact Journal or Knowledge entry after the interaction, purchase, quest or defeat.',
      'Record the current patch and acquisition context if the entry does not appear.',
      'Use the official blocker history as diagnosis, not as proof of the current acquisition route.',
    ];
  }

  return [
    'Read the current in-game category wording before starting the activity.',
    'Track progress locally without treating personal counts as canonical totals.',
    'Keep unresolved routes, rewards and individual entries marked for research.',
  ];
}

function unknownsFor(record, scope) {
  const unknowns = [];
  if (scope === 'category' && record.catalogueTotal == null) {
    unknowns.push('The canonical total and complete individual-entry list are not yet verified.');
  }
  if (scope === 'individual' && record.recordStatus === 'partial') {
    unknowns.push('The exact current acquisition route or full challenge objective remains unverified.');
  }
  if (!record.completion?.condition) {
    unknowns.push('No supported completion condition is available for percentage tracking.');
  }
  if (record.rewards.length === 0) {
    unknowns.push('The reward value or reward table is not published as verified guide data.');
  }
  return unknowns;
}

function relatedLinks(record) {
  const links = new Set([record.guidePath, '/database/', '/completion/']);
  if (worldChallengeSubtypes.has(record.subtype)) links.add('/atlas/');
  if (weaponSubtypes.has(record.subtype) || record.tags.includes('weapon')) {
    links.add('/systems/weapon-skills/');
    links.add('/systems/boss-diagnosis/');
  }
  if (record.type === 'knowledge') links.add('/world/');
  if (record.subtype === 'pets' || record.subtype === 'mounts') links.add('/mounts/');
  return [...links];
}

const selected = database.records.filter((record) => ['challenge', 'knowledge'].includes(record.type));
const records = selected.map((record) => {
  const scope = scopeFor(record);
  return {
    id: `catalogue-${record.id}`,
    recordId: record.id,
    type: record.type,
    subtype: record.subtype,
    scope,
    title: record.title,
    summary: record.summary,
    region: record.region,
    characters: record.characters,
    evidence: record.evidence,
    recordStatus: record.recordStatus,
    support: supportFor(record, scope),
    spoilerLevel: record.spoilerLevel,
    patchStatus: record.patchStatus,
    firstSupportedPatch: record.firstSupportedPatch,
    officialCondition: record.completion?.condition ?? null,
    completionEntryId: record.completion?.eligible ? record.id : null,
    parentAchievementId: record.parentAchievementId ?? null,
    officialTotal: Number.isInteger(record.catalogueTotal) ? record.catalogueTotal : null,
    guidance: guidanceFor(record),
    blockers: record.knownBlockers,
    unknowns: unknownsFor(record, scope),
    guideLinks: relatedLinks(record),
    sources: record.sources,
    tags: record.tags,
  };
});

records.sort((a, b) => a.scope.localeCompare(b.scope) || a.type.localeCompare(b.type) || a.title.localeCompare(b.title));

const output = {
  schemaVersion: 1,
  datasetVersion: '1.0.0',
  gamePatch: database.gamePatch,
  lastVerified: '2026-07-26',
  storageKey: 'crimson-desert-guide.collectibles.v1',
  migrations: { renamedIds: {}, retiredIds: [] },
  records,
};

await writeFile(
  new URL('data/collectible-catalogue.json', root),
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8',
);

const categories = records.filter((record) => record.scope === 'category').length;
const individuals = records.length - categories;
console.log(`Generated ${records.length} catalogue records: ${categories} categories and ${individuals} individual entries.`);

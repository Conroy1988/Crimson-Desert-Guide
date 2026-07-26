import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [database, notes] = await Promise.all([
  readFile(new URL('data/content-database.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/boss-intelligence-notes.json', root), 'utf8').then(JSON.parse),
]);

const bosses = database.records.filter((record) => record.type === 'boss');
const bossById = new Map(bosses.map((record) => [record.id, record]));
const regionById = new Map(database.regions.map((region) => [region.id, region.label]));
const statusOrder = {
  'verified-rematch': 0,
  'official-rematch': 1,
  'official-mechanics': 2,
  'official-identity': 3,
};
const statusLabels = {
  'verified-rematch': 'Verified rematch',
  'official-rematch': 'Official rematch — location unresolved',
  'official-mechanics': 'Official mechanic evidence',
  'official-identity': 'Official identity only',
};

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function canonicalFacts(record) {
  const facts = [
    {
      label: 'Official identity',
      value: record.title,
      patch: record.firstSupportedPatch,
      source: record.sources[0],
    },
  ];

  if (record.region && record.region !== 'unknown') {
    facts.push({
      label: 'Known region',
      value: regionById.get(record.region) ?? record.region,
      patch: record.firstSupportedPatch,
      source: record.sources[0],
    });
  }

  if (record.replayability && record.replayability !== 'unknown') {
    facts.push({
      label: 'Replayability',
      value: record.replayability === 'rematch' ? 'Official rematch support' : record.replayability,
      patch: record.firstSupportedPatch,
      source: record.sources[0],
    });
  }

  if (record.completion?.condition) {
    facts.push({
      label: 'Completion milestone',
      value: record.completion.condition,
      patch: record.firstSupportedPatch,
      source: record.sources[0],
    });
  }

  return facts;
}

const records = notes.records.map((note) => {
  const record = bossById.get(note.recordId);
  if (!record) throw new Error(`Boss intelligence note references unknown record: ${note.recordId}`);

  const confirmedFacts = [...canonicalFacts(record), ...note.confirmedFacts];
  const sources = unique([
    ...record.sources,
    ...confirmedFacts.map((fact) => fact.source),
    ...note.patchHistory.map((entry) => entry.source),
  ]);

  return {
    id: `boss-intelligence-${record.id}`,
    recordId: record.id,
    title: record.title,
    summary: record.summary,
    region: record.region,
    regionLabel: regionById.get(record.region) ?? record.region,
    storyRole: record.storyRole,
    characters: record.characters,
    recordStatus: record.recordStatus,
    intelligenceStatus: note.intelligenceStatus,
    intelligenceStatusLabel: statusLabels[note.intelligenceStatus] ?? note.intelligenceStatus,
    replayability: record.replayability,
    completionEligible: record.completion.eligible,
    completionCondition: record.completion.condition,
    evidence: record.evidence,
    spoilerLevel: record.spoilerLevel,
    patchStatus: record.patchStatus,
    firstSupportedPatch: record.firstSupportedPatch,
    aliases: note.aliases,
    doNotMergeWith: note.doNotMergeWith.map((otherId) => bossById.get(otherId)?.title ?? otherId),
    doNotMergeWithIds: note.doNotMergeWith,
    confirmedFacts,
    patchHistory: note.patchHistory,
    unresolved: note.unresolved,
    researchFocus: note.researchFocus,
    caveat: note.caveat ?? null,
    sources,
    guidePath: record.guidePath,
    searchText: [
      record.title,
      record.summary,
      record.region,
      regionById.get(record.region),
      record.replayability,
      note.intelligenceStatus,
      ...(note.aliases ?? []),
      ...confirmedFacts.flatMap((fact) => [fact.label, fact.value, fact.patch]),
      ...note.patchHistory.flatMap((entry) => [entry.patch, entry.note]),
      ...note.unresolved,
      ...note.researchFocus,
    ].filter(Boolean).join(' ').toLowerCase(),
  };
});

records.sort((a, b) => (
  statusOrder[a.intelligenceStatus] - statusOrder[b.intelligenceStatus]
  || a.title.localeCompare(b.title)
));

const output = {
  schemaVersion: 1,
  datasetVersion: notes.datasetVersion,
  gamePatch: database.gamePatch,
  lastVerified: notes.lastVerified,
  policy: notes.policy,
  statusDefinitions: [
    {
      id: 'verified-rematch',
      label: statusLabels['verified-rematch'],
      description: 'Official Memory Fragment location and first-defeat activation are documented.',
    },
    {
      id: 'official-rematch',
      label: statusLabels['official-rematch'],
      description: 'Official patch notes confirm a rematch exists, but the Memory Fragment location is not yet recorded.',
    },
    {
      id: 'official-mechanics',
      label: statusLabels['official-mechanics'],
      description: 'Official patch history confirms encounter behaviour while route and completion evidence remain incomplete.',
    },
    {
      id: 'official-identity',
      label: statusLabels['official-identity'],
      description: 'The identity is official; current-release route, mechanics, rewards and replay behaviour remain under research.',
    },
  ],
  rematchRules: notes.rematchRules,
  records,
  metrics: {
    total: records.length,
    verifiedRematches: records.filter((record) => record.intelligenceStatus === 'verified-rematch').length,
    officialRematches: records.filter((record) => record.intelligenceStatus === 'official-rematch').length,
    mechanicDossiers: records.filter((record) => record.intelligenceStatus === 'official-mechanics').length,
    identityDossiers: records.filter((record) => record.intelligenceStatus === 'official-identity').length,
    unresolvedFields: records.reduce((total, record) => total + record.unresolved.length, 0),
  },
};

await writeFile(
  new URL('data/boss-intelligence.json', root),
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8',
);

console.log(
  `Generated Boss Intelligence Centre with ${output.metrics.total} dossiers, `
  + `${output.metrics.verifiedRematches} verified rematches and `
  + `${output.metrics.unresolvedFields} explicit unresolved fields.`,
);

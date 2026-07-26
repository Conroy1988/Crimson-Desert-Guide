import { readFile, writeFile } from 'node:fs/promises';

const completionUrl = new URL('../data/completion.json', import.meta.url);
const files = [
  'achievements-story.json',
  'achievements-combat.json',
  'achievements-world.json',
  'achievements-systems.json',
  'bosses-rematch.json',
  'bosses-research.json',
  'quests.json',
  'world.json',
  'knowledge-challenges.json',
];

const completion = JSON.parse(await readFile(completionUrl, 'utf8'));
const records = (
  await Promise.all(
    files.map(async (file) => JSON.parse(
      await readFile(new URL(`../data/content/${file}`, import.meta.url), 'utf8'),
    )),
  )
).flat();

function categoryFor(record) {
  if (record.type === 'boss') return 'bosses-rematches';
  if (record.type === 'stronghold') return 'stronghold-liberation';
  if (record.type === 'knowledge' || record.id === 'achievement-natural-collector') {
    return 'collectibles-knowledge';
  }
  if (record.id === 'achievement-tamer-of-legends') return 'mounts-pets';
  if (record.id === 'achievement-grand-collector-of-arms') return 'equipment';
  if (record.id === 'achievement-expert-explorer') return 'settlements-travel';
  return 'activities';
}

const generated = records
  .filter((record) => record.completion?.eligible)
  .map((record) => ({
    id: record.id,
    category: categoryFor(record),
    title: record.title,
    summary: record.completion.condition,
    spoilerLevel: record.spoilerLevel,
    evidence: record.evidence,
    patchStatus: record.patchStatus,
    source: record.sources[0],
    guidePath: record.guidePath,
    prerequisites: record.id === 'knowledge-hernand-ranged-weapons-book'
      ? ['travel-hernand-circuit']
      : record.prerequisites,
    tags: record.tags,
    sourceRecordId: record.id,
  }));

const canonicalIds = new Set(generated.map((entry) => entry.id));
const preserved = completion.entries.filter(
  (entry) => !entry.sourceRecordId && !canonicalIds.has(entry.id),
);

const categories = completion.categories.map((category) => {
  if (category.id === 'activities') {
    return {
      ...category,
      label: 'Quests, Activities & Challenges',
      description: 'Main-story milestones, camps, challenge families and supported system activities.',
      coverage: 'seeded',
    };
  }
  if (category.id === 'bosses-rematches') {
    return {
      ...category,
      description: 'Verified first defeats and rematch activation records.',
      coverage: 'seeded',
    };
  }
  if (category.id === 'collectibles-knowledge') {
    return {
      ...category,
      description: 'Official achievement categories and individually verified books, characters, creatures and faction knowledge.',
      coverage: 'seeded',
    };
  }
  if (category.id === 'stronghold-liberation') {
    return {
      ...category,
      description: 'Verified liberation and repeatable Re-blockade milestones.',
      coverage: 'seeded',
    };
  }
  return category;
});

const output = {
  ...completion,
  datasetVersion: '2.1.0',
  lastVerified: '2026-07-26',
  categories,
  entries: [...preserved, ...generated],
};

await writeFile(completionUrl, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Generated completion dataset v${output.datasetVersion}: ${preserved.length} guide milestones + ${generated.length} canonical content milestones.`,
);

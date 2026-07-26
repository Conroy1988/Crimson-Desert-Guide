import { readFile, writeFile } from 'node:fs/promises';

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

const meta = JSON.parse(
  await readFile(new URL('../data/content/meta.json', import.meta.url), 'utf8'),
);
const records = (
  await Promise.all(
    files.map(async (file) => JSON.parse(
      await readFile(new URL(`../data/content/${file}`, import.meta.url), 'utf8'),
    )),
  )
).flat();

const output = { ...meta, records };
await writeFile(
  new URL('../data/content-database.json', import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(`Generated canonical content database with ${records.length} records.`);

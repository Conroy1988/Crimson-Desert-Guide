import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const patch = JSON.parse(
  await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'),
);

const required = [
  'title',
  'description',
  'currentPatch',
  'lastVerified',
  'evidence',
  'spoilerLevel',
  'patchStatus',
];
const evidenceValues = new Set([
  'official',
  'verified',
  'community',
  'provisional',
]);
const spoilerValues = new Set(['none', 'minor', 'full']);
const statusValues = new Set(['current', 'review-required', 'historical']);
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(item)));
    else if (/\.(md|mdx)$/i.test(entry.name)) result.push(item);
  }
  return result;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (field) values[field[1]] = field[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

for (const file of await walk(root)) {
  const relative = path.relative(root, file);
  const source = await readFile(file, 'utf8');
  const frontmatter = parseFrontmatter(source);

  if (!frontmatter) {
    failures.push(`${relative}: missing YAML frontmatter`);
    continue;
  }

  for (const field of required) {
    if (!frontmatter[field]) failures.push(`${relative}: missing ${field}`);
  }

  if (
    frontmatter.currentPatch &&
    !/^\d+\.\d+\.\d+$/.test(frontmatter.currentPatch)
  ) {
    failures.push(`${relative}: invalid currentPatch`);
  }

  if (
    frontmatter.lastVerified &&
    !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.lastVerified)
  ) {
    failures.push(`${relative}: invalid lastVerified`);
  }

  if (
    frontmatter.evidence &&
    !evidenceValues.has(frontmatter.evidence)
  ) {
    failures.push(`${relative}: invalid evidence grade`);
  }

  if (
    frontmatter.spoilerLevel &&
    !spoilerValues.has(frontmatter.spoilerLevel)
  ) {
    failures.push(`${relative}: invalid spoilerLevel`);
  }

  if (
    frontmatter.patchStatus &&
    !statusValues.has(frontmatter.patchStatus)
  ) {
    failures.push(`${relative}: invalid patchStatus`);
  }

  if (
    frontmatter.patchStatus === 'current' &&
    frontmatter.currentPatch !== patch.version
  ) {
    failures.push(
      `${relative}: current page uses ${frontmatter.currentPatch}; baseline is ${patch.version}`,
    );
  }
}

if (failures.length) {
  console.error('Content audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Content audit passed for patch ${patch.version}.`);

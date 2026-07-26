import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [mastery, builds, technical, patch] = await Promise.all([
  readFile(new URL('data/character-mastery.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/build-archetypes.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/technical-issues.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/current-patch.json', root), 'utf8').then(JSON.parse),
]);

const failures = [];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const expectedCharacters = new Set(['kliff', 'oongka', 'damiane']);
const officialHosts = new Set(['store.steampowered.com', 'crimsondesert.pearlabyss.com']);
const activeIssueIds = new Set(
  technical.records.filter((record) => record.kind === 'official-issue' && record.status === 'active').map((record) => record.id),
);

if (mastery.schemaVersion !== 1 || mastery.datasetVersion !== '1.0.0') failures.push('invalid character mastery version');
if (mastery.gamePatch !== patch.version) failures.push('character mastery patch drift');
if (mastery.lastVerified !== '2026-07-26') failures.push('character mastery verification date drift');
if (!Array.isArray(mastery.characters) || mastery.characters.length !== 3) failures.push('exactly three playable characters are required');

const characterIds = new Set();
for (const character of mastery.characters ?? []) {
  if (!expectedCharacters.has(character.id)) failures.push(`unexpected playable character: ${character.id}`);
  if (characterIds.has(character.id)) failures.push(`duplicate playable character: ${character.id}`);
  characterIds.add(character.id);
  if (!character.name || !character.role || !character.summary || !character.storyAvailability) failures.push(`${character.id}: missing profile fields`);
  if (!Array.isArray(character.capabilities) || character.capabilities.length < 5) failures.push(`${character.id}: insufficient capability evidence`);
  if (!Array.isArray(character.verifiedTools) || character.verifiedTools.length < 3) failures.push(`${character.id}: verifiedTools missing`);
  if (!Array.isArray(character.patchTimeline) || character.patchTimeline.length < 5) failures.push(`${character.id}: patch timeline incomplete`);
  if (!Array.isArray(character.sources) || character.sources.length < 2) failures.push(`${character.id}: sources missing`);
  for (const issueId of character.activeIssueIds ?? []) {
    if (!activeIssueIds.has(issueId)) failures.push(`${character.id}: missing active issue ${issueId}`);
  }
  const capabilityIds = new Set();
  for (const capability of character.capabilities ?? []) {
    if (!idPattern.test(capability.id ?? '')) failures.push(`${character.id}: invalid capability ID ${capability.id}`);
    if (capabilityIds.has(capability.id)) failures.push(`${character.id}: duplicate capability ${capability.id}`);
    capabilityIds.add(capability.id);
    if (capability.status !== 'official' || !capability.label || !capability.detail) failures.push(`${character.id}/${capability.id}: invalid capability evidence`);
  }
  for (const source of character.sources ?? []) {
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:' || !officialHosts.has(url.hostname)) failures.push(`${character.id}: unapproved source ${source}`);
    } catch {
      failures.push(`${character.id}: invalid source ${source}`);
    }
  }
}
for (const id of expectedCharacters) if (!characterIds.has(id)) failures.push(`missing playable character ${id}`);

if (builds.schemaVersion !== 1 || builds.datasetVersion !== '1.0.0') failures.push('invalid build dataset version');
if (builds.gamePatch !== patch.version) failures.push('build dataset patch drift');
if (builds.storageKey !== 'crimson-desert-guide.build-lab.v1') failures.push('invalid Build Laboratory storage key');
if (builds.weaponFamilies?.length !== 10) failures.push(`expected 10 weapon/tool families, found ${builds.weaponFamilies?.length ?? 0}`);
if (builds.encounters?.length !== 6) failures.push(`expected 6 encounter types, found ${builds.encounters?.length ?? 0}`);
if (builds.dimensions?.length !== 7) failures.push(`expected 7 test dimensions, found ${builds.dimensions?.length ?? 0}`);
if (builds.archetypes?.length !== 8) failures.push(`expected 8 build archetypes, found ${builds.archetypes?.length ?? 0}`);

for (const collection of ['weaponFamilies', 'encounters', 'dimensions', 'archetypes']) {
  const ids = new Set();
  for (const entry of builds[collection] ?? []) {
    if (!idPattern.test(entry.id ?? '')) failures.push(`${collection}: invalid ID ${entry.id}`);
    if (ids.has(entry.id)) failures.push(`${collection}: duplicate ID ${entry.id}`);
    ids.add(entry.id);
  }
}

const dimensionIds = new Set(builds.dimensions.map((dimension) => dimension.id));
for (const archetype of builds.archetypes ?? []) {
  if (!archetype.title || !archetype.objective || archetype.evidence === undefined) failures.push(`${archetype.id}: missing archetype fields`);
  if (!Array.isArray(archetype.suggestedCharacters) || archetype.suggestedCharacters.length < 1) failures.push(`${archetype.id}: suggestedCharacters missing`);
  for (const characterId of archetype.suggestedCharacters ?? []) if (!characterIds.has(characterId)) failures.push(`${archetype.id}: unknown character ${characterId}`);
  if (!Array.isArray(archetype.priorityDimensions) || archetype.priorityDimensions.length < 3) failures.push(`${archetype.id}: priority dimensions missing`);
  for (const dimension of archetype.priorityDimensions ?? []) if (!dimensionIds.has(dimension)) failures.push(`${archetype.id}: unknown dimension ${dimension}`);
  if (!Array.isArray(archetype.tradeoffs) || archetype.tradeoffs.length < 2) failures.push(`${archetype.id}: tradeoffs missing`);
  if (!Array.isArray(archetype.protocol) || archetype.protocol.length < 3) failures.push(`${archetype.id}: test protocol missing`);
}

for (const source of builds.sources ?? []) {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || !officialHosts.has(url.hostname)) failures.push(`builds: unapproved source ${source}`);
  } catch {
    failures.push(`builds: invalid source ${source}`);
  }
}

const serialized = JSON.stringify({ mastery, builds }).toLowerCase();
const prohibitedClaims = ['best build', 'best weapon', 'tier list', 'dps:', 'damage coefficient', 'frame data:', 'hidden scaling:'];
for (const claim of prohibitedClaims) if (serialized.includes(claim)) failures.push(`prohibited unsupported optimisation claim: ${claim}`);

if (failures.length) {
  console.error('Character and build audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Character and build audit passed ${mastery.characters.length} profiles, ${builds.archetypes.length} archetypes, ${builds.weaponFamilies.length} weapon families and ${builds.dimensions.length} test dimensions.`);

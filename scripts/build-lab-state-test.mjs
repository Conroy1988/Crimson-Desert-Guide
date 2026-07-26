import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createBuildLabExport,
  createEmptyBuildLabState,
  loadBuildLabState,
  normaliseBuildLabState,
  parseBuildLabImport,
  removeBuildTest,
  saveBuildLabState,
  upsertBuildTest,
} from '../src/lib/build-lab-state.mjs';

const [dataset, mastery] = await Promise.all([
  readFile(new URL('../data/build-archetypes.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../data/character-mastery.json', import.meta.url), 'utf8').then(JSON.parse),
]);
const characters = mastery.characters;
const now = new Date().toISOString();
const test = {
  id: 'test-repeatable-boss-001',
  name: 'Memory Fragment baseline',
  characterId: 'damiane',
  archetypeId: 'boss-reliability',
  weaponFamilyId: 'shield',
  encounterId: 'single-boss',
  defencePreference: 'guard',
  conditions: 'Same save, arena and equipment state.',
  observations: 'Recorded healing use and unsafe recovery windows.',
  metrics: { reach: 3, recovery: 4, resource: 3, control: 4, mobility: 2, defence: 5, terrain: 3 },
  confidence: 'medium',
  createdAt: now,
  updatedAt: now,
};

const empty = createEmptyBuildLabState(dataset);
assert.equal(empty.tests.length, 0);

let state = upsertBuildTest(empty, test, dataset, characters);
assert.equal(state.tests.length, 1);
assert.equal(state.tests[0].metrics.defence, 5);

state = upsertBuildTest(state, { ...test, observations: 'Second observation.', confidence: 'high', updatedAt: new Date().toISOString() }, dataset, characters);
assert.equal(state.tests.length, 1);
assert.equal(state.tests[0].confidence, 'high');

const storage = new Map();
const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const saved = saveBuildLabState(adapter, state, dataset, characters);
assert.equal(saved.storageAvailable, true);
const loaded = loadBuildLabState(adapter, dataset, characters);
assert.equal(loaded.error, null);
assert.equal(loaded.state.tests[0].name, 'Memory Fragment baseline');

const exported = createBuildLabExport(loaded.state, dataset, characters);
const imported = parseBuildLabImport(exported, dataset, characters);
assert.equal(imported.tests.length, 1);
assert.equal(imported.tests[0].observations, 'Second observation.');

const removed = removeBuildTest(imported, test.id, dataset, characters);
assert.equal(removed.tests.length, 0);

assert.throws(() => normaliseBuildLabState({ ...empty, tests: [{ ...test, characterId: 'not-real' }] }, dataset, characters), /Unknown build-test character/);
assert.throws(() => normaliseBuildLabState({ ...empty, tests: [{ ...test, metrics: { reach: 6 } }] }, dataset, characters), /integer from 1 to 5/);
assert.throws(() => normaliseBuildLabState({ ...empty, tests: [{ ...test, observations: 'x'.repeat(5001) }] }, dataset, characters), /exceeds 5000 characters/);
assert.throws(() => parseBuildLabImport({ ...exported, kind: 'foreign-backup' }, dataset, characters), /not a Crimson Desert Guide Build Laboratory backup/);
assert.throws(() => normaliseBuildLabState({ ...empty, tests: [test, test] }, dataset, characters), /Duplicate build-test ID/);

console.log('Build Laboratory state tests passed create, update, persistence, export, rejection and deletion paths.');

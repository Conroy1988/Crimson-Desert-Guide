import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createCollectibleExport,
  createEmptyCollectibleState,
  loadCollectibleState,
  normaliseCollectibleState,
  parseCollectibleImport,
  saveCollectibleState,
} from '../src/lib/collectible-state.mjs';

const dataset = JSON.parse(
  await readFile(new URL('../data/collectible-catalogue.json', import.meta.url), 'utf8'),
);
const firstCategory = dataset.records.find((record) => record.scope === 'category' && record.officialTotal === null);
const contract = dataset.records.find((record) => record.recordId === 'knowledge-collectibles-contract');
const individual = dataset.records.find((record) => record.recordId === 'knowledge-irkyn');
assert(firstCategory && contract && individual);

const storage = new Map();
const adapter = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};

const empty = createEmptyCollectibleState(dataset);
assert.deepEqual(empty.counts, {});
assert.deepEqual(empty.notes, {});
assert.deepEqual(empty.research, []);

const state = normaliseCollectibleState({
  ...empty,
  counts: {
    [contract.id]: 12,
    [individual.id]: 1,
  },
  notes: {
    [contract.id]: 'Checked twelve entries during the current route.',
  },
  research: [firstCategory.id, firstCategory.id],
}, dataset);
assert.equal(state.counts[contract.id], 12);
assert.equal(state.counts[individual.id], 1);
assert.equal(state.research.length, 1);

const saved = saveCollectibleState(adapter, state, dataset);
assert.equal(saved.storageAvailable, true);
const loaded = loadCollectibleState(adapter, dataset);
assert.equal(loaded.error, null);
assert.equal(loaded.state.counts[contract.id], 12);

const exported = createCollectibleExport(loaded.state, dataset);
const imported = parseCollectibleImport(exported, dataset);
assert.equal(imported.notes[contract.id], 'Checked twelve entries during the current route.');
assert.deepEqual(imported.research, [firstCategory.id]);

assert.throws(
  () => normaliseCollectibleState({ ...empty, counts: { [contract.id]: 52 } }, dataset),
  /cannot exceed 51/,
);
assert.throws(
  () => normaliseCollectibleState({ ...empty, counts: { 'catalogue-not-real': 1 } }, dataset),
  /Unknown collectible catalogue ID/,
);
assert.throws(
  () => normaliseCollectibleState({ ...empty, notes: { [individual.id]: 'x'.repeat(5001) } }, dataset),
  /exceeds 5000 characters/,
);
assert.throws(
  () => parseCollectibleImport({ ...exported, kind: 'foreign-backup' }, dataset),
  /not a Crimson Desert Guide collectible backup/,
);

const migratedDataset = structuredClone(dataset);
migratedDataset.migrations.renamedIds['catalogue-old-contract'] = contract.id;
const migrated = normaliseCollectibleState({
  ...empty,
  counts: { 'catalogue-old-contract': 3 },
  notes: {},
  research: [],
}, migratedDataset);
assert.equal(migrated.counts[contract.id], 3);

console.log('Collectible state tests passed persistence, bounds, migration and backup validation.');

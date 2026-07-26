import assert from 'node:assert/strict';
import {
  createEmptyResearchQueueState,
  createResearchQueueExport,
  loadResearchQueueState,
  parseResearchQueueImport,
  saveResearchQueueState,
  setResearchNote,
  setResearchStage,
} from '../src/lib/research-queue-state.mjs';

const dataset = {
  datasetVersion: '1.0.0',
  gamePatch: '1.15.00',
  storageKey: 'research-test',
  records: [{ id: 'quest-a' }, { id: 'boss-b' }],
  migrations: { renamedIds: { 'quest-old': 'quest-a' }, retiredIds: ['retired-record'] },
};

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, value); }
}

const storage = new MemoryStorage();
let state = createEmptyResearchQueueState(dataset);
assert.deepEqual(state.stages, {});
assert.deepEqual(state.notes, {});

state = setResearchStage(state, dataset, 'quest-a', 'testing');
state = setResearchNote(state, dataset, 'quest-a', 'Capture the reward screen on the next run.');
state = setResearchStage(state, dataset, 'boss-b', 'planned');
const saved = saveResearchQueueState(storage, state, dataset);
assert.equal(saved.storageAvailable, true);
assert.equal(saved.state.stages['quest-a'], 'testing');
assert.equal(saved.state.notes['quest-a'], 'Capture the reward screen on the next run.');

const loaded = loadResearchQueueState(storage, dataset);
assert.equal(loaded.error, null);
assert.deepEqual(loaded.state.stages, saved.state.stages);
assert.deepEqual(loaded.state.notes, saved.state.notes);

const exported = createResearchQueueExport(loaded.state, dataset);
assert.equal(exported.kind, 'crimson-desert-guide-research-queue');
assert.equal(exported.gamePatch, '1.15.00');
const imported = parseResearchQueueImport(exported, dataset);
assert.deepEqual(imported.stages, loaded.state.stages);
assert.deepEqual(imported.notes, loaded.state.notes);

const migrated = parseResearchQueueImport({
  kind: 'crimson-desert-guide-research-queue',
  schemaVersion: 1,
  stages: { 'quest-old': 'evidence-ready', 'retired-record': 'planned' },
  notes: { 'quest-old': 'Migrated note', 'retired-record': 'Removed note' },
}, dataset);
assert.deepEqual(migrated.stages, { 'quest-a': 'evidence-ready' });
assert.deepEqual(migrated.notes, { 'quest-a': 'Migrated note' });

assert.throws(() => setResearchStage(state, dataset, 'quest-a', 'published'), /unsupported research stage/);
assert.throws(() => setResearchNote(state, dataset, 'quest-a', 'x'.repeat(5001)), /exceeds 5000/);
assert.throws(() => parseResearchQueueImport({ kind: 'wrong', schemaVersion: 1 }, dataset), /not a Crimson Desert Guide research queue backup/);

console.log('Research queue state tests passed.');

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COMPLETION_EXPORT_KIND,
  createCompletionExport,
  createEmptyCompletionState,
  normaliseCompletionState,
  parseCompletionImport,
} from '../src/lib/completion-state.js';

const dataset = JSON.parse(
  await readFile(new URL('../data/completion.json', import.meta.url), 'utf8'),
);

const empty = createEmptyCompletionState(dataset);
assert.equal(empty.schemaVersion, 1);
assert.equal(empty.datasetVersion, dataset.datasetVersion);
assert.deepEqual(empty.completed, []);
assert.deepEqual(empty.revealed, []);

const selected = dataset.entries.slice(0, 3).map((entry) => entry.id);
const state = normaliseCompletionState(
  {
    schemaVersion: 1,
    datasetVersion: '0.0.1',
    completed: [selected[0], selected[0], selected[1]],
    revealed: [selected[2], selected[2]],
  },
  dataset,
);
assert.deepEqual(state.completed, [selected[0], selected[1]]);
assert.deepEqual(state.revealed, [selected[2]]);
assert.equal(state.datasetVersion, dataset.datasetVersion);

const backup = createCompletionExport(state, dataset);
assert.equal(backup.kind, COMPLETION_EXPORT_KIND);
assert.equal(backup.gamePatch, dataset.gamePatch);
assert.deepEqual(parseCompletionImport(backup, dataset).completed, state.completed);

assert.throws(
  () => parseCompletionImport({ ...backup, kind: 'not-this-project' }, dataset),
  /not a Crimson Desert Guide completion backup/,
);
assert.throws(
  () => parseCompletionImport({ ...backup, completed: ['unknown-entry'] }, dataset),
  /Unknown completion entry ID/,
);
assert.throws(
  () => parseCompletionImport({ ...backup, completed: 'not-an-array' }, dataset),
  /must be an array/,
);
assert.throws(
  () => normaliseCompletionState({ ...state, schemaVersion: 99 }, dataset),
  /Unsupported completion state schema/,
);

const migratedDataset = structuredClone(dataset);
migratedDataset.migrations = {
  renamedIds: { 'old-stable-id': selected[0] },
  retiredIds: ['retired-stable-id'],
};
const migrated = parseCompletionImport(
  {
    ...backup,
    completed: ['old-stable-id', 'retired-stable-id', selected[1]],
    revealed: ['old-stable-id'],
  },
  migratedDataset,
);
assert.deepEqual(migrated.completed, [selected[0], selected[1]]);
assert.deepEqual(migrated.revealed, [selected[0]]);

console.log('Completion state tests passed: empty, round-trip, rejection and migration paths verified.');

import { readFile } from 'node:fs/promises';
import {
  addExpeditionTask,
  createEmptyCommandCentreState,
  createGuideVault,
  moveExpeditionTask,
  normaliseCommandCentreState,
  parseGuideVault,
  restoreGuideVault,
  setSpoilerProfile,
  updateExpeditionTask,
} from '../src/lib/command-centre-state.mjs';

const dataset = JSON.parse(await readFile(new URL('../data/command-centre.json', import.meta.url), 'utf8'));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const memory = new Map();
const storage = {
  getItem: (key) => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
};

let state = createEmptyCommandCentreState(dataset);
check(state.tasks.length === 0, 'empty Command Centre state should contain no tasks');
check(state.spoilerProfile === 'minor', 'default spoiler profile should be minor');

const first = dataset.plannerRecords[0];
const second = dataset.plannerRecords[1];
state = addExpeditionTask(state, dataset, first.id, 'exp-first-task');
state = addExpeditionTask(state, dataset, second.id, 'exp-second-task');
state = addExpeditionTask(state, dataset, first.id, 'exp-duplicate-task');
check(state.tasks.length === 2, 'duplicate planner records should not be added twice');
state = updateExpeditionTask(state, dataset, 'exp-first-task', { done: true, note: 'Bring the verified route notes.' });
check(state.tasks[0].done === true && state.tasks[0].note.includes('verified route'), 'task updates should persist completion and notes');
state = moveExpeditionTask(state, dataset, 'exp-second-task', 'up');
check(state.tasks[0].id === 'exp-second-task', 'task movement should preserve deterministic order');
state = setSpoilerProfile(state, dataset, 'safe');
check(state.spoilerProfile === 'safe', 'spoiler profile should update');

storage.setItem(dataset.storageKey, JSON.stringify(normaliseCommandCentreState(state, dataset)));
storage.setItem(dataset.spoilerKey, state.spoilerProfile);
storage.setItem(dataset.lastRouteKey, JSON.stringify({ href: '/systems/combat/', title: 'Combat Doctrine', visitedAt: new Date().toISOString() }));
for (const source of dataset.stateSources) {
  if (source.id === 'completion') storage.setItem(source.storageKey, JSON.stringify({ schemaVersion: 1, datasetVersion: '1.0.0', completed: [], revealed: [] }));
  if (source.id === 'atlas') storage.setItem(source.storageKey, JSON.stringify({ format: 'crimson-desert-guide.atlas-backup', schemaVersion: 1, datasetVersion: '1.0.0', visited: [], activated: [], checkedServices: [], revealed: [] }));
  if (source.id === 'collectibles') storage.setItem(source.storageKey, JSON.stringify({ schemaVersion: 1, datasetVersion: '1.0.0', counts: {}, notes: {}, research: [] }));
  if (source.id === 'research') storage.setItem(source.storageKey, JSON.stringify({ schemaVersion: 1, datasetVersion: '1.0.0', stages: {}, notes: {} }));
  if (source.id === 'builds') storage.setItem(source.storageKey, JSON.stringify({ schemaVersion: 1, datasetVersion: '1.0.0', tests: [] }));
}

const vault = createGuideVault(storage, state, dataset);
check(vault.kind === dataset.vaultKind, 'guide vault kind should match the generated registry');
check(Object.keys(vault.entries).length === dataset.stateSources.length, 'guide vault should include every populated supported source');
const parsed = parseGuideVault(vault, dataset);
check(parsed.commandCentre.tasks.length === 2, 'guide vault should preserve expedition tasks');

const restoredMemory = new Map();
const restoredStorage = {
  getItem: (key) => restoredMemory.has(key) ? restoredMemory.get(key) : null,
  setItem: (key, value) => restoredMemory.set(key, String(value)),
};
const restored = restoreGuideVault(restoredStorage, vault, dataset);
check(restored.spoilerProfile === 'safe', 'vault restore should preserve spoiler profile');
check(restoredMemory.has(dataset.lastRouteKey), 'vault restore should preserve the last route');
check(dataset.stateSources.every((source) => restoredMemory.has(source.storageKey)), 'vault restore should write every supported state source');

try {
  normaliseCommandCentreState({ ...state, tasks: [{ ...state.tasks[0], recordId: 'unknown-record' }] }, dataset);
  failures.push('unknown planner records should be rejected');
} catch { /* Expected. */ }

try {
  parseGuideVault({ ...vault, entries: { malware: {} } }, dataset);
  failures.push('unknown guide-vault sources should be rejected');
} catch { /* Expected. */ }

if (failures.length) {
  console.error('Command Centre state test failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Command Centre state test passed ${dataset.plannerRecords.length} planner records, ${dataset.stateSources.length} vault sources and persistent spoiler preferences.`);

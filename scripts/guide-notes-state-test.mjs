import assert from 'node:assert/strict';
import {
  createGuideNotesState,
  exportGuideNotes,
  hasGuideNote,
  importGuideNotes,
  mergeGuideNotes,
  setGuideNote,
  setPreparationItem,
  validateGuideNotesState,
} from '../src/lib/guide-notes-state.mjs';

const recordIds = ['detail-quest-alpha', 'detail-boss-beta'];
const checklistByRecord = {
  'detail-quest-alpha': ['save', 'loadout', 'blockers'],
  'detail-boss-beta': ['save', 'loadout', 'blockers'],
};

let state = createGuideNotesState();
state = setGuideNote(state, 'detail-quest-alpha', '  Test the objective after patching.  ', recordIds, checklistByRecord);
assert.equal(state.notes['detail-quest-alpha'], 'Test the objective after patching.');
assert.equal(hasGuideNote(state, 'detail-quest-alpha'), true);

state = setPreparationItem(state, 'detail-quest-alpha', 'save', true, recordIds, checklistByRecord);
state = setPreparationItem(state, 'detail-quest-alpha', 'loadout', true, recordIds, checklistByRecord);
assert.deepEqual(state.preparation['detail-quest-alpha'], ['save', 'loadout']);

state = setPreparationItem(state, 'detail-quest-alpha', 'save', false, recordIds, checklistByRecord);
assert.deepEqual(state.preparation['detail-quest-alpha'], ['loadout']);

const exported = exportGuideNotes(state, recordIds, checklistByRecord);
const imported = importGuideNotes(exported, recordIds, checklistByRecord);
assert.deepEqual(imported, state);

const merged = mergeGuideNotes(
  state,
  {
    schemaVersion: 1,
    notes: { 'detail-boss-beta': 'Watch stamina before retrying.' },
    preparation: { 'detail-boss-beta': ['blockers'] },
  },
  recordIds,
  checklistByRecord,
);
assert.equal(merged.notes['detail-boss-beta'], 'Watch stamina before retrying.');
assert.deepEqual(merged.preparation['detail-boss-beta'], ['blockers']);

assert.throws(
  () => validateGuideNotesState({ schemaVersion: 1, notes: { unknown: 'x' }, preparation: {} }, recordIds, checklistByRecord),
  /Unknown guide-detail record/,
);
assert.throws(
  () => importGuideNotes('{not-json}', recordIds, checklistByRecord),
  /not valid JSON/,
);
assert.throws(
  () => validateGuideNotesState({ schemaVersion: 2, notes: {}, preparation: {} }, recordIds, checklistByRecord),
  /Unsupported guide-note backup version/,
);
assert.throws(
  () => validateGuideNotesState({ schemaVersion: 1, notes: {}, preparation: { 'detail-boss-beta': ['unknown'] } }, recordIds, checklistByRecord),
  /Unknown preparation item/,
);

console.log('Guide-note state tests passed persistence, validation, merge and backup round-trips.');

export const GUIDE_NOTES_SCHEMA_VERSION = 1;

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

export function createGuideNotesState() {
  return {
    schemaVersion: GUIDE_NOTES_SCHEMA_VERSION,
    notes: {},
    preparation: {},
  };
}

export function validateGuideNotesState(candidate, recordIds, checklistByRecord) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('Guide-note backup must be an object.');
  }
  if (candidate.schemaVersion !== GUIDE_NOTES_SCHEMA_VERSION) {
    throw new Error('Unsupported guide-note backup version.');
  }
  if (!candidate.notes || typeof candidate.notes !== 'object' || Array.isArray(candidate.notes)) {
    throw new Error('Guide-note backup is missing notes.');
  }
  if (!candidate.preparation || typeof candidate.preparation !== 'object' || Array.isArray(candidate.preparation)) {
    throw new Error('Guide-note backup is missing preparation state.');
  }

  const allowedRecords = new Set(recordIds);
  const clean = createGuideNotesState();

  for (const [recordId, note] of Object.entries(candidate.notes)) {
    if (!allowedRecords.has(recordId)) throw new Error(`Unknown guide-detail record: ${recordId}`);
    if (typeof note !== 'string') throw new Error(`Note for ${recordId} must be text.`);
    const trimmed = note.trim();
    if (trimmed.length > 5000) throw new Error(`Note for ${recordId} exceeds 5,000 characters.`);
    if (trimmed) clean.notes[recordId] = trimmed;
  }

  for (const [recordId, completed] of Object.entries(candidate.preparation)) {
    if (!allowedRecords.has(recordId)) throw new Error(`Unknown guide-detail record: ${recordId}`);
    if (!Array.isArray(completed)) throw new Error(`Preparation state for ${recordId} must be an array.`);
    const allowedItems = new Set(checklistByRecord[recordId] ?? []);
    const seen = new Set();
    clean.preparation[recordId] = [];
    for (const itemId of completed) {
      if (typeof itemId !== 'string' || !allowedItems.has(itemId)) {
        throw new Error(`Unknown preparation item ${itemId} for ${recordId}.`);
      }
      if (!seen.has(itemId)) clean.preparation[recordId].push(itemId);
      seen.add(itemId);
    }
    if (clean.preparation[recordId].length === 0) delete clean.preparation[recordId];
  }

  return clean;
}

export function setGuideNote(state, recordId, note, recordIds, checklistByRecord) {
  const next = structuredClone(state);
  const trimmed = String(note ?? '').trim();
  if (trimmed) next.notes[recordId] = trimmed;
  else delete next.notes[recordId];
  return validateGuideNotesState(next, recordIds, checklistByRecord);
}

export function setPreparationItem(state, recordId, itemId, checked, recordIds, checklistByRecord) {
  const next = structuredClone(state);
  const current = new Set(next.preparation[recordId] ?? []);
  if (checked) current.add(itemId);
  else current.delete(itemId);
  if (current.size) next.preparation[recordId] = [...current];
  else delete next.preparation[recordId];
  return validateGuideNotesState(next, recordIds, checklistByRecord);
}

export function exportGuideNotes(state, recordIds, checklistByRecord) {
  return JSON.stringify(validateGuideNotesState(state, recordIds, checklistByRecord), null, 2);
}

export function importGuideNotes(text, recordIds, checklistByRecord) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Guide-note backup is not valid JSON.');
  }
  return validateGuideNotesState(parsed, recordIds, checklistByRecord);
}

export function mergeGuideNotes(base, incoming, recordIds, checklistByRecord) {
  const left = validateGuideNotesState(base, recordIds, checklistByRecord);
  const right = validateGuideNotesState(incoming, recordIds, checklistByRecord);
  return validateGuideNotesState(
    {
      schemaVersion: GUIDE_NOTES_SCHEMA_VERSION,
      notes: { ...left.notes, ...right.notes },
      preparation: { ...left.preparation, ...right.preparation },
    },
    recordIds,
    checklistByRecord,
  );
}

export function hasGuideNote(state, recordId) {
  return hasOwn(state.notes, recordId) && state.notes[recordId].length > 0;
}

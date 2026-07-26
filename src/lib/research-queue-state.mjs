export const RESEARCH_QUEUE_EXPORT_KIND = 'crimson-desert-guide-research-queue';
export const RESEARCH_QUEUE_STATE_SCHEMA = 1;
export const MAX_RESEARCH_NOTE_LENGTH = 5000;
export const RESEARCH_STAGES = ['planned', 'testing', 'evidence-ready'];

function assertDataset(dataset) {
  if (!dataset || typeof dataset !== 'object' || !Array.isArray(dataset.records)) {
    throw new TypeError('Research queue is unavailable.');
  }
  if (typeof dataset.datasetVersion !== 'string' || !dataset.datasetVersion) {
    throw new TypeError('Research queue version is invalid.');
  }
}

function recordIds(dataset) {
  return new Set(dataset.records.map((record) => record.id));
}

function renamedIds(dataset) {
  const values = dataset.migrations?.renamedIds;
  return values && typeof values === 'object' ? values : {};
}

function retiredIds(dataset) {
  const values = dataset.migrations?.retiredIds;
  return new Set(Array.isArray(values) ? values : []);
}

function migrateId(id, dataset) {
  const ids = recordIds(dataset);
  if (ids.has(id)) return id;
  const replacement = renamedIds(dataset)[id];
  if (typeof replacement === 'string' && ids.has(replacement)) return replacement;
  if (retiredIds(dataset).has(id)) return null;
  throw new Error(`Unknown research queue ID: ${id}`);
}

function normaliseStages(values, dataset) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Research stages must be an object.');
  }
  const output = {};
  for (const [rawId, rawStage] of Object.entries(values)) {
    const id = migrateId(rawId, dataset);
    if (!id) continue;
    if (!RESEARCH_STAGES.includes(rawStage)) {
      throw new Error(`${id}: unsupported research stage ${rawStage}.`);
    }
    output[id] = rawStage;
  }
  return output;
}

function normaliseNotes(values, dataset) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Research notes must be an object.');
  }
  const output = {};
  for (const [rawId, rawValue] of Object.entries(values)) {
    const id = migrateId(rawId, dataset);
    if (!id) continue;
    if (typeof rawValue !== 'string') throw new TypeError(`${id}: research note must be text.`);
    const value = rawValue.trim();
    if (value.length > MAX_RESEARCH_NOTE_LENGTH) {
      throw new Error(`${id}: research note exceeds ${MAX_RESEARCH_NOTE_LENGTH} characters.`);
    }
    if (value) output[id] = value;
  }
  return output;
}

export function createEmptyResearchQueueState(dataset) {
  assertDataset(dataset);
  return {
    schemaVersion: RESEARCH_QUEUE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    stages: {},
    notes: {},
    updatedAt: new Date().toISOString(),
  };
}

export function normaliseResearchQueueState(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Research queue state must be an object.');
  }
  if (Number(raw.schemaVersion) !== RESEARCH_QUEUE_STATE_SCHEMA) {
    throw new Error(`Unsupported research queue state schema: ${raw.schemaVersion}`);
  }
  return {
    schemaVersion: RESEARCH_QUEUE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    stages: normaliseStages(raw.stages ?? {}, dataset),
    notes: normaliseNotes(raw.notes ?? {}, dataset),
    updatedAt: new Date().toISOString(),
  };
}

export function loadResearchQueueState(storage, dataset) {
  const empty = createEmptyResearchQueueState(dataset);
  if (!storage || typeof storage.getItem !== 'function') {
    return { state: empty, storageAvailable: false, error: null };
  }
  try {
    const stored = storage.getItem(dataset.storageKey);
    if (!stored) return { state: empty, storageAvailable: true, error: null };
    return {
      state: normaliseResearchQueueState(JSON.parse(stored), dataset),
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      state: empty,
      storageAvailable: true,
      error: error instanceof Error ? error.message : 'Saved research queue state could not be read.',
    };
  }
}

export function saveResearchQueueState(storage, state, dataset) {
  const normalised = normaliseResearchQueueState(state, dataset);
  if (!storage || typeof storage.setItem !== 'function') {
    return { state: normalised, storageAvailable: false };
  }
  storage.setItem(dataset.storageKey, JSON.stringify(normalised));
  return { state: normalised, storageAvailable: true };
}

export function setResearchStage(state, dataset, id, stage) {
  const normalised = normaliseResearchQueueState(state, dataset);
  const migrated = migrateId(id, dataset);
  if (!migrated) return normalised;
  if (!stage) delete normalised.stages[migrated];
  else if (RESEARCH_STAGES.includes(stage)) normalised.stages[migrated] = stage;
  else throw new Error(`${migrated}: unsupported research stage ${stage}.`);
  normalised.updatedAt = new Date().toISOString();
  return normalised;
}

export function setResearchNote(state, dataset, id, note) {
  const normalised = normaliseResearchQueueState(state, dataset);
  const migrated = migrateId(id, dataset);
  if (!migrated) return normalised;
  if (typeof note !== 'string') throw new TypeError(`${migrated}: research note must be text.`);
  const value = note.trim();
  if (value.length > MAX_RESEARCH_NOTE_LENGTH) {
    throw new Error(`${migrated}: research note exceeds ${MAX_RESEARCH_NOTE_LENGTH} characters.`);
  }
  if (value) normalised.notes[migrated] = value;
  else delete normalised.notes[migrated];
  normalised.updatedAt = new Date().toISOString();
  return normalised;
}

export function createResearchQueueExport(state, dataset) {
  const normalised = normaliseResearchQueueState(state, dataset);
  return {
    kind: RESEARCH_QUEUE_EXPORT_KIND,
    schemaVersion: RESEARCH_QUEUE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    gamePatch: dataset.gamePatch,
    exportedAt: new Date().toISOString(),
    stages: normalised.stages,
    notes: normalised.notes,
  };
}

export function parseResearchQueueImport(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Imported research queue backup must be a JSON object.');
  }
  if (raw.kind !== RESEARCH_QUEUE_EXPORT_KIND) {
    throw new Error('This file is not a Crimson Desert Guide research queue backup.');
  }
  return normaliseResearchQueueState(raw, dataset);
}

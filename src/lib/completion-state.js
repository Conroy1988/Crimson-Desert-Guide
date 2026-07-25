export const COMPLETION_EXPORT_KIND = 'crimson-desert-guide-completion';
export const COMPLETION_STATE_SCHEMA = 1;

function assertDataset(dataset) {
  if (!dataset || typeof dataset !== 'object') {
    throw new TypeError('Completion dataset is unavailable.');
  }
  if (!Array.isArray(dataset.entries)) {
    throw new TypeError('Completion dataset entries are invalid.');
  }
  if (typeof dataset.datasetVersion !== 'string' || !dataset.datasetVersion) {
    throw new TypeError('Completion dataset version is invalid.');
  }
}

function assertStringArray(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new TypeError(`${field} must be an array of stable entry IDs.`);
  }
}

function unique(values) {
  return [...new Set(values)];
}

function knownIds(dataset) {
  return new Set(dataset.entries.map((entry) => entry.id));
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
  const known = knownIds(dataset);
  if (known.has(id)) return id;

  const renamed = renamedIds(dataset);
  const replacement = renamed[id];
  if (typeof replacement === 'string' && known.has(replacement)) return replacement;

  if (retiredIds(dataset).has(id)) return null;
  throw new Error(`Unknown completion entry ID: ${id}`);
}

function migrateIds(values, dataset) {
  return unique(
    values
      .map((id) => migrateId(id, dataset))
      .filter((id) => typeof id === 'string'),
  );
}

export function createEmptyCompletionState(dataset) {
  assertDataset(dataset);
  return {
    schemaVersion: COMPLETION_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    completed: [],
    revealed: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normaliseCompletionState(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Completion state must be an object.');
  }

  const schemaVersion = Number(raw.schemaVersion);
  if (schemaVersion !== COMPLETION_STATE_SCHEMA) {
    throw new Error(`Unsupported completion state schema: ${raw.schemaVersion}`);
  }

  assertStringArray(raw.completed, 'completed');
  assertStringArray(raw.revealed ?? [], 'revealed');

  return {
    schemaVersion: COMPLETION_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    completed: migrateIds(raw.completed, dataset),
    revealed: migrateIds(raw.revealed ?? [], dataset),
    updatedAt: new Date().toISOString(),
  };
}

export function createCompletionExport(state, dataset) {
  const normalised = normaliseCompletionState(state, dataset);
  return {
    kind: COMPLETION_EXPORT_KIND,
    schemaVersion: COMPLETION_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    gamePatch: dataset.gamePatch,
    exportedAt: new Date().toISOString(),
    completed: normalised.completed,
    revealed: normalised.revealed,
  };
}

export function parseCompletionImport(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Imported completion backup must be a JSON object.');
  }
  if (raw.kind !== COMPLETION_EXPORT_KIND) {
    throw new Error('This file is not a Crimson Desert Guide completion backup.');
  }
  return normaliseCompletionState(raw, dataset);
}

export function loadCompletionState(storage, dataset) {
  assertDataset(dataset);
  const empty = createEmptyCompletionState(dataset);
  if (!storage || typeof storage.getItem !== 'function') {
    return { state: empty, storageAvailable: false, error: null };
  }

  try {
    const stored = storage.getItem(dataset.storageKey);
    if (!stored) return { state: empty, storageAvailable: true, error: null };
    const parsed = JSON.parse(stored);
    return {
      state: normaliseCompletionState(parsed, dataset),
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      state: empty,
      storageAvailable: true,
      error: error instanceof Error ? error.message : 'Saved progress could not be read.',
    };
  }
}

export function saveCompletionState(storage, state, dataset) {
  const normalised = normaliseCompletionState(state, dataset);
  if (!storage || typeof storage.setItem !== 'function') {
    return { state: normalised, storageAvailable: false };
  }
  storage.setItem(dataset.storageKey, JSON.stringify(normalised));
  return { state: normalised, storageAvailable: true };
}

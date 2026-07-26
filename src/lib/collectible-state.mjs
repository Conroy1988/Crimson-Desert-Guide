export const COLLECTIBLE_EXPORT_KIND = 'crimson-desert-guide-collectibles';
export const COLLECTIBLE_STATE_SCHEMA = 1;
export const MAX_COLLECTIBLE_NOTE_LENGTH = 5000;
export const MAX_UNVERIFIED_COUNT = 99999;

function assertDataset(dataset) {
  if (!dataset || typeof dataset !== 'object' || !Array.isArray(dataset.records)) {
    throw new TypeError('Collectible catalogue is unavailable.');
  }
  if (typeof dataset.datasetVersion !== 'string' || !dataset.datasetVersion) {
    throw new TypeError('Collectible catalogue version is invalid.');
  }
}

function recordMap(dataset) {
  return new Map(dataset.records.map((record) => [record.id, record]));
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
  const records = recordMap(dataset);
  if (records.has(id)) return id;
  const replacement = renamedIds(dataset)[id];
  if (typeof replacement === 'string' && records.has(replacement)) return replacement;
  if (retiredIds(dataset).has(id)) return null;
  throw new Error(`Unknown collectible catalogue ID: ${id}`);
}

function normaliseResearch(values, dataset) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string')) {
    throw new TypeError('Research flags must be stable catalogue IDs.');
  }
  return [...new Set(values.map((id) => migrateId(id, dataset)).filter(Boolean))];
}

function normaliseCounts(values, dataset) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Discovered counts must be an object.');
  }
  const records = recordMap(dataset);
  const output = {};
  for (const [rawId, rawValue] of Object.entries(values)) {
    const id = migrateId(rawId, dataset);
    if (!id) continue;
    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`${id}: discovered count must be a non-negative integer.`);
    }
    const officialTotal = records.get(id)?.officialTotal;
    const maximum = Number.isInteger(officialTotal) ? officialTotal : MAX_UNVERIFIED_COUNT;
    if (value > maximum) {
      throw new Error(`${id}: discovered count cannot exceed ${maximum}.`);
    }
    if (value > 0) output[id] = value;
  }
  return output;
}

function normaliseNotes(values, dataset) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Catalogue notes must be an object.');
  }
  const output = {};
  for (const [rawId, rawValue] of Object.entries(values)) {
    const id = migrateId(rawId, dataset);
    if (!id) continue;
    if (typeof rawValue !== 'string') throw new TypeError(`${id}: note must be text.`);
    const value = rawValue.trim();
    if (value.length > MAX_COLLECTIBLE_NOTE_LENGTH) {
      throw new Error(`${id}: note exceeds ${MAX_COLLECTIBLE_NOTE_LENGTH} characters.`);
    }
    if (value) output[id] = value;
  }
  return output;
}

export function createEmptyCollectibleState(dataset) {
  assertDataset(dataset);
  return {
    schemaVersion: COLLECTIBLE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    counts: {},
    notes: {},
    research: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normaliseCollectibleState(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Collectible state must be an object.');
  }
  if (Number(raw.schemaVersion) !== COLLECTIBLE_STATE_SCHEMA) {
    throw new Error(`Unsupported collectible state schema: ${raw.schemaVersion}`);
  }
  return {
    schemaVersion: COLLECTIBLE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    counts: normaliseCounts(raw.counts ?? {}, dataset),
    notes: normaliseNotes(raw.notes ?? {}, dataset),
    research: normaliseResearch(raw.research ?? [], dataset),
    updatedAt: new Date().toISOString(),
  };
}

export function loadCollectibleState(storage, dataset) {
  const empty = createEmptyCollectibleState(dataset);
  if (!storage || typeof storage.getItem !== 'function') {
    return { state: empty, storageAvailable: false, error: null };
  }
  try {
    const stored = storage.getItem(dataset.storageKey);
    if (!stored) return { state: empty, storageAvailable: true, error: null };
    return {
      state: normaliseCollectibleState(JSON.parse(stored), dataset),
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      state: empty,
      storageAvailable: true,
      error: error instanceof Error ? error.message : 'Saved catalogue state could not be read.',
    };
  }
}

export function saveCollectibleState(storage, state, dataset) {
  const normalised = normaliseCollectibleState(state, dataset);
  if (!storage || typeof storage.setItem !== 'function') {
    return { state: normalised, storageAvailable: false };
  }
  storage.setItem(dataset.storageKey, JSON.stringify(normalised));
  return { state: normalised, storageAvailable: true };
}

export function createCollectibleExport(state, dataset) {
  const normalised = normaliseCollectibleState(state, dataset);
  return {
    kind: COLLECTIBLE_EXPORT_KIND,
    schemaVersion: COLLECTIBLE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    gamePatch: dataset.gamePatch,
    exportedAt: new Date().toISOString(),
    counts: normalised.counts,
    notes: normalised.notes,
    research: normalised.research,
  };
}

export function parseCollectibleImport(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('Imported catalogue backup must be a JSON object.');
  }
  if (raw.kind !== COLLECTIBLE_EXPORT_KIND) {
    throw new Error('This file is not a Crimson Desert Guide collectible backup.');
  }
  return normaliseCollectibleState(raw, dataset);
}

export const BUILD_LAB_EXPORT_KIND = 'crimson-desert-guide-build-lab';
export const BUILD_LAB_STATE_SCHEMA = 1;
export const BUILD_LAB_MAX_TESTS = 100;
export const BUILD_LAB_MAX_TEXT = 5000;

const confidenceValues = new Set(['unrated', 'low', 'medium', 'high']);
const defenceValues = new Set(['balanced', 'guard', 'evasion', 'distance', 'control']);
const testIdPattern = /^test-[a-z0-9-]{6,80}$/;

function assertDataset(dataset) {
  if (!dataset || typeof dataset !== 'object') throw new TypeError('Build Laboratory dataset is unavailable.');
  if (!Array.isArray(dataset.archetypes) || !Array.isArray(dataset.weaponFamilies) || !Array.isArray(dataset.encounters) || !Array.isArray(dataset.dimensions)) {
    throw new TypeError('Build Laboratory dataset is invalid.');
  }
  if (typeof dataset.datasetVersion !== 'string' || !dataset.datasetVersion) throw new TypeError('Build Laboratory version is invalid.');
}

function allowedIds(values) {
  return new Set(values.map((value) => value.id));
}

function cleanText(value, field, maximum = BUILD_LAB_MAX_TEXT) {
  if (typeof value !== 'string') throw new TypeError(`${field} must be text.`);
  const clean = value.trim();
  if (clean.length > maximum) throw new Error(`${field} exceeds ${maximum} characters.`);
  return clean;
}

function cleanDate(value, field) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw new Error(`${field} must be an ISO date.`);
  return new Date(value).toISOString();
}

function normaliseMetrics(raw, dataset) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Test metrics must be an object.');
  const dimensionIds = allowedIds(dataset.dimensions);
  const output = {};
  for (const [id, value] of Object.entries(raw)) {
    if (!dimensionIds.has(id)) throw new Error(`Unknown build-test dimension: ${id}`);
    const score = Number(value);
    if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error(`${id}: metric must be an integer from 1 to 5.`);
    output[id] = score;
  }
  return output;
}

function normaliseTest(raw, dataset, characterIds) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Build test must be an object.');
  if (!testIdPattern.test(raw.id ?? '')) throw new Error(`Invalid build-test ID: ${raw.id}`);
  if (!characterIds.has(raw.characterId)) throw new Error(`Unknown build-test character: ${raw.characterId}`);
  if (!allowedIds(dataset.archetypes).has(raw.archetypeId)) throw new Error(`Unknown build archetype: ${raw.archetypeId}`);
  if (!allowedIds(dataset.weaponFamilies).has(raw.weaponFamilyId)) throw new Error(`Unknown weapon family: ${raw.weaponFamilyId}`);
  if (!allowedIds(dataset.encounters).has(raw.encounterId)) throw new Error(`Unknown encounter type: ${raw.encounterId}`);
  if (!defenceValues.has(raw.defencePreference)) throw new Error(`Invalid defence preference: ${raw.defencePreference}`);
  if (!confidenceValues.has(raw.confidence)) throw new Error(`Invalid confidence: ${raw.confidence}`);
  return {
    id: raw.id,
    name: cleanText(raw.name, 'Test name', 100),
    characterId: raw.characterId,
    archetypeId: raw.archetypeId,
    weaponFamilyId: raw.weaponFamilyId,
    encounterId: raw.encounterId,
    defencePreference: raw.defencePreference,
    conditions: cleanText(raw.conditions ?? '', 'Test conditions'),
    observations: cleanText(raw.observations ?? '', 'Test observations'),
    metrics: normaliseMetrics(raw.metrics ?? {}, dataset),
    confidence: raw.confidence,
    createdAt: cleanDate(raw.createdAt, 'createdAt'),
    updatedAt: cleanDate(raw.updatedAt, 'updatedAt'),
  };
}

export function createEmptyBuildLabState(dataset) {
  assertDataset(dataset);
  return {
    schemaVersion: BUILD_LAB_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    tests: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normaliseBuildLabState(raw, dataset, characters) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Build Laboratory state must be an object.');
  if (Number(raw.schemaVersion) !== BUILD_LAB_STATE_SCHEMA) throw new Error(`Unsupported Build Laboratory schema: ${raw.schemaVersion}`);
  if (!Array.isArray(characters) || characters.length !== 3) throw new TypeError('Character profiles are unavailable.');
  if (!Array.isArray(raw.tests)) throw new TypeError('Build Laboratory tests must be an array.');
  if (raw.tests.length > BUILD_LAB_MAX_TESTS) throw new Error(`Build Laboratory supports at most ${BUILD_LAB_MAX_TESTS} saved tests.`);
  const characterIds = allowedIds(characters);
  const tests = raw.tests.map((test) => normaliseTest(test, dataset, characterIds));
  const ids = new Set();
  for (const test of tests) {
    if (ids.has(test.id)) throw new Error(`Duplicate build-test ID: ${test.id}`);
    ids.add(test.id);
  }
  return {
    schemaVersion: BUILD_LAB_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    tests,
    updatedAt: new Date().toISOString(),
  };
}

export function loadBuildLabState(storage, dataset, characters) {
  const empty = createEmptyBuildLabState(dataset);
  if (!storage || typeof storage.getItem !== 'function') return { state: empty, storageAvailable: false, error: null };
  try {
    const stored = storage.getItem(dataset.storageKey);
    if (!stored) return { state: empty, storageAvailable: true, error: null };
    return { state: normaliseBuildLabState(JSON.parse(stored), dataset, characters), storageAvailable: true, error: null };
  } catch (error) {
    return { state: empty, storageAvailable: true, error: error instanceof Error ? error.message : 'Build Laboratory data could not be read.' };
  }
}

export function saveBuildLabState(storage, state, dataset, characters) {
  const normalised = normaliseBuildLabState(state, dataset, characters);
  if (!storage || typeof storage.setItem !== 'function') return { state: normalised, storageAvailable: false };
  storage.setItem(dataset.storageKey, JSON.stringify(normalised));
  return { state: normalised, storageAvailable: true };
}

export function upsertBuildTest(state, test, dataset, characters) {
  const candidate = normaliseBuildLabState(state, dataset, characters);
  const normalised = normaliseTest(test, dataset, allowedIds(characters));
  const index = candidate.tests.findIndex((entry) => entry.id === normalised.id);
  if (index === -1) candidate.tests.push(normalised);
  else candidate.tests[index] = normalised;
  return normaliseBuildLabState(candidate, dataset, characters);
}

export function removeBuildTest(state, id, dataset, characters) {
  const candidate = normaliseBuildLabState(state, dataset, characters);
  candidate.tests = candidate.tests.filter((test) => test.id !== id);
  return normaliseBuildLabState(candidate, dataset, characters);
}

export function createBuildLabExport(state, dataset, characters) {
  const normalised = normaliseBuildLabState(state, dataset, characters);
  return {
    kind: BUILD_LAB_EXPORT_KIND,
    schemaVersion: BUILD_LAB_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    gamePatch: dataset.gamePatch,
    exportedAt: new Date().toISOString(),
    tests: normalised.tests,
  };
}

export function parseBuildLabImport(raw, dataset, characters) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Imported Build Laboratory backup must be a JSON object.');
  if (raw.kind !== BUILD_LAB_EXPORT_KIND) throw new Error('This file is not a Crimson Desert Guide Build Laboratory backup.');
  return normaliseBuildLabState({ schemaVersion: raw.schemaVersion, datasetVersion: raw.datasetVersion, tests: raw.tests }, dataset, characters);
}

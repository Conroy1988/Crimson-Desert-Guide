export const COMMAND_CENTRE_EXPORT_KIND = 'crimson-desert-guide-command-centre';
export const GUIDE_VAULT_KIND = 'crimson-desert-guide-vault';
export const COMMAND_CENTRE_STATE_SCHEMA = 1;
export const GUIDE_VAULT_SCHEMA = 1;
export const MAX_EXPEDITION_TASKS = 100;
export const MAX_EXPEDITION_NOTE_LENGTH = 2000;
export const SPOILER_PROFILES = ['safe', 'minor', 'full'];

const taskIdPattern = /^exp-[a-z0-9-]{6,80}$/;

function assertDataset(dataset) {
  if (!dataset || typeof dataset !== 'object' || !Array.isArray(dataset.records)) {
    throw new TypeError('Expedition Command Centre data is unavailable.');
  }
  if (typeof dataset.datasetVersion !== 'string' || !dataset.datasetVersion) {
    throw new TypeError('Expedition Command Centre version is invalid.');
  }
  if (!Array.isArray(dataset.stateSources)) throw new TypeError('Guide state-source registry is invalid.');
}

function recordIds(dataset) {
  return new Set(dataset.records.map((record) => record.id));
}

function cleanText(value, field, maximum = MAX_EXPEDITION_NOTE_LENGTH) {
  if (typeof value !== 'string') throw new TypeError(`${field} must be text.`);
  const clean = value.trim();
  if (clean.length > maximum) throw new Error(`${field} exceeds ${maximum} characters.`);
  return clean;
}

function cleanDate(value, field) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw new Error(`${field} must be an ISO date.`);
  return new Date(value).toISOString();
}

function normaliseTask(raw, dataset) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Expedition task must be an object.');
  if (!taskIdPattern.test(raw.id ?? '')) throw new Error(`Invalid expedition task ID: ${raw.id}`);
  if (!recordIds(dataset).has(raw.recordId)) throw new Error(`Unknown expedition record: ${raw.recordId}`);
  return {
    id: raw.id,
    recordId: raw.recordId,
    done: Boolean(raw.done),
    note: cleanText(raw.note ?? '', 'Expedition note'),
    createdAt: cleanDate(raw.createdAt, 'createdAt'),
    updatedAt: cleanDate(raw.updatedAt, 'updatedAt'),
  };
}

export function createEmptyCommandCentreState(dataset) {
  assertDataset(dataset);
  return {
    schemaVersion: COMMAND_CENTRE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    spoilerProfile: 'minor',
    tasks: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normaliseCommandCentreState(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Command Centre state must be an object.');
  if (Number(raw.schemaVersion) !== COMMAND_CENTRE_STATE_SCHEMA) {
    throw new Error(`Unsupported Command Centre schema: ${raw.schemaVersion}`);
  }
  if (!SPOILER_PROFILES.includes(raw.spoilerProfile)) throw new Error(`Unsupported spoiler profile: ${raw.spoilerProfile}`);
  if (!Array.isArray(raw.tasks)) throw new TypeError('Expedition tasks must be an array.');
  if (raw.tasks.length > MAX_EXPEDITION_TASKS) throw new Error(`Expedition planner supports at most ${MAX_EXPEDITION_TASKS} tasks.`);
  const tasks = raw.tasks.map((task) => normaliseTask(task, dataset));
  const ids = new Set();
  const records = new Set();
  for (const task of tasks) {
    if (ids.has(task.id)) throw new Error(`Duplicate expedition task ID: ${task.id}`);
    if (records.has(task.recordId)) throw new Error(`Duplicate expedition record: ${task.recordId}`);
    ids.add(task.id);
    records.add(task.recordId);
  }
  return {
    schemaVersion: COMMAND_CENTRE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    spoilerProfile: raw.spoilerProfile,
    tasks,
    updatedAt: new Date().toISOString(),
  };
}

export function loadCommandCentreState(storage, dataset) {
  const empty = createEmptyCommandCentreState(dataset);
  if (!storage || typeof storage.getItem !== 'function') return { state: empty, storageAvailable: false, error: null };
  try {
    const stored = storage.getItem(dataset.storageKey);
    if (!stored) return { state: empty, storageAvailable: true, error: null };
    return { state: normaliseCommandCentreState(JSON.parse(stored), dataset), storageAvailable: true, error: null };
  } catch (error) {
    return { state: empty, storageAvailable: true, error: error instanceof Error ? error.message : 'Command Centre state could not be read.' };
  }
}

export function saveCommandCentreState(storage, state, dataset) {
  const normalised = normaliseCommandCentreState(state, dataset);
  if (!storage || typeof storage.setItem !== 'function') return { state: normalised, storageAvailable: false };
  storage.setItem(dataset.storageKey, JSON.stringify(normalised));
  storage.setItem(dataset.spoilerKey, normalised.spoilerProfile);
  return { state: normalised, storageAvailable: true };
}

export function addExpeditionTask(state, dataset, recordId, id = `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`) {
  const normalised = normaliseCommandCentreState(state, dataset);
  if (!recordIds(dataset).has(recordId)) throw new Error(`Unknown expedition record: ${recordId}`);
  if (normalised.tasks.some((task) => task.recordId === recordId)) return normalised;
  if (normalised.tasks.length >= MAX_EXPEDITION_TASKS) throw new Error(`Expedition planner supports at most ${MAX_EXPEDITION_TASKS} tasks.`);
  const now = new Date().toISOString();
  normalised.tasks.push(normaliseTask({ id, recordId, done: false, note: '', createdAt: now, updatedAt: now }, dataset));
  normalised.updatedAt = now;
  return normalised;
}

export function updateExpeditionTask(state, dataset, taskId, patch) {
  const normalised = normaliseCommandCentreState(state, dataset);
  const index = normalised.tasks.findIndex((task) => task.id === taskId);
  if (index === -1) throw new Error(`Unknown expedition task: ${taskId}`);
  const current = normalised.tasks[index];
  normalised.tasks[index] = normaliseTask({
    ...current,
    done: patch.done ?? current.done,
    note: patch.note ?? current.note,
    updatedAt: new Date().toISOString(),
  }, dataset);
  normalised.updatedAt = new Date().toISOString();
  return normalised;
}

export function removeExpeditionTask(state, dataset, taskId) {
  const normalised = normaliseCommandCentreState(state, dataset);
  normalised.tasks = normalised.tasks.filter((task) => task.id !== taskId);
  normalised.updatedAt = new Date().toISOString();
  return normalised;
}

export function moveExpeditionTask(state, dataset, taskId, direction) {
  const normalised = normaliseCommandCentreState(state, dataset);
  const index = normalised.tasks.findIndex((task) => task.id === taskId);
  if (index === -1) throw new Error(`Unknown expedition task: ${taskId}`);
  const target = direction === 'up' ? index - 1 : direction === 'down' ? index + 1 : index;
  if (target < 0 || target >= normalised.tasks.length || target === index) return normalised;
  const [task] = normalised.tasks.splice(index, 1);
  normalised.tasks.splice(target, 0, task);
  normalised.updatedAt = new Date().toISOString();
  return normalised;
}

export function setSpoilerProfile(state, dataset, profile) {
  const normalised = normaliseCommandCentreState(state, dataset);
  if (!SPOILER_PROFILES.includes(profile)) throw new Error(`Unsupported spoiler profile: ${profile}`);
  normalised.spoilerProfile = profile;
  normalised.updatedAt = new Date().toISOString();
  return normalised;
}

export function createCommandCentreExport(state, dataset) {
  const normalised = normaliseCommandCentreState(state, dataset);
  return {
    kind: COMMAND_CENTRE_EXPORT_KIND,
    schemaVersion: COMMAND_CENTRE_STATE_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    gamePatch: dataset.gamePatch,
    exportedAt: new Date().toISOString(),
    spoilerProfile: normalised.spoilerProfile,
    tasks: normalised.tasks,
  };
}

export function parseCommandCentreImport(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Imported Command Centre backup must be an object.');
  if (raw.kind !== COMMAND_CENTRE_EXPORT_KIND) throw new Error('This file is not a Crimson Desert Guide Command Centre backup.');
  return normaliseCommandCentreState(raw, dataset);
}

function parseStoredJson(storage, key) {
  const raw = storage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw);
}

function validateSourceShape(id, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${id}: saved value must be an object.`);
  if (id === 'completion') {
    if (Number(value.schemaVersion) !== 1 || !Array.isArray(value.completed) || !Array.isArray(value.revealed ?? [])) throw new Error('completion: invalid state shape.');
  } else if (id === 'atlas') {
    if (value.format !== 'crimson-desert-guide.atlas-backup' || !Array.isArray(value.visited) || !Array.isArray(value.activated) || !Array.isArray(value.checkedServices)) throw new Error('atlas: invalid state shape.');
  } else if (id === 'collectibles') {
    if (Number(value.schemaVersion) !== 1 || !value.counts || typeof value.counts !== 'object' || !Array.isArray(value.research ?? [])) throw new Error('collectibles: invalid state shape.');
  } else if (id === 'research') {
    if (Number(value.schemaVersion) !== 1 || !value.stages || typeof value.stages !== 'object' || !value.notes || typeof value.notes !== 'object') throw new Error('research: invalid state shape.');
  } else if (id === 'builds') {
    if (Number(value.schemaVersion) !== 1 || !Array.isArray(value.tests) || value.tests.length > 100) throw new Error('builds: invalid state shape.');
  }
  return value;
}

export function createGuideVault(storage, state, dataset) {
  assertDataset(dataset);
  if (!storage || typeof storage.getItem !== 'function') throw new TypeError('Browser storage is unavailable.');
  const normalised = normaliseCommandCentreState(state, dataset);
  const entries = {};
  for (const source of dataset.stateSources) {
    const stored = parseStoredJson(storage, source.storageKey);
    if (stored) entries[source.id] = validateSourceShape(source.id, stored);
  }
  let lastRoute = null;
  try { lastRoute = parseStoredJson(storage, dataset.lastRouteKey); } catch { lastRoute = null; }
  return {
    kind: GUIDE_VAULT_KIND,
    schemaVersion: GUIDE_VAULT_SCHEMA,
    datasetVersion: dataset.datasetVersion,
    gamePatch: dataset.gamePatch,
    exportedAt: new Date().toISOString(),
    commandCentre: createCommandCentreExport(normalised, dataset),
    entries,
    lastRoute,
  };
}

export function parseGuideVault(raw, dataset) {
  assertDataset(dataset);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('Guide vault must be an object.');
  if (raw.kind !== GUIDE_VAULT_KIND || Number(raw.schemaVersion) !== GUIDE_VAULT_SCHEMA) throw new Error('This file is not a supported Crimson Desert Guide vault.');
  const commandCentre = parseCommandCentreImport(raw.commandCentre, dataset);
  const knownSources = new Set(dataset.stateSources.map((source) => source.id));
  const entries = {};
  if (!raw.entries || typeof raw.entries !== 'object' || Array.isArray(raw.entries)) throw new Error('Guide vault entries are invalid.');
  for (const [id, value] of Object.entries(raw.entries)) {
    if (!knownSources.has(id)) throw new Error(`Guide vault contains an unknown state source: ${id}`);
    entries[id] = validateSourceShape(id, value);
  }
  let lastRoute = null;
  if (raw.lastRoute != null) {
    if (!raw.lastRoute || typeof raw.lastRoute !== 'object' || typeof raw.lastRoute.href !== 'string' || typeof raw.lastRoute.title !== 'string') throw new Error('Guide vault last-route record is invalid.');
    lastRoute = raw.lastRoute;
  }
  return { commandCentre, entries, lastRoute };
}

export function restoreGuideVault(storage, raw, dataset) {
  if (!storage || typeof storage.setItem !== 'function') throw new TypeError('Browser storage is unavailable.');
  const parsed = parseGuideVault(raw, dataset);
  const sourceById = new Map(dataset.stateSources.map((source) => [source.id, source]));
  for (const [id, value] of Object.entries(parsed.entries)) storage.setItem(sourceById.get(id).storageKey, JSON.stringify(value));
  storage.setItem(dataset.storageKey, JSON.stringify(parsed.commandCentre));
  storage.setItem(dataset.spoilerKey, parsed.commandCentre.spoilerProfile);
  if (parsed.lastRoute) storage.setItem(dataset.lastRouteKey, JSON.stringify(parsed.lastRoute));
  return parsed.commandCentre;
}

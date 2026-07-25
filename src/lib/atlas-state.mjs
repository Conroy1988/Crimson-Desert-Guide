export const ATLAS_BACKUP_FORMAT = 'crimson-desert-guide.atlas-backup';

export function createEmptyAtlasState(dataset) {
  return {
    format: ATLAS_BACKUP_FORMAT,
    schemaVersion: dataset.schemaVersion,
    datasetVersion: dataset.datasetVersion,
    visited: [],
    activated: [],
    checkedServices: [],
    revealed: [],
    updatedAt: null,
  };
}

export function knownAtlasIds(dataset) {
  const locationIds = new Set(dataset.locations.map((location) => location.id));
  const serviceTokens = new Set();
  for (const location of dataset.locations) {
    for (const serviceId of location.serviceIds) serviceTokens.add(`${location.id}:${serviceId}`);
  }
  return { locationIds, serviceTokens };
}

export function normaliseAtlasState(dataset, raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Atlas backup must be an object.');
  if (raw.format !== ATLAS_BACKUP_FORMAT) throw new Error('This file is not a Crimson Desert Guide atlas backup.');
  if (raw.schemaVersion !== dataset.schemaVersion) throw new Error('Atlas backup schema version is not supported.');

  const { locationIds, serviceTokens } = knownAtlasIds(dataset);
  const renamed = dataset.migrations?.renamedIds ?? {};
  const retired = new Set(dataset.migrations?.retiredIds ?? []);

  const migrate = (values, allowed) => {
    const migrated = [];
    for (const value of Array.isArray(values) ? values : []) {
      const next = renamed[value] ?? value;
      if (retired.has(next)) continue;
      if (!allowed.has(next)) throw new Error(`Atlas backup contains an unknown ID: ${value}`);
      migrated.push(next);
    }
    return [...new Set(migrated)].sort();
  };

  const checkedServices = [];
  for (const token of Array.isArray(raw.checkedServices) ? raw.checkedServices : []) {
    if (!serviceTokens.has(token)) throw new Error(`Atlas backup contains an unknown service check: ${token}`);
    checkedServices.push(token);
  }

  return {
    format: ATLAS_BACKUP_FORMAT,
    schemaVersion: dataset.schemaVersion,
    datasetVersion: dataset.datasetVersion,
    visited: migrate(raw.visited, locationIds),
    activated: migrate(raw.activated, locationIds),
    checkedServices: [...new Set(checkedServices)].sort(),
    revealed: migrate(raw.revealed, locationIds),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  };
}

export function encodeAtlasBackup(dataset, state) {
  const normalised = normaliseAtlasState(dataset, {
    ...state,
    format: ATLAS_BACKUP_FORMAT,
    schemaVersion: dataset.schemaVersion,
  });
  return JSON.stringify({ ...normalised, updatedAt: new Date().toISOString() }, null, 2);
}

export function decodeAtlasBackup(dataset, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Atlas backup is not valid JSON.');
  }
  return normaliseAtlasState(dataset, parsed);
}

export function findVerifiedRoute(dataset, startId, endId) {
  const ids = new Set(dataset.locations.map((location) => location.id));
  if (!ids.has(startId) || !ids.has(endId)) throw new Error('Route endpoint is not recognised.');
  if (startId === endId) return { locationIds: [startId], connectionIds: [] };

  const adjacency = new Map([...ids].map((id) => [id, []]));
  for (const connection of dataset.connections) {
    adjacency.get(connection.from)?.push({ next: connection.to, connection });
    if (connection.bidirectional) adjacency.get(connection.to)?.push({ next: connection.from, connection });
  }

  const queue = [{ id: startId, locations: [startId], connections: [] }];
  const visited = new Set([startId]);

  while (queue.length) {
    const current = queue.shift();
    for (const edge of adjacency.get(current.id) ?? []) {
      if (visited.has(edge.next)) continue;
      const locations = [...current.locations, edge.next];
      const connections = [...current.connections, edge.connection.id];
      if (edge.next === endId) return { locationIds: locations, connectionIds: connections };
      visited.add(edge.next);
      queue.push({ id: edge.next, locations, connections });
    }
  }

  return null;
}

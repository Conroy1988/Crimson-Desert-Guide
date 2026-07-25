import { readFile } from 'node:fs/promises';
import { findVerifiedRoute } from '../src/lib/atlas-state.mjs';

const atlas = JSON.parse(await readFile(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const patch = JSON.parse(await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'));
const completion = JSON.parse(await readFile(new URL('../data/completion.json', import.meta.url), 'utf8'));

const failures = [];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const evidenceValues = new Set(['official', 'verified', 'community', 'provisional']);
const spoilerValues = new Set(['none', 'minor', 'full']);
const locationTypes = new Set(['settlement', 'travel-node', 'travel-system', 'camp', 'discovery-system']);
const connectionModes = new Set(['abyss-nexus', 'road', 'mount', 'camp-relocation', 'discovery']);
const approvedOfficialHosts = new Set(['crimsondesert.pearlabyss.com', 'steamcommunity.com', 'store.steampowered.com']);

if (atlas.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (!/^\d+\.\d+\.\d+$/.test(atlas.datasetVersion ?? '')) failures.push('datasetVersion must use semantic version text');
if (atlas.gamePatch !== patch.version) failures.push(`atlas patch ${atlas.gamePatch} does not match ${patch.version}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(atlas.lastVerified ?? '')) failures.push('lastVerified must use YYYY-MM-DD');
if (!atlas.storageKey?.startsWith('crimson-desert-guide.atlas.')) failures.push('storageKey is not namespaced');
if (JSON.stringify(atlas).includes('"coordinates"')) failures.push('atlas must not contain estimated coordinates');

function uniqueIds(items, label) {
  const ids = new Set();
  for (const item of items ?? []) {
    if (!idPattern.test(item.id ?? '')) failures.push(`${label}: invalid ID ${item.id}`);
    if (ids.has(item.id)) failures.push(`${label}: duplicate ID ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

const regionIds = uniqueIds(atlas.regions, 'region');
const serviceIds = uniqueIds(atlas.services, 'service');
const locationIds = uniqueIds(atlas.locations, 'location');
uniqueIds(atlas.connections, 'connection');
const completionIds = new Set(completion.entries.map((entry) => entry.id));

for (const region of atlas.regions) {
  if (!region.label || !region.description) failures.push(`${region.id}: region label and description required`);
  if (!spoilerValues.has(region.spoilerLevel)) failures.push(`${region.id}: invalid region spoiler level`);
}

for (const service of atlas.services) {
  if (!service.label || !service.category) failures.push(`${service.id}: service label and category required`);
}

for (const location of atlas.locations) {
  if (!locationTypes.has(location.type)) failures.push(`${location.id}: invalid location type ${location.type}`);
  if (!regionIds.has(location.region)) failures.push(`${location.id}: unknown region ${location.region}`);
  if (!location.title || !location.summary) failures.push(`${location.id}: title and summary required`);
  if (!evidenceValues.has(location.evidence)) failures.push(`${location.id}: invalid evidence`);
  if (!spoilerValues.has(location.spoilerLevel)) failures.push(`${location.id}: invalid spoiler level`);
  if (location.patchStatus !== 'current') failures.push(`${location.id}: patchStatus must be current`);
  if (!Array.isArray(location.serviceIds)) failures.push(`${location.id}: serviceIds must be an array`);
  for (const serviceId of location.serviceIds ?? []) {
    if (!serviceIds.has(serviceId)) failures.push(`${location.id}: unknown service ${serviceId}`);
  }
  for (const completionId of location.completionIds ?? []) {
    if (!completionIds.has(completionId)) failures.push(`${location.id}: unknown completion ID ${completionId}`);
  }
  if (!Array.isArray(location.sources) || location.sources.length === 0) failures.push(`${location.id}: source required`);
  for (const source of location.sources ?? []) {
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:') failures.push(`${location.id}: source must use HTTPS`);
      if (location.evidence === 'official' && !approvedOfficialHosts.has(url.hostname)) {
        failures.push(`${location.id}: official source host is not approved: ${url.hostname}`);
      }
    } catch {
      failures.push(`${location.id}: invalid source URL ${source}`);
    }
  }
  if (!location.progress || typeof location.progress.visitable !== 'boolean' ||
      typeof location.progress.activatable !== 'boolean' ||
      typeof location.progress.serviceCheckable !== 'boolean') {
    failures.push(`${location.id}: progress capability flags required`);
  }
}

for (const connection of atlas.connections) {
  if (!locationIds.has(connection.from) || !locationIds.has(connection.to)) failures.push(`${connection.id}: connection endpoint missing`);
  if (connection.from === connection.to) failures.push(`${connection.id}: self connection`);
  if (!connectionModes.has(connection.mode)) failures.push(`${connection.id}: invalid mode ${connection.mode}`);
  if (!['official', 'verified'].includes(connection.evidence)) failures.push(`${connection.id}: route evidence must be official or verified`);
  if (!Array.isArray(connection.sources) || connection.sources.length === 0) failures.push(`${connection.id}: route source required`);
}

if (atlas.locations.length < 12) failures.push(`expected at least 12 atlas locations, found ${atlas.locations.length}`);
if (atlas.services.length < 16) failures.push(`expected at least 16 atlas services, found ${atlas.services.length}`);
if (atlas.connections.length < 1) failures.push('expected at least one verified route connection');

const nexusRoute = findVerifiedRoute(atlas, 'pailune-nexus', 'abyss-nexus-network');
if (!nexusRoute || nexusRoute.connectionIds[0] !== 'pailune-nexus-network-link') failures.push('verified Pailune Nexus route is unavailable');
if (findVerifiedRoute(atlas, 'hernand', 'calphade') !== null) failures.push('atlas invented an unverified Hernand-to-Calphade route');

if (failures.length) {
  console.error('Atlas data audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Atlas data audit passed ${atlas.regions.length} regions, ${atlas.locations.length} locations, ${atlas.services.length} services and ${atlas.connections.length} verified route edge.`);

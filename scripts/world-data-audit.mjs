import { readFile } from 'node:fs/promises';

const patch = JSON.parse(
  await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'),
);
const world = JSON.parse(
  await readFile(new URL('../data/world-locations.json', import.meta.url), 'utf8'),
);
const mounts = JSON.parse(
  await readFile(new URL('../data/mounts.json', import.meta.url), 'utf8'),
);

const evidenceValues = new Set(['official', 'verified', 'community', 'provisional']);
const spoilerValues = new Set(['none', 'minor', 'full']);
const failures = [];
const officialHost = 'crimsondesert.pearlabyss.com';

function checkBaseline(name, value) {
  if (value !== patch.version) {
    failures.push(`${name}: baseline ${value} does not match ${patch.version}`);
  }
}

function checkUnique(name, records, key = 'id') {
  const seen = new Set();
  for (const record of records) {
    const value = record[key];
    if (!value) failures.push(`${name}: record missing ${key}`);
    else if (seen.has(value)) failures.push(`${name}: duplicate ${key} ${value}`);
    else seen.add(value);
  }
  return seen;
}

function checkEvidence(name, evidence, source) {
  if (!evidenceValues.has(evidence)) failures.push(`${name}: invalid evidence ${evidence}`);
  if (evidence === 'official') {
    if (!source) failures.push(`${name}: official record missing source`);
    else {
      try {
        const url = new URL(source);
        if (url.hostname !== officialHost) {
          failures.push(`${name}: official source must use ${officialHost}`);
        }
      } catch {
        failures.push(`${name}: invalid source URL`);
      }
    }
  }
}

checkBaseline('world-locations.json', world.currentPatch);
checkBaseline('mounts.json', mounts.currentPatch);

const locationIds = checkUnique('locations', world.locations);
for (const location of world.locations) {
  if (!spoilerValues.has(location.spoilerLevel)) {
    failures.push(`location ${location.id}: invalid spoilerLevel`);
  }
  checkEvidence(`location ${location.id}`, location.evidence, location.source);
  checkUnique(`location ${location.id} services`, location.services);
  for (const service of location.services) {
    checkEvidence(
      `location ${location.id} service ${service.id}`,
      service.status,
      service.source,
    );
    if (!service.name || !service.purpose) {
      failures.push(`location ${location.id} service ${service.id}: incomplete record`);
    }
  }
  if (!Array.isArray(location.arrivalChecklist) || !location.arrivalChecklist.length) {
    failures.push(`location ${location.id}: missing arrivalChecklist`);
  }
}

checkEvidence(
  'mount quickslotRule',
  mounts.quickslotRule.evidence,
  mounts.quickslotRule.source,
);
if (mounts.quickslotRule.regularMounts !== 1 || mounts.quickslotRule.specialMounts !== 1) {
  failures.push('mount quickslotRule: expected one regular and one special mount');
}

checkUnique('mount systems', mounts.systems);
for (const mount of mounts.systems) {
  if (!['regular', 'special', 'legendary'].includes(mount.category)) {
    failures.push(`mount ${mount.id}: invalid category`);
  }
  if (!spoilerValues.has(mount.spoilerLevel)) {
    failures.push(`mount ${mount.id}: invalid spoilerLevel`);
  }
  checkEvidence(`mount ${mount.id}`, mount.evidence, mount.source);
  if (!mount.name || !mount.registration || !mount.bestFor?.length || !mount.notes?.length) {
    failures.push(`mount ${mount.id}: incomplete record`);
  }
}

const eligibleSpecies = new Set(mounts.eligibleSpecialSpecies);
if (eligibleSpecies.size !== mounts.eligibleSpecialSpecies.length) {
  failures.push('eligibleSpecialSpecies: duplicate species');
}

for (const saddlery of mounts.saddleries) {
  if (!locationIds.has(saddlery.locationId)) {
    failures.push(`saddlery ${saddlery.locationId}: unknown location`);
  }
  checkEvidence(`saddlery ${saddlery.locationId}`, saddlery.evidence, saddlery.source);
  for (const mount of saddlery.mounts) {
    if (!eligibleSpecies.has(mount)) {
      failures.push(`saddlery ${saddlery.locationId}: unknown special species ${mount}`);
    }
  }
}

if (failures.length) {
  console.error('World data audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `World data audit passed for patch ${patch.version}: ${world.locations.length} locations, ${mounts.systems.length} mount systems.`,
);

import { readFile } from 'node:fs/promises';

const database = JSON.parse(
  await readFile(new URL('../data/content-database.json', import.meta.url), 'utf8'),
);
const completion = JSON.parse(
  await readFile(new URL('../data/completion.json', import.meta.url), 'utf8'),
);
const patch = JSON.parse(
  await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'),
);

const failures = [];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const typeValues = new Set(['quest', 'boss', 'stronghold', 'abyss', 'challenge', 'camp', 'knowledge']);
const statusValues = new Set(['verified', 'partial']);
const evidenceValues = new Set(['official', 'verified', 'community', 'provisional']);
const spoilerValues = new Set(['none', 'minor', 'full']);
const storyValues = new Set(['story', 'optional', 'system']);
const replayValues = new Set(['one-time', 'repeatable', 'rematch', 'unknown']);
const allowedOfficialHosts = new Set([
  'crimsondesert.pearlabyss.com',
  'steamcommunity.com',
  'store.steampowered.com',
]);

if (database.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (!/^\d+\.\d+\.\d+$/.test(database.datasetVersion ?? '')) {
  failures.push('datasetVersion must be semantic version text');
}
if (database.gamePatch !== patch.version) {
  failures.push(`database patch ${database.gamePatch} does not match ${patch.version}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(database.lastVerified ?? '')) {
  failures.push('lastVerified must use YYYY-MM-DD');
}
if (!Array.isArray(database.records) || database.records.length < 60) {
  failures.push('content database must contain at least 60 evidence-safe records');
}

const regionIds = new Set();
for (const region of database.regions ?? []) {
  if (!idPattern.test(region.id ?? '')) failures.push(`invalid region ID: ${region.id}`);
  if (regionIds.has(region.id)) failures.push(`duplicate region ID: ${region.id}`);
  regionIds.add(region.id);
  if (!region.label) failures.push(`${region.id}: region requires a label`);
}

const declaredTypes = new Set();
for (const type of database.types ?? []) {
  if (!typeValues.has(type.id)) failures.push(`unsupported declared type: ${type.id}`);
  if (declaredTypes.has(type.id)) failures.push(`duplicate type ID: ${type.id}`);
  declaredTypes.add(type.id);
}

const recordIds = new Set();
const recordsById = new Map();
for (const record of database.records ?? []) {
  if (!idPattern.test(record.id ?? '')) failures.push(`invalid record ID: ${record.id}`);
  if (recordIds.has(record.id)) failures.push(`duplicate record ID: ${record.id}`);
  recordIds.add(record.id);
  recordsById.set(record.id, record);

  if (!typeValues.has(record.type)) failures.push(`${record.id}: invalid type ${record.type}`);
  if (!declaredTypes.has(record.type)) failures.push(`${record.id}: undeclared type ${record.type}`);
  if (!record.subtype || !idPattern.test(record.subtype)) failures.push(`${record.id}: invalid subtype`);
  if (!record.title || !record.summary) failures.push(`${record.id}: missing title or summary`);
  if (!regionIds.has(record.region)) failures.push(`${record.id}: unknown region ${record.region}`);
  if (!statusValues.has(record.recordStatus)) failures.push(`${record.id}: invalid recordStatus`);
  if (!evidenceValues.has(record.evidence)) failures.push(`${record.id}: invalid evidence`);
  if (!spoilerValues.has(record.spoilerLevel)) failures.push(`${record.id}: invalid spoilerLevel`);
  if (!storyValues.has(record.storyRole)) failures.push(`${record.id}: invalid storyRole`);
  if (!replayValues.has(record.replayability)) failures.push(`${record.id}: invalid replayability`);
  if (record.patchStatus !== 'current') failures.push(`${record.id}: patchStatus must be current`);
  if (!/^\d+\.\d+\.\d+$/.test(record.firstSupportedPatch ?? '')) {
    failures.push(`${record.id}: invalid firstSupportedPatch`);
  }
  if (!Array.isArray(record.characters) || record.characters.length === 0) {
    failures.push(`${record.id}: characters must be non-empty`);
  }
  if (!Array.isArray(record.prerequisites)) failures.push(`${record.id}: prerequisites must be an array`);
  if (!Array.isArray(record.rewards)) failures.push(`${record.id}: rewards must be an array`);
  if (!Array.isArray(record.knownBlockers)) failures.push(`${record.id}: knownBlockers must be an array`);
  if (!Array.isArray(record.tags) || record.tags.length === 0) failures.push(`${record.id}: tags required`);
  if (!/^\/[a-z0-9/-]*\/$/.test(record.guidePath ?? '')) {
    failures.push(`${record.id}: guidePath must be an internal trailing-slash route`);
  }
  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    failures.push(`${record.id}: at least one source is required`);
  } else {
    for (const source of record.sources) {
      try {
        const url = new URL(source);
        if (url.protocol !== 'https:') failures.push(`${record.id}: source must use HTTPS`);
        if (record.evidence === 'official' && !allowedOfficialHosts.has(url.hostname)) {
          failures.push(`${record.id}: official source host is not approved: ${url.hostname}`);
        }
      } catch {
        failures.push(`${record.id}: invalid source URL ${source}`);
      }
    }
  }

  if (typeof record.completion?.eligible !== 'boolean') {
    failures.push(`${record.id}: completion.eligible must be boolean`);
  }
  if (record.completion?.eligible && !record.completion.condition) {
    failures.push(`${record.id}: eligible record requires completion condition`);
  }
  if (record.recordStatus === 'partial' && record.completion?.eligible) {
    failures.push(`${record.id}: partial records cannot enter completion totals`);
  }
}

for (const record of database.records ?? []) {
  for (const prerequisite of record.prerequisites ?? []) {
    if (!recordIds.has(prerequisite)) failures.push(`${record.id}: missing prerequisite ${prerequisite}`);
    if (prerequisite === record.id) failures.push(`${record.id}: self prerequisite`);
  }
}

const completionById = new Map(completion.entries.map((entry) => [entry.id, entry]));
for (const record of database.records ?? []) {
  if (!record.completion?.eligible) continue;
  const entry = completionById.get(record.id);
  if (!entry) {
    failures.push(`${record.id}: eligible record missing from completion dataset`);
    continue;
  }
  if (entry.sourceRecordId !== record.id) failures.push(`${record.id}: completion sourceRecordId mismatch`);
  if (entry.title !== record.title) failures.push(`${record.id}: completion title drift`);
  if (entry.summary !== record.completion.condition) failures.push(`${record.id}: completion condition drift`);
  if (entry.evidence !== record.evidence) failures.push(`${record.id}: completion evidence drift`);
  if (entry.spoilerLevel !== record.spoilerLevel) failures.push(`${record.id}: completion spoiler drift`);
  if (entry.patchStatus !== record.patchStatus) failures.push(`${record.id}: completion patch drift`);
}

for (const entry of completion.entries) {
  if (!entry.sourceRecordId) continue;
  const record = recordsById.get(entry.sourceRecordId);
  if (!record) failures.push(`${entry.id}: sourceRecordId points to missing content record`);
  if (record && !record.completion.eligible) {
    failures.push(`${entry.id}: completion references a non-eligible content record`);
  }
}

const achievementCount = database.records.filter((record) => record.id.startsWith('achievement-')).length;
const bossCount = database.records.filter((record) => record.type === 'boss').length;
const verifiedRematchBosses = database.records.filter(
  (record) => record.type === 'boss' && record.recordStatus === 'verified' && record.replayability === 'rematch',
).length;
const questCount = database.records.filter((record) => record.type === 'quest').length;
const strongholdCount = database.records.filter((record) => record.type === 'stronghold').length;
const eligibleCount = database.records.filter((record) => record.completion.eligible).length;

if (achievementCount !== 34) failures.push(`expected 34 official Steam achievements, found ${achievementCount}`);
if (bossCount < 15) failures.push(`expected at least 15 named bosses, found ${bossCount}`);
if (verifiedRematchBosses < 5) failures.push(`expected at least 5 verified rematch bosses, found ${verifiedRematchBosses}`);
if (questCount < 14) failures.push(`expected at least 14 quest records, found ${questCount}`);
if (strongholdCount < 2) failures.push(`expected at least 2 stronghold records, found ${strongholdCount}`);
if (eligibleCount < 40) failures.push(`expected at least 40 completion-eligible records, found ${eligibleCount}`);

if (failures.length) {
  console.error('Content database audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Content database audit passed ${database.records.length} records: ${achievementCount} achievements, ${questCount} quests, ${bossCount} bosses and ${eligibleCount} completion milestones.`,
);

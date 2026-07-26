import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [catalogue, database, completion, patch] = await Promise.all([
  readFile(new URL('data/collectible-catalogue.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/content-database.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/completion.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/current-patch.json', root), 'utf8').then(JSON.parse),
]);

const failures = [];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const scopes = new Set(['category', 'individual']);
const supports = new Set(['category-verified', 'individual-verified', 'research']);
const types = new Set(['challenge', 'knowledge']);
const spoilers = new Set(['none', 'minor', 'full']);
const approvedHosts = new Set(['steamcommunity.com', 'crimsondesert.pearlabyss.com']);
const databaseById = new Map(database.records.map((record) => [record.id, record]));
const completionById = new Map(completion.entries.map((entry) => [entry.id, entry]));
const catalogueIds = new Set();
const recordIds = new Set();

if (catalogue.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (catalogue.datasetVersion !== '1.0.0') failures.push('datasetVersion must be 1.0.0');
if (catalogue.gamePatch !== patch.version) failures.push('catalogue patch must match current patch');
if (catalogue.lastVerified !== '2026-07-26') failures.push('catalogue verification date must be 2026-07-26');
if (catalogue.storageKey !== 'crimson-desert-guide.collectibles.v1') failures.push('unexpected storage key');
if (!Array.isArray(catalogue.records) || catalogue.records.length !== 48) {
  failures.push(`expected 48 catalogue records, found ${catalogue.records?.length ?? 0}`);
}

for (const record of catalogue.records ?? []) {
  if (!idPattern.test(record.id ?? '')) failures.push(`${record.id}: invalid catalogue ID`);
  if (catalogueIds.has(record.id)) failures.push(`${record.id}: duplicate catalogue ID`);
  catalogueIds.add(record.id);
  if (recordIds.has(record.recordId)) failures.push(`${record.recordId}: duplicate canonical reference`);
  recordIds.add(record.recordId);

  const canonical = databaseById.get(record.recordId);
  if (!canonical) failures.push(`${record.id}: missing canonical record ${record.recordId}`);
  if (canonical && !types.has(canonical.type)) failures.push(`${record.id}: canonical type is not cataloguable`);
  if (!types.has(record.type)) failures.push(`${record.id}: unsupported type ${record.type}`);
  if (!scopes.has(record.scope)) failures.push(`${record.id}: invalid scope ${record.scope}`);
  if (!supports.has(record.support)) failures.push(`${record.id}: invalid support ${record.support}`);
  if (!spoilers.has(record.spoilerLevel)) failures.push(`${record.id}: invalid spoiler level`);
  if (!record.title || !record.summary || !record.subtype) failures.push(`${record.id}: missing display fields`);
  if (!Array.isArray(record.guidance) || record.guidance.length < 3) failures.push(`${record.id}: guidance missing`);
  if (!Array.isArray(record.unknowns) || record.unknowns.length < 1) failures.push(`${record.id}: unresolved fields missing`);
  if (!Array.isArray(record.guideLinks) || !record.guideLinks.includes('/completion/')) failures.push(`${record.id}: completion link missing`);
  if (!Array.isArray(record.sources) || record.sources.length < 1) failures.push(`${record.id}: sources missing`);

  for (const source of record.sources ?? []) {
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:') failures.push(`${record.id}: source must use HTTPS`);
      if (!approvedHosts.has(url.hostname)) failures.push(`${record.id}: unapproved source host ${url.hostname}`);
    } catch {
      failures.push(`${record.id}: invalid source ${source}`);
    }
  }

  if (record.scope === 'category' && record.support === 'individual-verified') {
    failures.push(`${record.id}: category cannot be individual-verified`);
  }
  if (record.scope === 'individual' && record.support === 'category-verified') {
    failures.push(`${record.id}: individual cannot be category-verified`);
  }
  if (record.officialTotal !== null && (!Number.isInteger(record.officialTotal) || record.officialTotal < 1)) {
    failures.push(`${record.id}: officialTotal must be null or a positive integer`);
  }
  if (record.parentAchievementId && !databaseById.has(record.parentAchievementId)) {
    failures.push(`${record.id}: missing parent achievement ${record.parentAchievementId}`);
  }
  if (record.completionEntryId) {
    const entry = completionById.get(record.completionEntryId);
    if (!entry) failures.push(`${record.id}: missing completion entry ${record.completionEntryId}`);
    if (entry && entry.sourceRecordId !== record.recordId) failures.push(`${record.id}: completion source drift`);
  }
  if (canonical && record.support !== 'research' && canonical.recordStatus !== 'verified') {
    failures.push(`${record.id}: partial canonical record cannot be promoted`);
  }
}

const categoryCount = catalogue.records.filter((record) => record.scope === 'category').length;
const individualCount = catalogue.records.filter((record) => record.scope === 'individual').length;
const achievementCategories = catalogue.records.filter(
  (record) => record.scope === 'category' && record.recordId.startsWith('achievement-'),
).length;
const verifiedIndividuals = catalogue.records.filter((record) => record.support === 'individual-verified').length;
const knownTotalRecords = catalogue.records.filter((record) => record.officialTotal !== null).length;

if (categoryCount !== 31) failures.push(`expected 31 categories, found ${categoryCount}`);
if (individualCount !== 17) failures.push(`expected 17 individual records, found ${individualCount}`);
if (achievementCategories !== 29) failures.push(`expected 29 achievement categories, found ${achievementCategories}`);
if (verifiedIndividuals !== 4) failures.push(`expected 4 verified individual records, found ${verifiedIndividuals}`);
if (knownTotalRecords < 14) failures.push(`expected known totals for individual records and Contract collection, found ${knownTotalRecords}`);

if (failures.length) {
  console.error('Collectible catalogue audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Collectible catalogue audit passed ${catalogue.records.length} records: ${categoryCount} categories, ${individualCount} individuals and ${verifiedIndividuals} verified individual entries.`);

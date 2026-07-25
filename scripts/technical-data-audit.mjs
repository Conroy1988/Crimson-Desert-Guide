import { readFile } from 'node:fs/promises';

const data = JSON.parse(
  await readFile(new URL('../data/technical-issues.json', import.meta.url), 'utf8'),
);
const patch = JSON.parse(
  await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'),
);

const failures = [];
const ids = new Set();
const platforms = new Set(data.platforms?.map((item) => item.id));
const symptoms = new Set(data.symptoms?.map((item) => item.id));
const kinds = new Set(['official-issue', 'editorial-path']);
const severities = new Set(['low', 'medium', 'high', 'critical']);
const statuses = new Set(['active', 'guidance', 'resolved', 'monitoring']);
const evidence = new Set(['official', 'verified', 'editorial']);

if (data.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (data.currentPatch !== patch.version) {
  failures.push(`dataset patch ${data.currentPatch} does not match ${patch.version}`);
}
if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(data.datasetVersion ?? '')) {
  failures.push('datasetVersion must use YYYY.MM.DD.N format');
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastVerified ?? '')) {
  failures.push('lastVerified must use YYYY-MM-DD');
}
if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} UTC$/.test(
  data.knownIssuesSource?.lastUpdated ?? '',
)) failures.push('knownIssuesSource.lastUpdated is invalid');
if (!/^https:\/\//.test(data.knownIssuesSource?.url ?? '')) {
  failures.push('knownIssuesSource.url must be HTTPS');
}
if (!/^[a-f0-9]{64}$/.test(data.knownIssuesSource?.fingerprint ?? '')) {
  failures.push('knownIssuesSource.fingerprint must be SHA-256');
}

for (const collection of [data.platforms, data.symptoms, data.records]) {
  if (!Array.isArray(collection) || collection.length === 0) {
    failures.push('platforms, symptoms and records must be non-empty arrays');
  }
}

for (const record of data.records ?? []) {
  const prefix = record.id || '<missing-id>';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id ?? '')) {
    failures.push(`${prefix}: invalid stable ID`);
  } else if (ids.has(record.id)) failures.push(`${prefix}: duplicate ID`);
  else ids.add(record.id);

  if (!kinds.has(record.kind)) failures.push(`${prefix}: invalid kind`);
  if (!severities.has(record.severity)) failures.push(`${prefix}: invalid severity`);
  if (!statuses.has(record.status)) failures.push(`${prefix}: invalid status`);
  if (!evidence.has(record.evidence)) failures.push(`${prefix}: invalid evidence`);
  if (!record.title || !record.summary) failures.push(`${prefix}: missing title or summary`);
  if (!Array.isArray(record.safeActions) || record.safeActions.length === 0) {
    failures.push(`${prefix}: safeActions must be non-empty`);
  }
  if (!Array.isArray(record.escalation)) failures.push(`${prefix}: escalation must be an array`);
  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    failures.push(`${prefix}: sources must be non-empty`);
  } else if (record.sources.some((source) => !/^https:\/\//.test(source))) {
    failures.push(`${prefix}: all sources must be HTTPS`);
  }
  if (!Array.isArray(record.platforms) || record.platforms.length === 0) {
    failures.push(`${prefix}: platforms must be non-empty`);
  } else for (const platform of record.platforms) {
    if (!platforms.has(platform)) failures.push(`${prefix}: unknown platform ${platform}`);
  }
  if (!Array.isArray(record.symptoms) || record.symptoms.length === 0) {
    failures.push(`${prefix}: symptoms must be non-empty`);
  } else for (const symptom of record.symptoms) {
    if (!symptoms.has(symptom)) failures.push(`${prefix}: unknown symptom ${symptom}`);
  }
  if (!Array.isArray(record.affectedPatches) || !record.affectedPatches.includes(patch.version)) {
    failures.push(`${prefix}: affectedPatches must include ${patch.version}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.lastVerified ?? '')) {
    failures.push(`${prefix}: invalid lastVerified`);
  }
  if (record.kind === 'official-issue') {
    if (record.evidence !== 'official' || record.status !== 'active') {
      failures.push(`${prefix}: current official issues must be official and active`);
    }
    if (!record.sources.includes(data.knownIssuesSource.url)) {
      failures.push(`${prefix}: official issue does not cite the canonical notice`);
    }
  }
}

const officialCount = (data.records ?? []).filter(
  (record) => record.kind === 'official-issue',
).length;
if (officialCount !== data.knownIssuesSource?.issueCount) {
  failures.push(
    `official record count ${officialCount} does not match source count ${data.knownIssuesSource?.issueCount}`,
  );
}

const ageDays = Math.floor(
  (Date.now() - Date.parse(`${data.lastVerified}T00:00:00Z`)) / 86_400_000,
);
if (ageDays > 45) failures.push(`technical dataset is stale (${ageDays} days old)`);

if (failures.length) {
  console.error('Technical data audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Technical data audit passed for ${data.records.length} records ` +
  `(${officialCount} official issues) on patch ${patch.version}.`,
);

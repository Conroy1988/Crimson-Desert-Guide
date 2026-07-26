import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const details = JSON.parse(await readFile(new URL('data/guide-details.json', root), 'utf8'));
const meta = JSON.parse(await readFile(new URL('data/content/meta.json', root), 'utf8'));
const sourceFiles = [
  'data/content/quests.json',
  'data/content/bosses-rematch.json',
  'data/content/bosses-research.json',
  'data/content/world.json',
];
const sourceGroups = await Promise.all(
  sourceFiles.map(async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))),
);
const canonical = sourceGroups
  .flat()
  .filter((record) => ['quest', 'boss', 'abyss', 'stronghold'].includes(record.type));

const failures = [];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statuses = new Set(['supported', 'limited', 'research']);
const types = new Set(['quest', 'boss', 'abyss', 'stronghold']);
const spoilers = new Set(['none', 'minor', 'full']);
const evidence = new Set(['official', 'verified', 'community', 'provisional']);
const canonicalById = new Map(canonical.map((record) => [record.id, record]));
const detailIds = new Set();
const recordIds = new Set();

if (details.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (details.datasetVersion !== '1.0.0') failures.push('datasetVersion must be 1.0.0');
if (details.gamePatch !== meta.gamePatch) failures.push('guide-detail patch does not match content metadata');
if (details.lastVerified !== meta.lastVerified) failures.push('guide-detail verification date does not match content metadata');
if (!Array.isArray(details.records) || details.records.length !== canonical.length) {
  failures.push(`expected ${canonical.length} guide-detail records, found ${details.records?.length ?? 0}`);
}

for (const detail of details.records ?? []) {
  if (!idPattern.test(detail.id ?? '')) failures.push(`invalid detail ID: ${detail.id}`);
  if (detailIds.has(detail.id)) failures.push(`duplicate detail ID: ${detail.id}`);
  detailIds.add(detail.id);

  if (recordIds.has(detail.recordId)) failures.push(`duplicate canonical reference: ${detail.recordId}`);
  recordIds.add(detail.recordId);

  const record = canonicalById.get(detail.recordId);
  if (!record) {
    failures.push(`${detail.id}: missing canonical record ${detail.recordId}`);
    continue;
  }

  if (detail.id !== `detail-${record.id}`) failures.push(`${detail.id}: unstable detail ID`);
  if (detail.type !== record.type) failures.push(`${detail.id}: type drift`);
  if (detail.subtype !== record.subtype) failures.push(`${detail.id}: subtype drift`);
  if (detail.title !== record.title) failures.push(`${detail.id}: title drift`);
  if (detail.summary !== record.summary) failures.push(`${detail.id}: summary drift`);
  if (detail.region !== record.region) failures.push(`${detail.id}: region drift`);
  if (detail.evidence !== record.evidence || !evidence.has(detail.evidence)) failures.push(`${detail.id}: evidence drift`);
  if (detail.spoilerLevel !== record.spoilerLevel || !spoilers.has(detail.spoilerLevel)) failures.push(`${detail.id}: spoiler drift`);
  if (detail.patchStatus !== record.patchStatus) failures.push(`${detail.id}: patch-status drift`);
  if (!types.has(detail.type)) failures.push(`${detail.id}: unsupported type`);
  if (!statuses.has(detail.detailStatus)) failures.push(`${detail.id}: invalid detailStatus`);
  if (record.recordStatus === 'partial' && detail.detailStatus === 'supported') {
    failures.push(`${detail.id}: partial canonical record cannot become supported`);
  }
  if (record.recordStatus === 'verified' && detail.detailStatus !== 'supported') {
    failures.push(`${detail.id}: verified canonical record must be supported`);
  }

  for (const field of ['preparation', 'checkpoints', 'blockers', 'recovery', 'unknowns', 'rewards', 'checklist', 'guideLinks', 'sources']) {
    if (!Array.isArray(detail[field])) failures.push(`${detail.id}: ${field} must be an array`);
  }
  if ((detail.preparation?.length ?? 0) < 3) failures.push(`${detail.id}: preparation guidance is incomplete`);
  if ((detail.recovery?.length ?? 0) < 3) failures.push(`${detail.id}: recovery guidance is incomplete`);
  if ((detail.unknowns?.length ?? 0) === 0) failures.push(`${detail.id}: unresolved evidence boundary is missing`);
  if (detail.detailStatus === 'supported' && detail.type !== 'boss' && detail.type !== 'stronghold') {
    failures.push(`${detail.id}: unsupported supported-detail type`);
  }
  if (detail.detailStatus === 'research' && (detail.checkpoints?.length ?? 0) > 0) {
    failures.push(`${detail.id}: research record cannot publish checkpoints`);
  }
  if (JSON.stringify(detail.blockers) !== JSON.stringify(record.knownBlockers)) failures.push(`${detail.id}: blocker drift`);
  if (JSON.stringify(detail.sources) !== JSON.stringify(record.sources)) failures.push(`${detail.id}: source drift`);
  if (JSON.stringify(detail.rewards) !== JSON.stringify(record.rewards)) failures.push(`${detail.id}: reward drift`);
  if (detail.completionCondition !== (record.completion?.condition ?? null)) failures.push(`${detail.id}: completion-condition drift`);

  const checklistIds = new Set();
  for (const item of detail.checklist ?? []) {
    if (!idPattern.test(item.id ?? '') || !item.label) failures.push(`${detail.id}: invalid checklist item`);
    if (checklistIds.has(item.id)) failures.push(`${detail.id}: duplicate checklist item ${item.id}`);
    checklistIds.add(item.id);
  }

  for (const link of detail.guideLinks ?? []) {
    if (!/^\/[a-z0-9/-]*\/$/.test(link)) failures.push(`${detail.id}: invalid internal guide link ${link}`);
  }
  for (const source of detail.sources ?? []) {
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:') failures.push(`${detail.id}: source must use HTTPS`);
    } catch {
      failures.push(`${detail.id}: invalid source URL ${source}`);
    }
  }
}

for (const record of canonical) {
  if (!recordIds.has(record.id)) failures.push(`canonical record missing detail: ${record.id}`);
}

const counts = Object.fromEntries(
  [...types].map((type) => [type, details.records.filter((record) => record.type === type).length]),
);
if (counts.quest !== 11) failures.push(`expected 11 named quest details, found ${counts.quest}`);
if (counts.abyss !== 2) failures.push(`expected 2 Abyss details, found ${counts.abyss}`);
if (counts.boss !== 17) failures.push(`expected 17 boss details, found ${counts.boss}`);
if (counts.stronghold !== 2) failures.push(`expected 2 stronghold details, found ${counts.stronghold}`);

if (failures.length) {
  console.error('Guide-detail audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Guide-detail audit passed ${details.records.length} records: ${counts.quest} quests, ${counts.abyss} Abysses, ${counts.boss} bosses and ${counts.stronghold} strongholds.`,
);

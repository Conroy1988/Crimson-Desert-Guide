import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [dataset, notes, database, component, route, steam, media] = await Promise.all([
  readFile(new URL('data/boss-intelligence.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/boss-intelligence-notes.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/content-database.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('src/components/BossIntelligenceCentre.astro', root), 'utf8'),
  readFile(new URL('src/content/docs/database/bosses.mdx', root), 'utf8'),
  readFile(new URL('steam/boss-intelligence.md', root), 'utf8'),
  readFile(new URL('data/official-media.json', root), 'utf8').then(JSON.parse),
]);

const failures = [];
const idPattern = /^boss-intelligence-boss-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedStatuses = new Set([
  'verified-rematch',
  'official-rematch',
  'official-mechanics',
  'official-identity',
]);
const officialHosts = new Set([
  'crimsondesert.pearlabyss.com',
  'steamcommunity.com',
  'store.steampowered.com',
]);
const canonicalBosses = database.records.filter((record) => record.type === 'boss');
const canonicalById = new Map(canonicalBosses.map((record) => [record.id, record]));
const datasetByRecordId = new Map(dataset.records.map((record) => [record.recordId, record]));

function validateSource(source, context) {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:') failures.push(`${context}: source must use HTTPS`);
    if (!officialHosts.has(url.hostname)) failures.push(`${context}: unapproved official source host ${url.hostname}`);
  } catch {
    failures.push(`${context}: invalid source URL ${source}`);
  }
}

if (notes.schemaVersion !== 1) failures.push('boss source notes schemaVersion must be 1');
if (dataset.schemaVersion !== 1) failures.push('boss intelligence schemaVersion must be 1');
if (dataset.datasetVersion !== notes.datasetVersion) failures.push('boss intelligence datasetVersion drift');
if (dataset.gamePatch !== database.gamePatch) failures.push('boss intelligence patch does not match canonical database');
if (dataset.gamePatch !== notes.gamePatch) failures.push('boss intelligence patch does not match source notes');
if (dataset.lastVerified !== notes.lastVerified) failures.push('boss intelligence verification date drift');
if (!dataset.policy?.includes('Unpublished routes')) failures.push('boss intelligence evidence boundary is missing');
if (!Array.isArray(dataset.statusDefinitions) || dataset.statusDefinitions.length !== 4) failures.push('expected four boss intelligence status definitions');
if (!Array.isArray(dataset.rematchRules) || dataset.rematchRules.length < 5) failures.push('expected at least five official rematch rules');
if (!Array.isArray(dataset.records) || dataset.records.length !== canonicalBosses.length) {
  failures.push(`expected ${canonicalBosses.length} canonical boss dossiers, found ${dataset.records?.length ?? 0}`);
}

for (const rule of dataset.rematchRules ?? []) {
  if (!rule.label || !rule.value || !rule.patch || !rule.source) failures.push('incomplete rematch rule');
  validateSource(rule.source, `rematch rule ${rule.label}`);
}

const ids = new Set();
for (const record of dataset.records ?? []) {
  if (!idPattern.test(record.id ?? '')) failures.push(`${record.id}: invalid dossier ID`);
  if (ids.has(record.id)) failures.push(`${record.id}: duplicate dossier ID`);
  ids.add(record.id);

  const canonical = canonicalById.get(record.recordId);
  if (!canonical) {
    failures.push(`${record.id}: missing canonical boss record ${record.recordId}`);
    continue;
  }

  if (record.title !== canonical.title) failures.push(`${record.id}: title drift from canonical record`);
  if (record.summary !== canonical.summary) failures.push(`${record.id}: summary drift from canonical record`);
  if (record.evidence !== 'official') failures.push(`${record.id}: evidence must remain official`);
  if (record.patchStatus !== 'current') failures.push(`${record.id}: patchStatus must remain current`);
  if (record.spoilerLevel !== 'full') failures.push(`${record.id}: boss dossiers must remain major-spoiler records`);
  if (!allowedStatuses.has(record.intelligenceStatus)) failures.push(`${record.id}: unsupported intelligence status`);
  if (!Array.isArray(record.confirmedFacts) || record.confirmedFacts.length === 0) failures.push(`${record.id}: confirmed facts required`);
  if (!Array.isArray(record.patchHistory) || record.patchHistory.length === 0) failures.push(`${record.id}: patch history required`);
  if (!Array.isArray(record.unresolved) || record.unresolved.length < 3) failures.push(`${record.id}: explicit unresolved fields required`);
  if (!Array.isArray(record.researchFocus) || record.researchFocus.length < 2) failures.push(`${record.id}: controlled research focus required`);
  if (!Array.isArray(record.sources) || record.sources.length === 0) failures.push(`${record.id}: official sources required`);
  if (!record.searchText?.includes(record.title.toLowerCase())) failures.push(`${record.id}: search text omits canonical title`);

  if (canonical.recordStatus === 'partial' && record.completionEligible) {
    failures.push(`${record.id}: partial boss entered completion totals`);
  }

  if (record.intelligenceStatus === 'verified-rematch') {
    if (canonical.recordStatus !== 'verified') failures.push(`${record.id}: verified rematch must use a verified canonical record`);
    if (canonical.replayability !== 'rematch') failures.push(`${record.id}: verified rematch canonical replayability drift`);
    if (canonical.region === 'unknown') failures.push(`${record.id}: verified rematch requires a known region`);
    if (!canonical.completion?.condition) failures.push(`${record.id}: verified rematch requires first-defeat completion evidence`);
  }

  if (record.intelligenceStatus === 'official-rematch') {
    const rematchEvidence = [...record.confirmedFacts, ...record.patchHistory]
      .some((entry) => `${entry.value ?? ''} ${entry.note ?? ''}`.toLowerCase().includes('rematch'));
    if (!rematchEvidence) failures.push(`${record.id}: official-rematch status lacks direct rematch evidence`);
  }

  for (const fact of record.confirmedFacts ?? []) {
    if (!fact.label || !fact.value || !fact.patch || !fact.source) failures.push(`${record.id}: incomplete confirmed fact`);
    if (/weakness|health pool|damage value|dps|reward table/i.test(fact.label ?? '')) {
      failures.push(`${record.id}: unsupported combat-stat category entered confirmed facts`);
    }
    validateSource(fact.source, `${record.id} fact ${fact.label}`);
  }

  for (const entry of record.patchHistory ?? []) {
    if (!entry.patch || !entry.note || !entry.source) failures.push(`${record.id}: incomplete patch-history entry`);
    validateSource(entry.source, `${record.id} patch ${entry.patch}`);
  }

  for (const source of record.sources ?? []) validateSource(source, `${record.id} source`);
  for (const alias of record.aliases ?? []) {
    if (!record.searchText.includes(alias.toLowerCase())) failures.push(`${record.id}: alias missing from search text`);
  }
  if ((record.doNotMergeWith ?? []).length !== (record.doNotMergeWithIds ?? []).length) {
    failures.push(`${record.id}: human-readable identity separation drift`);
  }
  for (const otherId of record.doNotMergeWithIds ?? []) {
    if (!canonicalById.has(otherId)) failures.push(`${record.id}: identity-separation target does not exist (${otherId})`);
    const reciprocal = datasetByRecordId.get(otherId);
    if (reciprocal && !(reciprocal.doNotMergeWithIds ?? []).includes(record.recordId)) {
      failures.push(`${record.id}: identity-separation rule is not reciprocal with ${otherId}`);
    }
  }

  if (record.patchHistory.some((entry) => entry.patch.includes('demo')) && !record.caveat) {
    failures.push(`${record.id}: work-in-progress promotional evidence requires a caveat`);
  }
}

const metrics = {
  total: dataset.records.length,
  verifiedRematches: dataset.records.filter((record) => record.intelligenceStatus === 'verified-rematch').length,
  officialRematches: dataset.records.filter((record) => record.intelligenceStatus === 'official-rematch').length,
  mechanicDossiers: dataset.records.filter((record) => record.intelligenceStatus === 'official-mechanics').length,
  identityDossiers: dataset.records.filter((record) => record.intelligenceStatus === 'official-identity').length,
  unresolvedFields: dataset.records.reduce((total, record) => total + record.unresolved.length, 0),
};
for (const [key, value] of Object.entries(metrics)) {
  if (dataset.metrics?.[key] !== value) failures.push(`boss metric drift: ${key}`);
}
if (metrics.total < 17) failures.push(`expected at least 17 boss dossiers, found ${metrics.total}`);
if (metrics.verifiedRematches < 5) failures.push(`expected at least five verified rematches, found ${metrics.verifiedRematches}`);
if (metrics.officialRematches < 1) failures.push('expected at least one official rematch with unresolved location');
if (metrics.mechanicDossiers < 6) failures.push(`expected at least six official mechanic dossiers, found ${metrics.mechanicDossiers}`);
if (metrics.identityDossiers < 5) failures.push(`expected at least five official identity dossiers, found ${metrics.identityDossiers}`);

const heroAsset = media.assets.find((asset) => asset.id === 'official-boss-forest-colossus');
if (!heroAsset || heroAsset.category !== 'boss') failures.push('official generic boss hero asset is missing');

const componentRequirements = [
  'Boss Intelligence Centre',
  'data-boss-intelligence',
  'data-boss-search',
  'data-boss-status',
  'data-boss-region',
  'data-boss-reveal',
  'data-boss-reveal-all',
  '.boss-intelligence__hero',
  '.boss-intelligence__rules',
  '.boss-dossier__facts',
  '.boss-dossier__timeline',
  '.boss-dossier__research-grid',
  ":global(:root[data-theme='light']) .boss-intelligence__hero",
  '@media (max-width: 48rem)',
  "document.addEventListener('astro:page-load'",
];
for (const requirement of componentRequirements) {
  if (!component.includes(requirement)) failures.push(`Boss Intelligence component is missing: ${requirement}`);
}

if (!route.includes('<BossIntelligenceCentre />')) failures.push('boss route does not render BossIntelligenceCentre');
if (!route.includes('Shared words do not prove')) failures.push('boss route is missing the identity-variant evidence rule');
if (!route.includes('/database/research-queue/')) failures.push('boss route is missing the Research Queue hand-off');

const steamRequirements = [
  '# Boss Intelligence Centre',
  'Verified Memory Fragment rematches',
  'Official mechanic dossiers',
  'Identity-only dossiers',
  'Evidence boundary',
];
for (const requirement of steamRequirements) {
  if (!steam.includes(requirement)) failures.push(`Steam boss intelligence export is missing: ${requirement}`);
}

if (failures.length) {
  console.error('Boss intelligence audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Boss intelligence audit passed ${metrics.total} official dossiers: `
  + `${metrics.verifiedRematches} verified rematches, ${metrics.officialRematches} unresolved-location rematch, `
  + `${metrics.mechanicDossiers} mechanic dossiers and ${metrics.identityDossiers} identity dossiers.`,
);

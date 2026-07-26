import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [dataset, media, database, atlas, component, tracker, state, route] = await Promise.all([
  readFile(new URL('data/command-centre.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/official-media.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/content-database.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/atlas.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('src/components/ExpeditionCommandCentre.astro', root), 'utf8'),
  readFile(new URL('src/components/GuideSessionTracker.astro', root), 'utf8'),
  readFile(new URL('src/lib/command-centre-state.mjs', root), 'utf8'),
  readFile(new URL('src/content/docs/command-centre/index.mdx', root), 'utf8'),
]);

const failures = [];
const requiredCategories = new Set(['character', 'mount', 'weapon', 'boss', 'world']);
const assetIds = new Set();
const categories = new Set();
const officialHosts = new Set(['s1.pearlcdn.com', 'static.pearlcdn.com', 'shared.akamai.steamstatic.com', 'shared.fastly.steamstatic.com']);

if (media.schemaVersion !== 1) failures.push('official media schemaVersion must be 1');
if (!media.policy?.includes('Generic fantasy imagery')) failures.push('official media policy must prohibit generic fantasy imagery');
if (!media.mediaPage?.startsWith('https://crimsondesert.pearlabyss.com/')) failures.push('official media landing page is invalid');
if (!media.fanKit?.startsWith('https://static.pearlcdn.com/')) failures.push('official fan-kit URL is invalid');

for (const asset of media.assets ?? []) {
  if (assetIds.has(asset.id)) failures.push(`duplicate official media asset: ${asset.id}`);
  assetIds.add(asset.id);
  categories.add(asset.category);
  let host = '';
  try { host = new URL(asset.src).hostname; } catch { failures.push(`${asset.id}: media URL is invalid`); }
  if (host && !officialHosts.has(host)) failures.push(`${asset.id}: media host is not approved (${host})`);
  if (!asset.sourcePage?.startsWith('https://crimsondesert.pearlabyss.com/')) failures.push(`${asset.id}: source page is not an official Crimson Desert page`);
  if (!asset.alt || !asset.credit || !asset.sourceKind?.startsWith('official-')) failures.push(`${asset.id}: provenance metadata is incomplete`);
}
for (const category of requiredCategories) if (!categories.has(category)) failures.push(`official media registry is missing category: ${category}`);

if (dataset.schemaVersion !== 1) failures.push('command-centre schemaVersion must be 1');
if (dataset.gamePatch !== database.gamePatch) failures.push('command-centre patch does not match canonical database');
if (dataset.media.assets.length !== media.assets.length) failures.push('generated media registry drift');
if (dataset.metrics.canonicalRecords !== database.records.length) failures.push('canonical record metric drift');
if (dataset.metrics.atlasLocations !== atlas.locations.length) failures.push('atlas metric drift');
if (dataset.records.filter((record) => record.kind === 'content').length !== database.records.length) failures.push('canonical command index parity failed');
if (dataset.records.filter((record) => record.kind === 'location').length !== atlas.locations.length) failures.push('atlas command index parity failed');
if (!Array.isArray(dataset.stateSources) || dataset.stateSources.length !== 5) failures.push('expected five supported guide-vault sources');
if (dataset.storageKey !== 'crimson-desert-guide.command-centre.v1') failures.push('command-centre storage key drift');
if (dataset.spoilerKey !== 'crimson-desert-guide.spoiler-profile.v1') failures.push('spoiler-profile key drift');
if (dataset.lastRouteKey !== 'crimson-desert-guide.last-route.v1') failures.push('last-route key drift');

const recordIds = new Set();
for (const record of dataset.records ?? []) {
  if (recordIds.has(record.id)) failures.push(`duplicate command record: ${record.id}`);
  recordIds.add(record.id);
  if (!assetIds.has(record.assetId)) failures.push(`${record.id}: missing official asset ${record.assetId}`);
  if (!record.title || !record.summary || !record.href || !record.searchText) failures.push(`${record.id}: incomplete command record`);
  if (!['none', 'minor', 'full'].includes(record.spoilerLevel)) failures.push(`${record.id}: invalid spoiler level`);
}
if (dataset.plannerRecords.some((record) => !record.plannerEligible || !recordIds.has(record.id))) failures.push('planner-record registry is invalid');

const componentRequirements = [
  'Pywel Expedition Command Centre',
  'data-command-search',
  'data-spoiler-profile',
  'data-planner-list',
  'data-vault-export',
  'data-vault-import',
  'Official asset registry',
  'createGuideVault',
  'restoreGuideVault',
  '@media(max-width:42rem)',
  "new Intl.DateTimeFormat('en-GB'",
];
for (const requirement of componentRequirements) if (!component.includes(requirement)) failures.push(`Command Centre component is missing: ${requirement}`);

const trackerRequirements = [
  'crimson-desert-guide.last-route.v1',
  'crimson-desert-guide.spoiler-profile.v1',
  'data-db-spoiler',
  'data-research-spoiler',
  'data-catalogue-spoiler',
  'data-atlas-spoiler',
  "document.addEventListener('astro:page-load'",
];
for (const requirement of trackerRequirements) if (!tracker.includes(requirement)) failures.push(`Guide session tracker is missing: ${requirement}`);

const stateRequirements = [
  'GUIDE_VAULT_KIND',
  'MAX_EXPEDITION_TASKS',
  'normaliseCommandCentreState',
  'createGuideVault',
  'parseGuideVault',
  'restoreGuideVault',
  'validateSourceShape',
];
for (const requirement of stateRequirements) if (!state.includes(requirement)) failures.push(`Command Centre state library is missing: ${requirement}`);
if (!route.includes('<ExpeditionCommandCentre />')) failures.push('Command Centre route does not render the component');
const routePolicy = route.toLowerCase();
if (!routePolicy.includes('official-media registry') && !routePolicy.includes('official imagery')) failures.push('Command Centre route is missing official-media policy guidance');

if (failures.length) {
  console.error('Command Centre audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Command Centre audit passed ${dataset.records.length} searchable records, ${dataset.plannerRecords.length} planner targets, ${dataset.stateSources.length} vault sources and ${media.assets.length} official Pearl Abyss assets.`);

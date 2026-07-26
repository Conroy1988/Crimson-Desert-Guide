import { readFile } from 'node:fs/promises';

const [readiness, packageJson] = await Promise.all([
  readFile(new URL('../data/v1-readiness.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
]);
const failures = [];

if (readiness.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (readiness.guideVersion !== packageJson.version) failures.push(`guideVersion ${readiness.guideVersion} does not match package ${packageJson.version}`);
if (readiness.gamePatch !== '1.15.00') failures.push('readiness report must target Patch 1.15.00');
if (readiness.lastVerified !== '2026-07-27') failures.push('readiness report verification date drift');
if (readiness.status !== 'ready') failures.push(`readiness status is ${readiness.status}, expected ready`);
if (readiness.programmePercent !== 100) failures.push(`programme completion is ${readiness.programmePercent}%`);
if (!Array.isArray(readiness.programmes) || readiness.programmes.length !== 14) failures.push('expected 14 guide programmes');
for (const programme of readiness.programmes ?? []) {
  if (programme.status !== 'complete') failures.push(`${programme.id}: programme is not complete`);
  if (!Array.isArray(programme.checks) || programme.checks.some((check) => !check.present)) failures.push(`${programme.id}: missing repository path`);
  if (!Array.isArray(programme.missing) || programme.missing.length !== 0) failures.push(`${programme.id}: missing-path list is not empty`);
}
if (!readiness.programmes?.some((programme) => programme.id === 'command-centre' && programme.status === 'complete')) failures.push('Command Centre programme is missing or incomplete');
if (!readiness.programmes?.some((programme) => programme.id === 'boss-intelligence' && programme.status === 'complete')) failures.push('Boss Intelligence programme is missing or incomplete');
if (!Array.isArray(readiness.blockers) || readiness.blockers.length !== 0) failures.push('readiness report still has blockers');

const minimums = {
  guideRoutes: 28,
  canonicalRecords: 85,
  verifiedRecords: 40,
  researchRecords: 1,
  researchQueueRecords: 1,
  completionMilestones: 62,
  guideDetailRecords: 32,
  bossIntelligenceRecords: 17,
  bossVerifiedRematches: 5,
  bossOfficialMechanics: 7,
  catalogueRecords: 48,
  atlasLocations: 12,
  technicalRecords: 18,
  playableCharacters: 3,
  buildArchetypes: 8,
  commandSearchRecords: 121,
  commandPlannerRecords: 100,
  officialMediaAssets: 6,
  steamSections: 19,
};
for (const [field, minimum] of Object.entries(minimums)) {
  const value = readiness.metrics?.[field];
  if (!Number.isInteger(value) || value < minimum) failures.push(`${field}: expected at least ${minimum}, found ${value}`);
}

if (readiness.researchQueue?.count !== readiness.metrics?.researchRecords) failures.push('research queue count drift from canonical partial records');
if (readiness.researchQueue?.count !== readiness.metrics?.researchQueueRecords) failures.push('research queue generated-record count drift');
if (!Array.isArray(readiness.researchQueue?.ids) || readiness.researchQueue.ids.length !== readiness.researchQueue.count) failures.push('research queue IDs drift');
if (!readiness.researchQueue?.explanation?.includes('explicitly excluded')) failures.push('research queue exclusion rule missing');

if (readiness.bossIntelligence?.records !== readiness.metrics?.bossIntelligenceRecords) failures.push('Boss Intelligence record metric drift');
if (readiness.bossIntelligence?.verifiedRematches !== readiness.metrics?.bossVerifiedRematches) failures.push('Boss Intelligence rematch metric drift');
if (readiness.bossIntelligence?.officialMechanicRecords !== readiness.metrics?.bossOfficialMechanics) failures.push('Boss Intelligence mechanic metric drift');
if (!Number.isInteger(readiness.bossIntelligence?.identityRecords) || readiness.bossIntelligence.identityRecords < 5) failures.push('Boss Intelligence identity metric missing');
if (!Number.isInteger(readiness.bossIntelligence?.unresolvedFields) || readiness.bossIntelligence.unresolvedFields < 50) failures.push('Boss Intelligence unresolved-field metric missing');
if (!readiness.bossIntelligence?.explanation?.includes('explicitly unresolved')) failures.push('Boss Intelligence evidence-boundary interpretation missing');

if (readiness.commandCentre?.searchRecords !== readiness.metrics?.commandSearchRecords) failures.push('Command Centre search-record metric drift');
if (readiness.commandCentre?.plannerRecords !== readiness.metrics?.commandPlannerRecords) failures.push('Command Centre planner-record metric drift');
if (readiness.commandCentre?.officialAssets !== readiness.metrics?.officialMediaAssets) failures.push('official media metric drift');
if (readiness.commandCentre?.vaultSources !== 5) failures.push('Command Centre must support five validated guide-vault sources');
if (!readiness.commandCentre?.explanation?.includes('without creating a server-side player profile')) failures.push('Command Centre local-first interpretation missing');
if (!readiness.interpretation?.evidenceSafety?.includes('unknown values')) failures.push('evidence-safety interpretation missing');
if (!Array.isArray(readiness.deferredOperations) || readiness.deferredOperations.length !== 2) failures.push('deferred repository/advertising operations missing');
if (!readiness.deferredOperations?.[0]?.includes('TKB-Website')) failures.push('future canonical repository migration note missing');
if (!readiness.deferredOperations?.[1]?.includes('consent-managed advertising')) failures.push('consent-managed advertising boundary missing');

if (failures.length) {
  console.error('Guide readiness audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Guide readiness audit passed Guide v${readiness.guideVersion}, ${readiness.programmes.length} programmes at ${readiness.programmePercent}% with ${readiness.metrics.canonicalRecords} canonical records, ${readiness.bossIntelligence.records} boss dossiers, ${readiness.researchQueue.count} controlled research records and ${readiness.commandCentre.searchRecords} Command Centre records.`);

import { readFile } from 'node:fs/promises';

const [readiness, packageJson] = await Promise.all([
  readFile(new URL('../data/v1-readiness.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
]);
const failures = [];

if (readiness.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (readiness.guideVersion !== packageJson.version) failures.push(`guideVersion ${readiness.guideVersion} does not match package ${packageJson.version}`);
if (readiness.gamePatch !== '1.15.00') failures.push('v1 report must target Patch 1.15.00');
if (readiness.lastVerified !== '2026-07-26') failures.push('v1 report verification date drift');
if (readiness.status !== 'ready') failures.push(`v1 status is ${readiness.status}, expected ready`);
if (readiness.programmePercent !== 100) failures.push(`programme completion is ${readiness.programmePercent}%`);
if (!Array.isArray(readiness.programmes) || readiness.programmes.length !== 13) failures.push('expected 13 guide programmes');
for (const programme of readiness.programmes ?? []) {
  if (programme.status !== 'complete') failures.push(`${programme.id}: programme is not complete`);
  if (!Array.isArray(programme.checks) || programme.checks.some((check) => !check.present)) failures.push(`${programme.id}: missing repository path`);
  if (!Array.isArray(programme.missing) || programme.missing.length !== 0) failures.push(`${programme.id}: missing-path list is not empty`);
}
if (!readiness.programmes?.some((programme) => programme.id === 'command-centre' && programme.status === 'complete')) failures.push('Command Centre programme is missing or incomplete');
if (!Array.isArray(readiness.blockers) || readiness.blockers.length !== 0) failures.push('v1 report still has blockers');

const minimums = {
  guideRoutes: 27,
  canonicalRecords: 85,
  verifiedRecords: 40,
  researchRecords: 1,
  researchQueueRecords: 1,
  completionMilestones: 62,
  guideDetailRecords: 32,
  catalogueRecords: 48,
  atlasLocations: 12,
  technicalRecords: 18,
  playableCharacters: 3,
  buildArchetypes: 8,
  commandSearchRecords: 120,
  commandPlannerRecords: 100,
  officialMediaAssets: 6,
  steamSections: 18,
};
for (const [field, minimum] of Object.entries(minimums)) {
  const value = readiness.metrics?.[field];
  if (!Number.isInteger(value) || value < minimum) failures.push(`${field}: expected at least ${minimum}, found ${value}`);
}

if (readiness.researchQueue?.count !== readiness.metrics?.researchRecords) failures.push('research queue count drift from canonical partial records');
if (readiness.researchQueue?.count !== readiness.metrics?.researchQueueRecords) failures.push('research queue generated-record count drift');
if (!Array.isArray(readiness.researchQueue?.ids) || readiness.researchQueue.ids.length !== readiness.researchQueue.count) failures.push('research queue IDs drift');
if (!readiness.researchQueue?.explanation?.includes('explicitly excluded')) failures.push('research queue exclusion rule missing');
if (readiness.commandCentre?.searchRecords !== readiness.metrics?.commandSearchRecords) failures.push('Command Centre search-record metric drift');
if (readiness.commandCentre?.plannerRecords !== readiness.metrics?.commandPlannerRecords) failures.push('Command Centre planner-record metric drift');
if (readiness.commandCentre?.officialAssets !== readiness.metrics?.officialMediaAssets) failures.push('official media metric drift');
if (readiness.commandCentre?.vaultSources !== 5) failures.push('Command Centre must support five validated guide-vault sources');
if (!readiness.commandCentre?.explanation?.includes('without creating a server-side player profile')) failures.push('Command Centre local-first interpretation missing');
if (!readiness.interpretation?.evidenceSafety?.includes('unknown values')) failures.push('evidence-safety interpretation missing');
if (!Array.isArray(readiness.deferredOperations) || readiness.deferredOperations.length !== 2) failures.push('deferred domain/advertising operations missing');
if (!readiness.deferredOperations?.[0]?.includes('tkb-gaming.scot/crimsondesert')) failures.push('future canonical domain path missing');

if (failures.length) {
  console.error('v1 readiness audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`v1 readiness audit passed Guide v${readiness.guideVersion}, ${readiness.programmes.length} programmes at ${readiness.programmePercent}% with ${readiness.metrics.canonicalRecords} canonical records, ${readiness.researchQueue.count} controlled research records and ${readiness.commandCentre.searchRecords} Command Centre records.`);

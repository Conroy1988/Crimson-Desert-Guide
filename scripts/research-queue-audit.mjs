import { readFile } from 'node:fs/promises';

const [database, queue, component, page, state] = await Promise.all([
  readFile(new URL('../data/content-database.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../data/research-queue.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../src/components/ResearchQueueCentre.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/content/docs/database/research-queue.mdx', import.meta.url), 'utf8'),
  readFile(new URL('../src/lib/research-queue-state.mjs', import.meta.url), 'utf8'),
]);

const failures = [];
const partial = database.records.filter((record) => record.recordStatus === 'partial');
const partialIds = new Set(partial.map((record) => record.id));
const queueIds = queue.records.map((record) => record.id);

if (queue.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (queue.datasetVersion !== '1.0.0') failures.push('datasetVersion must be 1.0.0');
if (queue.gamePatch !== database.gamePatch) failures.push('research queue patch drift');
if (!queue.storageKey?.includes('research-queue')) failures.push('research queue storage key missing');
if (queue.records.length !== partial.length) failures.push(`expected ${partial.length} research records, found ${queue.records.length}`);
if (new Set(queueIds).size !== queueIds.length) failures.push('research queue IDs must be unique');
for (const id of queueIds) if (!partialIds.has(id)) failures.push(`${id}: not a canonical partial record`);
for (const id of partialIds) if (!queueIds.includes(id)) failures.push(`${id}: missing from research queue`);

const allowedPriorities = new Set(['high', 'medium', 'standard']);
const allowedGaps = new Set(queue.gapDefinitions.map((gap) => gap.id));
if (allowedGaps.size !== queue.gapDefinitions.length) failures.push('gap definition IDs must be unique');

for (const record of queue.records) {
  if (!record.title || !record.summary) failures.push(`${record.id}: title or summary missing`);
  if (!allowedPriorities.has(record.priority)) failures.push(`${record.id}: invalid priority ${record.priority}`);
  if (!Array.isArray(record.confirmedFacts) || record.confirmedFacts.length < 4) failures.push(`${record.id}: insufficient confirmed facts`);
  if (!Array.isArray(record.gapIds) || record.gapIds.length === 0) failures.push(`${record.id}: no evidence gaps`);
  for (const gap of record.gapIds ?? []) if (!allowedGaps.has(gap)) failures.push(`${record.id}: unknown gap ${gap}`);
  if (!Array.isArray(record.protocol) || record.protocol.length < 6) failures.push(`${record.id}: test protocol is incomplete`);
  if (!Array.isArray(record.evidenceChecklist) || record.evidenceChecklist.length < 4) failures.push(`${record.id}: evidence checklist is incomplete`);
  if (!Array.isArray(record.sources) || record.sources.length === 0 || record.sources.some((source) => !source.startsWith('https://'))) failures.push(`${record.id}: official source list is invalid`);
}

const requiredComponentMarkers = [
  'class="research-queue"',
  'data-research-search',
  'data-research-priority',
  'data-research-gap',
  'data-research-stage',
  'data-research-card',
  'data-research-export',
  'data-research-import',
  'loadResearchQueueState',
  'setResearchStage',
  '@media (max-width: 48rem)',
];
for (const marker of requiredComponentMarkers) if (!component.includes(marker)) failures.push(`Research Queue Centre missing ${marker}`);
if (!page.includes("import ResearchQueueCentre")) failures.push('research queue page does not import the centre');
if (!page.includes('<ResearchQueueCentre />')) failures.push('research queue page does not render the centre');
for (const symbol of ['RESEARCH_STAGES', 'MAX_RESEARCH_NOTE_LENGTH', 'createResearchQueueExport', 'parseResearchQueueImport']) {
  if (!state.includes(symbol)) failures.push(`research queue state missing ${symbol}`);
}

if (failures.length) {
  console.error('Research queue audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Research queue audit passed ${queue.records.length} records, ${queue.gapDefinitions.length} gap definitions and ${queue.priorities.length} priority bands.`);

import { readFile } from 'node:fs/promises';

const dataset = JSON.parse(
  await readFile(new URL('../data/completion.json', import.meta.url), 'utf8'),
);
const patch = JSON.parse(
  await readFile(new URL('../data/current-patch.json', import.meta.url), 'utf8'),
);

const failures = [];
const evidenceValues = new Set(['official', 'verified', 'community', 'provisional']);
const spoilerValues = new Set(['none', 'minor', 'full']);
const patchValues = new Set(['current', 'review-required', 'historical']);
const coverageValues = new Set(['seeded', 'planned']);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (dataset.schemaVersion !== 1) failures.push('schemaVersion must be 1');
if (!/^\d+\.\d+\.\d+$/.test(dataset.datasetVersion ?? '')) {
  failures.push('datasetVersion must be semantic version text');
}
if (dataset.gamePatch !== patch.version) {
  failures.push(`dataset patch ${dataset.gamePatch} does not match ${patch.version}`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(dataset.lastVerified ?? '')) {
  failures.push('lastVerified must use YYYY-MM-DD');
}
if (!/^crimson-desert-guide\.[a-z0-9.-]+$/.test(dataset.storageKey ?? '')) {
  failures.push('storageKey must use the project namespace');
}
if (!Array.isArray(dataset.categories) || dataset.categories.length === 0) {
  failures.push('categories must be a non-empty array');
}
if (!Array.isArray(dataset.entries) || dataset.entries.length === 0) {
  failures.push('entries must be a non-empty array');
}

const categoryIds = new Set();
for (const category of dataset.categories ?? []) {
  if (!idPattern.test(category.id ?? '')) failures.push(`invalid category ID: ${category.id}`);
  if (categoryIds.has(category.id)) failures.push(`duplicate category ID: ${category.id}`);
  categoryIds.add(category.id);
  if (!category.label || !category.description) {
    failures.push(`${category.id}: category requires label and description`);
  }
  if (!coverageValues.has(category.coverage)) {
    failures.push(`${category.id}: invalid coverage value`);
  }
}

const entryIds = new Set();
for (const entry of dataset.entries ?? []) {
  if (!idPattern.test(entry.id ?? '')) failures.push(`invalid entry ID: ${entry.id}`);
  if (entryIds.has(entry.id)) failures.push(`duplicate entry ID: ${entry.id}`);
  entryIds.add(entry.id);

  if (!categoryIds.has(entry.category)) {
    failures.push(`${entry.id}: unknown category ${entry.category}`);
  }
  if (!entry.title || !entry.summary) failures.push(`${entry.id}: missing title or summary`);
  if (!spoilerValues.has(entry.spoilerLevel)) {
    failures.push(`${entry.id}: invalid spoilerLevel`);
  }
  if (!evidenceValues.has(entry.evidence)) failures.push(`${entry.id}: invalid evidence`);
  if (!patchValues.has(entry.patchStatus)) failures.push(`${entry.id}: invalid patchStatus`);
  if (entry.evidence === 'official' && !/^https:\/\//.test(entry.source ?? '')) {
    failures.push(`${entry.id}: official entry requires an HTTPS source`);
  }
  if (!/^\/[a-z0-9/-]*\/$/.test(entry.guidePath ?? '')) {
    failures.push(`${entry.id}: guidePath must be an internal trailing-slash route`);
  }
  if (!Array.isArray(entry.prerequisites)) {
    failures.push(`${entry.id}: prerequisites must be an array`);
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    failures.push(`${entry.id}: tags must be a non-empty array`);
  }
}

for (const entry of dataset.entries ?? []) {
  for (const prerequisite of entry.prerequisites ?? []) {
    if (!entryIds.has(prerequisite)) {
      failures.push(`${entry.id}: missing prerequisite ${prerequisite}`);
    }
    if (prerequisite === entry.id) failures.push(`${entry.id}: self prerequisite`);
  }
}

const renamed = dataset.migrations?.renamedIds ?? {};
const retired = new Set(dataset.migrations?.retiredIds ?? []);
if (typeof renamed !== 'object' || Array.isArray(renamed)) {
  failures.push('migrations.renamedIds must be an object');
} else {
  for (const [oldId, newId] of Object.entries(renamed)) {
    if (!idPattern.test(oldId)) failures.push(`invalid renamed source ID: ${oldId}`);
    if (!entryIds.has(newId)) failures.push(`renamed ID ${oldId} points to missing ${newId}`);
    if (entryIds.has(oldId)) failures.push(`renamed source ${oldId} is still active`);
  }
}
if (!Array.isArray(dataset.migrations?.retiredIds)) {
  failures.push('migrations.retiredIds must be an array');
} else {
  for (const id of retired) {
    if (!idPattern.test(id)) failures.push(`invalid retired ID: ${id}`);
    if (entryIds.has(id)) failures.push(`retired ID ${id} is still active`);
    if (Object.hasOwn(renamed, id)) failures.push(`${id} cannot be retired and renamed`);
  }
}

if ((dataset.entries ?? []).length < 12) {
  failures.push('initial tracker must contain at least 12 supported milestones');
}

if (failures.length) {
  console.error('Completion data audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const seededCategories = dataset.categories.filter((category) => category.coverage === 'seeded').length;
console.log(
  `Completion data audit passed for ${dataset.entries.length} entries across ${dataset.categories.length} categories (${seededCategories} seeded).`,
);

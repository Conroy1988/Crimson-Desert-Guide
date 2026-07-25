import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ATLAS_BACKUP_FORMAT,
  createEmptyAtlasState,
  decodeAtlasBackup,
  encodeAtlasBackup,
  findVerifiedRoute,
  normaliseAtlasState,
} from '../src/lib/atlas-state.mjs';

const atlas = JSON.parse(await readFile(new URL('../data/atlas.json', import.meta.url), 'utf8'));
const empty = createEmptyAtlasState(atlas);
assert.equal(empty.format, ATLAS_BACKUP_FORMAT);
assert.deepEqual(empty.visited, []);

const state = normaliseAtlasState(atlas, {
  ...empty,
  visited: ['hernand', 'hernand'],
  activated: ['pailune-nexus'],
  checkedServices: ['hernand:private-storage'],
  revealed: ['pailune'],
});
assert.deepEqual(state.visited, ['hernand']);
assert.deepEqual(state.activated, ['pailune-nexus']);

const encoded = encodeAtlasBackup(atlas, state);
const decoded = decodeAtlasBackup(atlas, encoded);
assert.deepEqual(decoded.visited, state.visited);
assert.deepEqual(decoded.checkedServices, state.checkedServices);

assert.throws(() => decodeAtlasBackup(atlas, JSON.stringify({ ...empty, visited: ['unknown-place'] })), /unknown ID/);
assert.throws(() => decodeAtlasBackup(atlas, JSON.stringify({ ...empty, checkedServices: ['hernand:unknown'] })), /unknown service check/);
assert.throws(() => decodeAtlasBackup(atlas, '{broken'), /valid JSON/);

const route = findVerifiedRoute(atlas, 'pailune-nexus', 'abyss-nexus-network');
assert.deepEqual(route.locationIds, ['pailune-nexus', 'abyss-nexus-network']);
assert.equal(findVerifiedRoute(atlas, 'hernand', 'calphade'), null);

console.log('Atlas state tests passed persistence, validation, route and no-route handling.');

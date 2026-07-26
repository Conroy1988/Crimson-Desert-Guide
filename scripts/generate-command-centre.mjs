import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [database, completion, atlas, research, catalogue, builds, mastery, media] = await Promise.all([
  readFile(new URL('data/content-database.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/completion.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/atlas.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/research-queue.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/collectible-catalogue.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/build-archetypes.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/character-mastery.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('data/official-media.json', root), 'utf8').then(JSON.parse),
]);

const assetIds = new Set(media.assets.map((asset) => asset.id));
const fallbackAsset = 'official-world-river-valley';

function assetFor(record) {
  const tags = new Set(record.tags ?? []);
  const subtype = String(record.subtype ?? '');
  const type = String(record.type ?? '');
  if (type === 'boss') return 'official-boss-forest-colossus';
  if (type === 'quest') return 'official-kliff-launch';
  if (type === 'stronghold' || type === 'knowledge') return 'official-settlement-lakeside';
  if (type === 'abyss') return 'official-world-river-valley';
  if (['weapon', 'shield', 'bow'].includes(subtype) || tags.has('weapon') || tags.has('equipment')) return 'official-weapon-pickaxe';
  if (['mount', 'mounts', 'pet', 'pets', 'creature'].includes(subtype) || tags.has('mount') || tags.has('creature')) return 'official-pywel-horse';
  return fallbackAsset;
}

const tools = [
  ['tool-beginner', 'Beginner Roadmap', 'Start safely with settings, saves and first-hour priorities.', '/start-here/beginner-roadmap/', 'guide', 'none', 'official-kliff-launch'],
  ['tool-combat', 'Combat Doctrine', 'Defence, positioning, weapon skills and encounter preparation.', '/systems/combat/', 'guide', 'minor', 'official-weapon-pickaxe'],
  ['tool-build-lab', 'Build Laboratory', 'Save controlled character and weapon tests without unsupported tier claims.', '/systems/build-lab/', 'tool', 'minor', 'official-weapon-pickaxe'],
  ['tool-atlas', 'Pywel Atlas', 'Verified settlements, services and travel connections without invented coordinates.', '/atlas/', 'tool', 'minor', 'official-world-river-valley'],
  ['tool-world', 'World Compendium', 'Regions, settlements, services and discovery intelligence.', '/world/', 'guide', 'minor', 'official-settlement-lakeside'],
  ['tool-mounts', 'Mounts & Creatures', 'Traversal, special mounts, trust and creature discoveries.', '/mounts/', 'guide', 'minor', 'official-pywel-horse'],
  ['tool-database', 'Content Database', 'Canonical quests, bosses, challenges and evidence status.', '/database/', 'tool', 'minor', 'official-boss-forest-colossus'],
  ['tool-details', 'Quest & Encounter Encyclopaedia', 'Deep operational records, blocker recovery and private notes.', '/database/details/', 'tool', 'full', 'official-kliff-launch'],
  ['tool-research', 'Research Queue Centre', 'See precisely what is known, missing and ready for controlled testing.', '/database/research-queue/', 'tool', 'full', 'official-boss-forest-colossus'],
  ['tool-catalogue', 'Collectible Catalogue', 'Knowledge, challenges and collectible progress with evidence boundaries.', '/database/catalogue/', 'tool', 'minor', 'official-settlement-lakeside'],
  ['tool-completion', 'Completion Companion', 'Track verified milestones locally with spoiler controls and backups.', '/completion/', 'tool', 'minor', 'official-kliff-launch'],
  ['tool-technical', 'Technical Centre', 'Current known issues, diagnostics and platform-specific recovery.', '/technical/', 'tool', 'none', 'official-weapon-pickaxe'],
  ['tool-patch-notes', 'Patch Notes', 'Current official patch changes and guide-impact interpretation.', '/patch-notes/', 'guide', 'minor', 'official-kliff-launch'],
].map(([id, title, summary, href, kind, spoilerLevel, assetId]) => ({
  id,
  title,
  summary,
  href,
  kind,
  type: kind,
  typeLabel: kind === 'tool' ? 'Interactive tool' : 'Guide',
  spoilerLevel,
  evidence: 'verified',
  assetId,
  plannerEligible: false,
  searchText: `${title} ${summary} ${kind}`.toLowerCase(),
}));

const canonicalRecords = database.records.map((record) => ({
  id: `content-${record.id}`,
  recordId: record.id,
  title: record.title,
  summary: record.summary,
  href: record.guidePath || '/database/',
  kind: 'content',
  type: record.type,
  typeLabel: database.types.find((type) => type.id === record.type)?.label ?? record.type,
  spoilerLevel: record.spoilerLevel ?? 'none',
  evidence: record.recordStatus,
  assetId: assetFor(record),
  plannerEligible: true,
  searchText: [record.title, record.summary, record.type, record.subtype, record.region, ...(record.tags ?? []), ...(record.knownBlockers ?? [])].join(' ').toLowerCase(),
}));

const atlasRecords = atlas.locations.map((location) => ({
  id: `atlas-${location.id}`,
  recordId: location.id,
  title: location.title,
  summary: location.summary,
  href: location.guidePath || '/atlas/',
  kind: 'location',
  type: location.type,
  typeLabel: 'Atlas location',
  spoilerLevel: location.spoilerLevel ?? 'none',
  evidence: location.evidence,
  assetId: location.type === 'settlement' ? 'official-settlement-lakeside' : 'official-world-river-valley',
  plannerEligible: true,
  searchText: [location.title, location.summary, location.type, location.region, ...(location.serviceIds ?? []), ...(location.notes ?? [])].join(' ').toLowerCase(),
}));

const buildRecords = builds.archetypes.map((archetype) => ({
  id: `build-${archetype.id}`,
  recordId: archetype.id,
  title: archetype.title,
  summary: archetype.objective,
  href: '/systems/build-lab/',
  kind: 'build',
  type: 'build',
  typeLabel: 'Build archetype',
  spoilerLevel: 'minor',
  evidence: 'verified',
  assetId: 'official-weapon-pickaxe',
  plannerEligible: true,
  searchText: [archetype.title, archetype.objective, ...(archetype.tradeoffs ?? []), ...(archetype.priorityDimensions ?? [])].join(' ').toLowerCase(),
}));

const weaponRecords = builds.weaponFamilies.map((family) => ({
  id: `weapon-${family.id}`,
  recordId: family.id,
  title: family.label,
  summary: `Weapon or tool family available for controlled Build Laboratory testing. Compatibility scope: ${family.scope.replaceAll('-', ' ')}.`,
  href: '/systems/weapon-skills/',
  kind: 'weapon',
  type: 'weapon',
  typeLabel: 'Weapon family',
  spoilerLevel: 'minor',
  evidence: family.scope,
  assetId: 'official-weapon-pickaxe',
  plannerEligible: true,
  searchText: `${family.label} ${family.scope} weapon build`.toLowerCase(),
}));

const characterRecords = mastery.characters.map((character) => ({
  id: `character-${character.id}`,
  recordId: character.id,
  title: character.name,
  summary: character.summary,
  href: '/systems/characters/',
  kind: 'character',
  type: 'character',
  typeLabel: 'Playable character',
  spoilerLevel: character.spoilerLevel ?? 'minor',
  evidence: character.evidence ?? 'verified',
  assetId: character.id === 'kliff' ? 'official-kliff-launch' : 'official-weapon-pickaxe',
  plannerEligible: true,
  searchText: [character.name, character.summary, ...(character.capabilities ?? []).map((item) => item.label ?? item)].join(' ').toLowerCase(),
}));

const records = [...tools, ...canonicalRecords, ...atlasRecords, ...buildRecords, ...weaponRecords, ...characterRecords];
const ids = new Set();
for (const record of records) {
  if (ids.has(record.id)) throw new Error(`Duplicate command-centre record ID: ${record.id}`);
  ids.add(record.id);
  if (!assetIds.has(record.assetId)) throw new Error(`${record.id}: unknown official media asset ${record.assetId}`);
}

const output = {
  schemaVersion: 1,
  datasetVersion: '1.0.0',
  gamePatch: database.gamePatch,
  lastVerified: '2026-07-26',
  storageKey: 'crimson-desert-guide.command-centre.v1',
  spoilerKey: 'crimson-desert-guide.spoiler-profile.v1',
  lastRouteKey: 'crimson-desert-guide.last-route.v1',
  vaultKind: 'crimson-desert-guide-vault',
  media,
  stateSources: [
    { id: 'completion', label: 'Completion Companion', storageKey: completion.storageKey, total: completion.entries.length, href: '/completion/' },
    { id: 'atlas', label: 'Pywel Atlas', storageKey: atlas.storageKey, total: atlas.locations.length, href: '/atlas/' },
    { id: 'collectibles', label: 'Collectible Catalogue', storageKey: catalogue.storageKey, total: catalogue.records.length, href: '/database/catalogue/' },
    { id: 'research', label: 'Research Queue', storageKey: research.storageKey, total: research.records.length, href: '/database/research-queue/' },
    { id: 'builds', label: 'Build Laboratory', storageKey: builds.storageKey, total: 100, href: '/systems/build-lab/' },
  ],
  spoilerProfiles: [
    { id: 'safe', label: 'Spoiler-safe', description: 'Hide minor and major identities wherever compatible controls exist.' },
    { id: 'minor', label: 'Minor spoilers', description: 'Allow minor context while keeping major identities masked.' },
    { id: 'full', label: 'Full information', description: 'Reveal all compatible records and filters.' },
  ],
  records,
  plannerRecords: records.filter((record) => record.plannerEligible),
  metrics: {
    searchableRecords: records.length,
    plannerRecords: records.filter((record) => record.plannerEligible).length,
    officialAssets: media.assets.length,
    canonicalRecords: database.records.length,
    atlasLocations: atlas.locations.length,
    completionMilestones: completion.entries.length,
  },
};

await writeFile(new URL('data/command-centre.json', root), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Generated Expedition Command Centre with ${records.length} searchable records, ${output.plannerRecords.length} planner targets and ${media.assets.length} official assets.`);

import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootUrl = new URL('../', import.meta.url);
const root = fileURLToPath(rootUrl);
const exists = async (relative) => access(path.join(root, relative)).then(() => true).catch(() => false);

const programmes = [
  {
    id: 'foundation',
    label: 'Platform, deployment and evidence policy',
    requiredPaths: ['astro.config.mjs', 'wrangler.jsonc', 'src/styles/site-theme.css', 'src/styles/light-mode.css', 'src/content/docs/standards/evidence-policy.md'],
  },
  {
    id: 'beginner',
    label: 'Beginner and first-hours guidance',
    requiredPaths: ['src/content/docs/start-here/beginner-roadmap.md', 'src/content/docs/start-here/essential-settings.md', 'src/content/docs/start-here/save-storage.md', 'src/content/docs/start-here/first-systems.md'],
  },
  {
    id: 'combat-gear',
    label: 'Combat, weapons and gear',
    requiredPaths: ['src/content/docs/systems/combat.md', 'src/content/docs/systems/weapon-skills.md', 'src/content/docs/systems/boss-diagnosis.md', 'src/content/docs/systems/gear.md'],
  },
  {
    id: 'world-mounts',
    label: 'World, settlements and mounts',
    requiredPaths: ['src/content/docs/world/index.mdx', 'src/content/docs/world/hernand.mdx', 'src/content/docs/mounts/index.mdx', 'src/content/docs/mounts/blackstar.mdx', 'data/world-locations.json', 'data/mounts.json'],
  },
  {
    id: 'completion',
    label: 'Completion Companion',
    requiredPaths: ['src/content/docs/completion/index.mdx', 'src/components/CompletionTracker.astro', 'data/completion.json', 'src/lib/completion-state.js'],
  },
  {
    id: 'technical',
    label: 'Technical and patch intelligence',
    requiredPaths: ['src/content/docs/technical/index.mdx', 'src/components/TechnicalCentre.astro', 'data/technical-issues.json', 'scripts/check-known-issues.mjs'],
  },
  {
    id: 'database',
    label: 'Canonical content database and research operations',
    requiredPaths: [
      'src/content/docs/database/index.mdx',
      'src/components/ContentDatabase.astro',
      'data/content-database.json',
      'scripts/content-database-audit.mjs',
      'src/content/docs/database/research-queue.mdx',
      'src/components/ResearchQueueCentre.astro',
      'data/research-queue.json',
      'src/lib/research-queue-state.mjs',
      'scripts/research-queue-audit.mjs',
    ],
  },
  {
    id: 'atlas',
    label: 'Pywel Atlas and route intelligence',
    requiredPaths: ['src/content/docs/atlas/index.mdx', 'src/components/PywelAtlas.astro', 'data/atlas.json', 'src/lib/atlas-state.mjs'],
  },
  {
    id: 'deep-guides',
    label: 'Quest and encounter encyclopaedia',
    requiredPaths: ['src/content/docs/database/details.mdx', 'src/components/GuideDetailCentre.astro', 'data/guide-details.json', 'src/lib/guide-notes-state.mjs'],
  },
  {
    id: 'catalogue',
    label: 'Collectibles, knowledge and challenges',
    requiredPaths: ['src/content/docs/database/catalogue.mdx', 'src/components/CollectibleCatalogue.astro', 'data/collectible-catalogue.json', 'src/lib/collectible-state.mjs'],
  },
  {
    id: 'character-builds',
    label: 'Character mastery and Build Laboratory',
    requiredPaths: ['src/content/docs/systems/characters.mdx', 'src/content/docs/systems/build-lab.mdx', 'src/components/CharacterMasteryCentre.astro', 'src/components/BuildLaboratory.astro', 'data/character-mastery.json', 'data/build-archetypes.json', 'src/lib/build-lab-state.mjs'],
  },
  {
    id: 'publishing-quality',
    label: 'Publishing, accessibility and protected validation',
    requiredPaths: [
      'data/steam-sections.json',
      'scripts/deployment-smoke.mjs',
      'scripts/light-theme-contrast-audit.mjs',
      'scripts/site-theme-audit.mjs',
      'src/components/SoundtrackPlayer.astro',
      'scripts/soundtrack-player-audit.mjs',
      'public/media/hymn-for-the-unsung-blade.m4a',
      '.github/workflows/ci.yml',
      '.github/workflows/codeql.yml',
    ],
  },
];

for (const programme of programmes) {
  const checks = await Promise.all(programme.requiredPaths.map(async (relative) => ({ path: relative, present: await exists(relative) })));
  programme.checks = checks;
  programme.status = checks.every((check) => check.present) ? 'complete' : 'blocked';
  programme.missing = checks.filter((check) => !check.present).map((check) => check.path);
  delete programme.requiredPaths;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(full));
    else output.push(full);
  }
  return output;
}

const [database, research, completion, details, catalogue, atlas, technical, mastery, builds, steam, packageJson] = await Promise.all([
  readFile(new URL('data/content-database.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/research-queue.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/completion.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/guide-details.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/collectible-catalogue.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/atlas.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/technical-issues.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/character-mastery.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/build-archetypes.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('data/steam-sections.json', rootUrl), 'utf8').then(JSON.parse),
  readFile(new URL('package.json', rootUrl), 'utf8').then(JSON.parse),
]);

const docs = (await walk(path.join(root, 'src/content/docs'))).filter((file) => /\.(md|mdx)$/.test(file));
const partialRecords = database.records.filter((record) => record.recordStatus === 'partial');
const verifiedRecords = database.records.filter((record) => record.recordStatus === 'verified');
const completedProgrammes = programmes.filter((programme) => programme.status === 'complete').length;
const programmePercent = Math.round((completedProgrammes / programmes.length) * 100);
const requiredScripts = [
  'check:all', 'generate:research', 'audit:content', 'audit:database', 'audit:research', 'audit:atlas', 'audit:details', 'audit:catalogue',
  'audit:characters', 'audit:technical', 'audit:theme', 'audit:site-theme', 'audit:soundtrack', 'audit:v1',
  'test:completion', 'test:atlas', 'test:guide-notes', 'test:catalogue', 'test:build-lab', 'test:research',
];
const missingScripts = requiredScripts.filter((script) => !packageJson.scripts?.[script]);
const releaseReady = programmePercent === 100 && missingScripts.length === 0;

const output = {
  schemaVersion: 1,
  guideVersion: '1.0.0',
  gamePatch: database.gamePatch,
  lastVerified: '2026-07-26',
  status: releaseReady ? 'ready' : 'blocked',
  programmePercent,
  programmes,
  blockers: [
    ...programmes.flatMap((programme) => programme.missing.map((missing) => `${programme.id}: ${missing}`)),
    ...missingScripts.map((script) => `package script: ${script}`),
  ],
  metrics: {
    guideRoutes: docs.length,
    canonicalRecords: database.records.length,
    verifiedRecords: verifiedRecords.length,
    researchRecords: partialRecords.length,
    researchQueueRecords: research.records.length,
    completionMilestones: completion.entries.length,
    guideDetailRecords: details.records.length,
    catalogueRecords: catalogue.records.length,
    atlasLocations: atlas.locations.length,
    technicalRecords: technical.records.length,
    playableCharacters: mastery.characters.length,
    buildArchetypes: builds.archetypes.length,
    steamSections: steam.sections.length,
  },
  researchQueue: {
    count: research.records.length,
    explanation: 'Officially named or otherwise supported records whose route, objective, total, reward, mechanics or exact statistics remain incomplete. They are visible, converted into controlled research protocols and explicitly excluded from unsupported completion claims.',
    ids: research.records.map((record) => record.id),
  },
  interpretation: {
    programmeCompletion: 'Measures whether every planned guide programme, tool and validation system is present.',
    evidenceSafety: 'Every canonical record is either verified or explicitly marked partial; unknown values are not filled with guesses.',
    gameExhaustiveness: 'The research queue remains open for unpublished or not-yet-tested game details and is maintained through patch and evidence updates.',
  },
  deferredOperations: [
    'Move the canonical site to https://tkb-gaming.scot/crimsondesert/ after the domain and hosting path are live.',
    'Add consent-managed advertising only after the custom domain migration and AdSense approval.',
  ],
};

await writeFile(new URL('data/v1-readiness.json', rootUrl), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Generated v1 readiness: ${programmePercent}% programmes, ${database.records.length} canonical records and ${research.records.length} controlled research records.`);

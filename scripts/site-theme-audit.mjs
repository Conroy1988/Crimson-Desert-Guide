import { readFile } from 'node:fs/promises';

const [config, css, pageTitle, footer, atlas] = await Promise.all([
  readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/site-theme.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/PageTitle.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/GuideFooter.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/PywelAtlas.astro', import.meta.url), 'utf8'),
]);

const failures = [];

const configThemeIndex = config.indexOf("'./src/styles/site-theme.css'");
const configLightIndex = config.indexOf("'./src/styles/light-mode.css'");
if (configThemeIndex === -1) failures.push('astro.config.mjs does not load site-theme.css');
if (configLightIndex === -1) failures.push('astro.config.mjs does not load light-mode.css');
if (configThemeIndex > configLightIndex) {
  failures.push('site-theme.css must load before light-mode.css so the accessibility layer remains authoritative');
}
if (!config.includes("directory: 'atlas'")) failures.push('astro.config.mjs does not expose the Pywel Atlas');

const requiredShellSelectors = [
  '.header',
  '.site-title',
  '.sidebar-pane',
  '.sidebar-content a[aria-current=\'page\']',
  '.main-pane',
  '.sl-markdown-content',
  '.sl-markdown-content table',
  '.starlight-aside',
  '.right-sidebar-panel',
  '.pagination-links a',
  '.completion-tracker__hero',
  '.tech-centre__hero',
  ":root[data-theme='light'] .sl-markdown-content",
  ":root[data-theme='light'] .sidebar-pane",
];

for (const selector of requiredShellSelectors) {
  if (!css.includes(selector)) failures.push(`Missing site-theme selector: ${selector}`);
}

const requiredSections = [
  "id: 'updates'",
  "id: 'start'",
  "id: 'combat'",
  "id: 'gear'",
  "id: 'world'",
  "id: 'mounts'",
  "id: 'database'",
  "id: 'completion'",
  "id: 'technical'",
  "id: 'standards'",
];

for (const section of requiredSections) {
  if (!pageTitle.includes(section)) failures.push(`Missing section-aware hero configuration: ${section}`);
}

const requiredAtlasSelectors = [
  '.pywel-atlas',
  '.atlas-hero',
  '.atlas-workspace',
  '.atlas-planner',
  '.atlas-card',
  ':root[data-theme=light] .atlas-hero',
  '@media(max-width:46rem)',
];
for (const selector of requiredAtlasSelectors) {
  if (!atlas.includes(selector)) failures.push(`Missing Pywel Atlas theme scope: ${selector}`);
}

if (!pageTitle.includes('shared.akamai.steamstatic.com/store_item_assets/steam/apps/3321460')) {
  failures.push('PageTitle does not use the approved official Steam media source');
}

if (!pageTitle.includes('data-guide-section={section.id}')) {
  failures.push('PageTitle is missing the route-aware section data attribute');
}

const disclaimer = 'This is unofficial content which contains copyrighted materials and IP from Pearl Abyss';
if (!footer.includes(disclaimer)) failures.push('Footer is missing the Pearl Abyss fan-content disclaimer');

if (failures.length) {
  console.error('Site theme audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Site theme audit passed ${requiredShellSelectors.length} shell scopes, ${requiredSections.length} section heroes and ${requiredAtlasSelectors.length} atlas scopes.`,
);

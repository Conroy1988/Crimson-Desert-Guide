import { readFile } from 'node:fs/promises';

const [
  config,
  css,
  mobileCss,
  home,
  pageTitle,
  footer,
  socialIcons,
  sidebar,
  atlas,
  catalogue,
  mastery,
  buildLab,
  researchQueue,
  bossIntelligence,
  commandCentre,
  sessionTracker,
  readiness,
] = await Promise.all([
  readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/site-theme.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/mobile-text.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/HomeExperience.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/PageTitle.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/GuideFooter.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/GuideSocialIcons.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/GuideSidebar.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/PywelAtlas.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/CollectibleCatalogue.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/CharacterMasteryCentre.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/BuildLaboratory.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/ResearchQueueCentre.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/BossIntelligenceCentre.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/ExpeditionCommandCentre.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/GuideSessionTracker.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/V1Readiness.astro', import.meta.url), 'utf8'),
]);

const failures = [];
const configThemeIndex = config.indexOf("'./src/styles/site-theme.css'");
const configLightIndex = config.indexOf("'./src/styles/light-mode.css'");
const configMobileIndex = config.indexOf("'./src/styles/mobile-text.css'");
if (configThemeIndex === -1) failures.push('astro.config.mjs does not load site-theme.css');
if (configLightIndex === -1) failures.push('astro.config.mjs does not load light-mode.css');
if (configMobileIndex === -1) failures.push('astro.config.mjs does not load mobile-text.css');
if (configThemeIndex > configLightIndex) failures.push('site-theme.css must load before light-mode.css so the accessibility layer remains authoritative');
if (configMobileIndex < configLightIndex) failures.push('mobile-text.css must load after light-mode.css so mobile resilience remains authoritative');
if (!config.includes("directory: 'atlas'")) failures.push('astro.config.mjs does not expose the Pywel Atlas');
if (!config.includes("slug: 'command-centre'")) failures.push('astro.config.mjs does not expose the Expedition Command Centre');
if (!config.includes("SocialIcons: './src/components/GuideSocialIcons.astro'")) failures.push('astro.config.mjs does not install the TKB home navigation component');
if (!config.includes("Sidebar: './src/components/GuideSidebar.astro'")) failures.push('astro.config.mjs does not install the mobile TKB home navigation component');

const requiredShellSelectors = [
  '.header', '.site-title', '.sidebar-pane', '.sidebar-content a[aria-current=\'page\']', '.main-pane',
  '.sl-markdown-content', '.sl-markdown-content table', '.starlight-aside', '.right-sidebar-panel',
  '.pagination-links a', '.completion-tracker__hero', '.tech-centre__hero',
  ":root[data-theme='light'] .sl-markdown-content", ":root[data-theme='light'] .sidebar-pane",
];
for (const selector of requiredShellSelectors) if (!css.includes(selector)) failures.push(`Missing site-theme selector: ${selector}`);

const requiredMobileTextFragments = [
  'overflow-wrap: break-word',
  'overflow-wrap: anywhere',
  '@media (max-width: 42rem)',
  '.cd-portal-home .portal-hero h1 span',
  '.cd-portal-home .portal-patch-badge',
  'clip-path: none',
  '.cd-portal-home .portal-cta span',
  '.cd-portal-home .portal-quick__links strong',
  '.cd-portal-home .portal-issues__list strong',
  '.pagination-links .link-title',
];
for (const fragment of requiredMobileTextFragments) {
  if (!mobileCss.includes(fragment)) failures.push(`Missing mobile text resilience rule: ${fragment}`);
}

const homeMobileBoundary = home.indexOf('@media (max-width: 42rem)');
if (homeMobileBoundary === -1) failures.push('Homepage does not retain its mobile layout breakpoint');
if (!home.includes('.portal-hero h1 span')) failures.push('Homepage is missing the cinematic hero title selector');
if (!home.includes('.portal-patch-badge')) failures.push('Homepage is missing the live patch badge selector');
const tkbHomeUrl = 'https://tkb-gaming.scot/';
if (!home.includes(`href="${tkbHomeUrl}"`)) failures.push('Homepage navigation is missing the TKB home link');
if (!socialIcons.includes(`href="${tkbHomeUrl}"`)) failures.push('Guide shell navigation is missing the TKB home link');
if (!socialIcons.includes('TKB Home')) failures.push('Guide shell navigation is missing a visible TKB Home label');
if (!sidebar.includes(`href="${tkbHomeUrl}"`)) failures.push('Mobile guide navigation is missing the TKB home link');
if (!sidebar.includes('tkb-mobile-home')) failures.push('Mobile guide navigation is missing the top-positioned TKB home control');
if (!css.includes('.sidebar-content .tkb-mobile-home')) failures.push('Guide shell is missing the mobile TKB Home button style');

const requiredSections = [
  "id: 'command'", "id: 'updates'", "id: 'start'", "id: 'combat'", "id: 'gear'", "id: 'world'", "id: 'mounts'",
  "id: 'database'", "id: 'completion'", "id: 'technical'", "id: 'standards'",
];
for (const section of requiredSections) if (!pageTitle.includes(section)) failures.push(`Missing section-aware hero configuration: ${section}`);
if (!pageTitle.includes("id === 'command-centre'")) failures.push('PageTitle does not route Command Centre pages to the official command hero');

const scopes = [
  [atlas, 'Pywel Atlas', ['.pywel-atlas', '.atlas-hero', '.atlas-workspace', '.atlas-planner', '.atlas-card', ':root[data-theme=light] .atlas-hero', '@media(max-width:46rem)']],
  [catalogue, 'collectible catalogue', ['.collectible-catalogue', '.collectible-catalogue__hero', '.collectible-catalogue__filters', '.collectible-card', ":global(:root[data-theme='light']) .collectible-catalogue__hero", '@media (max-width: 46rem)']],
  [mastery, 'Character Mastery Centre', ['.mastery-centre', '.mastery-hero', '.mastery-grid', '.mastery-card', ":global(:root[data-theme='light']) .mastery-hero", '@media (max-width: 48rem)']],
  [buildLab, 'Build Laboratory', ['.build-lab', '.build-lab__hero', '.build-lab__workspace', '.build-readout', '.saved-tests', ":global(:root[data-theme='light']) .build-lab__hero", '@media (max-width: 48rem)']],
  [researchQueue, 'Research Queue Centre', ['.research-queue', '.research-queue__hero', '.research-queue__filters', '.research-card', '.research-card__protocol', ":global(:root[data-theme='light']) .research-queue__hero", '@media (max-width: 48rem)']],
  [bossIntelligence, 'Boss Intelligence Centre', ['.boss-intelligence', '.boss-intelligence__hero', '.boss-intelligence__rules', '.boss-intelligence__filters', '.boss-dossier', '.boss-dossier__facts', '.boss-dossier__timeline', '.boss-dossier__research-grid', ":global(:root[data-theme='light']) .boss-intelligence__hero", '@media (max-width: 48rem)']],
  [commandCentre, 'Expedition Command Centre', ['.expedition-command', '.command-hero', '.command-progress', '.command-results', '.planner-list', '.guide-vault', '.media-provenance', ":global(:root[data-theme='light']) .command-hero", '@media(max-width:42rem)']],
  [readiness, 'v1 readiness dashboard', ['.v1-readiness', '.v1-hero', '.v1-programmes', '.v1-metrics', '.v1-research', ":global(:root[data-theme='light']) .v1-hero", '@media (max-width: 48rem)']],
];
for (const [source, label, selectors] of scopes) {
  for (const selector of selectors) if (!source.includes(selector)) failures.push(`Missing ${label} theme scope: ${selector}`);
}

if (!pageTitle.includes('shared.akamai.steamstatic.com/store_item_assets/steam/apps/3321460')) failures.push('PageTitle does not use the approved official Steam media source');
if (!pageTitle.includes("import officialMedia from '../../data/official-media.json'")) failures.push('PageTitle does not load the official Pearl Abyss media registry');
if (!pageTitle.includes('data-guide-section={section.id}')) failures.push('PageTitle is missing the route-aware section data attribute');
if (!footer.includes("import GuideSessionTracker from './GuideSessionTracker.astro'")) failures.push('Footer does not install the guide session tracker');
if (!footer.includes('<GuideSessionTracker />')) failures.push('Footer does not render the guide session tracker');
if (!sessionTracker.includes("document.addEventListener('astro:page-load'")) failures.push('Guide session tracker is not lifecycle-aware');
const disclaimer = 'This is unofficial content which contains copyrighted materials and IP from Pearl Abyss';
if (!footer.includes(disclaimer)) failures.push('Footer is missing the Pearl Abyss fan-content disclaimer');

if (failures.length) {
  console.error('Site theme audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Site theme audit passed ${requiredShellSelectors.length} shell scopes, ${requiredMobileTextFragments.length} mobile text safeguards, ${requiredSections.length} section heroes and ${scopes.length} premium interactive component families.`,
);

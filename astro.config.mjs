import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

function normaliseBasePath(value) {
  const candidate = String(value ?? '/').trim();
  if (!candidate || candidate === '/') return '/';
  return `/${candidate.replace(/^\/+|\/+$/g, '')}/`;
}

const base = normaliseBasePath(process.env.CD_GUIDE_BASE_PATH);
const site = String(
  process.env.CD_GUIDE_SITE ?? 'https://crimson-desert-guide.dannyconroy.workers.dev',
).replace(/\/+$/g, '');
const distRoot = String(process.env.CD_GUIDE_DIST_ROOT ?? 'dist')
  .replace(/^\.\//, '')
  .replace(/\/+$/g, '');
const outDir = base === '/' ? `./${distRoot}` : `./${distRoot}${base}`;
const withBase = (value) => `${base}${String(value).replace(/^\/+/, '')}`;

export default defineConfig({
  site,
  base,
  outDir,
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    starlight({
      title: 'Crimson Desert Guide',
      description:
        'An evidence-backed, patch-aware Crimson Desert guide, database and expedition companion.',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Crimson Desert Guide crest',
      },
      favicon: '/favicon.svg',
      customCss: [
        './src/styles/custom.css',
        './src/styles/home-overrides.css',
        './src/styles/site-theme.css',
        './src/styles/light-mode.css',
        './src/styles/mobile-text.css',
      ],
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Footer: './src/components/GuideFooter.astro',
        SocialIcons: './src/components/GuideSocialIcons.astro',
        Sidebar: './src/components/GuideSidebar.astro',
      },
      lastUpdated: true,
      editLink: {
        baseUrl: 'https://github.com/Conroy1988/Crimson-Desert-Guide/edit/main/',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Conroy1988/Crimson-Desert-Guide',
        },
      ],
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#110d0a' },
        },
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: withBase('site.webmanifest') },
        },
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9109373076539277',
            crossorigin: 'anonymous',
          },
        },
      ],
      sidebar: [
        {
          label: 'Expedition Command',
          items: [{ label: 'Command Centre', slug: 'command-centre' }],
        },
        {
          label: 'Live updates',
          items: [
            { label: 'Update Log', slug: 'update-log' },
            { label: 'Patch Notes', slug: 'patch-notes' },
          ],
        },
        { label: 'Start Here', items: [{ autogenerate: { directory: 'start-here' } }] },
        { label: 'Core Systems', items: [{ autogenerate: { directory: 'systems' } }] },
        { label: 'Pywel Atlas', items: [{ autogenerate: { directory: 'atlas' } }] },
        { label: 'World Compendium', items: [{ autogenerate: { directory: 'world' } }] },
        { label: 'Mounts & Creatures', items: [{ autogenerate: { directory: 'mounts' } }] },
        { label: 'Content Database', items: [{ autogenerate: { directory: 'database' } }] },
        { label: 'Completion', items: [{ autogenerate: { directory: 'completion' } }] },
        { label: 'Technical', items: [{ autogenerate: { directory: 'technical' } }] },
        { label: 'Guide Standards', items: [{ autogenerate: { directory: 'standards' } }] },
      ],
    }),
  ],
});

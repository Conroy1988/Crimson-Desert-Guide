import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://crimson-desert-guide.dannyconroy.workers.dev',
  trailingSlash: 'always',
  build: {
    // The guide must remain fully styled even when a browser or edge cache
    // fails to retrieve a hashed CSS asset. This is intentionally set to
    // always for the static, relatively small guide surface.
    inlineStylesheets: 'always',
  },
  integrations: [
    starlight({
      title: 'Crimson Desert Guide',
      description:
        'An evidence-backed, patch-aware Crimson Desert guide, database and completion companion.',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Crimson Desert Guide crest',
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css', './src/styles/home-overrides.css'],
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Footer: './src/components/GuideFooter.astro',
      },
      lastUpdated: true,
      editLink: {
        baseUrl:
          'https://github.com/Conroy1988/Crimson-Desert-Guide/edit/main/',
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
          attrs: {
            name: 'theme-color',
            content: '#110d0a',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'manifest',
            href: '/site.webmanifest',
          },
        },
      ],
      sidebar: [
        {
          label: 'Live updates',
          items: [
            { label: 'Update Log', slug: 'update-log' },
            { label: 'Patch Notes', slug: 'patch-notes' },
          ],
        },
        {
          label: 'Start Here',
          items: [{ autogenerate: { directory: 'start-here' } }],
        },
        {
          label: 'Core Systems',
          items: [{ autogenerate: { directory: 'systems' } }],
        },
        {
          label: 'World Compendium',
          items: [{ autogenerate: { directory: 'world' } }],
        },
        {
          label: 'Mounts & Creatures',
          items: [{ autogenerate: { directory: 'mounts' } }],
        },
        {
          label: 'Completion',
          items: [{ autogenerate: { directory: 'completion' } }],
        },
        {
          label: 'Technical',
          items: [{ autogenerate: { directory: 'technical' } }],
        },
        {
          label: 'Guide Standards',
          items: [{ autogenerate: { directory: 'standards' } }],
        },
      ],
    }),
  ],
});

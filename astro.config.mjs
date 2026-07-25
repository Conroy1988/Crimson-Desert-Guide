import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://crimson-desert-guide.pages.dev',
  trailingSlash: 'always',
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
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      editLink: {
        baseUrl:
          'https://github.com/Conroy1988/Crimson-Desert-Guide/edit/main/',
      },
      social: {
        github: 'https://github.com/Conroy1988/Crimson-Desert-Guide',
      },
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#110d0a',
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
          autogenerate: { directory: 'start-here' },
        },
        {
          label: 'Core Systems',
          autogenerate: { directory: 'systems' },
        },
        {
          label: 'World Compendium',
          autogenerate: { directory: 'world' },
        },
        {
          label: 'Mounts & Creatures',
          autogenerate: { directory: 'mounts' },
        },
        {
          label: 'Completion',
          autogenerate: { directory: 'completion' },
        },
        {
          label: 'Technical',
          autogenerate: { directory: 'technical' },
        },
        {
          label: 'Guide Standards',
          autogenerate: { directory: 'standards' },
        },
      ],
    }),
  ],
});

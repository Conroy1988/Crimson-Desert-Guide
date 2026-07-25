import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        currentPatch: z.string().regex(/^\d+\.\d+\.\d+$/),
        lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        evidence: z.enum(['official', 'verified', 'community', 'provisional']),
        spoilerLevel: z.enum(['none', 'minor', 'full']),
        patchStatus: z
          .enum(['current', 'review-required', 'historical'])
          .default('current'),
      }),
    }),
  }),
};

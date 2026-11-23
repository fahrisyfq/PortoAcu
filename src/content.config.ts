import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
      coverAlt: z.string(),
      tags: z.array(z.string()).min(1),
      year: z.number().int(),
      demoUrl: z.url().optional(),
      repoUrl: z.url().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      order: z.number().int().default(0),
    }),
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/*.json' }),
  schema: z.object({
    type: z.enum(['education', 'work', 'organization', 'certification']),
    role: z.string(),
    organization: z.string(),
    location: z.string().optional(),
    period: z.string(),
    start: z.string(),
    end: z.string().optional(),
    current: z.boolean().default(false),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    order: z.number().int().default(0),
  }),
});

export const collections = { projects, experience };

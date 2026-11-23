// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Replace `site` with your production URL before deploying.
// For GitHub Pages project sites, also set `base: '/repository-name'`.
export default defineConfig({
  site: 'https://portofolio.example.com',
  output: 'static',
  integrations: [react(), sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
  },
});

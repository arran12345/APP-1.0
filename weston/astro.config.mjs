import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://weston.co.uk',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});

import 'dotenv/config';
import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE ?? 'https://podcast.sova.sh',

  compressHTML: true,

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});

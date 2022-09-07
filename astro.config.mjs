import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import prefetch from '@astrojs/prefetch';
import image from '@astrojs/image';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://sova.dev',
  integrations: [react(), tailwind(), sitemap(), prefetch(), mdx(), image()],
});

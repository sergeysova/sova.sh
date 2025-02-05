import 'dotenv/config';
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE,

  markdown: {
    remarkPlugins: [remarkToc, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    syntaxHighlight: 'prism',
  },

  integrations: [react(), sitemap(), mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});

import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import prefetch from '@astrojs/prefetch';
import image from '@astrojs/image';

import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePresetMinify from 'rehype-preset-minify';

// https://astro.build/config
export default defineConfig({
  site: 'https://sova.dev',
  markdown: {
    remarkPlugins: [remarkToc, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, ...rehypePresetMinify.plugins],
    syntaxHighlight: 'prism',
  },
  integrations: [
    react(),
    tailwind(),
    sitemap(),
    prefetch(),
    mdx({
      drafts: true,
    }),
    image(),
  ],
});

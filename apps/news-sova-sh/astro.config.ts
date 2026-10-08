import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import robotsTxt from "astro-robots-txt";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === "development"
      ? "http://localhost:4321"
      : "https://news.sova.sh",

  output: "static",
  base: "/",

  build: {
    format: "directory",
    assets: "assets",
  },

  markdown: {
    syntaxHighlight: "prism",
    remarkPlugins: [],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { rel: ["nofollow", "noopener", "noreferrer"], target: ["_blank"] },
      ],
    ],
  },

  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
    }),
    robotsTxt(),
    react(),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";


// https://astro.build/config
export default defineConfig({
  site: "https://mimmyjau.github.io",
  integrations: [mdx()],
  markdown: {

    // Source 1: https://blog.alexafazio.dev/blog/render-latex-in-astro/
    // Source 2: https://r3zz.io/posts/astro-blog-latex/
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],

    // Source: https://github.com/withastro/astro/pull/4138
    remarkRehype: {
      footnoteLabel: "footnotes",
    },

    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: "material-theme-palenight",
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    }
  },
});

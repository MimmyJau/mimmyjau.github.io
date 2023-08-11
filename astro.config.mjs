import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://mimmyjau.github.io",
  markdown: {
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
    },
  },
});

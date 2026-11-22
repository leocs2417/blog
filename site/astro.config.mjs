// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://leocs2417.github.io',
  base: '/blog',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    smartypants: false,
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});

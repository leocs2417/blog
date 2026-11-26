// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'http://82.157.148.18:8089',
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

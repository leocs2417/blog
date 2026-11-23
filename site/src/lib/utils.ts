import type { CollectionEntry } from 'astro:content';

/** Chinese tag -> ascii slug (for URL), bidirectional map */
export const TAG_SLUGS: Record<string, string> = {
  'JS': 'js',
  'Vue': 'vue',
  'React': 'react',
  '浏览器': 'browser',
  '性能优化': 'performance',
  'ES6': 'es6',
  '源码': 'source-code',
  'Node.js': 'nodejs',
  'Linux': 'linux',
  'IDE': 'ide',
  '包管理': 'package-mgmt',
  'SSH': 'ssh',
  'Mysql': 'mysql',
  'AI': 'ai',
  'Agent': 'agent',
  'Evaluation': 'evaluation',
  'Optimization': 'optimization',
  'Engineering': 'engineering',
  'Best Practices': 'best-practices',
};

const SLUG_TO_TAG: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_SLUGS).map(([tag, slug]) => [slug, tag])
);

export function tagSlug(tag: string): string {
  return TAG_SLUGS[tag] ?? encodeURIComponent(tag);
}

export function tagFromSlug(slug: string): string | undefined {
  return SLUG_TO_TAG[slug];
}

export function sortPosts(posts: CollectionEntry<'posts'>[]) {
  return [...posts].sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}

export const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/';

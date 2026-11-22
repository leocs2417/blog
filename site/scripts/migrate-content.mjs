// Hexo _posts -> Astro content collections
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/leo/Desktop/blog';
const SRC = path.join(ROOT, 'source/_posts');
const DEST = path.join(ROOT, 'site/src/content/posts');
const PUB = path.join(ROOT, 'site/public/assets/image');

const SLUGS = {
  'ES6变量声明&不同For循环中const的区别.md': 'const-in-for-loops',
  'Object.create()和{}的区别.md': 'object-create-vs-object-literal',
  'React Virtual DOM.md': 'react-virtual-dom',
  'SSH设置无密码和使用别名登录Linux服务器.md': 'ssh-passwordless-login',
  'Vue中的nextTick的实现原理.md': 'vue-nexttick-implementation',
  'Vue中，v-if和v-show的区别.md': 'vue-v-if-vs-v-show',
  'Vue中，计算属性vs方法vs侦听属性.md': 'vue-computed-vs-methods-vs-watch',
  'exports和module.exports的区别.md': 'exports-vs-module-exports',
  'package.json中dependencies和devDependencies的区别.md': 'package-json-deps-vs-devdeps',
  'value below was evaluated just now.md': 'console-log-evaluated-just-now',
  '浏览器的工作原理及JS的运行机制.md': 'browser-working-principles',
  '防抖与节流的简单实现.md': 'debounce-and-throttle',
  '如何优化Web移动端的加载速度.md': 'optimize-mobile-loading',
  '如何高性能渲染长列表.md': 'high-performance-long-list',
  '新版Sublime Text3的Package Control打不开的问题.md': 'sublime-package-control-fix',
  '使用Node.js Sequelize操作CentOS远程服务器的Mysql.md': 'node-sequelize-remote-mysql',
  '单点登录(SSO).md': 'single-sign-on-sso',
};

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('no frontmatter');
  const [, fm, body] = m;
  const get = (key) => {
    const lines = fm.split(/\r?\n/);
    let out = null; let capture = false;
    for (const line of lines) {
      if (/^\s*- /.test(line) && capture) { (out ??= []).push(line.replace(/^\s*- /, '').trim()); continue; }
      capture = false;
      const km = line.match(new RegExp(`^${key}:\\s*(.*)$`));
      if (km) {
        const v = km[1].trim().replace(/^['"]|['"]$/g, '');
        if (v) out = v; else { out = null; capture = true; }
      }
    }
    return out;
  };
  return { title: get('title'), date: get('date'), tags: get('tags') || [], categories: get('categories') || [], body };
}

// strip markdown for description generation
function toText(md) {
  return md.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#>*`_\-\|]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });
fs.rmSync(PUB, { recursive: true, force: true });
fs.mkdirSync(PUB, { recursive: true });
fs.cpSync(path.join(ROOT, 'source/assets/image'), PUB, { recursive: true });

const report = [];
for (const [file, slug] of Object.entries(SLUGS)) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const { title, date, tags, categories, body } = parseFrontmatter(raw);
  // title fixes
  const cleanTitle = title.replace(/\.md$/i, '').trim();
  // body transforms
  let md = body
    .replace(/<!-- more -->/g, '')
    .replace(/!\['([^']*)'\]/g, '![$1]')  // strip quoted alt
    .replace(/!\[[^\]]*\]\(https:\/\/github\.com\/Saturday24\/notes\/blob\/master\/image\/([^)?]+)(\?raw=true)?\)/g,
             (_, img) => `![](/blog/assets/image/${img})`)
    // escape raw HTML in prose (outside fenced code) so it displays as text, not real elements
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((seg, i) => i % 2 === 1 ? seg : seg
      .replace(/\\([<>])/g, '$1')
      .replace(/<(?=[a-zA-Z\/?!])/g, '&lt;'))
    .join('');
  // description
  const desc = toText(md).slice(0, 120);
  const out = `---
title: ${JSON.stringify(cleanTitle)}
slug: ${JSON.stringify(slug)}
date: ${JSON.stringify(date)}
tags: [${tags.map(t => JSON.stringify(t)).join(', ')}]
categories: [${categories.map(t => JSON.stringify(t)).join(', ')}]
description: ${JSON.stringify(desc)}
---

${md.trim()}\n`;
  fs.writeFileSync(path.join(DEST, `${slug}.md`), out);
  report.push({ file, slug, title: cleanTitle, tags, imgs: (md.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length, code: (md.match(/```/g) || []).length / 2 });
}
fs.writeFileSync(path.join(ROOT, 'site/scripts/migration-report.json'), JSON.stringify(report, null, 2));
console.log('migrated', report.length, 'posts');
report.forEach(r => console.log(`  ${r.slug}  imgs=${r.imgs} code=${r.code} tags=${r.tags.join('/')}`));

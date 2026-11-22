// Generate meta-refresh redirect pages for legacy Hexo URLs + redirect-map.json
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/leo/Desktop/blog';
const DIST = path.join(ROOT, 'site/dist');
const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/scripts/migration-report.json'), 'utf8'));

function oldDir(file) {
  // frontmatter date from migrated file
  const slug = report.find((r) => r.file === file).slug;
  const md = fs.readFileSync(path.join(ROOT, 'site/src/content/posts', `${slug}.md`), 'utf8');
  const date = md.match(/^date:\s*"([^"]+)"/m)?.[1];
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}/${file.replace(/\.md$/, '')}`;
}

const redirects = [];
for (const { file, slug } of report) {
  redirects.push({ from: `/blog/${oldDir(file)}/`, to: `/blog/posts/${slug}/` });
}

const template = (to) => `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${to}">
<link rel="canonical" href="${to}">
<title>重定向中…</title>
<script>location.replace('${to}');</script>
</head><body>
<p>文章已迁移，正在跳转到 <a href="${to}">${to}</a> …</p>
</body></html>
`;

for (const { from, to } of redirects) {
  const rel = from.replace(/^\/blog\//, '');
  const dir = path.join(DIST, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), template(to));
}
fs.writeFileSync(path.join(DIST, 'redirect-map.json'), JSON.stringify(redirects, null, 2));
console.log('generated', redirects.length, 'redirect pages');
redirects.forEach((r) => console.log(' ', r.from, '->', r.to));

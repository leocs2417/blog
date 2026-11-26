// Generate meta-refresh redirect pages for legacy Hexo URLs + redirect-map.json
import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(import.meta.dirname, '..');
const DIST = path.join(SITE, 'dist');
const report = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'migration-report.json'), 'utf8'));

function oldDir(file, slug) {
  const md = fs.readFileSync(path.join(SITE, 'src/content/posts', `${slug}.md`), 'utf8');
  // Preserve the calendar date in the original permalink across build time zones.
  const date = md.match(/^date:[ \t]*"(\d{4}-\d{2}-\d{2})(?=[" T])/m)?.[1];
  if (!date) throw new Error(`Missing or invalid permalink date in ${slug}.md`);
  return `${date.replaceAll('-', '/')}/${file.replace(/\.md$/, '')}`;
}

const redirects = [];
for (const { file, slug } of report) {
  redirects.push({ from: `/${oldDir(file, slug)}/`, to: `/posts/${slug}/` });
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
  const rel = from.slice(1);
  const dir = path.join(DIST, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), template(to));
}
fs.writeFileSync(path.join(DIST, 'redirect-map.json'), JSON.stringify(redirects, null, 2));
console.log('generated', redirects.length, 'redirect pages');
redirects.forEach((r) => console.log(' ', r.from, '->', r.to));

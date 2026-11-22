// Full test suite per docs/02-test-plan.md
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = '/Users/leo/Desktop/blog';
const SITE = path.join(ROOT, 'site');
const DIST = path.join(SITE, 'dist');
const OUT = path.join(SITE, 'test-results');
const SRC_POSTS = path.join(ROOT, 'source/_posts');
const report = JSON.parse(fs.readFileSync(path.join(SITE, 'scripts/migration-report.json'), 'utf8'));

const results = [];
function check(id, ok, detail = '') {
  results.push({ id, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${id}${detail ? ' — ' + detail : ''}`);
}

// ---------- helpers ----------
function readHtml(p) { return fs.readFileSync(p, 'utf8'); }
function* walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) yield* walk(fp); else yield fp;
  }
}
function stripTags(html) { return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); }
function decodeEntities(s) {
  return s.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
function normMd(md) {
  return md
    .replace(/\\([\\`*_{}\[\]()#+\-.!<>])/g, '$1')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ').trim();
}


// ---------- T-B: build outputs ----------
check('T-B02 pages exist', report.every(r => fs.existsSync(path.join(DIST, `posts/${r.slug}/index.html`))),
  `${report.length} posts`);
check('T-B06 pagefind index', fs.existsSync(path.join(DIST, 'pagefind/pagefind-entry.json')));

// ---------- T-C: content per post ----------
for (const { file, slug } of report) {
  const raw = fs.readFileSync(path.join(SRC_POSTS, file), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const [, , srcBody] = fm;
  const srcTitle = raw.match(/^title:\s*['"](.*)['"]\s*$/m)[1].replace(/\.md$/i, '').trim();
  const srcH2 = (srcBody.match(/^\s*(?:>\s*)?## /gm) || []).length;
  const srcPre = (srcBody.match(/^\s*```\s*$/gm) || []).length / 2;
  const srcText = stripTags(srcBody.replace(/```[\s\S]*?```/g, ' ')).length;

  const html = readHtml(path.join(DIST, `posts/${slug}/index.html`));
  const h1 = decodeEntities(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').trim();
  check(`T-C01 ${slug} title`, h1 === srcTitle, h1);
  const contentHtml = html.match(/<div class="content">([\s\S]*?)<div class="post-footer">/)?.[1] ?? '';
  const h2Count = (contentHtml.match(/<h2/g) || []).length;
  check(`T-C02 ${slug} h2 count`, h2Count === srcH2, `rendered=${h2Count} src=${srcH2}`);
  const preCount = (contentHtml.match(/<pre/g) || []).length;
    const backtickLeak = contentHtml.includes('```');
  check(`T-C03 ${slug} no fence leak`, !backtickLeak);
  check(`T-C03 ${slug} html escapes sane`, !/&amp;(lt|gt|amp);/.test(contentHtml), '');
  check(`T-C03 ${slug} pre covers fences`, preCount >= srcPre, `pre=${preCount} fences=${srcPre}`);
  const renderedNorm = decodeEntities(stripTags(contentHtml)).replace(/\s+/g, ' ').trim();
  const flat = (x) => x.replace(/\s+/g, '').replace(/\\\*/g, '*').replace(/-/g, '');
  const renderedFlat = flat(renderedNorm).replace(/\*\*/g, '').replace(/\\/g, '');
  const segments = srcBody.split(/```[\s\S]*?```|<!--[\s\S]*?-->|!\[[^\]]*\]\([^)]*\)/g);
  const sentences = [];
  for (const seg of segments) {
    const n = normMd(seg);
    for (const x of n.split('。')) { const t = x.trim(); if (t.length >= 15) sentences.push(t); }
  }
  const missing = sentences.filter(x => !renderedFlat.includes(flat(x)));
  const coverage = sentences.length ? 1 - missing.length / sentences.length : 1;
  check(`T-C08 ${slug} text coverage`, coverage >= 0.9, `cov=${(coverage*100).toFixed(0)}% missing=${missing.length} first=${(missing[0]||'').slice(0,50)}`);
  const header = html.match(/<h1[\s\S]*?<\/div>/)?.[0] ?? '';
  check(`T-C09 ${slug} no date in header`, !/\d{4}-\d{2}-\d{2}/.test(header));
  // images
  const badImg = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)]
    .map(m => m[1])
    .filter(src => src.startsWith('/') && !fs.existsSync(path.join(DIST, decodeURIComponent(src.replace(/^\/blog\/?/, '')))));
  check(`T-B05 ${slug} images`, badImg.length === 0, badImg.join(','));
}

// ---------- T-B07: redirect pages ----------
const redirects = JSON.parse(fs.readFileSync(path.join(DIST, 'redirect-map.json'), 'utf8'));
const redirectOk = redirects.every(r => {
  const rel = r.from.replace(/^\/blog\//, '');
  const f = path.join(DIST, rel, 'index.html');
  return fs.existsSync(f) && readHtml(f).includes(`url=${r.to}`);
});
check('T-B07 redirect pages', redirectOk && redirects.length === 17, `${redirects.length} pages`);

// ---------- T-B04: internal links ----------
{
  let bad = [];
  for (const f of walk(DIST)) {
    if (!f.endsWith('.html')) continue;
    const html = readHtml(f);
    for (const m of html.matchAll(/(?:href|src)="(\/blog\/[^"#?]*)["?]/g)) {
      let p = decodeURIComponent(m[1]).replace(/^\/blog\/?/, '');
      if (p === '' || p.endsWith('/')) p += 'index.html';
      else if (!path.extname(p)) p += '/index.html';
      if (!fs.existsSync(path.join(DIST, p))) bad.push(m[1] + ' (in ' + path.relative(DIST, f) + ')');
    }
  }
  check('T-B04 internal links', bad.length === 0, bad.slice(0, 5).join('; '));
}

// ---------- Browser tests ----------
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const B = 'http://localhost:4321/blog';

// start preview server
const { spawn } = await import('node:child_process');
const server = spawn('npx', ['astro', 'preview', '--port', '4321'], { cwd: SITE, stdio: 'pipe' });
await new Promise((res) => {
  const t = setInterval(() => {
    http.get(B + '/', (r) => { clearInterval(t); res(); }).on('error', () => {});
  }, 300);
  setTimeout(() => { clearInterval(t); res(); }, 10000);
});

try {
  // overflow checks on key pages + every post
  const pagesToCheck = [
    ['index', '/'], ['tags', '/tags/'], ['tags-vue', '/tags/vue/'],
    ['about', '/about/'], ['404', '/does-not-exist/'],
    ...report.map(r => [`post-${r.slug}`, `/posts/${r.slug}/`]),
  ];
  fs.mkdirSync(path.join(OUT, 'posts'), { recursive: true });
  for (const [name, url] of pagesToCheck) {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(B + url, { waitUntil: 'networkidle0', timeout: 20000 });
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
      const bad = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.closest('pre')) return;
        const b = el.getBoundingClientRect();
        if (b.right > vw + 1 || b.left < -1) bad.push(el.tagName + '.' + String(el.className).slice(0, 30));
      });
      return { vw, sw, bad };
    });
    check(`T-L01 ${name} @375`, r.sw <= r.vw && r.bad.length === 0, r.bad.slice(0, 3).join(','));
    if (name.startsWith('post-')) {
      const slug = name.slice(5);
      await page.screenshot({ path: path.join(OUT, 'posts', `${slug}-mobile.png`), fullPage: true });
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
      await page.goto(B + url, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(OUT, 'posts', `${slug}-desktop.png`), fullPage: true });
      check(`T-C09 ${slug} screenshots`, true);
    }
    await page.close();
  }

  // footer sticky on 404
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(B + '/does-not-exist/', { waitUntil: 'networkidle0' });
    const ok = await page.evaluate(() => {
      const f = document.querySelector('footer').getBoundingClientRect();
      return Math.abs(f.bottom - window.innerHeight) < 2;
    });
    check('T-P07 footer sticky', ok);
    await page.close();
  }

  // nav: no archive
  {
    const page = await browser.newPage();
    await page.goto(B + '/', { waitUntil: 'networkidle0' });
    const html = await page.content();
    check('T-P08 no archive in nav', !html.includes('归档'));
    await page.close();
  }

  // search functional
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(B + '/', { waitUntil: 'networkidle0' });
    await page.click('[data-search-open]');
    await page.type('#search-input', '防抖');
    await new Promise(r => setTimeout(r, 1200));
    const text = await page.evaluate(() => document.getElementById('search-results').textContent);
    check('T-P05 search results', text.includes('防抖'), text.slice(0, 60));
    await page.screenshot({ path: path.join(OUT, 'search-modal.png') });
    await page.close();
  }

  // tag filter page + pill active
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(B + '/tags/vue/', { waitUntil: 'networkidle0' });
    const r = await page.evaluate(() => {
      const items = document.querySelectorAll('.post').length;
      const active = [...document.querySelectorAll('.tag-cloud .chip')].find(c => c.textContent.includes('Vue'));
      const highlighted = active?.getAttribute('style')?.includes('var(--accent)');
      return { items, highlighted };
    });
    const expectedVue = report.filter(r => ['vue-nexttick-implementation','vue-v-if-vs-v-show','vue-computed-vs-methods-vs-watch'].includes(r.slug)).length;
    check('T-P03 tag filter page', r.items === expectedVue && r.highlighted, `posts=${r.items}/${expectedVue} active=${r.highlighted}`);
    await page.close();
  }

  // old URL redirect functional
  {
    const page = await browser.newPage();
    const url = B + encodeURI('/2019/11/11/Vue中的nextTick的实现原理/');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
    const finalUrl = page.url();
    check('T-P09 legacy redirect', finalUrl.includes('/posts/vue-nexttick-implementation/'), finalUrl);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}

// ---------- report ----------
const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2));
const md = ['# 测试报告', '', `- 通过：${results.length - failed.length}/${results.length}`, '', failed.length ? '## 失败项' : '## 全部通过 ✅'];
for (const f of failed) md.push(`- ❌ ${f.id} — ${f.detail}`);
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n'));
console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===`);
process.exit(failed.length ? 1 : 0);

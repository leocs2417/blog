import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new'
});
const base = 'http://localhost:4321/blog';
const pages = [
  ['index', `${base}/`],
  ['post', `${base}/posts/vue-nexttick-implementation/`],
  ['tags', `${base}/tags/`],
  ['tags-vue', `${base}/tags/vue/`],
  ['about', `${base}/about/`],
  ['404', `${base}/xxx-not-exist/`],
];
for (const [name, url] of pages) {
  for (const [w, h, tag, mobile] of [[1440, 900, 'desktop', false], [375, 800, 'mobile', true]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `/Users/leo/Desktop/blog/site/test-results/site-${name}-${tag}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log('shots done');

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4185/';
const root = new URL(BASE);
const out = path.resolve('artifacts');
await fs.mkdir(out, { recursive: true });

const results = [];
const failures = [];
const checks = [];
const record = (name, pass, details = '', evidence = '') => {
  const row = { name, status: pass ? 'passed' : 'failed', details };
  if (evidence) row.evidence = evidence;
  checks.push(row);
  if (!pass) failures.push(row);
};
const expect = (name, condition, details, evidence = '') => record(name, Boolean(condition), details, evidence);

const pages = [
  { name: 'showcase', url: './', view: 'showcase' },
  { name: 'tideland home', url: 'tideland/index.html', view: 'tideland' },
  { name: 'tideland journal', url: 'tideland/journal.html', view: 'tideland' },
  { name: 'tideland story', url: 'tideland/story.html?article=dune', view: 'tideland' },
  { name: 'tideland support', url: 'tideland/support.html', view: 'tideland' },
  { name: 'form earth home', url: 'form-earth/index.html', view: 'form' },
  { name: 'form earth collection', url: 'form-earth/collection.html', view: 'form' },
  { name: 'form earth object', url: 'form-earth/object.html?item=cobalt-vase', view: 'form' },
  { name: 'form earth bag', url: 'form-earth/bag.html', view: 'form' },
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: 'no-preference' });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(`${msg.location().url}: ${msg.text()}`); });
page.on('pageerror', error => pageErrors.push(String(error)));

async function goto(url) {
  await page.goto(new URL(url, BASE).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(80);
}

for (const spec of pages) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    consoleErrors.length = 0;
    pageErrors.length = 0;
    await goto(spec.url);
    const label = `${spec.name} @ ${viewport.name}`;
    const layout = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      images: [...document.images].map(img => ({ src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 })),
    }));
    expect(`${label}: no horizontal overflow`, layout.width <= layout.viewport + 1, `scrollWidth ${layout.width} vs viewport ${layout.viewport}`);
    expect(`${label}: local images load`, layout.images.every(img => img.loaded), layout.images.filter(img => !img.loaded).map(img => img.src).join(', '));
    expect(`${label}: no runtime errors`, consoleErrors.length === 0 && pageErrors.length === 0, [...consoleErrors, ...pageErrors].join(' | '));
    if (viewport.name === 'mobile' && spec.view !== 'showcase') {
      await page.screenshot({ path: path.join(out, `${spec.name.replaceAll(' ', '-')}-mobile.png`), fullPage: true });
    }
  }
}

// Crawl local links and resource references through the browser's same-origin request context.
await goto('./');
const links = await page.evaluate(() => [...document.querySelectorAll('a[href], link[href], script[src], img[src]')].map(el => el.href || el.src).filter(Boolean));
for (const href of [...new Set(links)]) {
  const u = new URL(href, BASE);
  if (u.origin !== root.origin || u.protocol !== 'http:' && u.protocol !== 'https:') continue;
  const response = await context.request.get(u.href);
  expect(`local reference ${u.pathname}${u.search}`, response.ok(), `HTTP ${response.status()}`);
}

// Tideland bilingual navigation, journal filters/search, all article variants, and support form.
await page.setViewportSize(viewports[0]);
await goto('tideland/index.html');
await page.locator('[data-lang="pl"]').click();
expect('Tideland language switch updates html lang', await page.locator('html').getAttribute('lang') === 'pl');
expect('Tideland language switch updates home title', (await page.locator('h1').innerText()).includes('Zostawmy'));
await page.locator('[data-lang="en"]').click();
expect('Tideland switches back to English', (await page.locator('h1').innerText()).includes('Keep the tide open'));

await goto('tideland/journal.html');
await page.locator('button[data-category="species"]').click();
expect('Journal category filter leaves one species card', await page.locator('.archive-card:not([hidden])').count() === 1);
expect('Journal category result count updates', (await page.locator('#result-count').innerText()).includes('1'));
await page.locator('#search').fill('zzzz-no-such-note');
expect('Journal text filter reaches zero results', await page.locator('.archive-card:not([hidden])').count() === 0);
expect('Journal zero-results state is visible', await page.locator('#empty-state').evaluate(el => el.classList.contains('is-visible')));
for (const article of [
  ['dune', 'How a living dune holds its ground'],
  ['eelgrass', 'A shallow-water map for eelgrass'],
  ['commons', 'Who gets to shape the beach?'],
  ['marsh', 'Making space for marsh water.'],
]) {
  await goto(`tideland/story.html?article=${article[0]}`);
  expect(`Story variant ${article[0]} matches title`, (await page.locator('h1').innerText()).includes(article[1]), await page.title());
}

await goto('tideland/support.html');
const posts = [];
page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
await page.locator('#email').fill('invalid-email');
await page.locator('#support-form').evaluate(form => form.requestSubmit());
expect('Support rejects invalid email', await page.locator('#form-error').isVisible() && (await page.locator('#form-success').isVisible()) === false);
await page.locator('#email').fill('qa@example.com');
await page.locator('input[value="monthly"]').check();
await page.locator('#support-form').evaluate(form => form.requestSubmit());
expect('Support accepts valid monthly submission once', await page.locator('#form-success').isVisible());
expect('Support does not issue external POST', posts.length === 0, posts.join(', '));

// Form/Earth collection, four object variants, add-to-bag and bag lifecycle.
await goto('form-earth/collection.html');
await page.locator('[data-filter="vessel"]').click();
expect('Collection vessel filter leaves one product', await page.locator('.product-card:not([hidden])').count() === 1);
await page.locator('[data-filter="all"]').click();
await page.locator('[data-sort]').selectOption('low');
const lowPrices = await page.locator('.product-card').evaluateAll(cards => cards.map(c => Number(c.dataset.price)));
expect('Collection low-to-high sort is observable', lowPrices.join(',') === [...lowPrices].sort((a, b) => a - b).join(','), lowPrices.join(','));
await page.locator('[data-sort]').selectOption('high');
const highPrices = await page.locator('.product-card').evaluateAll(cards => cards.map(c => Number(c.dataset.price)));
expect('Collection high-to-low sort is observable', highPrices.join(',') === [...highPrices].sort((a, b) => b - a).join(','), highPrices.join(','));

const expectedProducts = {
  'cobalt-vase': ['Cobalt Vessel 04', '€280', 'Stoneware, cobalt glaze'],
  'slab-bowl': ['Slab Bowl 02', '€145', 'Speckled stoneware'],
  'ash-cup': ['Ash Cup 01', '€68', 'Stoneware, cobalt glaze'],
  'signal-plate': ['Signal Plate 03', '€96', 'Speckled white stoneware'],
};
for (const [id, [name, price, material]] of Object.entries(expectedProducts)) {
  await goto(`form-earth/object.html?item=${id}`);
  const text = await page.locator('main').innerText();
  expect(`Product route ${id} title matches`, text.includes(name));
  expect(`Product route ${id} price matches`, text.includes(price));
  expect(`Product route ${id} material matches`, text.includes(material));
}

await goto('form-earth/object.html?item=cobalt-vase');
await page.locator('[data-variant]').nth(1).click();
await page.locator('[data-qty]').fill('2');
await page.locator('[data-add]').click();
expect('Add variant quantity updates header count', await page.locator('[data-bag-count]').first().innerText() === '2');
await page.reload({ waitUntil: 'networkidle' });
expect('Bag count persists after reload', await page.locator('[data-bag-count]').first().innerText() === '2');
await goto('form-earth/bag.html');
expect('Bag persists product and selected variant', (await page.locator('[data-bag-items]').innerText()).includes('Chalk interior') && (await page.locator('[data-bag-items]').innerText()).includes('Cobalt Vessel 04'));
const qty = page.locator('[data-bag-items] input[type="number"]').first();
await qty.fill('3');
await qty.dispatchEvent('change');
expect('Bag quantity update changes total', (await page.locator('[data-total]').innerText()) === '€840');
await page.locator('.remove').click();
expect('Bag remove returns to empty state', await page.locator('[data-empty]').isVisible() && await page.locator('[data-summary]').isHidden());

// Re-add and verify local checkout confirmation.
await goto('form-earth/object.html?item=ash-cup');
await page.locator('[data-qty]').fill('1');
await page.locator('[data-add]').click();
await goto('form-earth/bag.html');
await page.locator('[data-checkout]').click();
expect('Local checkout confirmation appears', await page.locator('[data-notice]').evaluate(el => el.classList.contains('show')) && (await page.locator('[data-checkout]').innerText()).toLowerCase().includes('complete'));

// Corrupt storage is treated as malformed local data and must not crash the bag page.
const corrupt = await browser.newContext();
const corruptPage = await corrupt.newPage();
await corruptPage.addInitScript(() => localStorage.setItem('form-earth-bag', JSON.stringify([
  { id: 'unknown-id', variant: '<img src=x onerror=alert(1)>', qty: 999 },
  { id: 'ash-cup', variant: 'Unknown finish', qty: 'bad' },
  { id: 'slab-bowl', variant: 'Clear glaze', qty: -4 },
])));
const corruptErrors = [];
corruptPage.on('pageerror', e => corruptErrors.push(String(e)));
await corruptPage.goto(new URL('form-earth/bag.html', BASE).href, { waitUntil: 'networkidle' });
expect('Corrupt bag storage does not crash', corruptErrors.length === 0 && await corruptPage.locator('body').isVisible(), corruptErrors.join(' | '));
expect('Corrupt bag storage clamps and allowlists values', await corruptPage.locator('[data-bag-items] .bag-item').count() === 2 && !(await corruptPage.locator('[data-bag-items]').innerText()).includes('<img'));
await corrupt.close();

// Keyboard focus and reduced-motion smoke checks.
await page.emulateMedia({ reducedMotion: 'reduce' });
await goto('tideland/journal.html');
await page.keyboard.press('Tab');
expect('Keyboard focus reaches skip link', await page.evaluate(() => document.activeElement?.classList.contains('skip-link')));
await page.keyboard.press('Tab');
expect('Keyboard focus advances to interactive control', await page.evaluate(() => ['A', 'INPUT', 'BUTTON'].includes(document.activeElement?.tagName)));

// WordPress launcher smoke: validate the basic UI before any runtime launch.
await goto('wordpress.html');
expect('WordPress launcher shows launch control', await page.locator('#start').isVisible());
expect('WordPress launcher exposes browser runtime status', (await page.locator('#status').innerText()).includes('runs in your browser'));
expect('WordPress launcher keeps editor controls disabled pre-launch', await page.locator('#website').isDisabled() && await page.locator('#editor').isDisabled());

await browser.close();
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  pagesChecked: pages.map(p => p.url),
  viewports: viewports,
  summary: { total: checks.length, passed: checks.filter(x => x.status === 'passed').length, failed: failures.length },
  checks,
  failures,
  note: 'Functional browser QA only. No UI source files were changed. WordPress runtime launch was limited to pre-launch UI smoke validation.',
};
await fs.writeFile(path.join(out, 'qa-results.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary));
if (failures.length) process.exitCode = 1;

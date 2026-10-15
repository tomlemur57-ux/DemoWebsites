import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(12000);
const checks = [];
const errors = [];
page.on('pageerror', error => errors.push({ message: error.message, stack: error.stack || '' }));
const check = (name, pass) => { checks.push({ name, pass }); console.log(JSON.stringify({ name, pass })); if (!pass) throw new Error(name); };
await fs.mkdir('artifacts', { recursive: true });
try {
  await page.goto('http://127.0.0.1:4185/wordpress.html?site=form-earth');
  await page.locator('#start').click();
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('is running.'), { timeout: 120000 });
  const frame = page.frames().find(frame => frame.url().includes('/scope:'));
  check('Real WordPress commerce home renders', (await frame.locator('h1').innerText()).includes('objects.'));
  await frame.locator('.nav a[href*="form-earth-collection"]').click();
  await frame.locator('a[href*="item=slab-bowl"]').first().click();
  await frame.waitForFunction(() => document.querySelector('.detail-copy h1')?.textContent === 'Slab Bowl 02');
  check('WordPress product detail uses correct content', await frame.locator('.detail-copy h1').textContent() === 'Slab Bowl 02');
  await frame.waitForFunction(() => [...document.querySelectorAll('.detail-media img')].every(image => image.complete && image.naturalWidth > 0));
  check('Dynamic product image resolves in Playground scope', true);
  await frame.locator('[data-qty]').fill('2');
  await frame.locator('[data-variant]').nth(1).click();
  await frame.locator('[data-add]').click();
  await frame.locator('.bag-link').click();
  await frame.locator('.bag-item').waitFor();
  check('WordPress bag preserves variant and quantity', (await frame.locator('.bag-item').textContent()).includes('Clear glaze') && (await frame.locator('[data-total]').textContent()) === '€290');
  await frame.locator('[data-checkout]').click();
  check('WordPress checkout stays simulated', (await frame.locator('[data-notice]').textContent()).includes('No order or payment was submitted.'));
  await page.screenshot({ path: 'artifacts/wordpress-commerce.png', fullPage: true });
  const journal = new URL('../tideland-journal/', frame.url()).href;
  await frame.goto(journal);
  await frame.locator('[data-lang="pl"]').click();
  check('WordPress language switching works', await frame.locator('html').getAttribute('lang') === 'pl');
  await frame.locator('button[data-category="species"]').click();
  check('WordPress journal filter works', await frame.locator('.archive-card:visible').count() === 1);
  await frame.locator('.archive-card:visible a').click();
  await frame.waitForFunction(() => location.pathname.includes('/tideland-story/') && document.querySelector('h1')?.textContent.toLowerCase().includes('traw'));
  check('WordPress article route preserves selected story', (await frame.locator('h1').innerText()).toLowerCase().includes('traw'));
  await frame.waitForFunction(() => [...document.querySelectorAll('.story-image img, .story-hero img, .article-hero img')].every(image => image.complete && image.naturalWidth > 0));
  check('WordPress frontend has one main landmark', await frame.locator('main').count() === 1);
  await page.screenshot({ path: 'artifacts/wordpress-tideland.png', fullPage: true });
  await page.locator('#editor').click();
  await frame.locator('#wpbody-content').waitFor();
  check('Native WordPress page editor is available', await frame.locator('a.row-title').count() >= 8);
  // Rapid iframe navigation can cancel Playground's native view transition.
  // Keep that diagnostic in the report; fail for every other browser error.
  const unexpected = errors.filter(error => error.message !== 'Transition was skipped' || error.stack);
  check('WordPress has no unexpected JS errors', unexpected.length === 0);
} catch (error) {
  console.error(error.message);
  await page.screenshot({ path: 'artifacts/wordpress-failure.png', fullPage: true });
  console.error(JSON.stringify({ url: page.url(), frames: page.frames().map(frame => frame.url()), errors }));
  process.exitCode = 1;
} finally {
  await fs.writeFile('artifacts/wordpress-qa.json', JSON.stringify({ checks, errors, passed: !process.exitCode }, null, 2));
  await browser.close();
}

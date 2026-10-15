import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'wordpress-commerce');
const basePath = path.join(root, 'dist', 'wordpress', 'form-earth.json');
const outputPath = path.join(root, 'dist', 'wordpress', 'form-earth-woocommerce.json');
const themeName = 'musedesk-commerce-demo';
const read = (file) => fs.readFileSync(file, 'utf8');
const b64 = (value) => Buffer.from(value).toString('base64');

function build() {
  const blueprint = JSON.parse(read(basePath));
  blueprint.preferredVersions = { php: '8.3', wp: '7.1.3' };
  blueprint.landingPage = '/shop/';
  const themePath = `/wordpress/wp-content/themes/${themeName}`;
  const pluginPath = '/wordpress/wp-content/mu-plugins/commerce-demo.php';
  const sourceFiles = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const themeFiles = sourceFiles.filter((name) => name !== 'commerce-demo.php');
  const plugin = path.join(sourceDir, 'mu-plugin', 'commerce-demo.php');
  const assets = ['studio.css', 'studio-vase.jpg', 'studio-bowl.jpg', 'studio-cup.jpg', 'studio-hero.jpg'];
  const steps = [
    { step: 'installPlugin', pluginData: { resource: 'url', url: 'https://downloads.wordpress.org/plugin/woocommerce.11.2.1.zip' }, options: { activate: true } },
    { step: 'mkdir', path: themePath },
    { step: 'mkdir', path: `${themePath}/assets` },
    { step: 'mkdir', path: '/wordpress/wp-content/mu-plugins' },
    ...themeFiles.map((name) => ({ step: 'writeFile', path: `${themePath}/${name}`, data: read(path.join(sourceDir, name)) })),
    { step: 'writeFile', path: pluginPath, data: read(plugin) },
    ...assets.map((name) => {
      const assetPath = path.join(root, 'dist', 'form-earth', name === 'studio.css' ? name : `../assets/${name}`);
      const data = name === 'studio.css' ? read(assetPath).replace(/^@import[^\r\n]*[\r\n]+/m, '') : fs.readFileSync(assetPath);
      return name === 'studio.css'
        ? { step: 'writeFile', path: `${themePath}/assets/${name}`, data }
        : { step: 'runPHP', code: `<?php file_put_contents('${themePath}/assets/${name}', base64_decode('${b64(data)}'));` };
    }),
    { step: 'activateTheme', themeFolderName: themeName },
    { step: 'runPHP', code: `<?php
require_once '/wordpress/wp-load.php';
switch_theme('${themeName}');
if (function_exists('wc_install')) { wc_install(); }
if (function_exists('musedesk_seed_commerce')) { musedesk_seed_commerce(); }
flush_rewrite_rules();
` },
  ];
  blueprint.steps = [...blueprint.steps, ...steps];
  fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));
}

build();

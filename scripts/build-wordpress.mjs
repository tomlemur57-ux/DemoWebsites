import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const out = path.join(root, 'dist', 'wordpress');
const themeName = 'musedesk-demo-pack';
const showcaseUrl = 'https://github.com/tomlemur57-ux/DemoWebsites';
const assetNames = fs.readdirSync(path.join(dist, 'assets')).filter((name) => /\.jpe?g$/i.test(name));

const brands = [
  {
    key: 'form-earth',
    source: path.join(dist, 'form-earth'),
    css: 'studio.css',
    js: 'studio.js',
    pages: [
      ['index.html', 'form-earth', 'FORM / EARTH | Independent ceramic objects'],
      ['collection.html', 'form-earth-collection', 'Collection | FORM / EARTH'],
      ['object.html', 'form-earth-object', 'Cobalt Vessel 04 | FORM / EARTH'],
      ['bag.html', 'form-earth-bag', 'Your bag | FORM / EARTH'],
    ],
  },
  {
    key: 'tideland',
    source: path.join(dist, 'tideland'),
    css: 'tideland.css',
    js: 'tideland.js',
    pages: [
      ['index.html', 'tideland', 'Tideland — Coast, held in common'],
      ['journal.html', 'tideland-journal', 'Journal — Tideland'],
      ['story.html', 'tideland-story', 'The quiet engineering of a living dune — Tideland'],
      ['support.html', 'tideland-support', 'Support the shoreline — Tideland'],
    ],
  },
];

const read = (file) => fs.readFileSync(file, 'utf8');
const b64 = (value) => Buffer.from(value).toString('base64');

function extractBody(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const header = body.match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? '';
  const footer = body.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
  let content = body.replace(header, '').replace(footer, '');
  content = content.replace(/<script\b[^>]*src=["'][^"']+["'][^>]*><\/script>/gi, '');
  return { header, footer, content: content.trim() };
}

function rewriteLinks(value, pageSlugs) {
  let output = value;
  for (const [file, slug] of pageSlugs) {
    const token = `__WP_URL_${slug}__`;
    const re = new RegExp(`(["'])${file.replace('.', '\\.')}(?=[?#])`, 'g');
    output = output.replace(re, `$1${token}`);
    output = output.replace(new RegExp(`(["'])${file.replace('.', '\\.')}(?=["'])`, 'g'), `$1${token}`);
  }
  output = output.replace(/(["'])\.\.\/index\.html(?=[?#"'])/g, `$1${showcaseUrl}`);
  output = output.replace(/\.\.\/assets\//g, '__THEME_ASSET_URL__/assets/');
  return output;
}

function rewriteTidelandScript(value) {
  return value
    .replace("const page=location.pathname.split('/').pop()||'index.html';", "const page=document.body.dataset.demoPage||'index';")
    .replaceAll("'index.html'", "'index'")
    .replaceAll("'journal.html'", "'journal'")
    .replaceAll("'story.html'", "'story'")
    .replaceAll("'support.html'", "'support'")
    .replace("if(location.pathname.endsWith('journal.html'))filterCards();", "if(document.body.dataset.demoPage==='journal')filterCards();");
}

function rewriteScriptAssets(value) {
  const assetBase = "const DEMO_ASSET_BASE = new URL('assets/', document.currentScript?.src || document.baseURI).href;\n";
  return assetBase + value.replace(/(['"`])\.\.\/assets\/([^'"`]+)\1/g, (_match, quote, asset) => `DEMO_ASSET_BASE + '${asset}'`);
}

function themeFiles() {
  return {
    'style.css': `/*\nTheme Name: MuseDesk Demo Pack\nTheme URI: https://github.com/tomlemur57-ux/DemoWebsites\nDescription: Self-contained editable WordPress demo theme for the FORM / EARTH and Tideland design studies.\nVersion: 1.0.0\nRequires at least: 6.8\n*/\n`,
    'functions.php': `<?php\nif (!defined('ABSPATH')) { exit; }\nadd_filter('show_admin_bar', '__return_false');\nadd_action('after_setup_theme', function () {\n  add_theme_support('title-tag');\n  add_theme_support('html5', ['style', 'script']);\n});\nadd_action('wp_enqueue_scripts', function () {\n  $theme = get_template_directory_uri();\n  $brand = get_post_meta(get_queried_object_id(), '_demo_brand', true);\n  $style = $brand === 'tideland' ? 'tideland.css' : 'studio.css';\n  $script = $brand === 'tideland' ? 'tideland.js' : 'studio.js';\n  wp_enqueue_style('musedesk-demo-style', $theme . '/' . $style, [], '1.0.0');\n  wp_enqueue_script('musedesk-demo-script', $theme . '/' . $script, [], '1.0.0', true);\n});\n`,
    'header.php': `<!doctype html>\n<html <?php language_attributes(); ?>>\n<head>\n<meta charset="<?php bloginfo('charset'); ?>">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<?php wp_head(); ?>\n</head>\n<?php\n$post_id = get_queried_object_id();\n$body_class = get_post_meta($post_id, '_demo_body_class', true);\n$page_key = get_post_meta($post_id, '_demo_page_key', true);\n?>\n<body <?php body_class($body_class); ?> data-demo-page="<?php echo esc_attr($page_key); ?>">\n<?php wp_body_open(); ?>\n<?php echo get_post_meta($post_id, '_demo_header_html', true); ?>\n`,
    'footer.php': `<?php\n$post_id = get_queried_object_id();\necho get_post_meta($post_id, '_demo_footer_html', true);\nwp_footer();\n?>\n</body>\n</html>\n`,
    'index.php': `<?php get_header(); ?>\n<?php while (have_posts()) : the_post(); the_content(); endwhile; ?>\n<?php get_footer(); ?>\n`,
    'page.php': `<?php get_header(); ?>\n<?php while (have_posts()) : the_post(); the_content(); endwhile; ?>\n<?php get_footer(); ?>\n`,
  };
}

function build() {
  fs.mkdirSync(out, { recursive: true });
  const files = themeFiles();
  files['header.php'] = files['header.php'].replace(
    '$page_key = get_post_meta($post_id, \'_demo_page_key\', true);',
    '$page_key = get_post_meta($post_id, \'_demo_page_key\', true);\n$body_attrs = get_post_meta($post_id, \'_demo_body_attrs\', true);'
  ).replace(
    '<body <?php body_class($body_class); ?> data-demo-page=',
    '<body <?php body_class($body_class); ?> <?php echo $body_attrs; ?> data-demo-page='
  );
  const posts = [];
  for (const brand of brands) {
    const css = read(path.join(brand.source, brand.css)).replace(/\.\.\/assets\//g, 'assets/');
    const js = rewriteTidelandScript(read(path.join(brand.source, brand.js)));
    files[brand.css] = css;
    files[brand.js] = rewriteLinks(rewriteScriptAssets(js), brand.pages);
    for (const [file, slug, title] of brand.pages) {
      const source = read(path.join(brand.source, file));
      const parts = extractBody(source);
      const pageKey = file.replace('.html', '');
      posts.push({
        brand: brand.key,
        file,
        slug,
        title,
        pageKey,
        bodyClass: (source.match(/<body\b[^>]*class=["']([^"']+)["']/i)?.[1] ?? ''),
        bodyAttrs: (source.match(/<body\b([^>]*)>/i)?.[1] ?? '').replace(/\sclass=["'][^"']*["']/i, '').trim(),
        header: rewriteLinks(parts.header, brand.pages),
        footer: rewriteLinks(parts.footer, brand.pages),
        content: rewriteLinks(parts.content, brand.pages),
      });
    }
  }

  fs.mkdirSync(path.join(out, 'theme', themeName), { recursive: true });

  const launcher = `<!-- wp:html -->\n<div class="musedesk-launcher"><p class="eyebrow">MuseDesk / WordPress edition</p><h1>Editable design studies.</h1><p>Two self-contained demos running as native WordPress pages. Open either example, then edit its HTML block in the WordPress editor.</p><p><a class="button" href="__WP_URL_form-earth__">FORM / EARTH</a> <a class="button secondary" href="__WP_URL_tideland__">Tideland</a></p><p class="muted">These are front-end examples only. No payments, orders, or gateways are connected.</p></div>\n<!-- /wp:html -->`;
  posts.unshift({ brand: 'launcher', file: '', slug: 'musedesk-demo-launcher', title: 'MuseDesk WordPress Demo Pack', pageKey: 'launcher', bodyClass: '', bodyAttrs: '', header: '<header class="musedesk-launcher-header"><strong>MuseDesk / WordPress edition</strong></header>', footer: '<footer class="musedesk-launcher-footer">Editable HTML block demos · 2026</footer>', content: launcher });

  for (const [name, data] of Object.entries(files)) {
    if (data !== null) fs.writeFileSync(path.join(out, 'theme', themeName, name), data);
  }
  fs.mkdirSync(path.join(out, 'theme', themeName, 'assets'), { recursive: true });
  for (const asset of assetNames) fs.copyFileSync(path.join(dist, 'assets', asset), path.join(out, 'theme', themeName, 'assets', asset));
  const assetWrites = `mkdir('/wordpress/wp-content/themes/${themeName}/assets', 0777, true);\n` + assetNames.map((asset) => `file_put_contents('/wordpress/wp-content/themes/${themeName}/assets/${asset}', base64_decode('${b64(fs.readFileSync(path.join(dist, 'assets', asset)))}'));`).join('\n');

  const blueprint = {
    '$schema': 'https://playground.wordpress.net/blueprint-schema.json',
    landingPage: '/musedesk-demo-launcher/',
    preferredVersions: { php: '8.3', wp: '6.8' },
    steps: [
      { step: 'login' },
      { step: 'mkdir', path: `/wordpress/wp-content/themes/${themeName}` },
      { step: 'mkdir', path: `/wordpress/wp-content/themes/${themeName}/assets` },
      ...Object.entries(files).filter(([, data]) => data !== null).map(([name, data]) => ({ step: 'writeFile', path: `/wordpress/wp-content/themes/${themeName}/${name}`, data })),
      ...assetNames.map((asset) => ({ step: 'writeFile', path: `/wordpress/wp-content/themes/${themeName}/assets/${asset}`, data: b64(fs.readFileSync(path.join(dist, 'assets', asset))) })),
      { step: 'runPHP', code: `<?php\n${assetWrites}\n` },
      { step: 'activateTheme', themeFolderName: themeName },
      { step: 'runPHP', code: `<?php\n$posts = ${JSON.stringify(posts)};\n$ids = [];\nforeach ($posts as $post) {\n  $content = '<!-- wp:html -->' . $post['content'] . '<!-- /wp:html -->';\n  $id = wp_insert_post([\n    'ID' => $post['slug'] === 'musedesk-demo-launcher' ? 100 : 0,\n    'post_title' => $post['title'],\n    'post_name' => $post['slug'],\n    'post_status' => 'publish',\n    'post_type' => 'page',\n    'post_content' => $content,\n    'meta_input' => [\n      '_demo_brand' => $post['brand'],\n      '_demo_page_key' => $post['pageKey'],\n      '_demo_body_class' => $post['bodyClass'],\n      '_demo_header_html' => $post['header'],\n      '_demo_footer_html' => $post['footer'],\n    ],\n  ], true);\n  if (!is_wp_error($id)) $ids[$post['slug']] = $id;\n}\nforeach ($ids as $slug => $id) {\n  $page = get_post($id);\n  $content = str_replace('__THEME_ASSET_URL__', get_template_directory_uri(), $page->post_content);\n  foreach ($ids as $target_slug => $target_id) { $content = str_replace('__WP_URL_' . $target_slug . '__', get_permalink($target_id), $content); }\n  wp_update_post(['ID' => $id, 'post_content' => $content]);\n  foreach (['_demo_header_html', '_demo_footer_html'] as $meta) {\n    $html = get_post_meta($id, $meta, true);\n    $html = str_replace('__THEME_ASSET_URL__', get_template_directory_uri(), $html);\n    foreach ($ids as $target_slug => $target_id) { $html = str_replace('__WP_URL_' . $target_slug . '__', get_permalink($target_id), $html); }\n    update_post_meta($id, $meta, $html);\n  }\n}\nupdate_option('show_on_front', 'page');\nupdate_option('page_on_front', $ids['musedesk-demo-launcher']);\nupdate_option('permalink_structure', '/%postname%/');\nflush_rewrite_rules();\n` },
    ],
  };
  const seedStep = blueprint.steps.find((step) => step.step === 'runPHP' && step.code.includes('$posts = '));
  seedStep.code = seedStep.code
    .replace(`$posts = ${JSON.stringify(posts)};`, `$posts = json_decode(base64_decode('${b64(JSON.stringify(posts))}'), true);`)
    .replace('<?php\n', "<?php\nrequire_once '/wordpress/wp-load.php';\n$demo_admin = get_user_by('login', 'admin');\nif (!$demo_admin) throw new Exception('Missing Playground demo administrator.');\nwp_set_current_user($demo_admin->ID);\nkses_init();\n")
    .replace('$ids = [];\n', "$ids = [];\nupdate_option('permalink_structure', '/%postname%/');\nflush_rewrite_rules();\n")
    .replace("    'ID' => $post['slug'] === 'musedesk-demo-launcher' ? 100 : 0,", '')
    .replace("      '_demo_body_class' => $post['bodyClass'],", "      '_demo_body_class' => $post['bodyClass'],\n      '_demo_body_attrs' => $post['bodyAttrs'],")
    .replace("  $id = wp_insert_post([", "  $id = wp_insert_post(wp_slash([")
    .replace("  ], true);\n  if (!is_wp_error($id)) $ids[$post['slug']] = $id;", "  ]), true);\n  if (is_wp_error($id)) throw new Exception($id->get_error_message());\n  $ids[$post['slug']] = $id;")
    .replace("wp_update_post(['ID' => $id, 'post_content' => $content]);", "wp_update_post(['ID' => $id, 'post_content' => wp_slash($content)]);")
    .replace("update_post_meta($id, $meta, $html);", "update_post_meta($id, $meta, wp_slash($html));");
  fs.writeFileSync(path.join(out, 'musedesk-wordpress-blueprint.json'), JSON.stringify(blueprint, null, 2));
  fs.writeFileSync(path.join(out, 'form-earth.json'), JSON.stringify({ ...blueprint, landingPage: '/form-earth/' }, null, 2));
  fs.writeFileSync(path.join(out, 'tideland.json'), JSON.stringify({ ...blueprint, landingPage: '/tideland/' }, null, 2));
  fs.writeFileSync(path.join(out, 'README.md'), `# MuseDesk WordPress edition\n\nOpen \`musedesk-wordpress-blueprint.json\` in WordPress Playground. It logs in, writes the self-contained theme and JPEG assets, activates the theme, then seeds native Pages whose content is a Custom HTML block.\n\nThe launcher page links to FORM / EARTH and Tideland. This is a front-end demo: no WooCommerce, payment, order, or gateway integration is included.\n`);
}

build();

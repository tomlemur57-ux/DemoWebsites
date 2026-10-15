<?php
if (!defined('ABSPATH')) { exit; }
add_filter('show_admin_bar', '__return_false');
add_action('after_setup_theme', function () {
  add_theme_support('title-tag');
  add_theme_support('html5', ['style', 'script']);
});
add_action('wp_enqueue_scripts', function () {
  $theme = get_template_directory_uri();
  $brand = get_post_meta(get_queried_object_id(), '_demo_brand', true);
  $style = $brand === 'tideland' ? 'tideland.css' : 'studio.css';
  $script = $brand === 'tideland' ? 'tideland.js' : 'studio.js';
  wp_enqueue_style('musedesk-demo-style', $theme . '/' . $style, [], '1.0.0');
  wp_enqueue_script('musedesk-demo-script', $theme . '/' . $script, [], '1.0.0', true);
});

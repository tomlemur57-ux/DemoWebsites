<?php
if (!defined('ABSPATH')) { exit; }

add_filter('show_admin_bar', '__return_false');
add_action('after_setup_theme', function () {
  add_theme_support('title-tag');
  add_theme_support('html5', ['style', 'script', 'gallery', 'caption']);
  add_theme_support('woocommerce');
});
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_style('musedesk-commerce-base', get_theme_file_uri('assets/studio.css'), [], '1.0.0');
  wp_enqueue_style('musedesk-commerce', get_stylesheet_uri(), ['musedesk-commerce-base'], '1.0.0');
});
add_filter('body_class', function ($classes) { $classes[] = 'commerce-demo'; return $classes; });
add_filter('woocommerce_show_page_title', '__return_false');
add_action('wp_body_open', function () { echo '<div class="demo-ribbon">Fictional commerce demo · no payment</div>'; });

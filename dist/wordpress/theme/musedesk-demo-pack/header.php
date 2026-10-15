<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<?php
$post_id = get_queried_object_id();
$body_class = get_post_meta($post_id, '_demo_body_class', true);
$page_key = get_post_meta($post_id, '_demo_page_key', true);
$body_attrs = get_post_meta($post_id, '_demo_body_attrs', true);
?>
<body <?php body_class($body_class); ?> <?php echo $body_attrs; ?> data-demo-page="<?php echo esc_attr($page_key); ?>">
<?php wp_body_open(); ?>
<?php echo get_post_meta($post_id, '_demo_header_html', true); ?>

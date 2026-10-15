<?php
require_once '/wordpress/wp-load.php';

function demo_check($condition, $message) {
    if (!$condition) { throw new Exception('WooCommerce verification failed: ' . $message); }
}

demo_check(version_compare(get_bloginfo('version'), '7.0', '>='), 'compatible WordPress version');
demo_check(defined('WC_VERSION') && WC_VERSION === '11.2.1', 'pinned WooCommerce version');
$products = wc_get_products(['limit' => -1, 'status' => 'publish']);
demo_check(count($products) === 4, 'four native products');
foreach ($products as $product) {
    demo_check($product->is_type('variable'), 'variable product: ' . $product->get_name());
    demo_check(count($product->get_children()) === 2, 'two native variations per product');
    foreach ($product->get_children() as $id) {
        $variation = wc_get_product($id);
        demo_check($variation->is_virtual() && (float) $variation->get_price() > 0, 'priced variation without fulfillment');
    }
    $image = get_attached_file($product->get_image_id());
    demo_check($image && file_exists($image) && file_get_contents($image, false, null, 0, 2) === "\xff\xd8", 'decoded JPEG product image');
}
foreach (['cart', 'checkout'] as $page) {
    demo_check(get_post_field('post_content', wc_get_page_id($page)) === '[woocommerce_' . $page . ']', 'native classic ' . $page . ' flow');
}
demo_check(get_post_field('post_content', wc_get_page_id('shop')) === '', 'archive does not duplicate a shortcode catalog');
demo_check(apply_filters('pre_wp_mail', null, []) === false, 'outgoing email blocked');
$gateways = WC()->payment_gateways()->payment_gateways();
$available = apply_filters('woocommerce_available_payment_gateways', $gateways);
demo_check(array_keys($available) === ['musedesk_demo'], 'only fictional gateway available');
$defaults = ['billing_first_name' => 'Demo', 'billing_last_name' => 'Customer', 'billing_email' => 'demo@example.invalid', 'billing_country' => 'DE', 'billing_address_1' => 'Demo Lane 1', 'billing_city' => 'Berlin', 'billing_postcode' => '10115'];
$data = $defaults + ['createaccount' => 0, 'terms' => false, 'payment_method' => 'musedesk_demo'];
$errors = new WP_Error();
do_action('woocommerce_after_checkout_validation', $data, $errors);
demo_check(!$errors->has_errors(), 'fictional identity and native checkout flags accepted');
$data['billing_email'] = 'changed@example.invalid';
$errors = new WP_Error();
do_action('woocommerce_after_checkout_validation', $data, $errors);
demo_check($errors->has_errors(), 'changed checkout identity rejected');
$errors = new WP_Error();
do_action('woocommerce_after_checkout_validation', $defaults + ['billing_phone' => 'demo-extra'], $errors);
demo_check($errors->has_errors(), 'additional personal fields rejected');
musedesk_seed_commerce();
demo_check(count(wc_get_products(['limit' => -1])) === 4, 'seeding does not duplicate products');

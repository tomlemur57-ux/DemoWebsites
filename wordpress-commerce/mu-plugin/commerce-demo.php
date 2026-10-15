<?php
/** Fictional, offline WooCommerce catalog for the MuseDesk demo. */
if (!defined('ABSPATH')) { exit; }

add_filter('pre_wp_mail', '__return_false', 10);
add_filter('woocommerce_email_enabled_new_order', '__return_false', 10);
add_filter('woocommerce_email_enabled_customer_processing_order', '__return_false', 10);
add_filter('woocommerce_email_enabled_customer_completed_order', '__return_false', 10);
add_filter('woocommerce_email_enabled_customer_invoice', '__return_false', 10);

add_filter('woocommerce_checkout_get_value', function ($value, $input) {
  $defaults = ['billing_first_name' => 'Demo', 'billing_last_name' => 'Customer', 'billing_email' => 'demo@example.invalid', 'billing_country' => 'DE', 'billing_address_1' => 'Demo Lane 1', 'billing_city' => 'Berlin', 'billing_postcode' => '10115'];
  return $defaults[$input] ?? $value;
}, 10, 2);
add_filter('woocommerce_checkout_fields', function ($fields) {
  unset($fields['billing']['billing_company'], $fields['billing']['billing_phone'], $fields['billing']['billing_address_2'], $fields['billing']['billing_state'], $fields['shipping'], $fields['account'], $fields['order']['order_comments']);
  foreach (['billing_first_name', 'billing_last_name', 'billing_email', 'billing_country', 'billing_address_1', 'billing_city', 'billing_postcode'] as $key) {
    if (isset($fields['billing'][$key])) { $fields['billing'][$key]['custom_attributes']['readonly'] = 'readonly'; }
  }
  $fields['billing']['billing_country']['type'] = 'text';
  $fields['billing']['billing_country']['label'] = 'Demo country';
  return $fields;
});
add_action('woocommerce_after_checkout_validation', function ($data, $errors) {
  $expected = ['billing_first_name' => 'Demo', 'billing_last_name' => 'Customer', 'billing_email' => 'demo@example.invalid', 'billing_country' => 'DE', 'billing_address_1' => 'Demo Lane 1', 'billing_city' => 'Berlin', 'billing_postcode' => '10115'];
  foreach ($expected as $key => $value) { if ((string) ($data[$key] ?? '') !== $value) { $errors->add('demo_' . $key, 'Use the prefilled fictional demo checkout values.'); } }
  foreach ($data as $key => $value) {
    $personal = strpos($key, 'billing_') === 0 || strpos($key, 'shipping_') === 0 || $key === 'order_comments';
    if ($personal && !array_key_exists($key, $expected) && !empty($value)) { $errors->add('demo_extra_' . sanitize_key($key), 'Additional personal checkout details are disabled in this fictional demo.'); }
  }
}, 10, 2);
add_filter('woocommerce_order_button_text', function () { return 'Create demo order'; });
add_filter('woocommerce_get_privacy_policy_text', function ($text, $type) { return $type === 'checkout' ? 'Use the fixed fictional demo identity. This temporary demonstration takes no payment and sends no email or fulfillment request.' : $text; }, 10, 2);
add_filter('woocommerce_thankyou_order_received_text', function () { return 'Fictional demo order created locally. No payment was taken and nothing will be fulfilled.'; });

add_filter('woocommerce_quantity_input_args', function ($args) { $args['min_value'] = 1; $args['max_value'] = 20; return $args; });
add_filter('woocommerce_add_to_cart_validation', function ($passed, $product_id, $quantity, $variation_id = 0, $variations = []) {
  if (!$passed || ($quantity < 1 || $quantity > 20)) { return false; }
  if (WC()->cart) { foreach (WC()->cart->get_cart() as $item) { if ((int) $item['product_id'] === (int) $product_id && (int) $item['variation_id'] === (int) $variation_id && ((int) $item['quantity'] + (int) $quantity) > 20) { return false; } } }
  return true;
}, 10, 5);
add_filter('woocommerce_update_cart_validation', function ($passed, $cart_item_key, $values, $quantity) { return $passed && ($quantity === 0 || ($quantity >= 1 && $quantity <= 20)); }, 10, 4);

add_action('plugins_loaded', function () {
  if (!class_exists('WC_Payment_Gateway')) { return; }
  class MuseDesk_Demo_Gateway extends WC_Payment_Gateway {
    public function __construct() {
      $this->id = 'musedesk_demo'; $this->method_title = 'MuseDesk demo checkout'; $this->method_description = 'Offline fictional checkout. No payment is collected.';
      $this->title = 'Demo checkout — no payment'; $this->has_fields = false; $this->supports = ['products'];
      $this->enabled = 'yes';
    }
    public function process_payment($order_id) {
      $order = wc_get_order($order_id);
      $order->update_status('on-hold', 'Fictional MuseDesk demo order. No payment or fulfillment requested.');
      $order->update_meta_data('_musedesk_demo_order', 'yes'); $order->save();
      WC()->cart->empty_cart();
      return ['result' => 'success', 'redirect' => $this->get_return_url($order)];
    }
  }
  add_filter('woocommerce_payment_gateways', function ($methods) { $methods[] = 'MuseDesk_Demo_Gateway'; return $methods; });
  add_filter('woocommerce_available_payment_gateways', function ($gateways) { return isset($gateways['musedesk_demo']) ? ['musedesk_demo' => $gateways['musedesk_demo']] : []; });
});

function musedesk_seed_commerce() {
  if (!function_exists('wc_get_product') || get_option('musedesk_commerce_seeded')) { return; }
  $attribute_id = 0;
  foreach ((array) wc_get_attribute_taxonomies() as $attribute) { if ($attribute->attribute_name === 'finish') { $attribute_id = (int) $attribute->attribute_id; } }
  if (!$attribute_id) { $attribute_id = (int) wc_create_attribute(['name' => 'Finish', 'slug' => 'finish']); }
  if (!taxonomy_exists('pa_finish')) { register_taxonomy('pa_finish', ['product'], ['hierarchical' => false, 'public' => false, 'show_ui' => false]); }
  $term_ids = [];
  $products = [
    ['Cobalt Vessel 04', 'Stoneware · 28 cm', '280', 'studio-vase.jpg', ['Deep cobalt', 'Chalk interior']],
    ['Slab Bowl 02', 'Speckled stoneware · 22 cm', '145', 'studio-bowl.jpg', ['Speckled clay', 'Clear glaze']],
    ['Ash Cup 01', 'Stoneware · 8 cm', '68', 'studio-cup.jpg', ['Ash wash', 'Raw porcelain']],
    ['Signal Plate 03', 'Speckled white stoneware · 24 cm', '96', 'studio-hero.jpg', ['Cobalt line', 'Quiet edge']],
  ];
  foreach ($products as [$name, $short, $price, $image, $finish_labels]) {
    $product = wc_get_product(wc_get_product_id_by_sku('musedesk-' . sanitize_title($name)));
    if (!$product) { $product = new WC_Product_Variable(); $product->set_sku('musedesk-' . sanitize_title($name)); }
    $product->set_name($name); $product->set_description($short . '. Every price and object in this shop is fictional and for demonstration only.'); $product->set_status('publish'); $product->set_catalog_visibility('visible');
    $finish_slugs = []; foreach ($finish_labels as $label) { $slug = sanitize_title($label); $term = term_exists($label, 'pa_finish'); if (!$term) { $term = wp_insert_term($label, 'pa_finish', ['slug' => $slug]); } if (!is_wp_error($term)) { $term_ids[$slug] = (int) (is_array($term) ? $term['term_id'] : $term); $finish_slugs[] = $slug; } }
    $attribute = new WC_Product_Attribute(); $attribute->set_id($attribute_id); $attribute->set_name('pa_finish'); $attribute->set_options(array_map(fn($slug) => $term_ids[$slug] ?? 0, $finish_slugs)); $attribute->set_visible(true); $attribute->set_variation(true); $product->set_attributes([$attribute]); $product->set_virtual(true);
    $product->set_image_id(musedesk_demo_asset($image)); $product_id = $product->save();
    foreach ($finish_slugs as $finish) {
      $variation = new WC_Product_Variation(); $variation->set_parent_id($product_id); $variation->set_attributes(['pa_finish' => $finish]); $variation->set_regular_price($price); $variation->set_virtual(true); $variation->set_status('publish'); $variation->save();
    }
    WC_Product_Variable::sync($product_id);
  }
  $pages = ['shop' => ['Shop', ''], 'cart' => ['Cart', '[woocommerce_cart]'], 'checkout' => ['Checkout', '[woocommerce_checkout]']];
  foreach ($pages as $key => [$title, $content]) {
    $page = get_page_by_path($key);
    $page_id = wp_insert_post(['ID' => $page ? $page->ID : 0, 'post_title' => $title, 'post_name' => $key, 'post_status' => 'publish', 'post_type' => 'page', 'post_content' => $content], true);
    if (is_wp_error($page_id)) { throw new Exception($page_id->get_error_message()); }
    update_option('woocommerce_' . $key . '_page_id', $page_id);
  }
  update_option('woocommerce_currency', 'EUR'); update_option('woocommerce_default_country', 'DE'); update_option('woocommerce_calc_taxes', 'no'); update_option('woocommerce_enable_guest_checkout', 'yes');
  update_option('woocommerce_cod_settings', ['enabled' => 'no']); update_option('woocommerce_musedesk_demo_settings', ['enabled' => 'yes']);
  update_option('musedesk_commerce_seeded', 1); flush_rewrite_rules();
}

function musedesk_demo_asset($filename) {
  $existing = get_posts(['post_type' => 'attachment', 'meta_key' => '_musedesk_demo_asset', 'meta_value' => $filename, 'numberposts' => 1]);
  if ($existing) { return $existing[0]->ID; }
  $source = get_theme_file_path('assets/' . $filename); if (!file_exists($source)) { return 0; }
  $uploads = wp_upload_dir(); $target = trailingslashit($uploads['path']) . sanitize_file_name($filename); wp_mkdir_p($uploads['path']); copy($source, $target);
  $type = wp_check_filetype($filename, null); $id = wp_insert_attachment(['post_mime_type' => $type['type'], 'post_title' => sanitize_text_field(pathinfo($filename, PATHINFO_FILENAME)), 'post_status' => 'inherit'], $target);
  if ($id && !is_wp_error($id)) { require_once ABSPATH . 'wp-admin/includes/image.php'; wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $target)); update_post_meta($id, '_musedesk_demo_asset', $filename); return $id; }
  return 0;
}

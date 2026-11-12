<?php
/**
 * Plugin Name:       NewDermaMed Pricing
 * Description:       Serves the Pricing page and the current offers of the Next.js site from WooCommerce (categories, products, variations, prices, promotional labels) and takes the changes its administrators make there. No settings, no admin pages.
 * Version:           0.1.0
 * Author:            NewDermaMed
 * License:           GPL-2.0-or-later
 * Requires Plugins:  woocommerce
 * Requires PHP:      8.0
 *
 * WooCommerce stays the single source of truth: this plugin adds no tables and no second catalogue.
 * It reads and writes WooCommerce's own products, variations and product categories through
 * WooCommerce's data classes, and keeps a few display settings beside them as metadata (see
 * includes/meta.php). No product or category is ever deleted and no ID ever changes; a variation an
 * administrator removes on the management screen goes to WooCommerce's trash.
 *
 * Optional settings (constants in wp-config.php or environment variables, never the database):
 *
 *   NDM_REVALIDATE_URL     Address on the Next.js server that clears its cached price list.
 *   NDM_REVALIDATE_SECRET  Shared secret sent with that call.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_PRICING_VERSION', '0.1.0' );
define( 'NDM_PRICING_DIR', __DIR__ );
define( 'NDM_PRICING_REST_NAMESPACE', 'ndm/v1' );

/**
 * Loads the plugin once WooCommerce is there; without it the plugin does nothing at all.
 */
function ndm_pricing_boot() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return;
	}

	require_once NDM_PRICING_DIR . '/includes/meta.php';
	require_once NDM_PRICING_DIR . '/includes/tree.php';
	require_once NDM_PRICING_DIR . '/includes/cache.php';
	require_once NDM_PRICING_DIR . '/includes/variations.php';
	require_once NDM_PRICING_DIR . '/includes/save.php';
	require_once NDM_PRICING_DIR . '/includes/rest.php';
	require_once NDM_PRICING_DIR . '/includes/orders.php';
	require_once NDM_PRICING_DIR . '/includes/promotions.php';

	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		require_once NDM_PRICING_DIR . '/includes/cli.php';
	}
}
add_action( 'plugins_loaded', 'ndm_pricing_boot' );

<?php
/**
 * Keeps the public price list ready (one stored copy) and throws it away whenever WooCommerce data
 * that it shows changes, wherever the change was made: the management screen, wp-admin, an import,
 * a scheduled sale. The Next.js site is then told to drop its own cached copy.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_TRANSIENT = 'ndm_pricing_public_tree';

/**
 * The public price list, built at most once an hour unless something changes.
 *
 * @return array<string,mixed>
 */
function ndm_pricing_public_tree() {
	$tree = get_transient( NDM_PRICING_TRANSIENT );

	if ( ! is_array( $tree ) ) {
		$tree = ndm_pricing_tree( false );
		set_transient( NDM_PRICING_TRANSIENT, $tree, HOUR_IN_SECONDS );
	}

	return $tree;
}

/**
 * Forgets the stored price list and, once per request, tells the Next.js site.
 */
function ndm_pricing_flush() {
	static $queued = false;

	delete_transient( NDM_PRICING_TRANSIENT );

	if ( ! $queued ) {
		$queued = true;
		add_action( 'shutdown', 'ndm_pricing_notify_frontend' );
	}
}

/**
 * Asks the Next.js server to clear its cached price list. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_pricing_notify_frontend() {
	if ( ! function_exists( 'ndm_headless_setting' ) ) {
		return;
	}

	$url    = esc_url_raw( ndm_headless_setting( 'NDM_REVALIDATE_URL' ), array( 'http', 'https' ) );
	$secret = ndm_headless_setting( 'NDM_REVALIDATE_SECRET' );

	if ( '' === $url || '' === $secret ) {
		return;
	}

	wp_remote_post(
		$url,
		array(
			'timeout'  => 2,
			'blocking' => false,
			'headers'  => array(
				'Content-Type'      => 'application/json',
				'X-NDM-Revalidate'  => $secret,
			),
			'body'     => wp_json_encode( array( 'tag' => 'pricing' ) ),
		)
	);
}

/**
 * Flushes when a product or a variation is saved, trashed, restored or deleted.
 *
 * @param int $post_id Post ID.
 */
function ndm_pricing_flush_for_post( $post_id ) {
	if ( in_array( get_post_type( $post_id ), array( 'product', 'product_variation' ), true ) ) {
		ndm_pricing_flush();
	}
}

/**
 * Flushes when the categories of a product change.
 *
 * @param int    $object_id Object ID.
 * @param array  $terms     Terms.
 * @param array  $tt_ids    Term taxonomy IDs.
 * @param string $taxonomy  Taxonomy.
 */
function ndm_pricing_flush_for_terms( $object_id, $terms, $tt_ids, $taxonomy ) {
	if ( 'product_cat' === $taxonomy ) {
		ndm_pricing_flush();
	}
}

foreach ( array( 'woocommerce_new_product', 'woocommerce_update_product', 'woocommerce_new_product_variation', 'woocommerce_update_product_variation', 'wc_after_products_starting_sales', 'wc_after_products_ending_sales', 'woocommerce_product_set_stock_status', 'woocommerce_variation_set_stock_status', 'created_product_cat', 'edited_product_cat', 'delete_product_cat' ) as $ndm_pricing_hook ) {
	add_action( $ndm_pricing_hook, 'ndm_pricing_flush', 10, 0 );
}
unset( $ndm_pricing_hook );

foreach ( array( 'trashed_post', 'untrashed_post', 'deleted_post' ) as $ndm_pricing_hook ) {
	add_action( $ndm_pricing_hook, 'ndm_pricing_flush_for_post', 10, 1 );
}
unset( $ndm_pricing_hook );

add_action( 'set_object_terms', 'ndm_pricing_flush_for_terms', 10, 4 );

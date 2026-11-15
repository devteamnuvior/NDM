<?php
/**
 * The Pricing page's "Monthly specials" cards: which treatments they show, in which order.
 *
 * One option holds the list:
 *
 *   ndm_pricing_specials   list of  productId  WooCommerce product ID
 *                                   name       card title ("Lip Filler"); empty shows the product's own name
 *                                   scope      "product"  the card shows this treatment's lowest price and offer
 *                                              "category" the lowest price and offer of its whole category
 *
 * Nothing here is a price: the price, unit and offer line of a card are worked out by the site from
 * WooCommerce's own prices, the same way the price list does. A treatment that is also one of the
 * offers (Promotions) shows the offer's own figures, so every page agrees.
 *
 * Until the list is saved for the first time it is the current offers, in their order: that is what
 * the page showed before the list could be managed.
 *
 * The list travels with the price list (`specials` in ndm/v1/pricing and in the management tree) and
 * is saved with it (`specials` in ndm/v1/pricing/admin/save: the whole list, in its new order).
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_SPECIALS_OPTION = 'ndm_pricing_specials';
const NDM_SPECIALS_MAX    = 24;

/**
 * The list before its first save: the offers, in their order.
 *
 * @return array<int,array{productId:int,name:string,scope:string}>
 */
function ndm_specials_default() {
	$ids = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => array( 'publish', 'private', 'draft', 'pending' ),
			'meta_key'       => NDM_PROMO_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a handful of products.
			'posts_per_page' => NDM_PROMO_MAX * 2,
			'fields'         => 'ids',
			'no_found_rows'  => true,
		)
	);

	$rows = array();

	foreach ( $ids as $id ) {
		$settings = ndm_promo_settings( get_post_meta( $id, NDM_PROMO_META, true ) );

		if ( null !== $settings ) {
			$rows[] = array(
				'productId' => (int) $id,
				'name'      => $settings['name'],
				'scope'     => $settings['scope'],
				'order'     => $settings['order'],
			);
		}
	}

	usort(
		$rows,
		static function ( $a, $b ) {
			return array( $a['order'], $a['productId'] ) <=> array( $b['order'], $b['productId'] );
		}
	);

	return array_map(
		static function ( $row ) {
			unset( $row['order'] );
			return $row;
		},
		array_slice( $rows, 0, NDM_SPECIALS_MAX )
	);
}

/**
 * The monthly specials, in order, each with its product's current name. A product that no longer
 * exists (deleted or in the trash) is left out.
 *
 * @return array<int,array{productId:int,name:string,scope:string,productName:string}>
 */
function ndm_specials() {
	$stored = get_option( NDM_SPECIALS_OPTION, null );
	$stored = is_array( $stored ) ? $stored : ndm_specials_default();
	$list   = array();
	$seen   = array();

	foreach ( $stored as $row ) {
		$id      = is_array( $row ) ? (int) ( $row['productId'] ?? 0 ) : 0;
		$product = $id && ! isset( $seen[ $id ] ) ? wc_get_product( $id ) : null;

		if ( ! $product instanceof WC_Product || $product instanceof WC_Product_Variation || 'trash' === $product->get_status() ) {
			continue;
		}

		$seen[ $id ] = true;
		$list[]      = array(
			'productId'   => $id,
			'name'        => ndm_pricing_plain( $row['name'] ?? '' ),
			'scope'       => in_array( $row['scope'] ?? '', NDM_PROMO_SCOPES, true ) ? $row['scope'] : 'product',
			'productName' => ndm_pricing_plain( $product->get_name() ),
		);
	}

	return array_slice( $list, 0, NDM_SPECIALS_MAX );
}

/**
 * Checks the list a save sends. Writes nothing.
 *
 * @param mixed $list The incoming "specials".
 * @return array<int,array{productId:int,name:string,scope:string}>|WP_Error
 */
function ndm_specials_clean( $list ) {
	if ( ! is_array( $list ) || ( $list && ! wp_is_numeric_array( $list ) ) ) {
		return ndm_pricing_invalid( 'specials must be a list.' );
	}

	if ( count( $list ) > NDM_SPECIALS_MAX ) {
		return ndm_pricing_invalid( sprintf( 'At most %d treatments can be shown in Monthly specials.', NDM_SPECIALS_MAX ) );
	}

	$clean = array();

	foreach ( $list as $entry ) {
		$id      = is_array( $entry ) ? ( $entry['productId'] ?? null ) : null;
		$product = is_int( $id ) && $id > 0 && ! isset( $clean[ $id ] ) ? wc_get_product( $id ) : null;

		if ( ! $product instanceof WC_Product || $product instanceof WC_Product_Variation || 'trash' === $product->get_status() ) {
			return ndm_pricing_invalid( 'Monthly specials: unknown or repeated product.', 404 );
		}

		$name = ndm_pricing_clean_text( $entry['name'] ?? '', "Monthly special $id: the card title", 80 );
		if ( is_wp_error( $name ) ) {
			return $name;
		}

		if ( ! in_array( $entry['scope'] ?? 'product', NDM_PROMO_SCOPES, true ) ) {
			return ndm_pricing_invalid( "Monthly special $id: unknown price setting." );
		}

		$clean[ $id ] = array(
			'productId' => $id,
			'name'      => $name,
			'scope'     => $entry['scope'] ?? 'product',
		);
	}

	return array_values( $clean );
}

/**
 * Stores the list. The caller clears the stored price list (ndm_pricing_flush).
 *
 * @param array<int,array{productId:int,name:string,scope:string}> $list Clean list.
 */
function ndm_specials_store( $list ) {
	update_option( NDM_SPECIALS_OPTION, $list, false );
}

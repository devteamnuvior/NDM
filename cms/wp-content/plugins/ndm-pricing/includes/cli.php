<?php
/**
 * wp ndm-pricing import: a one-time import of the site's original price list into WooCommerce, so
 * the Pricing page has real products to show. After it, WooCommerce is where prices are changed.
 *
 * It reads JSON from standard input (made by web/scripts/export-price-list.mjs):
 *
 *   [ { "id": "botox-dysport", "name": "...", "blurb": "...", "perUnit": true,
 *       "items": [ { "name": "...", "note": "...",
 *                    "options": [ { "label": "60 units", "price": 648, "regular": 720, "tag": "10% OFF" } ] } ] } ]
 *
 * Safe to run again: a category is found by its slug and a product by the key it was imported under,
 * and anything that already exists is left exactly as it is (so later edits are never overwritten).
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_IMPORT_KEY = '_ndm_pricing_import_key';

/**
 * Imports the price list.
 *
 * ## EXAMPLES
 *
 *     wp ndm-pricing import < price-list.json
 *
 * @when after_wp_load
 */
function ndm_pricing_cli_import() {
	$categories = json_decode( (string) file_get_contents( 'php://stdin' ), true );

	if ( ! is_array( $categories ) || ! $categories ) {
		WP_CLI::error( 'No price list on standard input.' );
	}

	$made = array(
		'categories' => 0,
		'products'   => 0,
		'variations' => 0,
		'skipped'    => 0,
	);

	foreach ( array_values( $categories ) as $position => $category ) {
		$term = get_term_by( 'slug', $category['id'], 'product_cat' );

		if ( $term ) {
			$term_id = (int) $term->term_id;
		} else {
			$result = wp_insert_term(
				wp_slash( $category['name'] ),
				'product_cat',
				array(
					'slug'        => $category['id'],
					'description' => wp_slash( $category['blurb'] ?? '' ),
				)
			);

			if ( is_wp_error( $result ) ) {
				WP_CLI::warning( "Category {$category['id']}: " . $result->get_error_message() );
				continue;
			}

			$term_id = (int) $result['term_id'];
			update_term_meta( $term_id, NDM_PRICING_TERM_VISIBLE, '1' );
			update_term_meta( $term_id, NDM_PRICING_TERM_ORDER, $position );
			update_term_meta( $term_id, NDM_PRICING_TERM_PER_UNIT, empty( $category['perUnit'] ) ? '0' : '1' );
			++$made['categories'];
		}

		$order = ndm_pricing_product_order( $term_id );

		foreach ( $category['items'] as $item ) {
			$key      = $category['id'] . '|' . $item['name'];
			$existing = get_posts(
				array(
					'post_type'      => 'product',
					'post_status'    => 'any',
					'meta_key'       => NDM_PRICING_IMPORT_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery
					'meta_value'     => $key, // phpcs:ignore WordPress.DB.SlowDBQuery
					'fields'         => 'ids',
					'posts_per_page' => 1,
				)
			);

			if ( $existing ) {
				++$made['skipped'];
				continue;
			}

			$attribute = new WC_Product_Attribute();
			$attribute->set_name( 'Option' );
			$attribute->set_options( wp_list_pluck( $item['options'], 'label' ) );
			$attribute->set_visible( true );
			$attribute->set_variation( true );

			$product = new WC_Product_Variable();
			$product->set_name( $item['name'] );
			$product->set_status( 'publish' );
			$product->set_short_description( $item['note'] ?? '' );
			$product->set_category_ids( array( $term_id ) );
			$product->set_attributes( array( $attribute ) );
			$product->update_meta_data( NDM_PRICING_IMPORT_KEY, $key );
			$product_id = $product->save();

			foreach ( $item['options'] as $index => $option ) {
				$variation = new WC_Product_Variation();
				$variation->set_parent_id( $product_id );
				$variation->set_attributes( array( 'option' => $option['label'] ) );
				$variation->set_status( 'publish' );
				$variation->set_menu_order( $index );

				// A regular price above the price is a WooCommerce sale; otherwise the price is the regular one.
				if ( ! empty( $option['regular'] ) && $option['regular'] > $option['price'] ) {
					$variation->set_regular_price( (string) $option['regular'] );
					$variation->set_sale_price( (string) $option['price'] );
				} else {
					$variation->set_regular_price( (string) $option['price'] );
				}

				// The clinic's offer wording is a promotional label, kept apart from the price.
				if ( ! empty( $option['tag'] ) ) {
					$variation->update_meta_data( NDM_PRICING_LABEL, sanitize_text_field( $option['tag'] ) );
					$variation->update_meta_data( NDM_PRICING_LABEL_ON, '1' );
				}

				$variation->save();
				++$made['variations'];
			}

			WC_Product_Variable::sync( $product_id );
			$order[] = $product_id;
			++$made['products'];
		}

		update_term_meta( $term_id, NDM_PRICING_TERM_PRODUCT_ORDER, array_values( array_unique( $order ) ) );
	}

	ndm_pricing_flush();

	WP_CLI::success( sprintf( '%d categories, %d products and %d variations created; %d products already there.', $made['categories'], $made['products'], $made['variations'], $made['skipped'] ) );
}
WP_CLI::add_command( 'ndm-pricing import', 'ndm_pricing_cli_import' );

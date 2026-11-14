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

/**
 * Repairs a price list that was copied into WooCommerce some other way (for example with WooCommerce's
 * own product importer) and so lacks this plugin's settings: its categories are not marked visible, so
 * the public price list is empty, and its products have no import key, so `wp ndm-pricing import`
 * would make a second copy of each and `wp ndm-pricing promotions` finds none of them.
 *
 * For every category and treatment of the original list (the same JSON as `import`) it sets, only
 * where missing: the category's visible, order and per-unit settings and its product order, the
 * product's import key, and the options' promotional labels. A product is matched by its category's
 * slug and its exact name; anything that does not match exactly is reported and left alone. Nothing is
 * created or deleted, and no price is changed: a price that differs from the original list is only
 * reported, because WooCommerce is where prices are kept.
 *
 * ## OPTIONS
 *
 * [--apply]
 * : Make the changes. Without it, only report what would change.
 *
 * ## EXAMPLES
 *
 *     wp ndm-pricing repair < price-list.json
 *     wp ndm-pricing repair --apply < price-list.json
 *
 * @when after_wp_load
 *
 * @param array $args       Positional arguments (none).
 * @param array $assoc_args Options.
 */
function ndm_pricing_cli_repair( $args, $assoc_args ) {
	$categories = json_decode( (string) file_get_contents( 'php://stdin' ), true );

	if ( ! is_array( $categories ) || ! $categories ) {
		WP_CLI::error( 'No price list on standard input.' );
	}

	$apply = ! empty( $assoc_args['apply'] );
	$made  = array(
		'category settings' => 0,
		'product orders'    => 0,
		'import keys'       => 0,
		'labels'            => 0,
		'missing'           => 0,
		'price differences' => 0,
	);
	$notes = array();

	foreach ( array_values( $categories ) as $position => $category ) {
		$term = get_term_by( 'slug', $category['id'], 'product_cat' );

		if ( ! $term ) {
			++$made['missing'];
			$notes[] = "Category not found: {$category['id']}";
			continue;
		}

		$term_id  = (int) $term->term_id;
		$settings = array(
			NDM_PRICING_TERM_VISIBLE  => '1',
			NDM_PRICING_TERM_ORDER    => $position,
			NDM_PRICING_TERM_PER_UNIT => empty( $category['perUnit'] ) ? '0' : '1',
		);

		foreach ( $settings as $meta_key => $value ) {
			if ( ! metadata_exists( 'term', $term_id, $meta_key ) ) {
				if ( $apply ) {
					update_term_meta( $term_id, $meta_key, $value );
				}
				++$made['category settings'];
			}
		}

		$in_category = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'tax_query'      => array( array( 'taxonomy' => 'product_cat', 'field' => 'term_id', 'terms' => $term_id ) ), // phpcs:ignore WordPress.DB.SlowDBQuery
			)
		);
		$order       = array();

		foreach ( $category['items'] as $item ) {
			$key     = $category['id'] . '|' . $item['name'];
			$matches = array_values(
				array_filter(
					$in_category,
					function ( $post ) use ( $item ) {
						return html_entity_decode( $post->post_title, ENT_QUOTES, 'UTF-8' ) === $item['name'];
					}
				)
			);

			if ( 1 !== count( $matches ) ) {
				++$made['missing'];
				$notes[] = sprintf( 'Product not matched (%d found): %s', count( $matches ), $key );
				continue;
			}

			$product_id = (int) $matches[0]->ID;
			$order[]    = $product_id;
			$has_key    = (string) get_post_meta( $product_id, NDM_PRICING_IMPORT_KEY, true );

			if ( '' === $has_key ) {
				if ( $apply ) {
					update_post_meta( $product_id, NDM_PRICING_IMPORT_KEY, wp_slash( $key ) );
				}
				++$made['import keys'];
			} elseif ( $has_key !== $key ) {
				$notes[] = "Product $product_id already has another import key: $has_key";
			}

			$product  = wc_get_product( $product_id );
			$by_label = array();
			foreach ( $product ? $product->get_children() : array() as $variation_id ) {
				$variation = wc_get_product( $variation_id );
				if ( $variation ) {
					$by_label[ (string) $variation->get_attribute( 'option' ) ] = $variation;
				}
			}

			foreach ( $item['options'] as $option ) {
				$variation = $by_label[ $option['label'] ] ?? null;

				if ( ! $variation ) {
					$notes[] = "Option not found: $key / {$option['label']}";
					continue;
				}

				$on_sale = ! empty( $option['regular'] ) && $option['regular'] > $option['price'];
				$regular = $on_sale ? $option['regular'] : $option['price'];
				$sale    = $on_sale ? $option['price'] : 0;
				if ( (float) $variation->get_regular_price() !== (float) $regular || (float) $variation->get_sale_price() !== (float) $sale ) {
					++$made['price differences'];
					$notes[] = sprintf( 'Price differs, left as it is: %s / %s is %s (sale %s), the original list has %s (sale %s)', $key, $option['label'], $variation->get_regular_price(), $variation->get_sale_price() ?: 'none', $regular, $sale ? $sale : 'none' );
				}

				if ( ! empty( $option['tag'] ) && '' === (string) $variation->get_meta( NDM_PRICING_LABEL ) ) {
					if ( $apply ) {
						$variation->update_meta_data( NDM_PRICING_LABEL, sanitize_text_field( $option['tag'] ) );
						$variation->update_meta_data( NDM_PRICING_LABEL_ON, '1' );
						$variation->save_meta_data();
					}
					++$made['labels'];
				}
			}
		}

		if ( $order && ! metadata_exists( 'term', $term_id, NDM_PRICING_TERM_PRODUCT_ORDER ) ) {
			if ( $apply ) {
				update_term_meta( $term_id, NDM_PRICING_TERM_PRODUCT_ORDER, $order );
			}
			++$made['product orders'];
		}
	}

	if ( $apply ) {
		ndm_pricing_flush();
	}

	foreach ( $notes as $note ) {
		WP_CLI::log( $note );
	}

	$summary = implode( ', ', array_map( fn( $name, $count ) => "$count $name", array_keys( $made ), $made ) );
	WP_CLI::success( ( $apply ? 'Repaired: ' : 'Dry run, nothing changed. Would set: ' ) . $summary . '.' );
}
WP_CLI::add_command( 'ndm-pricing repair', 'ndm_pricing_cli_repair' );

/**
 * Imports the site's original offers (the cards of the Promotion page and the offers wheel), once.
 *
 * It reads JSON from standard input (made by web/scripts/export-promotions.mjs):
 *
 *   [ { "key": "dermal-fillers|Lip Enhancement", "name": "Lip Filler", "text": "...", "area": "Face",
 *       "icon": "lips", "focus": "50% 35%", "scope": "product", "image": "lip-filler.jpg" } ]
 *
 * "key" is the key a product was imported under by `wp ndm-pricing import`. Does nothing when
 * WooCommerce already holds offers, so offers managed later are never overwritten.
 *
 * ## OPTIONS
 *
 * [--images=<dir>]
 * : Folder holding the photos named in "image". A photo becomes the product's image only when the
 *   product has none.
 *
 * ## EXAMPLES
 *
 *     wp ndm-pricing promotions --images=/tmp/promo < promotions.json
 *
 * @when after_wp_load
 *
 * @param array $args       Positional arguments (none).
 * @param array $assoc_args Options.
 */
function ndm_pricing_cli_promotions( $args, $assoc_args ) {
	$offers = json_decode( (string) file_get_contents( 'php://stdin' ), true );

	if ( ! is_array( $offers ) || ! $offers ) {
		WP_CLI::error( 'No offers on standard input.' );
	}

	if ( ndm_promotions( true ) ) {
		WP_CLI::success( 'WooCommerce already holds offers; nothing imported.' );
		return;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$dir   = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
	$made  = 0;
	$order = 0;

	foreach ( $offers as $offer ) {
		$found = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'any',
				'meta_key'       => NDM_PRICING_IMPORT_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value'     => $offer['key'], // phpcs:ignore WordPress.DB.SlowDBQuery
				'fields'         => 'ids',
				'posts_per_page' => 1,
			)
		);
		$product = $found ? wc_get_product( $found[0] ) : null;

		if ( ! $product instanceof WC_Product ) {
			WP_CLI::warning( "No product for {$offer['key']}; \"{$offer['name']}\" skipped." );
			continue;
		}

		$settings          = ndm_promo_settings( $offer );
		$settings['order'] = $order++;
		update_post_meta( $product->get_id(), NDM_PROMO_META, wp_slash( $settings ) );

		$file = '' !== $dir && ! empty( $offer['image'] ) ? $dir . '/' . basename( (string) $offer['image'] ) : '';

		if ( '' !== $file && ! $product->get_image_id() ) {
			if ( ! is_readable( $file ) ) {
				WP_CLI::warning( "Photo $file not found." );
			} else {
				// media_handle_sideload() moves the file it is given: hand it a copy.
				$copy = wp_tempnam( basename( $file ) );
				copy( $file, $copy );
				$image = media_handle_sideload(
					array(
						'name'     => basename( $file ),
						'tmp_name' => $copy,
					),
					$product->get_id()
				);

				if ( is_wp_error( $image ) ) {
					WP_CLI::warning( "Photo $file: " . $image->get_error_message() );
				} else {
					$product->set_image_id( $image );
					$product->save();
				}
			}
		}

		++$made;
	}

	ndm_pricing_flush();

	WP_CLI::success( sprintf( '%d offers imported.', $made ) );
}
WP_CLI::add_command( 'ndm-pricing promotions', 'ndm_pricing_cli_promotions' );

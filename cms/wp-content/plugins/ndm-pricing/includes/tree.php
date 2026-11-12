<?php
/**
 * Builds the price list from WooCommerce: categories, their products, and each product's variations.
 *
 * Two views of the same data:
 *   public  only what visitors may see (visible categories, published products, shown variations with a
 *           price, labels that are switched on);
 *   admin   everything, with the display settings, for the management screen.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

/**
 * One variation (or a simple product's own price) as the page needs it. Prices are WooCommerce's own
 * decimal strings, untouched.
 *
 * @param WC_Product $product Variation or simple product.
 * @return array<string,mixed>
 */
function ndm_pricing_price_fields( $product ) {
	return array(
		'price'        => (string) $product->get_price(),
		'regularPrice' => (string) $product->get_regular_price(),
		'salePrice'    => (string) $product->get_sale_price(),
		'onSale'       => (bool) $product->is_on_sale(),
		'sku'          => (string) $product->get_sku(),
		'stockStatus'  => (string) $product->get_stock_status(),
	);
}

/**
 * A variation's attributes as [name, value] pairs, in the parent product's attribute order.
 *
 * @param WC_Product_Variation $variation Variation.
 * @param WC_Product           $parent    Its parent product.
 * @return array<int,array{name:string,value:string}>
 */
function ndm_pricing_variation_attributes( $variation, $parent ) {
	$out = array();

	foreach ( array_keys( $variation->get_attributes() ) as $key ) {
		$value = ndm_pricing_plain( $variation->get_attribute( $key ) );

		if ( '' === $value ) {
			continue; // "Any ...": the variation does not fix this attribute.
		}

		$out[] = array(
			'name'  => ndm_pricing_plain( wc_attribute_label( $key, $parent ) ),
			'value' => $value,
		);
	}

	return $out;
}

/**
 * One product with its variations.
 *
 * @param WC_Product $product Product.
 * @param bool       $admin   Admin view.
 * @return array<string,mixed>
 */
function ndm_pricing_product_data( $product, $admin ) {
	$label = ndm_pricing_label_of( $product );
	$data  = array(
		'id'         => $product->get_id(),
		'type'       => $product->get_type(),
		'name'       => ndm_pricing_plain( $product->get_name() ),
		'note'       => ndm_pricing_plain( $product->get_short_description() ),
		'label'      => $admin || ( $label['enabled'] && '' !== $label['text'] ) ? $label : null,
		'variations' => array(),
	) + ndm_pricing_price_fields( $product );

	if ( $admin ) {
		$data['hidden']      = ndm_pricing_is_hidden( $product );
		$data['status']      = $product->get_status();
		// Whether options can be added to this product on the management screen.
		$data['addable']     = null !== ndm_pricing_option_attribute( $product );
		$data['categoryIds'] = array_values( array_map( 'intval', $product->get_category_ids() ) );
		// Whether it is one of the current offers (Promotions), with its card settings and photo.
		$data['promo']       = ndm_promo_settings( $product->get_meta( NDM_PROMO_META ) );
		$data['image']       = ndm_promo_image( $product );
	}

	if ( $product->is_type( 'variable' ) ) {
		$variations = array();

		foreach ( $product->get_children() as $variation_id ) {
			$variation = wc_get_product( $variation_id );

			if ( ! $variation instanceof WC_Product_Variation ) {
				continue;
			}

			$hidden  = ndm_pricing_is_hidden( $variation );
			$enabled = 'publish' === $variation->get_status();

			if ( ! $admin && ( $hidden || ! $enabled || '' === (string) $variation->get_price() ) ) {
				continue;
			}

			$attributes = ndm_pricing_variation_attributes( $variation, $product );
			$v_label    = ndm_pricing_label_of( $variation );
			$row        = array(
				'id'         => $variation->get_id(),
				'label'      => implode( ', ', wp_list_pluck( $attributes, 'value' ) ),
				'attributes' => $attributes,
				'promo'      => $admin || ( $v_label['enabled'] && '' !== $v_label['text'] ) ? $v_label : null,
				'order'      => (int) $variation->get_menu_order(),
			) + ndm_pricing_price_fields( $variation );

			if ( $admin ) {
				$row['hidden']  = $hidden;
				$row['enabled'] = $enabled;
			}

			$variations[] = $row;
		}

		// get_children() already follows WooCommerce's variation order (menu_order, then ID).
		$data['variations'] = $variations;
	}

	return $data;
}

/**
 * Product IDs that sit directly in a category, in the page's order: the saved order first, then the
 * rest by WooCommerce's own menu order and name.
 *
 * @param int $term_id Category ID.
 * @return int[]
 */
function ndm_pricing_category_product_ids( $term_id ) {
	$ids = get_objects_in_term( $term_id, 'product_cat' );

	if ( is_wp_error( $ids ) || ! $ids ) {
		return array();
	}

	$ids   = array_map( 'intval', $ids );
	$saved = array_values( array_intersect( ndm_pricing_product_order( $term_id ), $ids ) );
	$rest  = array_diff( $ids, $saved );

	if ( $rest ) {
		$rest = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'any',
				'post__in'       => $rest,
				'orderby'        => array(
					'menu_order' => 'ASC',
					'title'      => 'ASC',
				),
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
			)
		);
	}

	return array_merge( $saved, array_map( 'intval', $rest ) );
}

/**
 * The whole price list.
 *
 * @param bool $admin Admin view (everything) or public view (only what visitors may see).
 * @return array<string,mixed>
 */
function ndm_pricing_tree( $admin = false ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
		)
	);

	if ( is_wp_error( $terms ) ) {
		$terms = array();
	}

	$rows = array();

	foreach ( $terms as $term ) {
		$visible = '1' === (string) get_term_meta( $term->term_id, NDM_PRICING_TERM_VISIBLE, true );

		if ( ! $admin && ! $visible ) {
			continue;
		}

		$order  = get_term_meta( $term->term_id, NDM_PRICING_TERM_ORDER, true );
		$rows[] = array(
			'term'    => $term,
			'visible' => $visible,
			'order'   => '' === $order ? PHP_INT_MAX : (int) $order,
		);
	}

	usort(
		$rows,
		static function ( $a, $b ) {
			return array( $a['order'], $a['term']->name ) <=> array( $b['order'], $b['term']->name );
		}
	);

	$built      = array(); // Each product is read once, even when it sits in several categories.
	$categories = array();

	foreach ( $rows as $index => $row ) {
		$term     = $row['term'];
		$products = array();

		foreach ( ndm_pricing_category_product_ids( $term->term_id ) as $product_id ) {
			if ( ! array_key_exists( $product_id, $built ) ) {
				$product = wc_get_product( $product_id );
				$usable  = $product instanceof WC_Product && ( $admin ? 'trash' !== $product->get_status() : 'publish' === $product->get_status() && ! ndm_pricing_is_hidden( $product ) );

				$built[ $product_id ] = $usable ? ndm_pricing_product_data( $product, $admin ) : null;
			}

			$data = $built[ $product_id ];

			if ( null === $data ) {
				continue;
			}

			// The public page never shows a product that has nothing to price.
			if ( ! $admin && ( 'variable' === $data['type'] ? ! $data['variations'] : '' === $data['price'] ) ) {
				continue;
			}

			$products[] = $data;
		}

		if ( ! $admin && ! $products ) {
			continue;
		}

		$category = array(
			'id'          => (int) $term->term_id,
			'slug'        => $term->slug,
			'name'        => ndm_pricing_plain( $term->name ),
			'description' => ndm_pricing_plain( $term->description ),
			'perUnit'     => '1' === (string) get_term_meta( $term->term_id, NDM_PRICING_TERM_PER_UNIT, true ),
			'products'    => $products,
		);

		if ( $admin ) {
			$category['visible'] = $row['visible'];
			$category['order']   = $index;
		}

		$categories[] = $category;
	}

	return array(
		'currency'   => get_woocommerce_currency(),
		'categories' => $categories,
	);
}

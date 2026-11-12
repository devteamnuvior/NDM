<?php
/**
 * Takes one set of changes from the management screen and writes it to WooCommerce.
 *
 * The request describes the wanted state of what was edited:
 *
 *   {
 *     "createCategories": [ { "ref": "new-1", "name": "...", "description": "...", "visible": true, "perUnit": false } ],
 *     "categories":       [ { "id": 12 | "new-1", "name"?, "description"?, "visible"?, "perUnit"?, "products"?: [ 33, 34 ] } ],
 *     "categoryOrder":    [ 12, "new-1", 7 ],
 *     "products":         [ { "id": 33, "name"?, "note"?, "hidden"?, "label"?: { "text": "...", "enabled": true },
 *                             "regularPrice"?: "120", "salePrice"?: "",          (a product without variations)
 *                             "addVariations"?: [ { "ref": "newv-1", "name": "Package of 3", "regularPrice": "300",
 *                                                   "salePrice"?, "hidden"?, "label"? } ],
 *                             "removeVariations"?: [ 56 ],
 *                             "variationOrder"?: [ 57, "newv-1", 55 ] } ],
 *     "variations":       [ { "id": 55, "hidden"?, "label"?: { "text": "...", "enabled": true },
 *                             "regularPrice"?: "720", "salePrice"?: "648" } ]
 *   }
 *
 * "products" inside a category is that category's full list, in order: products missing from it are
 * taken out of the category, new ones are put in, and the order is kept. "variationOrder" is every
 * variation the product will have (new ones by their ref), in the wanted order (WooCommerce's own menu
 * order). Prices are WooCommerce's regular and sale price, as text; an empty sale price means none.
 * Everything is checked first; nothing is written when any part is wrong. Existing records are updated
 * in place, so product, variation and category IDs never change. No product or category is ever
 * deleted; a removed variation goes to the trash.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_MAX_ENTRIES = 1000;

/**
 * A "this request is wrong" error.
 *
 * @param string $message What is wrong.
 * @param int    $status  HTTP status.
 * @return WP_Error
 */
function ndm_pricing_invalid( $message, $status = 400 ) {
	return new WP_Error( 'ndm_pricing_invalid', $message, array( 'status' => $status ) );
}

/**
 * Cleans one line of text and checks its length.
 *
 * @param mixed  $value    Incoming value.
 * @param string $field    Field name for the error message.
 * @param int    $max      Longest length accepted.
 * @param bool   $required Whether an empty text is refused.
 * @param bool   $lines    Whether line breaks are kept.
 * @return string|WP_Error
 */
function ndm_pricing_clean_text( $value, $field, $max, $required = false, $lines = false ) {
	if ( ! is_string( $value ) ) {
		return ndm_pricing_invalid( "$field must be text." );
	}

	$text = $lines ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );

	if ( $required && '' === $text ) {
		return ndm_pricing_invalid( "$field cannot be empty." );
	}

	if ( mb_strlen( $text ) > $max ) {
		return ndm_pricing_invalid( "$field is longer than $max characters." );
	}

	return $text;
}

/**
 * Checks the optional fields shared by products and variations: hidden and label.
 *
 * @param array  $entry Incoming entry.
 * @param string $what  "Product 33", for error messages.
 * @return array|WP_Error Clean fields.
 */
function ndm_pricing_clean_display( $entry, $what ) {
	$clean = array();

	if ( array_key_exists( 'hidden', $entry ) ) {
		if ( ! is_bool( $entry['hidden'] ) ) {
			return ndm_pricing_invalid( "$what: hidden must be true or false." );
		}
		$clean['hidden'] = $entry['hidden'];
	}

	if ( array_key_exists( 'label', $entry ) ) {
		$label = $entry['label'];

		if ( ! is_array( $label ) || ! isset( $label['text'], $label['enabled'] ) || ! is_bool( $label['enabled'] ) ) {
			return ndm_pricing_invalid( "$what: label needs a text and an enabled flag." );
		}

		$text = ndm_pricing_clean_text( $label['text'], "$what label", NDM_PRICING_LABEL_MAX );

		if ( is_wp_error( $text ) ) {
			return $text;
		}

		$clean['label'] = array(
			'text'    => $text,
			'enabled' => $label['enabled'] && '' !== $text,
		);
	}

	return $clean;
}

/**
 * Checks the optional fields of a category: name, description, visible, perUnit.
 *
 * @param array  $entry    Incoming entry.
 * @param string $what     "Category 12", for error messages.
 * @param bool   $creating Whether the category is new (a name is then required).
 * @return array|WP_Error Clean fields.
 */
function ndm_pricing_clean_category( $entry, $what, $creating ) {
	$clean = array();

	if ( $creating || array_key_exists( 'name', $entry ) ) {
		$name = ndm_pricing_clean_text( $entry['name'] ?? null, "$what name", NDM_PRICING_NAME_MAX, true );

		if ( is_wp_error( $name ) ) {
			return $name;
		}
		$clean['name'] = $name;
	}

	if ( array_key_exists( 'description', $entry ) ) {
		$description = ndm_pricing_clean_text( $entry['description'], "$what description", NDM_PRICING_TEXT_MAX, false, true );

		if ( is_wp_error( $description ) ) {
			return $description;
		}
		$clean['description'] = $description;
	}

	foreach ( array( 'visible', 'perUnit' ) as $flag ) {
		if ( array_key_exists( $flag, $entry ) ) {
			if ( ! is_bool( $entry[ $flag ] ) ) {
				return ndm_pricing_invalid( "$what: $flag must be true or false." );
			}
			$clean[ $flag ] = $entry[ $flag ];
		}
	}

	return $clean;
}

/**
 * Reads a list from the request body, refusing anything that is not a plain list of sensible size.
 *
 * @param array  $body Request body.
 * @param string $key  Key to read.
 * @return array|WP_Error
 */
function ndm_pricing_list( $body, $key ) {
	$list = $body[ $key ] ?? array();

	if ( ! is_array( $list ) || ! wp_is_numeric_array( $list ) && $list ) {
		return ndm_pricing_invalid( "$key must be a list." );
	}

	if ( count( $list ) > NDM_PRICING_MAX_ENTRIES ) {
		return ndm_pricing_invalid( "$key has too many entries." );
	}

	return $list;
}

/**
 * Checks a whole set of changes and turns it into a plan. Writes nothing.
 *
 * @param mixed $body Decoded request body.
 * @return array|WP_Error The plan.
 */
function ndm_pricing_plan( $body ) {
	if ( ! is_array( $body ) ) {
		return ndm_pricing_invalid( 'The request body must be a JSON object.' );
	}

	$unknown = array_diff( array_keys( $body ), array( 'createCategories', 'categories', 'categoryOrder', 'products', 'variations' ) );

	if ( $unknown ) {
		return ndm_pricing_invalid( 'Unknown field: ' . sanitize_key( (string) reset( $unknown ) ) . '.' );
	}

	$plan = array(
		'create'     => array(),
		'categories' => array(),
		'order'      => null,
		'products'   => array(),
		'variations' => array(),
	);

	// New categories.
	$list = ndm_pricing_list( $body, 'createCategories' );
	if ( is_wp_error( $list ) ) {
		return $list;
	}

	foreach ( $list as $entry ) {
		$ref = is_array( $entry ) ? ( $entry['ref'] ?? null ) : null;

		if ( ! is_string( $ref ) || ! preg_match( '/^new-[a-z0-9-]{1,40}$/', $ref ) || isset( $plan['create'][ $ref ] ) ) {
			return ndm_pricing_invalid( 'Every new category needs its own ref such as "new-1".' );
		}

		$clean = ndm_pricing_clean_category( $entry, 'New category', true );
		if ( is_wp_error( $clean ) ) {
			return $clean;
		}

		if ( term_exists( $clean['name'], 'product_cat' ) ) {
			return ndm_pricing_invalid( sprintf( 'A category named "%s" already exists.', $clean['name'] ), 409 );
		}

		$plan['create'][ $ref ] = $clean;
	}

	// A category is an existing product_cat ID, or the ref of one created by this request.
	$category_key = static function ( $id ) use ( $plan ) {
		if ( is_string( $id ) && isset( $plan['create'][ $id ] ) ) {
			return $id;
		}

		return is_int( $id ) && $id > 0 && term_exists( $id, 'product_cat' ) ? $id : null;
	};

	// Changes to categories.
	$list = ndm_pricing_list( $body, 'categories' );
	if ( is_wp_error( $list ) ) {
		return $list;
	}

	foreach ( $list as $entry ) {
		$key = is_array( $entry ) ? $category_key( $entry['id'] ?? null ) : null;

		if ( null === $key || isset( $plan['categories'][ $key ] ) ) {
			return ndm_pricing_invalid( 'Unknown or repeated category.', 404 );
		}

		$clean = ndm_pricing_clean_category( $entry, "Category $key", false );
		if ( is_wp_error( $clean ) ) {
			return $clean;
		}

		if ( isset( $clean['name'] ) && is_int( $key ) ) {
			$other = get_term_by( 'name', $clean['name'], 'product_cat' );

			if ( $other && (int) $other->term_id !== $key ) {
				return ndm_pricing_invalid( sprintf( 'A category named "%s" already exists.', $clean['name'] ), 409 );
			}
		}

		if ( array_key_exists( 'products', $entry ) ) {
			$ids = $entry['products'];

			if ( ! is_array( $ids ) || count( $ids ) > NDM_PRICING_MAX_ENTRIES || $ids !== array_values( array_unique( array_filter( $ids, 'is_int' ) ) ) ) {
				return ndm_pricing_invalid( "Category $key: products must be a list of product IDs without repeats." );
			}

			foreach ( $ids as $product_id ) {
				if ( 'product' !== get_post_type( $product_id ) || 'trash' === get_post_status( $product_id ) ) {
					return ndm_pricing_invalid( "Product $product_id does not exist.", 404 );
				}
			}

			$clean['products'] = $ids;
		}

		$plan['categories'][ $key ] = $clean;
	}

	// Category order.
	if ( array_key_exists( 'categoryOrder', $body ) ) {
		$list = ndm_pricing_list( $body, 'categoryOrder' );
		if ( is_wp_error( $list ) ) {
			return $list;
		}

		$order = array();

		foreach ( $list as $id ) {
			$key = $category_key( $id );

			if ( null === $key || in_array( $key, $order, true ) ) {
				return ndm_pricing_invalid( 'categoryOrder holds an unknown or repeated category.', 404 );
			}
			$order[] = $key;
		}

		$plan['order'] = $order;
	}

	// Products.
	$list = ndm_pricing_list( $body, 'products' );
	if ( is_wp_error( $list ) ) {
		return $list;
	}

	foreach ( $list as $entry ) {
		$id = is_array( $entry ) ? ( $entry['id'] ?? null ) : null;

		if ( ! is_int( $id ) || 'product' !== get_post_type( $id ) || 'trash' === get_post_status( $id ) || isset( $plan['products'][ $id ] ) ) {
			return ndm_pricing_invalid( 'Unknown or repeated product.', 404 );
		}

		$clean = ndm_pricing_clean_display( $entry, "Product $id" );
		if ( is_wp_error( $clean ) ) {
			return $clean;
		}

		if ( array_key_exists( 'name', $entry ) ) {
			$name = ndm_pricing_clean_text( $entry['name'], "Product $id name", NDM_PRICING_NAME_MAX, true );
			if ( is_wp_error( $name ) ) {
				return $name;
			}
			$clean['name'] = $name;
		}

		if ( array_key_exists( 'note', $entry ) ) {
			$note = ndm_pricing_clean_text( $entry['note'], "Product $id description", NDM_PRICING_TEXT_MAX, false, true );
			if ( is_wp_error( $note ) ) {
				return $note;
			}
			$clean['note'] = $note;
		}

		$product  = wc_get_product( $id );
		$variable = $product instanceof WC_Product && $product->is_type( 'variable' );
		$children = $variable ? array_map( 'intval', $product->get_children() ) : array();

		// The price of a product without variations.
		if ( array_key_exists( 'regularPrice', $entry ) || array_key_exists( 'salePrice', $entry ) ) {
			if ( $variable || ! $product instanceof WC_Product ) {
				return ndm_pricing_invalid( "Product $id: its prices are set on its options." );
			}

			$prices = ndm_pricing_clean_prices( $entry, "Product $id", $product );
			if ( is_wp_error( $prices ) ) {
				return $prices;
			}
			$clean += $prices;
		}

		// Options to take away: this product's own variations only.
		$remove = $entry['removeVariations'] ?? array();

		if ( ! is_array( $remove ) || $remove !== array_values( array_unique( array_filter( $remove, 'is_int' ) ) ) || array_diff( $remove, $children ) ) {
			return ndm_pricing_invalid( "Product $id: removeVariations must list variations of this product." );
		}

		// Options to add.
		$adds = $entry['addVariations'] ?? array();

		if ( ! is_array( $adds ) || count( $adds ) > 50 || ( $adds && ! wp_is_numeric_array( $adds ) ) ) {
			return ndm_pricing_invalid( "Product $id: addVariations must be a list." );
		}

		if ( $adds && ( ! $variable || ! ndm_pricing_option_attribute( $product ) ) ) {
			return ndm_pricing_invalid( "Product $id: options for this product are added in WooCommerce (it is not set up with one simple option list)." );
		}

		$taken = $variable ? ndm_pricing_option_names( $product, $remove ) : array();
		$new   = array();

		foreach ( $adds as $add ) {
			$ref = is_array( $add ) ? ( $add['ref'] ?? null ) : null;

			if ( ! is_string( $ref ) || ! preg_match( '/^newv-[a-z0-9-]{1,40}$/', $ref ) || isset( $new[ $ref ] ) ) {
				return ndm_pricing_invalid( "Product $id: every new option needs its own ref such as \"newv-1\"." );
			}

			$name = ndm_pricing_clean_text( $add['name'] ?? null, "Product $id new option name", NDM_PRICING_OPTION_MAX, true );
			if ( is_wp_error( $name ) ) {
				return $name;
			}

			// WooCommerce separates option names with "|", so a name cannot hold one.
			if ( false !== strpos( $name, '|' ) || in_array( mb_strtolower( $name ), $taken, true ) ) {
				return ndm_pricing_invalid( sprintf( 'Product %d already has an option named "%s", or the name cannot be used.', $id, $name ), 409 );
			}
			$taken[] = mb_strtolower( $name );

			$fields = ndm_pricing_clean_display( $add, "Product $id new option" );
			if ( is_wp_error( $fields ) ) {
				return $fields;
			}

			$prices = ndm_pricing_clean_prices( $add, "Product $id new option", null );
			if ( is_wp_error( $prices ) ) {
				return $prices;
			}

			$new[ $ref ] = array( 'name' => $name ) + $fields + $prices;
		}

		if ( $remove ) {
			$clean['removeVariations'] = $remove;
		}
		if ( $new ) {
			$clean['addVariations'] = $new;
		}

		if ( array_key_exists( 'variationOrder', $entry ) ) {
			$order  = $entry['variationOrder'];
			$wanted = array_map( 'strval', array_merge( array_diff( $children, $remove ), array_keys( $new ) ) );
			$given  = is_array( $order ) ? array_map( 'strval', array_filter( $order, static fn( $v ) => is_int( $v ) || is_string( $v ) ) ) : array();
			sort( $wanted );
			sort( $given );

			// Exactly the variations the product will have, each once: nothing is dropped or borrowed.
			if ( ! is_array( $order ) || ! $wanted || count( $order ) !== count( $given ) || $given !== $wanted ) {
				return ndm_pricing_invalid( "Product $id: variationOrder must list each of its variations once." );
			}

			$clean['variationOrder'] = $order;
		}

		$plan['products'][ $id ] = $clean;
	}

	// Variations.
	$list = ndm_pricing_list( $body, 'variations' );
	if ( is_wp_error( $list ) ) {
		return $list;
	}

	foreach ( $list as $entry ) {
		$id = is_array( $entry ) ? ( $entry['id'] ?? null ) : null;

		if ( ! is_int( $id ) || 'product_variation' !== get_post_type( $id ) || isset( $plan['variations'][ $id ] ) ) {
			return ndm_pricing_invalid( 'Unknown or repeated variation.', 404 );
		}

		$clean = ndm_pricing_clean_display( $entry, "Variation $id" );
		if ( is_wp_error( $clean ) ) {
			return $clean;
		}

		$prices = ndm_pricing_clean_prices( $entry, "Variation $id", wc_get_product( $id ) );
		if ( is_wp_error( $prices ) ) {
			return $prices;
		}

		$plan['variations'][ $id ] = $clean + $prices;
	}

	return $plan;
}

/**
 * Writes the display fields (hidden, label) of a product or variation.
 *
 * @param WC_Product $product Product or variation.
 * @param array      $clean   Clean fields.
 */
function ndm_pricing_apply_display( $product, $clean ) {
	if ( isset( $clean['hidden'] ) ) {
		if ( $clean['hidden'] ) {
			$product->update_meta_data( NDM_PRICING_HIDDEN, '1' );
		} else {
			$product->delete_meta_data( NDM_PRICING_HIDDEN );
		}
	}

	if ( isset( $clean['label'] ) ) {
		if ( '' === $clean['label']['text'] ) {
			$product->delete_meta_data( NDM_PRICING_LABEL );
			$product->delete_meta_data( NDM_PRICING_LABEL_ON );
		} else {
			$product->update_meta_data( NDM_PRICING_LABEL, $clean['label']['text'] );
			$product->update_meta_data( NDM_PRICING_LABEL_ON, $clean['label']['enabled'] ? '1' : '0' );
		}
	}
}

/**
 * Puts a category's product list into WooCommerce: membership and order.
 *
 * @param int   $term_id Category ID.
 * @param int[] $wanted  Product IDs, in order.
 */
function ndm_pricing_apply_members( $term_id, $wanted ) {
	$current = get_objects_in_term( $term_id, 'product_cat' );
	$current = is_wp_error( $current ) ? array() : array_map( 'intval', $current );
	$default = (int) get_option( 'default_product_cat', 0 );

	foreach ( array_merge( array_diff( $wanted, $current ), array_diff( $current, $wanted ) ) as $product_id ) {
		$product = wc_get_product( $product_id );

		if ( ! $product instanceof WC_Product ) {
			continue;
		}

		$ids = array_map( 'intval', $product->get_category_ids( 'edit' ) );

		if ( in_array( $product_id, $wanted, true ) ) {
			// As in wp-admin: a product that gets a real category leaves the default "Uncategorized" one.
			$ids = array_merge( array_diff( $ids, array( $default ) ), array( $term_id ) );
		} else {
			$ids = array_diff( $ids, array( $term_id ) );
		}

		// A product left without a category falls back to WooCommerce's default one; it is never deleted.
		$product->set_category_ids( array_values( array_unique( $ids ) ) );
		$product->save();
	}

	update_term_meta( $term_id, NDM_PRICING_TERM_PRODUCT_ORDER, array_values( $wanted ) );
}

/**
 * Carries out a plan made by ndm_pricing_plan().
 *
 * @param array $plan The plan.
 * @return array|WP_Error Map of new category refs to their IDs.
 */
function ndm_pricing_apply( $plan ) {
	$created = array();
	$parents = array();

	foreach ( $plan['create'] as $ref => $clean ) {
		$result = wp_insert_term( wp_slash( $clean['name'] ), 'product_cat', array( 'description' => wp_slash( $clean['description'] ?? '' ) ) );

		if ( is_wp_error( $result ) ) {
			return ndm_pricing_invalid( $result->get_error_message(), 409 );
		}

		$term_id         = (int) $result['term_id'];
		$created[ $ref ] = $term_id;

		update_term_meta( $term_id, NDM_PRICING_TERM_VISIBLE, empty( $clean['visible'] ) ? '0' : '1' );
		update_term_meta( $term_id, NDM_PRICING_TERM_PER_UNIT, empty( $clean['perUnit'] ) ? '0' : '1' );
	}

	$term_id_of = static function ( $key ) use ( $created ) {
		return is_int( $key ) ? $key : $created[ $key ];
	};

	foreach ( $plan['categories'] as $key => $clean ) {
		$term_id = $term_id_of( $key );
		$fields  = array();

		if ( isset( $clean['name'] ) ) {
			$fields['name'] = wp_slash( $clean['name'] );
		}
		if ( isset( $clean['description'] ) ) {
			$fields['description'] = wp_slash( $clean['description'] );
		}

		if ( $fields ) {
			// Name and description only: the slug and the ID stay as they are.
			$result = wp_update_term( $term_id, 'product_cat', $fields );

			if ( is_wp_error( $result ) ) {
				return ndm_pricing_invalid( $result->get_error_message(), 409 );
			}
		}

		if ( isset( $clean['visible'] ) ) {
			update_term_meta( $term_id, NDM_PRICING_TERM_VISIBLE, $clean['visible'] ? '1' : '0' );
		}
		if ( isset( $clean['perUnit'] ) ) {
			update_term_meta( $term_id, NDM_PRICING_TERM_PER_UNIT, $clean['perUnit'] ? '1' : '0' );
		}
		if ( isset( $clean['products'] ) ) {
			ndm_pricing_apply_members( $term_id, $clean['products'] );
		}
	}

	if ( null !== $plan['order'] ) {
		foreach ( $plan['order'] as $position => $key ) {
			update_term_meta( $term_id_of( $key ), NDM_PRICING_TERM_ORDER, $position );
		}
	}

	foreach ( $plan['products'] as $id => $clean ) {
		$product = wc_get_product( $id );

		if ( ! $product instanceof WC_Product ) {
			continue;
		}

		if ( isset( $clean['name'] ) ) {
			$product->set_name( $clean['name'] );
		}
		if ( isset( $clean['note'] ) ) {
			$product->set_short_description( $clean['note'] );
		}

		ndm_pricing_apply_display( $product, $clean );
		ndm_pricing_apply_prices( $product, $clean );
		$product->save();

		foreach ( $clean['removeVariations'] ?? array() as $variation_id ) {
			ndm_pricing_remove_variation( $product, $variation_id );
			$parents[ $id ] = true;
		}

		$added = array();

		foreach ( $clean['addVariations'] ?? array() as $ref => $fields ) {
			$added[ $ref ]  = ndm_pricing_add_variation( wc_get_product( $id ), $fields );
			$parents[ $id ] = true;
		}

		if ( isset( $clean['variationOrder'] ) ) {
			foreach ( $clean['variationOrder'] as $position => $variation_id ) {
				$variation = wc_get_product( is_int( $variation_id ) ? $variation_id : ( $added[ $variation_id ] ?? 0 ) );

				if ( $variation instanceof WC_Product_Variation && (int) $variation->get_menu_order() !== $position ) {
					$variation->set_menu_order( $position );
					$variation->save();
				}
			}

			$parents[ $id ] = true;
		}
	}

	foreach ( $plan['variations'] as $id => $clean ) {
		$variation = wc_get_product( $id );

		if ( $variation instanceof WC_Product_Variation && 'trash' !== $variation->get_status() ) {
			ndm_pricing_apply_display( $variation, $clean );
			ndm_pricing_apply_prices( $variation, $clean );
			$variation->save();

			if ( isset( $clean['regularPrice'] ) || isset( $clean['salePrice'] ) ) {
				$parents[ (int) $variation->get_parent_id() ] = true;
			}
		}
	}

	// A product whose options or prices changed gets its own price range worked out again by WooCommerce.
	foreach ( array_keys( $parents ) as $parent_id ) {
		wc_delete_product_transients( $parent_id );
		WC_Product_Variable::sync( $parent_id );
	}

	ndm_pricing_flush();

	return $created;
}

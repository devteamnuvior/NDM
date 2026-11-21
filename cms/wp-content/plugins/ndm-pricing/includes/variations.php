<?php
/**
 * Prices and options (variations), for the management screen: checking a price, finding the attribute a
 * product's options hang on, adding an option and taking one away.
 *
 * Existing variations are changed in place and keep their IDs. A removed variation is moved to the
 * trash, not erased, so it can be brought back.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_OPTION_MAX = 100;

/**
 * Checks one price: digits with at most two decimals, as WooCommerce stores it.
 *
 * @param mixed  $value       Incoming value.
 * @param string $what        "Variation 20 regular price", for the error message.
 * @param bool   $allow_empty Whether an empty price ("no sale price") is accepted.
 * @return string|WP_Error
 */
function ndm_pricing_clean_price( $value, $what, $allow_empty ) {
	if ( ! is_string( $value ) ) {
		return ndm_pricing_invalid( "$what must be text such as \"120\" or \"99.50\"." );
	}

	$value = trim( $value );

	if ( '' === $value ) {
		return $allow_empty ? '' : ndm_pricing_invalid( "$what cannot be empty." );
	}

	if ( ! preg_match( '/^\d{1,7}(\.\d{1,2})?$/', $value ) ) {
		return ndm_pricing_invalid( "$what must be a number such as 120 or 99.50." );
	}

	return $value;
}

/**
 * Checks the optional price fields of an entry (regularPrice, salePrice) against each other and against
 * what the product holds now: a sale price needs a regular price above it.
 *
 * @param array           $entry   Incoming entry.
 * @param string          $what    "Variation 20", for error messages.
 * @param WC_Product|null $current The product or variation as it is now; null for a new one.
 * @return array|WP_Error Clean fields: regularPrice and / or salePrice.
 */
function ndm_pricing_clean_prices( $entry, $what, $current ) {
	$clean = array();

	if ( array_key_exists( 'regularPrice', $entry ) || null === $current ) {
		$regular = ndm_pricing_clean_price( $entry['regularPrice'] ?? null, "$what regular price", false );

		if ( is_wp_error( $regular ) ) {
			return $regular;
		}
		$clean['regularPrice'] = $regular;
	}

	if ( array_key_exists( 'salePrice', $entry ) ) {
		$sale = ndm_pricing_clean_price( $entry['salePrice'], "$what sale price", true );

		if ( is_wp_error( $sale ) ) {
			return $sale;
		}
		$clean['salePrice'] = $sale;
	}

	if ( ! $clean ) {
		return $clean;
	}

	$regular = $clean['regularPrice'] ?? ( $current ? (string) $current->get_regular_price( 'edit' ) : '' );
	$sale    = $clean['salePrice'] ?? ( $current ? (string) $current->get_sale_price( 'edit' ) : '' );

	if ( '' !== $sale && ( '' === $regular || (float) $sale >= (float) $regular ) ) {
		return ndm_pricing_invalid( "$what: the sale price must be lower than the regular price." );
	}

	return $clean;
}

/**
 * Writes clean price fields to a product or variation.
 *
 * @param WC_Product $product Product or variation.
 * @param array      $clean   Clean fields.
 */
function ndm_pricing_apply_prices( $product, $clean ) {
	if ( isset( $clean['regularPrice'] ) ) {
		$product->set_regular_price( $clean['regularPrice'] );
	}
	if ( isset( $clean['salePrice'] ) ) {
		$product->set_sale_price( $clean['salePrice'] );
	}
}

/**
 * The one attribute a product's options hang on, when options can be added here: a variable product
 * with exactly one attribute used for variations, written on the product itself (not a shared,
 * site-wide attribute). Anything more involved is set up in WooCommerce.
 *
 * @param WC_Product $product Product.
 * @return WC_Product_Attribute|null
 */
function ndm_pricing_option_attribute( $product ) {
	if ( ! $product->is_type( 'variable' ) ) {
		return null;
	}

	$found = array();

	foreach ( $product->get_attributes( 'edit' ) as $attribute ) {
		if ( $attribute instanceof WC_Product_Attribute && $attribute->get_variation() ) {
			$found[] = $attribute;
		}
	}

	return 1 === count( $found ) && ! $found[0]->is_taxonomy() ? $found[0] : null;
}

/**
 * The option names a product's variations use now, in lower case.
 *
 * @param WC_Product $product Variable product.
 * @param int[]      $skip    Variation IDs to leave out.
 * @return string[]
 */
function ndm_pricing_option_names( $product, $skip = array() ) {
	$names = array();

	foreach ( $product->get_children() as $child_id ) {
		if ( in_array( (int) $child_id, $skip, true ) ) {
			continue;
		}

		$variation = wc_get_product( $child_id );

		if ( $variation instanceof WC_Product_Variation ) {
			$names[] = mb_strtolower( implode( ', ', array_filter( array_map( 'ndm_pricing_plain', $variation->get_attributes() ) ) ) );
		}
	}

	return $names;
}

/**
 * Writes the option names of a product's attribute, keeping the order they already have.
 *
 * @param WC_Product           $product   Variable product.
 * @param WC_Product_Attribute $attribute Its option attribute.
 * @param string[]             $options   Option names.
 */
function ndm_pricing_set_options( $product, $attribute, $options ) {
	$attributes = $product->get_attributes( 'edit' );

	foreach ( $attributes as $key => $existing ) {
		if ( $existing instanceof WC_Product_Attribute && $existing->get_name() === $attribute->get_name() ) {
			$existing->set_options( array_values( array_unique( $options ) ) );
			$attributes[ $key ] = $existing;
		}
	}

	$product->set_attributes( $attributes );
	$product->save();
}

/**
 * Adds one option to a product: a new variation with its own price.
 *
 * @param WC_Product $product Variable product.
 * @param array      $clean   Clean fields: name, regularPrice, optional salePrice, hidden, label.
 * @return int The new variation's ID, 0 when the product cannot take options here.
 */
function ndm_pricing_add_variation( $product, $clean ) {
	$attribute = ndm_pricing_option_attribute( $product );

	if ( ! $attribute ) {
		return 0;
	}

	$options = $attribute->get_options();

	if ( ! in_array( $clean['name'], $options, true ) ) {
		$options[] = $clean['name'];
		ndm_pricing_set_options( $product, $attribute, $options );
	}

	$variation = new WC_Product_Variation();
	$variation->set_parent_id( $product->get_id() );
	$variation->set_attributes( array( sanitize_title( $attribute->get_name() ) => $clean['name'] ) );
	$variation->set_status( 'publish' );
	ndm_pricing_apply_prices( $variation, $clean );
	ndm_pricing_apply_display( $variation, $clean );

	return (int) $variation->save();
}

/**
 * Takes one option away: its variation goes to the trash (it can be restored from there), and its
 * name leaves the product's list of options when no other variation uses it.
 *
 * @param WC_Product $product      Variable product.
 * @param int        $variation_id Variation ID.
 */
function ndm_pricing_remove_variation( $product, $variation_id ) {
	$variation = wc_get_product( $variation_id );

	if ( ! $variation instanceof WC_Product_Variation || (int) $variation->get_parent_id() !== $product->get_id() ) {
		return;
	}

	$name = implode( ', ', array_filter( array_map( 'ndm_pricing_plain', $variation->get_attributes() ) ) );
	$variation->delete( false );
	wc_delete_product_transients( $product->get_id() );

	$fresh     = wc_get_product( $product->get_id() );
	$attribute = $fresh ? ndm_pricing_option_attribute( $fresh ) : null;

	if ( $attribute && '' !== $name && ! in_array( mb_strtolower( $name ), ndm_pricing_option_names( $fresh ), true ) ) {
		ndm_pricing_set_options( $fresh, $attribute, array_diff( $attribute->get_options(), array( $name ) ) );
	}
}

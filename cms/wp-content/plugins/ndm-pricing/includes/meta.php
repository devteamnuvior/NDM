<?php
/**
 * The Pricing page's display settings, kept as metadata beside WooCommerce's own records.
 *
 * Product category (term meta on product_cat):
 *   ndm_pricing_visible        "1" when the category shows on the Pricing page. Missing means hidden,
 *                              so a category made in WooCommerce never appears by accident.
 *   ndm_pricing_order          Position of the category on the page (0 first).
 *   ndm_pricing_per_unit       "1" when the category is priced per unit.
 *   ndm_pricing_product_order  Product IDs in the order they show inside this category.
 *
 * Product and variation (post meta):
 *   _ndm_pricing_hidden        "1" hides it on the Pricing page only (the product itself is untouched).
 *   _ndm_pricing_label         Promotional label text, for example "Save $1000 Off". Never a price.
 *   _ndm_pricing_label_on      "1" when the label is shown.
 *
 * Names, descriptions, prices, sale prices, SKUs, stock and attributes are WooCommerce's own fields.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_TERM_VISIBLE       = 'ndm_pricing_visible';
const NDM_PRICING_TERM_ORDER         = 'ndm_pricing_order';
const NDM_PRICING_TERM_PER_UNIT      = 'ndm_pricing_per_unit';
const NDM_PRICING_TERM_PRODUCT_ORDER = 'ndm_pricing_product_order';

const NDM_PRICING_HIDDEN   = '_ndm_pricing_hidden';
const NDM_PRICING_LABEL    = '_ndm_pricing_label';
const NDM_PRICING_LABEL_ON = '_ndm_pricing_label_on';

const NDM_PRICING_NAME_MAX  = 200;
const NDM_PRICING_TEXT_MAX  = 600;
const NDM_PRICING_LABEL_MAX = 60;

/**
 * Text as stored by WordPress, ready for JSON: entities decoded, no markup.
 *
 * @param string $text Stored text.
 * @return string Plain text.
 */
function ndm_pricing_plain( $text ) {
	return trim( html_entity_decode( wp_strip_all_tags( (string) $text ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
}

/**
 * The promotional label of a product or variation.
 *
 * @param WC_Product $product Product or variation.
 * @return array{text:string,enabled:bool}
 */
function ndm_pricing_label_of( $product ) {
	return array(
		'text'    => ndm_pricing_plain( $product->get_meta( NDM_PRICING_LABEL ) ),
		'enabled' => '1' === (string) $product->get_meta( NDM_PRICING_LABEL_ON ),
	);
}

/**
 * Whether a product or variation is hidden on the Pricing page.
 *
 * @param WC_Product $product Product or variation.
 * @return bool
 */
function ndm_pricing_is_hidden( $product ) {
	return '1' === (string) $product->get_meta( NDM_PRICING_HIDDEN );
}

/**
 * The saved product order of a category.
 *
 * @param int $term_id Category ID.
 * @return int[]
 */
function ndm_pricing_product_order( $term_id ) {
	$order = get_term_meta( $term_id, NDM_PRICING_TERM_PRODUCT_ORDER, true );

	return is_array( $order ) ? array_values( array_map( 'absint', $order ) ) : array();
}

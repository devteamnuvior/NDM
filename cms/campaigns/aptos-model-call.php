<?php
/**
 * Aptos model call assessment (user, 2026-11-27): a special line under the Aptos options on the Pricing page.
 *
 *   wp eval-file cms/campaigns/aptos-model-call.php          (dry run)
 *   wp eval-file cms/campaigns/aptos-model-call.php apply
 *
 * Creates one simple WooCommerce product in the Aptos category: "Aptos Model Call Assessment", regular price
 * $150, the refund note as its short description, the label "Model call", and the flag _ndm_pricing_extra, so
 * the site shows it under the Aptos options and never counts it in Aptos's "from" price (meta.php).
 * The price is WooCommerce's own field: change it in WooCommerce or the price manager, never in the note.
 *
 * Deploy the plugin (meta.php, tree.php) and the site first: an older plugin does not send the flag, and the
 * product would then show as a second Aptos treatment with a "from" price of $150.
 *
 * Safe to run again: it finds the product by name and only fixes what differs. Nothing is deleted.
 */

$apply    = in_array( 'apply', $args ?? array(), true );
$name     = 'Aptos Model Call Assessment';
$price    = '150';
$note     = 'Our team will email you your appointment date. The fee is fully refunded once you attend your appointment.';
$label    = 'Model call';
$cat_slug = 'aptos-thread-method';

$term = get_term_by( 'slug', $cat_slug, 'product_cat' );
if ( ! $term ) {
	WP_CLI::error( "No product category with the slug {$cat_slug}." );
}

$product = null;
foreach ( wc_get_products( array( 'status' => array( 'publish', 'draft', 'private' ), 'limit' => -1, 'type' => 'simple' ) ) as $p ) {
	if ( 0 === strcasecmp( trim( $p->get_name() ), $name ) ) {
		$product = $p;
		break;
	}
}

$changes = array();
if ( ! $product ) {
	$changes[] = "create \"{$name}\" in {$term->name}";
	$product   = new WC_Product_Simple();
	$product->set_name( $name );
}
if ( 'publish' !== $product->get_status() ) {
	$changes[] = 'status publish';
	$product->set_status( 'publish' );
}
if ( $price !== (string) $product->get_regular_price() || '' !== (string) $product->get_sale_price() ) {
	$changes[] = "regular price {$price}, no sale price";
	$product->set_regular_price( $price );
	$product->set_sale_price( '' );
}
if ( $note !== wp_strip_all_tags( (string) $product->get_short_description() ) ) {
	$changes[] = 'short description (the refund note)';
	$product->set_short_description( $note );
}
if ( ! in_array( (int) $term->term_id, array_map( 'intval', $product->get_category_ids() ), true ) ) {
	$changes[] = "category {$term->name}";
	$product->set_category_ids( array_merge( $product->get_category_ids(), array( (int) $term->term_id ) ) );
}
if ( '1' !== (string) $product->get_meta( NDM_PRICING_EXTRA ) ) {
	$changes[] = 'flag: special line under the options';
	$product->update_meta_data( NDM_PRICING_EXTRA, '1' );
}
if ( $label !== (string) $product->get_meta( NDM_PRICING_LABEL ) || '1' !== (string) $product->get_meta( NDM_PRICING_LABEL_ON ) ) {
	$changes[] = "label \"{$label}\"";
	$product->update_meta_data( NDM_PRICING_LABEL, $label );
	$product->update_meta_data( NDM_PRICING_LABEL_ON, '1' );
}

if ( ! $changes ) {
	WP_CLI::success( "Nothing to change: \"{$name}\" (#{$product->get_id()}) is set up." );
	return;
}
foreach ( $changes as $c ) {
	WP_CLI::log( ( $apply ? 'Changed: ' : 'Would change: ' ) . $c );
}
if ( ! $apply ) {
	WP_CLI::log( 'Dry run. Add "apply" to make these changes.' );
	return;
}
$id = $product->save();
if ( function_exists( 'ndm_pricing_flush' ) ) {
	ndm_pricing_flush();
}
WP_CLI::success( "\"{$name}\" is #{$id}." );

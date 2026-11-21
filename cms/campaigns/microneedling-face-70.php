<?php
/**
 * Microneedling-Face, Package of 6, at 70% off in the running sale campaign (user, 2026-11-17).
 *
 * Changes that one line only: its campaign price becomes 30% of WooCommerce's own regular price (a fixed line,
 * label "70% OFF"), and it leaves the checkout code's list, so the code cannot come off it a second time.
 * Every other line, label and price is left as it is. The same line is in holiday-sale-2026.json, so a later
 * `wp ndm-pricing campaign --apply` gives the same result.
 *
 *   wp eval-file cms/campaigns/microneedling-face-70.php          (dry run)
 *   wp eval-file cms/campaigns/microneedling-face-70.php apply
 */
$apply = in_array( 'apply', $args ?? array(), true );
$mine  = ndm_campaign();
if ( ! $mine ) {
	WP_CLI::error( 'No campaign is stored.' );
}

$hit = null;
foreach ( ndm_campaign_cli_lines( array( 'product' => 'Microneedling-Face' ) ) as $id => $line ) {
	if ( ndm_campaign_cli_is( $line['label'], 'Package of 6' ) ) {
		$hit = array( $id, $line );
	}
}
if ( ! $hit ) {
	WP_CLI::error( 'Microneedling-Face has no option "Package of 6".' );
}
list( $id, $line ) = $hit;

$regular = (float) $line['variation']->get_regular_price( 'edit' );
if ( $regular <= 0 ) {
	WP_CLI::error( 'The option has no regular price.' );
}
$price = round( $regular * 0.3, 2 );
$old   = get_post_meta( $id, NDM_CAMPAIGN_META, true );
$new   = array(
	'campaign' => $mine['id'],
	'regular'  => $regular,
	'price'    => $price,
	'off'      => 0,
	'code'     => false,
	'label'    => '70% OFF',
);

$coupon = new WC_Coupon( wc_format_coupon_code( $mine['code'] ) );
$ids    = array_map( 'absint', $coupon->get_product_ids() );

WP_CLI::log( sprintf( '%s / %s (variation %d)', $line['product']->get_name(), $line['label'], $id ) );
WP_CLI::log( 'Now:  ' . wp_json_encode( $old ) );
WP_CLI::log( 'Then: ' . wp_json_encode( $new ) );
WP_CLI::log( sprintf( 'Code %s: on %d lines, this line %s.', $mine['code'], count( $ids ), in_array( $id, $ids, true ) ? 'is one of them and leaves the list' : 'is not one of them' ) );

if ( ! $apply ) {
	WP_CLI::log( 'Nothing was changed. Run it again with "apply".' );
	return;
}

update_post_meta( $id, NDM_CAMPAIGN_META, $new );
if ( $coupon->get_id() && in_array( $id, $ids, true ) ) {
	$coupon->set_product_ids( array_values( array_diff( $ids, array( $id ) ) ) );
	$coupon->save();
}
ndm_campaign_changed();
WP_CLI::success( sprintf( 'Stored: %s for %s (regular %s). The price list was cleared.', wc_format_decimal( $price, 2 ), $line['label'], wc_format_decimal( $regular, 2 ) ) );

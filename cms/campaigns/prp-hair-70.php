<?php
/**
 * PRP for hair, Package of 6, at 70% off in the running sale campaign (Black Friday brief, 2026-11-25, Task 03):
 * Small $6,000 -> $1,800, Medium $9,000 -> $2,700, Full scalp $12,600 -> $3,780.
 *
 * Changes those three lines only: each becomes a fixed line at the brief's price (label "70% OFF") and leaves the
 * checkout code's list, so the code cannot come off it a second time. Every other line, label and price is left
 * as it is (Package of 3 stays $3,000 -> $1,680). A line whose regular price in WooCommerce is not the brief's is
 * refused, not guessed. The same lines are in holiday-sale-2026.json.
 *
 *   wp eval-file cms/campaigns/prp-hair-70.php          (dry run)
 *   wp eval-file cms/campaigns/prp-hair-70.php apply
 */
$apply = in_array( 'apply', $args ?? array(), true );
$mine  = ndm_campaign();
if ( ! $mine ) {
	WP_CLI::error( 'No campaign is stored.' );
}

$wanted = array(
	'PRP Scalp - Small'  => array( 6000, 1800 ),
	'PRP Scalp - Medium' => array( 9000, 2700 ),
	'PRP Scalp - Full'   => array( 12600, 3780 ),
);

$coupon = new WC_Coupon( wc_format_coupon_code( $mine['code'] ) );
$ids    = array_map( 'absint', $coupon->get_product_ids() );
$plan   = array();

foreach ( $wanted as $product => $prices ) {
	list( $regular, $price ) = $prices;
	$hit = null;
	foreach ( ndm_campaign_cli_lines( array( 'product' => $product ) ) as $id => $line ) {
		if ( ndm_campaign_cli_is( $line['label'], 'Package of 6' ) ) {
			$hit = array( $id, $line );
		}
	}
	if ( ! $hit ) {
		WP_CLI::error( $product . ' has no option "Package of 6".' );
	}
	list( $id, $line ) = $hit;
	$have = (float) $line['variation']->get_regular_price( 'edit' );
	if ( abs( $have - $regular ) > 0.001 ) {
		WP_CLI::error( sprintf( '%s / Package of 6: the regular price in WooCommerce is %s, the brief says %s. Nothing was changed.', $product, $have, $regular ) );
	}
	$new = array(
		'campaign' => $mine['id'],
		'regular'  => (float) $regular,
		'price'    => (float) $price,
		'off'      => 0,
		'code'     => false,
		'label'    => '70% OFF',
	);
	WP_CLI::log( sprintf( '%s / %s (variation %d)', $line['product']->get_name(), $line['label'], $id ) );
	WP_CLI::log( '  Now:  ' . wp_json_encode( get_post_meta( $id, NDM_CAMPAIGN_META, true ) ) );
	WP_CLI::log( '  Then: ' . wp_json_encode( $new ) );
	WP_CLI::log( '  Code ' . $mine['code'] . ': ' . ( in_array( $id, $ids, true ) ? 'this line leaves the list' : 'this line is not on the list' ) );
	$plan[ $id ] = $new;
}

if ( ! $apply ) {
	WP_CLI::log( 'Nothing was changed. Run it again with "apply".' );
	return;
}

foreach ( $plan as $id => $new ) {
	update_post_meta( $id, NDM_CAMPAIGN_META, $new );
}
if ( $coupon->get_id() ) {
	$coupon->set_product_ids( array_values( array_diff( $ids, array_keys( $plan ) ) ) );
	$coupon->save();
}
ndm_campaign_changed();
WP_CLI::success( sprintf( 'Stored %d lines at 70%% off. The price list was cleared.', count( $plan ) ) );

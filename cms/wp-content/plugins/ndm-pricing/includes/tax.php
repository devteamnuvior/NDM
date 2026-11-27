<?php
/**
 * Tax as WooCommerce has it, for the website's cart and checkout.
 *
 * The site never types a tax rate: the public price list carries WooCommerce's own rate for the shop's
 * base location (WooCommerce > Settings > Tax, standard rates), and an order request is taxed by
 * WooCommerce itself when it is created. A change to the tax rates or to the tax switch throws the
 * stored price list away, so the site follows at once.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

/**
 * A rate as people read it: 13 for 13.0000, 9.975 for 9.9750.
 *
 * @param float $rate Percent.
 * @return string
 */
function ndm_pricing_tax_percent( $rate ) {
	return rtrim( rtrim( number_format( (float) $rate, 4, '.', '' ), '0' ), '.' );
}

/**
 * The tax the cart shows: whether WooCommerce charges tax, the standard rate at the shop's base
 * location in percent, and its name ("HST"). Prices on the list do not include it.
 *
 * @return array{enabled:bool,rate:float,label:string}
 */
function ndm_pricing_tax_public() {
	$none = array(
		'enabled' => false,
		'rate'    => 0.0,
		'label'   => '',
	);

	if ( ! wc_tax_enabled() || wc_prices_include_tax() ) {
		return $none;
	}

	$base  = wc_get_base_location();
	$rates = WC_Tax::find_rates(
		array(
			'country'   => $base['country'],
			'state'     => $base['state'],
			'postcode'  => '',
			'city'      => '',
			'tax_class' => '',
		)
	);

	if ( ! $rates ) {
		return array_merge( $none, array( 'enabled' => true ) );
	}

	return array(
		'enabled' => true,
		'rate'    => round( (float) array_sum( wp_list_pluck( $rates, 'rate' ) ), 4 ),
		'label'   => implode( ' + ', array_unique( array_filter( wp_list_pluck( $rates, 'label' ) ) ) ),
	);
}

/**
 * The tax line of an order as the confirmation shows it: "HST (13%)". Empty when the order has no tax.
 *
 * @param WC_Order $order Order.
 * @return string
 */
function ndm_pricing_order_tax_label( $order ) {
	$parts = array();

	foreach ( $order->get_items( 'tax' ) as $item ) {
		$label   = $item->get_label();
		$percent = $item->get_rate_percent();
		$parts[] = null === $percent || '' === $percent ? $label : sprintf( '%s (%s%%)', $label, ndm_pricing_tax_percent( $percent ) );
	}

	return implode( ' + ', array_filter( $parts ) );
}

foreach ( array( 'woocommerce_tax_rate_added', 'woocommerce_tax_rate_updated', 'woocommerce_tax_rate_deleted', 'update_option_woocommerce_calc_taxes', 'update_option_woocommerce_prices_include_tax', 'update_option_woocommerce_default_country' ) as $ndm_pricing_hook ) {
	add_action( $ndm_pricing_hook, 'ndm_pricing_flush', 10, 0 );
}
unset( $ndm_pricing_hook );

<?php
/**
 * Card payments for order requests from the website, through WooCommerce's Bambora gateway.
 *
 * The site's checkout stays on the Next.js site. When a visitor chooses to pay by card, the order is
 * created as "pending payment" (orders.php) and the visitor is sent to WooCommerce's own pay page for
 * that order (/react/checkout/order-pay/<id>/?pay_for_order=true&key=...), where the Bambora gateway
 * takes the card. Card details never touch the Next.js site or this plugin. After the payment
 * WooCommerce sends the visitor back to the site's confirmation page, which asks GET
 * ndm/v1/orders/<id>/payment whether the order is paid.
 *
 *   GET ndm/v1/payments                     public: is card payment available, and its title
 *   GET ndm/v1/orders/<id>/payment?key=...  public with the order's key: paid or not, and the pay page
 *
 * The pay page is the only WooCommerce page this headless WordPress shows: it gets its own plain
 * NewDermaMed page (templates/pay.php) instead of the theme, and is let through "coming soon" mode and
 * the headless redirect (mu-plugin ndm-headless, frontend.php).
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

/**
 * The card gateway's ID in WooCommerce: Bambora (SkyVerge "WooCommerce Bambora Gateway"), unless
 * wp-config.php names another one in NDM_CARD_GATEWAY (a local copy without Bambora uses "cheque").
 *
 * @return string
 */
function ndm_pricing_card_gateway_id() {
	return defined( 'NDM_CARD_GATEWAY' ) && is_string( NDM_CARD_GATEWAY ) && '' !== NDM_CARD_GATEWAY ? NDM_CARD_GATEWAY : 'bambora_credit_card';
}

/**
 * The card gateway when it is installed and switched on in WooCommerce > Settings > Payments, else null.
 *
 * @return WC_Payment_Gateway|null
 */
function ndm_pricing_card_gateway() {
	if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
		return null;
	}

	$gateways = WC()->payment_gateways()->payment_gateways();
	$gateway  = $gateways[ ndm_pricing_card_gateway_id() ] ?? null;

	return $gateway && 'yes' === $gateway->enabled ? $gateway : null;
}

/**
 * Whether an order was placed through the website's checkout.
 *
 * @param WC_Order|false|null $order The order.
 * @return bool
 */
function ndm_pricing_is_site_order( $order ) {
	return $order instanceof WC_Order && 'ndm-site' === $order->get_created_via();
}

/**
 * The website's address, without a trailing slash (the headless plugin's frontend address when set).
 *
 * @return string
 */
function ndm_pricing_site_base() {
	$base = function_exists( 'ndm_headless_frontend_base' ) ? ndm_headless_frontend_base() : '';
	return '' !== $base ? $base : untrailingslashit( home_url() );
}

/**
 * Registers the two routes.
 */
function ndm_pricing_register_payment_routes() {
	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/payments',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_pricing_rest_payments',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/orders/(?P<id>\d+)/payment',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_pricing_rest_order_payment',
			'permission_callback' => '__return_true',
			'args'                => array(
				'id'  => array(
					'type'     => 'integer',
					'required' => true,
				),
				'key' => array(
					'type'     => 'string',
					'required' => true,
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'ndm_pricing_register_payment_routes' );

/**
 * GET ndm/v1/payments: whether the checkout may offer card payment.
 *
 * @return WP_REST_Response
 */
function ndm_pricing_rest_payments() {
	$gateway  = ndm_pricing_card_gateway();
	$response = rest_ensure_response(
		array(
			'card'  => (bool) $gateway,
			'title' => $gateway ? wp_strip_all_tags( $gateway->get_title() ) : '',
		)
	);
	$response->header( 'Cache-Control', 'no-store' );

	return $response;
}

/**
 * GET ndm/v1/orders/<id>/payment?key=...: whether a website order is paid. The order's key (which only
 * the visitor who placed it has) is the permission; nothing about the visitor is returned.
 *
 * @param WP_REST_Request $request The request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_pricing_rest_order_payment( WP_REST_Request $request ) {
	$order = wc_get_order( (int) $request['id'] );
	$key   = (string) $request['key'];

	if ( ! ndm_pricing_is_site_order( $order ) || '' === $key || ! hash_equals( $order->get_order_key(), $key ) ) {
		return new WP_Error( 'ndm_order_unknown', 'Order not found.', array( 'status' => 404 ) );
	}

	$card     = ndm_pricing_card_gateway_id() === $order->get_payment_method();
	$response = rest_ensure_response(
		array(
			'number' => (string) $order->get_order_number(),
			'card'   => $card,
			'paid'   => $order->is_paid(),
			'status' => $order->get_status(),
			'total'  => round( (float) $order->get_total(), 2 ),
			'payUrl' => $card && $order->needs_payment() ? $order->get_checkout_payment_url() : '',
		)
	);
	$response->header( 'Cache-Control', 'no-store, private' );

	return $response;
}

/**
 * After a card payment WooCommerce goes to its "order received" page; for website orders that is the
 * website's confirmation page.
 *
 * @param string   $url   WooCommerce's address.
 * @param WC_Order $order The order.
 * @return string
 */
function ndm_pricing_order_received_url( $url, $order ) {
	if ( ! ndm_pricing_is_site_order( $order ) ) {
		return $url;
	}

	return add_query_arg(
		array(
			'order' => $order->get_id(),
			'key'   => $order->get_order_key(),
		),
		ndm_pricing_site_base() . '/order-confirmed'
	);
}
add_filter( 'woocommerce_get_checkout_order_received_url', 'ndm_pricing_order_received_url', 20, 2 );

/**
 * WooCommerce may ask a guest to type their email again before showing the pay page. The pay link of a
 * website order already carries the order's key, and the visitor arrives straight from the checkout.
 *
 * @param bool     $required Whether to ask.
 * @param WC_Order $order    The order.
 * @return bool
 */
function ndm_pricing_skip_email_check( $required, $order ) {
	return ndm_pricing_is_site_order( $order ) ? false : $required;
}
add_filter( 'woocommerce_order_email_verification_required', 'ndm_pricing_skip_email_check', 20, 2 );

/**
 * Whether this request is for WooCommerce's pay page. Usable before the query is parsed ("coming soon"
 * mode decides early), so it reads the address itself.
 *
 * @return bool
 */
function ndm_pricing_is_pay_request() {
	$endpoint = (string) get_option( 'woocommerce_checkout_pay_endpoint', 'order-pay' );
	$uri      = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
	$path     = (string) wp_parse_url( $uri, PHP_URL_PATH );

	return '' !== $endpoint && false !== strpos( $path, '/' . $endpoint . '/' ) && isset( $_GET['key'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

/**
 * Lets the pay page through WooCommerce's "coming soon" mode.
 *
 * @param bool $exclude Whether to leave this request alone.
 * @return bool
 */
function ndm_pricing_pay_page_not_coming_soon( $exclude ) {
	return $exclude || ndm_pricing_is_pay_request();
}
add_filter( 'woocommerce_coming_soon_exclude', 'ndm_pricing_pay_page_not_coming_soon' );

/**
 * The pay page gets the plugin's own plain page instead of the (headless) theme.
 *
 * @param string $template The template WordPress chose.
 * @return string
 */
function ndm_pricing_pay_template( $template ) {
	return function_exists( 'is_checkout_pay_page' ) && is_checkout_pay_page() ? NDM_PRICING_DIR . '/templates/pay.php' : $template;
}
add_filter( 'template_include', 'ndm_pricing_pay_template', 99 );

/**
 * A card order placed while signed in is put on the customer's account once it is paid. Until then it
 * has no account, because WooCommerce lets only that WordPress user open the pay page of an order that
 * belongs to an account, and the website's sign-in is not a WordPress sign-in.
 *
 * @param int      $order_id The order's ID.
 * @param string   $from     The old status.
 * @param string   $to       The new status.
 * @param WC_Order $order    The order.
 */
function ndm_pricing_attach_paid_order( $order_id, $from, $to, $order ) {
	if ( ! ndm_pricing_is_site_order( $order ) || ! $order->is_paid() || $order->get_customer_id() ) {
		return;
	}

	$account = (int) $order->get_meta( '_ndm_account' );
	$user    = $account ? get_user_by( 'id', $account ) : false;

	if ( $user && function_exists( 'ndm_pricing_is_customer' ) && ndm_pricing_is_customer( $user ) ) {
		$order->set_customer_id( $user->ID );
		$order->delete_meta_data( '_ndm_account' );
		$order->save();
	}
}
add_action( 'woocommerce_order_status_changed', 'ndm_pricing_attach_paid_order', 20, 4 );

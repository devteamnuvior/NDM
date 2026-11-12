<?php
/**
 * Order requests from the website: POST ndm/v1/orders.
 *
 * A visitor's cart becomes a real WooCommerce order, on hold and unpaid ("pay at the clinic"). The
 * site sends only WooCommerce IDs and quantities; every name and price on the order is read here,
 * from WooCommerce, at this moment. Only what is on the public price list can be ordered.
 *
 * The route is not public. The Next.js server calls it with the application password of a dedicated
 * account whose role (ndm_site) can do exactly one thing: place order requests.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_ORDER_CAP  = 'ndm_place_order_requests';
const NDM_PRICING_ORDER_ROLE = 'ndm_site';
const NDM_PRICING_MAX_LINES  = 50;
const NDM_PRICING_MAX_QTY    = 20;

const NDM_PRICING_PROVINCES = array(
	'Alberta'                   => 'AB',
	'British Columbia'          => 'BC',
	'Manitoba'                  => 'MB',
	'New Brunswick'             => 'NB',
	'Newfoundland and Labrador' => 'NL',
	'Northwest Territories'     => 'NT',
	'Nova Scotia'               => 'NS',
	'Nunavut'                   => 'NU',
	'Ontario'                   => 'ON',
	'Prince Edward Island'      => 'PE',
	'Quebec'                    => 'QC',
	'Saskatchewan'              => 'SK',
	'Yukon'                     => 'YT',
);

/**
 * The site's own role: it can sign in to the REST API and place order requests, nothing else.
 */
function ndm_pricing_site_role() {
	if ( ! get_role( NDM_PRICING_ORDER_ROLE ) ) {
		add_role(
			NDM_PRICING_ORDER_ROLE,
			'NewDermaMed website',
			array(
				'read'                 => true,
				NDM_PRICING_ORDER_CAP  => true,
			)
		);
	}
}
add_action( 'init', 'ndm_pricing_site_role' );

/**
 * Registers the route.
 */
function ndm_pricing_register_order_route() {
	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/orders',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'ndm_pricing_rest_order',
			'permission_callback' => static function () {
				if ( ! is_user_logged_in() ) {
					return new WP_Error( 'rest_login_required', __( 'Authentication is required.', 'ndm-pricing' ), array( 'status' => 401 ) );
				}

				return current_user_can( NDM_PRICING_ORDER_CAP ) ? true : new WP_Error( 'rest_forbidden', __( 'This account may not place order requests.', 'ndm-pricing' ), array( 'status' => 403 ) );
			},
		)
	);
}
add_action( 'rest_api_init', 'ndm_pricing_register_order_route' );

/**
 * What can be ordered: everything on the public price list, by the ID a cart line carries (a
 * variation's ID, or the product's own for a product without variations).
 *
 * @return array<int,array{product:int,variation:int,cat:string,name:string,label:string}>
 */
function ndm_pricing_orderable() {
	$out = array();

	foreach ( ndm_pricing_public_tree()['categories'] as $category ) {
		foreach ( $category['products'] as $product ) {
			$rows = $product['variations'] ? $product['variations'] : array( array( 'id' => 0, 'label' => '' ) );

			foreach ( $rows as $row ) {
				$id = $row['id'] ? $row['id'] : $product['id'];

				// A product in two categories is the same thing to order: the first category names it.
				if ( ! isset( $out[ $id ] ) ) {
					$out[ $id ] = array(
						'product'   => (int) $product['id'],
						'variation' => (int) $row['id'],
						'cat'       => $category['name'],
						'name'      => $product['name'],
						'label'     => $row['label'],
					);
				}
			}
		}
	}

	return $out;
}

/**
 * Checks the customer's details.
 *
 * @param mixed $customer Incoming value.
 * @return array|WP_Error Clean fields.
 */
function ndm_pricing_clean_customer( $customer ) {
	if ( ! is_array( $customer ) ) {
		return ndm_pricing_invalid( 'The customer details are missing.' );
	}

	$clean  = array();
	$fields = array(
		'first'   => array( 'First name', 60, true ),
		'last'    => array( 'Last name', 60, true ),
		'phone'   => array( 'Phone', 30, false ),
		'address' => array( 'Address', 120, true ),
		'apt'     => array( 'Apartment', 60, false ),
		'city'    => array( 'City', 60, true ),
	);

	foreach ( $fields as $key => $rule ) {
		$value = ndm_pricing_clean_text( $customer[ $key ] ?? '', $rule[0], $rule[1], $rule[2] );

		if ( is_wp_error( $value ) ) {
			return $value;
		}
		$clean[ $key ] = $value;
	}

	$email = sanitize_email( is_string( $customer['email'] ?? null ) ? $customer['email'] : '' );

	if ( ! is_email( $email ) || strlen( $email ) > 120 ) {
		return ndm_pricing_invalid( 'Please enter a valid email address.' );
	}
	$clean['email'] = $email;

	$province = is_string( $customer['province'] ?? null ) ? $customer['province'] : '';

	if ( ! isset( NDM_PRICING_PROVINCES[ $province ] ) ) {
		return ndm_pricing_invalid( 'Please choose a province.' );
	}
	$clean['province'] = NDM_PRICING_PROVINCES[ $province ];

	$postal = strtoupper( preg_replace( '/\s+/', '', is_string( $customer['postal'] ?? null ) ? $customer['postal'] : '' ) );

	if ( ! preg_match( '/^[A-Z]\d[A-Z]\d[A-Z]\d$/', $postal ) ) {
		return ndm_pricing_invalid( 'Please enter a Canadian postal code such as M2N 5M5.' );
	}
	$clean['postal'] = substr( $postal, 0, 3 ) . ' ' . substr( $postal, 3 );

	return $clean;
}

/**
 * POST /orders: checks the request as a whole, then creates the order.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_pricing_rest_order( $request ) {
	$body = $request->is_json_content_type() ? $request->get_json_params() : null;

	if ( ! is_array( $body ) ) {
		return ndm_pricing_invalid( 'Send the order request as JSON.', 415 );
	}

	$lines = $body['lines'] ?? null;

	if ( ! is_array( $lines ) || ! $lines || ! wp_is_numeric_array( $lines ) || count( $lines ) > NDM_PRICING_MAX_LINES ) {
		return ndm_pricing_invalid( 'The cart is empty or too large.' );
	}

	$orderable = ndm_pricing_orderable();
	$wanted    = array();

	foreach ( $lines as $line ) {
		$product_id   = is_array( $line ) ? ( $line['productId'] ?? null ) : null;
		$variation_id = is_array( $line ) ? ( $line['variationId'] ?? 0 ) : null;
		$qty          = is_array( $line ) ? ( $line['qty'] ?? null ) : null;

		if ( ! is_int( $product_id ) || ! is_int( $variation_id ) || ! is_int( $qty ) || $qty < 1 || $qty > NDM_PRICING_MAX_QTY ) {
			return ndm_pricing_invalid( 'A cart line could not be read.' );
		}

		$id   = $variation_id ? $variation_id : $product_id;
		$item = $orderable[ $id ] ?? null;

		if ( ! $item || $item['product'] !== $product_id || $item['variation'] !== $variation_id || isset( $wanted[ $id ] ) ) {
			return new WP_Error( 'ndm_pricing_unavailable', 'Something in the cart is no longer on the price list.', array( 'status' => 409 ) );
		}

		$wanted[ $id ] = $qty;
	}

	$customer = ndm_pricing_clean_customer( $body['customer'] ?? null );
	if ( is_wp_error( $customer ) ) {
		return $customer;
	}

	$extras = array();

	foreach ( array( 'clinic' => 80, 'preferred' => 120, 'note' => 500 ) as $key => $max ) {
		$value = ndm_pricing_clean_text( $body[ $key ] ?? '', ucfirst( $key ), $max, 'clinic' === $key, 'note' === $key );

		if ( is_wp_error( $value ) ) {
			return $value;
		}
		$extras[ $key ] = $value;
	}

	$order = wc_create_order( array( 'created_via' => 'ndm-site' ) );

	if ( is_wp_error( $order ) ) {
		return new WP_Error( 'ndm_pricing_order_failed', 'The order request could not be saved.', array( 'status' => 500 ) );
	}

	$rows = array();
	$sub  = 0.0;
	$save = 0.0;

	foreach ( $wanted as $id => $qty ) {
		$product = wc_get_product( $id );
		$price   = (float) $product->get_price();
		$regular = (float) $product->get_regular_price();
		$was     = $product->is_on_sale() && $regular > $price ? $regular : 0.0;

		// WooCommerce puts its own current price on the line.
		$order->add_product( $product, $qty );

		$sub   += $price * $qty;
		$save  += $was ? ( $was - $price ) * $qty : 0.0;
		$rows[] = array(
			'productId'   => $orderable[ $id ]['product'],
			'variationId' => $orderable[ $id ]['variation'],
			'cat'         => $orderable[ $id ]['cat'],
			'name'        => $orderable[ $id ]['name'],
			'label'       => $orderable[ $id ]['label'],
			'qty'         => $qty,
			'price'       => $price,
			'was'         => $was,
		);
	}

	$order->set_address(
		array(
			'first_name' => $customer['first'],
			'last_name'  => $customer['last'],
			'email'      => $customer['email'],
			'phone'      => $customer['phone'],
			'address_1'  => $customer['address'],
			'address_2'  => $customer['apt'],
			'city'       => $customer['city'],
			'state'      => $customer['province'],
			'postcode'   => $customer['postal'],
			'country'    => 'CA',
		),
		'billing'
	);
	$order->set_payment_method_title( 'Pay at the clinic' );
	$order->set_customer_note( $extras['note'] );
	$order->update_meta_data( '_ndm_clinic', $extras['clinic'] );
	$order->update_meta_data( '_ndm_preferred_time', $extras['preferred'] );
	$order->calculate_totals();
	$order->set_status( 'on-hold', sprintf( 'Order request from the website. Clinic: %1$s. Preferred time: %2$s. Nothing has been charged.', $extras['clinic'], '' !== $extras['preferred'] ? $extras['preferred'] : 'not given' ) );
	$order->save();

	$response = rest_ensure_response(
		array(
			'number'     => (string) $order->get_order_number(),
			'date'       => gmdate( 'c', $order->get_date_created() ? $order->get_date_created()->getTimestamp() : time() ),
			'lines'      => $rows,
			'sub'        => round( $sub, 2 ),
			'saved'      => round( $save, 2 ),
			'taxEnabled' => wc_tax_enabled(),
			'tax'        => round( (float) $order->get_total_tax(), 2 ),
			'total'      => round( (float) $order->get_total(), 2 ),
		)
	);
	$response->set_status( 201 );
	$response->header( 'Cache-Control', 'no-store, private' );

	return $response;
}

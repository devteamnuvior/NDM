<?php
/**
 * REST routes, all under ndm/v1:
 *
 *   GET  /pricing                 Public. The price list visitors see.
 *   GET  /pricing/admin/me        Who is signed in (used to check a session).
 *   GET  /pricing/admin/tree      Everything, with the display settings.
 *   GET  /pricing/admin/products  Search WooCommerce products (?search=, ?exclude=1,2).
 *   POST /pricing/admin/save      One set of changes (see includes/save.php).
 *
 * Every /admin route needs a signed-in WordPress user who may manage WooCommerce; that is checked
 * here, on the server, for each request. Callers sign in with a WordPress application password
 * (Authorization header), so there is no cookie and no nonce involved.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

/**
 * Permission check for the admin routes.
 *
 * @return true|WP_Error
 */
function ndm_pricing_can_manage() {
	if ( ! is_user_logged_in() ) {
		return new WP_Error( 'rest_login_required', __( 'Sign in to manage the price list.', 'ndm-pricing' ), array( 'status' => 401 ) );
	}

	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return new WP_Error( 'rest_forbidden', __( 'This account may not manage the price list.', 'ndm-pricing' ), array( 'status' => 403 ) );
	}

	return true;
}

/**
 * A response that must never be stored by a cache.
 *
 * @param mixed $data Data to send.
 * @return WP_REST_Response
 */
function ndm_pricing_private_response( $data ) {
	$response = rest_ensure_response( $data );
	$response->header( 'Cache-Control', 'no-store, private' );

	return $response;
}

/**
 * Registers the routes.
 */
function ndm_pricing_register_routes() {
	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/pricing',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => static function () {
				return rest_ensure_response( ndm_pricing_public_tree() );
			},
			// Public on purpose: it holds only what the Pricing page shows to every visitor.
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/pricing/admin/me',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => static function () {
				$user = wp_get_current_user();

				return ndm_pricing_private_response(
					array(
						'id'   => (int) $user->ID,
						'name' => ndm_pricing_plain( $user->display_name ),
					)
				);
			},
			'permission_callback' => 'ndm_pricing_can_manage',
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/pricing/admin/tree',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => static function () {
				return ndm_pricing_private_response( ndm_pricing_tree( true ) );
			},
			'permission_callback' => 'ndm_pricing_can_manage',
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/pricing/admin/products',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_pricing_rest_products',
			'permission_callback' => 'ndm_pricing_can_manage',
			'args'                => array(
				'search'  => array(
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'exclude' => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array( 'type' => 'integer' ),
				),
			),
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/pricing/admin/save',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'ndm_pricing_rest_save',
			'permission_callback' => 'ndm_pricing_can_manage',
		)
	);
}
add_action( 'rest_api_init', 'ndm_pricing_register_routes' );

/**
 * GET /pricing/admin/products: up to 20 WooCommerce products matching a search, newest first when
 * there is none.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function ndm_pricing_rest_products( $request ) {
	$search = mb_substr( (string) $request['search'], 0, 100 );
	$query  = array(
		'status'  => array( 'publish', 'private', 'draft' ),
		'limit'   => 20,
		'exclude' => array_slice( array_map( 'absint', (array) $request['exclude'] ), 0, NDM_PRICING_MAX_ENTRIES ),
		'orderby' => '' === $search ? 'date' : 'title',
		'order'   => '' === $search ? 'DESC' : 'ASC',
	);

	if ( '' !== $search ) {
		$query['s'] = $search;
	}

	$products = array();

	foreach ( wc_get_products( $query ) as $product ) {
		$products[] = ndm_pricing_product_data( $product, true );
	}

	return ndm_pricing_private_response( array( 'products' => $products ) );
}

/**
 * POST /pricing/admin/save: checks the whole set of changes, writes it, and answers with the new state.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_pricing_rest_save( $request ) {
	if ( ! $request->is_json_content_type() ) {
		return ndm_pricing_invalid( 'Send the changes as JSON.', 415 );
	}

	$plan = ndm_pricing_plan( $request->get_json_params() );

	if ( is_wp_error( $plan ) ) {
		return $plan;
	}

	$created = ndm_pricing_apply( $plan );

	if ( is_wp_error( $created ) ) {
		return $created;
	}

	return ndm_pricing_private_response(
		array(
			'created' => (object) $created,
			'tree'    => ndm_pricing_tree( true ),
		)
	);
}

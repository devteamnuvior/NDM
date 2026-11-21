<?php
/**
 * The site's own REST namespace, ndm/v1. For now a single health check; content endpoints are added
 * here later, one file per content type.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_HEADLESS_REST_NAMESPACE', 'ndm/v1' );

/**
 * Registers the ndm/v1 routes.
 */
function ndm_headless_register_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/health',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_rest_health',
			// Public on purpose: it says only that the backend is up.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_register_routes' );

/**
 * GET ndm/v1/health: tells the frontend the backend is reachable. Reveals no versions or settings.
 *
 * @return WP_REST_Response
 */
function ndm_headless_rest_health() {
	$response = rest_ensure_response(
		array(
			'status'      => 'ok',
			'environment' => wp_get_environment_type(),
			'time'        => gmdate( 'c' ),
		)
	);

	$response->header( 'Cache-Control', 'no-store' );

	return $response;
}

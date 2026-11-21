<?php
/**
 * CORS for the REST API: only the configured frontend origins, never "*", never with cookies.
 *
 * The Next.js server calls the API without an Origin header, so it is not affected by CORS at all.
 * These headers only decide which websites may read the API from a visitor's browser.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

/**
 * Replaces WordPress's own CORS headers, which repeat back whatever origin asked.
 */
function ndm_headless_replace_core_cors() {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_filter( 'rest_pre_serve_request', 'ndm_headless_send_cors_headers', 10, 1 );
}
add_action( 'rest_api_init', 'ndm_headless_replace_core_cors', 15 );

/**
 * Sends CORS headers when the request comes from an allowed origin.
 *
 * @param bool $served Whether the request has already been served.
 * @return bool Unchanged.
 */
function ndm_headless_send_cors_headers( $served ) {
	// Caches must keep answers for different origins apart.
	header( 'Vary: Origin', false );

	$origin = get_http_origin();

	if ( ! $origin || ! in_array( strtolower( $origin ), ndm_headless_allowed_origins(), true ) ) {
		return $served;
	}

	header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
	header( 'Access-Control-Allow-Methods: GET, HEAD, OPTIONS' );
	header( 'Access-Control-Allow-Headers: Content-Type, Accept' );
	header( 'Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link' );
	header( 'Access-Control-Max-Age: 600' );

	return $served;
}

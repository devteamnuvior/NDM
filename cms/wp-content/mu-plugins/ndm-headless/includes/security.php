<?php
/**
 * Closes the doors a headless backend does not use.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

// XML-RPC: an old remote API, a common target for password guessing. The REST API replaces it.
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', '__return_empty_array' );

/**
 * Removes the header that advertises the XML-RPC address.
 *
 * @param string[] $headers Headers WordPress is about to send.
 * @return string[] Headers without X-Pingback.
 */
function ndm_headless_remove_pingback_header( $headers ) {
	unset( $headers['X-Pingback'] );

	return $headers;
}
add_filter( 'wp_headers', 'ndm_headless_remove_pingback_header' );

/**
 * Keeps the list of user accounts private: the users endpoints answer signed-in callers only.
 *
 * @param mixed           $result  Response to send instead of running the route, or null.
 * @param WP_REST_Server  $server  Server instance.
 * @param WP_REST_Request $request Current request.
 * @return mixed The untouched result, or an error for anonymous callers.
 */
function ndm_headless_protect_users( $result, $server, $request ) {
	if ( null !== $result || is_user_logged_in() ) {
		return $result;
	}

	if ( 0 === strpos( $request->get_route(), '/wp/v2/users' ) ) {
		return new WP_Error(
			'rest_login_required',
			__( 'Authentication is required for this endpoint.', 'ndm-headless' ),
			array( 'status' => rest_authorization_required_code() )
		);
	}

	return $result;
}
add_filter( 'rest_pre_dispatch', 'ndm_headless_protect_users', 10, 3 );

/**
 * Application passwords (the credentials the Next.js server can use) only over HTTPS, except on a
 * developer's own computer.
 *
 * @param bool $available Whether application passwords are available.
 * @return bool
 */
function ndm_headless_application_passwords( $available ) {
	if ( 'local' === wp_get_environment_type() ) {
		return true;
	}

	return $available && is_ssl();
}
add_filter( 'wp_is_application_passwords_available', 'ndm_headless_application_passwords' );

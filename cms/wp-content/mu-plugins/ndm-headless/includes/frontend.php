<?php
/**
 * WordPress shows no public pages: the Next.js app is the only frontend.
 *
 * Anything that would render a theme template (posts, pages, archives, feeds, search) is sent to the
 * same path on the Next.js site, so WordPress never produces competing pages, titles or meta tags.
 * The admin, the login page, the REST API and cron are not theme requests and are left alone.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

/**
 * Sends theme requests to the frontend, or answers 404 when no frontend is configured.
 */
function ndm_headless_block_frontend() {
	// The robots file is answered by WordPress (see ndm_headless_robots_txt); the icon is harmless.
	if ( is_robots() || is_favicon() ) {
		return;
	}

	$frontend = ndm_headless_frontend_url();

	if ( '' === $frontend ) {
		status_header( 404 );
		nocache_headers();
		header( 'Content-Type: text/plain; charset=utf-8' );
		echo 'Not found.';
		exit;
	}

	$path   = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
	$path   = '/' . ltrim( (string) wp_parse_url( $path, PHP_URL_PATH ), '/' );
	$status = 'production' === wp_get_environment_type() ? 301 : 302;

	// The target host is the configured frontend only, so this is not an open redirect.
	// phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
	wp_redirect( $frontend . $path, $status, 'NDM Headless' );
	exit;
}
add_action( 'template_redirect', 'ndm_headless_block_frontend', 0 );

/**
 * Tells search engines not to index anything on the WordPress host: the public site is elsewhere.
 *
 * @param string[] $headers Headers WordPress is about to send.
 * @return string[] Headers with the robots rule added.
 */
function ndm_headless_noindex_header( $headers ) {
	$headers['X-Robots-Tag'] = 'noindex, nofollow';

	return $headers;
}
add_filter( 'wp_headers', 'ndm_headless_noindex_header' );

/**
 * The same rule for REST API answers.
 *
 * @param bool $served Whether the request has already been served.
 * @return bool Unchanged.
 */
function ndm_headless_noindex_rest( $served ) {
	header( 'X-Robots-Tag: noindex, nofollow' );

	return $served;
}
add_filter( 'rest_pre_serve_request', 'ndm_headless_noindex_rest' );

/**
 * A robots file that closes the whole WordPress host to crawlers.
 *
 * @return string File contents.
 */
function ndm_headless_robots_txt() {
	return "User-agent: *\nDisallow: /\n";
}
add_filter( 'robots_txt', 'ndm_headless_robots_txt', 99 );

// A headless backend has no pages to canonicalise, shorten or advertise.
remove_action( 'template_redirect', 'redirect_canonical' );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
remove_action( 'template_redirect', 'rest_output_link_header', 11 );

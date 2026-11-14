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

	$request = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
	$target  = ndm_headless_frontend_target( ndm_headless_frontend_base(), $request );

	// No frontend configured, or it would send the visitor to the address they are on (the site shares
	// WordPress's folder and the web server did not pass this address to it): no page here.
	if ( '' === $target ) {
		status_header( 404 );
		nocache_headers();
		header( 'Content-Type: text/plain; charset=utf-8' );
		echo 'Not found.';
		exit;
	}

	$status = 'production' === wp_get_environment_type() ? 301 : 302;

	// The target host is the configured frontend only, so this is not an open redirect.
	// phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
	wp_redirect( $target, $status, 'NDM Headless' );
	exit;
}

/**
 * The Next.js site's address with its folder, without a trailing slash: "https://example.com" or
 * "https://example.com/react" when it is served from a folder (NDM_FRONTEND_URL). Empty when not set.
 *
 * @return string
 */
function ndm_headless_frontend_base() {
	$origin = ndm_headless_frontend_url();
	if ( '' === $origin ) {
		return '';
	}

	$folder = (string) wp_parse_url( ndm_headless_setting( 'NDM_FRONTEND_URL' ), PHP_URL_PATH );
	$folder = preg_match( '#^(/[A-Za-z0-9._~-]+)+/?$#', $folder ) ? untrailingslashit( $folder ) : '';

	return $origin . $folder;
}

/**
 * Where a request made to WordPress goes on the Next.js site: the site's address plus the request's
 * path without WordPress's own folder. Empty when there is no site, or when that is the very address
 * that was asked for (which would redirect in a loop).
 *
 * @param string $frontend The site's address with its folder (ndm_headless_frontend_base()).
 * @param string $request  The requested address (path and query), as in REQUEST_URI.
 * @return string
 */
function ndm_headless_frontend_target( $frontend, $request ) {
	if ( '' === $frontend ) {
		return '';
	}

	$target = $frontend . ndm_headless_frontend_path( $request );

	// The address the visitor asked for (WordPress's own host and port) and the one they would be sent
	// to, compared without the scheme.
	$where   = function ( $url ) {
		$port = wp_parse_url( $url, PHP_URL_PORT );
		return strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) ) . ( $port ? ':' . $port : '' );
	};
	$path    = '/' . ltrim( (string) wp_parse_url( (string) $request, PHP_URL_PATH ), '/' );
	$current = $where( home_url( '/' ) ) . untrailingslashit( $path );
	$goes_to = $where( $target ) . untrailingslashit( (string) wp_parse_url( $target, PHP_URL_PATH ) );

	return $current === $goes_to ? '' : $target;
}

/**
 * The path on the Next.js site for a request made to WordPress. WordPress may be installed in a
 * folder (https://example.com/react, see Settings > General): that folder is WordPress's own and is
 * not part of the site's addresses, so /react/botox becomes /botox and /react becomes /. A path that
 * only starts with the same letters (/reactor) is kept as it is.
 *
 * @param string $request The requested address (path and query), as in REQUEST_URI.
 * @return string A path starting with "/", without the query.
 */
function ndm_headless_frontend_path( $request ) {
	$path   = '/' . ltrim( (string) wp_parse_url( (string) $request, PHP_URL_PATH ), '/' );
	$folder = untrailingslashit( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ) );

	if ( '' !== $folder && ( $path === $folder || 0 === strpos( $path, $folder . '/' ) ) ) {
		$path = '/' . ltrim( substr( $path, strlen( $folder ) ), '/' );
	}

	return $path;
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

<?php
/**
 * Configuration: read from constants or environment variables, validated before use.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

/**
 * Reads one setting: a constant in wp-config.php wins, then an environment variable.
 *
 * @param string $name Setting name, for example NDM_FRONTEND_URL.
 * @return string The raw value, or an empty string when it is not set.
 */
function ndm_headless_setting( $name ) {
	if ( defined( $name ) ) {
		return trim( (string) constant( $name ) );
	}

	$value = getenv( $name );

	return false === $value ? '' : trim( (string) $value );
}

/**
 * Reduces a URL to its origin (scheme://host[:port]), or returns an empty string when it is not a
 * plain http(s) address. Wildcards and paths never pass.
 *
 * @param string $url Address to check.
 * @return string Origin in lower case, or an empty string.
 */
function ndm_headless_origin( $url ) {
	$parts = wp_parse_url( trim( (string) $url ) );

	if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
		return '';
	}

	$scheme = strtolower( $parts['scheme'] );
	$host   = strtolower( $parts['host'] );

	if ( ! in_array( $scheme, array( 'http', 'https' ), true ) || ! preg_match( '/^[a-z0-9.-]+$/', $host ) ) {
		return '';
	}

	// Plain http is for a developer's own computer only.
	if ( 'http' === $scheme && 'production' === wp_get_environment_type() ) {
		return '';
	}

	$origin = $scheme . '://' . $host;

	if ( ! empty( $parts['port'] ) ) {
		$origin .= ':' . (int) $parts['port'];
	}

	return $origin;
}

/**
 * The address of the Next.js site, without a trailing slash.
 *
 * @return string Origin of the frontend, or an empty string when it is not configured.
 */
function ndm_headless_frontend_url() {
	return ndm_headless_origin( ndm_headless_setting( 'NDM_FRONTEND_URL' ) );
}

/**
 * The browser origins allowed to call the REST API.
 *
 * @return string[] Exact origins. Empty means no browser on another origin may read the API.
 */
function ndm_headless_allowed_origins() {
	static $origins = null;

	if ( null === $origins ) {
		$origins = array();

		foreach ( explode( ',', ndm_headless_setting( 'NDM_FRONTEND_ORIGINS' ) ) as $candidate ) {
			$origin = ndm_headless_origin( $candidate );

			if ( '' !== $origin ) {
				$origins[] = $origin;
			}
		}

		$origins = array_values( array_unique( $origins ) );
	}

	return $origins;
}

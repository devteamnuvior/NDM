<?php
/**
 * Popular searches of the Next.js site's search, under ndm/v1:
 *
 *   GET  /search/popular   Public. The most searched results, most searched first (?limit=, 1 to 30).
 *   POST /search/log       The Next.js server only (shared secret). Counts one search: { "label": "..." }.
 *
 * What is kept is one row per result people found ("Laser Hair Removal"), with how often and when it
 * was last found. Never what a visitor typed, never who searched, no address, no time line: the
 * Next.js server turns a search into the name of a result of its own before it calls here, so nothing
 * a visitor writes can end up in this table or on the site.
 *
 * The secret is the one the two servers already share (NDM_REVALIDATE_SECRET).
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_HEADLESS_SEARCH_DB_VERSION', '1' );
/** A result that nobody found for this long drops out of the popular list. */
define( 'NDM_HEADLESS_SEARCH_WINDOW_DAYS', 90 );
define( 'NDM_HEADLESS_SEARCH_LABEL_LENGTH', 80 );

/**
 * Name of the table that counts searches.
 *
 * @return string
 */
function ndm_headless_search_table() {
	global $wpdb;

	return $wpdb->prefix . 'ndm_search_terms';
}

/**
 * Creates the table once (a must-use plugin has no activation step, so this checks a version number).
 */
function ndm_headless_search_install() {
	if ( NDM_HEADLESS_SEARCH_DB_VERSION === get_option( 'ndm_search_db_version' ) ) {
		return;
	}

	global $wpdb;

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';

	$table   = ndm_headless_search_table();
	$charset = $wpdb->get_charset_collate();

	dbDelta(
		"CREATE TABLE {$table} (
			term_key varchar(100) NOT NULL,
			label varchar(100) NOT NULL,
			hits bigint(20) unsigned NOT NULL DEFAULT 0,
			last_at datetime NOT NULL,
			PRIMARY KEY  (term_key),
			KEY last_at (last_at)
		) {$charset};"
	);

	update_option( 'ndm_search_db_version', NDM_HEADLESS_SEARCH_DB_VERSION, false );
}
add_action( 'init', 'ndm_headless_search_install' );

/**
 * Permission check of the write route: the caller must carry the secret the two servers share.
 *
 * @param WP_REST_Request $request Request.
 * @return true|WP_Error
 */
function ndm_headless_search_can_log( $request ) {
	$secret = ndm_headless_setting( 'NDM_REVALIDATE_SECRET' );
	$given  = (string) $request->get_header( 'x_ndm_search_key' );

	if ( strlen( $secret ) < 32 || '' === $given || ! hash_equals( $secret, $given ) ) {
		return new WP_Error( 'rest_forbidden', __( 'Not allowed.', 'ndm-headless' ), array( 'status' => 401 ) );
	}

	return true;
}

/**
 * Registers the routes.
 */
function ndm_headless_search_register_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/search/popular',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_rest_search_popular',
			// Public on purpose: it holds only names of results the site shows to every visitor.
			'permission_callback' => '__return_true',
			'args'                => array(
				'limit' => array(
					'type'    => 'integer',
					'default' => 12,
					'minimum' => 1,
					'maximum' => 30,
				),
			),
		)
	);

	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/search/log',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'ndm_headless_rest_search_log',
			'permission_callback' => 'ndm_headless_search_can_log',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_search_register_routes' );

/**
 * GET /search/popular.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function ndm_headless_rest_search_popular( $request ) {
	global $wpdb;

	$table = ndm_headless_search_table();
	$since = gmdate( 'Y-m-d H:i:s', time() - NDM_HEADLESS_SEARCH_WINDOW_DAYS * DAY_IN_SECONDS );
	$limit = max( 1, min( 30, (int) $request['limit'] ) );

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- our own table, its name is not user input.
	$labels = $wpdb->get_col( $wpdb->prepare( "SELECT label FROM {$table} WHERE last_at >= %s ORDER BY hits DESC, last_at DESC LIMIT %d", $since, $limit ) );

	$response = rest_ensure_response( array( 'terms' => array_values( array_map( 'strval', (array) $labels ) ) ) );
	$response->header( 'Cache-Control', 'no-store' );

	return $response;
}

/**
 * POST /search/log: adds one to the count of a result.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_rest_search_log( $request ) {
	global $wpdb;

	$params = $request->get_json_params();
	$label  = is_array( $params ) && isset( $params['label'] ) && is_string( $params['label'] ) ? sanitize_text_field( $params['label'] ) : '';
	$label  = trim( mb_substr( $label, 0, NDM_HEADLESS_SEARCH_LABEL_LENGTH ) );

	if ( '' === $label ) {
		return new WP_Error( 'ndm_search_invalid', __( 'Send the name of a result.', 'ndm-headless' ), array( 'status' => 400 ) );
	}

	$table = ndm_headless_search_table();

	// One statement, so two searches at the same moment are both counted.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- our own table, its name is not user input.
	$done = $wpdb->query(
		$wpdb->prepare(
			"INSERT INTO {$table} (term_key, label, hits, last_at) VALUES (%s, %s, 1, %s)
			ON DUPLICATE KEY UPDATE hits = hits + 1, label = VALUES(label), last_at = VALUES(last_at)",
			mb_strtolower( $label ),
			$label,
			gmdate( 'Y-m-d H:i:s' )
		)
	);

	if ( false === $done ) {
		return new WP_Error( 'ndm_search_failed', __( 'The search could not be counted.', 'ndm-headless' ), array( 'status' => 500 ) );
	}

	$response = rest_ensure_response( array( 'counted' => true ) );
	$response->header( 'Cache-Control', 'no-store' );

	return $response;
}

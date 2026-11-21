<?php
/**
 * WordPress pages as content of the Next.js site (for now the three legal documents: privacy, terms,
 * refunds). The site reads a published page by its slug from WordPress's own `wp/v2/pages`.
 *
 * - Text stays as typed: WordPress's "smart" punctuation is off, so it never turns hyphens into dashes
 *   or changes quotes in text the site shows.
 * - When a page is saved, trashed, restored or deleted, the Next.js site is told to drop its cached
 *   pages (tag `wp:pages`), so an edit shows on the site at once.
 * - `wp ndm legal-import` creates the legal pages once, from the site's original text.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'run_wptexturize', '__return_false' );

/**
 * Queues one "pages changed" call to the Next.js site for the end of this request.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_pages_changed( $post_id ) {
	static $queued = false;

	if ( $queued || 'page' !== get_post_type( $post_id ) || wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_pages_notify_frontend' );
}
add_action( 'save_post', 'ndm_headless_pages_changed' );
add_action( 'trashed_post', 'ndm_headless_pages_changed' );
add_action( 'untrashed_post', 'ndm_headless_pages_changed' );
add_action( 'before_delete_post', 'ndm_headless_pages_changed' );

/**
 * Asks the Next.js server to clear its cached WordPress pages. Fire and forget: a site that is down or
 * not configured never slows WordPress or fails a save.
 */
function ndm_headless_pages_notify_frontend() {
	$url    = esc_url_raw( ndm_headless_setting( 'NDM_REVALIDATE_URL' ), array( 'http', 'https' ) );
	$secret = ndm_headless_setting( 'NDM_REVALIDATE_SECRET' );

	if ( '' === $url || '' === $secret ) {
		return;
	}

	wp_remote_post(
		$url,
		array(
			'timeout'  => 2,
			'blocking' => false,
			'headers'  => array(
				'Content-Type'     => 'application/json',
				'X-NDM-Revalidate' => $secret,
			),
			'body'     => wp_json_encode( array( 'tag' => 'wp:pages' ) ),
		)
	);
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Creates the site's legal pages from JSON on standard input:
	 * [ { "slug": "privacy", "title": "Privacy Policy", "content": "<block markup>" }, ... ]
	 *
	 * A page whose slug already exists (in any state, the trash included) is left exactly as it is,
	 * so running this again never overwrites an edit.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-legal-pages.mjs | docker compose run --rm -T cli wp ndm legal-import
	 */
	WP_CLI::add_command(
		'ndm legal-import',
		function () {
			$pages = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $pages ) || ! $pages ) {
				WP_CLI::error( 'Expected a JSON list of pages on standard input.' );
			}

			foreach ( $pages as $page ) {
				$slug    = isset( $page['slug'] ) ? sanitize_title( $page['slug'] ) : '';
				$title   = isset( $page['title'] ) ? (string) $page['title'] : '';
				$content = isset( $page['content'] ) ? (string) $page['content'] : '';
				if ( '' === $slug || '' === $title || '' === $content ) {
					WP_CLI::warning( 'Skipped an entry without a slug, a title or content.' );
					continue;
				}

				$existing = get_posts(
					array(
						'post_type'   => 'page',
						'name'        => $slug,
						'post_status' => 'any, trash',
						'numberposts' => 1,
						'fields'      => 'ids',
					)
				);
				if ( $existing ) {
					WP_CLI::log( "Kept: {$slug} (page {$existing[0]} already exists)." );
					continue;
				}

				$id = wp_insert_post(
					array(
						'post_type'    => 'page',
						'post_status'  => 'publish',
						'post_name'    => $slug,
						'post_title'   => $title,
						// wp_insert_post expects slashed data.
						'post_content' => wp_slash( $content ),
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( "Could not create {$slug}: " . $id->get_error_message() );
					continue;
				}
				WP_CLI::success( "Created: {$slug} (page {$id})." );
			}
		}
	);
}

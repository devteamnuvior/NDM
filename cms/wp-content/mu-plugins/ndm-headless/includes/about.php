<?php
/**
 * The About page of the Next.js site (/about).
 *
 * - Post type "About Page" (`ndm_about`): a template of its own. The site has one About page, so the
 *   type holds one post: once it exists, "Add page" is no longer offered. Its address is always /about;
 *   the post's title is only its name in this admin.
 * - Every section of the page that carries its own words or photos has a box under the title (one post
 *   meta, `_ndm_about`). The fields are listed once, in ndm_headless_about_schema(); the edit screen,
 *   the saving, the REST answer and the import all read that list. The fields themselves (their look,
 *   cleaning and photo picker) are the ones of the Concerns post type (includes/concerns.php).
 * - What the page shares with the rest of the site lives in the site's code: the clinic film, the team
 *   members and their profiles, the two clinics (addresses, phones, hours, maps, parking), the Top
 *   Choice Award badges, How it works, the contact form and @newdermamed.
 * - `GET ndm/v1/about-page` gives the published page.
 * - When the page changes, the Next.js site is told to drop its cached copy (tag `about`).
 * - `wp ndm about-import` creates the page once, from the site's original content.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_ABOUT_POST_TYPE', 'ndm_about' );
define( 'NDM_ABOUT_META', '_ndm_about' );

/**
 * The About page's post (in any state but the trash), or 0 when it was not created yet.
 *
 * @return int
 */
function ndm_headless_about_post_id() {
	$posts = get_posts(
		array(
			'post_type'        => NDM_ABOUT_POST_TYPE,
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 1,
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'fields'           => 'ids',
			'suppress_filters' => true,
		)
	);

	return $posts ? (int) $posts[0] : 0;
}

/**
 * Registers the post type.
 */
function ndm_headless_about_register() {
	register_post_type(
		NDM_ABOUT_POST_TYPE,
		array(
			'labels'              => array(
				'name'               => 'About Page',
				'singular_name'      => 'About Page',
				'menu_name'          => 'About Page',
				'all_items'          => 'About page',
				'add_new'            => 'Add page',
				'add_new_item'       => 'Add the About page',
				'edit_item'          => 'Edit the About page',
				'new_item'           => 'New About page',
				'view_item'          => 'View page',
				'search_items'       => 'Search',
				'not_found'          => 'The About page was not created yet.',
				'not_found_in_trash' => 'Nothing in the trash.',
			),
			'description'         => 'The About page of the site (/about): a template of its own, one post.',
			// The page itself is the Next.js site's: WordPress shows no page of its own.
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_rest'        => true,
			'rest_base'           => 'about-posts',
			'menu_position'       => 23,
			'menu_icon'           => 'dashicons-info-outline',
			'hierarchical'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			// One page only: once it exists, no second one can be added.
			'capability_type'     => 'page',
			'map_meta_cap'        => true,
			'capabilities'        => array( 'create_posts' => ndm_headless_about_post_id() ? 'do_not_allow' : 'edit_pages' ),
			// No block editor and no photo of its own: the content is the fields below the title.
			'supports'            => array( 'title' ),
		)
	);
}
add_action( 'init', 'ndm_headless_about_register' );

/**
 * The edit screen uses the fields of the Concerns post type: their styles and script load here too.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_about_field_types( $types ) {
	$types[] = NDM_ABOUT_POST_TYPE;

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_about_field_types' );

/**
 * Every field of the About page, grouped as the boxes of the edit screen, in page order.
 *
 * Field types are those of ndm_headless_concern_schema().
 *
 * @return array[]
 */
function ndm_headless_about_schema() {
	$tag       = array( 'label' => 'Section tag', 'type' => 'text', 'help' => 'The small label above the heading.' );
	$heading_1 = array( 'label' => 'Heading, first line', 'type' => 'text' );
	$heading_2 = array( 'label' => 'Heading, second line (blue)', 'type' => 'text' );

	return array(
		array(
			'id'     => 'header',
			'title'  => 'Header',
			'help'   => 'The words over the clinic film at the top of the page. The film and the two buttons are the site\'s.',
			'fields' => array(
				array( 'key' => 'header_tag' ) + $tag,
				array( 'key' => 'heading_1', 'help' => 'For example "Toronto’s cosmetic".' ) + $heading_1,
				array( 'key' => 'heading_2', 'help' => 'For example "and laser clinic".' ) + $heading_2,
				array( 'key' => 'intro', 'label' => 'Text under the heading', 'type' => 'textarea', 'rows' => 4 ),
				array(
					'key'    => 'stats',
					'label'  => 'Numbers beside the text',
					'type'   => 'repeater',
					'add'    => 'Add a number',
					'title'  => 'unit',
					'help'   => 'Four fit the row. Each number counts up when it comes into view.',
					'fields' => array(
						array( 'key' => 'figure', 'label' => 'Number', 'type' => 'text', 'help' => 'A whole number, with a sign after it if needed: "16+" or "8".' ),
						array( 'key' => 'unit', 'label' => 'Words beside the number', 'type' => 'text', 'help' => 'For example "years".' ),
						array( 'key' => 'label', 'label' => 'Line under it', 'type' => 'text', 'help' => 'For example "In Toronto".' ),
					),
				),
			),
		),
		array(
			'id'     => 'seo',
			'title'  => 'Search Engines',
			'fields' => array(
				array( 'key' => 'seo_title', 'label' => 'Page title', 'type' => 'text' ),
				array( 'key' => 'seo_description', 'label' => 'Description', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'team',
			'title'  => 'Our Team',
			'help'   => 'The heading above the team cards. The members, their photos and profiles are the site\'s (the same as on the home page).',
			'fields' => array(
				array( 'key' => 'team_tag' ) + $tag,
				array( 'key' => 'team_lead' ) + $heading_1,
				array( 'key' => 'team_strong' ) + $heading_2,
				array( 'key' => 'team_intro', 'label' => 'Text beside the heading', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'clinics',
			'title'  => 'Our Clinics',
			'help'   => 'The heading above the two clinic cards. Addresses, phone numbers, hours, maps and parking are the site\'s (the same on every page).',
			'fields' => array(
				array( 'key' => 'clinics_tag' ) + $tag,
				array( 'key' => 'clinics_lead' ) + $heading_1,
				array( 'key' => 'clinics_strong' ) + $heading_2,
			),
		),
		array(
			'id'     => 'gallery',
			'title'  => 'Gallery And Awards',
			'help'   => 'The mosaic of clinic photos with the awards text under its middle columns. The Top Choice Award badges are the site\'s.',
			'fields' => array(
				array(
					'key'    => 'photos',
					'label'  => 'Photos',
					'type'   => 'repeater',
					'add'    => 'Add a photo',
					'title'  => 'title',
					'help'   => 'The mosaic has fourteen places, filled in this order; a place without a photo stays empty, and photos after the fourteenth show in the viewer only. The description read by screen readers is the photo\'s "Alternative text" in the media library.',
					'fields' => array(
						array( 'key' => 'image', 'label' => 'Photo', 'type' => 'image' ),
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text', 'help' => 'Shown in the viewer, for example "Reception".' ),
					),
				),
				array( 'key' => 'awards_tag' ) + $tag,
				array( 'key' => 'awards_line', 'label' => 'Line under the stars', 'type' => 'text', 'help' => 'For example "Top Choice Award · 8 consecutive years".' ),
				array( 'key' => 'awards_lead', 'label' => 'Heading, first line', 'type' => 'text' ),
				array( 'key' => 'awards_strong', 'label' => 'Heading, second line', 'type' => 'text' ),
				array( 'key' => 'awards_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'faqs',
			'title'  => 'FAQ',
			'help'   => 'No question: the section is left out.',
			'fields' => array(
				array( 'key' => 'faq_tag' ) + $tag,
				array( 'key' => 'faq_lead' ) + $heading_1,
				array( 'key' => 'faq_strong' ) + $heading_2,
				array( 'key' => 'faq_intro', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array(
					'key'    => 'faqs',
					'label'  => 'Questions',
					'type'   => 'repeater',
					'add'    => 'Add a question',
					'title'  => 'q',
					'fields' => array(
						array( 'key' => 'q', 'label' => 'Question', 'type' => 'text' ),
						array( 'key' => 'a', 'label' => 'Answer', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'contact',
			'title'  => 'Contact Us',
			'help'   => 'The words beside the message form. The clinics\' details, the email address and the form are the site\'s.',
			'fields' => array(
				array( 'key' => 'contact_tag' ) + $tag,
				array( 'key' => 'contact_lead' ) + $heading_1,
				array( 'key' => 'contact_strong' ) + $heading_2,
				array( 'key' => 'contact_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
			),
		),
	);
}

/**
 * Cleans the whole page: every field of the schema, nothing else.
 *
 * @param mixed $input Raw values by field key.
 * @return array
 */
function ndm_headless_about_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_about_schema() as $group ) {
		foreach ( $group['fields'] as $field ) {
			$clean[ $field['key'] ] = ndm_headless_concern_clean( $field, isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null );
		}
	}

	return $clean;
}

/**
 * The stored content of the page, complete (missing fields come back empty).
 *
 * @param int $post_id Post ID.
 * @return array
 */
function ndm_headless_about_content( $post_id ) {
	return ndm_headless_about_clean_all( get_post_meta( $post_id, NDM_ABOUT_META, true ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * The edit screen
 * ---------------------------------------------------------------------------------------------
 */

/**
 * One box per section of the page, under the title.
 */
function ndm_headless_about_meta_boxes() {
	$stored = null;

	foreach ( ndm_headless_about_schema() as $group ) {
		add_meta_box(
			'ndm-about-' . $group['id'],
			$group['title'],
			function ( $post ) use ( $group, &$stored ) {
				if ( null === $stored ) {
					$stored = ndm_headless_about_content( $post->ID );
					wp_nonce_field( 'ndm_about_save', 'ndm_about_nonce' );
				}

				if ( ! empty( $group['help'] ) ) {
					echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
				}

				foreach ( $group['fields'] as $field ) {
					ndm_headless_concern_field( $field, 'ndm_about[' . $field['key'] . ']', $stored[ $field['key'] ] );
				}
			},
			NDM_ABOUT_POST_TYPE,
			'normal',
			'default'
		);
	}
}
add_action( 'add_meta_boxes_' . NDM_ABOUT_POST_TYPE, 'ndm_headless_about_meta_boxes' );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_about_intro( $post ) {
	if ( NDM_ABOUT_POST_TYPE !== $post->post_type ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $site ) {
		$url = $site . '/about';
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shows these words once published; until then the site shows its built-in copy)' ) . '</p>';
	}
	echo '<p>The title above is only this page\'s name in the admin. Filled in by the site, not typed here: the clinic film, the team members and their profiles, the two clinics (addresses, phones, hours, maps, parking), the Top Choice Award badges, How it works, the message form and @newdermamed.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_about_intro' );

/**
 * Saves the fields of the edit screen.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_about_save( $post_id ) {
	if ( ! isset( $_POST['ndm_about_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_about_nonce'] ) ), 'ndm_about_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_about_clean_all().
	$input = isset( $_POST['ndm_about'] ) ? wp_unslash( $_POST['ndm_about'] ) : array();

	update_post_meta( $post_id, NDM_ABOUT_META, wp_slash( ndm_headless_about_clean_all( $input ) ) );
}
add_action( 'save_post_' . NDM_ABOUT_POST_TYPE, 'ndm_headless_about_save' );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The page as the site receives it.
 *
 * @param WP_Post $post The page.
 * @return array
 */
function ndm_headless_about_answer( $post ) {
	$content = ndm_headless_about_content( $post->ID );

	foreach ( ndm_headless_about_schema() as $group ) {
		$content = ndm_headless_concern_expand( $group['fields'], $content );
	}

	return array(
		'id'       => $post->ID,
		'title'    => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'modified' => mysql_to_rfc3339( $post->post_modified_gmt ),
		'content'  => $content,
	);
}

/**
 * Registers the route.
 */
function ndm_headless_about_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/about-page',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_about_rest',
			// Public on purpose: it holds only what the public page shows.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_about_routes' );

/**
 * GET ndm/v1/about-page: the published About page.
 *
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_about_rest() {
	$posts = get_posts(
		array(
			'post_type'   => NDM_ABOUT_POST_TYPE,
			'post_status' => 'publish',
			'numberposts' => 1,
			'orderby'     => 'ID',
			'order'       => 'ASC',
		)
	);

	if ( ! $posts ) {
		return new WP_Error( 'ndm_about_not_found', 'The About page is not published.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_about_answer( $posts[0] ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "the About page changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_about_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_about_notify_frontend' );
}

/**
 * The page was saved, trashed, restored or deleted.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_about_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( NDM_ABOUT_POST_TYPE === get_post_type( $post_id ) ) {
		ndm_headless_about_changed();
	}
}
add_action( 'save_post', 'ndm_headless_about_post_changed' );
add_action( 'trashed_post', 'ndm_headless_about_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_about_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_about_post_changed' );

/**
 * The page's content changed (it is post meta), or the description of a photo in the media library.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_about_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( NDM_ABOUT_META === $meta_key || '_wp_attachment_image_alt' === $meta_key ) {
		ndm_headless_about_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_about_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_about_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_about_meta_changed', 10, 3 );

/**
 * Asks the Next.js server to clear its cached About page. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_about_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'about' ) ),
		)
	);
}

/*
 * ---------------------------------------------------------------------------------------------
 * One-time import
 * ---------------------------------------------------------------------------------------------
 */

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Creates the About page from JSON on standard input:
	 *
	 *   { "title": "About us",
	 *     "content": { ...the fields of the edit screen; a photo is a file path under the import folder or
	 *                  an https address (or { "file", "alt" })... } }
	 *
	 * When the page already exists (in any state, the trash included) it is left exactly as it is, so
	 * running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-about.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm about-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm about-import',
		function ( $args, $assoc_args ) {
			$page = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $page ) || empty( $page['content'] ) || ! is_array( $page['content'] ) ) {
				WP_CLI::error( 'Expected the page as JSON on standard input: { "title", "content" }.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			$existing = get_posts(
				array(
					'post_type'   => NDM_ABOUT_POST_TYPE,
					'post_status' => 'any, trash',
					'numberposts' => 1,
					'fields'      => 'ids',
				)
			);
			if ( $existing ) {
				WP_CLI::log( "Kept: the About page ({$existing[0]}) already exists." );
				return;
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$content = $page['content'];
			foreach ( ndm_headless_about_schema() as $group ) {
				// The photo import of the Aptos pages: a file of the import folder, or an https address.
				$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
			}

			$id = wp_insert_post(
				array(
					'post_type'   => NDM_ABOUT_POST_TYPE,
					'post_status' => 'publish',
					'post_name'   => 'about',
					'post_title'  => wp_slash( isset( $page['title'] ) && '' !== trim( (string) $page['title'] ) ? trim( (string) $page['title'] ) : 'About us' ),
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				WP_CLI::error( 'About page: ' . $id->get_error_message() );
			}

			update_post_meta( $id, NDM_ABOUT_META, wp_slash( ndm_headless_about_clean_all( $content ) ) );

			WP_CLI::success( "Created: the About page ({$id})." );
		}
	);
}

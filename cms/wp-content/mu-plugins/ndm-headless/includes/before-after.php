<?php
/**
 * The Before & After gallery of the Next.js site (/before-after).
 *
 * - Post type "Before & After" (`ndm_before_after`): one post is one case. Its title is for the editor,
 *   its featured image is the before and after photo, "Order" (page attributes) places it in the gallery.
 * - Taxonomy "Category" (`ndm_ba_category`): the treatment a case belongs to. The gallery's filter
 *   buttons are the categories in use, in the order their first case appears.
 * - The WordPress page with the slug `before-after` ("Before & After") is the page that shows every
 *   case: its paragraphs are the intro text under the site's heading.
 * - `GET ndm/v1/before-after` gives the site the page and every published case in one answer.
 * - When a case, a category or the page changes, the Next.js site is told to drop its cached copy
 *   (tag `before-after`), so an edit shows on the site at once.
 * - `wp ndm before-after-import` creates the page and the original cases once.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_BA_POST_TYPE', 'ndm_before_after' );
define( 'NDM_BA_TAXONOMY', 'ndm_ba_category' );
define( 'NDM_BA_PAGE_SLUG', 'before-after' );

/**
 * Registers the post type and its taxonomy.
 */
function ndm_headless_ba_register() {
	register_post_type(
		NDM_BA_POST_TYPE,
		array(
			'labels'              => array(
				'name'                  => 'Before & After',
				'singular_name'         => 'Before & After case',
				'menu_name'             => 'Before & After',
				'all_items'             => 'All cases',
				'add_new'               => 'Add case',
				'add_new_item'          => 'Add a Before & After case',
				'edit_item'             => 'Edit case',
				'new_item'              => 'New case',
				'view_item'             => 'View case',
				'search_items'          => 'Search cases',
				'not_found'             => 'No cases found.',
				'not_found_in_trash'    => 'No cases in the trash.',
				'featured_image'        => 'Before & after photo',
				'set_featured_image'    => 'Set the before & after photo',
				'remove_featured_image' => 'Remove the photo',
				'use_featured_image'    => 'Use as the before & after photo',
				'attributes'            => 'Place in the gallery',
			),
			'description'         => 'Cases shown on the Before & After page of the site.',
			// No pages of its own: the site shows every case on one page.
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_rest'        => true,
			'rest_base'           => 'before-after-cases',
			'menu_position'       => 21,
			'menu_icon'           => 'dashicons-images-alt2',
			'hierarchical'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			'supports'            => array( 'title', 'thumbnail', 'page-attributes' ),
			'taxonomies'          => array( NDM_BA_TAXONOMY ),
		)
	);

	register_taxonomy(
		NDM_BA_TAXONOMY,
		NDM_BA_POST_TYPE,
		array(
			'labels'             => array(
				'name'          => 'Categories',
				'singular_name' => 'Category',
				'menu_name'     => 'Categories',
				'all_items'     => 'All categories',
				'edit_item'     => 'Edit category',
				'update_item'   => 'Update category',
				'add_new_item'  => 'Add a category',
				'new_item_name' => 'New category name',
				'search_items'  => 'Search categories',
				'not_found'     => 'No categories found.',
			),
			'description'        => 'The treatment a Before & After case belongs to (the gallery\'s filter).',
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_in_nav_menus'  => false,
			'show_tagcloud'      => false,
			'show_admin_column'  => true,
			'show_in_rest'       => true,
			'rest_base'          => 'before-after-categories',
			// Picked from a list of checkboxes, like post categories.
			'hierarchical'       => true,
			'rewrite'            => false,
			'query_var'          => false,
		)
	);
}
add_action( 'init', 'ndm_headless_ba_register' );

/**
 * The case's photo is its featured image: makes sure the active theme (which never renders) allows one.
 */
function ndm_headless_ba_thumbnails() {
	$support = get_theme_support( 'post-thumbnails' );

	if ( true === $support ) {
		return;
	}

	if ( is_array( $support ) && isset( $support[0] ) && is_array( $support[0] ) ) {
		add_theme_support( 'post-thumbnails', array_values( array_unique( array_merge( $support[0], array( NDM_BA_POST_TYPE ) ) ) ) );
		return;
	}

	add_theme_support( 'post-thumbnails', array( NDM_BA_POST_TYPE ) );
}
add_action( 'after_setup_theme', 'ndm_headless_ba_thumbnails', 99 );

/**
 * The published "Before & After" page, or null.
 *
 * @return WP_Post|null
 */
function ndm_headless_ba_page() {
	$page = get_page_by_path( NDM_BA_PAGE_SLUG, OBJECT, 'page' );

	return $page instanceof WP_Post && 'publish' === $page->post_status ? $page : null;
}

/**
 * In the list of pages, says what the Before & After page is for.
 *
 * @param string[] $states Notes shown beside the page's title.
 * @param WP_Post  $post   The page.
 * @return string[]
 */
function ndm_headless_ba_page_state( $states, $post ) {
	if ( 'page' === $post->post_type && NDM_BA_PAGE_SLUG === $post->post_name ) {
		$states['ndm_before_after'] = 'Shows every Before & After case';
	}

	return $states;
}
add_filter( 'display_post_states', 'ndm_headless_ba_page_state', 10, 2 );

/**
 * Registers GET ndm/v1/before-after.
 */
function ndm_headless_ba_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/before-after',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_ba_rest',
			// Public on purpose: it holds only what the public gallery shows.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_ba_routes' );

/**
 * GET ndm/v1/before-after: the page and every published case that has a photo, in gallery order
 * ("Order" first, then newest first).
 *
 * @return WP_REST_Response
 */
function ndm_headless_ba_rest() {
	$page  = ndm_headless_ba_page();
	$posts = get_posts(
		array(
			'post_type'        => NDM_BA_POST_TYPE,
			'post_status'      => 'publish',
			'numberposts'      => 500,
			'orderby'          => array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
				'ID'         => 'DESC',
			),
			'suppress_filters' => false,
		)
	);

	$cases = array();

	foreach ( $posts as $post ) {
		$image_id = (int) get_post_thumbnail_id( $post );
		$image    = $image_id ? wp_get_attachment_image_src( $image_id, 'full' ) : false;

		if ( ! $image ) {
			continue;
		}

		$terms      = get_the_terms( $post, NDM_BA_TAXONOMY );
		$categories = array();

		if ( is_array( $terms ) ) {
			foreach ( $terms as $term ) {
				$categories[] = array(
					'slug' => $term->slug,
					'name' => html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' ),
				);
			}
		}

		$cases[] = array(
			'id'         => $post->ID,
			'title'      => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
			'categories' => $categories,
			'photo'      => array(
				'id'     => $image_id,
				'src'    => $image[0],
				'width'  => (int) $image[1],
				'height' => (int) $image[2],
				'srcSet' => (string) wp_get_attachment_image_srcset( $image_id, 'full' ),
			),
		);
	}

	return rest_ensure_response(
		array(
			'page'  => $page ? array(
				'title'    => html_entity_decode( get_the_title( $page ), ENT_QUOTES, 'UTF-8' ),
				// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WordPress's own filter.
				'content'  => apply_filters( 'the_content', $page->post_content ),
				'modified' => mysql_to_rfc3339( $page->post_modified_gmt ),
			) : null,
			'cases' => $cases,
		)
	);
}

/**
 * Queues one "gallery changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_ba_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_ba_notify_frontend' );
}

/**
 * A case, or the Before & After page, was saved, trashed, restored or deleted.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_ba_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	$post = get_post( $post_id );

	if ( ! $post instanceof WP_Post ) {
		return;
	}

	// A trashed page's slug is "before-after__trashed".
	$is_page = 'page' === $post->post_type && 0 === strpos( $post->post_name, NDM_BA_PAGE_SLUG );

	if ( NDM_BA_POST_TYPE === $post->post_type || $is_page ) {
		ndm_headless_ba_changed();
	}
}
add_action( 'save_post', 'ndm_headless_ba_post_changed' );
add_action( 'trashed_post', 'ndm_headless_ba_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_ba_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_ba_post_changed' );

/**
 * A case's photo was set, changed or removed (stored as the post meta `_thumbnail_id`).
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_ba_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( '_thumbnail_id' === $meta_key && NDM_BA_POST_TYPE === get_post_type( $post_id ) ) {
		ndm_headless_ba_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_ba_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_ba_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_ba_meta_changed', 10, 3 );

/**
 * A case was moved to other categories.
 *
 * @param int    $object_id Post ID.
 * @param array  $terms     Terms.
 * @param array  $tt_ids    Term taxonomy IDs.
 * @param string $taxonomy  Taxonomy.
 */
function ndm_headless_ba_terms_set( $object_id, $terms, $tt_ids, $taxonomy ) {
	if ( NDM_BA_TAXONOMY === $taxonomy ) {
		ndm_headless_ba_changed();
	}
}
add_action( 'set_object_terms', 'ndm_headless_ba_terms_set', 10, 4 );
add_action( 'edited_' . NDM_BA_TAXONOMY, 'ndm_headless_ba_changed', 10, 0 );
add_action( 'delete_' . NDM_BA_TAXONOMY, 'ndm_headless_ba_changed', 10, 0 );

/**
 * Asks the Next.js server to clear its cached gallery. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_ba_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'before-after' ) ),
		)
	);
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Creates the Before & After page and the original cases from JSON on standard input:
	 *
	 *   { "page":  { "title": "Before & After", "content": "<block markup>" },
	 *     "cases": [ { "title": "Belkyra 1", "category": "Belkyra", "image": "Belkyra-e1762378989683.webp" } ] }
	 *
	 * The page is created only when no page has the slug `before-after` (in any state, the trash
	 * included). The cases are imported only when WordPress holds no case yet. So running this again
	 * never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder holding the photos named in "image".
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-before-after.mjs | docker compose run --rm -T -v "$PWD/../assets/before-after:/tmp/ba:ro" cli wp ndm before-after-import --images=/tmp/ba
	 */
	WP_CLI::add_command(
		'ndm before-after-import',
		function ( $args, $assoc_args ) {
			$data = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $data ) || empty( $data['cases'] ) || ! is_array( $data['cases'] ) ) {
				WP_CLI::error( 'Expected JSON with a list of cases on standard input.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder with the photos: --images=<dir>.' );
			}

			// The page.
			$existing = get_posts(
				array(
					'post_type'   => 'page',
					'name'        => NDM_BA_PAGE_SLUG,
					'post_status' => 'any, trash',
					'numberposts' => 1,
					'fields'      => 'ids',
				)
			);
			if ( $existing ) {
				WP_CLI::log( "Kept: page {$existing[0]} (" . NDM_BA_PAGE_SLUG . ') already exists.' );
			} else {
				$id = wp_insert_post(
					array(
						'post_type'    => 'page',
						'post_status'  => 'publish',
						'post_name'    => NDM_BA_PAGE_SLUG,
						'post_title'   => isset( $data['page']['title'] ) ? wp_slash( (string) $data['page']['title'] ) : 'Before &amp; After',
						'post_content' => isset( $data['page']['content'] ) ? wp_slash( (string) $data['page']['content'] ) : '',
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( 'Could not create the page: ' . $id->get_error_message() );
				} else {
					WP_CLI::success( "Created: page {$id} (" . NDM_BA_PAGE_SLUG . ').' );
				}
			}

			// The cases.
			$any = get_posts(
				array(
					'post_type'   => NDM_BA_POST_TYPE,
					'post_status' => 'any, trash',
					'numberposts' => 1,
					'fields'      => 'ids',
				)
			);
			if ( $any ) {
				WP_CLI::success( 'WordPress already holds Before & After cases; none imported.' );
				return;
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$terms = array(); // Exact name => term ID.
			$made  = 0;
			$order = 0;

			foreach ( $data['cases'] as $case ) {
				$title    = isset( $case['title'] ) ? trim( (string) $case['title'] ) : '';
				$category = isset( $case['category'] ) ? trim( (string) $case['category'] ) : '';
				$file     = isset( $case['image'] ) ? $dir . '/' . basename( (string) $case['image'] ) : '';
				++$order;

				if ( '' === $title || '' === $file || ! is_readable( $file ) ) {
					WP_CLI::warning( "Skipped case {$order}: no title, or photo {$file} not found." );
					continue;
				}

				if ( '' !== $category && ! isset( $terms[ $category ] ) ) {
					$term = wp_insert_term( wp_slash( $category ), NDM_BA_TAXONOMY );
					if ( is_wp_error( $term ) ) {
						// The same name in another letter case ("Laser Acne" and "Laser acne" are two filters of the original gallery).
						$term = wp_insert_term( wp_slash( $category ), NDM_BA_TAXONOMY, array( 'slug' => wp_unique_term_slug( sanitize_title( $category ) . '-2', (object) array( 'taxonomy' => NDM_BA_TAXONOMY, 'parent' => 0 ) ) ) );
					}
					if ( is_wp_error( $term ) ) {
						WP_CLI::warning( "Category \"{$category}\": " . $term->get_error_message() );
					} else {
						$terms[ $category ] = (int) $term['term_id'];
					}
				}

				$id = wp_insert_post(
					array(
						'post_type'   => NDM_BA_POST_TYPE,
						'post_status' => 'publish',
						'post_title'  => wp_slash( $title ),
						'menu_order'  => $order,
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( "Case {$order}: " . $id->get_error_message() );
					continue;
				}

				if ( isset( $terms[ $category ] ) ) {
					wp_set_object_terms( $id, array( $terms[ $category ] ), NDM_BA_TAXONOMY );
				}

				$alt = ( '' !== $category ? $category : $title ) . ', before and after';

				// media_handle_sideload() moves the file it is given: hand it a copy.
				$copy = wp_tempnam( basename( $file ) );
				copy( $file, $copy );
				$image = media_handle_sideload(
					array(
						'name'     => basename( $file ),
						'tmp_name' => $copy,
					),
					$id,
					$alt
				);
				if ( is_wp_error( $image ) ) {
					WP_CLI::warning( "Photo {$file}: " . $image->get_error_message() );
					continue;
				}
				update_post_meta( $image, '_wp_attachment_image_alt', wp_slash( $alt ) );
				set_post_thumbnail( $id, $image );
				++$made;
			}

			WP_CLI::success( sprintf( '%d cases imported.', $made ) );
		}
	);
}

<?php
/**
 * The blog of the Next.js site: /blog (the list) and one page per article (/<the post's slug>).
 *
 * - An article is an ordinary WordPress post. Its title, date, first category (the topic), excerpt
 *   (the summary on its card and for search engines) and text (the block editor) are WordPress's own.
 *   Its featured image is the wide photo at the top of the article.
 * - A few things the design needs and a post does not have are typed into the "Article page" box
 *   under the editor (one post meta, `_ndm_post`): the two lines of the heading, the key takeaway,
 *   the tall photo of the card, the reading time, and where the article opens while it has no text here.
 *   The fields are the ones of the Concerns post type (includes/concerns.php).
 * - A post with text has its own page on the site. A post without text shows on the list only, and
 *   its card opens the "Opens at" address (the clinic's earlier site) until its text is written.
 * - `GET ndm/v1/blog` lists every published post, newest first; `GET ndm/v1/blog/<slug>` gives one
 *   with its text.
 * - When a post, its photo, its fields or a category changes, the Next.js site is told to drop its
 *   cached copy (tag `blog`).
 * - `wp ndm blog-import` creates the posts once, from the site's original list.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_POST_META', '_ndm_post' );

/** Words read per minute, for the reading time of a post that has none typed. */
define( 'NDM_POST_WORDS_PER_MINUTE', 200 );

/**
 * The edit screen of a post uses the fields of the Concerns post type: their styles and script load there too.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_blog_field_types( $types ) {
	$types[] = 'post';

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_blog_field_types' );

/**
 * The fields of the "Article page" box. Field types are those of ndm_headless_concern_schema().
 *
 * @return array[]
 */
function ndm_headless_blog_fields() {
	return array(
		array( 'key' => 'heading_1', 'label' => 'Heading, first line', 'type' => 'text', 'help' => 'The big heading of the article page is written in two lines, for example "What causes". Both empty: the title, broken in the middle.' ),
		array( 'key' => 'heading_2', 'label' => 'Heading, second line (blue)', 'type' => 'text', 'help' => 'For example "rosacea redness".' ),
		array( 'key' => 'takeaway', 'label' => 'Key takeaway', 'type' => 'textarea', 'help' => 'The sentence in the card at the end of the article. Empty: the excerpt.' ),
		array( 'key' => 'card_image', 'label' => 'Card photo (tall)', 'type' => 'image', 'help' => 'The photo of this article\'s card on the blog. Empty: the featured image, which is the wide photo at the top of the article.' ),
		array( 'key' => 'minutes', 'label' => 'Reading time, in minutes', 'type' => 'text', 'help' => 'Empty: worked out from the length of the text.' ),
		array( 'key' => 'external', 'label' => 'Opens at', 'type' => 'text', 'help' => 'Only for a post without text: the full address its card opens (in a new tab), for example the article on the clinic\'s earlier site. Once the post has text it has its own page here and this is ignored.' ),
	);
}

/**
 * Cleans the fields of the box: every field of the list, nothing else.
 *
 * @param mixed $input Raw values by field key.
 * @return array
 */
function ndm_headless_blog_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_blog_fields() as $field ) {
		$clean[ $field['key'] ] = ndm_headless_concern_clean( $field, isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null );
	}

	$minutes          = absint( $clean['minutes'] );
	$clean['minutes'] = $minutes ? (string) min( 99, $minutes ) : '';
	$clean['external'] = esc_url_raw( $clean['external'], array( 'http', 'https' ) );

	return $clean;
}

/**
 * The stored fields of a post, complete (missing fields come back empty).
 *
 * @param int $post_id Post ID.
 * @return array
 */
function ndm_headless_blog_content( $post_id ) {
	return ndm_headless_blog_clean_all( get_post_meta( $post_id, NDM_POST_META, true ) );
}

/**
 * The "Article page" box under the editor.
 */
function ndm_headless_blog_meta_box() {
	add_meta_box(
		'ndm-post-article',
		'Article page',
		function ( $post ) {
			$stored = ndm_headless_blog_content( $post->ID );
			$site   = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

			wp_nonce_field( 'ndm_post_save', 'ndm_post_nonce' );

			echo '<p class="ndm-cn-note">On the site: the title, the date, the first category (the topic), the excerpt (the summary on the card and for search engines), the featured image (the wide photo at the top) and the text above are this post\'s own. A post with text has its own page';
			if ( '' !== $site && '' !== $post->post_name ) {
				$url = $site . ndm_headless_site_path( $post );
				echo ', <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>';
			}
			echo '; a post without text shows on the blog list only.</p>';

			foreach ( ndm_headless_blog_fields() as $field ) {
				ndm_headless_concern_field( $field, 'ndm_post[' . $field['key'] . ']', $stored[ $field['key'] ] );
			}
		},
		'post',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes_post', 'ndm_headless_blog_meta_box' );

/**
 * Saves the fields of the box.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_blog_save( $post_id ) {
	if ( ! isset( $_POST['ndm_post_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_post_nonce'] ) ), 'ndm_post_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_blog_clean_all().
	$input = isset( $_POST['ndm_post'] ) ? wp_unslash( $_POST['ndm_post'] ) : array();

	update_post_meta( $post_id, NDM_POST_META, wp_slash( ndm_headless_blog_clean_all( $input ) ) );
}
add_action( 'save_post_post', 'ndm_headless_blog_save' );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * A photo of the media library with its smaller copies (`srcset`), or null.
 *
 * @param int $image_id Attachment ID.
 * @return array|null
 */
function ndm_headless_blog_image( $image_id ) {
	$image = ndm_headless_concern_image( $image_id );

	if ( ! $image ) {
		return null;
	}

	$image['srcset'] = (string) wp_get_attachment_image_srcset( $image_id, 'full' );

	return $image;
}

/**
 * A post as its card on the blog: everything but its text.
 *
 * @param WP_Post $post The post.
 * @return array
 */
function ndm_headless_blog_card( $post ) {
	$fields = ndm_headless_blog_content( $post->ID );
	$text   = trim( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ) );

	$topic = '';
	$terms = get_the_category( $post->ID );
	foreach ( is_array( $terms ) ? $terms : array() as $term ) {
		// WordPress's catch-all category is not a topic.
		if ( (int) get_option( 'default_category' ) !== (int) $term->term_id ) {
			$topic = html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' );
			break;
		}
	}

	$excerpt = trim( $post->post_excerpt );
	if ( '' === $excerpt ) {
		$excerpt = wp_trim_words( $text, 40, ' …' );
	}

	$minutes = (int) $fields['minutes'];
	if ( ! $minutes && '' !== $text ) {
		$minutes = max( 1, (int) ceil( count( preg_split( '/\s+/', $text ) ) / NDM_POST_WORDS_PER_MINUTE ) );
	}

	$hero = ndm_headless_blog_image( (int) get_post_thumbnail_id( $post ) );
	$card = ndm_headless_blog_image( (int) $fields['card_image'] );

	return array(
		'id'        => $post->ID,
		'slug'      => $post->post_name,
		'title'     => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		// As the page shows it, and for machines.
		'date'      => get_the_date( 'F j, Y', $post ),
		'published' => mysql_to_rfc3339( $post->post_date_gmt ) . '+00:00',
		'modified'  => mysql_to_rfc3339( $post->post_modified_gmt ) . '+00:00',
		'topic'     => $topic,
		'minutes'   => $minutes,
		'image'     => $card ? $card : $hero,
		'hero'      => $hero ? $hero : $card,
		'excerpt'   => html_entity_decode( wp_strip_all_tags( $excerpt ), ENT_QUOTES, 'UTF-8' ),
		// True when the post has text: it then has its own page on the site.
		'page'      => '' !== $text,
		'external'  => '' !== $text ? '' : $fields['external'],
	);
}

/**
 * Registers the routes.
 */
function ndm_headless_blog_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/blog',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_blog_rest_list',
			// Public on purpose: it holds only what the public pages show.
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/blog/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_blog_rest_one',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_blog_routes' );

/**
 * GET ndm/v1/blog: every published post as a card, newest first.
 *
 * @return WP_REST_Response
 */
function ndm_headless_blog_rest_list() {
	$posts = get_posts(
		array(
			'post_type'   => 'post',
			'post_status' => 'publish',
			'numberposts' => 1000,
			// Newest first; posts of the same moment in the order they were made.
			'orderby'     => array(
				'date' => 'DESC',
				'ID'   => 'ASC',
			),
		)
	);

	return rest_ensure_response( array( 'posts' => array_map( 'ndm_headless_blog_card', $posts ) ) );
}

/**
 * GET ndm/v1/blog/<slug>: one published post that has text, with it.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_blog_rest_one( $request ) {
	$posts = get_posts(
		array(
			'post_type'   => 'post',
			'post_status' => 'publish',
			'name'        => (string) $request['slug'],
			'numberposts' => 1,
		)
	);

	$card = $posts ? ndm_headless_blog_card( $posts[0] ) : null;

	if ( ! $card || ! $card['page'] ) {
		return new WP_Error( 'ndm_post_not_found', 'No published post with text has this address.', array( 'status' => 404 ) );
	}

	$fields = ndm_headless_blog_content( $posts[0]->ID );

	// The same HTML WordPress's own REST API gives: blocks rendered, photos with their smaller copies.
	// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WordPress's own filter.
	$html = apply_filters( 'the_content', $posts[0]->post_content );

	return rest_ensure_response(
		$card + array(
			'heading'  => array( $fields['heading_1'], $fields['heading_2'] ),
			'takeaway' => $fields['takeaway'],
			'content'  => $html,
		)
	);
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "blog changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_blog_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_blog_notify_frontend' );
}

/**
 * A post was saved, trashed, restored or deleted.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_blog_post_changed( $post_id ) {
	if ( 'post' === get_post_type( $post_id ) && ! wp_is_post_revision( $post_id ) && ! wp_is_post_autosave( $post_id ) ) {
		ndm_headless_blog_changed();
	}
}
add_action( 'save_post', 'ndm_headless_blog_post_changed' );
add_action( 'trashed_post', 'ndm_headless_blog_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_blog_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_blog_post_changed' );

/**
 * A post's photo or its "Article page" fields changed (both are post meta), or a photo's alternative text.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_blog_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( in_array( $meta_key, array( '_thumbnail_id', NDM_POST_META ), true ) && 'post' === get_post_type( $post_id ) ) {
		ndm_headless_blog_changed();
	}

	if ( '_wp_attachment_image_alt' === $meta_key ) {
		ndm_headless_blog_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_blog_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_blog_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_blog_meta_changed', 10, 3 );

/**
 * A post's categories were changed: its card shows the first one.
 *
 * @param int    $object_id Post ID.
 * @param array  $terms     Terms.
 * @param array  $tt_ids    Term taxonomy IDs.
 * @param string $taxonomy  Taxonomy.
 */
function ndm_headless_blog_terms_set( $object_id, $terms, $tt_ids, $taxonomy ) {
	if ( 'category' === $taxonomy ) {
		ndm_headless_blog_changed();
	}
}
add_action( 'set_object_terms', 'ndm_headless_blog_terms_set', 10, 4 );
// A category was renamed or deleted.
add_action( 'edited_category', 'ndm_headless_blog_changed', 10, 0 );
add_action( 'delete_category', 'ndm_headless_blog_changed', 10, 0 );

/**
 * Asks the Next.js server to clear its cached blog. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_blog_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'blog' ) ),
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
	 * Creates the blog's posts from JSON on standard input:
	 *
	 *   [ { "slug": "what-causes-rosacea-redness", "title": "...", "date": "2025-11-26", "topic": "Skin",
	 *       "excerpt": "...", "image": "wide.webp", "card": "tall.webp", "minutes": 9,
	 *       "external": "https://...", "heading": [ "What causes", "rosacea redness" ], "takeaway": "...",
	 *       "content": "<block markup; a photo is written {{image:file.jpg|alternative text}}>" } ]
	 *
	 * A post whose slug already exists (in any state, the trash included) keeps its title, text, date
	 * and photo exactly as they are; only when it has no "Article page" fields yet are those filled in.
	 * Running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo file names are in.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-blog.mjs | docker compose run --rm -T -v "$PWD/../assets/blog:/tmp/blog:ro" cli wp ndm blog-import --images=/tmp/blog
	 */
	WP_CLI::add_command(
		'ndm blog-import',
		function ( $args, $assoc_args ) {
			$posts = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $posts ) || ! $posts ) {
				WP_CLI::error( 'Expected a JSON list of posts on standard input.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photos are in: --images=<dir>.' );
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			foreach ( $posts as $entry ) {
				$slug  = isset( $entry['slug'] ) ? sanitize_title( (string) $entry['slug'] ) : '';
				$title = isset( $entry['title'] ) ? trim( (string) $entry['title'] ) : '';

				if ( '' === $slug || '' === $title ) {
					WP_CLI::warning( 'Skipped a post without a slug or a title.' );
					continue;
				}

				$fields = array(
					'heading_1' => isset( $entry['heading'][0] ) ? (string) $entry['heading'][0] : '',
					'heading_2' => isset( $entry['heading'][1] ) ? (string) $entry['heading'][1] : '',
					'takeaway'  => isset( $entry['takeaway'] ) ? (string) $entry['takeaway'] : '',
					'minutes'   => isset( $entry['minutes'] ) ? (string) (int) $entry['minutes'] : '',
					'external'  => isset( $entry['external'] ) ? (string) $entry['external'] : '',
				);
				$card   = empty( $entry['card'] ) ? 0 : ndm_headless_concern_import_image( $dir, (string) $entry['card'], '' );

				$existing = array();
				// A trashed post's slug is "<slug>__trashed".
				foreach ( array( $slug, $slug . '__trashed' ) as $name ) {
					$existing = $existing ? $existing : get_posts(
						array(
							'post_type'   => 'post',
							'name'        => $name,
							'post_status' => 'any, trash',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
				}
				if ( $existing ) {
					if ( metadata_exists( 'post', $existing[0], NDM_POST_META ) ) {
						WP_CLI::log( "Kept: post {$existing[0]} ({$slug}) already exists." );
					} else {
						update_post_meta( $existing[0], NDM_POST_META, wp_slash( ndm_headless_blog_clean_all( $fields + array( 'card_image' => $card ) ) ) );
						WP_CLI::log( "Kept: post {$existing[0]} ({$slug}) already exists; its Article page fields were filled in." );
					}
					continue;
				}

				// A photo inside the text: put into the media library, written as an image block.
				$content = isset( $entry['content'] ) ? (string) $entry['content'] : '';
				$content = preg_replace_callback(
					'/\{\{image:([^|}]+)\|([^}]*)\}\}/',
					function ( $m ) use ( $dir ) {
						$id  = ndm_headless_concern_import_image( $dir, $m[1], $m[2] );
						$src = $id ? wp_get_attachment_image_url( $id, 'large' ) : '';
						if ( ! $src ) {
							return '';
						}
						return '<!-- wp:image {"id":' . $id . ',"sizeSlug":"large","linkDestination":"none"} -->' . "\n"
							. '<figure class="wp-block-image size-large"><img src="' . esc_url( $src ) . '" alt="' . esc_attr( $m[2] ) . '" class="wp-image-' . $id . '"/></figure>' . "\n"
							. '<!-- /wp:image -->';
					},
					$content
				);

				$category = 0;
				if ( ! empty( $entry['topic'] ) ) {
					$term = term_exists( (string) $entry['topic'], 'category' );
					if ( ! $term ) {
						$term = wp_insert_term( wp_slash( (string) $entry['topic'] ), 'category' );
					}
					$category = is_array( $term ) ? (int) $term['term_id'] : 0;
				}

				$date = ! empty( $entry['date'] ) ? gmdate( 'Y-m-d 09:00:00', (int) strtotime( (string) $entry['date'] ) ) : '';
				$id   = wp_insert_post(
					array(
						'post_type'     => 'post',
						'post_status'   => 'publish',
						'post_name'     => $slug,
						'post_title'    => wp_slash( $title ),
						'post_excerpt'  => isset( $entry['excerpt'] ) ? wp_slash( (string) $entry['excerpt'] ) : '',
						'post_content'  => wp_slash( $content ),
						'post_date'     => $date,
						'post_date_gmt' => $date ? get_gmt_from_date( $date ) : '',
						'post_category' => $category ? array( $category ) : array(),
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( "Post {$slug}: " . $id->get_error_message() );
					continue;
				}

				$wide = empty( $entry['image'] ) ? 0 : ndm_headless_concern_import_image( $dir, (string) $entry['image'], '' );
				if ( $wide ) {
					set_post_thumbnail( $id, $wide );
				}

				update_post_meta( $id, NDM_POST_META, wp_slash( ndm_headless_blog_clean_all( $fields + array( 'card_image' => $card ) ) ) );

				WP_CLI::success( "Created: post {$id} ({$slug})." );
			}
		}
	);
}

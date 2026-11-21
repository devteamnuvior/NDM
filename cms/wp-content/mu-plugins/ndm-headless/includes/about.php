<?php
/**
 * The About page of the Next.js site (/about).
 *
 * - It is a standard WordPress page (Pages in the admin), not a post type of its own. The page is
 *   recognised by its template "About page" (`ndm-about`, chosen under Page Attributes), so it can be
 *   renamed safely; a page without that template whose slug is `about` is recognised too, and gets the
 *   template the next time it is saved. Its address on the site is always /about.
 * - On that one page the block editor is switched off and the text editor hidden: its content is the
 *   boxes under the title, one per section of the page that carries its own words or photos (one post
 *   meta, `_ndm_about`). Every other page keeps its editor. The fields are listed once, in
 *   ndm_headless_about_schema(); the edit screen, the saving, the REST answer and the import all read
 *   that list. The fields themselves (their look, cleaning and photo picker) are the ones of the
 *   Concerns post type (includes/concerns.php).
 * - The fields are part of the page's revisions: every save that changes them makes a revision, the
 *   revisions screen shows what changed, and restoring a revision restores the fields.
 * - What the page shares with the rest of the site lives in the site's code: the clinic film, the team
 *   members and their profiles, the two clinics (addresses, phones, hours, maps, parking), the Top
 *   Choice Award badges, How it works, the contact form and @newdermamed.
 * - `GET ndm/v1/about-page` gives the published page. When there is no About page, or it is not
 *   published, the answer is 404 and the site shows its built-in copy; the admin says so on the Pages
 *   screen.
 * - When the page changes, the Next.js site is told to drop its cached copy (tag `about`).
 * - `wp ndm about-import` creates the page once, from the site's original content.
 *   `wp ndm about-migrate` moves the content of the former post type "About Page" onto the page.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_ABOUT_META', '_ndm_about' );
// The value of the page's "Template" (post meta `_wp_page_template`).
define( 'NDM_ABOUT_TEMPLATE', 'ndm-about' );
define( 'NDM_ABOUT_SLUG', 'about' );
// The post type the page lived in until 2026-11-13 (no longer registered): only the migration reads it.
define( 'NDM_ABOUT_OLD_POST_TYPE', 'ndm_about' );

/*
 * ---------------------------------------------------------------------------------------------
 * Which page is the About page
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The pages that carry the "About page" template (the trash left out): a published one first, then
 * the oldest. There should be exactly one.
 *
 * @return int[]
 */
function ndm_headless_about_templated() {
	$ids = get_posts(
		array(
			'post_type'        => 'page',
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 20,
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'fields'           => 'ids',
			'meta_key'         => '_wp_page_template', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a handful of pages.
			'meta_value'       => NDM_ABOUT_TEMPLATE, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- a handful of pages.
			'suppress_filters' => true,
		)
	);
	$ids = array_map( 'intval', $ids );

	usort(
		$ids,
		function ( $a, $b ) {
			$published = (int) ( 'publish' === get_post_status( $b ) ) - (int) ( 'publish' === get_post_status( $a ) );

			return $published ? $published : $a - $b;
		}
	);

	return $ids;
}

/**
 * The About page: the page with the "About page" template, else the top-level page whose slug is
 * `about`. 0 when there is none.
 *
 * @return int
 */
function ndm_headless_about_page_id() {
	$templated = ndm_headless_about_templated();
	if ( $templated ) {
		return $templated[0];
	}

	$by_slug = get_posts(
		array(
			'post_type'        => 'page',
			'name'             => NDM_ABOUT_SLUG,
			'post_parent'      => 0,
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 1,
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'fields'           => 'ids',
			'suppress_filters' => true,
		)
	);

	return $by_slug ? (int) $by_slug[0] : 0;
}

/**
 * Whether this post is the About page.
 *
 * @param WP_Post|int|null $post Post or post ID.
 * @return bool
 */
function ndm_headless_is_about_page( $post ) {
	$post = get_post( $post );

	return $post instanceof WP_Post && 'page' === $post->post_type && ndm_headless_about_page_id() === (int) $post->ID;
}

/**
 * "About page" is offered as a template of pages (Page Attributes), whatever the active theme.
 *
 * @param string[] $templates Templates by file name.
 * @return string[]
 */
function ndm_headless_about_template( $templates ) {
	$templates[ NDM_ABOUT_TEMPLATE ] = 'About page';

	return $templates;
}
add_filter( 'theme_page_templates', 'ndm_headless_about_template' );

/**
 * The About page has no block editor; every other page keeps its own.
 *
 * @param bool    $use  Whether the block editor is used.
 * @param WP_Post $post The post being edited.
 * @return bool
 */
function ndm_headless_about_no_block_editor( $use, $post ) {
	return $use && $post instanceof WP_Post && 'page' === $post->post_type && ndm_headless_is_about_page( $post ) ? false : $use;
}
add_filter( 'use_block_editor_for_post', 'ndm_headless_about_no_block_editor', 20, 2 );

/**
 * The edit screen uses the fields of the Concerns post type: their styles and script load on the
 * About page's edit screen, and on no other page's.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_about_field_types( $types ) {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	if ( $screen && 'page' === $screen->post_type && ndm_headless_is_about_page( get_post() ) ) {
		$types[] = 'page';
	}

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
 * The stored content of the page (or of one of its revisions), complete (missing fields come back empty).
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
 * On the About page: one box per section of the page under the title, and no text editor.
 *
 * @param WP_Post $post The page being edited.
 */
function ndm_headless_about_meta_boxes( $post ) {
	if ( ! ndm_headless_is_about_page( $post ) ) {
		return;
	}

	// For this request only: the page's content is the boxes, not the text editor.
	remove_post_type_support( 'page', 'editor' );

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
			'page',
			'normal',
			'high'
		);
	}
}
add_action( 'add_meta_boxes_page', 'ndm_headless_about_meta_boxes' );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_about_intro( $post ) {
	if ( ! ndm_headless_is_about_page( $post ) ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $site ) {
		$url = $site . '/about';
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shows these words once published; until then the site shows its built-in copy)' ) . '</p>';
	}
	echo '<p>This is the site\'s About page: it is recognised by its template "About page" (Page Attributes), so the title and the slug above are only its name in the admin; the address on the site is always /about. Filled in by the site, not typed here: the clinic film, the team members and their profiles, the two clinics (addresses, phones, hours, maps, parking), the Top Choice Award badges, How it works, the message form and @newdermamed.</p>';
	echo '<p>Every save is kept under Revisions, fields included: an earlier version can be compared and restored there.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_about_intro' );

/**
 * Saves the fields of the edit screen. It runs on `post_updated` before WordPress stores the page's
 * revision (priority 10), so the revision made by this save holds the fields as they were just saved.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_about_save( $post_id ) {
	if ( ! isset( $_POST['ndm_about_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_about_nonce'] ) ), 'ndm_about_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) || ! ndm_headless_is_about_page( $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_about_clean_all().
	$input = isset( $_POST['ndm_about'] ) ? wp_unslash( $_POST['ndm_about'] ) : array();

	update_post_meta( $post_id, NDM_ABOUT_META, wp_slash( ndm_headless_about_clean_all( $input ) ) );

	// A page recognised by its slug alone gets the template, so a later rename cannot lose it.
	if ( NDM_ABOUT_TEMPLATE !== get_post_meta( $post_id, '_wp_page_template', true ) ) {
		update_post_meta( $post_id, '_wp_page_template', NDM_ABOUT_TEMPLATE );
	}
}
add_action( 'post_updated', 'ndm_headless_about_save', 5 );

/**
 * The list of pages marks the About page.
 *
 * @param string[] $states Labels after the title.
 * @param WP_Post  $post   The page.
 * @return string[]
 */
function ndm_headless_about_post_state( $states, $post ) {
	if ( 'page' === $post->post_type && ndm_headless_is_about_page( $post ) ) {
		$states['ndm_about'] = 'About page of the site';
	}

	return $states;
}
add_filter( 'display_post_states', 'ndm_headless_about_post_state', 10, 2 );

/**
 * What is wrong with the About page, in words for the admin; empty when it is in order.
 *
 * @return string[]
 */
function ndm_headless_about_problems() {
	$id = ndm_headless_about_page_id();

	if ( ! $id ) {
		return array( 'The site\'s About page was not found, so /about shows the site\'s built-in copy. Create a page, choose the template "About page" under Page Attributes (or give it the slug "about"), and publish it.' );
	}

	$problems  = array();
	$templated = ndm_headless_about_templated();
	$name      = '"' . get_the_title( $id ) . '"';

	if ( 'publish' !== get_post_status( $id ) ) {
		$problems[] = 'The About page ' . $name . ' is not published, so /about shows the site\'s built-in copy until it is.';
	}

	if ( count( $templated ) > 1 ) {
		$problems[] = count( $templated ) . ' pages have the template "About page". The site shows ' . $name . ' (page ' . $id . '); set the others to another template.';
	}

	if ( ! $templated ) {
		$problems[] = 'The About page ' . $name . ' is recognised by its slug "about" only. Save it once (or choose the template "About page") so that renaming it cannot lose it.';
	}

	$empty = true;
	foreach ( ndm_headless_about_content( $id ) as $value ) {
		if ( ! empty( $value ) ) {
			$empty = false;
			break;
		}
	}
	if ( $empty ) {
		$problems[] = 'The About page ' . $name . ' has no content yet: fill in the boxes under its title.';
	}

	return $problems;
}

/**
 * The Pages screens say when the About page is missing, unpublished, doubled or empty.
 */
function ndm_headless_about_notices() {
	$screen = get_current_screen();

	if ( ! $screen || 'page' !== $screen->post_type || ! in_array( $screen->base, array( 'edit', 'post' ), true ) || ! current_user_can( 'edit_pages' ) ) {
		return;
	}

	// On a page's own edit screen only that page's trouble is shown, on the About page itself.
	if ( 'post' === $screen->base && ndm_headless_about_page_id() && ! ndm_headless_is_about_page( get_post() ) ) {
		return;
	}

	foreach ( ndm_headless_about_problems() as $problem ) {
		echo '<div class="notice notice-warning"><p><strong>About page:</strong> ' . esc_html( $problem ) . '</p></div>';
	}
}
add_action( 'admin_notices', 'ndm_headless_about_notices' );

/*
 * ---------------------------------------------------------------------------------------------
 * Revisions
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The fields are kept with every revision of a page (WordPress copies them into the revision, sees a
 * change of them as a change of the page, and puts them back when a revision is restored).
 *
 * @param string[] $keys      Meta keys kept in revisions.
 * @param string   $post_type Post type.
 * @return string[]
 */
function ndm_headless_about_revision_keys( $keys, $post_type ) {
	if ( 'page' === $post_type ) {
		$keys[] = NDM_ABOUT_META;
	}

	return $keys;
}
add_filter( 'wp_post_revision_meta_keys', 'ndm_headless_about_revision_keys', 10, 2 );

/**
 * The revisions screen of the About page compares the fields too.
 *
 * @param string[] $fields Fields compared, by key.
 * @param array    $post   The page (or a revision of it).
 * @return string[]
 */
function ndm_headless_about_revision_fields( $fields, $post ) {
	$id     = isset( $post['ID'] ) ? (int) $post['ID'] : 0;
	$parent = $id ? wp_is_post_revision( $id ) : 0;

	if ( $id && ndm_headless_is_about_page( $parent ? $parent : $id ) ) {
		$fields['ndm_about'] = 'About page fields';
	}

	return $fields;
}
add_filter( '_wp_post_revision_fields', 'ndm_headless_about_revision_fields', 10, 2 );

/**
 * One value of the fields as lines of text, for the comparison of two revisions.
 *
 * @param array  $field  Field definition.
 * @param mixed  $value  Stored value.
 * @param string $indent Indent of the lines.
 * @return string[]
 */
function ndm_headless_about_revision_lines( $field, $value, $indent = '' ) {
	$label = $indent . $field['label'] . ': ';

	if ( 'repeater' === $field['type'] ) {
		$lines = array();
		foreach ( is_array( $value ) ? array_values( $value ) : array() as $i => $row ) {
			$lines[] = $indent . $field['label'] . ' ' . ( $i + 1 );
			foreach ( $field['fields'] as $sub ) {
				$lines = array_merge( $lines, ndm_headless_about_revision_lines( $sub, isset( $row[ $sub['key'] ] ) ? $row[ $sub['key'] ] : null, $indent . '    ' ) );
			}
		}
		return $lines;
	}

	if ( 'image' === $field['type'] ) {
		$file = $value ? get_attached_file( (int) $value ) : '';
		return array( $label . ( $value ? ( $file ? wp_basename( $file ) : 'photo ' . (int) $value . ' (no longer in the media library)' ) : '' ) );
	}

	return array( $label . ( is_array( $value ) ? implode( ' / ', $value ) : (string) $value ) );
}

/**
 * The fields of a revision (or of the page as it is now) as text.
 *
 * @param string  $value    Unused: a page has no such column.
 * @param string  $field    Field key.
 * @param WP_Post $revision The revision, or the page.
 * @return string
 */
function ndm_headless_about_revision_text( $value, $field, $revision ) {
	if ( ! $revision instanceof WP_Post ) {
		return '';
	}

	$content = ndm_headless_about_content( $revision->ID );
	$lines   = array();

	foreach ( ndm_headless_about_schema() as $group ) {
		$lines[] = '== ' . $group['title'] . ' ==';
		foreach ( $group['fields'] as $one ) {
			$lines = array_merge( $lines, ndm_headless_about_revision_lines( $one, $content[ $one['key'] ] ) );
		}
		$lines[] = '';
	}

	return implode( "\n", $lines );
}
add_filter( '_wp_post_revision_field_ndm_about', 'ndm_headless_about_revision_text', 10, 3 );

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
		'slug'     => $post->post_name,
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
 * GET ndm/v1/about-page: the published About page. 404 when there is no About page or it is not
 * published (the site then shows its built-in copy).
 *
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_about_rest() {
	$post = get_post( ndm_headless_about_page_id() );

	if ( ! $post instanceof WP_Post ) {
		return new WP_Error( 'ndm_about_missing', 'No page has the template "About page" or the slug "about".', array( 'status' => 404 ) );
	}

	// A page behind a password is not public either.
	if ( 'publish' !== $post->post_status || '' !== $post->post_password ) {
		return new WP_Error( 'ndm_about_unpublished', 'The About page is not published.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_about_answer( $post ) );
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
 * A page was saved, trashed, restored or deleted: any of them can be, become or stop being the About page.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_about_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( 'page' === get_post_type( $post_id ) ) {
		ndm_headless_about_changed();
	}
}
add_action( 'save_post', 'ndm_headless_about_post_changed' );
add_action( 'trashed_post', 'ndm_headless_about_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_about_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_about_post_changed' );

/**
 * The page's fields or its template changed (both are post meta), or the description of a photo in
 * the media library.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_about_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( in_array( $meta_key, array( NDM_ABOUT_META, '_wp_page_template', '_wp_attachment_image_alt' ), true ) && ! wp_is_post_revision( $post_id ) ) {
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
 * One-time import and migration
 * ---------------------------------------------------------------------------------------------
 */

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * The posts of the former post type "About Page", the trash included.
	 *
	 * @return WP_Post[]
	 */
	function ndm_headless_about_old_posts() {
		return get_posts(
			array(
				'post_type'        => NDM_ABOUT_OLD_POST_TYPE,
				'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future', 'trash' ),
				'numberposts'      => 20,
				'orderby'          => 'ID',
				'order'            => 'ASC',
				'suppress_filters' => true,
			)
		);
	}

	/**
	 * Creates the standard page that is the About page, with these fields, and stores its first revision
	 * (so the imported version can always be restored).
	 *
	 * @param string $title   Page title.
	 * @param string $status  Post status.
	 * @param array  $content The fields, cleaned on the way in.
	 * @return int|WP_Error Page ID.
	 */
	function ndm_headless_about_create_page( $title, $status, $content ) {
		$id = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => $status,
				'post_name'   => NDM_ABOUT_SLUG,
				'post_title'  => wp_slash( $title ),
			),
			true
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		update_post_meta( $id, '_wp_page_template', NDM_ABOUT_TEMPLATE );
		update_post_meta( $id, NDM_ABOUT_META, wp_slash( ndm_headless_about_clean_all( $content ) ) );
		wp_save_post_revision( $id );

		return (int) $id;
	}

	/**
	 * Creates the About page (a standard page with the template "About page") from JSON on standard input:
	 *
	 *   { "title": "About us",
	 *     "content": { ...the fields of the edit screen; a photo is a file path under the import folder or
	 *                  an https address (or { "file", "alt" })... } }
	 *
	 * When an About page already exists, or a page with the slug "about" (in any state, the trash
	 * included), nothing is created, so running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * [--fill-empty]
	 * : When the About page already exists (an empty page saved before the import, for example), fill
	 *   in only its fields that are empty, and give it the template "About page" when it has none. A
	 *   field that holds anything is never replaced; the page's title and state are left as they are.
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

			if ( ndm_headless_about_old_posts() ) {
				WP_CLI::error( 'This WordPress still holds the About page in its former post type: run "wp ndm about-migrate" instead.' );
			}

			$existing = ndm_headless_about_page_id();
			if ( ! $existing ) {
				// A trashed page keeps its slug as "about__trashed".
				foreach ( array( NDM_ABOUT_SLUG, NDM_ABOUT_SLUG . '__trashed' ) as $name ) {
					$found    = $existing ? array() : get_posts(
						array(
							'post_type'   => 'page',
							'name'        => $name,
							'post_status' => 'any, trash',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
					$existing = $found ? (int) $found[0] : $existing;
				}
			}
			$fill = ! empty( $assoc_args['fill-empty'] );
			if ( $existing && ! $fill ) {
				WP_CLI::log( "Kept: the About page (page {$existing}) already exists." );
				return;
			}
			if ( $existing && 'trash' === get_post_status( $existing ) ) {
				WP_CLI::error( "The About page (page {$existing}) is in the trash: restore it first." );
			}

			$content = $page['content'];
			$stored  = $existing ? ndm_headless_about_content( $existing ) : null;
			if ( null !== $stored ) {
				// Only the fields that are empty on the page, and only from imported fields that hold something.
				$content = array_filter(
					array_intersect_key( $content, array_filter( $stored, 'ndm_headless_import_is_empty' ) ),
					function ( $value ) {
						return ! ndm_headless_import_is_empty( $value );
					}
				);
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			foreach ( ndm_headless_about_schema() as $group ) {
				// The photo import of the Aptos pages: a file of the import folder, or an https address.
				$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
			}

			if ( null !== $stored ) {
				$filled = array_keys( $content );
				if ( NDM_ABOUT_TEMPLATE !== get_post_meta( $existing, '_wp_page_template', true ) ) {
					update_post_meta( $existing, '_wp_page_template', NDM_ABOUT_TEMPLATE );
					$filled[] = 'template';
				}
				if ( ! $filled ) {
					WP_CLI::success( "Nothing to fill: every field of the About page (page {$existing}) already holds something." );
					return;
				}
				update_post_meta( $existing, NDM_ABOUT_META, wp_slash( ndm_headless_about_clean_all( array_merge( $stored, $content ) ) ) );
				wp_save_post_revision( $existing );
				WP_CLI::success( sprintf( 'Filled the About page (page %d): %d empty fields%s.', $existing, count( $content ), in_array( 'template', $filled, true ) ? ' and its template' : '' ) );
				return;
			}

			$id = ndm_headless_about_create_page( isset( $page['title'] ) && '' !== trim( (string) $page['title'] ) ? trim( (string) $page['title'] ) : 'About us', 'publish', $content );
			if ( is_wp_error( $id ) ) {
				WP_CLI::error( 'About page: ' . $id->get_error_message() );
			}

			WP_CLI::success( "Created: the About page (page {$id})." );
		}
	);

	/**
	 * Moves the About page from its former post type ("About Page", `ndm_about`) onto a standard page
	 * with the template "About page": same title, same state, same fields, same photos of the media
	 * library (nothing is uploaded again).
	 *
	 * Safe to run again: a page that already holds the same fields is left as it is, and a page that
	 * holds different fields is never overwritten. The former post is deleted only with --delete-old,
	 * and only when the page holds exactly its fields.
	 *
	 * ## OPTIONS
	 *
	 * [--delete-old]
	 * : After checking that the page holds the same fields, delete the former post for good.
	 *
	 * ## EXAMPLES
	 *
	 *     docker compose run --rm -T cli wp ndm about-migrate
	 *     docker compose run --rm -T cli wp ndm about-migrate --delete-old
	 */
	WP_CLI::add_command(
		'ndm about-migrate',
		function ( $args, $assoc_args ) {
			$old = ndm_headless_about_old_posts();
			if ( ! $old ) {
				WP_CLI::success( 'Nothing to migrate: no post of the former post type "About Page" is left.' );
				return;
			}
			if ( count( $old ) > 1 ) {
				WP_CLI::error( 'More than one post of the former post type "About Page" exists (' . implode( ', ', wp_list_pluck( $old, 'ID' ) ) . '): delete the ones that are not the page, then run this again.' );
			}

			$old    = $old[0];
			$fields = ndm_headless_about_clean_all( get_post_meta( $old->ID, NDM_ABOUT_META, true ) );
			$page   = ndm_headless_about_page_id();

			if ( $page ) {
				$now   = ndm_headless_about_content( $page );
				$empty = ! array_filter( $now );

				if ( $empty ) {
					update_post_meta( $page, NDM_ABOUT_META, wp_slash( $fields ) );
					update_post_meta( $page, '_wp_page_template', NDM_ABOUT_TEMPLATE );
					wp_save_post_revision( $page );
					WP_CLI::log( "Filled: page {$page} had no fields; it now holds those of the former post {$old->ID}." );
				} elseif ( $now !== $fields ) {
					WP_CLI::error( "Page {$page} is already the About page and holds different fields than the former post {$old->ID}. Nothing was changed: decide which one is right before going on." );
				} else {
					WP_CLI::log( "Kept: page {$page} already holds the fields of the former post {$old->ID}." );
				}
			} else {
				foreach ( array( NDM_ABOUT_SLUG, NDM_ABOUT_SLUG . '__trashed' ) as $name ) {
					$taken = get_posts(
						array(
							'post_type'   => 'page',
							'name'        => $name,
							'post_status' => 'trash',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
					if ( $taken ) {
						WP_CLI::error( "A page with the slug \"about\" is in the trash (page {$taken[0]}): restore or delete it first." );
					}
				}

				$page = ndm_headless_about_create_page( html_entity_decode( $old->post_title, ENT_QUOTES, 'UTF-8' ), 'trash' === $old->post_status ? 'draft' : $old->post_status, $fields );
				if ( is_wp_error( $page ) ) {
					WP_CLI::error( 'About page: ' . $page->get_error_message() );
				}
				WP_CLI::log( "Created: page {$page} from the former post {$old->ID}." );
			}

			// The check: the page holds exactly the former post's fields, and every photo is still in the media library.
			$stored = ndm_headless_about_content( $page );
			if ( $stored !== $fields ) {
				WP_CLI::error( "Page {$page} does not hold the same fields as the former post {$old->ID}. The former post was left untouched." );
			}
			$photos = 0;
			foreach ( $stored['photos'] as $row ) {
				if ( ! wp_attachment_is_image( $row['image'] ) ) {
					WP_CLI::error( "Photo {$row['image']} of the gallery is not in the media library. The former post was left untouched." );
				}
				++$photos;
			}
			WP_CLI::log( "Checked: page {$page} holds the same fields as the former post ({$photos} gallery photos, " . count( $stored['faqs'] ) . ' questions, ' . count( $stored['stats'] ) . ' numbers).' );

			if ( empty( $assoc_args['delete-old'] ) ) {
				WP_CLI::success( "Migrated. The former post {$old->ID} is still there; run again with --delete-old once the site has been checked." );
				return;
			}

			if ( ! wp_delete_post( $old->ID, true ) ) {
				WP_CLI::error( "The former post {$old->ID} could not be deleted." );
			}
			WP_CLI::success( "Migrated, and the former post {$old->ID} was deleted. The About page is page {$page}." );
		}
	);
}

<?php
/**
 * The procedure pages of the Next.js site (for example /botox).
 *
 * - Post type "Procedures" (`ndm_procedure`): one post is one procedure page, in the design of the
 *   Botox page. Its title is the procedure's name, its slug is the page's address on the site, its
 *   featured image is the wide header photo.
 * - Everything else the page shows that belongs to this procedure only is typed into the boxes under
 *   the title (one post meta, `_ndm_procedure`). The fields are listed once, in
 *   ndm_headless_procedure_schema(); the edit screen, the saving, the REST answer and the import all
 *   read that list. The fields themselves (their look, cleaning and search boxes) are the ones of the
 *   Concerns post type (includes/concerns.php).
 * - The price list is never typed: the editor searches the WooCommerce products and picks the ones
 *   the section shows; their options, prices and offers are read from WooCommerce by the site. An
 *   amount inside the copy is written as a token ({{price}}), filled in from those same products.
 * - What every procedure page shares (the clinic film, Why NewDermaMed, Our team, Testimonials, Visit
 *   us, Start your journey, the section bar, the booking form) lives in the site's code.
 * - `GET ndm/v1/procedures` lists the published procedures; `GET ndm/v1/procedures/<slug>` gives one.
 * - When a procedure changes, the Next.js site is told to drop its cached copy (tag `procedures`).
 * - `wp ndm procedures-import` creates procedures once, from the site's original content.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_PROCEDURE_POST_TYPE', 'ndm_procedure' );
define( 'NDM_PROCEDURE_META', '_ndm_procedure' );

/**
 * Registers the post type.
 */
function ndm_headless_procedure_register() {
	register_post_type(
		NDM_PROCEDURE_POST_TYPE,
		array(
			'labels'              => array(
				'name'                  => 'Procedures',
				'singular_name'         => 'Procedure',
				'menu_name'             => 'Procedures',
				'all_items'             => 'All procedures',
				'add_new'               => 'Add procedure',
				'add_new_item'          => 'Add a procedure',
				'edit_item'             => 'Edit procedure',
				'new_item'              => 'New procedure',
				'view_item'             => 'View procedure',
				'search_items'          => 'Search procedures',
				'not_found'             => 'No procedures found.',
				'not_found_in_trash'    => 'No procedures in the trash.',
				'featured_image'        => 'Header photo (wide)',
				'set_featured_image'    => 'Set the header photo',
				'remove_featured_image' => 'Remove the header photo',
				'use_featured_image'    => 'Use as the header photo',
			),
			'description'         => 'Procedure pages of the site: one design, each post carries its own content.',
			// The page itself is the Next.js site's: WordPress shows no page of its own.
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_rest'        => true,
			'rest_base'           => 'procedure-posts',
			'menu_position'       => 21,
			'menu_icon'           => 'dashicons-star-filled',
			'hierarchical'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			// No block editor: the content is the fields below the title.
			'supports'            => array( 'title', 'thumbnail' ),
		)
	);
}
add_action( 'init', 'ndm_headless_procedure_register' );

/**
 * The header photo is the featured image: makes sure the active theme (which never renders) allows one.
 */
function ndm_headless_procedure_thumbnails() {
	$support = get_theme_support( 'post-thumbnails' );

	if ( true === $support ) {
		return;
	}

	$types = is_array( $support ) && isset( $support[0] ) && is_array( $support[0] ) ? $support[0] : array();
	add_theme_support( 'post-thumbnails', array_values( array_unique( array_merge( $types, array( NDM_PROCEDURE_POST_TYPE ) ) ) ) );
}
add_action( 'after_setup_theme', 'ndm_headless_procedure_thumbnails', 101 );

/**
 * The edit screen uses the fields of the Concerns post type: their styles and script load here too.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_procedure_field_types( $types ) {
	$types[] = NDM_PROCEDURE_POST_TYPE;

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_procedure_field_types' );

/**
 * Every field of a procedure, grouped as the boxes of the edit screen, in page order.
 *
 * Field types are those of ndm_headless_concern_schema(). There is no price field, on purpose: every
 * price the site shows is a WooCommerce price.
 *
 * @return array[]
 */
function ndm_headless_procedure_schema() {
	$heading_1 = array( 'label' => 'Heading, first line', 'type' => 'text' );
	$heading_2 = array( 'label' => 'Heading, second line (blue)', 'type' => 'text' );
	$tokens    = 'Never type an amount. Write {{price}} for the price of the first product of the Price List box (one unit when it is priced per unit, else its lowest price), {{price2}} for the second product, {{pricex20}} for 20 units of the first, {{off}} for the offers on the first ("10% to 30%") and {{maxoff}} for the largest ("30%"). A sentence whose amount is not in WooCommerce is left out.';

	return array(
		array(
			'id'     => 'header',
			'title'  => 'Header',
			'help'   => 'The procedure\'s name is the post title; the wide header photo is the "Header photo" box at the side. The clinics line and the booking form are filled in by the site.',
			'fields' => array(
				array( 'key' => 'heading_1', 'help' => 'For example "Botox®". Empty: the title.' ) + $heading_1,
				array( 'key' => 'heading_2', 'help' => 'For example "in Toronto".' ) + $heading_2,
				array( 'key' => 'intro', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array( 'key' => 'hero_mobile', 'label' => 'Header photo for phones (tall)', 'type' => 'image' ),
				array( 'key' => 'hero_position', 'label' => 'Photo focus', 'type' => 'text', 'help' => 'Which part of the photo stays in view, for example "50% 30%". Empty: the middle.' ),
				array( 'key' => 'group', 'label' => 'Menu group', 'type' => 'text', 'help' => 'The step before the name in the breadcrumb, for example "Injectables".' ),
				array(
					'key'    => 'facts',
					'label'  => 'Quick facts (the card over the header photo)',
					'type'   => 'repeater',
					'add'    => 'Add a fact',
					'title'  => 'label',
					'fields' => array(
						array( 'key' => 'label', 'label' => 'Label', 'type' => 'text', 'help' => 'For example "Duration".' ),
						array( 'key' => 'value', 'label' => 'Value', 'type' => 'text', 'help' => 'For example "30 minutes".' ),
					),
				),
				array( 'key' => 'offer_title', 'label' => 'Offer card, title', 'type' => 'text', 'help' => 'For example "Botox® Cosmetic packages". The card shows "Up to N% off" from the first product of the Price List box, only while WooCommerce has an offer on it. Empty: no card.' ),
			),
		),
		array(
			'id'     => 'seo',
			'title'  => 'Search Engines',
			'help'   => $tokens,
			'fields' => array(
				array( 'key' => 'seo_title', 'label' => 'Page title', 'type' => 'text', 'help' => 'Empty (or its price is not known): "<name> Toronto, Free Consultation | NewDermaMed".' ),
				array( 'key' => 'seo_description', 'label' => 'Description', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'benefits',
			'title'  => 'Benefits',
			'fields' => array(
				array( 'key' => 'benefits_lead' ) + $heading_1,
				array( 'key' => 'benefits_strong' ) + $heading_2,
				array( 'key' => 'benefits_text', 'label' => 'Paragraphs', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 6 ),
				array( 'key' => 'benefits_chips', 'label' => 'Short labels under the text', 'type' => 'lines', 'help' => 'One per line, for example the areas treated.', 'rows' => 4 ),
				array( 'key' => 'benefits_note', 'label' => 'Note (safety line)', 'type' => 'textarea' ),
				array( 'key' => 'benefits_image', 'label' => 'Picture', 'type' => 'image' ),
				array( 'key' => 'benefits_diagram', 'label' => 'The picture is a diagram: show all of it instead of filling the frame', 'type' => 'checkbox' ),
			),
		),
		array(
			'id'     => 'about',
			'title'  => 'About (Tabs)',
			'help'   => $tokens,
			'fields' => array(
				array( 'key' => 'about_lead' ) + $heading_1,
				array( 'key' => 'about_strong' ) + $heading_2,
				array(
					'key'    => 'tabs',
					'label'  => 'Tabs',
					'type'   => 'repeater',
					'add'    => 'Add a tab',
					'title'  => 'label',
					'fields' => array(
						array( 'key' => 'label', 'label' => 'Tab name', 'type' => 'text' ),
						array( 'key' => 'figure', 'label' => 'Large figure', 'type' => 'text', 'help' => 'For example "20+" or {{price}}.' ),
						array( 'key' => 'figure_label', 'label' => 'Words under the figure', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Paragraphs', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 5 ),
						array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'For example "#prices". Empty: no link.' ),
						array( 'key' => 'link_label', 'label' => 'Link words', 'type' => 'text' ),
					),
				),
			),
		),
		array(
			'id'     => 'choose',
			'title'  => 'Why Choose',
			'fields' => array(
				array( 'key' => 'choose_lead', 'help' => 'Empty: "Why choose".' ) + $heading_1,
				array( 'key' => 'choose_strong', 'help' => 'Empty: "<name>?".' ) + $heading_2,
				array( 'key' => 'choose_image', 'label' => 'Photo', 'type' => 'image' ),
				array(
					'key'    => 'cards',
					'label'  => 'Cards',
					'type'   => 'repeater',
					'add'    => 'Add a card',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'watch',
			'title'  => 'Watch (Short Video)',
			'help'   => 'Empty video address: the section is left out.',
			'fields' => array(
				array( 'key' => 'reel_video', 'label' => 'Video address', 'type' => 'text', 'help' => 'The full address of an MP4 file.' ),
				array( 'key' => 'reel_poster', 'label' => 'Picture shown before the video plays', 'type' => 'image' ),
				array( 'key' => 'reel_text', 'label' => 'Text', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'results',
			'title'  => 'Before And After Photos',
			'help'   => 'Cases of the "Before & After" post type shown as photos, in this order: each takes the case\'s photo and its first category. Nothing is typed here; add or change a case under Before & After. "Individual results may vary" is added by the site. Empty: the section is left out.',
			'fields' => array(
				array( 'key' => 'cases', 'label' => 'Cases', 'type' => 'posts', 'post_type' => NDM_BA_POST_TYPE, 'rest' => 'before-after-cases', 'noun' => 'cases' ),
			),
		),
		array(
			'id'     => 'prices',
			'title'  => 'Price List',
			'help'   => 'One row per product, in the order shown: add a row, then search the WooCommerce price list and pick the product. The section shows that product\'s options with their prices and offers, each with Add to cart. Nothing here is a price: prices are changed in the price manager only. A whole category shows every product of it. Empty: the section is left out.',
			'fields' => array(
				array( 'key' => 'prices_lead', 'help' => 'Empty: "How much does <name>".' ) + $heading_1,
				array( 'key' => 'prices_strong', 'help' => 'Empty: "cost in Toronto?".' ) + $heading_2,
				array(
					'key'    => 'price_list',
					'label'  => 'Products',
					'type'   => 'repeater',
					'add'    => 'Add a product',
					'title'  => 'name',
					'fields' => array(
						array( 'key' => 'price_source', 'label' => 'Product (WooCommerce)', 'type' => 'product', 'help' => 'Search the price list and pick the product (or a whole category).' ),
						array( 'key' => 'name', 'label' => 'Title', 'type' => 'text', 'help' => 'Empty: the product\'s name.' ),
						array( 'key' => 'blurb', 'label' => 'Text under the title', 'type' => 'textarea', 'help' => 'Empty: the product\'s short description.' ),
					),
				),
			),
		),
		array(
			'id'     => 'guide',
			'title'  => 'Good To Know',
			'help'   => $tokens . ' The "Page updated" date is the day this procedure was last saved.',
			'fields' => array(
				array( 'key' => 'guide_lead' ) + $heading_1,
				array( 'key' => 'guide_strong' ) + $heading_2,
				array( 'key' => 'guide_intro', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array(
					'key'    => 'guide',
					'label'  => 'Questions',
					'type'   => 'repeater',
					'add'    => 'Add a question',
					'title'  => 'q',
					'fields' => array(
						array( 'key' => 'q', 'label' => 'Question', 'type' => 'text' ),
						array( 'key' => 'a', 'label' => 'Answer', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 4 ),
						array( 'key' => 'list', 'label' => 'Points under the answer', 'type' => 'lines', 'help' => 'One per line. Empty: no list.', 'rows' => 4 ),
					),
				),
				array(
					'key'    => 'related',
					'label'  => 'Related treatments',
					'type'   => 'repeater',
					'add'    => 'Add a treatment',
					'title'  => 'name',
					'fields' => array(
						array( 'key' => 'name', 'label' => 'Treatment', 'type' => 'text', 'help' => 'As in the site\'s menu: the card links to that page.' ),
						array( 'key' => 'kind', 'label' => 'Tag', 'type' => 'text', 'help' => 'For example "Laser" or "Injectable".' ),
						array( 'key' => 'image', 'label' => 'Photo', 'type' => 'image' ),
					),
				),
			),
		),
		array(
			'id'     => 'faqs',
			'title'  => 'FAQ',
			'fields' => array(
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
	);
}

/**
 * Cleans a whole procedure: every field of the schema, nothing else.
 *
 * @param mixed $input Raw values by field key.
 * @return array
 */
function ndm_headless_procedure_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_procedure_schema() as $group ) {
		foreach ( $group['fields'] as $field ) {
			$clean[ $field['key'] ] = ndm_headless_concern_clean( $field, isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null );
		}
	}

	return $clean;
}

/**
 * The stored content of a procedure, complete (missing fields come back empty).
 *
 * @param int $post_id Post ID.
 * @return array
 */
function ndm_headless_procedure_content( $post_id ) {
	return ndm_headless_procedure_clean_all( get_post_meta( $post_id, NDM_PROCEDURE_META, true ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * The edit screen
 * ---------------------------------------------------------------------------------------------
 */

/**
 * One box per group of fields, under the title.
 */
function ndm_headless_procedure_meta_boxes() {
	$stored = null;

	foreach ( ndm_headless_procedure_schema() as $group ) {
		add_meta_box(
			'ndm-procedure-' . $group['id'],
			$group['title'],
			function ( $post ) use ( $group, &$stored ) {
				if ( null === $stored ) {
					$stored = ndm_headless_procedure_content( $post->ID );
					wp_nonce_field( 'ndm_procedure_save', 'ndm_procedure_nonce' );
				}

				if ( ! empty( $group['help'] ) ) {
					echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
				}

				foreach ( $group['fields'] as $field ) {
					ndm_headless_concern_field( $field, 'ndm_procedure[' . $field['key'] . ']', $stored[ $field['key'] ] );
				}
			},
			NDM_PROCEDURE_POST_TYPE,
			'normal',
			'default'
		);
	}
}
add_action( 'add_meta_boxes_' . NDM_PROCEDURE_POST_TYPE, 'ndm_headless_procedure_meta_boxes' );

/**
 * The "Slug" box (the page's address on the site) is shown without a visit to Screen Options.
 *
 * @param string[]  $hidden Boxes hidden by default.
 * @param WP_Screen $screen Current screen.
 * @return string[]
 */
function ndm_headless_procedure_show_slug( $hidden, $screen ) {
	return NDM_PROCEDURE_POST_TYPE === $screen->post_type ? array_values( array_diff( $hidden, array( 'slugdiv' ) ) ) : $hidden;
}
add_filter( 'default_hidden_meta_boxes', 'ndm_headless_procedure_show_slug', 10, 2 );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The procedure.
 */
function ndm_headless_procedure_intro( $post ) {
	if ( NDM_PROCEDURE_POST_TYPE !== $post->post_type ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );
	$slug = $post->post_name;

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $slug && '' !== $site ) {
		$url = $site . '/' . $slug;
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shown once published)' ) . '</p>';
	} else {
		echo '<p><strong>Page on the site:</strong> its address is the "Slug" below, made from the title when the procedure is first saved.</p>';
	}
	echo '<p>Filled in by the site on every procedure page, not typed here: every price and offer (from the products picked in the Price List box), the section bar, the booking form, the clinic film, Why NewDermaMed, Our team, Testimonials, Visit us and Start your journey. A section whose box is left empty is left out of the page.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_procedure_intro' );

/**
 * Saves the fields of the edit screen.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_procedure_save( $post_id ) {
	if ( ! isset( $_POST['ndm_procedure_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_procedure_nonce'] ) ), 'ndm_procedure_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_procedure_clean_all().
	$input = isset( $_POST['ndm_procedure'] ) ? wp_unslash( $_POST['ndm_procedure'] ) : array();

	update_post_meta( $post_id, NDM_PROCEDURE_META, wp_slash( ndm_headless_procedure_clean_all( $input ) ) );
}
add_action( 'save_post_' . NDM_PROCEDURE_POST_TYPE, 'ndm_headless_procedure_save' );

/**
 * The list of procedures shows each page's address.
 *
 * @param string[] $columns Columns.
 * @return string[]
 */
function ndm_headless_procedure_columns( $columns ) {
	$out = array();

	foreach ( $columns as $key => $label ) {
		$out[ $key ] = $label;
		if ( 'title' === $key ) {
			$out['ndm_address'] = 'Address on the site';
		}
	}

	return $out;
}
add_filter( 'manage_' . NDM_PROCEDURE_POST_TYPE . '_posts_columns', 'ndm_headless_procedure_columns' );

/**
 * Prints the address column.
 *
 * @param string $column  Column.
 * @param int    $post_id Post ID.
 */
function ndm_headless_procedure_column( $column, $post_id ) {
	if ( 'ndm_address' === $column ) {
		echo esc_html( '/' . get_post_field( 'post_name', $post_id ) );
	}
}
add_action( 'manage_' . NDM_PROCEDURE_POST_TYPE . '_posts_custom_column', 'ndm_headless_procedure_column', 10, 2 );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * A procedure as the site receives it. A row of the price list carries which product was picked
 * (`price_source`) and that product's own name and short description (`product`); the options, prices
 * and offers are not here: the site reads them from the WooCommerce price list.
 *
 * @param WP_Post $post The procedure.
 * @return array
 */
function ndm_headless_procedure_answer( $post ) {
	$content = ndm_headless_procedure_content( $post->ID );

	foreach ( ndm_headless_procedure_schema() as $group ) {
		$content = ndm_headless_concern_expand( $group['fields'], $content );
	}

	return array(
		'id'       => $post->ID,
		'slug'     => $post->post_name,
		'title'    => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'modified' => mysql_to_rfc3339( $post->post_modified_gmt ),
		// The day of the last save, as the page shows it ("Page updated").
		'updated'  => array( get_post_modified_time( 'Y-m-d', false, $post ), get_post_modified_time( 'F j, Y', false, $post ) ),
		'hero'     => ndm_headless_concern_image( (int) get_post_thumbnail_id( $post ) ),
		'content'  => $content,
	);
}

/**
 * Registers the routes.
 */
function ndm_headless_procedure_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/procedures',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_procedure_rest_list',
			// Public on purpose: it holds only what the public pages show.
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/procedures/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_procedure_rest_one',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_procedure_routes' );

/**
 * GET ndm/v1/procedures: every published procedure's name and address, by name.
 *
 * @return WP_REST_Response
 */
function ndm_headless_procedure_rest_list() {
	$posts = get_posts(
		array(
			'post_type'   => NDM_PROCEDURE_POST_TYPE,
			'post_status' => 'publish',
			'numberposts' => 500,
			'orderby'     => 'title',
			'order'       => 'ASC',
		)
	);

	$list = array();
	foreach ( $posts as $post ) {
		$list[] = array(
			'slug'  => $post->post_name,
			'title' => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		);
	}

	return rest_ensure_response( $list );
}

/**
 * GET ndm/v1/procedures/<slug>: one published procedure.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_procedure_rest_one( $request ) {
	$posts = get_posts(
		array(
			'post_type'   => NDM_PROCEDURE_POST_TYPE,
			'post_status' => 'publish',
			'name'        => (string) $request['slug'],
			'numberposts' => 1,
		)
	);

	if ( ! $posts ) {
		return new WP_Error( 'ndm_procedure_not_found', 'No published procedure has this address.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_procedure_answer( $posts[0] ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "procedures changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_procedure_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_procedure_notify_frontend' );
}

/**
 * A procedure was saved, trashed, restored or deleted; or something a procedure page shows was.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_procedure_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	// A Before & After case may be a photo of a procedure page; a product gives its price list a title and a text.
	if ( in_array( get_post_type( $post_id ), array( NDM_PROCEDURE_POST_TYPE, NDM_BA_POST_TYPE, 'product' ), true ) ) {
		ndm_headless_procedure_changed();
	}
}
add_action( 'save_post', 'ndm_headless_procedure_post_changed' );
add_action( 'trashed_post', 'ndm_headless_procedure_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_procedure_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_procedure_post_changed' );

/**
 * A procedure's content or header photo changed (both are post meta), or a case's photo.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_procedure_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( ! in_array( $meta_key, array( '_thumbnail_id', NDM_PROCEDURE_META ), true ) ) {
		return;
	}

	$type = get_post_type( $post_id );
	if ( NDM_PROCEDURE_POST_TYPE === $type || ( '_thumbnail_id' === $meta_key && NDM_BA_POST_TYPE === $type ) ) {
		ndm_headless_procedure_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_procedure_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_procedure_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_procedure_meta_changed', 10, 3 );

/**
 * A case's categories were changed: its photo on a procedure page shows the first one.
 *
 * @param int    $object_id Post ID.
 * @param array  $terms     Terms.
 * @param array  $tt_ids    Term taxonomy IDs.
 * @param string $taxonomy  Taxonomy.
 */
function ndm_headless_procedure_terms_set( $object_id, $terms, $tt_ids, $taxonomy ) {
	if ( NDM_BA_TAXONOMY === $taxonomy ) {
		ndm_headless_procedure_changed();
	}
}
add_action( 'set_object_terms', 'ndm_headless_procedure_terms_set', 10, 4 );

/**
 * Asks the Next.js server to clear its cached procedures. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_procedure_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'procedures' ) ),
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
	 * Imports the photos named in a list of fields. Where the edit screen holds a photo the import
	 * gives a file path, or { "file": path, "alt": alternative text }.
	 *
	 * @param array[] $fields Field definitions.
	 * @param array   $values Values by key.
	 * @param string  $dir    Folder the paths are relative to.
	 * @return array
	 */
	function ndm_headless_procedure_import_images( $fields, $values, $dir ) {
		foreach ( $fields as $field ) {
			$key = $field['key'];

			if ( 'image' === $field['type'] && ! empty( $values[ $key ] ) ) {
				$photo = is_array( $values[ $key ] ) ? $values[ $key ] : array( 'file' => $values[ $key ] );
				$values[ $key ] = isset( $photo['file'] ) && is_string( $photo['file'] ) ? ndm_headless_concern_import_image( $dir, $photo['file'], isset( $photo['alt'] ) ? (string) $photo['alt'] : '' ) : 0;
			} elseif ( 'repeater' === $field['type'] && ! empty( $values[ $key ] ) && is_array( $values[ $key ] ) ) {
				foreach ( $values[ $key ] as $i => $row ) {
					if ( is_array( $row ) ) {
						$values[ $key ][ $i ] = ndm_headless_procedure_import_images( $field['fields'], $row, $dir );
					}
				}
			}
		}

		return $values;
	}

	/**
	 * Creates procedures from JSON on standard input:
	 *
	 *   [ { "slug": "botox", "title": "Botox®", "date": "2026-11-10",
	 *       "hero": "assets/botox/hero.jpg", "heroAlt": "...",
	 *       "content": { ...the fields of the edit screen; a photo is a file path (or { "file", "alt" });
	 *                    a row of "price_list" names its WooCommerce product ("product": "Botox Cosmetic"),
	 *                    which must exist; "cases" is a list of titles of existing Before & After cases... } } ]
	 *
	 * A procedure whose slug already exists (in any state, the trash included) is left exactly as it
	 * is, so running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-procedures.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm procedures-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm procedures-import',
		function ( $args, $assoc_args ) {
			$procedures = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $procedures ) || ! $procedures ) {
				WP_CLI::error( 'Expected a JSON list of procedures on standard input.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			foreach ( $procedures as $procedure ) {
				$slug  = isset( $procedure['slug'] ) ? sanitize_title( (string) $procedure['slug'] ) : '';
				$title = isset( $procedure['title'] ) ? trim( (string) $procedure['title'] ) : '';

				if ( '' === $slug || '' === $title || empty( $procedure['content'] ) || ! is_array( $procedure['content'] ) ) {
					WP_CLI::warning( 'Skipped a procedure without a slug, a title or content.' );
					continue;
				}

				$existing = array();
				// A trashed post's slug is "<slug>__trashed".
				foreach ( array( $slug, $slug . '__trashed' ) as $name ) {
					$existing = $existing ? $existing : get_posts(
						array(
							'post_type'   => NDM_PROCEDURE_POST_TYPE,
							'name'        => $name,
							'post_status' => 'any, trash',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
				}
				if ( $existing ) {
					WP_CLI::log( "Kept: procedure {$existing[0]} ({$slug}) already exists." );
					continue;
				}

				$content = $procedure['content'];

				// "price_list": each row names a product of the price list; it is picked, never created, and no price is read here.
				$rows = array();
				foreach ( isset( $content['price_list'] ) && is_array( $content['price_list'] ) ? $content['price_list'] : array() as $row ) {
					$name  = isset( $row['product'] ) ? (string) $row['product'] : '';
					$found = '' === $name ? array() : get_posts(
						array(
							'post_type'   => 'product',
							'title'       => $name,
							'post_status' => 'publish',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
					if ( ! $found ) {
						WP_CLI::warning( "Product \"{$name}\" not found in WooCommerce: its row of the price list was left out." );
						continue;
					}
					unset( $row['product'] );
					$row['price_source'] = 'product:' . (int) $found[0];
					$rows[]              = $row;
				}
				$content['price_list'] = $rows;

				// "cases": titles of Before & After cases that already exist; each is chosen, none is created.
				$cases = array();
				foreach ( isset( $content['cases'] ) && is_array( $content['cases'] ) ? $content['cases'] : array() as $case_title ) {
					$found = get_posts(
						array(
							'post_type'   => NDM_BA_POST_TYPE,
							'title'       => (string) $case_title,
							'post_status' => 'publish',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
					if ( $found ) {
						$cases[] = (int) $found[0];
					} else {
						WP_CLI::warning( "Before & After case \"{$case_title}\" not found: import the gallery first (wp ndm before-after-import)." );
					}
				}
				$content['cases'] = $cases;

				foreach ( ndm_headless_procedure_schema() as $group ) {
					$content = ndm_headless_procedure_import_images( $group['fields'], $content, $dir );
				}

				// The day the content was last updated: a new post's "last saved" day is its date.
				$date = ! empty( $procedure['date'] ) ? gmdate( 'Y-m-d 09:00:00', (int) strtotime( (string) $procedure['date'] ) ) : '';
				$id   = wp_insert_post(
					array(
						'post_type'     => NDM_PROCEDURE_POST_TYPE,
						'post_status'   => 'publish',
						'post_name'     => $slug,
						'post_title'    => wp_slash( $title ),
						'post_date'     => $date,
						'post_date_gmt' => $date ? get_gmt_from_date( $date ) : '',
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( "Procedure {$slug}: " . $id->get_error_message() );
					continue;
				}

				update_post_meta( $id, NDM_PROCEDURE_META, wp_slash( ndm_headless_procedure_clean_all( $content ) ) );

				if ( ! empty( $procedure['hero'] ) ) {
					$hero = ndm_headless_concern_import_image( $dir, (string) $procedure['hero'], isset( $procedure['heroAlt'] ) ? (string) $procedure['heroAlt'] : '' );
					if ( $hero ) {
						set_post_thumbnail( $id, $hero );
					}
				}

				WP_CLI::success( "Created: procedure {$id} ({$slug})." );
			}
		}
	);
}

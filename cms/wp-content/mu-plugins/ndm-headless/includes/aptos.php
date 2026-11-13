<?php
/**
 * The pages of the Next.js site in the Aptos Thread Lift design (for example /aptos-thread-lift).
 *
 * - Post type "Aptos Pages" (`ndm_aptos`): a template of its own, separate from "Procedures" (the
 *   Botox design). One post is one page: its title is the treatment's name, its slug is the page's
 *   address on the site, its featured image is the wide header photo.
 * - Every section of the page has a box under the title (one post meta, `_ndm_aptos`). The fields are
 *   listed once, in ndm_headless_aptos_schema(); the edit screen, the saving, the REST answer and the
 *   import all read that list. The fields themselves (their look, cleaning and search boxes) are the
 *   ones of the Concerns post type (includes/concerns.php).
 * - The price list is never typed: the editor searches the WooCommerce products and picks one or more;
 *   their options, prices and offers are read from WooCommerce by the site. An amount inside the copy
 *   is written as a token ({{price}}), filled in from those same products.
 * - Before and after photos are cases of the "Before & After" post type, searched and picked.
 * - What the page shares with the rest of the site (Our team, Testimonials, Visit us, Start your
 *   journey, the booking form) lives in the site's code.
 * - `GET ndm/v1/aptos-pages` lists the published pages; `GET ndm/v1/aptos-pages/<slug>` gives one.
 * - When a page changes, the Next.js site is told to drop its cached copy (tag `aptos`).
 * - `wp ndm aptos-import` creates the page once, from the site's original content.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_APTOS_POST_TYPE', 'ndm_aptos' );
define( 'NDM_APTOS_META', '_ndm_aptos' );

/**
 * Registers the post type.
 */
function ndm_headless_aptos_register() {
	register_post_type(
		NDM_APTOS_POST_TYPE,
		array(
			'labels'              => array(
				'name'                  => 'Aptos Pages',
				'singular_name'         => 'Aptos Page',
				'menu_name'             => 'Aptos Pages',
				'all_items'             => 'All Aptos pages',
				'add_new'               => 'Add page',
				'add_new_item'          => 'Add a page in the Aptos design',
				'edit_item'             => 'Edit Aptos page',
				'new_item'              => 'New Aptos page',
				'view_item'             => 'View page',
				'search_items'          => 'Search Aptos pages',
				'not_found'             => 'No pages found.',
				'not_found_in_trash'    => 'No pages in the trash.',
				'featured_image'        => 'Header photo (wide)',
				'set_featured_image'    => 'Set the header photo',
				'remove_featured_image' => 'Remove the header photo',
				'use_featured_image'    => 'Use as the header photo',
			),
			'description'         => 'Pages of the site in the Aptos Thread Lift design: a template of its own, each post carries its own content.',
			// The page itself is the Next.js site's: WordPress shows no page of its own.
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_rest'        => true,
			'rest_base'           => 'aptos-posts',
			'menu_position'       => 22,
			'menu_icon'           => 'dashicons-star-half',
			'hierarchical'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			// No block editor: the content is the fields below the title.
			'supports'            => array( 'title', 'thumbnail' ),
		)
	);
}
add_action( 'init', 'ndm_headless_aptos_register' );

/**
 * The header photo is the featured image: makes sure the active theme (which never renders) allows one.
 */
function ndm_headless_aptos_thumbnails() {
	$support = get_theme_support( 'post-thumbnails' );

	if ( true === $support ) {
		return;
	}

	$types = is_array( $support ) && isset( $support[0] ) && is_array( $support[0] ) ? $support[0] : array();
	add_theme_support( 'post-thumbnails', array_values( array_unique( array_merge( $types, array( NDM_APTOS_POST_TYPE ) ) ) ) );
}
add_action( 'after_setup_theme', 'ndm_headless_aptos_thumbnails', 102 );

/**
 * The edit screen uses the fields of the Concerns post type: their styles and script load here too.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_aptos_field_types( $types ) {
	$types[] = NDM_APTOS_POST_TYPE;

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_aptos_field_types' );

/**
 * Every field of an Aptos page, grouped as the boxes of the edit screen, in page order.
 *
 * Field types are those of ndm_headless_concern_schema(). There is no price field, on purpose: every
 * price the site shows is a WooCommerce price.
 *
 * @return array[]
 */
function ndm_headless_aptos_schema() {
	$tag       = array( 'label' => 'Section tag', 'type' => 'text', 'help' => 'The small label above the heading; also this section\'s name in the section bar.' );
	$heading_1 = array( 'label' => 'Heading, first line', 'type' => 'text' );
	$heading_2 = array( 'label' => 'Heading, second line (blue)', 'type' => 'text' );
	$focus     = array( 'label' => 'Photo focus', 'type' => 'text', 'help' => 'Which part of the photo stays in view, for example "50% 30%". Empty: the middle.' );
	$tokens    = 'Never type an amount. Write {{price}} for the lowest price shown for the first product of the Price List box, {{price2}} for the second product. A sentence whose amount is not in WooCommerce is left out.';

	return array(
		array(
			'id'     => 'header',
			'title'  => 'Header',
			'help'   => 'The treatment\'s name is the post title; the wide header photo is the "Header photo" box at the side. The booking form is filled in by the site.',
			'fields' => array(
				array( 'key' => 'heading_1', 'help' => 'For example "Aptos Thread Lift". Empty: the title.' ) + $heading_1,
				array( 'key' => 'heading_2', 'help' => 'For example "in Toronto".' ) + $heading_2,
				array( 'key' => 'intro', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array( 'key' => 'hero_mobile', 'label' => 'Header photo for phones (tall)', 'type' => 'image' ),
				array( 'key' => 'hero_position' ) + $focus,
				array(
					'key'    => 'facts',
					'label'  => 'Quick facts (the card over the header photo)',
					'type'   => 'repeater',
					'add'    => 'Add a fact',
					'title'  => 'label',
					'fields' => array(
						array( 'key' => 'label', 'label' => 'Label', 'type' => 'text', 'help' => 'For example "Duration".' ),
						array( 'key' => 'value', 'label' => 'Value', 'type' => 'text', 'help' => 'For example "60 minutes".' ),
					),
				),
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
			'id'     => 'what',
			'title'  => 'What It Is',
			'help'   => 'No paragraphs: the section is left out.',
			'fields' => array(
				array( 'key' => 'what_tag' ) + $tag,
				array( 'key' => 'what_lead' ) + $heading_1,
				array( 'key' => 'what_strong' ) + $heading_2,
				array( 'key' => 'what_text', 'label' => 'Paragraphs', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 6 ),
				array( 'key' => 'what_note', 'label' => 'Note under the text', 'type' => 'textarea' ),
				array( 'key' => 'what_image', 'label' => 'Photo', 'type' => 'image' ),
				array( 'key' => 'what_position' ) + $focus,
				array( 'key' => 'what_ring', 'label' => 'Words on the turning badge over the photo', 'type' => 'text', 'help' => 'For example "SOLID · LONG-LASTING · BIOSTIMULATION · ". Empty: no badge.' ),
				array(
					'key'    => 'what_points',
					'label'  => 'Points under the section',
					'type'   => 'repeater',
					'add'    => 'Add a point',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'how',
			'title'  => 'How It Works',
			'help'   => 'No steps: the section is left out.',
			'fields' => array(
				array( 'key' => 'how_tag' ) + $tag,
				array( 'key' => 'how_lead' ) + $heading_1,
				array( 'key' => 'how_strong' ) + $heading_2,
				array( 'key' => 'how_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array(
					'key'    => 'how_steps',
					'label'  => 'Steps',
					'type'   => 'repeater',
					'add'    => 'Add a step',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'safety',
			'title'  => 'Is It Safe',
			'help'   => 'No paragraphs: the section is left out.',
			'fields' => array(
				array( 'key' => 'safety_tag' ) + $tag,
				array( 'key' => 'safety_lead' ) + $heading_1,
				array( 'key' => 'safety_strong' ) + $heading_2,
				array( 'key' => 'safety_text', 'label' => 'Paragraphs', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 6 ),
				array( 'key' => 'safeguards', 'label' => 'Safeguards (the checked list)', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 5 ),
				array( 'key' => 'product_image', 'label' => 'Product card, photo', 'type' => 'image' ),
				array( 'key' => 'product_tag', 'label' => 'Product card, tag', 'type' => 'text', 'help' => 'For example "Health Canada licensed".' ),
				array( 'key' => 'product_name', 'label' => 'Product card, name', 'type' => 'text' ),
				array( 'key' => 'product_note', 'label' => 'Product card, text', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'lasting',
			'title'  => 'How Long It Lasts',
			'help'   => 'The dark band with the large figure. No figure: the section is left out.',
			'fields' => array(
				array( 'key' => 'lasting_lead' ) + $heading_1,
				array( 'key' => 'lasting_strong' ) + $heading_2,
				array( 'key' => 'lasting_text', 'label' => 'Text', 'type' => 'textarea' ),
				array( 'key' => 'lasting_figure', 'label' => 'Large figure', 'type' => 'text', 'help' => 'For example "Up to 24".' ),
				array( 'key' => 'lasting_unit', 'label' => 'Unit after the figure', 'type' => 'text', 'help' => 'For example "months".' ),
				array( 'key' => 'lasting_label', 'label' => 'Words above the figure', 'type' => 'text' ),
				array( 'key' => 'lasting_note', 'label' => 'Note under the figure', 'type' => 'text', 'help' => 'Keep "Individual results may vary".' ),
			),
		),
		array(
			'id'     => 'fit',
			'title'  => 'Good Candidates',
			'help'   => 'Both lists empty: the section is left out.',
			'fields' => array(
				array( 'key' => 'fit_tag' ) + $tag,
				array( 'key' => 'fit_lead' ) + $heading_1,
				array( 'key' => 'fit_strong' ) + $heading_2,
				array( 'key' => 'fit_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array( 'key' => 'fit_yes', 'label' => 'May suit', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 4 ),
				array( 'key' => 'fit_no', 'label' => 'When to wait', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 4 ),
				array( 'key' => 'fit_image', 'label' => 'Photo', 'type' => 'image' ),
				array( 'key' => 'fit_position' ) + $focus,
			),
		),
		array(
			'id'     => 'expect',
			'title'  => 'What To Expect',
			'help'   => 'No steps: the section is left out.',
			'fields' => array(
				array( 'key' => 'expect_lead' ) + $heading_1,
				array( 'key' => 'expect_strong' ) + $heading_2,
				array(
					'key'    => 'expect_steps',
					'label'  => 'Steps',
					'type'   => 'repeater',
					'add'    => 'Add a step',
					'title'  => 'when',
					'fields' => array(
						array( 'key' => 'when', 'label' => 'When', 'type' => 'text', 'help' => 'For example "Consultation" or "Weeks 1 to 2".' ),
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'results',
			'title'  => 'Before And After Photos',
			'help'   => 'Cases of the "Before & After" post type shown as photos, in this order: search by the case\'s title and pick. Each takes the case\'s photo and its first category. No photo is uploaded here; add or change a case under Before & After. "Individual results may vary" is added by the site. No case picked: the section is left out.',
			'fields' => array(
				array( 'key' => 'results_lead' ) + $heading_1,
				array( 'key' => 'results_strong' ) + $heading_2,
				array( 'key' => 'results_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array( 'key' => 'cases', 'label' => 'Cases', 'type' => 'posts', 'post_type' => NDM_BA_POST_TYPE, 'rest' => 'before-after-cases', 'noun' => 'cases' ),
			),
		),
		array(
			'id'     => 'care',
			'title'  => 'Pre And Post Care',
			'help'   => 'Both lists empty: the section is left out.',
			'fields' => array(
				array( 'key' => 'care_lead' ) + $heading_1,
				array( 'key' => 'care_strong' ) + $heading_2,
				array( 'key' => 'care_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array( 'key' => 'care_before', 'label' => 'Before your visit', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 4 ),
				array( 'key' => 'care_after', 'label' => 'After your visit', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 5 ),
			),
		),
		array(
			'id'     => 'pair',
			'title'  => 'Elevate Your Results',
			'help'   => 'No groups and no cards: the section is left out.',
			'fields' => array(
				array( 'key' => 'pair_tag' ) + $tag,
				array( 'key' => 'pair_lead' ) + $heading_1,
				array( 'key' => 'pair_strong' ) + $heading_2,
				array( 'key' => 'pair_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array(
					'key'    => 'pair_groups',
					'label'  => 'Groups of treatments',
					'type'   => 'repeater',
					'add'    => 'Add a group',
					'title'  => 'when',
					'fields' => array(
						array( 'key' => 'when', 'label' => 'When', 'type' => 'text', 'help' => 'For example "At the same visit, if suitable".' ),
						array( 'key' => 'treatments', 'label' => 'Treatments', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 4 ),
					),
				),
				array(
					'key'    => 'pair_links',
					'label'  => 'Treatment cards',
					'type'   => 'repeater',
					'add'    => 'Add a card',
					'title'  => 'name',
					'fields' => array(
						array( 'key' => 'name', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'menu', 'label' => 'Treatment in the site\'s menu', 'type' => 'text', 'help' => 'Exactly as in the menu, for example "Dermal Fillers": the card links to that page. Empty: the title.' ),
						array( 'key' => 'tag', 'label' => 'Tag', 'type' => 'text', 'help' => 'For example "Injectables".' ),
						array( 'key' => 'image', 'label' => 'Photo', 'type' => 'image' ),
						array( 'key' => 'line', 'label' => 'Text', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'prices',
			'title'  => 'Price List',
			'help'   => 'One row per product, in the order shown: add a row, then search the WooCommerce price list and pick the product. The section shows that product\'s options with their prices and offers, each with Add to cart. Nothing here is a price: prices are changed in the price manager only. A whole category shows every product of it. No product picked: the price table is left out.',
			'fields' => array(
				array( 'key' => 'prices_lead' ) + $heading_1,
				array( 'key' => 'prices_strong' ) + $heading_2,
				array( 'key' => 'prices_intro', 'label' => 'Text under the heading', 'type' => 'textarea' ),
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
						array( 'key' => 'options', 'label' => 'Options shown', 'type' => 'lines', 'help' => 'The names of the product\'s options this page shows, one per line, exactly as in the price list (for example "Mid face"). Empty: every option of the product.', 'rows' => 3 ),
					),
				),
				array( 'key' => 'sessions_figure', 'label' => 'How many you need, figure', 'type' => 'text', 'help' => 'For example "1". Empty: the card is left out.' ),
				array( 'key' => 'sessions_unit', 'label' => 'How many you need, unit', 'type' => 'text', 'help' => 'For example "session".' ),
				array( 'key' => 'sessions_text', 'label' => 'How many you need, text', 'type' => 'textarea' ),
				array( 'key' => 'sessions_chips', 'label' => 'How many you need, short labels', 'type' => 'lines', 'help' => 'One per line.', 'rows' => 3 ),
			),
		),
		array(
			'id'     => 'why',
			'title'  => 'Why NewDermaMed',
			'help'   => 'The photo of the team is the site\'s. No figures: the section is left out.',
			'fields' => array(
				array( 'key' => 'why_lead' ) + $heading_1,
				array( 'key' => 'why_strong' ) + $heading_2,
				array(
					'key'    => 'why_items',
					'label'  => 'Figures',
					'type'   => 'repeater',
					'add'    => 'Add a figure',
					'title'  => 'unit',
					'fields' => array(
						array( 'key' => 'figure', 'label' => 'Figure', 'type' => 'text', 'help' => 'For example "16+".' ),
						array( 'key' => 'unit', 'label' => 'Words beside the figure', 'type' => 'text', 'help' => 'For example "Years".' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'text' ),
					),
				),
			),
		),
		array(
			'id'     => 'faqs',
			'title'  => 'FAQ',
			'help'   => $tokens . ' No question: the section is left out.',
			'fields' => array(
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
	);
}

/**
 * Cleans a whole page: every field of the schema, nothing else.
 *
 * @param mixed $input Raw values by field key.
 * @return array
 */
function ndm_headless_aptos_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_aptos_schema() as $group ) {
		foreach ( $group['fields'] as $field ) {
			$clean[ $field['key'] ] = ndm_headless_concern_clean( $field, isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null );
		}
	}

	return $clean;
}

/**
 * The stored content of a page, complete (missing fields come back empty).
 *
 * @param int $post_id Post ID.
 * @return array
 */
function ndm_headless_aptos_content( $post_id ) {
	return ndm_headless_aptos_clean_all( get_post_meta( $post_id, NDM_APTOS_META, true ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * The edit screen
 * ---------------------------------------------------------------------------------------------
 */

/**
 * One box per section of the page, under the title.
 */
function ndm_headless_aptos_meta_boxes() {
	$stored = null;

	foreach ( ndm_headless_aptos_schema() as $group ) {
		add_meta_box(
			'ndm-aptos-' . $group['id'],
			$group['title'],
			function ( $post ) use ( $group, &$stored ) {
				if ( null === $stored ) {
					$stored = ndm_headless_aptos_content( $post->ID );
					wp_nonce_field( 'ndm_aptos_save', 'ndm_aptos_nonce' );
				}

				if ( ! empty( $group['help'] ) ) {
					echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
				}

				foreach ( $group['fields'] as $field ) {
					ndm_headless_concern_field( $field, 'ndm_aptos[' . $field['key'] . ']', $stored[ $field['key'] ] );
				}
			},
			NDM_APTOS_POST_TYPE,
			'normal',
			'default'
		);
	}
}
add_action( 'add_meta_boxes_' . NDM_APTOS_POST_TYPE, 'ndm_headless_aptos_meta_boxes' );

/**
 * The "Slug" box (the page's address on the site) is shown without a visit to Screen Options.
 *
 * @param string[]  $hidden Boxes hidden by default.
 * @param WP_Screen $screen Current screen.
 * @return string[]
 */
function ndm_headless_aptos_show_slug( $hidden, $screen ) {
	return NDM_APTOS_POST_TYPE === $screen->post_type ? array_values( array_diff( $hidden, array( 'slugdiv' ) ) ) : $hidden;
}
add_filter( 'default_hidden_meta_boxes', 'ndm_headless_aptos_show_slug', 10, 2 );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_aptos_intro( $post ) {
	if ( NDM_APTOS_POST_TYPE !== $post->post_type ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );
	$slug = $post->post_name;

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $slug && '' !== $site ) {
		$url = $site . '/' . $slug;
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shown once published)' ) . '</p>';
	} else {
		echo '<p><strong>Page on the site:</strong> its address is the "Slug" below, made from the title when the page is first saved.</p>';
	}
	echo '<p>Filled in by the site, not typed here: every price and offer (from the products picked in the Price List box), the before and after photos (from the cases picked), the booking form, Our team, Testimonials, Visit us and Start your journey. A section whose box is left empty is left out of the page and of the section bar.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_aptos_intro' );

/**
 * Saves the fields of the edit screen.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_aptos_save( $post_id ) {
	if ( ! isset( $_POST['ndm_aptos_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_aptos_nonce'] ) ), 'ndm_aptos_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_aptos_clean_all().
	$input = isset( $_POST['ndm_aptos'] ) ? wp_unslash( $_POST['ndm_aptos'] ) : array();

	update_post_meta( $post_id, NDM_APTOS_META, wp_slash( ndm_headless_aptos_clean_all( $input ) ) );
}
add_action( 'save_post_' . NDM_APTOS_POST_TYPE, 'ndm_headless_aptos_save' );

/**
 * The list of pages shows each page's address.
 *
 * @param string[] $columns Columns.
 * @return string[]
 */
function ndm_headless_aptos_columns( $columns ) {
	$out = array();

	foreach ( $columns as $key => $label ) {
		$out[ $key ] = $label;
		if ( 'title' === $key ) {
			$out['ndm_address'] = 'Address on the site';
		}
	}

	return $out;
}
add_filter( 'manage_' . NDM_APTOS_POST_TYPE . '_posts_columns', 'ndm_headless_aptos_columns' );

/**
 * Prints the address column.
 *
 * @param string $column  Column.
 * @param int    $post_id Post ID.
 */
function ndm_headless_aptos_column( $column, $post_id ) {
	if ( 'ndm_address' === $column ) {
		echo esc_html( '/' . get_post_field( 'post_name', $post_id ) );
	}
}
add_action( 'manage_' . NDM_APTOS_POST_TYPE . '_posts_custom_column', 'ndm_headless_aptos_column', 10, 2 );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * A page as the site receives it. A row of the price list carries which product was picked
 * (`price_source`) and that product's own name and short description (`product`); the options, prices
 * and offers are not here: the site reads them from the WooCommerce price list.
 *
 * @param WP_Post $post The page.
 * @return array
 */
function ndm_headless_aptos_answer( $post ) {
	$content = ndm_headless_aptos_content( $post->ID );

	foreach ( ndm_headless_aptos_schema() as $group ) {
		$content = ndm_headless_concern_expand( $group['fields'], $content );
	}

	return array(
		'id'       => $post->ID,
		'slug'     => $post->post_name,
		'title'    => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'modified' => mysql_to_rfc3339( $post->post_modified_gmt ),
		'hero'     => ndm_headless_concern_image( (int) get_post_thumbnail_id( $post ) ),
		'content'  => $content,
	);
}

/**
 * Registers the routes.
 */
function ndm_headless_aptos_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/aptos-pages',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_aptos_rest_list',
			// Public on purpose: it holds only what the public pages show.
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/aptos-pages/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_aptos_rest_one',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_aptos_routes' );

/**
 * GET ndm/v1/aptos-pages: every published page's name and address, by name.
 *
 * @return WP_REST_Response
 */
function ndm_headless_aptos_rest_list() {
	$posts = get_posts(
		array(
			'post_type'   => NDM_APTOS_POST_TYPE,
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
 * GET ndm/v1/aptos-pages/<slug>: one published page.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_aptos_rest_one( $request ) {
	$posts = get_posts(
		array(
			'post_type'   => NDM_APTOS_POST_TYPE,
			'post_status' => 'publish',
			'name'        => (string) $request['slug'],
			'numberposts' => 1,
		)
	);

	if ( ! $posts ) {
		return new WP_Error( 'ndm_aptos_not_found', 'No published Aptos page has this address.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_aptos_answer( $posts[0] ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "Aptos pages changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_aptos_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_aptos_notify_frontend' );
}

/**
 * A page was saved, trashed, restored or deleted; or something a page shows was.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_aptos_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	// A Before & After case may be a photo of the page; a product gives its price list a title and a text.
	if ( in_array( get_post_type( $post_id ), array( NDM_APTOS_POST_TYPE, NDM_BA_POST_TYPE, 'product' ), true ) ) {
		ndm_headless_aptos_changed();
	}
}
add_action( 'save_post', 'ndm_headless_aptos_post_changed' );
add_action( 'trashed_post', 'ndm_headless_aptos_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_aptos_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_aptos_post_changed' );

/**
 * A page's content or header photo changed (both are post meta), or a case's photo.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_aptos_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( ! in_array( $meta_key, array( '_thumbnail_id', NDM_APTOS_META ), true ) ) {
		return;
	}

	$type = get_post_type( $post_id );
	if ( NDM_APTOS_POST_TYPE === $type || ( '_thumbnail_id' === $meta_key && NDM_BA_POST_TYPE === $type ) ) {
		ndm_headless_aptos_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_aptos_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_aptos_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_aptos_meta_changed', 10, 3 );

/**
 * A case's categories were changed: its photo on the page shows the first one.
 *
 * @param int    $object_id Post ID.
 * @param array  $terms     Terms.
 * @param array  $tt_ids    Term taxonomy IDs.
 * @param string $taxonomy  Taxonomy.
 */
function ndm_headless_aptos_terms_set( $object_id, $terms, $tt_ids, $taxonomy ) {
	if ( NDM_BA_TAXONOMY === $taxonomy ) {
		ndm_headless_aptos_changed();
	}
}
add_action( 'set_object_terms', 'ndm_headless_aptos_terms_set', 10, 4 );

/**
 * Asks the Next.js server to clear its cached Aptos pages. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_aptos_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'aptos' ) ),
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
	 * Puts a photo into the media library once. The photo is a file under the import folder, or, for the
	 * photos the original page showed straight from the clinic's own sites, a full https address.
	 *
	 * @param string $dir    Folder file paths are relative to.
	 * @param string $source File path or https address.
	 * @param string $alt    Alternative text.
	 * @return int Attachment ID, 0 when the photo could not be imported.
	 */
	function ndm_headless_aptos_import_photo( $dir, $source, $alt ) {
		$source = (string) $source;

		if ( ! preg_match( '#^https://#', $source ) ) {
			return ndm_headless_concern_import_image( $dir, $source, $alt );
		}

		$existing = get_posts(
			array(
				'post_type'   => 'attachment',
				'post_status' => 'inherit',
				'numberposts' => 1,
				'fields'      => 'ids',
				'meta_key'    => NDM_CONCERN_SOURCE_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- one-time import.
				'meta_value'  => $source, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- one-time import.
			)
		);
		if ( $existing ) {
			return (int) $existing[0];
		}

		$tmp = download_url( $source, 30 );
		if ( is_wp_error( $tmp ) ) {
			WP_CLI::warning( "Photo {$source}: " . $tmp->get_error_message() );
			return 0;
		}

		$image = media_handle_sideload(
			array(
				'name'     => basename( (string) wp_parse_url( $source, PHP_URL_PATH ) ),
				'tmp_name' => $tmp,
			),
			0
		);
		if ( is_wp_error( $image ) ) {
			wp_delete_file( $tmp );
			WP_CLI::warning( "Photo {$source}: " . $image->get_error_message() );
			return 0;
		}

		update_post_meta( $image, NDM_CONCERN_SOURCE_META, wp_slash( $source ) );
		if ( '' !== $alt ) {
			update_post_meta( $image, '_wp_attachment_image_alt', wp_slash( $alt ) );
		}

		return (int) $image;
	}

	/**
	 * Imports the photos named in a list of fields. Where the edit screen holds a photo the import
	 * gives a file path or address, or { "file": path or address, "alt": alternative text }.
	 *
	 * @param array[] $fields Field definitions.
	 * @param array   $values Values by key.
	 * @param string  $dir    Folder the paths are relative to.
	 * @return array
	 */
	function ndm_headless_aptos_import_images( $fields, $values, $dir ) {
		foreach ( $fields as $field ) {
			$key = $field['key'];

			if ( 'image' === $field['type'] && ! empty( $values[ $key ] ) ) {
				$photo          = is_array( $values[ $key ] ) ? $values[ $key ] : array( 'file' => $values[ $key ] );
				$values[ $key ] = isset( $photo['file'] ) && is_string( $photo['file'] ) ? ndm_headless_aptos_import_photo( $dir, $photo['file'], isset( $photo['alt'] ) ? (string) $photo['alt'] : '' ) : 0;
			} elseif ( 'repeater' === $field['type'] && ! empty( $values[ $key ] ) && is_array( $values[ $key ] ) ) {
				foreach ( $values[ $key ] as $i => $row ) {
					if ( is_array( $row ) ) {
						$values[ $key ][ $i ] = ndm_headless_aptos_import_images( $field['fields'], $row, $dir );
					}
				}
			}
		}

		return $values;
	}

	/**
	 * Creates Aptos pages from JSON on standard input:
	 *
	 *   [ { "slug": "aptos-thread-lift", "title": "Aptos Thread Lift",
	 *       "hero": "https://.../1-1.jpg", "heroAlt": "...",
	 *       "content": { ...the fields of the edit screen; a photo is a file path or an https address
	 *                    (or { "file", "alt" }); a row of "price_list" names its WooCommerce product
	 *                    ("product": "..."), which must exist; "cases" is a list of titles of existing
	 *                    Before & After cases... } } ]
	 *
	 * A page whose slug already exists (in any state, the trash included) is left exactly as it is, so
	 * running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-aptos.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm aptos-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm aptos-import',
		function ( $args, $assoc_args ) {
			$pages = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $pages ) || ! $pages ) {
				WP_CLI::error( 'Expected a JSON list of pages on standard input.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			foreach ( $pages as $page ) {
				$slug  = isset( $page['slug'] ) ? sanitize_title( (string) $page['slug'] ) : '';
				$title = isset( $page['title'] ) ? trim( (string) $page['title'] ) : '';

				if ( '' === $slug || '' === $title || empty( $page['content'] ) || ! is_array( $page['content'] ) ) {
					WP_CLI::warning( 'Skipped a page without a slug, a title or content.' );
					continue;
				}

				$existing = array();
				// A trashed post's slug is "<slug>__trashed".
				foreach ( array( $slug, $slug . '__trashed' ) as $name ) {
					$existing = $existing ? $existing : get_posts(
						array(
							'post_type'   => NDM_APTOS_POST_TYPE,
							'name'        => $name,
							'post_status' => 'any, trash',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
				}
				if ( $existing ) {
					WP_CLI::log( "Kept: Aptos page {$existing[0]} ({$slug}) already exists." );
					continue;
				}

				$content = $page['content'];

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

				foreach ( ndm_headless_aptos_schema() as $group ) {
					$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
				}

				$id = wp_insert_post(
					array(
						'post_type'   => NDM_APTOS_POST_TYPE,
						'post_status' => 'publish',
						'post_name'   => $slug,
						'post_title'  => wp_slash( $title ),
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( "Aptos page {$slug}: " . $id->get_error_message() );
					continue;
				}

				update_post_meta( $id, NDM_APTOS_META, wp_slash( ndm_headless_aptos_clean_all( $content ) ) );

				if ( ! empty( $page['hero'] ) ) {
					$hero = ndm_headless_aptos_import_photo( $dir, (string) $page['hero'], isset( $page['heroAlt'] ) ? (string) $page['heroAlt'] : '' );
					if ( $hero ) {
						set_post_thumbnail( $id, $hero );
					}
				}

				WP_CLI::success( "Created: Aptos page {$id} ({$slug})." );
			}
		}
	);
}

<?php
/**
 * The Aptos Thread Lift page of the Next.js site (/aptos-thread-lift).
 *
 * - It is a standard WordPress page (Pages in the admin), like the home page and the About page, not a
 *   post type of its own. The page is recognised by its template "Aptos Thread Lift page" (`ndm-aptos`,
 *   chosen under Page Attributes), so it can be renamed safely; a top-level page without that template
 *   whose slug is `aptos-thread-lift` is recognised too, and gets the template the next time it is
 *   saved. Its address on the site is always /aptos-thread-lift.
 * - On that one page the block editor is switched off and the text editor hidden: its content is the
 *   boxes under the title, one per section of the page (one post meta, `_ndm_aptos`). Every other page
 *   keeps its editor. The fields are listed once, in ndm_headless_aptos_schema(); the edit screen, the
 *   saving, the revisions, the REST answer and the import all read that list. The fields themselves
 *   (their look, cleaning and search boxes) are the ones of the Concerns post type (includes/concerns.php).
 *   The page's featured image is the wide header photo.
 * - The price list is never typed: the editor searches the WooCommerce products and picks one or more;
 *   their options, prices and offers are read from WooCommerce by the site. An amount inside the copy
 *   is written as a token ({{price}}), filled in from those same products.
 * - Before and after photos are cases of the "Before & After" post type, searched and picked.
 * - What the page shares with the rest of the site (Our team, Testimonials, Visit us, Start your
 *   journey, the booking form) lives in the site's code.
 * - The fields are part of the page's revisions: every save that changes them makes a revision, the
 *   revisions screen shows what changed, and restoring a revision restores the fields.
 * - `GET ndm/v1/aptos-page` gives the published page. When there is none, or it is not published, the
 *   answer is 404 and the site shows its built-in copy; the admin says so on the Pages screens.
 * - When the page changes, the Next.js site is told to drop its cached copy (tag `aptos`).
 * - `wp ndm aptos-import` creates the page once, from the site's original content.
 *   `wp ndm aptos-migrate` moves the content of the former post type "Aptos Pages" onto the page.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_APTOS_META', '_ndm_aptos' );
// The value of the page's "Template" (post meta `_wp_page_template`).
define( 'NDM_APTOS_TEMPLATE', 'ndm-aptos' );
// The page's slug when it has no template yet, and its address on the site, always.
define( 'NDM_APTOS_SLUG', 'aptos-thread-lift' );
// The post type the page lived in until 2026-11-13 (no longer registered): only the migration reads it.
define( 'NDM_APTOS_OLD_POST_TYPE', 'ndm_aptos' );

/*
 * ---------------------------------------------------------------------------------------------
 * Which page is the Aptos page
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The pages that carry the "Aptos Thread Lift page" template (the trash left out): a published one
 * first, then the oldest. There should be exactly one.
 *
 * @return int[]
 */
function ndm_headless_aptos_templated() {
	$ids = get_posts(
		array(
			'post_type'        => 'page',
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 20,
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'fields'           => 'ids',
			'meta_key'         => '_wp_page_template', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a handful of pages.
			'meta_value'       => NDM_APTOS_TEMPLATE, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- a handful of pages.
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
 * The Aptos page: the page with the "Aptos Thread Lift page" template, else the top-level page whose
 * slug is `aptos-thread-lift`. 0 when there is none.
 *
 * @return int
 */
function ndm_headless_aptos_page_id() {
	$templated = ndm_headless_aptos_templated();
	if ( $templated ) {
		return $templated[0];
	}

	$by_slug = get_posts(
		array(
			'post_type'        => 'page',
			'name'             => NDM_APTOS_SLUG,
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
 * Whether this post is the Aptos page.
 *
 * @param WP_Post|int|null $post Post or post ID.
 * @return bool
 */
function ndm_headless_is_aptos_page( $post ) {
	$post = get_post( $post );

	return $post instanceof WP_Post && 'page' === $post->post_type && ndm_headless_aptos_page_id() === (int) $post->ID;
}

/**
 * "Aptos Thread Lift page" is offered as a template of pages (Page Attributes), whatever the active theme.
 *
 * @param string[] $templates Templates by file name.
 * @return string[]
 */
function ndm_headless_aptos_template( $templates ) {
	$templates[ NDM_APTOS_TEMPLATE ] = 'Aptos Thread Lift page';

	return $templates;
}
add_filter( 'theme_page_templates', 'ndm_headless_aptos_template' );

/**
 * The Aptos page has no block editor; every other page keeps its own.
 *
 * @param bool    $use  Whether the block editor is used.
 * @param WP_Post $post The post being edited.
 * @return bool
 */
function ndm_headless_aptos_no_block_editor( $use, $post ) {
	return $use && $post instanceof WP_Post && 'page' === $post->post_type && ndm_headless_is_aptos_page( $post ) ? false : $use;
}
add_filter( 'use_block_editor_for_post', 'ndm_headless_aptos_no_block_editor', 20, 2 );

/**
 * The header photo is the page's featured image: makes sure the active theme (which never renders)
 * allows one on pages.
 */
function ndm_headless_aptos_thumbnails() {
	$support = get_theme_support( 'post-thumbnails' );

	if ( true === $support ) {
		return;
	}

	$types = is_array( $support ) && isset( $support[0] ) && is_array( $support[0] ) ? $support[0] : array();
	add_theme_support( 'post-thumbnails', array_values( array_unique( array_merge( $types, array( 'page' ) ) ) ) );
}
add_action( 'after_setup_theme', 'ndm_headless_aptos_thumbnails', 102 );

/**
 * The edit screen uses the fields of the Concerns post type: their styles and script load on the Aptos
 * page's edit screen, and on no other page's.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_aptos_field_types( $types ) {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	if ( $screen && 'page' === $screen->post_type && ndm_headless_is_aptos_page( get_post() ) ) {
		$types[] = 'page';
	}

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_aptos_field_types' );

/**
 * Every field of the Aptos page, grouped as the boxes of the edit screen, in page order.
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
			'help'   => 'The treatment\'s name is the page title; the wide header photo is the page\'s "Featured image" box at the side. The booking form is filled in by the site.',
			'fields' => array(
				array( 'key' => 'heading_1', 'help' => 'For example "Aptos Thread Lift". Empty: the page title.' ) + $heading_1,
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
 * Cleans the whole page: every field of the schema, nothing else.
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
 * The stored content of the page (or of one of its revisions), complete (missing fields come back empty).
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
 * On the Aptos page: one box per section of the page under the title, and no text editor.
 *
 * @param WP_Post $post The page being edited.
 */
function ndm_headless_aptos_meta_boxes( $post ) {
	if ( ! ndm_headless_is_aptos_page( $post ) ) {
		return;
	}

	// For this request only: the page's content is the boxes, not the text editor.
	remove_post_type_support( 'page', 'editor' );

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
			'page',
			'normal',
			'high'
		);
	}
}
add_action( 'add_meta_boxes_page', 'ndm_headless_aptos_meta_boxes' );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_aptos_intro( $post ) {
	if ( ! ndm_headless_is_aptos_page( $post ) ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $site ) {
		$url = $site . '/' . NDM_APTOS_SLUG;
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shows these words once published; until then the site shows its built-in copy)' ) . '</p>';
	}
	echo '<p>This is the site\'s Aptos Thread Lift page: it is recognised by its template "Aptos Thread Lift page" (Page Attributes), so the title and the slug above are only its name in the admin; the address on the site is always /' . esc_html( NDM_APTOS_SLUG ) . '. The wide header photo is the page\'s Featured image.</p>';
	echo '<p>Filled in by the site, not typed here: every price and offer (from the products picked in the Price List box), the before and after photos (from the cases picked), the booking form, Our team, Testimonials, Visit us and Start your journey. A section whose box is left empty is left out of the page and of the section bar.</p>';
	echo '<p>Every save is kept under Revisions, fields included: an earlier version can be compared and restored there.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_aptos_intro' );

/**
 * Saves the fields of the edit screen. It runs on `post_updated` before WordPress stores the page's
 * revision (priority 10), so the revision made by this save holds the fields as they were just saved.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_aptos_save( $post_id ) {
	if ( ! isset( $_POST['ndm_aptos_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_aptos_nonce'] ) ), 'ndm_aptos_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) || ! ndm_headless_is_aptos_page( $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_aptos_clean_all().
	$input = isset( $_POST['ndm_aptos'] ) ? wp_unslash( $_POST['ndm_aptos'] ) : array();

	update_post_meta( $post_id, NDM_APTOS_META, wp_slash( ndm_headless_aptos_clean_all( $input ) ) );

	// A page recognised by its slug alone gets the template, so a later rename cannot lose it.
	if ( NDM_APTOS_TEMPLATE !== get_post_meta( $post_id, '_wp_page_template', true ) ) {
		update_post_meta( $post_id, '_wp_page_template', NDM_APTOS_TEMPLATE );
	}
}
add_action( 'post_updated', 'ndm_headless_aptos_save', 5 );

/**
 * The list of pages marks the Aptos page.
 *
 * @param string[] $states Labels after the title.
 * @param WP_Post  $post   The page.
 * @return string[]
 */
function ndm_headless_aptos_post_state( $states, $post ) {
	if ( 'page' === $post->post_type && ndm_headless_is_aptos_page( $post ) ) {
		$states['ndm_aptos'] = 'Aptos Thread Lift page of the site';
	}

	return $states;
}
add_filter( 'display_post_states', 'ndm_headless_aptos_post_state', 10, 2 );

/**
 * What is wrong with the Aptos page, in words for the admin; empty when it is in order.
 *
 * @return string[]
 */
function ndm_headless_aptos_problems() {
	$id = ndm_headless_aptos_page_id();

	if ( ! $id ) {
		return array( 'The site\'s Aptos Thread Lift page was not found, so /' . NDM_APTOS_SLUG . ' shows the site\'s built-in copy. Create a page, choose the template "Aptos Thread Lift page" under Page Attributes (or give it the slug "' . NDM_APTOS_SLUG . '"), and publish it.' );
	}

	$problems  = array();
	$templated = ndm_headless_aptos_templated();
	$name      = '"' . get_the_title( $id ) . '"';

	if ( 'publish' !== get_post_status( $id ) ) {
		$problems[] = 'The Aptos Thread Lift page ' . $name . ' is not published, so /' . NDM_APTOS_SLUG . ' shows the site\'s built-in copy until it is.';
	}

	if ( count( $templated ) > 1 ) {
		$problems[] = count( $templated ) . ' pages have the template "Aptos Thread Lift page". The site shows ' . $name . ' (page ' . $id . '); set the others to another template.';
	}

	if ( ! $templated ) {
		$problems[] = 'The Aptos Thread Lift page ' . $name . ' is recognised by its slug "' . NDM_APTOS_SLUG . '" only. Save it once (or choose the template "Aptos Thread Lift page") so that renaming it cannot lose it.';
	}

	if ( ! array_filter( ndm_headless_aptos_content( $id ) ) ) {
		$problems[] = 'The Aptos Thread Lift page ' . $name . ' has no content yet: fill in the boxes under its title.';
	}

	return $problems;
}

/**
 * The Pages screens say when the Aptos page is missing, unpublished, doubled or empty.
 */
function ndm_headless_aptos_notices() {
	$screen = get_current_screen();

	if ( ! $screen || 'page' !== $screen->post_type || ! in_array( $screen->base, array( 'edit', 'post' ), true ) || ! current_user_can( 'edit_pages' ) ) {
		return;
	}

	// On a page's own edit screen only that page's trouble is shown, on the Aptos page itself.
	if ( 'post' === $screen->base && ndm_headless_aptos_page_id() && ! ndm_headless_is_aptos_page( get_post() ) ) {
		return;
	}

	foreach ( ndm_headless_aptos_problems() as $problem ) {
		echo '<div class="notice notice-warning"><p><strong>Aptos Thread Lift page:</strong> ' . esc_html( $problem ) . '</p></div>';
	}
}
add_action( 'admin_notices', 'ndm_headless_aptos_notices' );

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
function ndm_headless_aptos_revision_keys( $keys, $post_type ) {
	if ( 'page' === $post_type ) {
		$keys[] = NDM_APTOS_META;
	}

	return $keys;
}
add_filter( 'wp_post_revision_meta_keys', 'ndm_headless_aptos_revision_keys', 10, 2 );

/**
 * The revisions screen of the Aptos page compares the fields too.
 *
 * @param string[] $fields Fields compared, by key.
 * @param array    $post   The page (or a revision of it).
 * @return string[]
 */
function ndm_headless_aptos_revision_fields( $fields, $post ) {
	$id     = isset( $post['ID'] ) ? (int) $post['ID'] : 0;
	$parent = $id ? wp_is_post_revision( $id ) : 0;

	if ( $id && ndm_headless_is_aptos_page( $parent ? $parent : $id ) ) {
		$fields['ndm_aptos'] = 'Aptos Thread Lift page fields';
	}

	return $fields;
}
add_filter( '_wp_post_revision_fields', 'ndm_headless_aptos_revision_fields', 10, 2 );

/**
 * The fields of a revision (or of the page as it is now) as text, for the comparison of two revisions.
 * Each value is written as the About page writes its own (ndm_headless_about_revision_lines()).
 *
 * @param string  $value    Unused: a page has no such column.
 * @param string  $field    Field key.
 * @param WP_Post $revision The revision, or the page.
 * @return string
 */
function ndm_headless_aptos_revision_text( $value, $field, $revision ) {
	if ( ! $revision instanceof WP_Post ) {
		return '';
	}

	$content = ndm_headless_aptos_content( $revision->ID );
	$lines   = array();

	foreach ( ndm_headless_aptos_schema() as $group ) {
		$lines[] = '== ' . $group['title'] . ' ==';
		foreach ( $group['fields'] as $one ) {
			$lines = array_merge( $lines, ndm_headless_about_revision_lines( $one, $content[ $one['key'] ] ) );
		}
		$lines[] = '';
	}

	return implode( "\n", $lines );
}
add_filter( '_wp_post_revision_field_ndm_aptos', 'ndm_headless_aptos_revision_text', 10, 3 );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The page as the site receives it. A row of the price list carries which product was picked
 * (`price_source`) and that product's own name and short description (`product`); the options, prices
 * and offers are not here: the site reads them from the WooCommerce price list. `slug` is the page's
 * address on the site, whatever the page's own slug in the admin.
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
		'slug'     => NDM_APTOS_SLUG,
		'title'    => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'modified' => mysql_to_rfc3339( $post->post_modified_gmt ),
		'hero'     => ndm_headless_concern_image( (int) get_post_thumbnail_id( $post ) ),
		'content'  => $content,
	);
}

/**
 * Registers the route.
 */
function ndm_headless_aptos_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/aptos-page',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_aptos_rest',
			// Public on purpose: it holds only what the public page shows.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_aptos_routes' );

/**
 * GET ndm/v1/aptos-page: the published Aptos page. 404 when there is none or it is not published (the
 * site then shows its built-in copy).
 *
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_aptos_rest() {
	$post = get_post( ndm_headless_aptos_page_id() );

	if ( ! $post instanceof WP_Post ) {
		return new WP_Error( 'ndm_aptos_missing', 'No page has the template "Aptos Thread Lift page" or the slug "' . NDM_APTOS_SLUG . '".', array( 'status' => 404 ) );
	}

	// A page behind a password is not public either.
	if ( 'publish' !== $post->post_status || '' !== $post->post_password ) {
		return new WP_Error( 'ndm_aptos_unpublished', 'The Aptos Thread Lift page is not published.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_aptos_answer( $post ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "the Aptos page changed" call to the Next.js site for the end of this request.
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
 * A page was saved, trashed, restored or deleted (any of them can be, become or stop being the Aptos
 * page); or something the page shows was.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_aptos_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	// A Before & After case may be a photo of the page; a product gives its price list a title and a text.
	if ( in_array( get_post_type( $post_id ), array( 'page', NDM_BA_POST_TYPE, 'product' ), true ) ) {
		ndm_headless_aptos_changed();
	}
}
add_action( 'save_post', 'ndm_headless_aptos_post_changed' );
add_action( 'trashed_post', 'ndm_headless_aptos_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_aptos_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_aptos_post_changed' );

/**
 * The page's fields, template or header photo changed (all post meta), a case's photo, or the
 * description of a photo in the media library.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_aptos_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( ! in_array( $meta_key, array( NDM_APTOS_META, '_wp_page_template', '_thumbnail_id', '_wp_attachment_image_alt' ), true ) || wp_is_post_revision( $post_id ) ) {
		return;
	}

	$type = get_post_type( $post_id );
	if ( in_array( $type, array( 'page', 'attachment' ), true ) || ( '_thumbnail_id' === $meta_key && NDM_BA_POST_TYPE === $type ) ) {
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
 * Asks the Next.js server to clear its cached Aptos page. Fire and forget: a site that is down or not
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
 * One-time import and migration
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
	 * The posts of the former post type "Aptos Pages", the trash included.
	 *
	 * @return WP_Post[]
	 */
	function ndm_headless_aptos_old_posts() {
		return get_posts(
			array(
				'post_type'        => NDM_APTOS_OLD_POST_TYPE,
				'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future', 'trash' ),
				'numberposts'      => 20,
				'orderby'          => 'ID',
				'order'            => 'ASC',
				'suppress_filters' => true,
			)
		);
	}

	/**
	 * Creates the standard page that is the Aptos page, with these fields and header photo, and stores
	 * its first revision (so the imported version can always be restored).
	 *
	 * @param string $title   Page title.
	 * @param string $status  Post status.
	 * @param array  $content The fields, cleaned on the way in.
	 * @param int    $hero    Attachment ID of the header photo, 0 for none.
	 * @return int|WP_Error Page ID.
	 */
	function ndm_headless_aptos_create_page( $title, $status, $content, $hero ) {
		$id = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => $status,
				'post_name'   => NDM_APTOS_SLUG,
				'post_title'  => wp_slash( $title ),
			),
			true
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		update_post_meta( $id, '_wp_page_template', NDM_APTOS_TEMPLATE );
		update_post_meta( $id, NDM_APTOS_META, wp_slash( ndm_headless_aptos_clean_all( $content ) ) );
		if ( $hero ) {
			set_post_thumbnail( $id, $hero );
		}
		wp_save_post_revision( $id );

		return (int) $id;
	}

	/**
	 * A page with the slug "aptos-thread-lift" in the trash (it keeps its slug as "...__trashed"), or 0.
	 *
	 * @return int
	 */
	function ndm_headless_aptos_trashed_page() {
		foreach ( array( NDM_APTOS_SLUG, NDM_APTOS_SLUG . '__trashed' ) as $name ) {
			$found = get_posts(
				array(
					'post_type'   => 'page',
					'name'        => $name,
					'post_status' => 'trash',
					'numberposts' => 1,
					'fields'      => 'ids',
				)
			);
			if ( $found ) {
				return (int) $found[0];
			}
		}

		return 0;
	}

	/**
	 * Creates the Aptos page (a standard page with the template "Aptos Thread Lift page") from JSON on
	 * standard input:
	 *
	 *   { "title": "Aptos Thread Lift",
	 *     "hero": "https://.../1-1.jpg", "heroAlt": "...",
	 *     "content": { ...the fields of the edit screen; a photo is a file path or an https address
	 *                  (or { "file", "alt" }); a row of "price_list" names its WooCommerce product
	 *                  ("product": "..."), which must exist; "cases" is a list of titles of existing
	 *                  Before & After cases... } }
	 *
	 * (A list holding one such page, the former format, is read too.) When an Aptos page already exists,
	 * or a page with the slug "aptos-thread-lift" (in any state, the trash included), nothing is created,
	 * so running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * [--fill-empty]
	 * : When the Aptos page already exists (an empty page saved before the import, for example), fill
	 *   in only its fields that are empty, give it the template "Aptos Thread Lift page" when it has
	 *   none and the header photo when it has none. A field that holds anything is never replaced; the
	 *   page's title and state (a draft stays a draft) are left as they are.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-aptos.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm aptos-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm aptos-import',
		function ( $args, $assoc_args ) {
			$page = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( is_array( $page ) && isset( $page[0] ) && is_array( $page[0] ) ) {
				$page = $page[0];
			}
			if ( ! is_array( $page ) || empty( $page['content'] ) || ! is_array( $page['content'] ) ) {
				WP_CLI::error( 'Expected the page as JSON on standard input: { "title", "hero", "content" }.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			if ( ndm_headless_aptos_old_posts() ) {
				WP_CLI::error( 'This WordPress still holds the Aptos page in its former post type: run "wp ndm aptos-migrate" instead.' );
			}

			$existing = ndm_headless_aptos_page_id();
			$existing = $existing ? $existing : ndm_headless_aptos_trashed_page();
			$fill     = ! empty( $assoc_args['fill-empty'] );
			if ( $existing && ! $fill ) {
				WP_CLI::log( "Kept: the Aptos page (page {$existing}) already exists." );
				return;
			}
			if ( $existing && 'trash' === get_post_status( $existing ) ) {
				WP_CLI::error( "The Aptos page (page {$existing}) is in the trash: restore it first." );
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$content = $page['content'];
			$stored  = $existing ? ndm_headless_aptos_content( $existing ) : null;
			if ( null !== $stored ) {
				// Only the fields that are empty on the page, and only from imported fields that hold something.
				$content = array_filter(
					array_intersect_key( $content, array_filter( $stored, 'ndm_headless_import_is_empty' ) ),
					function ( $value ) {
						return ! ndm_headless_import_is_empty( $value );
					}
				);
			}

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
			if ( array_key_exists( 'price_list', $content ) ) {
				$content['price_list'] = $rows;
			}

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
			if ( array_key_exists( 'cases', $content ) ) {
				$content['cases'] = $cases;
			}

			foreach ( ndm_headless_aptos_schema() as $group ) {
				$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
			}

			$needs_hero = ! $existing || ! has_post_thumbnail( $existing );
			$hero       = empty( $page['hero'] ) || ! $needs_hero ? 0 : ndm_headless_aptos_import_photo( $dir, (string) $page['hero'], isset( $page['heroAlt'] ) ? (string) $page['heroAlt'] : '' );

			if ( null !== $stored ) {
				$changes = array();
				if ( $content ) {
					update_post_meta( $existing, NDM_APTOS_META, wp_slash( ndm_headless_aptos_clean_all( array_merge( $stored, $content ) ) ) );
					$changes[] = count( $content ) . ' empty fields';
				}
				if ( NDM_APTOS_TEMPLATE !== get_post_meta( $existing, '_wp_page_template', true ) ) {
					update_post_meta( $existing, '_wp_page_template', NDM_APTOS_TEMPLATE );
					$changes[] = 'its template';
				}
				if ( $hero ) {
					set_post_thumbnail( $existing, $hero );
					$changes[] = 'its header photo';
				}
				if ( ! $changes ) {
					WP_CLI::success( "Nothing to fill: the Aptos page (page {$existing}) already holds everything." );
					return;
				}
				wp_save_post_revision( $existing );
				WP_CLI::success( "Filled the Aptos page (page {$existing}, " . get_post_status( $existing ) . '): ' . implode( ', ', $changes ) . '.' );
				return;
			}

			$id   = ndm_headless_aptos_create_page( isset( $page['title'] ) && '' !== trim( (string) $page['title'] ) ? trim( (string) $page['title'] ) : 'Aptos Thread Lift', 'publish', $content, $hero );
			if ( is_wp_error( $id ) ) {
				WP_CLI::error( 'Aptos page: ' . $id->get_error_message() );
			}

			WP_CLI::success( "Created: the Aptos page (page {$id})." );
		}
	);

	/**
	 * Moves the Aptos page from its former post type ("Aptos Pages", `ndm_aptos`) onto a standard page
	 * with the template "Aptos Thread Lift page": same title, same state, same fields, same header photo
	 * and photos of the media library (nothing is uploaded again).
	 *
	 * Safe to run again: a page that already holds the same fields is left as it is, and a page that
	 * holds different fields is never overwritten. The former post is deleted only with --delete-old,
	 * and only when the page holds exactly its fields and header photo.
	 *
	 * ## OPTIONS
	 *
	 * [--delete-old]
	 * : After checking that the page holds the same fields, delete the former post for good.
	 *
	 * ## EXAMPLES
	 *
	 *     docker compose run --rm -T cli wp ndm aptos-migrate
	 *     docker compose run --rm -T cli wp ndm aptos-migrate --delete-old
	 */
	WP_CLI::add_command(
		'ndm aptos-migrate',
		function ( $args, $assoc_args ) {
			$old = ndm_headless_aptos_old_posts();
			if ( ! $old ) {
				WP_CLI::success( 'Nothing to migrate: no post of the former post type "Aptos Pages" is left.' );
				return;
			}
			if ( count( $old ) > 1 ) {
				WP_CLI::error( 'More than one post of the former post type "Aptos Pages" exists (' . implode( ', ', wp_list_pluck( $old, 'ID' ) ) . '): delete the ones that are not the page, then run this again.' );
			}

			$old    = $old[0];
			$fields = ndm_headless_aptos_clean_all( get_post_meta( $old->ID, NDM_APTOS_META, true ) );
			$hero   = (int) get_post_meta( $old->ID, '_thumbnail_id', true );
			$page   = ndm_headless_aptos_page_id();

			if ( $page ) {
				$now = ndm_headless_aptos_content( $page );

				if ( ! array_filter( $now ) ) {
					update_post_meta( $page, NDM_APTOS_META, wp_slash( $fields ) );
					update_post_meta( $page, '_wp_page_template', NDM_APTOS_TEMPLATE );
					if ( $hero && ! get_post_thumbnail_id( $page ) ) {
						set_post_thumbnail( $page, $hero );
					}
					wp_save_post_revision( $page );
					WP_CLI::log( "Filled: page {$page} had no fields; it now holds those of the former post {$old->ID}." );
				} elseif ( $now !== $fields ) {
					WP_CLI::error( "Page {$page} is already the Aptos page and holds different fields than the former post {$old->ID}. Nothing was changed: decide which one is right before going on." );
				} else {
					WP_CLI::log( "Kept: page {$page} already holds the fields of the former post {$old->ID}." );
				}
			} else {
				$taken = ndm_headless_aptos_trashed_page();
				if ( $taken ) {
					WP_CLI::error( "A page with the slug \"" . NDM_APTOS_SLUG . "\" is in the trash (page {$taken}): restore or delete it first." );
				}

				$page = ndm_headless_aptos_create_page( html_entity_decode( $old->post_title, ENT_QUOTES, 'UTF-8' ), 'trash' === $old->post_status ? 'draft' : $old->post_status, $fields, $hero );
				if ( is_wp_error( $page ) ) {
					WP_CLI::error( 'Aptos page: ' . $page->get_error_message() );
				}
				WP_CLI::log( "Created: page {$page} from the former post {$old->ID}." );
			}

			// The check: the page holds exactly the former post's fields and header photo, and every photo is still in the media library.
			$stored = ndm_headless_aptos_content( $page );
			if ( $stored !== $fields ) {
				WP_CLI::error( "Page {$page} does not hold the same fields as the former post {$old->ID}. The former post was left untouched." );
			}
			if ( (int) get_post_thumbnail_id( $page ) !== $hero ) {
				WP_CLI::error( "Page {$page} does not have the former post's header photo ({$hero}). The former post was left untouched." );
			}
			$photos = array_filter( array( $hero, $stored['hero_mobile'], $stored['what_image'], $stored['fit_image'], $stored['product_image'] ) );
			foreach ( $stored['pair_links'] as $row ) {
				$photos[] = $row['image'];
			}
			foreach ( array_filter( $photos ) as $photo ) {
				if ( ! wp_attachment_is_image( $photo ) ) {
					WP_CLI::error( "Photo {$photo} of the page is not in the media library. The former post was left untouched." );
				}
			}
			WP_CLI::log( "Checked: page {$page} holds the same fields and header photo as the former post (" . count( array_filter( $photos ) ) . ' photos, ' . count( $stored['price_list'] ) . ' products, ' . count( $stored['faqs'] ) . ' questions).' );

			if ( empty( $assoc_args['delete-old'] ) ) {
				WP_CLI::success( "Migrated. The former post {$old->ID} is still there; run again with --delete-old once the site has been checked." );
				return;
			}

			if ( ! wp_delete_post( $old->ID, true ) ) {
				WP_CLI::error( "The former post {$old->ID} could not be deleted." );
			}
			WP_CLI::success( "Migrated, and the former post {$old->ID} was deleted. The Aptos page is page {$page}." );
		}
	);
}

<?php
/**
 * The VIP Sale page of the Next.js site (/vip-sale).
 *
 * - It is a standard WordPress page (Pages in the admin), not a post type of its own. The page is
 *   recognised by its template "VIP Sale page" (`ndm-vip-sale`, chosen under Page Attributes), so it
 *   can be renamed safely; a page without that template whose slug is `vip-sale` is recognised too,
 *   and gets the template the next time it is saved. Its address on the site is always /vip-sale.
 * - On that one page the block editor is switched off and the text editor hidden: its content is the
 *   boxes under the title (one post meta, `_ndm_vip_sale`): the sale's own settings (its name, its
 *   first and last minute, which price-list categories are in it and under which tab, the concerns
 *   that shortlist them, how many specials show) and the words of each section. The fields are listed
 *   once, in ndm_headless_vip_sale_schema(); the edit screen, the saving, the REST answer and the
 *   import all read that list. The fields themselves are the ones of the Concerns post type.
 * - No price, percentage or offer is typed here: the deals, their prices and offers, and "up to N%"
 *   are read by the site from the WooCommerce price list, the specials from the current offers
 *   (price manager). Date words ("Nov 27 to 30", "4 days") are worked out from the two dates.
 *   Prescription drugs are never part of the sale, whatever is picked (the site leaves them out).
 * - The fields are part of the page's revisions.
 * - `GET ndm/v1/vip-sale-page` gives the published page. When there is no VIP Sale page, or it is not
 *   published, the answer is 404 and the site shows its built-in copy.
 * - When the page changes, the Next.js site is told to drop its cached copy (tag `vip-sale`).
 * - `wp ndm vip-sale-import` creates the page once, from the site's built-in copy.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_VIP_SALE_META', '_ndm_vip_sale' );
// The value of the page's "Template" (post meta `_wp_page_template`).
define( 'NDM_VIP_SALE_TEMPLATE', 'ndm-vip-sale' );
define( 'NDM_VIP_SALE_SLUG', 'vip-sale' );

/*
 * ---------------------------------------------------------------------------------------------
 * Which page is the VIP Sale page
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The pages that carry the "VIP Sale page" template (the trash left out): a published one first, then
 * the oldest. There should be exactly one.
 *
 * @return int[]
 */
function ndm_headless_vip_sale_templated() {
	$ids = get_posts(
		array(
			'post_type'        => 'page',
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 20,
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'fields'           => 'ids',
			'meta_key'         => '_wp_page_template', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a handful of pages.
			'meta_value'       => NDM_VIP_SALE_TEMPLATE, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- a handful of pages.
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
 * The VIP Sale page: the page with the "VIP Sale page" template, else the top-level page whose slug
 * is `vip-sale`. 0 when there is none.
 *
 * @return int
 */
function ndm_headless_vip_sale_page_id() {
	$templated = ndm_headless_vip_sale_templated();
	if ( $templated ) {
		return $templated[0];
	}

	$by_slug = get_posts(
		array(
			'post_type'        => 'page',
			'name'             => NDM_VIP_SALE_SLUG,
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
 * Whether this post is the VIP Sale page.
 *
 * @param WP_Post|int|null $post Post or post ID.
 * @return bool
 */
function ndm_headless_is_vip_sale_page( $post ) {
	$post = get_post( $post );

	return $post instanceof WP_Post && 'page' === $post->post_type && ndm_headless_vip_sale_page_id() === (int) $post->ID;
}

/**
 * "VIP Sale page" is offered as a template of pages (Page Attributes), whatever the active theme.
 *
 * @param string[] $templates Templates by file name.
 * @return string[]
 */
function ndm_headless_vip_sale_template( $templates ) {
	$templates[ NDM_VIP_SALE_TEMPLATE ] = 'VIP Sale page';

	return $templates;
}
add_filter( 'theme_page_templates', 'ndm_headless_vip_sale_template' );

/**
 * The VIP Sale page has no block editor; every other page keeps its own.
 *
 * @param bool    $use  Whether the block editor is used.
 * @param WP_Post $post The post being edited.
 * @return bool
 */
function ndm_headless_vip_sale_no_block_editor( $use, $post ) {
	return $use && $post instanceof WP_Post && 'page' === $post->post_type && ndm_headless_is_vip_sale_page( $post ) ? false : $use;
}
add_filter( 'use_block_editor_for_post', 'ndm_headless_vip_sale_no_block_editor', 20, 2 );

/**
 * The edit screen uses the fields of the Concerns post type: their styles and script load on the VIP
 * Sale page's edit screen, and on no other page's.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_vip_sale_field_types( $types ) {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	if ( $screen && 'page' === $screen->post_type && ndm_headless_is_vip_sale_page( get_post() ) ) {
		$types[] = 'page';
	}

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_vip_sale_field_types' );

/*
 * ---------------------------------------------------------------------------------------------
 * The fields
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Every field of the VIP Sale page, grouped as the boxes of the edit screen, in page order.
 *
 * Field types are those of ndm_headless_concern_schema().
 *
 * @return array[]
 */
function ndm_headless_vip_sale_schema() {
	$heading_1 = array( 'label' => 'Heading, first line', 'type' => 'text' );
	$heading_2 = array( 'label' => 'Heading, second line (coloured)', 'type' => 'text' );
	$tokens    = 'These are filled in by the site: {{code}} (the checkout code of the sale in WooCommerce), {{max}} (the sale\'s headline percentage), {{dates}} ("Nov 27 to 30"), {{dates_long}} ("November 27 to 30"), {{dates_full}} ("Friday, Nov 27 to Monday, Nov 30"), {{end}} ("November 30"). A sentence whose number is not known is left out.';
	$category  = array( 'key' => 'category', 'label' => 'Price-list category (WooCommerce)', 'type' => 'product', 'only' => 'category', 'help' => 'Search the price list and pick a category.' );

	return array(
		array(
			'id'     => 'sale',
			'title'  => 'Sale Settings',
			'help'   => 'While WooCommerce holds a sale campaign (wp ndm-pricing campaign), the VIP Sale is its first phase: the campaign\'s dates, prices and checkout code are used, and once the phase is over this page sends visitors to the Black Friday page. The two dates below are used only when there is no campaign.',
			'fields' => array(
				array( 'key' => 'sale_name', 'label' => 'Name of the sale', 'type' => 'text', 'help' => 'Used in sentences such as "VIP Sale has ended". For example "VIP Sale".' ),
				array( 'key' => 'starts', 'label' => 'First minute', 'type' => 'text', 'help' => 'Toronto time, written as year-month-day hour:minute, for example 2026-11-27 00:00.' ),
				array( 'key' => 'ends', 'label' => 'Last minute', 'type' => 'text', 'help' => 'Toronto time, for example 2026-11-30 23:59.' ),
			),
		),
		array(
			'id'     => 'header',
			'title'  => 'Header',
			'help'   => 'The top of the page. "Up to N% off" beside the heading is the best percentage among the deals on the price list; the tickets and the countdown are the site\'s.',
			'fields' => array(
				array( 'key' => 'heading_1', 'help' => 'For example "VIP".' ) + $heading_1,
				array( 'key' => 'heading_2', 'help' => 'For example "Sale".' ) + $heading_2,
				array( 'key' => 'offer_words', 'label' => 'Words after "Up to N% off"', 'type' => 'text', 'help' => 'For example "selected treatments at NewDermaMed".' ),
				array( 'key' => 'intro', 'label' => 'Text under the heading', 'type' => 'textarea', 'help' => $tokens ),
				array( 'key' => 'gift', 'label' => 'Gift line under the header', 'type' => 'text', 'help' => 'For example "+$200 gift with your purchase · first 20 purchases · given in clinic". Information only: nothing is added to the cart. Empty: no line. It shows while the sale runs.' ),
				array( 'key' => 'photo', 'label' => 'Photo behind the countdown', 'type' => 'image', 'help' => 'A wide photo; it fades into the navy on the left and at the bottom. None: the clinic at night.' ),
				array( 'key' => 'tape', 'label' => 'Moving tapes', 'type' => 'lines', 'rows' => 6, 'help' => 'One line per phrase of the two moving strips under the header. ' . $tokens ),
			),
		),
		array(
			'id'     => 'seo',
			'title'  => 'Search Engines',
			'fields' => array(
				array( 'key' => 'seo_title', 'label' => 'Page title', 'type' => 'text', 'help' => $tokens ),
				array( 'key' => 'seo_description', 'label' => 'Description', 'type' => 'textarea', 'help' => $tokens ),
				array( 'key' => 'noindex', 'label' => 'Keep this page out of search engines (for a sale by invitation)', 'type' => 'checkbox' ),
			),
		),
		array(
			'id'     => 'how',
			'title'  => 'How It Works',
			'help'   => 'The row of numbered steps under the header. Three fit the row.',
			'fields' => array(
				array(
					'key'    => 'how',
					'label'  => 'Steps',
					'type'   => 'repeater',
					'add'    => 'Add a step',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Word', 'type' => 'text', 'help' => 'For example "Choose".' ),
						array( 'key' => 'text', 'label' => 'Line under it', 'type' => 'text', 'help' => 'For example "a concern or a treatment".' ),
					),
				),
			),
		),
		array(
			'id'     => 'concerns',
			'title'  => 'Step 1, Concerns',
			'help'   => 'The cards a visitor taps to shortlist the deals. Each card counts the deals of its categories by itself.',
			'fields' => array(
				array( 'key' => 'concerns_lead' ) + $heading_1,
				array( 'key' => 'concerns_strong' ) + $heading_2,
				array( 'key' => 'concerns_text', 'label' => 'Text beside the heading', 'type' => 'textarea' ),
				array(
					'key'    => 'concerns',
					'label'  => 'Concerns',
					'type'   => 'repeater',
					'add'    => 'Add a concern',
					'title'  => 'name',
					'fields' => array(
						array( 'key' => 'name', 'label' => 'Concern', 'type' => 'text', 'help' => 'For example "Lines and wrinkles".' ),
						array( 'key' => 'text', 'label' => 'Line under it', 'type' => 'text', 'help' => 'Qualified language only: "may", "can".' ),
						array(
							'key'    => 'categories',
							'label'  => 'Deals it shortlists',
							'type'   => 'repeater',
							'add'    => 'Add a category',
							'title'  => 'category',
							'fields' => array( $category ),
						),
					),
				),
			),
		),
		array(
			'id'     => 'deals',
			'title'  => 'Step 2, Deals',
			'help'   => 'One deal card per price-list category in the sale. While a sale campaign runs, a card shows exactly the lines WooCommerce has in the campaign, at its prices (single sessions and everything outside the sale are left out; a prescription product shows its name, quantity and price only). Without a campaign a card shows the lines that carry an offer, and prescription products are left out.',
			'fields' => array(
				array( 'key' => 'deals_lead' ) + $heading_1,
				array( 'key' => 'deals_strong' ) + $heading_2,
				array( 'key' => 'deals_text', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array(
					'key'    => 'groups',
					'label'  => 'Categories in the sale',
					'type'   => 'repeater',
					'add'    => 'Add a category',
					'title'  => 'tab',
					'help'   => 'The cards keep the order of the price list; the tabs keep the order they first appear in here.',
					'fields' => array(
						$category,
						array( 'key' => 'tab', 'label' => 'Tab', 'type' => 'text', 'help' => 'The tab the card sits under, for example "Laser". Categories with the same word share a tab.' ),
					),
				),
			),
		),
		array(
			'id'     => 'specials',
			'title'  => 'Sale Prices',
			'help'   => 'The moving row of tickets on the navy band, and the turning tickets in the header: the fixed sale prices of the campaign (a title, a quantity and WooCommerce\'s price, nothing else). Which lines show is the site\'s list.',
			'fields' => array(
				array( 'key' => 'specials_tag', 'label' => 'Section tag', 'type' => 'text', 'help' => 'For example "Six VIP specials".' ),
				array( 'key' => 'specials_lead' ) + $heading_1,
				array( 'key' => 'specials_strong' ) + $heading_2,
				array( 'key' => 'specials_count', 'label' => 'How many cards to show', 'type' => 'text', 'help' => 'A number from 0 to 12; 0 leaves the section out. Empty: 7.' ),
			),
		),
		array(
			'id'     => 'plan',
			'title'  => 'Step 3, My Plan',
			'fields' => array(
				array( 'key' => 'plan_lead' ) + $heading_1,
				array( 'key' => 'plan_strong' ) + $heading_2,
				array( 'key' => 'plan_note', 'label' => 'Note under the buttons', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'clinics',
			'title'  => 'Clinics',
			'help'   => 'The heading above the two clinic cards. Addresses, phone numbers and hours are the site\'s.',
			'fields' => array(
				array( 'key' => 'clinics_tag', 'label' => 'Section tag', 'type' => 'text' ),
				array( 'key' => 'clinics_lead' ) + $heading_1,
				array( 'key' => 'clinics_strong' ) + $heading_2,
			),
		),
		array(
			'id'     => 'footer',
			'title'  => 'Footer',
			'fields' => array(
				array( 'key' => 'footer_lead', 'label' => 'Closing line', 'type' => 'text', 'help' => 'For example "The VIP Sale ends". The site adds the last day under it.' ),
				array( 'key' => 'footer_text', 'label' => 'Text under it', 'type' => 'textarea' ),
				array( 'key' => 'footer_terms', 'label' => 'Terms of the sale', 'type' => 'textarea', 'rows' => 4, 'help' => 'The small print. ' . $tokens . ' The site ends it with "Individual results may vary." when that sentence is missing.' ),
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
function ndm_headless_vip_sale_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_vip_sale_schema() as $group ) {
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
function ndm_headless_vip_sale_content( $post_id ) {
	return ndm_headless_vip_sale_clean_all( get_post_meta( $post_id, NDM_VIP_SALE_META, true ) );
}

/**
 * A date of the sale as typed ("2026-11-27 00:00", Toronto time) as a moment, or 0 when it is not one.
 *
 * @param string $value The field.
 * @return int Unix time.
 */
function ndm_headless_vip_sale_time( $value ) {
	if ( ! preg_match( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', (string) $value ) ) {
		return 0;
	}

	$date = date_create_immutable_from_format( 'Y-m-d H:i', $value, new DateTimeZone( 'America/Toronto' ) );

	return $date && $date->format( 'Y-m-d H:i' ) === $value ? $date->getTimestamp() : 0;
}

/*
 * ---------------------------------------------------------------------------------------------
 * The edit screen
 * ---------------------------------------------------------------------------------------------
 */

/**
 * On the VIP Sale page: one box per section of the page under the title, and no text editor.
 *
 * @param WP_Post $post The page being edited.
 */
function ndm_headless_vip_sale_meta_boxes( $post ) {
	if ( ! ndm_headless_is_vip_sale_page( $post ) ) {
		return;
	}

	// For this request only: the page's content is the boxes, not the text editor.
	remove_post_type_support( 'page', 'editor' );

	$stored = null;

	foreach ( ndm_headless_vip_sale_schema() as $group ) {
		add_meta_box(
			'ndm-vip-sale-' . $group['id'],
			$group['title'],
			function ( $post ) use ( $group, &$stored ) {
				if ( null === $stored ) {
					$stored = ndm_headless_vip_sale_content( $post->ID );
					wp_nonce_field( 'ndm_vip_sale_save', 'ndm_vip_sale_nonce' );
				}

				if ( ! empty( $group['help'] ) ) {
					echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
				}

				foreach ( $group['fields'] as $field ) {
					ndm_headless_concern_field( $field, 'ndm_vip_sale[' . $field['key'] . ']', $stored[ $field['key'] ] );
				}
			},
			'page',
			'normal',
			'high'
		);
	}
}
add_action( 'add_meta_boxes_page', 'ndm_headless_vip_sale_meta_boxes' );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_vip_sale_intro( $post ) {
	if ( ! ndm_headless_is_vip_sale_page( $post ) ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $site ) {
		$url = $site . '/' . NDM_VIP_SALE_SLUG;
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shows these settings once published; until then the site shows its built-in copy)' ) . '</p>';
	}
	echo '<p>This is the site\'s VIP Sale page: it is recognised by its template "VIP Sale page" (Page Attributes), so the title and the slug above are only its name in the admin; the address on the site is always /vip-sale. Not typed here, because the site reads them from WooCommerce: every deal, price, saving and offer, "up to N%", and the specials. A field left empty keeps the site\'s built-in words.</p>';
	echo '<p>Dates, offers and terms need Raymond\'s written approval before the page is shown to the public. Every save is kept under Revisions, fields included.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_vip_sale_intro' );

/**
 * Saves the fields of the edit screen. It runs on `post_updated` before WordPress stores the page's
 * revision (priority 10), so the revision made by this save holds the fields as they were just saved.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_vip_sale_save( $post_id ) {
	if ( ! isset( $_POST['ndm_vip_sale_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_vip_sale_nonce'] ) ), 'ndm_vip_sale_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) || ! ndm_headless_is_vip_sale_page( $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_vip_sale_clean_all().
	$input = isset( $_POST['ndm_vip_sale'] ) ? wp_unslash( $_POST['ndm_vip_sale'] ) : array();

	update_post_meta( $post_id, NDM_VIP_SALE_META, wp_slash( ndm_headless_vip_sale_clean_all( $input ) ) );

	// A page recognised by its slug alone gets the template, so a later rename cannot lose it.
	if ( NDM_VIP_SALE_TEMPLATE !== get_post_meta( $post_id, '_wp_page_template', true ) ) {
		update_post_meta( $post_id, '_wp_page_template', NDM_VIP_SALE_TEMPLATE );
	}
}
add_action( 'post_updated', 'ndm_headless_vip_sale_save', 5 );

/**
 * The list of pages marks the VIP Sale page.
 *
 * @param string[] $states Labels after the title.
 * @param WP_Post  $post   The page.
 * @return string[]
 */
function ndm_headless_vip_sale_post_state( $states, $post ) {
	if ( 'page' === $post->post_type && ndm_headless_is_vip_sale_page( $post ) ) {
		$states['ndm_vip_sale'] = 'VIP Sale page of the site';
	}

	return $states;
}
add_filter( 'display_post_states', 'ndm_headless_vip_sale_post_state', 10, 2 );

/**
 * What is wrong with the VIP Sale page, in words for the admin; empty when it is in order, and when
 * there is no such page (a sale page is optional: the site then shows its built-in copy).
 *
 * @return string[]
 */
function ndm_headless_vip_sale_problems() {
	$id = ndm_headless_vip_sale_page_id();

	if ( ! $id ) {
		return array();
	}

	$problems  = array();
	$templated = ndm_headless_vip_sale_templated();
	$name      = '"' . get_the_title( $id ) . '"';
	$content   = ndm_headless_vip_sale_content( $id );

	if ( 'publish' !== get_post_status( $id ) ) {
		$problems[] = 'The VIP Sale page ' . $name . ' is not published, so /vip-sale shows the site\'s built-in copy until it is.';
	}

	if ( count( $templated ) > 1 ) {
		$problems[] = count( $templated ) . ' pages have the template "VIP Sale page". The site shows ' . $name . ' (page ' . $id . '); set the others to another template.';
	}

	if ( ! $templated ) {
		$problems[] = 'The VIP Sale page ' . $name . ' is recognised by its slug "vip-sale" only. Save it once (or choose the template "VIP Sale page") so that renaming it cannot lose it.';
	}

	$starts = ndm_headless_vip_sale_time( $content['starts'] );
	$ends   = ndm_headless_vip_sale_time( $content['ends'] );
	if ( '' !== $content['starts'] . $content['ends'] && ( ! $starts || ! $ends ) ) {
		$problems[] = 'The dates of the VIP Sale cannot be read, so the site shows its built-in dates. Write both as year-month-day hour:minute, for example 2026-11-27 00:00.';
	} elseif ( $starts && $ends && $ends <= $starts ) {
		$problems[] = 'The VIP Sale ends before it starts, so the site shows its built-in dates. Correct the first and last minute under Sale Settings.';
	}

	return $problems;
}

/**
 * The Pages screens say when the VIP Sale page is unpublished, doubled, or its dates cannot be used.
 */
function ndm_headless_vip_sale_notices() {
	$screen = get_current_screen();

	if ( ! $screen || 'page' !== $screen->post_type || ! in_array( $screen->base, array( 'edit', 'post' ), true ) || ! current_user_can( 'edit_pages' ) ) {
		return;
	}

	// On a page's own edit screen only that page's trouble is shown, on the VIP Sale page itself.
	if ( 'post' === $screen->base && ! ndm_headless_is_vip_sale_page( get_post() ) ) {
		return;
	}

	foreach ( ndm_headless_vip_sale_problems() as $problem ) {
		echo '<div class="notice notice-warning"><p><strong>VIP Sale page:</strong> ' . esc_html( $problem ) . '</p></div>';
	}
}
add_action( 'admin_notices', 'ndm_headless_vip_sale_notices' );

/*
 * ---------------------------------------------------------------------------------------------
 * Revisions
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The fields are kept with every revision of a page.
 *
 * @param string[] $keys      Meta keys kept in revisions.
 * @param string   $post_type Post type.
 * @return string[]
 */
function ndm_headless_vip_sale_revision_keys( $keys, $post_type ) {
	if ( 'page' === $post_type ) {
		$keys[] = NDM_VIP_SALE_META;
	}

	return $keys;
}
add_filter( 'wp_post_revision_meta_keys', 'ndm_headless_vip_sale_revision_keys', 10, 2 );

/**
 * The revisions screen of the VIP Sale page compares the fields too.
 *
 * @param string[] $fields Fields compared, by key.
 * @param array    $post   The page (or a revision of it).
 * @return string[]
 */
function ndm_headless_vip_sale_revision_fields( $fields, $post ) {
	$id     = isset( $post['ID'] ) ? (int) $post['ID'] : 0;
	$parent = $id ? wp_is_post_revision( $id ) : 0;

	if ( $id && ndm_headless_is_vip_sale_page( $parent ? $parent : $id ) ) {
		$fields['ndm_vip_sale'] = 'VIP Sale page fields';
	}

	return $fields;
}
add_filter( '_wp_post_revision_fields', 'ndm_headless_vip_sale_revision_fields', 10, 2 );

/**
 * The fields of a revision (or of the page as it is now) as text. The lines are written by the About
 * page's ndm_headless_about_revision_lines().
 *
 * @param string  $value    Unused: a page has no such column.
 * @param string  $field    Field key.
 * @param WP_Post $revision The revision, or the page.
 * @return string
 */
function ndm_headless_vip_sale_revision_text( $value, $field, $revision ) {
	if ( ! $revision instanceof WP_Post ) {
		return '';
	}

	$content = ndm_headless_vip_sale_content( $revision->ID );
	$lines   = array();

	foreach ( ndm_headless_vip_sale_schema() as $group ) {
		$lines[] = '== ' . $group['title'] . ' ==';
		foreach ( $group['fields'] as $one ) {
			$lines = array_merge( $lines, ndm_headless_about_revision_lines( $one, 'checkbox' === $one['type'] ? ( $content[ $one['key'] ] ? 'yes' : 'no' ) : $content[ $one['key'] ] ) );
		}
		$lines[] = '';
	}

	return implode( "\n", $lines );
}
add_filter( '_wp_post_revision_field_ndm_vip_sale', 'ndm_headless_vip_sale_revision_text', 10, 3 );

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
function ndm_headless_vip_sale_answer( $post ) {
	$content = ndm_headless_vip_sale_content( $post->ID );

	// The header photo only: the category picks stay as they are stored ("category:<slug>").
	$content['photo'] = ndm_headless_concern_image( (int) $content['photo'] );

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
function ndm_headless_vip_sale_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/vip-sale-page',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_vip_sale_rest',
			// Public on purpose: it holds only what the public page shows.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_vip_sale_routes' );

/**
 * GET ndm/v1/vip-sale-page: the published VIP Sale page. 404 when there is no such page or it is not
 * published (the site then shows its built-in copy).
 *
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_vip_sale_rest() {
	$post = get_post( ndm_headless_vip_sale_page_id() );

	if ( ! $post instanceof WP_Post ) {
		return new WP_Error( 'ndm_vip_sale_missing', 'No page has the template "VIP Sale page" or the slug "vip-sale".', array( 'status' => 404 ) );
	}

	// A page behind a password is not public either.
	if ( 'publish' !== $post->post_status || '' !== $post->post_password ) {
		return new WP_Error( 'ndm_vip_sale_unpublished', 'The VIP Sale page is not published.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_vip_sale_answer( $post ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "the VIP Sale page changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_vip_sale_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_vip_sale_notify_frontend' );
}

/**
 * A page was saved, trashed, restored or deleted: any of them can be, become or stop being the VIP Sale page.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_vip_sale_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( 'page' === get_post_type( $post_id ) ) {
		ndm_headless_vip_sale_changed();
	}
}
add_action( 'save_post', 'ndm_headless_vip_sale_post_changed' );
add_action( 'trashed_post', 'ndm_headless_vip_sale_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_vip_sale_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_vip_sale_post_changed' );

/**
 * The page's fields or its template changed (both are post meta).
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_vip_sale_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( in_array( $meta_key, array( NDM_VIP_SALE_META, '_wp_page_template' ), true ) && ! wp_is_post_revision( $post_id ) ) {
		ndm_headless_vip_sale_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_vip_sale_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_vip_sale_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_vip_sale_meta_changed', 10, 3 );

/**
 * Asks the Next.js server to clear its cached VIP Sale page. Fire and forget: a site that is down or
 * not configured never slows WordPress or fails a save.
 */
function ndm_headless_vip_sale_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'vip-sale' ) ),
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
	 * Creates the VIP Sale page (a standard page with the template "VIP Sale page") from JSON on
	 * standard input:
	 *
	 *   { "title": "VIP Sale", "status": "draft",
	 *     "content": { ...the fields of the edit screen; the photo is a file path under the import folder
	 *                  (or { "file", "alt" }); a category is "category:<slug>"... } }
	 *
	 * When a VIP Sale page already exists, or a page with the slug "vip-sale" (in any state, the trash
	 * included), nothing is created, so running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo path is relative to.
	 *
	 * [--status=<status>]
	 * : "publish" or "draft"; default: the JSON's "status", else "draft".
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-vip-sale.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm vip-sale-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm vip-sale-import',
		function ( $args, $assoc_args ) {
			$page = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $page ) || empty( $page['content'] ) || ! is_array( $page['content'] ) ) {
				WP_CLI::error( 'Expected the page as JSON on standard input: { "title", "content" }.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo path is relative to: --images=<dir>.' );
			}

			$status = isset( $assoc_args['status'] ) ? (string) $assoc_args['status'] : ( isset( $page['status'] ) ? (string) $page['status'] : 'draft' );
			if ( ! in_array( $status, array( 'publish', 'draft' ), true ) ) {
				WP_CLI::error( 'The status is "publish" or "draft".' );
			}

			$existing = ndm_headless_vip_sale_page_id();
			// A trashed page keeps its slug as "vip-sale__trashed".
			foreach ( array( NDM_VIP_SALE_SLUG, NDM_VIP_SALE_SLUG . '__trashed' ) as $name ) {
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
			if ( $existing ) {
				WP_CLI::log( "Kept: the VIP Sale page (page {$existing}) already exists." );
				return;
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$content = $page['content'];
			foreach ( ndm_headless_vip_sale_schema() as $group ) {
				// The photo import of the Aptos page: a file of the import folder, or an https address.
				$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
			}

			// A category that is not on this WordPress's price list would be an empty pick: say so.
			foreach ( isset( $content['groups'] ) && is_array( $content['groups'] ) ? $content['groups'] : array() as $row ) {
				$slug = isset( $row['category'] ) ? preg_replace( '/^category:/', '', (string) $row['category'] ) : '';
				if ( '' !== $slug && ! get_term_by( 'slug', $slug, 'product_cat' ) ) {
					WP_CLI::warning( "The price list has no category \"{$slug}\": its deal card will not show." );
				}
			}

			$id = wp_insert_post(
				array(
					'post_type'   => 'page',
					'post_status' => $status,
					'post_name'   => NDM_VIP_SALE_SLUG,
					'post_title'  => wp_slash( isset( $page['title'] ) && '' !== trim( (string) $page['title'] ) ? trim( (string) $page['title'] ) : 'VIP Sale' ),
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				WP_CLI::error( $id->get_error_message() );
			}

			update_post_meta( $id, '_wp_page_template', NDM_VIP_SALE_TEMPLATE );
			update_post_meta( $id, NDM_VIP_SALE_META, wp_slash( ndm_headless_vip_sale_clean_all( $content ) ) );
			wp_save_post_revision( $id );

			WP_CLI::success( "Created the VIP Sale page (page {$id}, {$status})." );
		}
	);
}

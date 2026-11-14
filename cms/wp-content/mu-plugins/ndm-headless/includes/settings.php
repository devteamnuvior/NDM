<?php
/**
 * Site Settings: the general configuration of the Next.js site, one screen in the admin menu.
 *
 * - "Site Settings" (top-level admin menu, administrators only) has one tab per area of the site:
 *   Header (the announcement bar and the header bar), Menu (the header's menu items, the Procedures,
 *   Concerns and About panels, also shown in the phone menu) and Footer (the closing call, the film,
 *   the link columns, the contact line and the social links).
 * - Everything is one option, `ndm_site_settings` ({ content, modified }). The fields are listed once,
 *   in ndm_headless_settings_schema(); the screen, the saving, the REST answer and the import read that
 *   list. The fields themselves (their look, cleaning and photo picker) are the ones of the Concerns
 *   post type (includes/concerns.php).
 * - What stays in the site's code because other parts of the site share it: the two clinics (names,
 *   addresses, hours, phone numbers), the logo, the legal links, the site search's list.
 * - `GET ndm/v1/site-settings` gives the saved settings. Before anything is saved it answers 404
 *   (`ndm_settings_empty`) and the site uses its built-in header and footer.
 * - A save tells the Next.js site to drop its cached copy (tag `site-settings`).
 * - `wp ndm settings-import` fills the settings once, from the site's built-in header and footer.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_SETTINGS_OPTION', 'ndm_site_settings' );
define( 'NDM_SETTINGS_PAGE', 'ndm-site-settings' );
define( 'NDM_SETTINGS_TAG', 'site-settings' );

/*
 * ---------------------------------------------------------------------------------------------
 * The fields
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The tabs of the screen, in order: id => name.
 *
 * @return string[]
 */
function ndm_headless_settings_tabs() {
	return array(
		'header' => 'Header',
		'menu'   => 'Menu',
		'footer' => 'Footer',
	);
}

/**
 * Every field, grouped as the boxes of the screen; each box belongs to one tab.
 *
 * Field types are those of ndm_headless_concern_schema().
 *
 * @return array[]
 */
function ndm_headless_settings_schema() {
	$link_help = 'A page of the site ("/pricing", "/about#clinics"), a placeholder ("#/book" opens the booking form) or a full address.';

	return array(
		array(
			'id'     => 'announcement',
			'tab'    => 'header',
			'title'  => 'Announcement Bar',
			'help'   => 'The blue bar above the header. The clinic phone numbers at its left (wide screens) are the site\'s, the same on every page.',
			'fields' => array(
				array( 'key' => 'announce_hide', 'label' => 'Hide the announcement bar', 'type' => 'checkbox', 'help' => 'The header then sits at the top of the window.' ),
				array( 'key' => 'announce_badge', 'label' => 'Badge before the messages', 'type' => 'text', 'help' => 'For example "New". Empty: no badge.' ),
				array( 'key' => 'announce_seconds', 'label' => 'Seconds each message stays', 'type' => 'text', 'help' => 'A number from 2 to 20, for example "4.8". Empty: 4.8.' ),
				array(
					'key'    => 'announce_desktop',
					'label'  => 'Messages on wide screens',
					'type'   => 'repeater',
					'add'    => 'Add a message',
					'title'  => 'text',
					'help'   => 'Computers (1024px wide and up): the sentence, then its link. No message here: the phone messages show.',
					'fields' => array(
						array( 'key' => 'text', 'label' => 'Sentence', 'type' => 'text', 'help' => 'For example "New-patient offers this month, ".' ),
						array( 'key' => 'link_label', 'label' => 'Link words', 'type' => 'text', 'help' => 'For example "see current offers →".' ),
						array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => $link_help ),
					),
				),
				array(
					'key'    => 'announce_mobile',
					'label'  => 'Messages on phones and tablets',
					'type'   => 'repeater',
					'add'    => 'Add a message',
					'title'  => 'text',
					'help'   => 'Shorter messages; the whole line is the link. No message here: the wide-screen messages show. No message in either list: the bar is hidden.',
					'fields' => array(
						array(
							'key'     => 'kind',
							'label'   => 'Kind',
							'type'    => 'select',
							'options' => array( 'Message', 'Clinic phone numbers' ),
							'keeps_row' => true,
							'help'    => '"Clinic phone numbers" shows both clinics\' numbers (the other fields are not used).',
						),
						array( 'key' => 'text', 'label' => 'Words', 'type' => 'text' ),
						array( 'key' => 'link_label', 'label' => 'Words after them, in bold', 'type' => 'text', 'help' => 'Optional, for example "book →".' ),
						array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => $link_help ),
						array( 'key' => 'new_tab', 'label' => 'Opens in a new tab (with an arrow icon)', 'type' => 'checkbox' ),
					),
				),
				array( 'key' => 'shop_label', 'label' => 'Shop link at the right (wide screens)', 'type' => 'text', 'help' => 'For example "Shop skincare". Opens the skincare shop (Header Bar box). Empty: no link.' ),
			),
		),
		array(
			'id'     => 'header_bar',
			'tab'    => 'header',
			'title'  => 'Header Bar',
			'help'   => 'The bar with the logo, the menu and the buttons. The menu, its panels and the logo are the site\'s.',
			'fields' => array(
				array( 'key' => 'book_label', 'label' => 'Booking button', 'type' => 'text', 'help' => 'Empty: "Book Free Consultation". Also the button of the phone menu.' ),
				array( 'key' => 'book_short', 'label' => 'Booking button on phones', 'type' => 'text', 'help' => 'Empty: "Book".' ),
				array( 'key' => 'shop_link', 'label' => 'Skincare shop address', 'type' => 'text', 'help' => 'Opened by the menu\'s "Skincare shop", the phone menu and the announcement bar, in a new tab. Empty: the placeholder "#/shop" until the shop exists.' ),
			),
		),
		array(
			'id'     => 'menu_items',
			'tab'    => 'menu',
			'title'  => 'Main Menu',
			'help'   => 'The items across the header on computers, in this order, and the same items in the phone menu. No item: the built-in menu.',
			'fields' => array(
				array(
					'key'    => 'menu_items',
					'label'  => 'Items',
					'type'   => 'repeater',
					'add'    => 'Add an item',
					'title'  => 'label',
					'fields' => array(
						array( 'key' => 'label', 'label' => 'Words', 'type' => 'text' ),
						array(
							'key'       => 'kind',
							'label'     => 'Opens',
							'type'      => 'select',
							'options'   => array( 'Link', 'Procedures panel', 'Concerns panel', 'About panel', 'Skincare shop' ),
							'keeps_row' => true,
							'help'      => 'A panel opens under the header (on phones, a list that folds open). "Skincare shop" opens the address in Header > Header Bar in a new tab.',
						),
						array( 'key' => 'link', 'label' => 'Link ("Link" only)', 'type' => 'text', 'help' => $link_help . ' Empty: the page with this name.' ),
						array( 'key' => 'new_tab', 'label' => 'Opens in a new tab ("Link" only)', 'type' => 'checkbox' ),
					),
				),
			),
		),
		array(
			'id'     => 'menu_procedures',
			'tab'    => 'menu',
			'title'  => 'Procedures Panel',
			'help'   => 'Categories on the left; pointing at one shows its treatments. On computers a treatment with the same name as its category is left out of the list (the category\'s title links to it). No category: the built-in categories.',
			'fields' => array(
				array(
					'key'    => 'proc_categories',
					'label'  => 'Categories',
					'type'   => 'repeater',
					'add'    => 'Add a category',
					'title'  => 'label',
					'fields' => array(
						array( 'key' => 'label', 'label' => 'Name', 'type' => 'text' ),
						array( 'key' => 'link', 'label' => 'Title link', 'type' => 'text', 'help' => 'Where the big title links. Empty: the page with this name, if there is one (else the title is not a link).' ),
						array( 'key' => 'blurb', 'label' => 'Line under the title', 'type' => 'textarea' ),
						array(
							'key'       => 'layout',
							'label'     => 'Layout',
							'type'      => 'select',
							'options'   => array( 'Treatment list', 'Aptos (NAMICA card)' ),
							'keeps_row' => true,
							'help'      => '"Aptos": the first group\'s links under a "Treatment" title, ending with this category\'s own page, beside the NAMICA card (Aptos Card box).',
						),
						array(
							'key'    => 'groups',
							'label'  => 'Groups',
							'type'   => 'repeater',
							'add'    => 'Add a group',
							'title'  => 'title',
							'help'   => 'One group: one list. Two groups: two columns (for example Aesthetic and Medical Dermatology).',
							'fields' => array(
								array( 'key' => 'title', 'label' => 'Group title', 'type' => 'text', 'help' => 'Empty: no title.' ),
								array(
									'key'    => 'items',
									'label'  => 'Treatments',
									'type'   => 'repeater',
									'add'    => 'Add a treatment',
									'title'  => 'label',
									'fields' => array(
										array( 'key' => 'label', 'label' => 'Name', 'type' => 'text' ),
										array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'Empty: the page with this name (a published post with that slug, else a page of the site).' ),
									),
								),
							),
						),
					),
				),
				array( 'key' => 'proc_card_tag', 'label' => 'Photo card, small line', 'type' => 'text', 'help' => 'The card at the right, which opens the booking form. Empty: "Not sure where to start?"' ),
				array( 'key' => 'proc_card_title', 'label' => 'Photo card, title', 'type' => 'text', 'help' => 'Empty: "Free consultation & VISIA® skin analysis".' ),
				array( 'key' => 'proc_card_photo', 'label' => 'Photo card, photo', 'type' => 'image', 'help' => 'A tall photo. Empty: the built-in clinic photo.' ),
			),
		),
		array(
			'id'     => 'menu_aptos',
			'tab'    => 'menu',
			'title'  => 'Aptos Card',
			'help'   => 'The purple NAMICA card beside a category with the Aptos layout. Its spheres are the site\'s.',
			'fields' => array(
				array( 'key' => 'aptos_tag', 'label' => 'Small line', 'type' => 'text', 'help' => 'Empty: "NAMICA technology".' ),
				array( 'key' => 'aptos_title', 'label' => 'Title', 'type' => 'text', 'help' => 'Empty: "Biostimulation threads".' ),
				array( 'key' => 'aptos_subtitle', 'label' => 'Line under the title', 'type' => 'text', 'help' => 'Empty: no line.' ),
				array( 'key' => 'aptos_badge', 'label' => 'Badge', 'type' => 'text', 'help' => 'Empty: no badge.' ),
				array( 'key' => 'aptos_link', 'label' => 'Link', 'type' => 'text', 'help' => 'Empty: "/aptos-thread-lift".' ),
			),
		),
		array(
			'id'     => 'menu_concerns',
			'tab'    => 'menu',
			'title'  => 'Concerns Panel',
			'help'   => 'Up to four groups fit side by side. No group: the built-in groups.',
			'fields' => array(
				array( 'key' => 'concerns_title', 'label' => 'Title', 'type' => 'text', 'help' => 'Empty: "Concerns".' ),
				array( 'key' => 'concerns_text', 'label' => 'Line under the title', 'type' => 'textarea', 'help' => 'Empty: no line.' ),
				array(
					'key'    => 'concerns_groups',
					'label'  => 'Groups',
					'type'   => 'repeater',
					'add'    => 'Add a group',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Group title', 'type' => 'text' ),
						array(
							'key'    => 'items',
							'label'  => 'Concerns',
							'type'   => 'repeater',
							'add'    => 'Add a concern',
							'title'  => 'label',
							'fields' => array(
								array( 'key' => 'label', 'label' => 'Name', 'type' => 'text' ),
								array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'Empty: the page with this name (a published post with that slug, else a page of the site).' ),
							),
						),
					),
				),
				array( 'key' => 'concerns_card_tag', 'label' => 'Photo card, small line', 'type' => 'text', 'help' => 'Empty: "Not sure what you need?"' ),
				array( 'key' => 'concerns_card_title', 'label' => 'Photo card, title', 'type' => 'text', 'help' => 'Empty: "Start with a VISIA® skin analysis".' ),
				array( 'key' => 'concerns_card_photo', 'label' => 'Photo card, photo', 'type' => 'image', 'help' => 'Empty: the built-in clinic photo.' ),
			),
		),
		array(
			'id'     => 'menu_about',
			'tab'    => 'menu',
			'title'  => 'About Panel',
			'help'   => 'The links on the left and the two clinic cards. The clinics\' names, addresses, hours and phone numbers are the site\'s, the same on every page.',
			'fields' => array(
				array(
					'key'    => 'about_links',
					'label'  => 'Links',
					'type'   => 'repeater',
					'add'    => 'Add a link',
					'title'  => 'label',
					'help'   => 'No link: the built-in links.',
					'fields' => array(
						array( 'key' => 'label', 'label' => 'Words', 'type' => 'text' ),
						array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'Empty: the About page ("Blog" opens the blog, a name starting with "Policies" the privacy policy).' ),
					),
				),
				array( 'key' => 'about_photo_uptown', 'label' => 'Uptown clinic photo', 'type' => 'image', 'help' => 'A wide photo. Empty: the built-in photo.' ),
				array( 'key' => 'about_photo_downtown', 'label' => 'Downtown clinic photo', 'type' => 'image', 'help' => 'Empty: the built-in photo.' ),
				array( 'key' => 'about_card_link', 'label' => 'Clinic card link words', 'type' => 'text', 'help' => 'Empty: "About the clinic".' ),
			),
		),
		array(
			'id'     => 'closing',
			'tab'    => 'footer',
			'title'  => 'Closing Call',
			'help'   => 'The heading, text and buttons over the film at the top of the footer.',
			'fields' => array(
				array( 'key' => 'cta_lead', 'label' => 'Heading, first part (white)', 'type' => 'text', 'help' => 'Empty: "Confidence is your true beauty."' ),
				array( 'key' => 'cta_strong', 'label' => 'Heading, second part (blue)', 'type' => 'text', 'help' => 'Empty: "It’s time to reveal it."' ),
				array( 'key' => 'cta_text', 'label' => 'Text under the heading', 'type' => 'textarea', 'help' => 'Empty: no text.' ),
				array( 'key' => 'cta_book', 'label' => 'Booking button', 'type' => 'text', 'help' => 'Opens the booking form. Empty: "Book Free Consultation".' ),
				array( 'key' => 'cta_second_label', 'label' => 'Second button', 'type' => 'text', 'help' => 'For example "Explore Procedures". Empty: no second button.' ),
				array( 'key' => 'cta_second_link', 'label' => 'Second button\'s link', 'type' => 'text', 'help' => $link_help ),
			),
		),
		array(
			'id'     => 'film',
			'tab'    => 'footer',
			'title'  => 'Film',
			'help'   => 'The silent film behind the footer. It plays on its own, never for visitors who ask for reduced motion (they see the poster).',
			'fields' => array(
				array( 'key' => 'film_video', 'label' => 'Film address', 'type' => 'text', 'help' => 'An MP4 file (H.264, a few MB at most): upload it under Media and paste its address here. Empty: the built-in placeholder film.' ),
				array( 'key' => 'film_poster', 'label' => 'Poster', 'type' => 'image', 'help' => 'Shown while the film loads. A wide photo, 1920px across. Empty: the built-in placeholder.' ),
			),
		),
		array(
			'id'     => 'brand',
			'tab'    => 'footer',
			'title'  => 'About The Clinic',
			'help'   => 'The first column of the glass card, under the logo.',
			'fields' => array(
				array( 'key' => 'about_text', 'label' => 'Text under the logo', 'type' => 'textarea', 'help' => 'Empty: no text.' ),
				array( 'key' => 'badge_award', 'label' => 'First badge (award icon)', 'type' => 'text', 'help' => 'For example "Top Choice Award". Empty: no badge.' ),
				array( 'key' => 'badge_years', 'label' => 'Second badge (check icon)', 'type' => 'text', 'help' => 'For example "16+ years of care". Empty: no badge.' ),
			),
		),
		array(
			'id'     => 'columns',
			'tab'    => 'footer',
			'title'  => 'Link Columns',
			'help'   => 'The columns of links between the clinic and the contact column. Two fit the row on wide screens.',
			'fields' => array(
				array(
					'key'    => 'columns',
					'label'  => 'Columns',
					'type'   => 'repeater',
					'add'    => 'Add a column',
					'title'  => 'title',
					'help'   => 'No column: the built-in columns show.',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Column title', 'type' => 'text', 'help' => 'For example "Quick links".' ),
						array(
							'key'    => 'links',
							'label'  => 'Links',
							'type'   => 'repeater',
							'add'    => 'Add a link',
							'title'  => 'label',
							'fields' => array(
								array( 'key' => 'label', 'label' => 'Words', 'type' => 'text' ),
								array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => $link_help . ' Empty: the page with this name, once it exists.' ),
							),
						),
					),
				),
			),
		),
		array(
			'id'     => 'contact',
			'tab'    => 'footer',
			'title'  => 'Get In Touch',
			'help'   => 'The last column. The two clinics (names, addresses, phone numbers) are the site\'s, the same on every page.',
			'fields' => array(
				array( 'key' => 'contact_title', 'label' => 'Column title', 'type' => 'text', 'help' => 'Empty: "Get in touch".' ),
				array( 'key' => 'email', 'label' => 'Email address', 'type' => 'text', 'help' => 'Empty: no email line.' ),
			),
		),
		array(
			'id'     => 'bottom',
			'tab'    => 'footer',
			'title'  => 'Bottom Line',
			'help'   => 'The line under the card. The Privacy, Terms and Refunds links are the site\'s.',
			'fields' => array(
				array( 'key' => 'copyright', 'label' => 'Copyright line', 'type' => 'text', 'help' => 'For example "© 2026 NewDermaMed. Medical treatments by licensed providers." Empty: no line.' ),
				array( 'key' => 'social_instagram', 'label' => 'Instagram address', 'type' => 'text', 'help' => 'Each social address shows its icon; empty: no icon.' ),
				array( 'key' => 'social_facebook', 'label' => 'Facebook address', 'type' => 'text' ),
				array( 'key' => 'social_youtube', 'label' => 'YouTube address', 'type' => 'text' ),
				array( 'key' => 'social_x', 'label' => 'X address', 'type' => 'text' ),
				array( 'key' => 'social_linkedin', 'label' => 'LinkedIn address', 'type' => 'text' ),
			),
		),
	);
}

/**
 * Cleans the settings: every field of the schema, nothing else.
 *
 * @param mixed $input Raw values by field key.
 * @return array
 */
function ndm_headless_settings_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_settings_schema() as $group ) {
		foreach ( $group['fields'] as $field ) {
			$clean[ $field['key'] ] = ndm_headless_concern_clean( $field, isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null );
		}
	}

	return $clean;
}

/**
 * The saved option, or null before the first save.
 *
 * @return array|null { content, modified }
 */
function ndm_headless_settings_stored() {
	$stored = get_option( NDM_SETTINGS_OPTION, null );

	return is_array( $stored ) && isset( $stored['content'] ) && is_array( $stored['content'] ) ? $stored : null;
}

/**
 * The settings, complete (missing fields come back empty).
 *
 * @return array
 */
function ndm_headless_settings_content() {
	$stored = ndm_headless_settings_stored();

	return ndm_headless_settings_clean_all( $stored ? $stored['content'] : array() );
}

/**
 * Saves the settings and tells the site.
 *
 * @param array $content Cleaned settings.
 */
function ndm_headless_settings_store( $content ) {
	$value = array(
		'content'  => ndm_headless_settings_clean_all( $content ),
		'modified' => gmdate( 'Y-m-d H:i:s' ),
	);

	// Not loaded on every request: only the REST route and this screen read it.
	if ( null === ndm_headless_settings_stored() ) {
		delete_option( NDM_SETTINGS_OPTION );
		add_option( NDM_SETTINGS_OPTION, $value, '', false );
	} else {
		update_option( NDM_SETTINGS_OPTION, $value, false );
	}

	ndm_headless_settings_changed();
}

/*
 * ---------------------------------------------------------------------------------------------
 * The screen
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The menu item.
 */
function ndm_headless_settings_menu() {
	add_menu_page(
		'Site Settings',
		'Site Settings',
		'manage_options',
		NDM_SETTINGS_PAGE,
		'ndm_headless_settings_screen',
		'dashicons-admin-settings',
		61
	);
}
add_action( 'admin_menu', 'ndm_headless_settings_menu' );

/**
 * The screen loads the fields' styles and script (rows, photo picker) of the Concerns edit screen.
 *
 * @param string[] $hooks Admin pages that carry the fields.
 * @return string[]
 */
function ndm_headless_settings_field_screens( $hooks ) {
	$hooks[] = 'toplevel_page_' . NDM_SETTINGS_PAGE;
	return $hooks;
}
add_filter( 'ndm_headless_field_screens', 'ndm_headless_settings_field_screens' );

/**
 * The tab shown: the one in the address, or the first.
 *
 * @return string
 */
function ndm_headless_settings_current_tab() {
	$tabs = ndm_headless_settings_tabs();
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- choosing a tab changes nothing.
	$tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : '';

	return isset( $tabs[ $tab ] ) ? $tab : (string) array_key_first( $tabs );
}

/**
 * Prints the screen.
 */
function ndm_headless_settings_screen() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$tab     = ndm_headless_settings_current_tab();
	$stored  = ndm_headless_settings_stored();
	$content = ndm_headless_settings_content();
	$base    = admin_url( 'admin.php?page=' . NDM_SETTINGS_PAGE );
	$site    = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

	echo '<div class="wrap ndm-settings">';
	echo '<h1>Site Settings</h1>';

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- only shows the result of the save that redirected here.
	if ( isset( $_GET['updated'] ) ) {
		echo '<div class="notice notice-success is-dismissible"><p>Settings saved. The site shows them within a few seconds.</p></div>';
	}

	echo '<div class="ndm-cn-intro">';
	echo '<p>The general settings of the site' . ( '' !== $site ? ' (<a href="' . esc_url( $site ) . '" target="_blank" rel="noopener">' . esc_html( $site ) . '</a>)' : '' ) . ', the same on every page. Each tab is saved on its own.</p>';
	if ( ! $stored ) {
		echo '<p><strong>Nothing is saved yet, so the site shows its built-in header and footer.</strong> The first save replaces all of them, so fill in both tabs (or ask a developer to run <code>wp ndm settings-import</code>, which fills them with the site\'s current words).</p>';
	} else {
		echo '<p>Last saved ' . esc_html( mysql2date( 'F j, Y \a\t g:i a', get_date_from_gmt( $stored['modified'] ) ) ) . '.</p>';
	}
	echo '</div>';

	echo '<nav class="nav-tab-wrapper">';
	foreach ( ndm_headless_settings_tabs() as $id => $name ) {
		echo '<a href="' . esc_url( add_query_arg( 'tab', $id, $base ) ) . '" class="nav-tab' . ( $id === $tab ? ' nav-tab-active' : '' ) . '"' . ( $id === $tab ? ' aria-current="page"' : '' ) . '>' . esc_html( $name ) . '</a>';
	}
	echo '</nav>';

	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
	echo '<input type="hidden" name="action" value="ndm_site_settings">';
	echo '<input type="hidden" name="ndm_tab" value="' . esc_attr( $tab ) . '">';
	wp_nonce_field( 'ndm_site_settings', 'ndm_settings_nonce' );

	echo '<div id="poststuff"><div class="ndm-settings-boxes">';
	foreach ( ndm_headless_settings_schema() as $group ) {
		if ( $group['tab'] !== $tab ) {
			continue;
		}
		echo '<div class="postbox" id="ndm-settings-' . esc_attr( $group['id'] ) . '">';
		echo '<div class="postbox-header"><h2 class="hndle">' . esc_html( $group['title'] ) . '</h2></div>';
		echo '<div class="inside">';
		if ( ! empty( $group['help'] ) ) {
			echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
		}
		foreach ( $group['fields'] as $field ) {
			ndm_headless_concern_field( $field, 'ndm_settings[' . $field['key'] . ']', $content[ $field['key'] ] );
		}
		echo '</div></div>';
	}
	echo '</div></div>';

	submit_button( 'Save ' . ndm_headless_settings_tabs()[ $tab ] . ' settings' );
	echo '</form></div>';
}

/**
 * A little room for the boxes on the settings screen.
 */
function ndm_headless_settings_styles() {
	$screen = get_current_screen();
	if ( ! $screen || 'toplevel_page_' . NDM_SETTINGS_PAGE !== $screen->id ) {
		return;
	}
	echo '<style>.ndm-settings .nav-tab-wrapper{margin:18px 0 0}.ndm-settings #poststuff{padding-top:16px;max-width:980px}.ndm-settings .postbox .inside{padding:4px 16px 8px}</style>';
}
add_action( 'admin_head', 'ndm_headless_settings_styles' );

/**
 * Saves the tab that was sent; the other tabs keep what they hold.
 */
function ndm_headless_settings_save() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'You are not allowed to change the site settings.', 403 );
	}
	check_admin_referer( 'ndm_site_settings', 'ndm_settings_nonce' );

	$tabs = ndm_headless_settings_tabs();
	$tab  = isset( $_POST['ndm_tab'] ) ? sanitize_key( wp_unslash( $_POST['ndm_tab'] ) ) : '';
	if ( ! isset( $tabs[ $tab ] ) ) {
		wp_die( 'Unknown settings tab.', 400 );
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_settings_clean_all().
	$input   = isset( $_POST['ndm_settings'] ) && is_array( $_POST['ndm_settings'] ) ? wp_unslash( $_POST['ndm_settings'] ) : array();
	$content = ndm_headless_settings_content();

	foreach ( ndm_headless_settings_schema() as $group ) {
		if ( $group['tab'] !== $tab ) {
			continue;
		}
		foreach ( $group['fields'] as $field ) {
			$content[ $field['key'] ] = isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null;
		}
	}

	ndm_headless_settings_store( $content );

	wp_safe_redirect(
		add_query_arg(
			array(
				'page'    => NDM_SETTINGS_PAGE,
				'tab'     => $tab,
				'updated' => 1,
			),
			admin_url( 'admin.php' )
		)
	);
	exit;
}
add_action( 'admin_post_ndm_site_settings', 'ndm_headless_settings_save' );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Registers the route.
 */
function ndm_headless_settings_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/site-settings',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_settings_rest',
			// Public on purpose: it holds only what every public page shows.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_settings_routes' );

/**
 * GET ndm/v1/site-settings: the saved settings, photos as { id, src, width, height, alt }. 404
 * (`ndm_settings_empty`) before the first save: the site then uses its built-in header and footer.
 *
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_settings_rest() {
	$stored = ndm_headless_settings_stored();

	if ( ! $stored ) {
		return new WP_Error( 'ndm_settings_empty', 'The site settings have not been saved yet.', array( 'status' => 404 ) );
	}

	$content = ndm_headless_settings_content();
	foreach ( ndm_headless_settings_schema() as $group ) {
		$content = ndm_headless_concern_expand( $group['fields'], $content );
	}

	return rest_ensure_response(
		array(
			'modified' => mysql_to_rfc3339( $stored['modified'] ),
			'content'  => $content,
		)
	);
}

/**
 * Queues one "the settings changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_settings_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_settings_notify_frontend' );
}

/**
 * The description (alternative text) of a photo the settings use changed in the media library.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_settings_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( '_wp_attachment_image_alt' !== $meta_key ) {
		return;
	}
	$content = ndm_headless_settings_stored() ? ndm_headless_settings_content() : null;
	$photos  = array( 'film_poster', 'proc_card_photo', 'concerns_card_photo', 'about_photo_uptown', 'about_photo_downtown' );
	if ( $content && in_array( (int) $post_id, array_map( 'intval', array_intersect_key( $content, array_flip( $photos ) ) ), true ) ) {
		ndm_headless_settings_changed();
	}
}
add_action( 'updated_post_meta', 'ndm_headless_settings_meta_changed', 10, 3 );
add_action( 'added_post_meta', 'ndm_headless_settings_meta_changed', 10, 3 );

/**
 * Asks the Next.js server to clear its cached settings. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_settings_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => NDM_SETTINGS_TAG ) ),
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
	 * Fills the site settings from the site's built-in header and footer (printed by
	 * web/scripts/export-site-settings.mjs). Settings that were saved already are kept; with
	 * --fill-empty only their empty fields are filled.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to (an https address is fetched instead).
	 *
	 * [--fill-empty]
	 * : When settings exist, fill only their empty fields.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-site-settings.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm settings-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm settings-import',
		function ( $args, $assoc_args ) {
			$given = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $given ) || empty( $given['content'] ) || ! is_array( $given['content'] ) ) {
				WP_CLI::error( 'Expected the settings as JSON on standard input: { "content" }.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			$content = $given['content'];
			$stored  = ndm_headless_settings_stored() ? ndm_headless_settings_content() : null;

			if ( null !== $stored ) {
				if ( empty( $assoc_args['fill-empty'] ) ) {
					WP_CLI::log( 'Kept: the site settings were saved already (use --fill-empty to fill their empty fields).' );
					return;
				}
				// A checkbox is never "empty": an unticked one was a choice.
				$empty   = array_filter(
					$stored,
					function ( $value ) {
						return false !== $value && ndm_headless_import_is_empty( $value );
					}
				);
				$content = array_filter(
					array_intersect_key( $content, $empty ),
					function ( $value ) {
						return ! ndm_headless_import_is_empty( $value );
					}
				);
				if ( ! $content ) {
					WP_CLI::success( 'Nothing to fill: every field of the site settings already holds something.' );
					return;
				}
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			foreach ( ndm_headless_settings_schema() as $group ) {
				// The photo import of the Aptos page: a file of the import folder, or an https address.
				$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
			}

			ndm_headless_settings_store( null !== $stored ? array_merge( $stored, $content ) : $content );
			WP_CLI::success( null !== $stored ? sprintf( 'Filled %d empty fields of the site settings.', count( $content ) ) : 'Saved the site settings.' );
		}
	);
}

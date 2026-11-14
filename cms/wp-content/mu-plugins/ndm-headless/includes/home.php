<?php
/**
 * The home page of the Next.js site (/).
 *
 * - The home page is an ordinary WordPress page: the one chosen under Settings > Reading > "Your
 *   homepage displays" > "A static page" > Homepage. No page ID is written anywhere; choosing another
 *   page there moves the home page's boxes (and the site's home page) to it.
 * - On that page only, the block editor and the page's own text box are switched off, and every
 *   section of the home page has a box under the title with its own words (one post meta, `_ndm_home`).
 *   The fields are listed once, in ndm_headless_home_schema(); the edit screen, the saving, the
 *   revisions, the REST answer and the import all read that list. The fields themselves (their look,
 *   cleaning and photo picker) are the ones of the Concerns post type (includes/concerns.php). Every
 *   other page keeps its normal editor.
 * - The words are kept in the page's revisions (WordPress's revisioned post meta): Revisions on the
 *   edit screen compares them box by box, and restoring a revision restores them.
 * - What the page shares with the rest of the site, or reads from elsewhere, lives in the site's code:
 *   the films, every price (WooCommerce), the
 *   team members, the before and after cases, the photos and links of How it works, the monthly
 *   specials (WooCommerce), the reviews and awards, the two clinics, the booking form, the journal
 *   posts and the reels.
 * - `GET ndm/v1/home-page` gives the published home page; it answers 404 with the reason when no page
 *   is chosen, the page is not published or it holds no home page words yet, and the site then shows
 *   its built-in copy.
 * - When the page, its words or the Reading setting change, the Next.js site is told to drop its
 *   cached copy (tag `home`).
 * - `wp ndm home-import` sets up the home page once, from the site's original content.
 * - `wp ndm home-migrate` moves the words of the former "Home Page" post type (`ndm_home`) to the page.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_HOME_META', '_ndm_home' );

/** The former post type of the home page: read by `wp ndm home-migrate` only. */
define( 'NDM_HOME_LEGACY_TYPE', 'ndm_home' );

/*
 * ---------------------------------------------------------------------------------------------
 * Which page is the home page
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The page chosen as the homepage under Settings > Reading, or 0 when the setting shows the latest
 * posts or names something that is not a page (any state: see ndm_headless_home_problem()).
 *
 * @return int
 */
function ndm_headless_home_page_id() {
	if ( 'page' !== get_option( 'show_on_front' ) ) {
		return 0;
	}

	$id = (int) get_option( 'page_on_front' );

	return $id && 'page' === get_post_type( $id ) ? $id : 0;
}

/**
 * Whether this post is the home page.
 *
 * @param WP_Post|int|null $post Post or ID.
 * @return bool
 */
function ndm_headless_home_is_front( $post ) {
	$id = $post instanceof WP_Post ? $post->ID : (int) $post;

	return $id > 0 && ndm_headless_home_page_id() === $id;
}

/**
 * Why the site cannot show the home page's words from WordPress, or null when it can.
 *
 * @return array|null { code, message } of the first problem found.
 */
function ndm_headless_home_problem() {
	if ( 'page' !== get_option( 'show_on_front' ) ) {
		return array(
			'code'    => 'ndm_home_not_set',
			'message' => 'No page is chosen as the homepage: Settings > Reading > "Your homepage displays" shows the latest posts.',
		);
	}

	$id = ndm_headless_home_page_id();
	if ( ! $id ) {
		return array(
			'code'    => 'ndm_home_missing',
			'message' => 'The page chosen as the homepage under Settings > Reading does not exist.',
		);
	}

	$status = get_post_status( $id );
	if ( 'publish' !== $status ) {
		return array(
			'code'    => 'ndm_home_unpublished',
			'message' => sprintf( 'The page chosen as the homepage ("%s") is not published (%s).', get_the_title( $id ), $status ),
		);
	}

	if ( ! metadata_exists( 'post', $id, NDM_HOME_META ) ) {
		return array(
			'code'    => 'ndm_home_empty',
			'message' => sprintf( 'The page chosen as the homepage ("%s") has no home page words saved yet.', get_the_title( $id ) ),
		);
	}

	return null;
}

/*
 * ---------------------------------------------------------------------------------------------
 * The fields
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Every field of the home page, grouped as the boxes of the edit screen, in page order.
 *
 * Field types are those of ndm_headless_concern_schema().
 *
 * @return array[]
 */
function ndm_headless_home_schema() {
	$tag  = array( 'label' => 'Section tag', 'type' => 'text', 'help' => 'The small label above the heading.' );
	$line = array( 'label' => 'Heading, first line', 'type' => 'text' );
	$blue = array( 'label' => 'Heading, second line (blue)', 'type' => 'text' );
	$text = array( 'label' => 'Text under the heading', 'type' => 'textarea' );
	$only = ' Other pages that show this section keep the site\'s words.';

	// A section's tag and two-line heading, with keys starting with $prefix.
	$head = function ( $prefix ) use ( $tag, $line, $blue ) {
		return array(
			array( 'key' => $prefix . '_tag' ) + $tag,
			array( 'key' => $prefix . '_lead' ) + $line,
			array( 'key' => $prefix . '_strong' ) + $blue,
		);
	};

	return array(
		array(
			'id'     => 'hero',
			'title'  => 'Header',
			'help'   => 'The words over the film at the top of the page. The film and the Book Free Consultation button are the site\'s.',
			'fields' => array(
				array( 'key' => 'hero_tagline', 'label' => 'Line above the heading', 'type' => 'text' ),
				array( 'key' => 'hero_lead', 'help' => 'For example "Refined,".' ) + $line,
				array( 'key' => 'hero_strong', 'help' => 'For example "not redone.".' ) + $blue,
				array( 'key' => 'hero_intro', 'rows' => 3 ) + $text,
				array( 'key' => 'hero_button', 'label' => 'Second button', 'type' => 'text', 'help' => 'It scrolls to "Where would you like to start?". For example "Find your treatment".' ),
				array(
					'key'    => 'hero_proof',
					'label'  => 'Points beside the heading',
					'type'   => 'repeater',
					'add'    => 'Add a point',
					'title'  => 'label',
					'help'   => 'Four fit the card.',
					'fields' => array(
						array( 'key' => 'icon', 'label' => 'Icon', 'type' => 'select', 'options' => array( 'Physician', 'Award', 'Clinics', 'Analysis' ) ),
						array( 'key' => 'label', 'label' => 'Words', 'type' => 'text', 'help' => 'For example "Two Toronto clinics".' ),
					),
				),
				array( 'key' => 'hero_brands', 'label' => 'Technology and brands in the moving band', 'type' => 'lines', 'help' => 'One name on each line.' ),
			),
		),
		array(
			'id'     => 'seo',
			'title'  => 'Search Engines',
			'fields' => array(
				array( 'key' => 'seo_title', 'label' => 'Page title', 'type' => 'text' ),
				array( 'key' => 'seo_description', 'label' => 'Description', 'type' => 'textarea', 'help' => 'Empty: no description is written.' ),
			),
		),
		array(
			'id'     => 'about',
			'title'  => 'About NewDermaMed',
			'help'   => 'The four clinic photos beside the words are the site\'s.',
			'fields' => array_merge(
				$head( 'about' ),
				array(
					array( 'key' => 'about_text', 'label' => 'Text under the heading', 'type' => 'textarea', 'rows' => 4, 'help' => 'It lights up word by word as the page scrolls.' ),
					array( 'key' => 'about_highlight', 'label' => 'Word in blue', 'type' => 'text', 'help' => 'One word of the text above, for example "NewDermaMed". Empty: none.' ),
					array(
						'key'    => 'about_stats',
						'label'  => 'Numbers',
						'type'   => 'repeater',
						'add'    => 'Add a number',
						'title'  => 'label',
						'help'   => 'Four fit the row. Each number counts up when it comes into view.',
						'fields' => array(
							array( 'key' => 'figure', 'label' => 'Number', 'type' => 'text', 'help' => 'A whole number, with a sign after it if needed: "16+" or "8".' ),
							array( 'key' => 'label', 'label' => 'Line under it', 'type' => 'text', 'help' => 'For example "Years in Toronto".' ),
						),
					),
				)
			),
		),
		array(
			'id'     => 'start',
			'title'  => 'Where To Start',
			'help'   => 'The heading and the photo panels below it. Each panel opens to show its concerns; each concern opens a card with the treatments that may help. Every price in a card comes from WooCommerce.',
			'fields' => array_merge(
				$head( 'start' ),
				array(
					array(
						'key'    => 'start_panels',
						'label'  => 'Panels',
						'type'   => 'repeater',
						'add'    => 'Add a panel',
						'title'  => 'title',
						'help'   => 'Four fit the row, in this order. No panel: the site shows its built-in panels.',
						'fields' => array(
							array( 'key' => 'title', 'label' => 'Title', 'type' => 'text', 'help' => 'On the panel, for example "Skin".' ),
							array( 'key' => 'sub', 'label' => 'Line under the title', 'type' => 'text', 'help' => 'For example "6 concerns" or "Free skin analysis".' ),
							array( 'key' => 'heading', 'label' => 'Heading when open', 'type' => 'text', 'help' => 'Empty: the title.' ),
							array( 'key' => 'text', 'label' => 'Text when open', 'type' => 'textarea' ),
							array( 'key' => 'image', 'label' => 'Photo', 'type' => 'image', 'help' => 'A tall photo works best. A panel without a photo is left out.' ),
							array( 'key' => 'position', 'label' => 'Photo focus, closed', 'type' => 'text', 'help' => 'Which part of the photo stays in view while the panel is narrow, for example "center 18%". Empty: the middle.' ),
							array( 'key' => 'position_open', 'label' => 'Photo focus, open', 'type' => 'text', 'help' => 'The same while the panel is open. Empty: as closed.' ),
							array(
								'key'    => 'concerns',
								'label'  => 'Concerns',
								'type'   => 'repeater',
								'add'    => 'Add a concern',
								'title'  => 'label',
								'help'   => 'The buttons of the open panel; each opens a card. A panel without concerns shows Book Free Consultation and the link below instead.',
								'fields' => array(
									array( 'key' => 'label', 'label' => 'Button', 'type' => 'text', 'help' => 'For example "Acne scars".' ),
									array( 'key' => 'title', 'label' => 'Card title', 'type' => 'text', 'help' => 'Empty: the button\'s words.' ),
									array( 'key' => 'lede', 'label' => 'Card text', 'type' => 'textarea' ),
									array(
										'key'    => 'options',
										'label'  => 'Treatments',
										'type'   => 'repeater',
										'add'    => 'Add a treatment',
										'title'  => 'name',
										'fields' => array(
											array( 'key' => 'price_source', 'label' => 'Product (WooCommerce)', 'type' => 'product', 'help' => 'Search the price list and pick the product (or a whole category): its lowest price shows as "From" and can only be changed in the price manager. Empty: priced by the name below when the price list has it, else "At consultation".' ),
											array( 'key' => 'name', 'label' => 'Name', 'type' => 'text', 'help' => 'Empty: the product\'s name.' ),
											array( 'key' => 'what', 'label' => 'Line under it', 'type' => 'text', 'help' => 'For example "Can restore volume right away". Use qualified language ("may", "can").' ),
											array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'For example "/aptos-thread-lift". Empty: the page with this name, once it exists.' ),
										),
									),
									array(
										'key'    => 'facts',
										'label'  => 'Facts',
										'type'   => 'repeater',
										'add'    => 'Add a fact',
										'title'  => 'term',
										'fields' => array(
											array( 'key' => 'term', 'label' => 'Label', 'type' => 'text', 'help' => 'For example "Downtime".' ),
											array( 'key' => 'text', 'label' => 'Text', 'type' => 'text' ),
										),
									),
									array( 'key' => 'note', 'label' => 'Small print', 'type' => 'textarea', 'help' => 'For example about prescription treatments. Never name a prescription drug beside a benefit.' ),
									array( 'key' => 'more_label', 'label' => 'Link at the bottom: words', 'type' => 'text', 'help' => 'For example "Compare these options".' ),
									array( 'key' => 'more_link', 'label' => 'Link at the bottom: address', 'type' => 'text', 'help' => 'For example "/wrinkles-fine-lines".' ),
								),
							),
							array( 'key' => 'link_label', 'label' => 'Link under the text (a panel without concerns): words', 'type' => 'text', 'help' => 'For example "About the skin analysis".' ),
							array( 'key' => 'link', 'label' => 'Link under the text (a panel without concerns): address', 'type' => 'text' ),
						),
					),
				)
			),
		),
		array(
			'id'     => 'treatments',
			'title'  => 'Treatments',
			'help'   => 'The heading, the category tabs and their cards. Every price on a card comes from WooCommerce.',
			'fields' => array_merge(
				$head( 'treat' ),
				array(
					array( 'key' => 'treat_text' ) + $text,
					array( 'key' => 'treat_all_tab', 'label' => 'First tab (every card): name', 'type' => 'text', 'help' => 'It shows the cards of all the tabs below. Empty: "All".' ),
					array( 'key' => 'treat_all_button', 'label' => 'First tab: button under the cards, words', 'type' => 'text', 'help' => 'Empty: "All treatments".' ),
					array( 'key' => 'treat_all_link', 'label' => 'First tab: button under the cards, address', 'type' => 'text', 'help' => 'Empty: "#/treatments".' ),
					array(
						'key'    => 'treat_tabs',
						'label'  => 'Tabs',
						'type'   => 'repeater',
						'add'    => 'Add a tab',
						'title'  => 'label',
						'help'   => 'One tab per category, in this order, after the first tab. No tab: the site shows its built-in tabs and cards.',
						'fields' => array(
							array( 'key' => 'label', 'label' => 'Tab name', 'type' => 'text', 'help' => 'For example "Injectables". A tab without a name is left out.' ),
							array( 'key' => 'all_label', 'label' => 'Button under the cards: words', 'type' => 'text', 'help' => 'For example "All injectables". Empty: no button on this tab.' ),
							array( 'key' => 'all_link', 'label' => 'Button under the cards: address', 'type' => 'text', 'help' => 'For example "/pricing".' ),
							array(
								'key'    => 'cards',
								'label'  => 'Cards',
								'type'   => 'repeater',
								'add'    => 'Add a card',
								'title'  => 'name',
								'help'   => 'Add a card, then search for its WooCommerce product. The card takes the product\'s name, short description, image and category; the fields below replace them only for this card when filled in.',
								'fields' => array(
									array( 'key' => 'price_source', 'label' => 'Product (WooCommerce)', 'type' => 'product', 'help' => 'Search the price list and pick the product (or a whole category): its lowest price shows as "From" and can only be changed in the price manager. Empty: priced by the title below when the price list has it, else no price.' ),
									array( 'key' => 'name', 'label' => 'Title', 'type' => 'text', 'help' => 'Empty: the product\'s name.' ),
									array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea', 'help' => 'Three lines fit. Empty: the product\'s short description. Use qualified language ("may", "can"), and never name a prescription drug beside a benefit.' ),
									array( 'key' => 'image', 'label' => 'Image', 'type' => 'image', 'help' => 'A landscape photo works best. Empty: the product\'s image. A card with no image at all is left out.' ),
									array( 'key' => 'tag', 'label' => 'Tag on the photo', 'type' => 'text', 'help' => 'For example "Injectables". Empty: the product\'s category, else the tab name.' ),
									array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'For example "/botox". Empty: the page with this title, once it exists.' ),
									array( 'key' => 'price_note', 'label' => 'Words instead of a price', 'type' => 'text', 'help' => 'Shown only when WooCommerce has no price for the card, for example "Free" or "Priced at consultation". Never type an amount here.' ),
								),
							),
						),
					),
				)
			),
		),
		array(
			'id'     => 'aptos',
			'title'  => 'Our Signature',
			'help'   => 'The Aptos section. The thread figure, the turning NAMICA badge and both buttons are the site\'s.',
			'fields' => array_merge(
				$head( 'aptos' ),
				array(
					array( 'key' => 'aptos_intro' ) + $text,
					array( 'key' => 'aptos_chip_before', 'label' => 'Chip on the figure: words before the number', 'type' => 'text', 'help' => 'For example "Up to".' ),
					array( 'key' => 'aptos_chip_number', 'label' => 'Chip on the figure: number', 'type' => 'text', 'help' => 'A whole number, for example "24". It counts up.' ),
					array( 'key' => 'aptos_chip_after', 'label' => 'Chip on the figure: words after the number', 'type' => 'text', 'help' => 'For example "months of lift and support". Use qualified language ("up to", "may").' ),
					array(
						'key'    => 'aptos_dials',
						'label'  => 'Dials',
						'type'   => 'repeater',
						'add'    => 'Add a dial',
						'title'  => 'label',
						'help'   => 'Three fit the row.',
						'fields' => array(
							array( 'key' => 'value', 'label' => 'Number', 'type' => 'text', 'help' => 'For example "60".' ),
							array( 'key' => 'unit', 'label' => 'Unit', 'type' => 'text', 'help' => 'For example "min".' ),
							array( 'key' => 'label', 'label' => 'Line under the dial', 'type' => 'text', 'help' => 'For example "Treatment time".' ),
							array( 'key' => 'spoken', 'label' => 'Read by screen readers', 'type' => 'text', 'help' => 'The whole fact, for example "About 60 minutes".' ),
							array( 'key' => 'fill', 'label' => 'Ring filled, in percent', 'type' => 'text', 'help' => 'A number from 0 to 100, for example "34".' ),
						),
					),
					array(
						'key'    => 'aptos_points',
						'label'  => 'Points',
						'type'   => 'repeater',
						'add'    => 'Add a point',
						'title'  => 'label',
						'fields' => array(
							array( 'key' => 'icon', 'label' => 'Icon', 'type' => 'select', 'options' => array( 'Check', 'Thread', 'Shield' ) ),
							array( 'key' => 'label', 'label' => 'Words', 'type' => 'text', 'help' => 'For example "No surgery, no incisions".' ),
						),
					),
					array( 'key' => 'areas_tag', 'label' => 'Treatment areas: tag', 'type' => 'text' ),
					array( 'key' => 'areas_lead', 'label' => 'Treatment areas: heading, first line', 'type' => 'text' ),
					array( 'key' => 'areas_strong', 'label' => 'Treatment areas: heading, second line (blue)', 'type' => 'text' ),
					array( 'key' => 'areas_text', 'label' => 'Treatment areas: text beside the heading', 'type' => 'textarea' ),
					array(
						'key'    => 'areas_photos',
						'label'  => 'Treatment areas: photos',
						'type'   => 'repeater',
						'add'    => 'Add a photo',
						'title'  => 'label',
						'help'   => 'Four fit the row. A row without a photo is left out. The description read by screen readers is the photo\'s "Alternative text" in the media library.',
						'fields' => array(
							array( 'key' => 'image', 'label' => 'Photo', 'type' => 'image' ),
							array( 'key' => 'label', 'label' => 'Line under the photo', 'type' => 'text', 'help' => 'For example "Marking · Front".' ),
						),
					),
				)
			),
		),
		array(
			'id'     => 'space',
			'title'  => 'Inside Our Clinics',
			'help'   => 'The words over the clinic film. The film and the two clinic names are the site\'s.',
			'fields' => $head( 'space' ),
		),
		array(
			'id'     => 'team',
			'title'  => 'Our Team',
			'help'   => 'The words beside the team portraits. The members, their photos and profiles are the site\'s.' . $only,
			'fields' => array_merge( $head( 'team' ), array( array( 'key' => 'team_text' ) + $text ) ),
		),
		array(
			'id'     => 'results',
			'title'  => 'Before And After',
			'help'   => 'The words above the compare cards. The cases and the "Individual results may vary" line are the site\'s.' . $only,
			'fields' => array_merge( $head( 'results' ), array( array( 'key' => 'results_text' ) + $text ) ),
		),
		array(
			'id'     => 'process',
			'title'  => 'How It Works',
			'help'   => 'The photos of the steps and where their buttons lead are the site\'s.' . $only,
			'fields' => array_merge(
				$head( 'process' ),
				array(
					array(
						'key'    => 'process_steps',
						'label'  => 'Steps',
						'type'   => 'repeater',
						'add'    => 'Add a step',
						'title'  => 'title',
						'help'   => 'The section has three steps, in this order: the consultation (its button opens the booking form), the plan (its button goes to the treatments) and the treatment (its button goes to the clinics). A fourth row is not shown.',
						'fields' => array(
							array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
							array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
							array( 'key' => 'button', 'label' => 'Button', 'type' => 'text' ),
						),
					),
				)
			),
		),
		array(
			'id'     => 'reviews',
			'title'  => 'Testimonials',
			'help'   => 'The heading above the row of reviews. The reviews, the Google rating and the award cards are the site\'s.' . $only,
			'fields' => array_merge( $head( 'reviews' ), array( array( 'key' => 'reviews_note', 'label' => 'Small line under the reviews', 'type' => 'text', 'help' => 'Keep "individual results may vary".' ) ) ),
		),
		array(
			'id'     => 'visit',
			'title'  => 'Our Clinics',
			'help'   => 'The heading above the two clinic cards. Addresses, phone numbers, hours and photos are the site\'s (the same on every page).',
			'fields' => array_merge( $head( 'visit' ), array( array( 'key' => 'visit_text' ) + $text ) ),
		),
		array(
			'id'     => 'faqs',
			'title'  => 'FAQ',
			'help'   => 'No question: the section is left out.',
			'fields' => array_merge(
				$head( 'faq' ),
				array(
					array( 'key' => 'faq_intro' ) + $text,
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
				)
			),
		),
		array(
			'id'     => 'booking',
			'title'  => 'Booking',
			'help'   => 'The words above the booking form. The form is the site\'s.' . $only,
			'fields' => array(
				array( 'key' => 'book_lead' ) + $line,
				array( 'key' => 'book_strong' ) + $blue,
				array( 'key' => 'book_text', 'label' => 'Text beside the heading', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'shop',
			'title'  => 'Skincare Shop',
			'help'   => 'The words, the shop\'s button and the products, all typed here (they are not read from WooCommerce).',
			'fields' => array_merge(
				$head( 'shop' ),
				array(
					array( 'key' => 'shop_text' ) + $text,
					array( 'key' => 'shop_button', 'label' => 'Button', 'type' => 'text', 'help' => 'It opens the skincare shop in a new tab. For example "Visit Skincare shop".' ),
					array( 'key' => 'shop_link', 'label' => 'Button address', 'type' => 'text', 'help' => 'For example "https://shop.newdermamedlaserclinic.com/shop/". Empty: that address.' ),
					array(
						'key'    => 'shop_products',
						'label'  => 'Products',
						'type'   => 'repeater',
						'add'    => 'Add a product',
						'title'  => 'name',
						'help'   => 'The first twelve show in the list (six on phones); every product also turns on the circle above the heading. A product without a name or a photo is left out. No product: the site shows its built-in products.',
						'fields' => array(
							array( 'key' => 'name', 'label' => 'Name', 'type' => 'text', 'help' => 'For example "Activ Retinol 0.5".' ),
							array( 'key' => 'size', 'label' => 'Line under the name', 'type' => 'text', 'help' => 'For example "30 ml".' ),
							array( 'key' => 'image', 'label' => 'Photo', 'type' => 'image', 'help' => 'A square photo of the product on white works best (it shows small).' ),
							array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => 'The product\'s page in the shop; it opens in a new tab. Empty: the button\'s address.' ),
						),
					),
				)
			),
		),
		array(
			'id'     => 'journal',
			'title'  => 'Journal',
			'help'   => 'The heading above the four articles. The articles are the site\'s.',
			'fields' => $head( 'journal' ),
		),
		array(
			'id'     => 'social',
			'title'  => 'Social',
			'help'   => 'The words beside the phone. The reels and the links to the accounts are the site\'s.' . $only,
			'fields' => array_merge(
				$head( 'social' ),
				array(
					array( 'key' => 'social_text' ) + $text,
					array( 'key' => 'social_button', 'label' => 'Button', 'type' => 'text', 'help' => 'It opens Instagram. For example "Follow along".' ),
					array( 'key' => 'social_note', 'label' => 'Small line under the buttons', 'type' => 'text', 'help' => 'Keep "Individual results may vary".' ),
				)
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
function ndm_headless_home_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_home_schema() as $group ) {
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
function ndm_headless_home_content( $post_id ) {
	return ndm_headless_home_clean_all( get_post_meta( $post_id, NDM_HOME_META, true ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * The edit screen (the home page only)
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The home page is edited in the classic edit screen: its boxes are not blocks.
 *
 * @param bool    $use  Whether the block editor is used.
 * @param WP_Post $post The post being edited.
 * @return bool
 */
function ndm_headless_home_block_editor( $use, $post ) {
	return ndm_headless_home_is_front( $post ) ? false : $use;
}
add_filter( 'use_block_editor_for_post', 'ndm_headless_home_block_editor', 100, 2 );

/**
 * The fields' styles and script (from the Concerns post type) load on the home page's edit screen.
 *
 * @param string[] $types Post types.
 * @return string[]
 */
function ndm_headless_home_field_types( $types ) {
	if ( ndm_headless_home_is_front( get_post() ) ) {
		$types[] = 'page';
	}

	return $types;
}
add_filter( 'ndm_headless_field_post_types', 'ndm_headless_home_field_types' );

/**
 * The page holding home page words that the boxes start from, when the home page has none yet: the
 * last edited other page with words (a former home page). 0 when there is none.
 *
 * @param int $home_id The home page.
 * @return int
 */
function ndm_headless_home_previous_page( $home_id ) {
	$pages = get_posts(
		array(
			'post_type'        => 'page',
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 1,
			'orderby'          => 'modified',
			'order'            => 'DESC',
			'fields'           => 'ids',
			'exclude'          => array( $home_id ),
			'meta_key'         => NDM_HOME_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- the edit screen of one page.
			'suppress_filters' => true,
		)
	);

	return $pages ? (int) $pages[0] : 0;
}

/**
 * On the home page: one box per section of the page under the title, and no text box of its own.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_home_meta_boxes( $post ) {
	if ( ! ndm_headless_home_is_front( $post ) ) {
		return;
	}

	// The page's own text and featured image are never shown on the site: only the boxes below are.
	// This request only: every other page keeps them.
	remove_post_type_support( 'page', 'editor' );
	remove_post_type_support( 'page', 'thumbnail' );
	remove_meta_box( 'postimagediv', 'page', 'side' );

	$stored = null;

	foreach ( ndm_headless_home_schema() as $group ) {
		add_meta_box(
			'ndm-home-' . $group['id'],
			$group['title'],
			function ( $post ) use ( $group, &$stored ) {
				if ( null === $stored ) {
					$from   = metadata_exists( 'post', $post->ID, NDM_HOME_META ) ? $post->ID : ndm_headless_home_previous_page( $post->ID );
					$stored = ndm_headless_home_content( $from ? $from : $post->ID );
					wp_nonce_field( 'ndm_home_save', 'ndm_home_nonce' );
				}

				if ( ! empty( $group['help'] ) ) {
					echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
				}

				foreach ( $group['fields'] as $field ) {
					ndm_headless_concern_field( $field, 'ndm_home[' . $field['key'] . ']', $stored[ $field['key'] ] );
				}
			},
			'page',
			'normal',
			'default'
		);
	}
}
add_action( 'add_meta_boxes_page', 'ndm_headless_home_meta_boxes' );

/**
 * Under the title of the home page: where it is on the site, what the site fills in by itself, and
 * anything that keeps the site from showing these words.
 *
 * @param WP_Post $post The page.
 */
function ndm_headless_home_intro( $post ) {
	if ( ! ndm_headless_home_is_front( $post ) ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $site ) {
		$url = $site . '/';
		echo '<p><strong>Home page of the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shows these words once published; until then the site shows its built-in copy)' ) . '</p>';
	}
	echo '<p>This page is the site\'s home page because it is chosen under <a href="' . esc_url( admin_url( 'options-reading.php' ) ) . '">Settings &gt; Reading</a>. The title above is only its name in the admin. Older versions of these words are under Revisions.</p>';
	if ( ! metadata_exists( 'post', $post->ID, NDM_HOME_META ) ) {
		$from = ndm_headless_home_previous_page( $post->ID );
		echo '<p><strong>No home page words are saved on this page yet</strong>, so the site shows its built-in copy. ' . ( $from ? 'The boxes below start from the words of "' . esc_html( get_the_title( $from ) ) . '", the page that held them before; Update' : 'Update' ) . ' saves them to this page.</p>';
	}
	echo '<p>Filled in by the site, not typed here: the films, every price (WooCommerce), the team members, the before and after cases, the monthly specials (WooCommerce), the reviews and awards, the two clinics, the booking form, the journal posts and the reels. The words of a section that other pages also show (Our Team, Before And After, How It Works, Testimonials, Booking, Social) change on the home page only.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_home_intro' );

/**
 * Saves the boxes of the home page.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_home_save( $post_id ) {
	if ( ! isset( $_POST['ndm_home_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_home_nonce'] ) ), 'ndm_home_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) || ! ndm_headless_home_is_front( $post_id ) ) {
		return;
	}

	// PHP keeps only the first max_input_vars fields of a form and drops the rest without a word. A form
	// that reached the limit may have lost some of its rows: keep the saved words rather than lose them.
	$limit = (int) ini_get( 'max_input_vars' );
	if ( $limit > 0 && ndm_headless_home_count_inputs( $_POST ) >= $limit ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified above.
		add_filter(
			'redirect_post_location',
			function ( $location ) {
				return add_query_arg( 'ndm_home_cut', 1, $location );
			}
		);
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_home_clean_all().
	$input = isset( $_POST['ndm_home'] ) ? wp_unslash( $_POST['ndm_home'] ) : array();

	update_post_meta( $post_id, NDM_HOME_META, wp_slash( ndm_headless_home_clean_all( $input ) ) );
}
add_action( 'save_post_page', 'ndm_headless_home_save' );

/**
 * How many fields a form sent, counted as PHP counts them for max_input_vars: one per name=value pair
 * (`a[b][c]=x` is one), so only the values are counted, not the lists that hold them.
 *
 * @param array $values Form values.
 * @return int
 */
function ndm_headless_home_count_inputs( $values ) {
	$count = 0;
	foreach ( $values as $value ) {
		$count += is_array( $value ) ? ndm_headless_home_count_inputs( $value ) : 1;
	}

	return $count;
}

/**
 * After a save whose words were kept because the form was too long: say so, and how to fix it.
 */
function ndm_headless_home_cut_notice() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- only shows a message.
	if ( empty( $_GET['ndm_home_cut'] ) || ! ndm_headless_home_is_front( get_post() ) ) {
		return;
	}

	echo '<div class="notice notice-error"><p><strong>The home page\'s words were not saved.</strong> The page has more fields than this server accepts in one save (PHP\'s max_input_vars is ' . esc_html( (string) ini_get( 'max_input_vars' ) ) . '), so some could have been lost; the words as they were before are kept. Remove a few rows, or ask for max_input_vars to be raised, and save again.</p></div>';
}
add_action( 'admin_notices', 'ndm_headless_home_cut_notice' );

/**
 * A warning wherever the home page is set up (Dashboard, Pages, Settings > Reading and the page itself)
 * when the site cannot show the home page's words from WordPress.
 */
function ndm_headless_home_notice() {
	$screen = get_current_screen();
	if ( ! $screen || ! current_user_can( 'edit_pages' ) || ! in_array( $screen->id, array( 'dashboard', 'edit-page', 'options-reading', 'page' ), true ) ) {
		return;
	}

	// On a page's own edit screen, only on the home page (its own intro explains the "no words yet" case).
	$problem = ndm_headless_home_problem();
	if ( ! $problem || ( 'page' === $screen->id && ( ! ndm_headless_home_is_front( get_post() ) || 'ndm_home_empty' === $problem['code'] ) ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p><strong>Home page:</strong> ' . esc_html( $problem['message'] ) . ' Until this is fixed, the site\'s home page shows its built-in copy. Choose the home page under <a href="' . esc_url( admin_url( 'options-reading.php' ) ) . '">Settings &gt; Reading</a> ("A static page").</p></div>';
}
add_action( 'admin_notices', 'ndm_headless_home_notice' );

/*
 * ---------------------------------------------------------------------------------------------
 * Revisions of the words
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The words are revisioned post meta: each revision of a page keeps a copy, restoring a revision
 * restores them, and a save that changes only the words still makes a revision.
 */
function ndm_headless_home_register_meta() {
	register_post_meta(
		'page',
		NDM_HOME_META,
		array(
			'type'              => 'object',
			'single'            => true,
			'show_in_rest'      => false,
			'revisions_enabled' => true,
			'auth_callback'     => function () {
				return current_user_can( 'edit_pages' );
			},
		)
	);
}
add_action( 'init', 'ndm_headless_home_register_meta' );

/**
 * One field as plain text, for the comparison of two revisions. Rows of a list are numbered.
 *
 * @param array $field The field.
 * @param mixed $value Its stored value.
 * @return string
 */
function ndm_headless_home_field_text( $field, $value ) {
	switch ( $field['type'] ) {
		case 'image':
			$id = absint( $value );
			return $id ? '[photo ' . $id . ': ' . basename( (string) get_attached_file( $id ) ) . ']' : '';

		case 'lines':
			return implode( "\n", is_array( $value ) ? $value : array() );

		case 'repeater':
			$rows = array();
			foreach ( is_array( $value ) ? $value : array() as $i => $row ) {
				$parts = array();
				foreach ( $field['fields'] as $sub ) {
					$text = ndm_headless_home_field_text( $sub, isset( $row[ $sub['key'] ] ) ? $row[ $sub['key'] ] : '' );
					if ( '' !== $text ) {
						$parts[] = $sub['label'] . ': ' . $text;
					}
				}
				$rows[] = ( $i + 1 ) . '. ' . implode( ' | ', $parts );
			}
			return implode( "\n", $rows );

		default:
			return (string) $value;
	}
}

/**
 * Revisions screen: one row per field whose words differ between the two revisions compared, named
 * after its box and label ("Header: Heading, first line").
 *
 * @param array        $diffs        Rows of the comparison.
 * @param WP_Post|null $compare_from Older revision (null when comparing with nothing).
 * @param WP_Post      $compare_to   Newer revision.
 * @return array
 */
function ndm_headless_home_revision_diff( $diffs, $compare_from, $compare_to ) {
	$from_raw = $compare_from ? get_post_meta( $compare_from->ID, NDM_HOME_META, true ) : '';
	$to_raw   = get_post_meta( $compare_to->ID, NDM_HOME_META, true );

	if ( ! is_array( $from_raw ) && ! is_array( $to_raw ) ) {
		return $diffs;
	}

	$from = ndm_headless_home_clean_all( $from_raw );
	$to   = ndm_headless_home_clean_all( $to_raw );

	foreach ( ndm_headless_home_schema() as $group ) {
		foreach ( $group['fields'] as $field ) {
			$old  = ndm_headless_home_field_text( $field, $from[ $field['key'] ] );
			$new  = ndm_headless_home_field_text( $field, $to[ $field['key'] ] );
			$diff = $old === $new ? '' : wp_text_diff( $old, $new, array( 'show_split_view' => true ) );

			if ( '' !== $diff ) {
				$diffs[] = array(
					'id'   => 'ndm_home_' . $field['key'],
					'name' => $group['title'] . ': ' . $field['label'],
					'diff' => $diff,
				);
			}
		}
	}

	return $diffs;
}
add_filter( 'wp_get_revision_ui_diff', 'ndm_headless_home_revision_diff', 10, 3 );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * The home page as the site receives it.
 *
 * @param WP_Post $post The page.
 * @return array
 */
function ndm_headless_home_answer( $post ) {
	$content = ndm_headless_home_content( $post->ID );

	foreach ( ndm_headless_home_schema() as $group ) {
		$content = ndm_headless_concern_expand( $group['fields'], $content );
	}

	// The panels' photos fill a tall panel at many widths: the site picks a size from WordPress's own.
	foreach ( $content['start_panels'] as $i => $panel ) {
		if ( ! empty( $panel['image']['id'] ) ) {
			$content['start_panels'][ $i ]['image']['srcset'] = (string) wp_get_attachment_image_srcset( $panel['image']['id'], 'full' );
		}
	}

	// The cards' photos (typed or the product's) fill cards at many widths: the site picks a size from WordPress's own.
	$srcset = function ( $image ) {
		if ( ! empty( $image['id'] ) ) {
			$image['srcset'] = (string) wp_get_attachment_image_srcset( $image['id'], 'full' );
		}
		return $image;
	};
	foreach ( $content['treat_tabs'] as $i => $tab ) {
		foreach ( $tab['cards'] as $j => $card ) {
			$content['treat_tabs'][ $i ]['cards'][ $j ]['image'] = $srcset( $card['image'] );
			if ( ! empty( $card['product']['image'] ) ) {
				$content['treat_tabs'][ $i ]['cards'][ $j ]['product']['image'] = $srcset( $card['product']['image'] );
			}
		}
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
function ndm_headless_home_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/home-page',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_home_rest',
			// Public on purpose: it holds only what the public page shows.
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_home_routes' );

/**
 * GET ndm/v1/home-page: the page chosen as the homepage under Settings > Reading. 404 with the reason
 * (`ndm_home_not_set`, `ndm_home_missing`, `ndm_home_unpublished`, `ndm_home_empty`) when the site
 * should show its built-in copy instead.
 *
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_home_rest() {
	$problem = ndm_headless_home_problem();

	if ( $problem ) {
		return new WP_Error( $problem['code'], $problem['message'], array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_home_answer( get_post( ndm_headless_home_page_id() ) ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "the home page changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_home_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_home_notify_frontend' );
}

/**
 * The home page was saved, trashed, restored or deleted.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_home_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( ndm_headless_home_is_front( $post_id ) ) {
		ndm_headless_home_changed();
	}
}
add_action( 'save_post', 'ndm_headless_home_post_changed' );
add_action( 'trashed_post', 'ndm_headless_home_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_home_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_home_post_changed' );

/**
 * The home page's words changed (also when a revision is restored), or the description of a photo in
 * the media library.
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_home_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( ( NDM_HOME_META === $meta_key && ndm_headless_home_is_front( $post_id ) ) || '_wp_attachment_image_alt' === $meta_key ) {
		ndm_headless_home_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_home_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_home_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_home_meta_changed', 10, 3 );

// Another page was chosen as the homepage, or the latest posts instead.
add_action( 'update_option_show_on_front', 'ndm_headless_home_changed' );
add_action( 'update_option_page_on_front', 'ndm_headless_home_changed' );
add_action( 'add_option_show_on_front', 'ndm_headless_home_changed' );
add_action( 'add_option_page_on_front', 'ndm_headless_home_changed' );

/**
 * Asks the Next.js server to clear its cached home page. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_home_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'home' ) ),
		)
	);
}

/*
 * ---------------------------------------------------------------------------------------------
 * Setting up the home page (WP-CLI)
 * ---------------------------------------------------------------------------------------------
 */

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * The page to hold the home page's words: the page chosen under Settings > Reading when one is,
	 * else a page with the slug "home", else a new published page "Home". When no page is chosen yet,
	 * this one becomes the homepage under Settings > Reading.
	 *
	 * @param string $title Title of a new page.
	 * @param bool   $dry   Report only, change nothing.
	 * @return int The page, or 0 on a dry run that would create it.
	 */
	function ndm_headless_home_cli_target( $title, $dry ) {
		$id = ndm_headless_home_page_id();
		if ( $id ) {
			WP_CLI::log( "Home page: \"" . get_the_title( $id ) . "\" ({$id}), chosen under Settings > Reading." );
			return $id;
		}

		$found = get_posts(
			array(
				'post_type'   => 'page',
				'name'        => 'home',
				'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'numberposts' => 1,
				'fields'      => 'ids',
			)
		);
		$id    = $found ? (int) $found[0] : 0;

		if ( $dry ) {
			WP_CLI::log( $id ? "Would choose the page \"home\" ({$id}) as the homepage." : "Would create the page \"{$title}\" and choose it as the homepage." );
			return $id;
		}

		if ( ! $id ) {
			$id = wp_insert_post(
				array(
					'post_type'   => 'page',
					'post_status' => 'publish',
					'post_name'   => 'home',
					'post_title'  => wp_slash( $title ),
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				WP_CLI::error( 'Home page: ' . $id->get_error_message() );
			}
			WP_CLI::log( "Created the page \"{$title}\" ({$id})." );
		}

		if ( 'publish' !== get_post_status( $id ) ) {
			wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
		}

		update_option( 'page_on_front', $id );
		update_option( 'show_on_front', 'page' );
		WP_CLI::log( "Settings > Reading: the homepage is now page {$id}." );

		return (int) $id;
	}

	/**
	 * Saves the words on the page, then a revision of it, so the first version can be restored later.
	 *
	 * @param int   $page_id The page.
	 * @param array $content The words, as stored.
	 */
	function ndm_headless_home_cli_store( $page_id, $content ) {
		update_post_meta( $page_id, NDM_HOME_META, wp_slash( $content ) );
		$revision = wp_save_post_revision( $page_id );
		WP_CLI::log( $revision ? "Saved revision {$revision} of the page." : 'No new revision (revisions off, or nothing changed since the last one).' );
	}

	/**
	 * Sets up the home page from JSON on standard input:
	 *
	 *   { "title": "Home",
	 *     "content": { ...the fields of the edit screen; a photo is a file path under the import folder or
	 *                  an https address (or { "file", "alt" })... } }
	 *
	 * The words go to the page chosen under Settings > Reading (or a page "home", created and chosen
	 * when none is). When that page already holds home page words it is left exactly as it is, so
	 * running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * [--fill-empty=<fields>]
	 * : When the home page already holds its words, fill in only these fields (comma separated keys of
	 *   ndm_headless_home_schema(), for example "start_panels"), and only where they are empty: for a box
	 *   added after the first import. Nothing typed is ever replaced; a field an editor emptied on purpose
	 *   is left alone unless it is named here.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-home.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm home-import --images=/tmp/site
	 *     node ../web/scripts/export-home.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm home-import --images=/tmp/site --fill-empty=start_panels
	 */
	WP_CLI::add_command(
		'ndm home-import',
		function ( $args, $assoc_args ) {
			$page = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $page ) || empty( $page['content'] ) || ! is_array( $page['content'] ) ) {
				WP_CLI::error( 'Expected the page as JSON on standard input: { "title", "content" }.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			$current = ndm_headless_home_page_id();
			$fill    = isset( $assoc_args['fill-empty'] ) ? array_filter( array_map( 'trim', explode( ',', (string) $assoc_args['fill-empty'] ) ) ) : array();
			$unknown = array_diff( $fill, array_keys( ndm_headless_home_clean_all( array() ) ) );
			if ( $unknown ) {
				WP_CLI::error( 'Unknown fields for --fill-empty: ' . implode( ', ', $unknown ) . '.' );
			}
			if ( $current && metadata_exists( 'post', $current, NDM_HOME_META ) && ! $fill ) {
				WP_CLI::log( "Kept: the home page ({$current}) already holds its words." );
				return;
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$content = $page['content'];
			foreach ( ndm_headless_home_schema() as $group ) {
				// The photo import of the Aptos pages: a file of the import folder, or an https address.
				$content = ndm_headless_aptos_import_images( $group['fields'], $content, $dir );
			}

			$incoming = ndm_headless_home_clean_all( $content );

			if ( $fill && $current && metadata_exists( 'post', $current, NDM_HOME_META ) ) {
				$stored = ndm_headless_home_content( $current );
				$filled = array();
				foreach ( $fill as $key ) {
					if ( empty( $stored[ $key ] ) && ! empty( $incoming[ $key ] ) ) {
						$stored[ $key ] = $incoming[ $key ];
						$filled[]       = $key;
					}
				}
				if ( ! $filled ) {
					WP_CLI::success( "Nothing to fill: those fields of the home page ({$current}) already have words." );
					return;
				}
				ndm_headless_home_cli_store( $current, $stored );
				WP_CLI::success( "Filled the empty fields of the home page ({$current}): " . implode( ', ', $filled ) . '.' );
				return;
			}

			$title = isset( $page['title'] ) && '' !== trim( (string) $page['title'] ) ? trim( (string) $page['title'] ) : 'Home';
			$id    = ndm_headless_home_cli_target( $title, false );
			ndm_headless_home_cli_store( $id, $incoming );

			WP_CLI::success( "Set up: the home page ({$id})." );
		}
	);

	/**
	 * Moves the home page's words from the former "Home Page" post type (`ndm_home`) to the page chosen
	 * under Settings > Reading (or a page "home", created and chosen when none is). The stored words are
	 * copied exactly as they are (photos stay the same media library items), then compared with the
	 * original; nothing is overwritten: when the page already holds different words, nothing happens.
	 *
	 * ## OPTIONS
	 *
	 * [--dry-run]
	 * : Report what would happen, change nothing.
	 *
	 * [--remove-old]
	 * : After the words on the page were checked equal to the old post's, delete the old post (and its
	 *   revisions) for good. Run this only once the site was checked against the page.
	 *
	 * ## EXAMPLES
	 *
	 *     docker compose run --rm -T cli wp ndm home-migrate --dry-run
	 *     docker compose run --rm -T cli wp ndm home-migrate
	 *     docker compose run --rm -T cli wp ndm home-migrate --remove-old
	 */
	WP_CLI::add_command(
		'ndm home-migrate',
		function ( $args, $assoc_args ) {
			$dry    = ! empty( $assoc_args['dry-run'] );
			$remove = ! empty( $assoc_args['remove-old'] );

			// Read by its name: the post type is no longer registered.
			$old = get_posts(
				array(
					'post_type'        => NDM_HOME_LEGACY_TYPE,
					'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future', 'trash' ),
					'numberposts'      => -1,
					'orderby'          => 'ID',
					'order'            => 'ASC',
					'suppress_filters' => true,
				)
			);
			if ( ! $old ) {
				WP_CLI::success( 'Nothing to move: no post of the former "Home Page" post type is left.' );
				return;
			}
			if ( count( $old ) > 1 ) {
				WP_CLI::error( 'More than one post of the former "Home Page" post type exists (' . implode( ', ', wp_list_pluck( $old, 'ID' ) ) . '): move them by hand.' );
			}

			$old   = $old[0];
			$words = get_post_meta( $old->ID, NDM_HOME_META, true );
			if ( ! is_array( $words ) ) {
				WP_CLI::error( "The old post ({$old->ID}) holds no home page words." );
			}
			WP_CLI::log( "Old post: \"{$old->post_title}\" ({$old->ID}, {$old->post_status}), " . count( $words ) . ' fields.' );

			$id = ndm_headless_home_cli_target( $old->post_title, $dry );

			if ( $id && metadata_exists( 'post', $id, NDM_HOME_META ) ) {
				if ( get_post_meta( $id, NDM_HOME_META, true ) !== $words ) {
					WP_CLI::error( "The home page ({$id}) already holds different words: nothing was moved or overwritten. Compare them and remove one by hand." );
				}
				WP_CLI::log( "The home page ({$id}) already holds exactly these words." );
			} elseif ( $dry ) {
				WP_CLI::log( 'Would copy the ' . count( $words ) . ' fields to the home page and save a revision.' );
			} else {
				ndm_headless_home_cli_store( $id, $words );
				if ( get_post_meta( $id, NDM_HOME_META, true ) !== $words ) {
					WP_CLI::error( "Check failed: the words on the page ({$id}) differ from the old post's. The old post is kept." );
				}
				WP_CLI::log( "Copied and checked: the page ({$id}) holds exactly the old post's words." );
			}

			if ( $dry ) {
				WP_CLI::success( 'Dry run: nothing was changed.' );
				return;
			}

			if ( ! $remove ) {
				WP_CLI::success( "Moved. The old post ({$old->ID}) is kept until you run this again with --remove-old." );
				return;
			}

			if ( ! wp_delete_post( $old->ID, true ) ) {
				WP_CLI::error( "The old post ({$old->ID}) could not be deleted." );
			}
			WP_CLI::success( "Removed the old post ({$old->ID}); the home page ({$id}) holds its words." );
		}
	);
}

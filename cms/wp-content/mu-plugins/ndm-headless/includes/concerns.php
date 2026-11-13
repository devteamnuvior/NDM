<?php
/**
 * The concern pages of the Next.js site (for example /wrinkles-fine-lines).
 *
 * - Post type "Concerns" (`ndm_concern`): one post is one concern page. Its title is the concern's
 *   name, its slug is the page's address on the site, its featured image is the wide header photo.
 * - Everything else the page shows that belongs to this concern only is typed into the boxes under
 *   the title (one post meta, `_ndm_concern`). The fields are listed once, in
 *   ndm_headless_concern_schema(); the edit screen, the saving, the REST answer and the import all
 *   read that list.
 * - What every concern page shares (Why NewDermaMed, Our team, Testimonials, Visit us, Start your
 *   journey, the section bar, the booking form, headings) lives in the site's code, and every price
 *   is read from WooCommerce (a treatment row only says which product): none of that is typed here.
 * - `GET ndm/v1/concerns` lists the published concerns; `GET ndm/v1/concerns/<slug>` gives one.
 * - When a concern changes, the Next.js site is told to drop its cached copy (tag `concerns`).
 * - `wp ndm concerns-import` creates concerns once, from the site's original content.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_CONCERN_POST_TYPE', 'ndm_concern' );
define( 'NDM_CONCERN_META', '_ndm_concern' );
define( 'NDM_CONCERN_SOURCE_META', '_ndm_source_file' );

/**
 * Registers the post type.
 */
function ndm_headless_concern_register() {
	register_post_type(
		NDM_CONCERN_POST_TYPE,
		array(
			'labels'              => array(
				'name'                  => 'Concerns',
				'singular_name'         => 'Concern',
				'menu_name'             => 'Concerns',
				'all_items'             => 'All concerns',
				'add_new'               => 'Add concern',
				'add_new_item'          => 'Add a concern',
				'edit_item'             => 'Edit concern',
				'new_item'              => 'New concern',
				'view_item'             => 'View concern',
				'search_items'          => 'Search concerns',
				'not_found'             => 'No concerns found.',
				'not_found_in_trash'    => 'No concerns in the trash.',
				'featured_image'        => 'Header photo (wide)',
				'set_featured_image'    => 'Set the header photo',
				'remove_featured_image' => 'Remove the header photo',
				'use_featured_image'    => 'Use as the header photo',
			),
			'description'         => 'Concern pages of the site: one design, each post carries its own content.',
			// The page itself is the Next.js site's: WordPress shows no page of its own.
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_rest'        => true,
			'rest_base'           => 'concern-posts',
			'menu_position'       => 22,
			'menu_icon'           => 'dashicons-heart',
			'hierarchical'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			// No block editor: the content is the fields below the title.
			'supports'            => array( 'title', 'thumbnail' ),
		)
	);
}
add_action( 'init', 'ndm_headless_concern_register' );

/**
 * The header photo is the featured image: makes sure the active theme (which never renders) allows one.
 */
function ndm_headless_concern_thumbnails() {
	$support = get_theme_support( 'post-thumbnails' );

	if ( true === $support ) {
		return;
	}

	$types = is_array( $support ) && isset( $support[0] ) && is_array( $support[0] ) ? $support[0] : array();
	add_theme_support( 'post-thumbnails', array_values( array_unique( array_merge( $types, array( NDM_CONCERN_POST_TYPE ) ) ) ) );
}
add_action( 'after_setup_theme', 'ndm_headless_concern_thumbnails', 100 );

/**
 * Every field of a concern, grouped as the boxes of the edit screen, in page order.
 *
 * Field types: text, textarea, lines (one item per line), image (media library), checkbox, select,
 * product (a WooCommerce product or product category, searched and picked; `only` => 'product' leaves categories out), posts (entries of one post type, searched and
 * picked: blog posts by default, `post_type` and `rest` name another), repeater (rows of sub-fields).
 *
 * There is no price field, on purpose: every price the site shows is a WooCommerce price.
 *
 * @return array[]
 */
function ndm_headless_concern_schema() {
	$link_help = 'A page of the site ("/botox", "/pricing#pg-microneedling-h") or a full address.';

	return array(
		array(
			'id'     => 'header',
			'title'  => 'Header',
			'help'   => 'The concern\'s name is the post title; the wide header photo is the "Header photo" box at the side. The clinics line, the booking form and the glance card (number of options, consultation, skin analysis, starting price) are filled in by the site.',
			'fields' => array(
				array( 'key' => 'heading_1', 'label' => 'Heading, first line', 'type' => 'text', 'help' => 'For example "Wrinkles &".' ),
				array( 'key' => 'heading_2', 'label' => 'Heading, second line (blue)', 'type' => 'text', 'help' => 'For example "fine lines".' ),
				array( 'key' => 'intro', 'label' => 'Text under the heading', 'type' => 'textarea' ),
				array( 'key' => 'hero_mobile', 'label' => 'Header photo for phones (tall)', 'type' => 'image' ),
				array( 'key' => 'hero_position', 'label' => 'Photo focus', 'type' => 'text', 'help' => 'Which part of the photo stays in view, for example "50% 30%". Empty: the middle.' ),
			),
		),
		array(
			'id'     => 'seo',
			'title'  => 'Search Engines',
			'fields' => array(
				array( 'key' => 'seo_title', 'label' => 'Page title', 'type' => 'text', 'help' => 'Empty: "<name> Treatment Toronto | NewDermaMed".' ),
				array( 'key' => 'seo_description', 'label' => 'Description', 'type' => 'textarea' ),
			),
		),
		array(
			'id'     => 'overview',
			'title'  => 'Overview',
			'help'   => 'The "In short" sentence in the card is written by the site from the name, the number of options and the starting price.',
			'fields' => array(
				array( 'key' => 'lede', 'label' => 'Opening paragraphs', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 6 ),
				array(
					'key'    => 'pages',
					'label'  => '"On our site" links',
					'type'   => 'repeater',
					'add'    => 'Add a link',
					'fields' => array(
						array( 'key' => 'name', 'label' => 'Name', 'type' => 'text' ),
						array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => $link_help . ' Empty: the page with this name, once it exists.' ),
					),
				),
				array( 'key' => 'gallery', 'label' => 'Also link the Before & after gallery in this card', 'type' => 'checkbox' ),
			),
		),
		array(
			'id'     => 'understand',
			'title'  => 'The Concern',
			'fields' => array(
				array( 'key' => 'notice', 'label' => 'What you may notice', 'type' => 'lines', 'help' => 'One point per line.', 'rows' => 5 ),
				array( 'key' => 'cause', 'label' => 'What causes it', 'type' => 'lines', 'help' => 'One paragraph per line.', 'rows' => 5 ),
			),
		),
		array(
			'id'     => 'assess',
			'title'  => 'Assessment',
			'fields' => array(
				array( 'key' => 'assess_text', 'label' => 'Text', 'type' => 'textarea' ),
				array( 'key' => 'assess_points', 'label' => 'What we look at', 'type' => 'lines', 'help' => 'One point per line.', 'rows' => 4 ),
			),
		),
		array(
			'id'     => 'options',
			'title'  => 'Treatment Options',
			'help'   => 'One row per treatment, in the order shown: add a row, then search for its WooCommerce product. Rows with the label "Bio-stimulator" are shown together in the Bio-stimulators group. The price always comes from the product; a row without a product is priced by its title when a product has that name, else it shows no price.',
			'fields' => array(
				array(
					'key'    => 'options',
					'label'  => 'Treatments',
					'type'   => 'repeater',
					'add'    => 'Add a treatment',
					'title'  => 'name',
					'fields' => array(
						array( 'key' => 'price_source', 'label' => 'Product (WooCommerce)', 'type' => 'product', 'help' => 'Search the price list and pick the product (or a whole category). Its price is shown as "From" and can only be changed in the price manager. The fields below replace what the card would take from the product; leave one empty to use the product\'s own.' ),
						array( 'key' => 'name', 'label' => 'Title', 'type' => 'text', 'help' => 'Empty: the product\'s name.' ),
						array( 'key' => 'role', 'label' => 'Label', 'type' => 'select', 'options' => array( 'Primary', 'Supporting', 'Combination', 'Bio-stimulator' ) ),
						array( 'key' => 'image', 'label' => 'Image', 'type' => 'image', 'help' => 'Empty: the product\'s image.' ),
						array( 'key' => 'fit', 'label' => 'Subtitle (what it often suits)', 'type' => 'text' ),
						array( 'key' => 'line', 'label' => 'Summary', 'type' => 'textarea', 'help' => 'Empty: the product\'s short description.' ),
						array( 'key' => 'link', 'label' => 'Treatment page', 'type' => 'text', 'help' => $link_help . ' Empty: the page with this title, once it exists.' ),
						array( 'key' => 'price_link', 'label' => 'Price list link', 'type' => 'text', 'help' => 'Empty: the treatment\'s category on the Pricing page.' ),
						array( 'key' => 'visit', 'label' => 'Typical visit', 'type' => 'text' ),
						array( 'key' => 'course', 'label' => 'Typical course', 'type' => 'text' ),
						array( 'key' => 'down', 'label' => 'Downtime', 'type' => 'text' ),
						array( 'key' => 'res', 'label' => 'Changes may appear', 'type' => 'text' ),
					),
				),
				array( 'key' => 'rx_text', 'label' => 'Note about prescription treatments', 'type' => 'textarea', 'help' => 'Empty: no note. Never name a prescription drug beside a benefit.' ),
				array(
					'key'    => 'rx_links',
					'label'  => 'Links beside the note',
					'type'   => 'repeater',
					'add'    => 'Add a link',
					'fields' => array(
						array( 'key' => 'name', 'label' => 'Name', 'type' => 'text' ),
						array( 'key' => 'link', 'label' => 'Link', 'type' => 'text', 'help' => $link_help . ' Empty: the page with this name, once it exists.' ),
					),
				),
			),
		),
		array(
			'id'     => 'expect',
			'title'  => 'What To Expect',
			'fields' => array(
				array(
					'key'    => 'expect',
					'label'  => 'Steps',
					'type'   => 'repeater',
					'add'    => 'Add a step',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'when', 'label' => 'When', 'type' => 'text', 'help' => 'For example "Visit 1" or "Weeks 1 to 6".' ),
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
					),
				),
			),
		),
		array(
			'id'     => 'results',
			'title'  => 'Before And After Photos',
			'help'   => 'Cases of the "Before & After" post type shown as photos, in this order: each takes the case\'s photo and its first category (the treatment). Nothing is typed here; add or change a case under Before & After. "Individual results may vary" is added by the site.',
			'fields' => array(
				array( 'key' => 'cases', 'label' => 'Cases', 'type' => 'posts', 'post_type' => NDM_BA_POST_TYPE, 'rest' => 'before-after-cases', 'noun' => 'cases' ),
			),
		),
		array(
			'id'     => 'home',
			'title'  => 'Home Care',
			'fields' => array(
				array(
					'key'    => 'home',
					'label'  => 'Cards',
					'type'   => 'repeater',
					'add'    => 'Add a card',
					'title'  => 'title',
					'fields' => array(
						array( 'key' => 'title', 'label' => 'Title', 'type' => 'text' ),
						array( 'key' => 'category', 'label' => 'Tag on the photo', 'type' => 'text' ),
						array( 'key' => 'text', 'label' => 'Text', 'type' => 'textarea' ),
						array( 'key' => 'product_name', 'label' => 'Product name', 'type' => 'text', 'help' => 'Leave the four product fields empty for a card without a product.' ),
						array( 'key' => 'product_size', 'label' => 'Product size', 'type' => 'text', 'help' => 'For example "30 ml".' ),
						array( 'key' => 'product_image', 'label' => 'Product photo address', 'type' => 'text', 'help' => 'The photo\'s full address in the skincare shop.' ),
						array( 'key' => 'product_link', 'label' => 'Product page address', 'type' => 'text' ),
					),
				),
			),
		),
		array(
			'id'     => 'articles',
			'title'  => 'From The Journal',
			'help'   => 'Posts of this WordPress shown as cards, in this order: each card takes the post\'s title, date, first category, featured image and excerpt. Nothing is typed here. Empty: the section is left out.',
			'fields' => array(
				array( 'key' => 'journal', 'label' => 'Posts', 'type' => 'posts' ),
			),
		),
		array(
			'id'     => 'related',
			'title'  => 'Related Treatments',
			'help'   => 'One row per card, in the order shown: add a row, then search for its WooCommerce product. The card takes the product\'s name, its category (the tag) and its image; the fields below replace them only when filled in. No price is shown here.',
			'fields' => array(
				array(
					'key'    => 'related',
					'label'  => 'Treatments',
					'type'   => 'repeater',
					'add'    => 'Add a treatment',
					'title'  => 'name',
					'fields' => array(
						array( 'key' => 'price_source', 'label' => 'Product (WooCommerce)', 'type' => 'product', 'only' => 'product', 'help' => 'Search the price list and pick the product. The fields below replace what the card would take from it; leave one empty to use the product\'s own.' ),
						array( 'key' => 'name', 'label' => 'Title', 'type' => 'text', 'help' => 'Empty: the product\'s name.' ),
						array( 'key' => 'kind', 'label' => 'Tag', 'type' => 'text', 'help' => 'For example "Laser" or "Injectable". Empty: the product\'s category.' ),
						array( 'key' => 'image', 'label' => 'Image', 'type' => 'image', 'help' => 'Empty: the product\'s image.' ),
						array( 'key' => 'link', 'label' => 'Treatment page', 'type' => 'text', 'help' => $link_help . ' Empty: the page with this title, once it exists.' ),
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
 * Cleans one value typed into a field (or imported), by the field's type.
 *
 * @param array $field Field definition.
 * @param mixed $value Raw value, already unslashed.
 * @return mixed
 */
function ndm_headless_concern_clean( $field, $value ) {
	switch ( $field['type'] ) {
		case 'checkbox':
			return ! empty( $value );

		case 'image':
			$id = absint( $value );
			return $id && wp_attachment_is_image( $id ) ? $id : 0;

		case 'select':
			$value = is_string( $value ) ? $value : '';
			return in_array( $value, $field['options'], true ) ? $value : $field['options'][0];

		case 'posts':
			$ids = array();
			foreach ( is_array( $value ) ? $value : array() as $post_id ) {
				$post_id = absint( $post_id );
				if ( $post_id && ! in_array( $post_id, $ids, true ) && ( isset( $field['post_type'] ) ? $field['post_type'] : 'post' ) === get_post_type( $post_id ) ) {
					$ids[] = $post_id;
				}
			}
			return $ids;

		case 'product':
			$value = is_string( $value ) ? $value : '';
			if ( ! preg_match( '/^(?:category:[a-z0-9-]+|product:[1-9][0-9]*)$/', $value ) ) {
				return '';
			}
			// A field for products only never keeps a category.
			return isset( $field['only'] ) && 0 !== strpos( $value, $field['only'] . ':' ) ? '' : $value;

		case 'lines':
			if ( is_string( $value ) ) {
				$value = preg_split( '/\r\n|\r|\n/', $value );
			}
			$lines = array();
			foreach ( is_array( $value ) ? $value : array() as $line ) {
				$line = is_string( $line ) ? trim( sanitize_text_field( $line ) ) : '';
				if ( '' !== $line ) {
					$lines[] = $line;
				}
			}
			return $lines;

		case 'repeater':
			$rows = array();
			foreach ( is_array( $value ) ? $value : array() as $raw ) {
				if ( ! is_array( $raw ) ) {
					continue;
				}
				$row   = array();
				$empty = true;
				foreach ( $field['fields'] as $sub ) {
					$row[ $sub['key'] ] = ndm_headless_concern_clean( $sub, isset( $raw[ $sub['key'] ] ) ? $raw[ $sub['key'] ] : null );
					// A select always has a value: it alone does not make a row.
					if ( 'select' !== $sub['type'] && ! empty( $row[ $sub['key'] ] ) ) {
						$empty = false;
					}
				}
				if ( ! $empty ) {
					$rows[] = $row;
				}
			}
			return $rows;

		case 'textarea':
			return is_string( $value ) ? trim( preg_replace( '/\s+/', ' ', sanitize_textarea_field( $value ) ) ) : '';

		default:
			return is_string( $value ) ? trim( sanitize_text_field( $value ) ) : '';
	}
}

/**
 * Cleans a whole concern: every field of the schema, nothing else.
 *
 * @param mixed $input Raw values by field key.
 * @return array
 */
function ndm_headless_concern_clean_all( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( ndm_headless_concern_schema() as $group ) {
		foreach ( $group['fields'] as $field ) {
			$clean[ $field['key'] ] = ndm_headless_concern_clean( $field, isset( $input[ $field['key'] ] ) ? $input[ $field['key'] ] : null );
		}
	}

	return $clean;
}

/**
 * The stored content of a concern, complete (missing fields come back empty).
 *
 * @param int $post_id Post ID.
 * @return array
 */
function ndm_headless_concern_content( $post_id ) {
	return ndm_headless_concern_clean_all( get_post_meta( $post_id, NDM_CONCERN_META, true ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * The edit screen
 * ---------------------------------------------------------------------------------------------
 */

/**
 * One box per group of fields, under the title, plus the address box.
 */
function ndm_headless_concern_meta_boxes() {
	$stored = null;

	foreach ( ndm_headless_concern_schema() as $group ) {
		add_meta_box(
			'ndm-concern-' . $group['id'],
			$group['title'],
			function ( $post ) use ( $group, &$stored ) {
				if ( null === $stored ) {
					$stored = ndm_headless_concern_content( $post->ID );
					wp_nonce_field( 'ndm_concern_save', 'ndm_concern_nonce' );
				}

				if ( ! empty( $group['help'] ) ) {
					echo '<p class="ndm-cn-note">' . esc_html( $group['help'] ) . '</p>';
				}

				foreach ( $group['fields'] as $field ) {
					ndm_headless_concern_field( $field, 'ndm_concern[' . $field['key'] . ']', $stored[ $field['key'] ] );
				}
			},
			NDM_CONCERN_POST_TYPE,
			'normal',
			'default'
		);
	}
}
add_action( 'add_meta_boxes_' . NDM_CONCERN_POST_TYPE, 'ndm_headless_concern_meta_boxes' );

/**
 * The "Slug" box (the page's address on the site) is shown without a visit to Screen Options.
 *
 * @param string[]  $hidden Boxes hidden by default.
 * @param WP_Screen $screen Current screen.
 * @return string[]
 */
function ndm_headless_concern_show_slug( $hidden, $screen ) {
	return NDM_CONCERN_POST_TYPE === $screen->post_type ? array_values( array_diff( $hidden, array( 'slugdiv' ) ) ) : $hidden;
}
add_filter( 'default_hidden_meta_boxes', 'ndm_headless_concern_show_slug', 10, 2 );

/**
 * Under the title: where the page is on the site, and what the site fills in by itself.
 *
 * @param WP_Post $post The concern.
 */
function ndm_headless_concern_intro( $post ) {
	if ( NDM_CONCERN_POST_TYPE !== $post->post_type ) {
		return;
	}

	$site = untrailingslashit( esc_url_raw( ndm_headless_setting( 'NDM_FRONTEND_URL' ), array( 'http', 'https' ) ) );
	$slug = $post->post_name;

	echo '<div class="ndm-cn-intro">';
	if ( '' !== $slug && '' !== $site ) {
		$url = $site . '/' . $slug;
		echo '<p><strong>Page on the site:</strong> <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>' . ( 'publish' === $post->post_status ? '' : ' (shown once published)' ) . '</p>';
	} else {
		echo '<p><strong>Page on the site:</strong> its address is the "Slug" below, made from the title when the concern is first saved.</p>';
	}
	echo '<p>Filled in by the site on every concern page, not typed here: prices (from the price list), the number of options, the "In short" sentence, the section bar, the booking form, Why NewDermaMed, Our team, Testimonials, Visit us and Start your journey.</p>';
	echo '</div>';
}
add_action( 'edit_form_after_title', 'ndm_headless_concern_intro' );

/**
 * What a stored product choice ("product:<id>" or "category:<slug>") points at, or null when it is
 * gone from WooCommerce.
 *
 * @param string $value Stored value.
 * @return array|null value, label, note (its category, or "Whole category"), and for a product: id, name, description, category, image.
 */
function ndm_headless_concern_source( $value ) {
	if ( ! function_exists( 'wc_get_product' ) || ! preg_match( '/^(category|product):(.+)$/', $value, $m ) ) {
		return null;
	}

	if ( 'category' === $m[1] ) {
		$term = get_term_by( 'slug', $m[2], 'product_cat' );

		return $term ? array(
			'value' => $value,
			'label' => html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' ),
			'note'  => 'Whole category: its lowest price',
		) : null;
	}

	$product = wc_get_product( (int) $m[2] );
	if ( ! $product || 'publish' !== $product->get_status() ) {
		return null;
	}

	$terms = get_the_terms( $product->get_id(), 'product_cat' );

	return array(
		'value'       => $value,
		'label'       => html_entity_decode( $product->get_name(), ENT_QUOTES, 'UTF-8' ),
		'note'        => is_array( $terms ) && $terms ? html_entity_decode( $terms[0]->name, ENT_QUOTES, 'UTF-8' ) : '',
		'id'          => $product->get_id(),
		'name'        => html_entity_decode( $product->get_name(), ENT_QUOTES, 'UTF-8' ),
		'description' => html_entity_decode( wp_strip_all_tags( $product->get_short_description() ), ENT_QUOTES, 'UTF-8' ),
		'category'    => is_array( $terms ) && $terms ? html_entity_decode( $terms[0]->name, ENT_QUOTES, 'UTF-8' ) : '',
		'image'       => (int) $product->get_image_id(),
	);
}

/**
 * GET ndm/v1/concern-products?search=: products (and whole categories, unless only=product) of the
 * price list for the edit screen's product search. For signed-in editors only.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function ndm_headless_concern_rest_products( $request ) {
	$search = trim( (string) $request['search'] );
	$found  = array();

	if ( ! function_exists( 'wc_get_products' ) ) {
		return rest_ensure_response( $found );
	}

	if ( '' !== $search && 'product' !== $request['only'] ) {
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => true,
				'search'     => $search,
				'number'     => 5,
			)
		);
		foreach ( is_array( $terms ) ? $terms : array() as $term ) {
			$source = ndm_headless_concern_source( 'category:' . $term->slug );
			if ( $source ) {
				$found[] = $source;
			}
		}
	}

	$args = array(
		'status'  => 'publish',
		'limit'   => 20,
		'orderby' => 'title',
		'order'   => 'ASC',
	);
	if ( '' !== $search ) {
		$args['s'] = $search;
	}
	foreach ( wc_get_products( $args ) as $product ) {
		$source = ndm_headless_concern_source( 'product:' . $product->get_id() );
		if ( $source ) {
			$found[] = $source;
		}
	}

	return rest_ensure_response( $found );
}

/**
 * Prints one field.
 *
 * @param array  $field Field definition.
 * @param string $name  Input name.
 * @param mixed  $value Stored value.
 */
function ndm_headless_concern_field( $field, $name, $value ) {
	$id   = 'f-' . md5( $name );
	$help = empty( $field['help'] ) ? '' : '<span class="ndm-cn-help">' . esc_html( $field['help'] ) . '</span>';

	echo '<div class="ndm-cn-field ndm-cn-' . esc_attr( $field['type'] ) . '" data-key="' . esc_attr( $field['key'] ) . '">';

	switch ( $field['type'] ) {
		case 'checkbox':
			echo '<label><input type="checkbox" name="' . esc_attr( $name ) . '" value="1"' . checked( ! empty( $value ), true, false ) . '> ' . esc_html( $field['label'] ) . '</label>' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
			break;

		case 'image':
			$image_id = absint( $value );
			$src      = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : '';
			echo '<span class="ndm-cn-label">' . esc_html( $field['label'] ) . '</span>';
			echo '<div class="ndm-cn-image-row">';
			echo '<img class="ndm-cn-preview" alt="" src="' . esc_url( (string) $src ) . '"' . ( $src ? '' : ' hidden' ) . '>';
			echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="' . esc_attr( $image_id ? (string) $image_id : '' ) . '">';
			echo '<button type="button" class="button ndm-cn-pick">Choose photo</button> ';
			echo '<button type="button" class="button-link ndm-cn-unpick"' . ( $src ? '' : ' hidden' ) . '>Remove</button>';
			echo '</div>' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
			break;

		case 'select':
			echo '<label class="ndm-cn-label" for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label>';
			echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">';
			foreach ( $field['options'] as $option ) {
				echo '<option' . selected( $value, $option, false ) . '>' . esc_html( $option ) . '</option>';
			}
			echo '</select>' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
			break;

		case 'posts':
			$type = isset( $field['post_type'] ) ? $field['post_type'] : 'post';
			$noun = isset( $field['noun'] ) ? $field['noun'] : 'posts';
			echo '<span class="ndm-cn-label">' . esc_html( $field['label'] ) . '</span>';
			// Posted even when nothing is chosen, so an emptied list is saved as empty.
			echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="">';
			echo '<ol class="ndm-cn-chosen" data-name="' . esc_attr( $name ) . '[]">';
			foreach ( is_array( $value ) ? $value : array() as $post_id ) {
				$chosen = get_post( $post_id );
				if ( $chosen instanceof WP_Post && $type === $chosen->post_type ) {
					ndm_headless_concern_chosen_post( $name . '[]', $chosen );
				}
			}
			echo '</ol>';
			echo '<div class="ndm-cn-search">';
			echo '<label class="screen-reader-text" for="' . esc_attr( $id ) . '">Search ' . esc_html( $noun ) . '</label>';
			echo '<input type="search" id="' . esc_attr( $id ) . '" class="regular-text ndm-cn-search-box" placeholder="Search ' . esc_attr( $noun ) . '" autocomplete="off" data-rest="' . esc_attr( isset( $field['rest'] ) ? $field['rest'] : 'posts' ) . '" data-noun="' . esc_attr( $noun ) . '"' . ( 'post' === $type ? ' data-dated="1"' : '' ) . '>';
			echo '<span class="spinner"></span>';
			echo '<ul class="ndm-cn-found" aria-live="polite"></ul>';
			echo '</div>';
			echo '<span class="ndm-cn-help">Type to search, or click in the box to see the newest ' . esc_html( $noun ) . '. Click one to add it; use the arrows to change the order.</span>';
			break;

		case 'product':
			$picked = ndm_headless_concern_source( (string) $value );
			echo '<span class="ndm-cn-label">' . esc_html( $field['label'] ) . '</span>';
			echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $value ) . '" class="ndm-cn-source-value">';
			echo '<p class="ndm-cn-source-now">';
			echo '<strong class="ndm-cn-source-name">' . esc_html( $picked ? $picked['label'] : ( '' !== (string) $value ? 'No longer in WooCommerce' : '' ) ) . '</strong> ';
			echo '<span class="ndm-cn-source-note">' . esc_html( $picked ? $picked['note'] : '' ) . '</span> ';
			echo '<button type="button" class="button-link button-link-delete ndm-cn-source-clear"' . ( '' === (string) $value ? ' hidden' : '' ) . '>Remove product</button>';
			echo '</p>';
			echo '<div class="ndm-cn-search">';
			echo '<label class="screen-reader-text" for="' . esc_attr( $id ) . '">Search products</label>';
			echo '<input type="search" id="' . esc_attr( $id ) . '" class="regular-text ndm-cn-search-box ndm-cn-source-box" placeholder="Search products" autocomplete="off"' . ( isset( $field['only'] ) ? ' data-only="' . esc_attr( $field['only'] ) . '"' : '' ) . '>';
			echo '<span class="spinner"></span>';
			echo '<ul class="ndm-cn-found" aria-live="polite"></ul>';
			echo '</div>' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
			break;

		case 'lines':
		case 'textarea':
			$text = is_array( $value ) ? implode( "\n", $value ) : (string) $value;
			$rows = isset( $field['rows'] ) ? (int) $field['rows'] : 3;
			echo '<label class="ndm-cn-label" for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label>';
			echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" rows="' . esc_attr( (string) $rows ) . '" class="large-text">' . esc_textarea( $text ) . '</textarea>' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
			break;

		case 'repeater':
			$rows = is_array( $value ) ? array_values( $value ) : array();
			echo '<span class="ndm-cn-label">' . esc_html( $field['label'] ) . '</span>' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
			echo '<div class="ndm-cn-rows" data-title="' . esc_attr( isset( $field['title'] ) ? $field['title'] : '' ) . '">';
			foreach ( $rows as $i => $row ) {
				ndm_headless_concern_row( $field, $name . '[' . $i . ']', $row );
			}
			echo '</div>';
			// A blank row, copied by the "Add" button; __i__ becomes the new row's number.
			echo '<template>';
			ndm_headless_concern_row( $field, $name . '[__i__]', array() );
			echo '</template>';
			echo '<p><button type="button" class="button ndm-cn-add">' . esc_html( isset( $field['add'] ) ? $field['add'] : 'Add a row' ) . '</button></p>';
			break;

		default:
			echo '<label class="ndm-cn-label" for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label>';
			echo '<input type="text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $value ) . '" class="large-text">' . $help; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
	}

	echo '</div>';
}

/**
 * Prints one chosen post of a "posts" field.
 *
 * @param string  $name Input name.
 * @param WP_Post $post The post.
 */
function ndm_headless_concern_chosen_post( $name, $post ) {
	$state = 'publish' === $post->post_status ? '' : ' (not published: hidden on the site)';
	// A blog post shows its date; a Before & After case its categories (the treatment).
	if ( 'post' === $post->post_type ) {
		$note = get_the_date( 'F j, Y', $post );
	} else {
		$terms = get_the_terms( $post, NDM_BA_TAXONOMY );
		$note  = is_array( $terms ) ? html_entity_decode( implode( ', ', wp_list_pluck( $terms, 'name' ) ), ENT_QUOTES, 'UTF-8' ) : '';
	}

	echo '<li class="ndm-cn-post">';
	echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $post->ID ) . '">';
	echo '<span class="ndm-cn-post-title">' . esc_html( html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ) ) . '</span>';
	echo '<span class="ndm-cn-post-date">' . esc_html( $note . $state ) . '</span>';
	echo '<span class="ndm-cn-row-tools">';
	echo '<button type="button" class="button-link ndm-cn-post-up" aria-label="Move up">&uarr;</button>';
	echo '<button type="button" class="button-link ndm-cn-post-down" aria-label="Move down">&darr;</button>';
	echo '<button type="button" class="button-link button-link-delete ndm-cn-post-remove">Remove</button>';
	echo '</span></li>';
}

/**
 * Prints one row of a repeater.
 *
 * @param array  $field Repeater definition.
 * @param string $name  Input name of the row.
 * @param array  $row   Stored values.
 */
function ndm_headless_concern_row( $field, $name, $row ) {
	$title_key = isset( $field['title'] ) ? $field['title'] : '';
	$title     = '' !== $title_key && ! empty( $row[ $title_key ] ) ? (string) $row[ $title_key ] : '';
	// A treatment without a title of its own is named by its product.
	if ( '' === $title && ! empty( $row['price_source'] ) ) {
		$source = ndm_headless_concern_source( (string) $row['price_source'] );
		$title  = $source ? $source['label'] : '';
	}
	$compact   = count( $field['fields'] ) <= 3;

	// Every stored row starts closed; only a row that was just added (the blank template) is open, ready to type in.
	echo '<details class="ndm-cn-row' . ( $compact ? ' is-compact' : '' ) . '"' . ( array() === $row ? ' open' : '' ) . '>';
	echo '<summary><span class="ndm-cn-row-title">' . esc_html( $title ) . '</span>';
	echo '<span class="ndm-cn-row-tools">';
	echo '<button type="button" class="button-link ndm-cn-up" aria-label="Move up">&uarr;</button>';
	echo '<button type="button" class="button-link ndm-cn-down" aria-label="Move down">&darr;</button>';
	echo '<button type="button" class="button-link button-link-delete ndm-cn-remove">Remove</button>';
	echo '</span></summary>';
	echo '<div class="ndm-cn-row-body">';
	foreach ( $field['fields'] as $sub ) {
		ndm_headless_concern_field( $sub, $name . '[' . $sub['key'] . ']', isset( $row[ $sub['key'] ] ) ? $row[ $sub['key'] ] : '' );
	}
	echo '</div></details>';
}

/**
 * Styles and the small script of the edit screen (rows, photo picker).
 *
 * @param string $hook Admin page.
 */
function ndm_headless_concern_assets( $hook ) {
	$screen = get_current_screen();

	// Other post types built from the same fields (Procedures) add themselves to this list.
	$types = apply_filters( 'ndm_headless_field_post_types', array( NDM_CONCERN_POST_TYPE ) );

	if ( ! $screen || ! in_array( $screen->post_type, $types, true ) || ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}

	wp_enqueue_media();

	$css = '
.ndm-cn-intro{margin:14px 0 4px;padding:12px 16px;background:#fff;border-left:4px solid #0f80c3;box-shadow:0 1px 1px rgba(0,0,0,.04)}
.ndm-cn-intro p{margin:.3em 0}
.ndm-cn-note{margin:0 0 12px;color:#50575e}
.ndm-cn-field{margin:0 0 14px}
.ndm-cn-label{display:block;margin-bottom:4px;font-weight:600}
.ndm-cn-help{display:block;margin-top:3px;color:#646970;font-size:12px}
.ndm-cn-image-row{display:flex;align-items:center;gap:10px}
.ndm-cn-row-body>.ndm-cn-product{grid-column:1/-1}
.ndm-cn-source-now{margin:0 0 6px}
.ndm-cn-source-name:empty::before{content:"No product picked";font-weight:400;color:#646970}
.ndm-cn-source-note{color:#646970}
.ndm-cn-chosen{margin:0 0 10px;padding:0;list-style:none;counter-reset:ndmpost}
.ndm-cn-post{display:flex;align-items:center;gap:12px;margin:0 0 6px;padding:8px 12px;border:1px solid #dcdcde;border-radius:4px;background:#f6f7f7;counter-increment:ndmpost}
.ndm-cn-post::before{content:counter(ndmpost) ".";color:#646970}
.ndm-cn-post-title{flex:1;min-width:0;font-weight:600}
.ndm-cn-post-date{color:#646970;white-space:nowrap}
.ndm-cn-search{position:relative;max-width:520px}
.ndm-cn-search .ndm-cn-search-box{width:100%}
.ndm-cn-search .spinner{position:absolute;right:6px;top:4px;float:none;margin:0}
.ndm-cn-found{margin:4px 0 0;padding:0;list-style:none;border:1px solid #dcdcde;border-radius:4px;background:#fff;max-height:260px;overflow:auto}
.ndm-cn-found:empty{display:none}
.ndm-cn-found li{margin:0;border-bottom:1px solid #f0f0f1}
.ndm-cn-found li:last-child{border-bottom:0}
.ndm-cn-found button{display:flex;justify-content:space-between;gap:12px;width:100%;padding:8px 12px;border:0;background:none;text-align:left;cursor:pointer}
.ndm-cn-found button:hover,.ndm-cn-found button:focus{background:#f0f6fc}
.ndm-cn-found button[disabled]{color:#a7aaad;cursor:default;background:none}
.ndm-cn-found .ndm-cn-none{padding:8px 12px;color:#646970}
.ndm-cn-preview{width:96px;height:64px;object-fit:cover;border-radius:4px;background:#f0f0f1}
.ndm-cn-row{margin:0 0 8px;border:1px solid #dcdcde;border-radius:4px;background:#f6f7f7}
.ndm-cn-row>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;cursor:pointer;font-weight:600}
.ndm-cn-row-title:empty::before{content:"(new)";color:#646970;font-weight:400}
.ndm-cn-row-tools{display:flex;gap:12px;align-items:center;font-weight:400}
.ndm-cn-row-tools .button-link{text-decoration:none}
.ndm-cn-row-body{padding:12px 12px 2px;background:#fff;border-top:1px solid #dcdcde;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}
.ndm-cn-row-body>.ndm-cn-textarea,.ndm-cn-row-body>.ndm-cn-lines,.ndm-cn-row-body>.ndm-cn-image{grid-column:1/-1}
@media (max-width:782px){.ndm-cn-row-body{grid-template-columns:1fr}}
';

	$js = <<<'JS'
(function () {
  var seq = Date.now();
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;

    if (t.matches('.ndm-cn-add')) {
      var field = t.closest('.ndm-cn-repeater');
      var tpl = field.querySelector(':scope > template');
      var holder = document.createElement('div');
      holder.innerHTML = tpl.innerHTML.replace(/__i__/g, 'n' + (seq++));
      var row = holder.firstElementChild;
      field.querySelector(':scope > .ndm-cn-rows').appendChild(row);
      row.open = true;
      var first = row.querySelector('input[type=text],textarea');
      if (first) first.focus();
      return;
    }

    var tool = t.closest('.ndm-cn-up,.ndm-cn-down,.ndm-cn-remove');
    if (tool) {
      e.preventDefault();
      var r = tool.closest('.ndm-cn-row');
      if (tool.matches('.ndm-cn-remove')) {
        if (window.confirm('Remove this row?')) r.remove();
      } else if (tool.matches('.ndm-cn-up') && r.previousElementSibling) {
        r.parentNode.insertBefore(r, r.previousElementSibling);
      } else if (tool.matches('.ndm-cn-down') && r.nextElementSibling) {
        r.parentNode.insertBefore(r.nextElementSibling, r);
      }
      return;
    }

    if (t.matches('.ndm-cn-pick')) {
      var box = t.closest('.ndm-cn-image');
      var frame = wp.media({ title: 'Choose a photo', library: { type: 'image' }, multiple: false, button: { text: 'Use this photo' } });
      frame.on('select', function () {
        var a = frame.state().get('selection').first().toJSON();
        box.querySelector('input[type=hidden]').value = a.id;
        var img = box.querySelector('.ndm-cn-preview');
        img.src = (a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url);
        img.hidden = false;
        box.querySelector('.ndm-cn-unpick').hidden = false;
      });
      frame.open();
      return;
    }

    if (t.matches('.ndm-cn-unpick')) {
      var b = t.closest('.ndm-cn-image');
      b.querySelector('input[type=hidden]').value = '';
      b.querySelector('.ndm-cn-preview').hidden = true;
      t.hidden = true;
    }
  });

  /* "posts" fields: search WordPress posts, click one to add it, reorder or remove the chosen ones */
  var timer;
  function chosenIds(field) {
    return Array.prototype.map.call(field.querySelectorAll('.ndm-cn-chosen input'), function (i) { return String(i.value); });
  }
  function searchPosts(box) {
    var field = box.closest('.ndm-cn-posts');
    var list = field.querySelector('.ndm-cn-found');
    var spinner = field.querySelector('.spinner');
    var term = box.value.trim();
    spinner.classList.add('is-active');
    var dated = box.hasAttribute('data-dated');
    var noun = box.getAttribute('data-noun') || 'posts';
    wp.apiFetch({ path: '/wp/v2/' + box.getAttribute('data-rest') + '?status=publish&per_page=20&_fields=id,title,date&orderby=' + (term ? 'relevance' : 'date') + (term ? '&search=' + encodeURIComponent(term) : '') })
      .then(function (posts) {
        if (box.value.trim() !== term) return;
        var have = chosenIds(field);
        list.textContent = '';
        if (!posts.length) {
          var none = document.createElement('li');
          none.className = 'ndm-cn-none';
          none.textContent = term ? 'Nothing published matches.' : 'There are no published ' + noun + ' yet.';
          list.appendChild(none);
        }
        posts.forEach(function (p) {
          var holder = document.createElement('textarea');
          holder.innerHTML = p.title.rendered;
          var li = document.createElement('li');
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'ndm-cn-found-post';
          b.dataset.id = p.id;
          b.dataset.title = holder.value || '(no title)';
          b.dataset.date = dated ? new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
          b.disabled = have.indexOf(String(p.id)) !== -1;
          var t = document.createElement('span');
          t.textContent = b.dataset.title + (b.disabled ? ' (added)' : '');
          var d = document.createElement('span');
          d.textContent = b.dataset.date;
          b.appendChild(t);
          b.appendChild(d);
          li.appendChild(b);
          list.appendChild(li);
        });
      })
      .catch(function () {
        list.textContent = '';
        var li = document.createElement('li');
        li.className = 'ndm-cn-none';
        li.textContent = 'The search did not work. Try again.';
        list.appendChild(li);
      })
      .then(function () { spinner.classList.remove('is-active'); });
  }
  /* "product" fields: search the WooCommerce price list and pick one product (or a whole category) */
  function searchProducts(box) {
    var field = box.closest('.ndm-cn-product');
    var list = field.querySelector('.ndm-cn-found');
    var spinner = field.querySelector('.spinner');
    var term = box.value.trim();
    spinner.classList.add('is-active');
    wp.apiFetch({ path: '/ndm/v1/concern-products?search=' + encodeURIComponent(term) + (box.getAttribute('data-only') ? '&only=' + box.getAttribute('data-only') : '') })
      .then(function (items) {
        if (box.value.trim() !== term) return;
        list.textContent = '';
        if (!items.length) {
          var none = document.createElement('li');
          none.className = 'ndm-cn-none';
          none.textContent = 'No product matches.';
          list.appendChild(none);
        }
        items.forEach(function (it) {
          var li = document.createElement('li');
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'ndm-cn-found-source';
          b.dataset.value = it.value;
          b.dataset.label = it.label;
          b.dataset.note = it.note;
          var t = document.createElement('span');
          t.textContent = it.label;
          var d = document.createElement('span');
          d.textContent = it.note;
          b.appendChild(t);
          b.appendChild(d);
          li.appendChild(b);
          list.appendChild(li);
        });
      })
      .catch(function () {
        list.textContent = '';
        var li = document.createElement('li');
        li.className = 'ndm-cn-none';
        li.textContent = 'The search did not work. Try again.';
        list.appendChild(li);
      })
      .then(function () { spinner.classList.remove('is-active'); });
  }
  function search(box) {
    if (box.matches('.ndm-cn-source-box')) searchProducts(box); else searchPosts(box);
  }
  /* the row's bar shows the product's name while the row has no title of its own */
  function rowTitle(field, label) {
    var row = field.closest('.ndm-cn-row');
    if (!row) return;
    var title = row.querySelector(':scope > .ndm-cn-row-body > [data-key="name"] input');
    if (title) title.placeholder = label;
    if (title && !title.value) row.querySelector(':scope > summary .ndm-cn-row-title').textContent = label;
  }
  document.addEventListener('click', function (e) {
    var t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    var pick = t.closest('.ndm-cn-found-source');
    var clear = t.closest('.ndm-cn-source-clear');
    if (!pick && !clear) return;
    var field = t.closest('.ndm-cn-product');
    field.querySelector('.ndm-cn-source-value').value = pick ? pick.dataset.value : '';
    field.querySelector('.ndm-cn-source-name').textContent = pick ? pick.dataset.label : '';
    field.querySelector('.ndm-cn-source-note').textContent = pick ? pick.dataset.note : '';
    field.querySelector('.ndm-cn-source-clear').hidden = !pick;
    field.querySelector('.ndm-cn-found').textContent = '';
    field.querySelector('.ndm-cn-source-box').value = '';
    rowTitle(field, pick ? pick.dataset.label : '');
  });

  document.addEventListener('input', function (e) {
    if (e.target instanceof Element && e.target.matches('.ndm-cn-search-box')) {
      var box = e.target;
      clearTimeout(timer);
      timer = setTimeout(function () { search(box); }, 250);
    }
  });
  document.addEventListener('focusin', function (e) {
    if (e.target instanceof Element && e.target.matches('.ndm-cn-search-box') && !e.target.closest('.ndm-cn-field').querySelector('.ndm-cn-found').children.length) search(e.target);
  });
  document.addEventListener('keydown', function (e) {
    /* Enter in the search box searches; it must not save the whole concern */
    if (e.key === 'Enter' && e.target instanceof Element && e.target.matches('.ndm-cn-search-box')) {
      e.preventDefault();
      clearTimeout(timer);
      search(e.target);
    }
  });
  document.addEventListener('click', function (e) {
    var t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    var found = t.closest('.ndm-cn-found-post');
    if (found && !found.disabled) {
      var field = found.closest('.ndm-cn-posts');
      var chosen = field.querySelector('.ndm-cn-chosen');
      var li = document.createElement('li');
      li.className = 'ndm-cn-post';
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = chosen.getAttribute('data-name');
      input.value = found.dataset.id;
      var title = document.createElement('span');
      title.className = 'ndm-cn-post-title';
      title.textContent = found.dataset.title;
      var date = document.createElement('span');
      date.className = 'ndm-cn-post-date';
      date.textContent = found.dataset.date;
      var tools = document.createElement('span');
      tools.className = 'ndm-cn-row-tools';
      tools.innerHTML = '<button type="button" class="button-link ndm-cn-post-up" aria-label="Move up">&uarr;</button><button type="button" class="button-link ndm-cn-post-down" aria-label="Move down">&darr;</button><button type="button" class="button-link button-link-delete ndm-cn-post-remove">Remove</button>';
      li.appendChild(input);
      li.appendChild(title);
      li.appendChild(date);
      li.appendChild(tools);
      chosen.appendChild(li);
      found.disabled = true;
      found.firstChild.textContent += ' (added)';
      return;
    }
    var tool = t.closest('.ndm-cn-post-up,.ndm-cn-post-down,.ndm-cn-post-remove');
    if (tool) {
      var row = tool.closest('.ndm-cn-post');
      if (tool.matches('.ndm-cn-post-remove')) {
        var f = row.closest('.ndm-cn-posts');
        row.remove();
        f.querySelector('.ndm-cn-found').textContent = '';
      } else if (tool.matches('.ndm-cn-post-up') && row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
      } else if (tool.matches('.ndm-cn-post-down') && row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
      }
    }
  });

  /* a row's bar shows what was typed into its title field */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    var row = t.closest('.ndm-cn-row');
    if (!row) return;
    var key = row.parentNode.getAttribute('data-title');
    var own = t.closest('.ndm-cn-field');
    if (key && own && own.parentNode === row.querySelector(':scope > .ndm-cn-row-body') && own.getAttribute('data-key') === key) {
      row.querySelector(':scope > summary .ndm-cn-row-title').textContent = t.value;
    }
  });
})();
JS;

	wp_register_style( 'ndm-concern-admin', false, array(), NDM_HEADLESS_VERSION );
	wp_enqueue_style( 'ndm-concern-admin' );
	wp_add_inline_style( 'ndm-concern-admin', $css );

	wp_register_script( 'ndm-concern-admin', false, array( 'media-editor', 'wp-api-fetch' ), NDM_HEADLESS_VERSION, true );
	wp_enqueue_script( 'ndm-concern-admin' );
	wp_add_inline_script( 'ndm-concern-admin', $js );
}
add_action( 'admin_enqueue_scripts', 'ndm_headless_concern_assets' );

/**
 * Saves the fields of the edit screen.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_concern_save( $post_id ) {
	if ( ! isset( $_POST['ndm_concern_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['ndm_concern_nonce'] ) ), 'ndm_concern_save' ) ) {
		return;
	}

	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every field is cleaned by its type in ndm_headless_concern_clean_all().
	$input = isset( $_POST['ndm_concern'] ) ? wp_unslash( $_POST['ndm_concern'] ) : array();

	update_post_meta( $post_id, NDM_CONCERN_META, wp_slash( ndm_headless_concern_clean_all( $input ) ) );
}
add_action( 'save_post_' . NDM_CONCERN_POST_TYPE, 'ndm_headless_concern_save' );

/**
 * The list of concerns shows each page's address.
 *
 * @param string[] $columns Columns.
 * @return string[]
 */
function ndm_headless_concern_columns( $columns ) {
	$out = array();

	foreach ( $columns as $key => $label ) {
		$out[ $key ] = $label;
		if ( 'title' === $key ) {
			$out['ndm_address'] = 'Address on the site';
		}
	}

	return $out;
}
add_filter( 'manage_' . NDM_CONCERN_POST_TYPE . '_posts_columns', 'ndm_headless_concern_columns' );

/**
 * Prints the address column.
 *
 * @param string $column  Column.
 * @param int    $post_id Post ID.
 */
function ndm_headless_concern_column( $column, $post_id ) {
	if ( 'ndm_address' === $column ) {
		echo esc_html( '/' . get_post_field( 'post_name', $post_id ) );
	}
}
add_action( 'manage_' . NDM_CONCERN_POST_TYPE . '_posts_custom_column', 'ndm_headless_concern_column', 10, 2 );

/*
 * ---------------------------------------------------------------------------------------------
 * What the site reads
 * ---------------------------------------------------------------------------------------------
 */

/**
 * A photo of the media library as the site receives it, or null.
 *
 * @param int $image_id Attachment ID.
 * @return array|null
 */
function ndm_headless_concern_image( $image_id ) {
	$image = $image_id ? wp_get_attachment_image_src( $image_id, 'full' ) : false;

	if ( ! $image ) {
		return null;
	}

	return array(
		'id'     => (int) $image_id,
		'src'    => $image[0],
		'width'  => (int) $image[1],
		'height' => (int) $image[2],
		'alt'    => (string) get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
	);
}

/**
 * A post as a card of "From the journal": its own title, date, first category, featured image and
 * excerpt. Null when the post is not published (any more).
 *
 * @param int $post_id Post ID.
 * @return array|null
 */
function ndm_headless_concern_post_card( $post_id ) {
	$post = get_post( $post_id );

	if ( ! $post instanceof WP_Post || 'post' !== $post->post_type || 'publish' !== $post->post_status ) {
		return null;
	}

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
		$excerpt = wp_trim_words( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ), 40, ' …' );
	}

	return array(
		'id'      => $post->ID,
		'slug'    => $post->post_name,
		'title'   => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'date'    => get_the_date( 'F j, Y', $post ),
		'topic'   => $topic,
		'image'   => ndm_headless_concern_image( (int) get_post_thumbnail_id( $post ) ),
		'excerpt' => html_entity_decode( wp_strip_all_tags( $excerpt ), ENT_QUOTES, 'UTF-8' ),
	);
}

/**
 * A case of the "Before & After" post type as a photo of the concern page: its photo (the featured
 * image) and its first category (the treatment shown). Null when the case is not published or has no photo.
 *
 * @param int $post_id Post ID.
 * @return array|null
 */
function ndm_headless_concern_case_card( $post_id ) {
	$post  = get_post( $post_id );
	$image = $post instanceof WP_Post ? ndm_headless_concern_image( (int) get_post_thumbnail_id( $post ) ) : null;

	if ( ! $image || NDM_BA_POST_TYPE !== $post->post_type || 'publish' !== $post->post_status ) {
		return null;
	}

	$terms = get_the_terms( $post, NDM_BA_TAXONOMY );

	return array(
		'id'    => $post->ID,
		'title' => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'label' => is_array( $terms ) && $terms ? html_entity_decode( $terms[0]->name, ENT_QUOTES, 'UTF-8' ) : '',
		'image' => $image,
	);
}

/**
 * Replaces photo IDs with the photos themselves, through a list of fields.
 *
 * @param array[] $fields Field definitions.
 * @param array   $values Values by key.
 * @return array
 */
function ndm_headless_concern_expand( $fields, $values ) {
	foreach ( $fields as $field ) {
		$key = $field['key'];

		if ( 'image' === $field['type'] ) {
			$values[ $key ] = ndm_headless_concern_image( (int) $values[ $key ] );
		} elseif ( 'product' === $field['type'] ) {
			$source            = ndm_headless_concern_source( (string) $values[ $key ] );
			$values['product'] = $source && isset( $source['id'] ) ? array(
				'id'          => $source['id'],
				'name'        => $source['name'],
				'description' => $source['description'],
				'category'    => $source['category'],
				'image'       => ndm_headless_concern_image( $source['image'] ),
			) : null;
		} elseif ( 'posts' === $field['type'] ) {
			$card           = isset( $field['post_type'] ) && NDM_BA_POST_TYPE === $field['post_type'] ? 'ndm_headless_concern_case_card' : 'ndm_headless_concern_post_card';
			$values[ $key ] = array_values( array_filter( array_map( $card, $values[ $key ] ) ) );
		} elseif ( 'repeater' === $field['type'] ) {
			foreach ( $values[ $key ] as $i => $row ) {
				$values[ $key ][ $i ] = ndm_headless_concern_expand( $field['fields'], $row );
			}
		}
	}

	return $values;
}

/**
 * A concern as the site receives it.
 *
 * @param WP_Post $post The concern.
 * @return array
 */
function ndm_headless_concern_answer( $post ) {
	$content = ndm_headless_concern_content( $post->ID );

	foreach ( ndm_headless_concern_schema() as $group ) {
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
function ndm_headless_concern_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/concerns',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_concern_rest_list',
			// Public on purpose: it holds only what the public pages show.
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/concern-products',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_concern_rest_products',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/concerns/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'ndm_headless_concern_rest_one',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_concern_routes' );

/**
 * GET ndm/v1/concerns: every published concern's name and address, by name.
 *
 * @return WP_REST_Response
 */
function ndm_headless_concern_rest_list() {
	$posts = get_posts(
		array(
			'post_type'   => NDM_CONCERN_POST_TYPE,
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
 * GET ndm/v1/concerns/<slug>: one published concern.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_concern_rest_one( $request ) {
	$posts = get_posts(
		array(
			'post_type'   => NDM_CONCERN_POST_TYPE,
			'post_status' => 'publish',
			'name'        => (string) $request['slug'],
			'numberposts' => 1,
		)
	);

	if ( ! $posts ) {
		return new WP_Error( 'ndm_concern_not_found', 'No published concern has this address.', array( 'status' => 404 ) );
	}

	return rest_ensure_response( ndm_headless_concern_answer( $posts[0] ) );
}

/*
 * ---------------------------------------------------------------------------------------------
 * Telling the site about changes
 * ---------------------------------------------------------------------------------------------
 */

/**
 * Queues one "concerns changed" call to the Next.js site for the end of this request.
 */
function ndm_headless_concern_changed() {
	static $queued = false;

	if ( $queued ) {
		return;
	}

	$queued = true;
	add_action( 'shutdown', 'ndm_headless_concern_notify_frontend' );
}

/**
 * A concern was saved, trashed, restored or deleted.
 *
 * @param int $post_id Post ID.
 */
function ndm_headless_concern_post_changed( $post_id ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	// A post may be a card of "From the journal", a Before & After case a photo, on a concern page.
	if ( in_array( get_post_type( $post_id ), array( NDM_CONCERN_POST_TYPE, 'post', NDM_BA_POST_TYPE ), true ) ) {
		ndm_headless_concern_changed();
	}
}
add_action( 'save_post', 'ndm_headless_concern_post_changed' );
add_action( 'trashed_post', 'ndm_headless_concern_post_changed' );
add_action( 'untrashed_post', 'ndm_headless_concern_post_changed' );
add_action( 'before_delete_post', 'ndm_headless_concern_post_changed' );

/**
 * A concern's content or header photo changed (both are post meta).
 *
 * @param int|string[] $meta_id  Meta ID (or IDs on delete).
 * @param int          $post_id  Post ID.
 * @param string       $meta_key Meta key.
 */
function ndm_headless_concern_meta_changed( $meta_id, $post_id, $meta_key ) {
	if ( '_thumbnail_id' === $meta_key && in_array( get_post_type( $post_id ), array( 'post', NDM_BA_POST_TYPE ), true ) ) {
		ndm_headless_concern_changed();
	}

	if ( in_array( $meta_key, array( '_thumbnail_id', NDM_CONCERN_META ), true ) && NDM_CONCERN_POST_TYPE === get_post_type( $post_id ) ) {
		ndm_headless_concern_changed();
	}
}
add_action( 'added_post_meta', 'ndm_headless_concern_meta_changed', 10, 3 );
add_action( 'updated_post_meta', 'ndm_headless_concern_meta_changed', 10, 3 );
add_action( 'deleted_post_meta', 'ndm_headless_concern_meta_changed', 10, 3 );

/**
 * A post's categories, or a case's, were changed: its card on a concern page shows the first one.
 *
 * @param int    $object_id Post ID.
 * @param array  $terms     Terms.
 * @param array  $tt_ids    Term taxonomy IDs.
 * @param string $taxonomy  Taxonomy.
 */
function ndm_headless_concern_terms_set( $object_id, $terms, $tt_ids, $taxonomy ) {
	if ( in_array( $taxonomy, array( 'category', NDM_BA_TAXONOMY ), true ) ) {
		ndm_headless_concern_changed();
	}
}
add_action( 'set_object_terms', 'ndm_headless_concern_terms_set', 10, 4 );

/**
 * Asks the Next.js server to clear its cached concerns. Fire and forget: a site that is down or not
 * configured never slows WordPress or fails a save.
 */
function ndm_headless_concern_notify_frontend() {
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
			'body'     => wp_json_encode( array( 'tag' => 'concerns' ) ),
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
	 * Puts a photo file into the media library once (a second request for the same file gets the first copy).
	 *
	 * @param string $dir  Folder the paths are relative to.
	 * @param string $path File, relative to the folder.
	 * @param string $alt  Alternative text.
	 * @return int Attachment ID, 0 when the file could not be imported.
	 */
	function ndm_headless_concern_import_image( $dir, $path, $alt ) {
		$path = ltrim( (string) $path, '/' );
		$file = $dir . '/' . $path;

		if ( '' === $path || false !== strpos( $path, '..' ) || ! is_readable( $file ) ) {
			WP_CLI::warning( "Photo not found: {$path}" );
			return 0;
		}

		$existing = get_posts(
			array(
				'post_type'   => 'attachment',
				'post_status' => 'inherit',
				'numberposts' => 1,
				'fields'      => 'ids',
				'meta_key'    => NDM_CONCERN_SOURCE_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- one-time import.
				'meta_value'  => $path, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- one-time import.
			)
		);
		if ( $existing ) {
			return (int) $existing[0];
		}

		// media_handle_sideload() moves the file it is given: hand it a copy.
		$copy = wp_tempnam( basename( $file ) );
		copy( $file, $copy );
		$image = media_handle_sideload(
			array(
				'name'     => basename( $file ),
				'tmp_name' => $copy,
			),
			0
		);
		if ( is_wp_error( $image ) ) {
			WP_CLI::warning( "Photo {$path}: " . $image->get_error_message() );
			return 0;
		}

		update_post_meta( $image, NDM_CONCERN_SOURCE_META, wp_slash( $path ) );
		if ( '' !== $alt ) {
			update_post_meta( $image, '_wp_attachment_image_alt', wp_slash( $alt ) );
		}

		return (int) $image;
	}

	/**
	 * Finds the post with this slug, or creates it: title, date, excerpt, one category and its photo.
	 * The body stays empty: the article's text is written in WordPress.
	 *
	 * @param array  $article slug, title, date (Y-m-d), topic, image (file path), excerpt.
	 * @param string $dir     Folder the photo path is relative to.
	 * @return int Post ID, 0 when it could not be created.
	 */
	function ndm_headless_concern_import_post( $article, $dir ) {
		$slug  = isset( $article['slug'] ) ? sanitize_title( (string) $article['slug'] ) : '';
		$title = isset( $article['title'] ) ? trim( (string) $article['title'] ) : '';

		if ( '' === $slug || '' === $title ) {
			return 0;
		}

		$existing = get_posts(
			array(
				'post_type'   => 'post',
				'name'        => $slug,
				'post_status' => 'any',
				'numberposts' => 1,
				'fields'      => 'ids',
			)
		);
		if ( $existing ) {
			return (int) $existing[0];
		}

		$category = 0;
		if ( ! empty( $article['topic'] ) ) {
			$term = term_exists( (string) $article['topic'], 'category' );
			if ( ! $term ) {
				$term = wp_insert_term( wp_slash( (string) $article['topic'] ), 'category' );
			}
			$category = is_array( $term ) ? (int) $term['term_id'] : 0;
		}

		$date = ! empty( $article['date'] ) ? gmdate( 'Y-m-d 09:00:00', (int) strtotime( (string) $article['date'] ) ) : '';
		$id   = wp_insert_post(
			array(
				'post_type'     => 'post',
				'post_status'   => 'publish',
				'post_name'     => $slug,
				'post_title'    => wp_slash( $title ),
				'post_excerpt'  => isset( $article['excerpt'] ) ? wp_slash( (string) $article['excerpt'] ) : '',
				'post_date'     => $date,
				'post_date_gmt' => $date ? get_gmt_from_date( $date ) : '',
				'post_category' => $category ? array( $category ) : array(),
			),
			true
		);
		if ( is_wp_error( $id ) ) {
			WP_CLI::warning( "Post {$slug}: " . $id->get_error_message() );
			return 0;
		}

		if ( ! empty( $article['image'] ) ) {
			$image = ndm_headless_concern_import_image( $dir, (string) $article['image'], '' );
			if ( $image ) {
				set_post_thumbnail( $id, $image );
			}
		}

		WP_CLI::log( "Created: post {$id} ({$slug})." );

		return (int) $id;
	}

	/**
	 * Imports the photos named in a list of fields (a file path where the edit screen holds a photo).
	 *
	 * @param array[] $fields Field definitions.
	 * @param array   $values Values by key.
	 * @param string  $dir    Folder the paths are relative to.
	 * @return array
	 */
	function ndm_headless_concern_import_images( $fields, $values, $dir ) {
		foreach ( $fields as $field ) {
			$key = $field['key'];

			if ( 'image' === $field['type'] && ! empty( $values[ $key ] ) && is_string( $values[ $key ] ) ) {
				$values[ $key ] = ndm_headless_concern_import_image( $dir, $values[ $key ], '' );
			} elseif ( 'repeater' === $field['type'] && ! empty( $values[ $key ] ) && is_array( $values[ $key ] ) ) {
				foreach ( $values[ $key ] as $i => $row ) {
					if ( is_array( $row ) ) {
						$values[ $key ][ $i ] = ndm_headless_concern_import_images( $field['fields'], $row, $dir );
					}
				}
			}
		}

		return $values;
	}

	/**
	 * Creates concerns from JSON on standard input:
	 *
	 *   [ { "slug": "wrinkles-fine-lines", "title": "Wrinkles & Fine Lines",
	 *       "hero": "assets/live/main/uploads/2025/09/16.jpg", "heroAlt": "...",
	 *       "content": { ...the fields of the edit screen; a photo is a file path; "journal" is a list of
 *                    posts (slug, title, date, topic, image, excerpt), each created when its slug is free;
 *                    "cases" is a list of titles of existing Before & After cases... } } ]
	 *
	 * A concern whose slug already exists (in any state, the trash included) is left exactly as it is,
	 * so running this again never overwrites an edit.
	 *
	 * ## OPTIONS
	 *
	 * --images=<dir>
	 * : Folder the photo paths are relative to.
	 *
	 * ## EXAMPLES
	 *
	 *     node ../web/scripts/export-concerns.mjs | docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm concerns-import --images=/tmp/site
	 */
	WP_CLI::add_command(
		'ndm concerns-import',
		function ( $args, $assoc_args ) {
			$concerns = json_decode( (string) file_get_contents( 'php://stdin' ), true );
			if ( ! is_array( $concerns ) || ! $concerns ) {
				WP_CLI::error( 'Expected a JSON list of concerns on standard input.' );
			}

			$dir = isset( $assoc_args['images'] ) ? rtrim( (string) $assoc_args['images'], '/' ) : '';
			if ( '' === $dir || ! is_dir( $dir ) ) {
				WP_CLI::error( 'Give the folder the photo paths are relative to: --images=<dir>.' );
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			foreach ( $concerns as $concern ) {
				$slug  = isset( $concern['slug'] ) ? sanitize_title( (string) $concern['slug'] ) : '';
				$title = isset( $concern['title'] ) ? trim( (string) $concern['title'] ) : '';

				if ( '' === $slug || '' === $title || empty( $concern['content'] ) || ! is_array( $concern['content'] ) ) {
					WP_CLI::warning( 'Skipped a concern without a slug, a title or content.' );
					continue;
				}

				$existing = get_posts(
					array(
						'post_type'   => NDM_CONCERN_POST_TYPE,
						'name'        => $slug,
						'post_status' => 'any, trash',
						'numberposts' => 1,
						'fields'      => 'ids',
					)
				);
				if ( ! $existing ) {
					// A trashed post's slug is "<slug>__trashed".
					$existing = get_posts(
						array(
							'post_type'   => NDM_CONCERN_POST_TYPE,
							'name'        => $slug . '__trashed',
							'post_status' => 'trash',
							'numberposts' => 1,
							'fields'      => 'ids',
						)
					);
				}
				if ( $existing ) {
					WP_CLI::log( "Kept: concern {$existing[0]} ({$slug}) already exists." );
					continue;
				}

				$content = $concern['content'];

				// "journal": posts described by the import; each is created once and then chosen.
				$journal = array();
				foreach ( isset( $content['journal'] ) && is_array( $content['journal'] ) ? $content['journal'] : array() as $article ) {
					$journal[] = ndm_headless_concern_import_post( $article, $dir );
				}
				$content['journal'] = array_values( array_filter( $journal ) );

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

				foreach ( ndm_headless_concern_schema() as $group ) {
					$content = ndm_headless_concern_import_images( $group['fields'], $content, $dir );
				}

				$id = wp_insert_post(
					array(
						'post_type'   => NDM_CONCERN_POST_TYPE,
						'post_status' => 'publish',
						'post_name'   => $slug,
						'post_title'  => wp_slash( $title ),
					),
					true
				);
				if ( is_wp_error( $id ) ) {
					WP_CLI::warning( "Concern {$slug}: " . $id->get_error_message() );
					continue;
				}

				update_post_meta( $id, NDM_CONCERN_META, wp_slash( ndm_headless_concern_clean_all( $content ) ) );

				if ( ! empty( $concern['hero'] ) ) {
					$hero = ndm_headless_concern_import_image( $dir, (string) $concern['hero'], isset( $concern['heroAlt'] ) ? (string) $concern['heroAlt'] : '' );
					if ( $hero ) {
						set_post_thumbnail( $id, $hero );
					}
				}

				WP_CLI::success( "Created: concern {$id} ({$slug})." );
			}
		}
	);
}

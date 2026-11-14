<?php
/**
 * The current offers ("monthly specials"): the cards of the Promotion page and of the offers wheel.
 *
 * An offer is a WooCommerce product that carries one piece of metadata (post meta on the product):
 *
 *   _ndm_promo   array  order  position on the page, 0 first
 *                       name   card title ("Lip Filler"); empty shows the product's own name
 *                       text   one line under the title
 *                       area   "Face" or "Body" (the page's filter)
 *                       icon   line icon of the card: pen, lips, syringe, hand, drop, face
 *                       focus  focus point of the photo, as "50% 40%"
 *                       scope  "product"  the card shows this treatment's lowest price and offer
 *                              "category" the card shows the lowest price and offer of its whole category
 *
 * Nothing here is a price: the price and the offer line of a card are worked out from WooCommerce's
 * own prices and the promotional labels of the price list. The photo is the product's own image.
 *
 * Routes (ndm/v1):
 *
 *   GET  /promotions             Public. The offers visitors see, in order.
 *   GET  /promotions/admin       Every offer, including ones the page cannot show yet.
 *   POST /promotions/admin/save  The whole list, in its new order: { "offers": [ ... ] }.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PROMO_META      = '_ndm_promo';
const NDM_PROMO_TRANSIENT = 'ndm_promotions_public';
const NDM_PROMO_MAX       = 30;
const NDM_PROMO_AREAS     = array( 'Face', 'Body' );
const NDM_PROMO_ICONS     = array( 'pen', 'lips', 'syringe', 'hand', 'drop', 'face' );
const NDM_PROMO_SCOPES    = array( 'product', 'category' );

/**
 * The stored settings of an offer, with every field present and of a known value.
 *
 * @param mixed $raw Stored metadata.
 * @return array<string,mixed>|null Null when the product is not an offer.
 */
function ndm_promo_settings( $raw ) {
	if ( ! is_array( $raw ) ) {
		return null;
	}

	$focus = isset( $raw['focus'] ) ? (string) $raw['focus'] : '';

	return array(
		'order' => isset( $raw['order'] ) ? (int) $raw['order'] : 0,
		'name'  => ndm_pricing_plain( $raw['name'] ?? '' ),
		'text'  => ndm_pricing_plain( $raw['text'] ?? '' ),
		'area'  => in_array( $raw['area'] ?? '', NDM_PROMO_AREAS, true ) ? $raw['area'] : 'Face',
		'icon'  => in_array( $raw['icon'] ?? '', NDM_PROMO_ICONS, true ) ? $raw['icon'] : 'drop',
		'focus' => preg_match( '/^\d{1,3}% \d{1,3}%$/', $focus ) ? $focus : '50% 50%',
		'scope' => in_array( $raw['scope'] ?? '', NDM_PROMO_SCOPES, true ) ? $raw['scope'] : 'product',
	);
}

/**
 * A product's own image, as the cards need it.
 *
 * @param WC_Product $product Product.
 * @return array{id:int,src:string,srcSet:string,width:int,height:int}|null
 */
function ndm_promo_image( $product ) {
	$id   = (int) $product->get_image_id();
	$full = $id ? wp_get_attachment_image_src( $id, 'full' ) : false;

	if ( ! $full ) {
		return null;
	}

	return array(
		'id'     => $id,
		'src'    => esc_url_raw( $full[0] ),
		'srcSet' => (string) wp_get_attachment_image_srcset( $id, 'full' ),
		'width'  => (int) $full[1],
		'height' => (int) $full[2],
	);
}

/**
 * Where every product of the public price list sits: product ID => its first category there.
 *
 * @return array<int,array{slug:string,name:string}>
 */
function ndm_promo_listed_products() {
	$listed = array();

	foreach ( ndm_pricing_public_tree()['categories'] as $category ) {
		foreach ( $category['products'] as $product ) {
			if ( ! isset( $listed[ $product['id'] ] ) ) {
				$listed[ $product['id'] ] = array(
					'slug' => $category['slug'],
					'name' => $category['name'],
				);
			}
		}
	}

	return $listed;
}

/**
 * The offers, in order.
 *
 * @param bool $admin Admin view: also offers whose product is not on the public price list.
 * @return array<int,array<string,mixed>>
 */
function ndm_promotions( $admin = false ) {
	$ids = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => array( 'publish', 'private', 'draft', 'pending' ),
			'meta_key'       => NDM_PROMO_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a handful of products.
			'posts_per_page' => NDM_PROMO_MAX * 2,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'orderby'        => 'ID',
			'order'          => 'ASC',
		)
	);

	$listed = ndm_promo_listed_products();
	$offers = array();

	foreach ( $ids as $id ) {
		$product  = wc_get_product( $id );
		$settings = $product instanceof WC_Product ? ndm_promo_settings( $product->get_meta( NDM_PROMO_META ) ) : null;

		if ( null === $settings ) {
			continue;
		}

		$category = $listed[ (int) $id ] ?? null;

		// The page can only show an offer whose treatment is on the public price list: that is where its price is.
		if ( ! $admin && null === $category ) {
			continue;
		}

		$offer = array(
			'productId'   => (int) $id,
			'productName' => ndm_pricing_plain( $product->get_name() ),
			'category'    => $category,
			'image'       => ndm_promo_image( $product ),
		) + $settings;

		if ( $admin ) {
			$offer['listed'] = null !== $category;
		}

		$offers[] = $offer;
	}

	usort(
		$offers,
		static function ( $a, $b ) {
			return array( $a['order'], $a['productId'] ) <=> array( $b['order'], $b['productId'] );
		}
	);

	return array_slice( $offers, 0, NDM_PROMO_MAX );
}

/**
 * The public offers, kept beside the public price list and thrown away with it (see cache.php).
 *
 * @return array<string,mixed>
 */
function ndm_promotions_public() {
	$stored = get_transient( NDM_PROMO_TRANSIENT );

	if ( ! is_array( $stored ) ) {
		$stored = array( 'offers' => ndm_promotions( false ) );
		set_transient( NDM_PROMO_TRANSIENT, $stored, HOUR_IN_SECONDS );
	}

	return $stored;
}

/**
 * Checks the card settings of one offer.
 *
 * @param array  $entry Incoming entry: name, text, area, icon, focus, scope and optionally imageId.
 * @param string $where "Offer 3" or "Product 42", for error messages.
 * @return array{settings:array<string,string>,imageId:int|null}|WP_Error
 */
function ndm_promo_clean_fields( $entry, $where ) {
	$name = ndm_pricing_clean_text( $entry['name'] ?? '', "$where: the card title", NDM_PRICING_NAME_MAX, false );
	$text = ndm_pricing_clean_text( $entry['text'] ?? '', "$where: the card text", NDM_PRICING_TEXT_MAX, false );

	if ( is_wp_error( $name ) ) {
		return $name;
	}

	if ( is_wp_error( $text ) ) {
		return $text;
	}

	$area  = $entry['area'] ?? '';
	$icon  = $entry['icon'] ?? '';
	$scope = $entry['scope'] ?? '';
	$focus = $entry['focus'] ?? '';

	if ( ! in_array( $area, NDM_PROMO_AREAS, true ) || ! in_array( $icon, NDM_PROMO_ICONS, true ) || ! in_array( $scope, NDM_PROMO_SCOPES, true ) ) {
		return ndm_pricing_invalid( "$where: the area, the icon or the price setting is not one of the choices." );
	}

	if ( ! is_string( $focus ) || ! preg_match( '/^(\d{1,3})% (\d{1,3})%$/', $focus, $m ) || $m[1] > 100 || $m[2] > 100 ) {
		return ndm_pricing_invalid( "$where: the photo's focus point must look like \"50% 40%\"." );
	}

	$image = null;

	if ( array_key_exists( 'imageId', $entry ) && null !== $entry['imageId'] ) {
		$image = $entry['imageId'];

		if ( ! is_int( $image ) || $image <= 0 || ! wp_attachment_is_image( $image ) ) {
			return ndm_pricing_invalid( "$where: that photo is not an image in the media library.", 404 );
		}
	}

	return array(
		'imageId'  => $image,
		'settings' => array(
			'name'  => $name,
			'text'  => $text,
			'area'  => $area,
			'icon'  => $icon,
			'focus' => $focus,
			'scope' => $scope,
		),
	);
}

/**
 * The "promo" field of a product in the price list's own save (see save.php): null takes the product
 * out of the offers, an object makes it one (or changes its card), with an optional position.
 *
 * @param mixed $value Incoming value.
 * @param int   $id    Product ID.
 * @return array<string,mixed>|false|WP_Error False to remove, else the checked settings.
 */
function ndm_promo_clean_product_change( $value, $id ) {
	if ( null === $value ) {
		return false;
	}

	if ( ! is_array( $value ) ) {
		return ndm_pricing_invalid( "Product $id: promo must be null or the offer's settings." );
	}

	$fields = ndm_promo_clean_fields( $value, "Product $id" );

	if ( is_wp_error( $fields ) ) {
		return $fields;
	}

	$position = $value['position'] ?? null;

	if ( null !== $position && ( ! is_int( $position ) || $position < 0 || $position >= NDM_PROMO_MAX ) ) {
		return ndm_pricing_invalid( "Product $id: the offer's position is not a place in the list." );
	}

	return $fields + array( 'position' => $position );
}

/**
 * The offers' product IDs, in order, after a set of per-product changes.
 *
 * @param array<int,array<string,mixed>|false> $changes Product ID => result of ndm_promo_clean_product_change().
 * @return int[]
 */
function ndm_promo_order_after( $changes ) {
	$ids = array_map( 'intval', array_column( ndm_promotions( true ), 'productId' ) );

	foreach ( $changes as $id => $change ) {
		$at = array_search( $id, $ids, true );

		if ( false === $change ) {
			if ( false !== $at ) {
				array_splice( $ids, $at, 1 );
			}
			continue;
		}

		if ( false === $at ) {
			$ids[] = $id;
			$at    = count( $ids ) - 1;
		}

		if ( null !== $change['position'] ) {
			array_splice( $ids, $at, 1 );
			array_splice( $ids, min( $change['position'], count( $ids ) ), 0, array( $id ) );
		}
	}

	return $ids;
}

/**
 * Writes per-product offer changes made on the price list's screen. The caller flushes the caches.
 *
 * @param array<int,array<string,mixed>|false> $changes Product ID => result of ndm_promo_clean_product_change().
 */
function ndm_promo_apply_product_changes( $changes ) {
	if ( ! $changes ) {
		return;
	}

	$ids = ndm_promo_order_after( $changes );

	foreach ( $changes as $id => $change ) {
		if ( false === $change ) {
			delete_post_meta( $id, NDM_PROMO_META );
			continue;
		}

		update_post_meta( $id, NDM_PROMO_META, wp_slash( array( 'order' => (int) array_search( $id, $ids, true ) ) + $change['settings'] ) );

		$product = wc_get_product( $id );

		if ( null !== $change['imageId'] && $product instanceof WC_Product && (int) $product->get_image_id() !== $change['imageId'] ) {
			$product->set_image_id( $change['imageId'] );
			$product->save();
		}
	}

	// Every offer's stored position follows the new order.
	foreach ( $ids as $position => $id ) {
		$meta = get_post_meta( $id, NDM_PROMO_META, true );

		if ( is_array( $meta ) && ( ! isset( $meta['order'] ) || (int) $meta['order'] !== $position ) ) {
			$meta['order'] = $position;
			update_post_meta( $id, NDM_PROMO_META, wp_slash( $meta ) );
		}
	}
}

/**
 * Checks the whole list before anything is written.
 *
 * @param mixed $body Request body.
 * @return array<int,array<string,mixed>>|WP_Error The cleaned offers, in order.
 */
function ndm_promo_plan( $body ) {
	$list = is_array( $body ) ? ( $body['offers'] ?? null ) : null;

	if ( ! is_array( $list ) || $list !== array_values( $list ) ) {
		return ndm_pricing_invalid( 'Send the offers as a list.' );
	}

	if ( count( $list ) > NDM_PROMO_MAX ) {
		return ndm_pricing_invalid( sprintf( 'At most %d offers can be shown.', NDM_PROMO_MAX ) );
	}

	$plan = array();
	$seen = array();

	foreach ( $list as $index => $entry ) {
		$where = sprintf( 'Offer %d', $index + 1 );

		if ( ! is_array( $entry ) || ! is_int( $entry['productId'] ?? null ) || $entry['productId'] <= 0 ) {
			return ndm_pricing_invalid( "$where: the treatment is missing." );
		}

		$id = $entry['productId'];

		if ( isset( $seen[ $id ] ) ) {
			return ndm_pricing_invalid( "$where: this treatment is already an offer." );
		}

		$seen[ $id ] = true;
		$product     = wc_get_product( $id );

		if ( ! $product instanceof WC_Product || $product->is_type( 'variation' ) || 'trash' === $product->get_status() ) {
			return ndm_pricing_invalid( "$where: that treatment is not in WooCommerce.", 404 );
		}

		$fields = ndm_promo_clean_fields( $entry, $where );

		if ( is_wp_error( $fields ) ) {
			return $fields;
		}

		$plan[] = array(
			'product'  => $product,
			'imageId'  => $fields['imageId'],
			'settings' => array( 'order' => $index ) + $fields['settings'],
		);
	}

	return $plan;
}

/**
 * Writes a checked list: products on it become (or stay) offers, every other product stops being one.
 * No product is created, deleted or re-priced.
 *
 * @param array<int,array<string,mixed>> $plan Result of ndm_promo_plan().
 */
function ndm_promo_apply( $plan ) {
	$keep = array();

	foreach ( $plan as $entry ) {
		$product = $entry['product'];
		$keep[]  = $product->get_id();

		update_post_meta( $product->get_id(), NDM_PROMO_META, wp_slash( $entry['settings'] ) );

		if ( null !== $entry['imageId'] && (int) $product->get_image_id() !== $entry['imageId'] ) {
			$product->set_image_id( $entry['imageId'] );
			$product->save();
		}
	}

	$old = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'any',
			'meta_key'       => NDM_PROMO_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a handful of products.
			'post__not_in'   => $keep ? $keep : array( 0 ),
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
		)
	);

	foreach ( $old as $id ) {
		delete_post_meta( $id, NDM_PROMO_META );
	}

	ndm_pricing_flush();
}

/**
 * Registers the routes.
 */
function ndm_promo_register_routes() {
	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/promotions',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => static function () {
				return rest_ensure_response( ndm_promotions_public() );
			},
			// Public on purpose: it holds only what the Promotion page shows to every visitor.
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/promotions/admin',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => static function () {
				return ndm_pricing_private_response( array( 'offers' => ndm_promotions( true ) ) );
			},
			'permission_callback' => 'ndm_pricing_can_manage',
		)
	);

	register_rest_route(
		NDM_PRICING_REST_NAMESPACE,
		'/promotions/admin/save',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => static function ( $request ) {
				if ( ! $request->is_json_content_type() ) {
					return ndm_pricing_invalid( 'Send the offers as JSON.', 415 );
				}

				$plan = ndm_promo_plan( $request->get_json_params() );

				if ( is_wp_error( $plan ) ) {
					return $plan;
				}

				ndm_promo_apply( $plan );

				return ndm_pricing_private_response( array( 'offers' => ndm_promotions( true ) ) );
			},
			'permission_callback' => 'ndm_pricing_can_manage',
		)
	);
}
add_action( 'rest_api_init', 'ndm_promo_register_routes' );

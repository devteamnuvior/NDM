<?php
/**
 * A sale campaign over the price list (the 2026 holiday sale: VIP Sale, Black Friday, Cyber Monday,
 * Black Friday Extended).
 *
 * - The campaign is one option (`ndm_pricing_campaign`): its window, its phases, its checkout code.
 *   The price of each line in the sale is a post meta on the WooCommerce variation (`_ndm_campaign`:
 *   the struck-through price, the campaign price, the percentage, whether the checkout code applies).
 *   WooCommerce's own regular and sale prices are never touched by the campaign.
 * - While the campaign runs, WooCommerce itself answers with the campaign price for those variations
 *   (filters on the variation's price, regular price and sale price), so everything that reads a price
 *   shows and charges it: the public price list, the offers, the cart check and the order requests.
 *   The moment the window closes the filters stop and every line is back at its own WooCommerce price
 *   and label: nothing has to be undone. The management screens (wp-admin, the price manager's routes,
 *   WP-CLI) always see and save WooCommerce's own prices.
 * - The checkout code is a real WooCommerce coupon (30% off, limited to the eligible variations, with
 *   the campaign's last day as its expiry), created by `wp ndm-pricing campaign --apply`. An order
 *   request applies it through ndm_campaign_apply_code() (orders.php).
 * - The public price list carries the campaign (`campaign`: code, phase, dates) and, on each line in
 *   it, `campaign` (whether the code applies and the price with the code).
 * - `wp ndm-pricing campaign < campaign.json` reads the campaign's definition (cms/campaigns/*.json):
 *   the permanent corrections of the price list, the rules that put packages in the sale and the fixed
 *   prices. Without --apply it only prints what it would do.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_CAMPAIGN_OPTION = 'ndm_pricing_campaign';
const NDM_CAMPAIGN_META   = '_ndm_campaign';
const NDM_CAMPAIGN_ZONE   = 'America/Toronto';

/**
 * "2026-11-14 00:00" on a Toronto clock as a moment; 0 when it is not such a date.
 *
 * @param mixed $value The date as written.
 * @return int Unix time.
 */
function ndm_campaign_time( $value ) {
	if ( ! is_string( $value ) || ! preg_match( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value ) ) {
		return 0;
	}

	$date = date_create_immutable_from_format( 'Y-m-d H:i', $value, new DateTimeZone( NDM_CAMPAIGN_ZONE ) );

	return $date && $date->format( 'Y-m-d H:i' ) === $value ? $date->getTimestamp() : 0;
}

/**
 * The stored campaign with its moments worked out, or null when there is none.
 *
 * @return array|null id, code, percent, start, end (Unix times; the last minute counts in full), phases.
 */
function ndm_campaign() {
	static $campaign = false;

	if ( false !== $campaign ) {
		return $campaign;
	}

	$stored   = get_option( NDM_CAMPAIGN_OPTION );
	$campaign = null;

	if ( is_array( $stored ) && ! empty( $stored['code'] ) ) {
		$start = ndm_campaign_time( $stored['start'] ?? '' );
		$end   = ndm_campaign_time( $stored['end'] ?? '' );

		if ( $start && $end > $start ) {
			$phases = array();
			foreach ( is_array( $stored['phases'] ?? null ) ? $stored['phases'] : array() as $phase ) {
				$from = ndm_campaign_time( $phase['from'] ?? '' );
				if ( $from && ! empty( $phase['id'] ) ) {
					$phases[] = array(
						'id'    => sanitize_key( $phase['id'] ),
						'from'  => $from,
						'label' => sanitize_text_field( $phase['label'] ?? '' ),
						'badge' => sanitize_text_field( $phase['badge'] ?? '' ),
					);
				}
			}
			usort(
				$phases,
				static function ( $a, $b ) {
					return $a['from'] - $b['from'];
				}
			);
			// Each phase ends where the next one starts; the last one with the campaign.
			foreach ( $phases as $i => $phase ) {
				$phases[ $i ]['to'] = isset( $phases[ $i + 1 ] ) ? $phases[ $i + 1 ]['from'] - 1 : $end + 59;
			}

			$campaign = array(
				'id'      => sanitize_key( $stored['id'] ?? 'campaign' ),
				'code'    => strtoupper( sanitize_text_field( $stored['code'] ) ),
				'percent' => max( 0, min( 100, (int) ( $stored['percent'] ?? 0 ) ) ),
				'start'   => $start,
				'end'     => $end + 59,
				'phases'  => $phases,
			);
		}
	}

	return $campaign;
}

/**
 * The phase the campaign is in now, or null outside its window.
 *
 * @param int|null $now Unix time; now when left out.
 * @return array|null
 */
function ndm_campaign_phase( $now = null ) {
	$campaign = ndm_campaign();
	$now      = null === $now ? time() : (int) $now;

	if ( ! $campaign || $now < $campaign['start'] || $now > $campaign['end'] ) {
		return null;
	}

	$current = array(
		'id'    => $campaign['id'],
		'from'  => $campaign['start'],
		'to'    => $campaign['end'],
		'label' => '',
		'badge' => 'SALE',
	);
	foreach ( $campaign['phases'] as $phase ) {
		if ( $now >= $phase['from'] ) {
			$current = $phase;
		}
	}

	return $current;
}

/**
 * Whether prices are answered with the campaign's: never on the management side (wp-admin, WP-CLI, the
 * price manager's and the offers manager's routes, WooCommerce's own API), where WooCommerce's own
 * prices are shown and saved. The management routes are told by the address of the request itself, so a
 * request WordPress makes to itself while answering a public one changes nothing.
 *
 * @return bool
 */
function ndm_campaign_overlay_on() {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		return ! empty( $GLOBALS['ndm_campaign_force'] ) && null !== ndm_campaign_phase();
	}

	if ( is_admin() && ! wp_doing_ajax() ) {
		return false;
	}

	$route = isset( $GLOBALS['wp']->query_vars['rest_route'] ) ? (string) $GLOBALS['wp']->query_vars['rest_route'] : '';

	foreach ( array( '/' . NDM_PRICING_REST_NAMESPACE . '/pricing/admin', '/' . NDM_PRICING_REST_NAMESPACE . '/promotions/admin', '/wc/', '/wc-' ) as $management ) {
		if ( 0 === strpos( $route, $management ) ) {
			return false;
		}
	}

	return null !== ndm_campaign_phase();
}

/**
 * A variation's line in the campaign, or null when it has none (or the campaign is not running).
 *
 * @param WC_Product|mixed $product The variation.
 * @param bool             $always  Also outside the campaign's window (the management side).
 * @return array|null regular (0 when nothing is struck through), price, off, code, label.
 */
function ndm_campaign_line( $product, $always = false ) {
	if ( ! $product instanceof WC_Product || ( ! $always && ! ndm_campaign_overlay_on() ) ) {
		return null;
	}

	$line = $product->get_meta( NDM_CAMPAIGN_META );
	$mine = ndm_campaign();

	if ( ! is_array( $line ) || ! $mine || ( $line['campaign'] ?? '' ) !== $mine['id'] || ! isset( $line['price'] ) ) {
		return null;
	}

	return array(
		'regular' => round( (float) ( $line['regular'] ?? 0 ), 2 ),
		'price'   => round( (float) $line['price'], 2 ),
		'off'     => (int) ( $line['off'] ?? 0 ),
		'code'    => ! empty( $line['code'] ),
		'label'   => (string) ( $line['label'] ?? '' ),
	);
}

/**
 * A price as WooCommerce writes it: no trailing zeros ("1029", "720.3").
 *
 * @param float $amount Amount.
 * @return string
 */
function ndm_campaign_decimal( $amount ) {
	return wc_format_decimal( $amount, wc_get_price_decimals(), true );
}

/**
 * The campaign price in place of WooCommerce's current price and sale price.
 *
 * @param mixed      $value   WooCommerce's value.
 * @param WC_Product $product The variation.
 * @return mixed
 */
function ndm_campaign_filter_price( $value, $product ) {
	$line = ndm_campaign_line( $product );

	return $line ? ndm_campaign_decimal( $line['price'] ) : $value;
}

/**
 * The campaign's struck-through price in place of WooCommerce's regular price; a line with nothing
 * struck through has the campaign price as its regular price.
 *
 * @param mixed      $value   WooCommerce's value.
 * @param WC_Product $product The variation.
 * @return mixed
 */
function ndm_campaign_filter_regular( $value, $product ) {
	$line = ndm_campaign_line( $product );

	return $line ? ndm_campaign_decimal( $line['regular'] > $line['price'] ? $line['regular'] : $line['price'] ) : $value;
}

/**
 * The campaign price as the sale price, when something is struck through.
 *
 * @param mixed      $value   WooCommerce's value.
 * @param WC_Product $product The variation.
 * @return mixed
 */
function ndm_campaign_filter_sale( $value, $product ) {
	$line = ndm_campaign_line( $product );

	if ( ! $line ) {
		return $value;
	}

	return $line['regular'] > $line['price'] ? ndm_campaign_decimal( $line['price'] ) : '';
}

/**
 * A campaign line is on sale when something is struck through, whatever WooCommerce's own sale dates say.
 *
 * @param bool       $on_sale WooCommerce's answer.
 * @param WC_Product $product The variation.
 * @return bool
 */
function ndm_campaign_filter_on_sale( $on_sale, $product ) {
	$line = ndm_campaign_line( $product );

	return $line ? $line['regular'] > $line['price'] : $on_sale;
}

add_filter( 'woocommerce_product_variation_get_price', 'ndm_campaign_filter_price', 99, 2 );
add_filter( 'woocommerce_product_variation_get_sale_price', 'ndm_campaign_filter_sale', 99, 2 );
add_filter( 'woocommerce_product_variation_get_regular_price', 'ndm_campaign_filter_regular', 99, 2 );
add_filter( 'woocommerce_product_is_on_sale', 'ndm_campaign_filter_on_sale', 99, 2 );

/**
 * The label of a line in the campaign: "SALE 30% OFF" during the VIP Sale, "BLACK FRIDAY 30% OFF" from
 * Black Friday on. A fixed-price line shows its own label from the campaign's definition, or none.
 *
 * @param array      $label   text, enabled.
 * @param WC_Product $product Product or variation.
 * @return array
 */
function ndm_campaign_filter_label( $label, $product ) {
	$line  = ndm_campaign_line( $product );
	$phase = $line ? ndm_campaign_phase() : null;

	if ( ! $line || ! $phase ) {
		return $label;
	}

	$text = $line['off'] ? trim( $phase['badge'] . ' ' . $line['off'] . '% OFF' ) : $line['label'];

	return array(
		'text'    => $text,
		'enabled' => '' !== $text,
	);
}
add_filter( 'ndm_pricing_label', 'ndm_campaign_filter_label', 10, 2 );

/**
 * What the public price list says about a line in the campaign.
 *
 * @param array      $row     The variation as the price list gives it.
 * @param WC_Product $product The variation.
 * @return array
 */
function ndm_campaign_filter_row( $row, $product ) {
	$line = ndm_campaign_line( $product );
	$mine = ndm_campaign();

	if ( $line && $mine ) {
		$row['campaign'] = array(
			'code'      => $line['code'],
			'codePrice' => $line['code'] ? ndm_campaign_decimal( $line['price'] * ( 100 - $mine['percent'] ) / 100 ) : '',
		);
	}

	return $row;
}
add_filter( 'ndm_pricing_variation_row', 'ndm_campaign_filter_row', 10, 2 );

/**
 * The campaign as the site receives it (dates as ISO 8601): null when none is stored. `phase` is null
 * outside the window; `over` says the window has closed.
 *
 * @return array|null
 */
function ndm_campaign_public() {
	$mine = ndm_campaign();

	if ( ! $mine ) {
		return null;
	}

	$iso   = static function ( $time ) {
		return gmdate( 'c', $time );
	};
	$phase = ndm_campaign_phase();

	return array(
		'id'      => $mine['id'],
		'code'    => $mine['code'],
		'percent' => $mine['percent'],
		'start'   => $iso( $mine['start'] ),
		'end'     => $iso( $mine['end'] ),
		'phase'   => $phase ? $phase['id'] : null,
		'over'    => time() > $mine['end'],
		'phases'  => array_map(
			static function ( $phase ) use ( $iso ) {
				return array(
					'id'    => $phase['id'],
					'label' => $phase['label'],
					'from'  => $iso( $phase['from'] ),
					'to'    => $iso( $phase['to'] ),
				);
			},
			$mine['phases']
		),
	);
}

/**
 * The moment the stored public price list stops being right: the next start or end of a phase.
 *
 * @return int Unix time, 0 when nothing is ahead.
 */
function ndm_campaign_next_change() {
	$mine = ndm_campaign();
	$now  = time();
	$next = 0;

	if ( ! $mine ) {
		return 0;
	}

	$moments = array( $mine['start'], $mine['end'] + 1 );
	foreach ( $mine['phases'] as $phase ) {
		$moments[] = $phase['from'];
	}
	foreach ( $moments as $moment ) {
		if ( $moment > $now && ( ! $next || $moment < $next ) ) {
			$next = $moment;
		}
	}

	return $next;
}

/**
 * At every start and end of a phase the stored price list is thrown away and the site is told, so the
 * prices and labels change on time without anyone saving anything.
 */
function ndm_campaign_schedule() {
	$next = ndm_campaign_next_change();

	if ( $next && ! wp_next_scheduled( 'ndm_campaign_change' ) ) {
		wp_schedule_single_event( $next, 'ndm_campaign_change' );
	}
}
add_action( 'init', 'ndm_campaign_schedule' );

/**
 * A phase has started or ended.
 */
function ndm_campaign_changed() {
	ndm_pricing_flush();
	ndm_campaign_schedule();
}
add_action( 'ndm_campaign_change', 'ndm_campaign_changed' );

/**
 * Puts the checkout code on an order request. Only the campaign's own code is known; it works only
 * while the campaign runs, and WooCommerce's coupon limits it to the eligible lines.
 *
 * @param WC_Order $order The order, with its lines.
 * @param string   $code  The code as typed.
 * @return true|WP_Error
 */
function ndm_campaign_apply_code( $order, $code ) {
	$code = strtoupper( trim( (string) $code ) );
	$mine = ndm_campaign();

	if ( '' === $code ) {
		return true;
	}

	if ( ! $mine || $code !== $mine['code'] ) {
		return new WP_Error( 'ndm_code_unknown', 'This code is not valid.', array( 'status' => 422 ) );
	}

	if ( time() > $mine['end'] ) {
		return new WP_Error( 'ndm_code_expired', 'This code has expired.', array( 'status' => 422 ) );
	}

	if ( time() < $mine['start'] ) {
		return new WP_Error( 'ndm_code_early', 'This code is not valid yet.', array( 'status' => 422 ) );
	}

	$applied = $order->apply_coupon( wc_format_coupon_code( $code ) );

	if ( is_wp_error( $applied ) ) {
		// WooCommerce refuses the coupon when no line of the order is an eligible package.
		return new WP_Error( 'ndm_code_no_lines', 'Code ' . $code . ' applies to eligible packages only; nothing in this order is one.', array( 'status' => 422 ) );
	}

	return true;
}

/**
 * Creates or updates the campaign's coupon: a percentage off the eligible variations only.
 *
 * @param array $campaign The campaign (ndm_campaign()).
 * @param int[] $eligible Variation IDs the code applies to.
 * @return int Coupon ID.
 */
function ndm_campaign_save_coupon( $campaign, $eligible ) {
	$coupon = new WC_Coupon( wc_format_coupon_code( $campaign['code'] ) );

	$coupon->set_code( wc_format_coupon_code( $campaign['code'] ) );
	$coupon->set_discount_type( 'percent' );
	$coupon->set_amount( $campaign['percent'] );
	$coupon->set_description( 'Campaign ' . $campaign['id'] . ': a further ' . $campaign['percent'] . '% off the website price of eligible packages. Managed by wp ndm-pricing campaign.' );
	$coupon->set_product_ids( array_values( array_map( 'absint', $eligible ) ) );
	$coupon->set_individual_use( true );
	$coupon->set_exclude_sale_items( false );
	// WooCommerce accepts the coupon through its expiry day; the campaign's own window is checked as well.
	$coupon->set_date_expires( $campaign['end'] + 1 );

	return (int) $coupon->save();
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * A product name or option label as it is compared: case, spacing and the kind of dash do not
	 * matter ("2 Zones" is "2 zones", "Face – Mid & Lower" is "Face - Mid & Lower").
	 *
	 * @param mixed $text Name or label.
	 * @return string
	 */
	function ndm_campaign_cli_key( $text ) {
		return strtolower( trim( preg_replace( '/\s+/u', ' ', str_replace( array( '–', '—' ), '-', ndm_pricing_plain( (string) $text ) ) ) ) );
	}

	/**
	 * Whether a product name or option label is the one a definition names; a definition may give
	 * several names for one line (the name differs between two copies of the price list).
	 *
	 * @param string          $have   The name in WooCommerce.
	 * @param string|string[] $wanted The name, or names, in the definition.
	 * @return bool
	 */
	function ndm_campaign_cli_is( $have, $wanted ) {
		return in_array( ndm_campaign_cli_key( $have ), array_map( 'ndm_campaign_cli_key', (array) $wanted ), true );
	}

	/**
	 * The variations of the products a rule or a fixed price names.
	 *
	 * @param array $where category (slug), product (exact name) or products (a regular expression on the name).
	 * @return array<int,array{product:WC_Product,variation:WC_Product_Variation,label:string}>
	 */
	function ndm_campaign_cli_lines( $where ) {
		$args = array(
			'status' => 'publish',
			'limit'  => -1,
			'type'   => 'variable',
		);
		if ( ! empty( $where['category'] ) ) {
			$args['category'] = array( $where['category'] );
		}

		$lines = array();
		foreach ( wc_get_products( $args ) as $product ) {
			$name = ndm_pricing_plain( $product->get_name() );
			if ( isset( $where['product'] ) && ! ndm_campaign_cli_is( $name, $where['product'] ) ) {
				continue;
			}
			if ( isset( $where['products'] ) && ! preg_match( '/' . $where['products'] . '/i', $name ) ) {
				continue;
			}
			foreach ( $product->get_children() as $variation_id ) {
				$variation = wc_get_product( $variation_id );
				if ( $variation instanceof WC_Product_Variation && 'publish' === $variation->get_status() ) {
					$lines[ $variation_id ] = array(
						'product'   => $product,
						'variation' => $variation,
						'label'     => implode( ', ', wp_list_pluck( ndm_pricing_variation_attributes( $variation, $product ), 'value' ) ),
					);
				}
			}
		}

		return $lines;
	}

	/**
	 * Sets up a sale campaign from its definition (JSON on standard input, see cms/campaigns/).
	 *
	 *   { "id", "code", "percent", "start", "end", "phases": [ { "id", "from", "label", "badge" } ],
	 *     "corrections": [ { "product", "option"?, "regular"?, "sale"?, "label"?, "hidden"? } ],
	 *     "rules":       [ { "category", "products"?, "options": [ ... ], "off": 30 } ],
	 *     "fixed":       [ { "product", "option", "regular": 1500 or null, "price": 900, "label"? } ] }
	 *
	 * Corrections are permanent changes of WooCommerce's own prices and labels. Rules put packages in the
	 * sale at a percentage off their regular price, with the checkout code on top. Fixed prices put a line
	 * in the sale at a stated price, without the code. Running it again replaces the campaign's lines.
	 *
	 * ## OPTIONS
	 *
	 * [--apply]
	 * : Make the changes. Without it, only print them.
	 *
	 * [--clear]
	 * : Remove the campaign: its option, its lines and its coupon's eligible list. Prices go back to
	 *   WooCommerce's own at once. Corrections are not undone.
	 *
	 * @when after_wp_load
	 */
	function ndm_campaign_cli( $args, $assoc_args ) {
		$apply = ! empty( $assoc_args['apply'] );

		if ( ! empty( $assoc_args['clear'] ) ) {
			$ids = get_posts(
				array(
					'post_type'   => 'product_variation',
					'post_status' => 'any',
					'numberposts' => -1,
					'fields'      => 'ids',
					'meta_key'    => NDM_CAMPAIGN_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a one-off command.
				)
			);
			WP_CLI::log( sprintf( '%d campaign lines%s.', count( $ids ), $apply ? ' removed' : ' would be removed (add --apply)' ) );
			if ( $apply ) {
				foreach ( $ids as $id ) {
					delete_post_meta( $id, NDM_CAMPAIGN_META );
				}
				delete_option( NDM_CAMPAIGN_OPTION );
				wp_clear_scheduled_hook( 'ndm_campaign_change' );
				ndm_pricing_flush();
			}
			return;
		}

		$def = json_decode( (string) file_get_contents( 'php://stdin' ), true );
		if ( ! is_array( $def ) || empty( $def['id'] ) || empty( $def['code'] ) || ! ndm_campaign_time( $def['start'] ?? '' ) || ! ndm_campaign_time( $def['end'] ?? '' ) ) {
			WP_CLI::error( 'Expected the campaign as JSON on standard input: { "id", "code", "percent", "start", "end", ... }.' );
		}

		$money    = static function ( $amount ) {
			return '' === (string) $amount ? '-' : '$' . number_format( (float) $amount, 2 );
		};
		$problems = array();

		// 1. Permanent corrections of WooCommerce's own prices and labels.
		WP_CLI::log( "\n== Permanent corrections ==" );
		foreach ( is_array( $def['corrections'] ?? null ) ? $def['corrections'] : array() as $fix ) {
			$lines = ndm_campaign_cli_lines( array( 'product' => $fix['product'] ?? '' ) );

			if ( ! isset( $fix['option'] ) ) {
				$found = array_filter(
					wc_get_products(
						array(
							'status' => 'publish',
							'limit'  => -1,
						)
					),
					static function ( $product ) use ( $fix ) {
						return ndm_campaign_cli_is( $product->get_name(), $fix['product'] ?? '' );
					}
				);
				if ( ! $found ) {
					$problems[] = 'Correction: no product named "' . implode( '" or "', (array) ( $fix['product'] ?? '' ) ) . '".';
					continue;
				}
				foreach ( $found as $product ) {
					WP_CLI::log( sprintf( '%s: %s on the price list', $product->get_name(), empty( $fix['hidden'] ) ? 'shown' : 'hidden' ) );
					if ( $apply ) {
						$product->update_meta_data( NDM_PRICING_HIDDEN, empty( $fix['hidden'] ) ? '' : '1' );
						$product->save();
					}
				}
				continue;
			}

			$hit = null;
			foreach ( $lines as $line ) {
				if ( ndm_campaign_cli_is( $line['label'], $fix['option'] ) ) {
					$hit = $line;
				}
			}
			if ( ! $hit ) {
				$problems[] = 'Correction: "' . implode( '" or "', (array) ( $fix['product'] ?? '' ) ) . '" has no option "' . $fix['option'] . '".';
				continue;
			}

			$variation = $hit['variation'];
			$regular   = array_key_exists( 'regular', $fix ) ? (string) $fix['regular'] : (string) $variation->get_regular_price( 'edit' );
			$sale      = array_key_exists( 'sale', $fix ) ? ( null === $fix['sale'] ? '' : (string) $fix['sale'] ) : (string) $variation->get_sale_price( 'edit' );
			$label     = array_key_exists( 'label', $fix ) ? (string) $fix['label'] : null;
			$same      = (float) $regular === (float) $variation->get_regular_price( 'edit' ) && (float) $sale === (float) $variation->get_sale_price( 'edit' ) && ( '' === $sale ) === ( '' === (string) $variation->get_sale_price( 'edit' ) );
			$old_label = ndm_pricing_plain( $variation->get_meta( NDM_PRICING_LABEL ) );
			$label_on  = '1' === (string) $variation->get_meta( NDM_PRICING_LABEL_ON );
			$same      = $same && ( null === $label || ( $label === ( $label_on ? $old_label : '' ) ) );

			WP_CLI::log(
				sprintf(
					'%s / %s: %s (sale %s)%s -> %s (sale %s)%s%s',
					$hit['product']->get_name(),
					$hit['label'],
					$money( $variation->get_regular_price( 'edit' ) ),
					$money( $variation->get_sale_price( 'edit' ) ),
					$label_on && '' !== $old_label ? ' [' . $old_label . ']' : '',
					$money( $regular ),
					$money( $sale ),
					null === $label ? '' : ( '' === $label ? ' [no label]' : ' [' . $label . ']' ),
					$same ? '  (already so)' : ''
				)
			);

			if ( $apply && ! $same ) {
				$variation->set_regular_price( $regular );
				$variation->set_sale_price( $sale );
				$variation->set_date_on_sale_from( '' );
				$variation->set_date_on_sale_to( '' );
				if ( null !== $label ) {
					$variation->update_meta_data( NDM_PRICING_LABEL, $label );
					$variation->update_meta_data( NDM_PRICING_LABEL_ON, '' === $label ? '' : '1' );
				}
				$variation->save();
			}
		}

		// 2. The lines of the campaign: fixed prices first (a fixed line is never also a percentage line).
		$planned = array();

		foreach ( is_array( $def['fixed'] ?? null ) ? $def['fixed'] : array() as $fixed ) {
			$hit = null;
			foreach ( ndm_campaign_cli_lines( array( 'product' => $fixed['product'] ?? '' ) ) as $id => $line ) {
				if ( ndm_campaign_cli_is( $line['label'], $fixed['option'] ?? '' ) ) {
					$hit = array( $id, $line );
				}
			}
			if ( ! $hit ) {
				$problems[] = 'Fixed price: "' . implode( '" or "', (array) ( $fixed['product'] ?? '' ) ) . '" has no option "' . ( $fixed['option'] ?? '' ) . '".';
				continue;
			}
			$planned[ $hit[0] ] = array(
				'line'    => $hit[1],
				'regular' => isset( $fixed['regular'] ) ? (float) $fixed['regular'] : 0.0,
				'price'   => (float) $fixed['price'],
				'off'     => 0,
				'code'    => false,
				'label'   => (string) ( $fixed['label'] ?? '' ),
			);
		}

		foreach ( is_array( $def['rules'] ?? null ) ? $def['rules'] : array() as $rule ) {
			$matched = 0;
			foreach ( ndm_campaign_cli_lines( $rule ) as $id => $line ) {
				if ( isset( $planned[ $id ] ) || ! ndm_campaign_cli_is( $line['label'], (array) ( $rule['options'] ?? array() ) ) ) {
					continue;
				}
				// The corrections above may not be saved yet in a dry run: a corrected regular price counts.
				$regular = (float) $line['variation']->get_regular_price( 'edit' );
				foreach ( is_array( $def['corrections'] ?? null ) ? $def['corrections'] : array() as $fix ) {
					if ( isset( $fix['option'], $fix['regular'] ) && ndm_campaign_cli_is( $line['product']->get_name(), $fix['product'] ?? '' ) && ndm_campaign_cli_is( $line['label'], $fix['option'] ) ) {
						$regular = (float) $fix['regular'];
					}
				}
				if ( $regular <= 0 ) {
					$problems[] = 'Rule: "' . $line['product']->get_name() . ' / ' . $line['label'] . '" has no regular price.';
					continue;
				}
				++$matched;
				$planned[ $id ] = array(
					'line'    => $line,
					'regular' => $regular,
					'price'   => round( $regular * ( 100 - (int) $rule['off'] ) / 100, 2 ),
					'off'     => (int) $rule['off'],
					'code'    => true,
					'label'   => '',
				);
			}
			if ( ! $matched ) {
				$problems[] = 'Rule: nothing matched ' . wp_json_encode( $rule ) . '.';
			}
		}

		$percent = max( 0, min( 100, (int) ( $def['percent'] ?? 0 ) ) );
		WP_CLI::log( "\n== Campaign lines (struck-through -> website price -> with code " . $def['code'] . ') ==' );
		foreach ( $planned as $plan ) {
			WP_CLI::log(
				sprintf(
					'%s / %s: %s -> %s%s',
					$plan['line']['product']->get_name(),
					$plan['line']['label'],
					$plan['regular'] > $plan['price'] ? $money( $plan['regular'] ) : 'no struck price',
					$money( $plan['price'] ),
					$plan['code'] ? ' (' . $plan['off'] . '% off) -> ' . $money( $plan['price'] * ( 100 - $percent ) / 100 ) : ' (fixed, no code)'
				)
			);
		}

		$eligible = array_keys(
			array_filter(
				$planned,
				static function ( $plan ) {
					return $plan['code'];
				}
			)
		);
		WP_CLI::log( sprintf( "\n%d lines in the campaign, %d of them take the code %s.", count( $planned ), count( $eligible ), $def['code'] ) );

		foreach ( $problems as $problem ) {
			WP_CLI::warning( $problem );
		}

		if ( ! $apply ) {
			WP_CLI::log( 'Nothing was changed. Run it again with --apply to make these changes.' );
			return;
		}

		// 3. Store: the campaign, its lines (replacing the earlier ones), its coupon.
		$old = get_posts(
			array(
				'post_type'   => 'product_variation',
				'post_status' => 'any',
				'numberposts' => -1,
				'fields'      => 'ids',
				'meta_key'    => NDM_CAMPAIGN_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- a one-off command.
			)
		);
		foreach ( array_diff( $old, array_keys( $planned ) ) as $id ) {
			delete_post_meta( $id, NDM_CAMPAIGN_META );
		}
		foreach ( $planned as $id => $plan ) {
			update_post_meta(
				$id,
				NDM_CAMPAIGN_META,
				array(
					'campaign' => sanitize_key( $def['id'] ),
					'regular'  => $plan['regular'],
					'price'    => $plan['price'],
					'off'      => $plan['off'],
					'code'     => $plan['code'],
					'label'    => $plan['label'],
				)
			);
		}

		update_option(
			NDM_CAMPAIGN_OPTION,
			array(
				'id'      => sanitize_key( $def['id'] ),
				'code'    => strtoupper( sanitize_text_field( $def['code'] ) ),
				'percent' => $percent,
				'start'   => $def['start'],
				'end'     => $def['end'],
				'phases'  => is_array( $def['phases'] ?? null ) ? $def['phases'] : array(),
			),
			false
		);

		$stored = array(
			'id'      => sanitize_key( $def['id'] ),
			'code'    => strtoupper( sanitize_text_field( $def['code'] ) ),
			'percent' => $percent,
			'end'     => ndm_campaign_time( $def['end'] ) + 59,
		);
		$coupon = ndm_campaign_save_coupon( $stored, $eligible );

		wp_clear_scheduled_hook( 'ndm_campaign_change' );
		ndm_pricing_flush();

		WP_CLI::success( sprintf( 'Campaign %s stored: %d lines, coupon %s (post %d) on %d lines.', $stored['id'], count( $planned ), $stored['code'], $coupon, count( $eligible ) ) );
	}

	WP_CLI::add_command( 'ndm-pricing campaign', 'ndm_campaign_cli' );
}

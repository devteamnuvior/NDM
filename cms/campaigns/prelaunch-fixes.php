<?php
/**
 * VIP Sale pre-launch fixes, Task 06 (2026-11-14): the two changes to the price list's options that the
 * campaign definition cannot make by itself. Run it before the campaign command:
 *
 *   wp eval-file cms/campaigns/prelaunch-fixes.php          (dry run)
 *   wp eval-file cms/campaigns/prelaunch-fixes.php apply
 *   wp ndm-pricing campaign --apply < cms/campaigns/holiday-sale-2026.json
 *
 * 1. The option "2 syringe" is written "2 Syringes" (Skin Booster – HA).
 * 2. Hand Rejuvenation with Radiesse gets the option "2 Syringes" at $1800 (the campaign definition puts it
 *    in the sale at $1198).
 *
 * Safe to run again: it changes only what is still wrong. Nothing is deleted.
 */

$apply = in_array( 'apply', $args ?? array(), true );
$key   = static function ( $text ) {
	return strtolower( trim( preg_replace( '/\s+/u', ' ', str_replace( array( '–', '—' ), '-', wp_strip_all_tags( (string) $text ) ) ) ) );
};
$find  = static function ( $name ) use ( $key ) {
	foreach ( wc_get_products( array( 'status' => 'publish', 'limit' => -1, 'type' => 'variable' ) ) as $product ) {
		if ( $key( $product->get_name() ) === $key( $name ) ) {
			return $product;
		}
	}
	return null;
};
// The attribute a product's options hang on: [ key used on variations, WC_Product_Attribute ].
$options_of = static function ( $product ) {
	foreach ( $product->get_attributes( 'edit' ) as $slug => $attribute ) {
		if ( $attribute instanceof WC_Product_Attribute && $attribute->get_variation() ) {
			return array( $slug, $attribute );
		}
	}
	return array( '', null );
};
// What a variation's option reads as on the site.
$label_of = static function ( $variation, $slug, $attribute ) {
	$value = (string) ( $variation->get_attributes()[ $slug ] ?? '' );
	if ( $attribute->is_taxonomy() ) {
		$term = get_term_by( 'slug', $value, $attribute->get_name() );
		return $term ? $term->name : $value;
	}
	return $value;
};

/* 1. "2 syringe" -> "2 Syringes" */
$booster = $find( 'Skin Booster – HA (Hyaluronic Acid)' );
if ( ! $booster ) {
	WP_CLI::warning( 'No product "Skin Booster – HA (Hyaluronic Acid)".' );
} else {
	list( $slug, $attribute ) = $options_of( $booster );
	$done                     = false;
	foreach ( $booster->get_children() as $id ) {
		$variation = wc_get_product( $id );
		if ( ! $variation instanceof WC_Product_Variation || '2 syringe' !== $key( $label_of( $variation, $slug, $attribute ) ) ) {
			continue;
		}
		$done = true;
		WP_CLI::log( 'Skin Booster – HA: "' . $label_of( $variation, $slug, $attribute ) . '" -> "2 Syringes"' );
		if ( ! $apply ) {
			continue;
		}
		if ( $attribute->is_taxonomy() ) {
			// a shared term: every product that uses it reads "2 Syringes" from now on
			$term = get_term_by( 'slug', $variation->get_attributes()[ $slug ], $attribute->get_name() );
			wp_update_term( $term->term_id, $attribute->get_name(), array( 'name' => '2 Syringes' ) );
		} else {
			$names = array_map(
				static function ( $name ) use ( $key ) {
					return '2 syringe' === $key( $name ) ? '2 Syringes' : $name;
				},
				$attribute->get_options()
			);
			ndm_pricing_set_options( $booster, $attribute, $names );
			$variation->set_attributes( array( $slug => '2 Syringes' ) );
			$variation->save();
		}
	}
	if ( ! $done ) {
		WP_CLI::log( 'Skin Booster – HA: no option "2 syringe" (already corrected).' );
	}
}

/* 2. Hand Rejuvenation with Radiesse: the option "2 Syringes" */
$hand = $find( 'Bio-Stimulator – Hand Rejuvenation with Radiesse' );
if ( ! $hand ) {
	WP_CLI::warning( 'No product "Bio-Stimulator – Hand Rejuvenation with Radiesse".' );
} else {
	list( $slug, $attribute ) = $options_of( $hand );
	$has                      = false;
	foreach ( $hand->get_children() as $id ) {
		$variation = wc_get_product( $id );
		if ( $variation instanceof WC_Product_Variation && 'trash' !== $variation->get_status() && '2 syringes' === $key( $label_of( $variation, $slug, $attribute ) ) ) {
			$has = true;
		}
	}
	if ( $has ) {
		WP_CLI::log( 'Hand Rejuvenation with Radiesse: "2 Syringes" is already there.' );
	} elseif ( ! $attribute ) {
		WP_CLI::warning( 'Hand Rejuvenation with Radiesse has no option attribute.' );
	} else {
		WP_CLI::log( 'Hand Rejuvenation with Radiesse: add "2 Syringes" at $1800' );
		if ( $apply ) {
			if ( $attribute->is_taxonomy() ) {
				$taxonomy = $attribute->get_name();
				$term     = get_term_by( 'name', '2 Syringes', $taxonomy );
				if ( ! $term ) {
					$made = wp_insert_term( '2 Syringes', $taxonomy );
					$term = is_wp_error( $made ) ? null : get_term( $made['term_id'], $taxonomy );
				}
				if ( ! $term ) {
					WP_CLI::error( 'The option "2 Syringes" could not be made.' );
				}
				wp_set_object_terms( $hand->get_id(), array( (int) $term->term_id ), $taxonomy, true );
				$attributes = $hand->get_attributes( 'edit' );
				$attributes[ $slug ]->set_options( array_values( array_unique( array_merge( $attribute->get_options(), array( (int) $term->term_id ) ) ) ) );
				$hand->set_attributes( $attributes );
				$hand->save();
				$variation = new WC_Product_Variation();
				$variation->set_parent_id( $hand->get_id() );
				$variation->set_attributes( array( $slug => $term->slug ) );
				$variation->set_status( 'publish' );
				$variation->set_regular_price( '1800' );
				$variation->set_menu_order( 1 );
				$new = (int) $variation->save();
			} else {
				$new = ndm_pricing_add_variation( $hand, array( 'name' => '2 Syringes', 'regularPrice' => '1800' ) );
			}
			if ( ! $new ) {
				WP_CLI::error( 'The option could not be added.' );
			}
			WC_Product_Variable::sync( $hand->get_id() );
		}
	}
}

if ( $apply ) {
	ndm_pricing_flush();
}
WP_CLI::success( $apply ? 'Done.' : 'Dry run, nothing changed. Add "apply" to make the changes.' );

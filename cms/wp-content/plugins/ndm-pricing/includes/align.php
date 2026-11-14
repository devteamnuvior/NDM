<?php
/**
 * wp ndm-pricing align: brings the names of the price list in line with a reference list (the Pricing
 * section of the clinic's fees page): product titles, the line under a title, option names, and the
 * order of products and options. Nothing is created or deleted and no ID changes; a product or an
 * option the reference does not have is hidden on the price list (it stays in WooCommerce). Prices
 * are never changed: where they differ from the reference the command only says so.
 *
 * It reads JSON from standard input:
 *
 *   [ { "name": "Dermal Fillers",
 *       "items": [ { "name": "Precision / Advanced Areas", "was": [ "Premium Fillers" ], "note": "...",
 *                    "options": [ { "label": "1 Syringe", "regular": 850, "sale": null } ] } ] } ]
 *
 * A product is found by its name without regard to case, spacing or punctuation, or by one of the
 * names in `was`. Without --apply it only prints what it would do.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

/**
 * A name as it is compared: letters and digits only, lower case.
 *
 * @param mixed $text Name.
 * @return string
 */
function ndm_pricing_align_key( $text ) {
	return preg_replace( '/[^a-z0-9]+/', '', strtolower( ndm_pricing_plain( (string) $text ) ) );
}

/**
 * Aligns the price list with a reference list.
 *
 * ## OPTIONS
 *
 * [--apply]
 * : Make the changes. Without it, only print them.
 *
 * @when after_wp_load
 */
function ndm_pricing_cli_align( $args, $assoc_args ) {
	$apply = ! empty( $assoc_args['apply'] );
	$list  = json_decode( (string) file_get_contents( 'php://stdin' ), true );

	if ( ! is_array( $list ) || ! $list ) {
		WP_CLI::error( 'No reference list on standard input.' );
	}

	$changes = 0;
	$renamed = array(); // Shared attribute terms already given their name: term ID => name.
	$say     = static function ( $line ) use ( &$changes ) {
		++$changes;
		WP_CLI::log( $line );
	};
	$terms   = array();

	foreach ( get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) ) as $term ) {
		$terms[ ndm_pricing_align_key( $term->name ) ] = $term;
	}

	foreach ( $list as $want_cat ) {
		$term = $terms[ ndm_pricing_align_key( $want_cat['name'] ?? '' ) ] ?? null;

		if ( ! $term ) {
			WP_CLI::warning( 'No category named "' . ( $want_cat['name'] ?? '' ) . '".' );
			continue;
		}

		if ( ndm_pricing_plain( $term->name ) !== $want_cat['name'] ) {
			$say( sprintf( 'Category "%s" -> "%s"', $term->name, $want_cat['name'] ) );
			if ( $apply ) {
				wp_update_term( $term->term_id, 'product_cat', array( 'name' => wp_slash( $want_cat['name'] ) ) );
			}
		}

		$have = array();
		foreach ( ndm_pricing_category_product_ids( $term->term_id ) as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( $product && 'publish' === $product->get_status() ) {
				$have[ $product_id ] = $product;
			}
		}

		$order = array();

		foreach ( is_array( $want_cat['items'] ?? null ) ? $want_cat['items'] : array() as $want ) {
			$keys  = array_map( 'ndm_pricing_align_key', array_merge( array( $want['name'] ), (array) ( $want['was'] ?? array() ) ) );
			$found = null;

			foreach ( $have as $product_id => $product ) {
				if ( ! in_array( $product_id, $order, true ) && in_array( ndm_pricing_align_key( $product->get_name() ), $keys, true ) ) {
					$found = $product;
					break;
				}
			}

			if ( ! $found ) {
				WP_CLI::warning( sprintf( '%s: no product named "%s".', $want_cat['name'], $want['name'] ) );
				continue;
			}

			$order[] = $found->get_id();
			$title   = $want['name'];
			$dirty   = false;

			if ( ndm_pricing_plain( $found->get_name() ) !== $title ) {
				$say( sprintf( '%s: product "%s" -> "%s"', $want_cat['name'], $found->get_name(), $title ) );
				$found->set_name( $title );
				$dirty = true;
			}

			$note = (string) ( $want['note'] ?? '' );
			if ( ndm_pricing_plain( $found->get_short_description() ) !== $note ) {
				$say( sprintf( '%s: line under the title "%s" -> "%s"', $title, str_replace( "\n", ' / ', ndm_pricing_plain( $found->get_short_description() ) ), $note ) );
				$found->set_short_description( $note );
				$dirty = true;
			}

			if ( $dirty && $apply ) {
				$found->save();
			}

			// Options: the reference's names and order; an option it does not have is hidden.
			$attribute  = ndm_pricing_option_attribute( $found );
			$variations = array();
			foreach ( $found->get_children() as $variation_id ) {
				$variation = wc_get_product( $variation_id );
				if ( $variation instanceof WC_Product_Variation && 'publish' === $variation->get_status() ) {
					$variations[ $variation_id ] = $variation;
				}
			}

			$used   = array();
			$labels = array();
			$wanted = array_values( array_filter( is_array( $want['options'] ?? null ) ? $want['options'] : array(), static function ( $o ) { return '' !== trim( (string) ( $o['label'] ?? '' ) ); } ) );

			foreach ( $wanted as $position => $option ) {
				$hit = null;
				foreach ( $variations as $variation_id => $variation ) {
					$label = implode( ', ', wp_list_pluck( ndm_pricing_variation_attributes( $variation, $found ), 'value' ) );
					if ( ! isset( $used[ $variation_id ] ) && ndm_pricing_align_key( $label ) === ndm_pricing_align_key( $option['label'] ) ) {
						$hit = array( $variation, $label );
						break;
					}
				}

				if ( ! $hit ) {
					WP_CLI::warning( sprintf( '%s: no option "%s".', $title, $option['label'] ) );
					continue;
				}

				list( $variation, $label ) = $hit;
				$used[ $variation->get_id() ] = true;
				$labels[]                     = $option['label'];
				$touched                      = false;

				if ( $label !== $option['label'] ) {
					$raw      = $variation->get_attributes();
					$taxonomy = 1 === count( $raw ) ? (string) key( $raw ) : '';
					$term     = '' !== $taxonomy && taxonomy_exists( $taxonomy ) ? get_term_by( 'slug', (string) current( $raw ), $taxonomy ) : null;

					if ( $term ) {
						// A shared attribute: the name is the term's, the same for every product that uses it.
						if ( ! isset( $renamed[ $term->term_id ] ) ) {
							$renamed[ $term->term_id ] = $option['label'];
							$say( sprintf( 'Shared option name "%s" -> "%s" (every product that uses it)', $term->name, $option['label'] ) );
							if ( $apply ) {
								wp_update_term( $term->term_id, $taxonomy, array( 'name' => wp_slash( $option['label'] ) ) );
							}
						} elseif ( $renamed[ $term->term_id ] !== $option['label'] ) {
							WP_CLI::log( sprintf( '   %s: the reference writes this option "%s"; the shared name stays "%s"', $title, $option['label'], $renamed[ $term->term_id ] ) );
						}
					} elseif ( ! $attribute || 1 !== count( $raw ) ) {
						WP_CLI::warning( sprintf( '%s: option "%s" cannot be renamed here (set up in WooCommerce).', $title, $label ) );
					} else {
						$say( sprintf( '%s: option "%s" -> "%s"', $title, $label, $option['label'] ) );
						$variation->set_attributes( array( key( $variation->get_attributes() ) => $option['label'] ) );
						$touched = true;
					}
				}

				if ( (int) $variation->get_menu_order() !== $position ) {
					$say( sprintf( '%s: option "%s" moves to place %d', $title, $option['label'], $position + 1 ) );
					$variation->set_menu_order( $position );
					$touched = true;
				}

				if ( ndm_pricing_is_hidden( $variation ) ) {
					$say( sprintf( '%s: option "%s" shown again', $title, $option['label'] ) );
					$variation->update_meta_data( NDM_PRICING_HIDDEN, '' );
					$touched = true;
				}

				if ( $touched && $apply ) {
					$variation->save();
				}

				// Prices are WooCommerce's: a difference is only reported.
				$regular = (float) $variation->get_regular_price( 'edit' );
				$sale    = '' === (string) $variation->get_sale_price( 'edit' ) ? null : (float) $variation->get_sale_price( 'edit' );
				$ref_reg = isset( $option['regular'] ) ? (float) $option['regular'] : null;
				$ref_sal = isset( $option['sale'] ) ? (float) $option['sale'] : null;
				if ( null !== $ref_reg && ( abs( $regular - $ref_reg ) > 0.004 || ( null === $sale ) !== ( null === $ref_sal ) || ( null !== $sale && abs( $sale - $ref_sal ) > 0.004 ) ) ) {
					WP_CLI::log( sprintf( '   price differs, left as it is: %s / %s is %s (sale %s), the reference has %s (sale %s)', $title, $option['label'], $regular, null === $sale ? '-' : $sale, $ref_reg, null === $ref_sal ? '-' : $ref_sal ) );
				}
			}

			$position = count( $wanted );
			foreach ( $variations as $variation_id => $variation ) {
				if ( isset( $used[ $variation_id ] ) ) {
					continue;
				}
				$label    = implode( ', ', wp_list_pluck( ndm_pricing_variation_attributes( $variation, $found ), 'value' ) );
				$labels[] = $label;
				if ( ! ndm_pricing_is_hidden( $variation ) || (int) $variation->get_menu_order() !== $position ) {
					$say( sprintf( '%s: option "%s" is not in the reference: hidden', $title, $label ) );
					if ( $apply ) {
						$variation->update_meta_data( NDM_PRICING_HIDDEN, '1' );
						$variation->set_menu_order( $position );
						$variation->save();
					}
				}
				++$position;
			}

			if ( $attribute && $apply && array_values( $attribute->get_options() ) !== array_values( array_unique( $labels ) ) ) {
				ndm_pricing_set_options( wc_get_product( $found->get_id() ), $attribute, $labels );
			}
		}

		// Products the reference does not have are hidden; the order is the reference's.
		foreach ( $have as $product_id => $product ) {
			if ( in_array( $product_id, $order, true ) ) {
				continue;
			}
			if ( ! ndm_pricing_is_hidden( $product ) ) {
				$say( sprintf( '%s: product "%s" is not in the reference: hidden', $want_cat['name'], $product->get_name() ) );
				if ( $apply ) {
					$product->update_meta_data( NDM_PRICING_HIDDEN, '1' );
					$product->save();
				}
			}
			$order[] = $product_id;
		}

		if ( array_values( array_intersect( ndm_pricing_category_product_ids( $term->term_id ), $order ) ) !== $order ) {
			$say( sprintf( '%s: products put in the reference\'s order', $want_cat['name'] ) );
			if ( $apply ) {
				update_term_meta( $term->term_id, NDM_PRICING_TERM_PRODUCT_ORDER, $order );
			}
		}
	}

	if ( $apply ) {
		ndm_pricing_flush();
		WP_CLI::success( $changes . ' changes made.' );
	} else {
		WP_CLI::log( $changes . ' changes. Nothing was changed: run it again with --apply.' );
	}
}

WP_CLI::add_command( 'ndm-pricing align', 'ndm_pricing_cli_align' );

<?php
/**
 * The offer label of the Botox Cosmetic packages (user, 2026-11-18): each package that costs less per unit than
 * the single-unit price gets the label "N% OFF", worked out from WooCommerce's own prices, never typed. With it
 * the Botox card of the offers carousel shows "UP TO | 30% OFF" again, as it did before the holiday sale.
 *
 *   wp eval-file cms/campaigns/botox-offer-labels.php          (dry run)
 *   wp eval-file cms/campaigns/botox-offer-labels.php apply
 *
 * A package in the sale campaign (a fixed-price line) gets the label on its campaign line, shown while the campaign
 * runs; a package outside it (220 units, on WooCommerce's own sale price) gets it as its own label. Prices are not
 * changed. With "apply" the earlier values are first written to a JSON file (its path is printed). Safe to run again.
 */
$apply = in_array( 'apply', $args ?? array(), true );

$product = null;
foreach ( array( 'Botox Cosmetic', 'Botox' ) as $name ) {
	$found = get_posts( array( 'post_type' => 'product', 'title' => $name, 'post_status' => 'publish', 'numberposts' => 1 ) );
	if ( $found ) {
		$product = wc_get_product( $found[0]->ID );
		break;
	}
}
if ( ! $product || ! $product->is_type( 'variable' ) ) {
	WP_CLI::error( 'No variable product named "Botox Cosmetic" or "Botox".' );
}

$options = array();
$unit    = 0.0;
foreach ( $product->get_children() as $id ) {
	$variation = wc_get_product( $id );
	if ( ! $variation ) {
		continue;
	}
	$label = implode( ', ', wp_list_pluck( ndm_pricing_variation_attributes( $variation, $product ), 'value' ) );
	if ( preg_match( '/regular/i', $label ) ) {
		$unit = (float) $variation->get_regular_price( 'edit' );
	}
	$options[] = array( $variation, $label );
}
if ( $unit <= 0 ) {
	WP_CLI::error( 'The single-unit price ("Regular") was not found.' );
}
WP_CLI::log( sprintf( '%s (product %d): single unit $%s', $product->get_name(), $product->get_id(), $unit ) );

$backup  = array();
$changes = array();
foreach ( $options as list( $variation, $label ) ) {
	if ( ! preg_match( '/(\d+)\s*units?/i', $label, $m ) ) {
		continue;
	}
	$units = (int) $m[1];
	// Only what visitors see on the price list (the rule of the public list in tree.php): the live product also holds
	// options that are hidden, switched off or without a price, and those are left alone.
	if ( ndm_pricing_is_hidden( $variation ) || 'publish' !== $variation->get_status() || (float) $variation->get_price( 'edit' ) <= 0 ) {
		WP_CLI::log( sprintf( '  %-10s not on the public price list: left as it is', $label ) );
		continue;
	}
	$line  = $variation->get_meta( NDM_CAMPAIGN_META );
	$in    = is_array( $line ) && isset( $line['price'] );
	$price = $in ? (float) $line['price'] : (float) ( '' !== (string) $variation->get_sale_price( 'edit' ) ? $variation->get_sale_price( 'edit' ) : $variation->get_regular_price( 'edit' ) );
	$off   = (int) round( ( 1 - $price / ( $units * $unit ) ) * 100 );
	$text  = $off > 0 ? $off . '% OFF' : '';
	$old   = $in ? (string) ( $line['label'] ?? '' ) : ( '1' === (string) $variation->get_meta( NDM_PRICING_LABEL_ON ) ? (string) $variation->get_meta( NDM_PRICING_LABEL ) : '' );

	WP_CLI::log( sprintf( '  %-10s $%s for %d units = $%s a unit, %d%% under $%s; %s label "%s" -> "%s"', $label, $price, $units, round( $price / $units, 2 ), $off, $unit, $in ? 'campaign' : 'own', $old, $text ) );
	// The price list may tie "OFF" to its number with a no-break space: the same label.
	if ( preg_replace( '/\s+/u', ' ', $old ) === $text ) {
		continue;
	}
	$backup[]  = array( 'variation' => $variation->get_id(), 'campaign' => $in, 'line' => $in ? $line : null, 'label' => $variation->get_meta( NDM_PRICING_LABEL ), 'label_on' => $variation->get_meta( NDM_PRICING_LABEL_ON ) );
	$changes[] = array( $variation, $in, $line, $text );
}

if ( $apply && $changes ) {
	$dir  = is_dir( getenv( 'HOME' ) . '/ndm-backups' ) ? getenv( 'HOME' ) . '/ndm-backups' : sys_get_temp_dir();
	$file = $dir . '/botox-labels-before-' . gmdate( 'Ymd-His' ) . '.json';
	if ( false === file_put_contents( $file, wp_json_encode( $backup ) ) ) {
		WP_CLI::error( "Could not write the backup to $file. Nothing was changed." );
	}
	WP_CLI::log( "Earlier values saved to $file" );
	foreach ( $changes as list( $variation, $in, $line, $text ) ) {
		if ( $in ) {
			$line['label'] = $text;
			$variation->update_meta_data( NDM_CAMPAIGN_META, $line );
		} else {
			$variation->update_meta_data( NDM_PRICING_LABEL, $text );
			$variation->update_meta_data( NDM_PRICING_LABEL_ON, '' === $text ? '' : '1' );
		}
		$variation->save();
	}
	ndm_pricing_flush();
}

WP_CLI::success( count( $changes ) . ( $apply ? ' changed.' : ' to change. Dry run: add "apply" to make the changes.' ) );

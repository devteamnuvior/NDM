<?php
/**
 * VIP Sale pre-launch fixes, Task 07 (2026-11-14): two changes to the words of the VIP Sale page in WordPress.
 *   wp eval-file cms/campaigns/prelaunch-vip-page.php          (dry run)
 *   wp eval-file cms/campaigns/prelaunch-vip-page.php apply
 * 1. The Aptos card sits under its own tab, "Thread lift".
 * 2. The fine print's "Not included" list is the full one.
 * Safe to run again. The page's revisions keep the earlier words.
 */
$apply = in_array( 'apply', $args ?? array(), true );
$list  = 'Not included: laser vein, facials, depigmenting, non-surgical butt lift, hip dip, snoring, toenail, Latisse, Dysport, hyperhidrosis, laser hair rejuvenation, filler single syringes, filler 3 and 4 syringes, filler combination packages, Belkyra.';
$pages = get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'meta_key' => '_ndm_vip_sale', 'posts_per_page' => -1 ) );
if ( ! $pages ) {
	WP_CLI::warning( 'No VIP Sale page with saved words.' );
}
foreach ( $pages as $page ) {
	$meta    = get_post_meta( $page->ID, '_ndm_vip_sale', true );
	$changed = false;
	foreach ( (array) ( $meta['groups'] ?? array() ) as $i => $group ) {
		if ( false !== strpos( (string) ( $group['category'] ?? '' ), 'aptos' ) && 'Thread lift' !== ( $group['tab'] ?? '' ) ) {
			WP_CLI::log( "Page {$page->ID}: {$group['category']} tab \"{$group['tab']}\" -> \"Thread lift\"" );
			$meta['groups'][ $i ]['tab'] = 'Thread lift';
			$changed                     = true;
		}
	}
	$terms = (string) ( $meta['footer_terms'] ?? '' );
	$new   = preg_replace( '/Not included:[^.]*\\./', $list, $terms, 1 );
	if ( $new !== $terms ) {
		WP_CLI::log( "Page {$page->ID}: fine print -> $new" );
		$meta['footer_terms'] = $new;
		$changed              = true;
	}
	if ( ! $changed ) {
		WP_CLI::log( "Page {$page->ID}: already corrected." );
	} elseif ( $apply ) {
		update_post_meta( $page->ID, '_ndm_vip_sale', wp_slash( $meta ) );
		wp_update_post( array( 'ID' => $page->ID ) ); // a save: the site is told the page changed
	}
}
WP_CLI::success( $apply ? 'Done.' : 'Dry run, nothing changed. Add "apply" to make the changes.' );

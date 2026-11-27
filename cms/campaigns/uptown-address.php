<?php
/**
 * The Uptown clinic's address in the words kept in WordPress (2026-11-14): it is in North York, and its
 * parking is the Hullmark Centre.
 *   wp eval-file cms/campaigns/uptown-address.php          (dry run)
 *   wp eval-file cms/campaigns/uptown-address.php apply
 * Changes the fields of pages and posts (the home page, About, procedures, concerns...), post texts and the
 * Site Settings. Revisions are left as they are. Safe to run again.
 */
global $wpdb;
$apply = in_array( 'apply', $args ?? array(), true );
$swap  = array(
	'4763 Yonge Street, Toronto, ON' => '4763 Yonge Street, North York, ON',
	'Hallmark Centre'                => 'Hullmark Centre',
);
$fix   = static function ( $value ) use ( &$fix, $swap ) {
	if ( is_array( $value ) ) {
		return array_map( $fix, $value );
	}
	return is_string( $value ) ? strtr( $value, $swap ) : $value;
};
$like  = array( '%4763 Yonge Street, Toronto, ON%', '%Hallmark Centre%' );
$count = 0;

foreach ( $wpdb->get_results( $wpdb->prepare( "SELECT pm.post_id, pm.meta_key FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type <> 'revision' AND ( pm.meta_value LIKE %s OR pm.meta_value LIKE %s )", $like ) ) as $row ) {
	$old = get_post_meta( $row->post_id, $row->meta_key, true );
	$new = $fix( $old );
	if ( $new === $old ) {
		continue;
	}
	++$count;
	WP_CLI::log( get_post_type( $row->post_id ) . " {$row->post_id} \"" . get_the_title( $row->post_id ) . "\": fields {$row->meta_key}" );
	if ( $apply ) {
		update_post_meta( $row->post_id, $row->meta_key, wp_slash( $new ) );
		wp_update_post( array( 'ID' => (int) $row->post_id ) ); // a save: the site is told the post changed
	}
}

foreach ( $wpdb->get_results( $wpdb->prepare( "SELECT ID, post_content, post_excerpt FROM {$wpdb->posts} WHERE post_type <> 'revision' AND ( post_content LIKE %s OR post_content LIKE %s OR post_excerpt LIKE %s OR post_excerpt LIKE %s )", array_merge( $like, $like ) ) ) as $row ) {
	++$count;
	WP_CLI::log( get_post_type( $row->ID ) . " {$row->ID} \"" . get_the_title( $row->ID ) . "\": text" );
	if ( $apply ) {
		wp_update_post( wp_slash( array( 'ID' => (int) $row->ID, 'post_content' => strtr( $row->post_content, $swap ), 'post_excerpt' => strtr( $row->post_excerpt, $swap ) ) ) );
	}
}

$settings = get_option( 'ndm_site_settings' );
if ( $settings && $fix( $settings ) !== $settings ) {
	++$count;
	WP_CLI::log( 'Site Settings' );
	if ( $apply ) {
		update_option( 'ndm_site_settings', $fix( $settings ) );
	}
}

WP_CLI::success( $count . ( $apply ? ' changed.' : ' to change. Dry run: add "apply" to make the changes.' ) );

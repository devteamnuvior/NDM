<?php
/**
 * Two changes of 2026-11-16 in the words kept in WordPress, matching the site's built-in words:
 *   1. Monday to Friday the clinics open at 10am, not 9am (FAQ answers and any other field that states the hours).
 *   2. Aptos: the downtime figure is replaced with sessions, in the home page's "Our Signature" dials
 *      ("2 weeks, Downtime" -> "1 session, For most plans") and in the Aptos page's quick facts
 *      ("Recovery time, Up to 2 weeks" -> "Sessions, One for most plans").
 *
 *   wp eval-file cms/campaigns/hours-and-aptos-sessions.php          (dry run)
 *   wp eval-file cms/campaigns/hours-and-aptos-sessions.php apply
 *
 * Changes the `_ndm_*` fields of pages and posts, post texts and the Site Settings. Revisions are left as
 * they are. With "apply" the earlier values are first written to a JSON file (its path is printed).
 * Safe to run again.
 */
global $wpdb;
$apply = in_array( 'apply', $args ?? array(), true );

/* "Monday to Friday, 9am – 7pm", "Mon to Fri 9am to 7pm", "Monday – Friday: 9 am" ... */
$hours = '/(Mon(?:day)?\s*(?:to|–|-|&ndash;)\s*Fri(?:day)?[,:]?\s*)9\s?(am)/iu';

/* a row of words (a list or a keyed row) that holds all of the old values gets the new ones */
$rows = array(
	array( array( 'Downtime' => 'For most plans', 'weeks' => 'session', '2' => '1', 'Up to about 2 weeks' => 'One session for most plans', '50' => '20' ), array( 'Downtime', 'weeks' ) ),
	array( array( 'Recovery time' => 'Sessions', 'Up to 2 weeks' => 'One for most plans' ), array( 'Recovery time', 'Up to 2 weeks' ) ),
);

$fix = static function ( $value ) use ( &$fix, $hours, $rows ) {
	if ( is_array( $value ) ) {
		$strings = array_filter( $value, 'is_string' );
		foreach ( $rows as list( $swap, $needs ) ) {
			if ( ! array_diff( $needs, $strings ) ) {
				foreach ( $value as $k => $v ) {
					if ( is_string( $v ) && isset( $swap[ $v ] ) ) {
						$value[ $k ] = $swap[ $v ];
					}
				}
			}
		}
		return array_map( $fix, $value );
	}
	return is_string( $value ) ? preg_replace( $hours, '${1}10$2', $value ) : $value;
};

/* what changed, in a few words per value */
$show = static function ( $old, $new, $path = '' ) use ( &$show ) {
	if ( is_array( $old ) && is_array( $new ) ) {
		foreach ( $old as $k => $v ) {
			$show( $v, $new[ $k ] ?? null, '' === $path ? (string) $k : "$path.$k" );
		}
	} elseif ( $old !== $new ) {
		$cut = static function ( $s ) {
			$s = (string) $s;
			return strlen( $s ) > 90 ? substr( $s, 0, 90 ) . '...' : $s;
		};
		WP_CLI::log( "    $path: \"" . $cut( $old ) . '" -> "' . $cut( $new ) . '"' );
	}
};

$backup = array();
$count  = 0;

foreach ( $wpdb->get_results( "SELECT pm.post_id, pm.meta_key FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type <> 'revision' AND pm.meta_key LIKE '\\_ndm\\_%' AND ( pm.meta_value LIKE '%9am%' OR pm.meta_value LIKE '%9 am%' OR pm.meta_value LIKE '%Downtime%' OR pm.meta_value LIKE '%Recovery time%' )" ) as $row ) {
	$old = get_post_meta( $row->post_id, $row->meta_key, true );
	$new = $fix( $old );
	if ( $new === $old ) {
		continue;
	}
	++$count;
	WP_CLI::log( get_post_type( $row->post_id ) . " {$row->post_id} \"" . get_the_title( $row->post_id ) . "\": fields {$row->meta_key}" );
	$show( $old, $new );
	$backup['meta'][] = array( 'post' => (int) $row->post_id, 'key' => $row->meta_key, 'value' => $old );
	if ( $apply ) {
		$todo[] = array( (int) $row->post_id, $row->meta_key, $new );
	}
}

foreach ( $wpdb->get_results( "SELECT ID, post_content FROM {$wpdb->posts} WHERE post_type <> 'revision' AND post_status <> 'trash' AND ( post_content LIKE '%9am%' OR post_content LIKE '%9 am%' )" ) as $row ) {
	$new = $fix( $row->post_content );
	if ( $new === $row->post_content ) {
		continue;
	}
	++$count;
	WP_CLI::log( get_post_type( $row->ID ) . " {$row->ID} \"" . get_the_title( $row->ID ) . "\": text" );
	$backup['content'][] = array( 'post' => (int) $row->ID, 'value' => $row->post_content );
	if ( $apply ) {
		$texts[] = array( (int) $row->ID, $new );
	}
}

$settings     = get_option( 'ndm_site_settings' );
$new_settings = $settings ? $fix( $settings ) : $settings;
if ( $settings && $new_settings !== $settings ) {
	++$count;
	WP_CLI::log( 'Site Settings' );
	$show( $settings, $new_settings );
	$backup['settings'] = $settings;
}

if ( $apply && $count ) {
	$dir  = is_dir( getenv( 'HOME' ) . '/ndm-backups' ) ? getenv( 'HOME' ) . '/ndm-backups' : sys_get_temp_dir();
	$file = $dir . '/wp-words-before-hours-aptos-' . gmdate( 'Ymd-His' ) . '.json';
	if ( false === file_put_contents( $file, wp_json_encode( $backup ) ) ) {
		WP_CLI::error( "Could not write the backup to $file. Nothing was changed." );
	}
	WP_CLI::log( "Earlier values saved to $file" );
	foreach ( $todo ?? array() as list( $id, $key, $value ) ) {
		update_post_meta( $id, $key, wp_slash( $value ) );
		wp_update_post( array( 'ID' => $id ) ); // a save: the site is told the post changed
	}
	foreach ( $texts ?? array() as list( $id, $text ) ) {
		wp_update_post( wp_slash( array( 'ID' => $id, 'post_content' => $text ) ) );
	}
	if ( isset( $backup['settings'] ) ) {
		update_option( 'ndm_site_settings', $new_settings );
	}
}

WP_CLI::success( $count . ( $apply ? ' changed.' : ' to change. Dry run: add "apply" to make the changes.' ) );

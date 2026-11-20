<?php
/**
 * Fills the home page's Before And After compare cards (`results_cases` in `_ndm_home`) with the
 * real cases of the gallery (2026-11-20, user).
 *
 * Every gallery case is one 960 x 690 photo: a white frame, the before photo on the left
 * (x 14 to 473), the after photo on the right (x 481 to 946), "Before" / "After" labels below y 612.
 * Each half is cropped to 458 x 592 above the labels and added to the media library once
 * (post meta `_ndm_home_ba` = "<file name>-before" / "-after"; a second run reuses them).
 * Left out: the cases that stack before above after (Botox, Belkyra, Stretch marks 2 and 3);
 * Botox and Belkyra are prescription drugs as well.
 *
 * wp eval-file home-ba-cards.php <folder with the original photos> [apply]
 * Without "apply" it only reports. The home page's previous words are printed as JSON first.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$dir   = isset( $args[0] ) ? rtrim( $args[0], '/' ) : '';
$apply = isset( $args[1] ) && 'apply' === $args[1];
if ( ! $dir || ! is_dir( $dir ) ) {
	WP_CLI::error( 'Give the folder with the original photos.' );
}

// Order: one card per treatment, then the next round.
$cases = array(
	array( 'Laser-Acne-1', 'Laser acne' ),
	array( 'Lip-fillers-1', 'Lip filler' ),
	array( 'Tear-Troughs-17407', 'Tear troughs' ),
	array( 'Microneedling-1', 'Microneedling' ),
	array( 'Fractional-skin-resurfacing-2', 'Fractional skin resurfacing' ),
	array( 'Dermamelan-1', 'Dermamelan®' ),
	array( 'Chemical-peel-1', 'Chemical peel' ),
	array( 'PPR-Hair-6543-2', 'PRP hair' ),
	array( 'Mole-removal-61338', 'Mole removal' ),
	array( 'Laser-acne_Chemical-peels-4', 'Laser acne and chemical peel' ),
	array( 'Stretch-Marks-4', 'Stretch marks' ),
	array( 'Laser-Acne-2', 'Laser acne' ),
	array( 'Lip-fillers-21967', 'Lip filler' ),
	array( 'Tear-Troughs-17133', 'Tear troughs' ),
	array( 'Microneedling-2', 'Microneedling' ),
	array( 'Fractional-skin-resurfacing-3', 'Fractional skin resurfacing' ),
	array( 'Dermamelan-2', 'Dermamelan®' ),
	array( 'PPR-Hair-6543', 'PRP hair' ),
	array( 'Mole-removal-41946', 'Mole removal' ),
	array( 'Laser-acne_Chemical-peels-3', 'Laser acne and chemical peel' ),
	array( 'Laser-Acne-4', 'Laser acne' ),
	array( 'Lip-fillers-16292', 'Lip filler' ),
	array( 'Tear-Troughs-16681-1', 'Tear troughs' ),
	array( 'Microneedling-3', 'Microneedling' ),
	array( 'Fractional-skin-resurfacing-1', 'Fractional skin resurfacing' ),
	array( 'Dermamelan-3', 'Dermamelan®' ),
	array( 'PPR-Hair-24715', 'PRP hair' ),
	array( 'Mole-removal-60371', 'Mole removal' ),
);

$page_id = (int) get_option( 'page_on_front' );
if ( ! $page_id || 'page' !== get_option( 'show_on_front' ) ) {
	WP_CLI::error( 'No page is chosen as the homepage.' );
}
$meta = get_post_meta( $page_id, '_ndm_home', true );
if ( ! is_array( $meta ) || ! $meta ) {
	WP_CLI::error( 'The home page has no words saved yet.' );
}
WP_CLI::line( 'BEFORE: ' . wp_json_encode( array( 'results_cases' => isset( $meta['results_cases'] ) ? $meta['results_cases'] : null ) ) );

require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

/** The original photo of a case: its name with any image extension, anywhere under $dir. */
function ndm_home_ba_find( $dir, $name ) {
	$it = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS ) );
	foreach ( $it as $file ) {
		if ( preg_match( '/^' . preg_quote( $name, '/' ) . '\.(jpe?g|png|webp)$/i', $file->getFilename() ) ) {
			return $file->getPathname();
		}
	}
	return '';
}

/** The attachment made for "<name>-<side>" before, or a new one cropped from $src. */
function ndm_home_ba_half( $src, $name, $side, $label, $apply ) {
	$key   = $name . '-' . $side;
	$found = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'meta_key'    => '_ndm_home_ba', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $key, // phpcs:ignore WordPress.DB.SlowDBQuery
			'fields'      => 'ids',
			'numberposts' => 1,
		)
	);
	if ( $found ) {
		return (int) $found[0];
	}
	if ( ! $apply ) {
		return -1;
	}
	$img = imagecreatefromstring( (string) file_get_contents( $src ) );
	if ( ! $img || 960 !== imagesx( $img ) || 690 !== imagesy( $img ) ) {
		WP_CLI::warning( "$name: not a 960 x 690 photo, left out." );
		return 0;
	}
	$out = imagecreatetruecolor( 458, 592 );
	imagecopy( $out, $img, 0, 0, 'before' === $side ? 15 : 483, 14, 458, 592 );
	$tmp = wp_tempnam( $key . '.jpg' );
	imagejpeg( $out, $tmp, 88 );
	$file = array(
		'name'     => 'home-ba-' . strtolower( $key ) . '.jpg',
		'tmp_name' => $tmp,
	);
	$id = media_handle_sideload( $file, 0, ucfirst( $side ) . ', ' . $label );
	if ( is_wp_error( $id ) ) {
		WP_CLI::warning( "$key: " . $id->get_error_message() );
		return 0;
	}
	update_post_meta( $id, '_ndm_home_ba', $key );
	update_post_meta( $id, '_wp_attachment_image_alt', ucfirst( $side ) . ' ' . strtolower( $label ) . ' treatment' );
	return (int) $id;
}

$rows = array();
foreach ( $cases as $case ) {
	list( $name, $label ) = $case;
	$src = ndm_home_ba_find( $dir, $name );
	if ( ! $src ) {
		WP_CLI::warning( "$name: original not found, left out." );
		continue;
	}
	$before = ndm_home_ba_half( $src, $name, 'before', $label, $apply );
	$after  = ndm_home_ba_half( $src, $name, 'after', $label, $apply );
	if ( ! $before || ! $after ) {
		continue;
	}
	$rows[] = array(
		'before'    => $before,
		'after'     => $after,
		'name'      => '',
		'treatment' => $label,
		'focus'     => '',
	);
}

WP_CLI::line( count( $rows ) . ' cards' . ( $apply ? '' : ' (dry run)' ) );
if ( $apply ) {
	$meta['results_cases'] = $rows;
	update_post_meta( $page_id, '_ndm_home', $meta );
	WP_CLI::success( 'Home page cards saved on page ' . $page_id . '.' );
}

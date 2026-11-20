<?php
/**
 * NewDermaMed look for WooCommerce's order emails (the "invoice" the customer and the clinic receive).
 *
 * - No product photos in any order email (`show_image` is forced off).
 * - WooCommerce's HTML email templates are replaced by the ones in templates/emails/ when a file of the
 *   same name exists there: header (logo, dark heading band), footer (both clinics), order details (summary
 *   card, treatments table, totals), addresses (the customer's details), the customer's "processing" email
 *   and the clinic's "new order" email. Plain-text emails are left as WooCommerce writes them.
 * - Our styles are added after WooCommerce's, so they do not depend on the colours set in
 *   WooCommerce > Settings > Emails (the live site and the local copy differ there).
 *
 * Preview locally (writes the HTML without sending anything):
 * `docker compose run --rm cli wp ndm-pricing email-preview <order-id> --type=customer|admin > preview.html`.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

/** Folder of our email templates. */
function ndm_pricing_email_dir() {
	return NDM_PRICING_DIR . '/templates/emails/';
}

/**
 * Use our copy of an HTML email template when we have one.
 *
 * @param string $template      Path WooCommerce found.
 * @param string $template_name Template name, e.g. "emails/email-header.php".
 * @return string
 */
function ndm_pricing_email_template( $template, $template_name ) {
	if ( 0 !== strpos( $template_name, 'emails/' ) || 0 === strpos( $template_name, 'emails/plain/' ) ) {
		return $template;
	}
	$ours = ndm_pricing_email_dir() . substr( $template_name, strlen( 'emails/' ) );
	return is_readable( $ours ) ? $ours : $template;
}
add_filter( 'woocommerce_locate_template', 'ndm_pricing_email_template', 20, 2 );

/**
 * Never show product photos in an order email.
 *
 * @param array $args Arguments of wc_get_email_order_items().
 * @return array
 */
function ndm_pricing_email_items_args( $args ) {
	$args['show_image'] = false;
	return $args;
}
add_filter( 'woocommerce_email_order_items_args', 'ndm_pricing_email_items_args', 99 );

/**
 * Remember which email is being written: WooCommerce does not hand it to emails/email-header.php.
 *
 * @param string        $heading Unused.
 * @param WC_Email|null $email   The email.
 * @param bool          $read    True to read the remembered email instead.
 * @return WC_Email|null
 */
function ndm_pricing_email_current( $heading = '', $email = null, $read = false ) {
	static $current = null;
	if ( ! $read ) {
		$current = $email;
	}
	return $current;
}
add_action( 'woocommerce_email_header', 'ndm_pricing_email_current', 1, 2 );

/** The logo shown at the top of every email (PNG: email clients do not show SVG). */
function ndm_pricing_email_logo() {
	return plugins_url( 'assets/email-logo.png', NDM_PRICING_DIR . '/ndm-pricing.php' );
}

/**
 * The clinics named in the email footer. Same facts as web/src/config/site.ts.
 *
 * @return array<int, array{name: string, address: string, phone: string}>
 */
function ndm_pricing_email_clinics() {
	return array(
		array(
			'name'    => 'Uptown',
			'address' => '4763 Yonge Street, North York, ON M2N 5M5',
			'phone'   => '416-224-8800',
		),
		array(
			'name'    => 'Downtown',
			'address' => '790 Bay Street, Suite 900, Toronto, ON M5G 1N8',
			'phone'   => '416-671-9766',
		),
	);
}

/** The clinic's public address on the web (the Next.js site, not WordPress). */
function ndm_pricing_email_site_url() {
	$front = getenv( 'NDM_FRONTEND_URL' );
	if ( ! $front && defined( 'NDM_FRONTEND_URL' ) ) {
		$front = NDM_FRONTEND_URL;
	}
	return $front ? untrailingslashit( $front ) : 'https://newdermamedlaserclinic.com';
}

/**
 * A small uppercase line above the heading, per email.
 *
 * @param WC_Email|null $email The email being sent.
 * @return string
 */
function ndm_pricing_email_eyebrow( $email ) {
	$id     = is_object( $email ) && isset( $email->id ) ? $email->id : '';
	$labels = array(
		'new_order'                 => 'New website order',
		'cancelled_order'           => 'Order cancelled',
		'failed_order'              => 'Payment failed',
		'customer_processing_order' => 'Order confirmation',
		'customer_completed_order'  => 'Order complete',
		'customer_on_hold_order'    => 'Order received',
		'customer_invoice'          => 'Your invoice',
		'customer_refunded_order'   => 'Refund',
		'customer_note'             => 'A note about your order',
		'customer_failed_order'     => 'Payment not completed',
		'customer_cancelled_order'  => 'Order cancelled',
	);
	return $labels[ $id ] ?? 'NewDermaMed';
}

/**
 * Our styles, added after WooCommerce's and inlined by it.
 *
 * @param string $css WooCommerce's email CSS.
 * @return string
 */
function ndm_pricing_email_styles( $css ) {
	$css .= file_get_contents( ndm_pricing_email_dir() . 'ndm-email.css' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	return $css;
}
add_filter( 'woocommerce_email_styles', 'ndm_pricing_email_styles', 99 );

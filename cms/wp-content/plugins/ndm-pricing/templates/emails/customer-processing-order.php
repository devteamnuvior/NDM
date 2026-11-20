<?php
/**
 * The customer's order confirmation (WooCommerce's "Processing order" email, sent once the card payment
 * went through), NewDermaMed look. The next steps say the same as the site's /order-confirmed page
 * (web/src/components/checkout/confirm-page.tsx). Replaces WooCommerce's emails/customer-processing-order.php.
 *
 * @package NDM_Pricing
 * @var WC_Order $order
 * @var string   $email_heading
 * @var string   $additional_content
 * @var bool     $sent_to_admin
 * @var bool     $plain_text
 * @var WC_Email $email
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_email_header', $email_heading, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

$first = $order->get_billing_first_name();
$steps = array(
	array( 'We call you', 'Within one business day, to find a time for your free consultation and treatment.' ),
	array( 'Your consultation', 'Your provider confirms your plan in person. Treatments are given only when they suit you.' ),
);
?>
<p style="margin:0 0 12px; font-size:17px; line-height:25px; color:#1B242B;"><?php echo esc_html( $first ? sprintf( 'Hi %s,', $first ) : 'Hello,' ); ?></p>
<p style="margin:0 0 26px; font-size:15px; line-height:23px; color:#5A646C;">Thank you for choosing NewDermaMed. We have received your order and your payment. Here is your summary.</p>

<?php
do_action( 'woocommerce_email_order_details', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
?>

<p style="margin:0 0 12px; font-family:Helvetica, Arial, sans-serif; font-size:11px; line-height:14px; letter-spacing:2px; text-transform:uppercase; color:#0F80C3; font-weight:bold;">What happens next</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 30px;">
	<?php foreach ( $steps as $n => $step ) : ?>
		<tr>
			<td width="40" valign="top" style="width:40px; padding:0 0 16px; vertical-align:top;">
				<div style="width:28px; height:28px; line-height:28px; border-radius:14px; background-color:#FFA617; color:#1B242B; font-family:Helvetica, Arial, sans-serif; font-size:13px; font-weight:bold; text-align:center;"><?php echo esc_html( $n + 1 ); ?></div>
			</td>
			<td valign="top" style="padding:3px 0 16px; vertical-align:top; font-family:Helvetica, Arial, sans-serif;">
				<p style="margin:0 0 2px; font-size:15px; line-height:21px; color:#1B242B; font-weight:bold;"><?php echo esc_html( $step[0] ); ?></p>
				<p style="margin:0; font-size:14px; line-height:21px; color:#5A646C;"><?php echo esc_html( $step[1] ); ?></p>
			</td>
		</tr>
	<?php endforeach; ?>
</table>

<?php
do_action( 'woocommerce_email_order_meta', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
do_action( 'woocommerce_email_customer_details', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

// WooCommerce's stock line ("Get the app", "Thanks again") is left out; text typed in its email settings still shows.
if ( $additional_content && trim( $additional_content ) !== trim( $email->format_string( $email->get_default_additional_content() ) ) ) {
	echo '<div style="margin:24px 0 0; font-size:14px; line-height:21px; color:#5A646C;">' . wp_kses_post( wpautop( wptexturize( $additional_content ) ) ) . '</div>';
}
?>
<p style="margin:24px 0 0; font-size:12px; line-height:18px; color:#8A9399;">Individual results may vary. Questions about your order? Reply to this email or call your clinic.</p>
<?php
do_action( 'woocommerce_email_footer', $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

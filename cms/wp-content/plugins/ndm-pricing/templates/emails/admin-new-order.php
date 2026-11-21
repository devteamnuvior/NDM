<?php
/**
 * The clinic's "New order" email, NewDermaMed look: who ordered, the summary card and treatments, the
 * customer's details and a button to the order in WooCommerce. Replaces WooCommerce's emails/admin-new-order.php.
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
?>
<p style="margin:0 0 26px; font-size:15px; line-height:23px; color:#5A646C;">
	<strong style="color:#1B242B;"><?php echo esc_html( $order->get_formatted_billing_full_name() ); ?></strong> placed an order on the website.
	Please call them within one business day to book the consultation and treatment.
</p>

<?php
do_action( 'woocommerce_email_order_details', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
do_action( 'woocommerce_email_order_meta', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
do_action( 'woocommerce_email_customer_details', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
?>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:26px 0 0;">
	<tr>
		<td style="background-color:#0F80C3; border-radius:999px;">
			<a href="<?php echo esc_url( $order->get_edit_order_url() ); ?>" target="_blank" style="display:inline-block; padding:13px 26px; font-family:Helvetica, Arial, sans-serif; font-size:14px; line-height:18px; font-weight:bold; color:#FFFFFF; text-decoration:none;">Open the order</a>
		</td>
	</tr>
</table>
<?php
// WooCommerce's stock line ("Get the app", "Thanks again") is left out; text typed in its email settings still shows.
if ( $additional_content && trim( $additional_content ) !== trim( $email->format_string( $email->get_default_additional_content() ) ) ) {
	echo '<div style="margin:24px 0 0; font-size:14px; line-height:21px; color:#5A646C;">' . wp_kses_post( wpautop( wptexturize( $additional_content ) ) ) . '</div>';
}

do_action( 'woocommerce_email_footer', $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

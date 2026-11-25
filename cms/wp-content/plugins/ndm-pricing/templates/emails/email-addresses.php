<?php
/**
 * The customer's details, NewDermaMed look: name, phone and email in a light box (the clinic orders carry
 * no shipping). Replaces WooCommerce's emails/email-addresses.php.
 *
 * @package NDM_Pricing
 * @var WC_Order $order
 * @var bool     $sent_to_admin
 */

defined( 'ABSPATH' ) || exit;

$address = $order->get_formatted_billing_address();
$phone   = $order->get_billing_phone();
$mail    = $order->get_billing_email();
$title   = $sent_to_admin ? 'Customer' : 'Your details';
?>
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 6px; border:1px solid #E6E6E1; border-radius:14px;">
	<tr>
		<td style="padding:18px 20px; font-family:Helvetica, Arial, sans-serif;">
			<p style="margin:0 0 8px; font-size:11px; line-height:14px; letter-spacing:2px; text-transform:uppercase; color:#0F80C3; font-weight:bold;"><?php echo esc_html( $title ); ?></p>
			<p style="margin:0; font-size:14px; line-height:22px; color:#1B242B;">
				<?php echo wp_kses_post( $address ? $address : esc_html( $order->get_formatted_billing_full_name() ) ); ?>
				<?php if ( $phone ) : ?>
					<br /><a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', $phone ) ); ?>" style="color:#1B242B; text-decoration:none;"><?php echo esc_html( $phone ); ?></a>
				<?php endif; ?>
				<?php if ( $mail ) : ?>
					<br /><a href="mailto:<?php echo esc_attr( $mail ); ?>" style="color:#0F80C3; text-decoration:none;"><?php echo esc_html( $mail ); ?></a>
				<?php endif; ?>
				<?php do_action( 'woocommerce_email_customer_address_section', 'billing', $order, $sent_to_admin, false ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
			</p>
		</td>
	</tr>
</table>

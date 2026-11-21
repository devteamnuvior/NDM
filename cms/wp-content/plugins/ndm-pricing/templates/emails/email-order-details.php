<?php
/**
 * Order details, NewDermaMed look: a summary card (order number, date, payment, clinic, preferred time),
 * the treatments without photos, then the totals. Replaces WooCommerce's emails/email-order-details.php.
 *
 * @package NDM_Pricing
 * @var WC_Order $order
 * @var bool     $sent_to_admin
 * @var bool     $plain_text
 * @var WC_Email $email
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_email_before_order_table', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

$number = $order->get_order_number();
$number = $sent_to_admin
	? '<a href="' . esc_url( $order->get_edit_order_url() ) . '" style="color:#0F80C3; text-decoration:none;">#' . esc_html( $number ) . '</a>'
	: '#' . esc_html( $number );

$created = $order->get_date_created();
$paid    = $order->get_date_paid();
$payment = $order->get_payment_method_title();
if ( $payment ) {
	$payment .= $paid ? ' (paid)' : ( $order->needs_payment() ? ' (not paid yet)' : '' );
}

$facts = array(
	array( 'Order', $number ),
	array( 'Date', $created ? esc_html( wc_format_datetime( $created ) ) : '' ),
	array( 'Payment', esc_html( $payment ) ),
	array( 'Clinic', esc_html( (string) $order->get_meta( '_ndm_clinic' ) ) ),
	array( 'Preferred time', esc_html( (string) $order->get_meta( '_ndm_preferred_time' ) ) ),
);
$facts = array_values(
	array_filter(
		$facts,
		function ( $fact ) {
			return '' !== trim( wp_strip_all_tags( $fact[1] ) );
		}
	)
);

$label = 'margin:0 0 3px; font-size:11px; line-height:14px; letter-spacing:1.4px; text-transform:uppercase; color:#5A646C;';
$value = 'margin:0; font-size:15px; line-height:21px; color:#1B242B; font-weight:bold;';
?>
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" class="ndm-facts" style="background-color:#F6F6F3; border-radius:14px; margin:6px 0 30px;">
	<?php foreach ( array_chunk( $facts, 2 ) as $r => $pair ) : ?>
		<tr>
			<?php foreach ( $pair as $c => $fact ) : ?>
				<td width="50%" valign="top" class="ndm-fact" style="width:50%; vertical-align:top; padding:<?php echo 0 === $r ? '18px' : '0'; ?> 20px 18px; font-family:Helvetica, Arial, sans-serif;" <?php echo 1 === count( $pair ) ? 'colspan="2"' : ''; ?>>
					<p style="<?php echo esc_attr( $label ); ?>"><?php echo esc_html( $fact[0] ); ?></p>
					<p style="<?php echo esc_attr( $value ); ?>"><?php echo wp_kses_post( $fact[1] ); ?></p>
				</td>
			<?php endforeach; ?>
		</tr>
	<?php endforeach; ?>
</table>

<p style="margin:0 0 10px; font-family:Helvetica, Arial, sans-serif; font-size:11px; line-height:14px; letter-spacing:2px; text-transform:uppercase; color:#0F80C3; font-weight:bold;"><?php echo $sent_to_admin ? 'Treatments' : 'Your treatments'; ?></p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" class="ndm-items" style="width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; margin:0 0 6px;">
	<tr>
		<th align="left" style="padding:0 0 10px; border-bottom:1px solid #1B242B; font-size:12px; line-height:16px; color:#5A646C; font-weight:normal; text-align:left;">Treatment</th>
		<th align="center" width="56" style="width:56px; padding:0 0 10px; border-bottom:1px solid #1B242B; font-size:12px; line-height:16px; color:#5A646C; font-weight:normal; text-align:center;">Qty</th>
		<th align="right" width="110" style="width:110px; padding:0 0 10px; border-bottom:1px solid #1B242B; font-size:12px; line-height:16px; color:#5A646C; font-weight:normal; text-align:right;">Price</th>
	</tr>
	<?php
	foreach ( $order->get_items() as $item_id => $item ) :
		if ( ! apply_filters( 'woocommerce_order_item_visible', true, $item ) ) { // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
			continue;
		}
		$product = $item->get_product();
		$sku     = ( $sent_to_admin && is_object( $product ) ) ? $product->get_sku() : '';
		$meta    = wc_display_item_meta(
			$item,
			array(
				'before'       => '',
				'after'        => '',
				'separator'    => '<br>',
				'echo'         => false,
				'label_before' => '<span>',
				'label_after'  => ':</span> ',
			)
		);
		?>
		<tr>
			<td valign="top" style="padding:16px 12px 16px 0; border-bottom:1px solid #E6E6E1; vertical-align:top;">
				<p style="margin:0; font-size:15px; line-height:21px; color:#1B242B; font-weight:bold;">
					<?php echo wp_kses_post( apply_filters( 'woocommerce_order_item_name', $item->get_name(), $item, false ) ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
				</p>
				<?php if ( $meta || $sku ) : ?>
					<p style="margin:4px 0 0; font-size:13px; line-height:19px; color:#5A646C;">
						<?php echo wp_kses( $meta, array( 'br' => array(), 'span' => array() ) ); ?>
						<?php echo $sku ? ( $meta ? '<br>' : '' ) . 'SKU: ' . esc_html( $sku ) : ''; ?>
					</p>
				<?php endif; ?>
				<?php
				do_action( 'woocommerce_order_item_meta_start', $item_id, $item, $order, $plain_text ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
				do_action( 'woocommerce_order_item_meta_end', $item_id, $item, $order, $plain_text ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
				?>
			</td>
			<td valign="top" align="center" style="padding:16px 0; border-bottom:1px solid #E6E6E1; vertical-align:top; font-size:15px; line-height:21px; color:#1B242B; text-align:center;">
				<?php echo esc_html( $item->get_quantity() ); ?>
			</td>
			<td valign="top" align="right" style="padding:16px 0; border-bottom:1px solid #E6E6E1; vertical-align:top; font-size:15px; line-height:21px; color:#1B242B; text-align:right; white-space:nowrap;">
				<?php echo wp_kses_post( $order->get_formatted_line_subtotal( $item ) ); ?>
			</td>
		</tr>
	<?php endforeach; ?>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" class="ndm-totals" style="width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; margin:0 0 30px;">
	<?php
	$totals = $order->get_order_item_totals();
	$last   = count( $totals );
	$i      = 0;
	foreach ( $totals as $key => $total ) :
		++$i;
		if ( 'payment_method' === $key ) {
			continue; // shown in the summary card
		}
		$is_total = 'order_total' === $key;
		$label    = rtrim( wp_strip_all_tags( $total['label'] ), ': ' );
		?>
		<tr>
			<td align="right" style="padding:<?php echo $is_total ? '14px' : '10px'; ?> 16px 0 0; text-align:right; font-size:<?php echo $is_total ? '15px' : '14px'; ?>; line-height:20px; color:<?php echo $is_total ? '#1B242B' : '#5A646C'; ?>; <?php echo $is_total ? 'font-weight:bold; border-top:1px solid #1B242B;' : ''; ?>">
				<?php echo esc_html( $label ); ?>
			</td>
			<td align="right" width="150" style="width:150px; padding:<?php echo $is_total ? '14px' : '10px'; ?> 0 0; text-align:right; white-space:nowrap; font-size:<?php echo $is_total ? '20px' : '14px'; ?>; line-height:<?php echo $is_total ? '24px' : '20px'; ?>; color:<?php echo $is_total ? '#0F80C3' : '#1B242B'; ?>; <?php echo $is_total ? 'font-weight:bold; border-top:1px solid #1B242B;' : ''; ?>">
				<?php echo wp_kses_post( $total['value'] ); ?>
			</td>
		</tr>
	<?php endforeach; ?>
</table>

<?php if ( $order->get_customer_note() ) : ?>
	<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 30px;">
		<tr>
			<td style="border-left:3px solid #FFA617; padding:4px 0 4px 16px; font-family:Helvetica, Arial, sans-serif;">
				<p style="margin:0 0 4px; font-size:11px; line-height:14px; letter-spacing:1.4px; text-transform:uppercase; color:#5A646C;">Note</p>
				<p style="margin:0; font-size:14px; line-height:21px; color:#1B242B;"><?php echo wp_kses( nl2br( wc_wptexturize_order_note( $order->get_customer_note() ) ), array( 'br' => array() ) ); ?></p>
			</td>
		</tr>
	</table>
<?php endif; ?>

<?php
do_action( 'woocommerce_email_after_order_table', $order, $sent_to_admin, $plain_text, $email ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

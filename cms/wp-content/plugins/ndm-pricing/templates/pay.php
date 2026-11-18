<?php
/**
 * WooCommerce's pay page for a website order, in NewDermaMed's colours and fonts. WooCommerce draws the
 * order summary and the Bambora card form ([woocommerce_checkout] on the order-pay endpoint); wp_head()
 * and wp_footer() load the gateway's own scripts. See includes/payments.php.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

$ndm_site = ndm_pricing_site_base();
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Secure card payment, NewDermaMed</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Manrope:wght@400;500;600;700&display=swap">
<?php wp_head(); ?>
<style>
	:root { --ink:#1B242B; --muted:#5A646C; --deep:#0F80C3; --navy:#0A4F7A; --paper:#FAFAF8; --mist:#F2F2EF; --line:rgba(27,36,43,.12); }
	html, body.ndm-pay { margin:0; background:var(--paper); color:var(--ink); font-family:Manrope, system-ui, sans-serif; font-size:15px; line-height:1.55; }
	.ndm-pay *, .ndm-pay *::before, .ndm-pay *::after { box-sizing:border-box; }
	.ndm-pay-bar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 16px; border-bottom:1px solid var(--line); background:#fff; }
	.ndm-pay-bar img { display:block; height:40px; width:auto; }
	.ndm-pay-lock { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--muted); }
	.ndm-pay-main { max-width:760px; margin:0 auto; padding:40px 16px 64px; }
	.ndm-pay-tag { margin:0; font-size:12px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--deep); }
	.ndm-pay h1 { margin:10px 0 0; font-family:Fraunces, Georgia, serif; font-weight:400; font-size:clamp(32px,5vw,46px); line-height:1.08; letter-spacing:-.01em; }
	.ndm-pay h1 span { display:block; color:var(--deep); }
	.ndm-pay-lead { margin:14px 0 0; max-width:56ch; color:var(--muted); font-size:16px; }
	.ndm-pay-card { margin-top:28px; padding:clamp(20px,4vw,36px); border-radius:24px; background:#fff; box-shadow:0 1px 0 var(--line), 0 24px 48px -32px rgba(27,36,43,.25); }
	.ndm-pay-card table.shop_table { width:100%; border-collapse:collapse; margin:0 0 24px; font-size:14px; }
	.ndm-pay-card table.shop_table th, .ndm-pay-card table.shop_table td { padding:10px 0; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
	.ndm-pay-card table.shop_table td:last-child, .ndm-pay-card table.shop_table th:last-child { text-align:right; }
	.ndm-pay-card table.shop_table tfoot tr:last-child th, .ndm-pay-card table.shop_table tfoot tr:last-child td { font-weight:700; font-size:16px; border-bottom:0; }
	.ndm-pay-card ul.wc_payment_methods { list-style:none; margin:0; padding:0; }
	.ndm-pay-card li.wc_payment_method > label { font-weight:600; }
	.ndm-pay-card .payment_box { margin-top:12px; padding:16px; border-radius:16px; background:var(--mist); }
	.ndm-pay-card input[type=text], .ndm-pay-card input[type=tel], .ndm-pay-card input[type=email], .ndm-pay-card select { width:100%; min-height:46px; padding:10px 14px; border:1px solid var(--line); border-radius:12px; background:#fff; font:inherit; color:var(--ink); }
	.ndm-pay-card label { font-size:13px; font-weight:500; }
	.ndm-pay-card .form-row { margin:0 0 12px; }
	.ndm-pay-card #place_order, .ndm-pay-card button[type=submit] { display:inline-flex; align-items:center; justify-content:center; min-height:50px; margin-top:16px; padding:0 30px; border:0; border-radius:999px; background:var(--deep); color:#fff; font:600 15px/1 Manrope, system-ui, sans-serif; cursor:pointer; transition:background .2s; }
	.ndm-pay-card #place_order:hover, .ndm-pay-card button[type=submit]:hover { background:var(--navy); }
	.ndm-pay-card .woocommerce-error, .ndm-pay-card .woocommerce-info, .ndm-pay-card .woocommerce-message { list-style:none; margin:0 0 16px; padding:12px 16px; border-radius:12px; background:var(--mist); }
	.ndm-pay-card .woocommerce-error { background:#FDECEC; color:#8A1C1C; }
	/* WooCommerce's own icon sits on top of the first word here: leave it out */
	.ndm-pay-card .woocommerce-error::before, .ndm-pay-card .woocommerce-info::before, .ndm-pay-card .woocommerce-message::before { content:none; display:none; }
	/* WooCommerce's own checkout styles: grey-purple boxes and boxed tables, recoloured */
	.ndm-pay .ndm-pay-card table.shop_table { border:0; border-radius:0; }
	.ndm-pay .ndm-pay-card table.shop_table td, .ndm-pay .ndm-pay-card table.shop_table th { border-left:0; border-right:0; border-top:0; padding-left:0; padding-right:0; }
	.ndm-pay.woocommerce-checkout #payment, .ndm-pay #payment { background:var(--mist); border-radius:18px; }
	.ndm-pay #payment ul.payment_methods { border-bottom-color:var(--line); }
	.ndm-pay #payment div.payment_box { background:#fff; color:var(--ink); border-radius:12px; }
	.ndm-pay #payment div.payment_box::before { border-bottom-color:#fff; }
	.ndm-pay #payment .place-order { border-radius:0 0 18px 18px; }
	.ndm-pay a { color:var(--deep); }
	.ndm-pay-note { margin:18px 0 0; font-size:13px; color:var(--muted); }
	.ndm-pay-note a { color:var(--deep); }
</style>
</head>
<body <?php body_class( 'ndm-pay woocommerce-checkout woocommerce-order-pay' ); ?>>
<header class="ndm-pay-bar">
	<a href="<?php echo esc_url( $ndm_site . '/' ); ?>"><img src="<?php echo esc_url( $ndm_site . '/assets/icons/logo-color.svg' ); ?>" width="204" height="40" alt="NewDermaMed"></a>
	<span class="ndm-pay-lock"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Secure payment</span>
</header>
<main class="ndm-pay-main">
	<p class="ndm-pay-tag">Checkout</p>
	<h1>Pay for your order<span>by card</span></h1>
	<p class="ndm-pay-lead">Your order request is saved. Enter your card below to pay for it. The payment is processed securely by Bambora, our payment provider.</p>
	<div class="ndm-pay-card woocommerce">
		<?php echo do_shortcode( '[woocommerce_checkout]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
	<p class="ndm-pay-note">Questions about your order? Call the clinic, or <a href="<?php echo esc_url( $ndm_site . '/' ); ?>">go back to the website</a>.</p>
</main>
<?php wp_footer(); ?>
</body>
</html>

<?php
/**
 * Email header, NewDermaMed look: logo on the page colour, then a white card whose top is a dark band
 * carrying a small label and the email's heading. Replaces WooCommerce's emails/email-header.php
 * (includes/emails.php). Closed by email-footer.php.
 *
 * @package NDM_Pricing
 * @var string        $email_heading
 * @var WC_Email|null $email
 */

defined( 'ABSPATH' ) || exit;

$email      = $email ?? ndm_pricing_email_current( '', null, true );
$store_name = get_bloginfo( 'name', 'display' );
$site_url   = ndm_pricing_email_site_url();
$eyebrow    = ndm_pricing_email_eyebrow( $email );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo( 'charset' ); ?>" />
	<meta content="width=device-width, initial-scale=1.0" name="viewport">
	<meta name="color-scheme" content="light">
	<meta name="supported-color-schemes" content="light">
	<title><?php echo esc_html( $store_name ); ?></title>
</head>
<body class="ndm-body" style="margin:0; padding:0; background-color:#F2F2EF;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" class="ndm-outer" style="background-color:#F2F2EF;">
	<tr>
		<td align="center" style="padding:32px 12px 40px;">
			<table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" class="ndm-wrap" style="width:600px; max-width:600px;">
				<tr>
					<td class="ndm-logo" style="padding:0 4px 22px; text-align:left;">
						<a href="<?php echo esc_url( $site_url ); ?>" target="_blank" style="text-decoration:none;">
							<img src="<?php echo esc_url( ndm_pricing_email_logo() ); ?>" width="190" alt="NewDermaMed" style="display:block; width:190px; max-width:190px; height:auto; border:0;" />
						</a>
					</td>
				</tr>
				<tr>
					<td class="ndm-card" style="background-color:#FFFFFF; border-radius:18px; overflow:hidden; border:1px solid #E6E6E1;">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
							<tr>
								<td class="ndm-band" style="background-color:#1B242B; padding:30px 36px 28px; border-radius:17px 17px 0 0;">
									<p class="ndm-eyebrow" style="margin:0 0 10px; font-family:Helvetica, Arial, sans-serif; font-size:11px; line-height:14px; letter-spacing:2px; text-transform:uppercase; color:#FFA617; font-weight:bold;">
										<?php echo esc_html( $eyebrow ); ?>
									</p>
									<h1 class="ndm-h1" style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:28px; line-height:34px; font-weight:normal; color:#FFFFFF; text-align:left;">
										<?php echo esc_html( $email_heading ); ?>
									</h1>
								</td>
							</tr>
							<tr>
								<td class="ndm-content" style="padding:32px 36px 36px; font-family:Helvetica, Arial, sans-serif; font-size:15px; line-height:23px; color:#1B242B; text-align:left;">
									<div id="body_content_inner">

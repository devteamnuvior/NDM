<?php
/**
 * Email footer, NewDermaMed look: closes the card from email-header.php, then both clinics with their
 * phone numbers, the clinic email and the website. Replaces WooCommerce's emails/email-footer.php.
 *
 * @package NDM_Pricing
 * @var WC_Email|null $email
 */

defined( 'ABSPATH' ) || exit;

$site_url  = ndm_pricing_email_site_url();
$site_host = preg_replace( '#^https?://#', '', $site_url );
?>
									</div>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td class="ndm-foot" style="padding:28px 4px 0; font-family:Helvetica, Arial, sans-serif;">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
							<tr>
								<?php foreach ( ndm_pricing_email_clinics() as $i => $clinic ) : ?>
									<td class="ndm-foot-col" width="50%" valign="top" style="width:50%; padding:0 <?php echo 0 === $i ? '12px' : '0'; ?> 0 <?php echo 0 === $i ? '0' : '12px'; ?>; vertical-align:top;">
										<p style="margin:0 0 4px; font-size:11px; line-height:14px; letter-spacing:1.6px; text-transform:uppercase; color:#0F80C3; font-weight:bold;"><?php echo esc_html( $clinic['name'] ); ?> clinic</p>
										<p style="margin:0 0 4px; font-size:13px; line-height:19px; color:#5A646C;"><?php echo esc_html( $clinic['address'] ); ?></p>
										<p style="margin:0; font-size:13px; line-height:19px;"><a href="tel:+1<?php echo esc_attr( preg_replace( '/\D/', '', $clinic['phone'] ) ); ?>" style="color:#1B242B; text-decoration:none; font-weight:bold;"><?php echo esc_html( $clinic['phone'] ); ?></a></p>
									</td>
								<?php endforeach; ?>
							</tr>
						</table>
						<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
							<tr>
								<td style="padding:24px 0 0; border-bottom:1px solid #DCDCD6; font-size:0; line-height:0;">&nbsp;</td>
							</tr>
							<tr>
								<td style="padding:18px 0 0; font-size:12px; line-height:19px; color:#5A646C;">
									<a href="mailto:info@newdermamed.com" style="color:#5A646C; text-decoration:none;">info@newdermamed.com</a>
									&nbsp;&middot;&nbsp;
									<a href="<?php echo esc_url( $site_url ); ?>" target="_blank" style="color:#5A646C; text-decoration:none;"><?php echo esc_html( $site_host ); ?></a>
									<br />
									&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> NewDermaMed Laser Clinic, Toronto
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
</body>
</html>

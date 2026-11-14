<?php
/**
 * Plugin Name: NewDermaMed Headless
 * Description: Makes this WordPress a backend only: the REST API and the admin stay, the public site is the Next.js app. Its one admin screen is Site Settings (header and footer of the site).
 * Version:     0.1.0
 * Author:      NewDermaMed
 * License:     GPL-2.0-or-later
 *
 * Must-use plugin: WordPress loads this file by itself and it cannot be switched off from the admin.
 * Configuration comes from constants in wp-config.php or from environment variables, never from the database:
 *
 *   NDM_FRONTEND_URL      Address of the Next.js site (visitors to WordPress pages are sent there).
 *   NDM_FRONTEND_ORIGINS  Comma separated browser origins allowed to call the REST API (CORS).
 *   WP_ENVIRONMENT_TYPE   local, development, staging or production (WordPress core setting).
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

define( 'NDM_HEADLESS_VERSION', '0.1.0' );
define( 'NDM_HEADLESS_DIR', __DIR__ . '/ndm-headless' );

require_once NDM_HEADLESS_DIR . '/includes/config.php';
require_once NDM_HEADLESS_DIR . '/includes/cors.php';
require_once NDM_HEADLESS_DIR . '/includes/frontend.php';
require_once NDM_HEADLESS_DIR . '/includes/security.php';
require_once NDM_HEADLESS_DIR . '/includes/rest.php';
require_once NDM_HEADLESS_DIR . '/includes/search.php';
require_once NDM_HEADLESS_DIR . '/includes/pages.php';
require_once NDM_HEADLESS_DIR . '/includes/before-after.php';
require_once NDM_HEADLESS_DIR . '/includes/concerns.php';
require_once NDM_HEADLESS_DIR . '/includes/procedures.php';
require_once NDM_HEADLESS_DIR . '/includes/aptos.php';
require_once NDM_HEADLESS_DIR . '/includes/about.php';
require_once NDM_HEADLESS_DIR . '/includes/home.php';
require_once NDM_HEADLESS_DIR . '/includes/blog.php';
require_once NDM_HEADLESS_DIR . '/includes/bookings.php';
require_once NDM_HEADLESS_DIR . '/includes/settings.php';

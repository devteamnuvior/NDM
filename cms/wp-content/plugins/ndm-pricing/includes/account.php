<?php
/**
 * Customer accounts of the website: ndm/v1/account/*.
 *
 * "My account" on the Next.js site is a WooCommerce customer: a WordPress user with the role
 * "customer". These routes let the site sign a customer in, create an account, show the customer's
 * own details and orders, and change the details or the password. Nothing else of WordPress is opened.
 *
 * The routes are not public. Only the Next.js server calls them, with the application password of the
 * site's own account (role ndm_site). After a sign-in the site keeps the customer's ID and a "stamp"
 * in an encrypted cookie; the stamp is derived from the stored password hash, so every earlier
 * sign-in stops working the moment the password changes. Accounts that can do anything in wp-admin
 * (administrators, shop managers, editors) are refused here on purpose: they sign in to WordPress.
 *
 * No health information is stored or served here (PHIPA): a name, an email address, a phone number,
 * a preferred clinic, notification choices, and WooCommerce's own orders.
 *
 * @package NDM_Pricing
 */

defined( 'ABSPATH' ) || exit;

const NDM_PRICING_ACCOUNT_CAP    = 'ndm_manage_customer_accounts';
const NDM_PRICING_ACCOUNT_NOTIFY = array( 'offers', 'news', 'events' );
const NDM_PRICING_ACCOUNT_ORDERS = 50;
const NDM_PRICING_PASSWORD_MIN   = 8;
const NDM_PRICING_PASSWORD_MAX   = 128;

/**
 * The site's role gets the right to serve customer accounts (the role may exist from before).
 */
function ndm_pricing_account_cap() {
	$role = get_role( NDM_PRICING_ORDER_ROLE );

	if ( $role && ! $role->has_cap( NDM_PRICING_ACCOUNT_CAP ) ) {
		$role->add_cap( NDM_PRICING_ACCOUNT_CAP );
	}
}
add_action( 'init', 'ndm_pricing_account_cap', 11 );

/**
 * Registers the routes. Every one is a POST with a JSON body, so nothing personal is ever in an address.
 */
function ndm_pricing_register_account_routes() {
	$routes = array(
		'sign-in'       => 'ndm_pricing_account_sign_in',
		'register'      => 'ndm_pricing_account_register',
		'view'          => 'ndm_pricing_account_view',
		'profile'       => 'ndm_pricing_account_profile',
		'notifications' => 'ndm_pricing_account_notifications',
		'password'      => 'ndm_pricing_account_password',
		'reset-request' => 'ndm_pricing_account_reset_request',
		'reset'         => 'ndm_pricing_account_reset',
	);

	foreach ( $routes as $path => $callback ) {
		register_rest_route(
			NDM_PRICING_REST_NAMESPACE,
			'/account/' . $path,
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => static function ( $request ) use ( $callback ) {
					$body = $request->is_json_content_type() ? $request->get_json_params() : null;

					if ( ! is_array( $body ) ) {
						return ndm_pricing_invalid( 'Send the request as JSON.', 415 );
					}

					$answer = $callback( $body );

					if ( is_wp_error( $answer ) ) {
						return $answer;
					}

					$response = rest_ensure_response( $answer );
					$response->header( 'Cache-Control', 'no-store, private' );

					return $response;
				},
				'permission_callback' => static function () {
					if ( ! is_user_logged_in() ) {
						return new WP_Error( 'rest_login_required', __( 'Authentication is required.', 'ndm-pricing' ), array( 'status' => 401 ) );
					}

					return current_user_can( NDM_PRICING_ACCOUNT_CAP ) ? true : new WP_Error( 'rest_forbidden', __( 'This account may not serve customer accounts.', 'ndm-pricing' ), array( 'status' => 403 ) );
				},
			)
		);
	}
}
add_action( 'rest_api_init', 'ndm_pricing_register_account_routes' );

/**
 * True for an account the website may open: a customer who can do nothing in wp-admin.
 *
 * @param WP_User|false|null $user User.
 * @return bool
 */
function ndm_pricing_is_customer( $user ) {
	return $user instanceof WP_User && $user->exists() && in_array( 'customer', (array) $user->roles, true ) && ! $user->has_cap( 'edit_posts' ) && ! $user->has_cap( 'manage_woocommerce' );
}

/**
 * Changes with the password: a sign-in made before a password change no longer matches.
 *
 * @param WP_User $user User.
 * @return string
 */
function ndm_pricing_account_stamp( $user ) {
	return substr( hash_hmac( 'sha256', $user->ID . '|' . $user->user_pass, wp_salt( 'auth' ) ), 0, 40 );
}

/**
 * The signed-in customer of a request: the ID and the stamp the site kept at sign-in.
 *
 * @param array $body Request body.
 * @return WP_User|WP_Error
 */
function ndm_pricing_account_user( $body ) {
	$id    = $body['id'] ?? null;
	$stamp = $body['stamp'] ?? null;
	$user  = is_int( $id ) && $id > 0 ? get_user_by( 'id', $id ) : false;

	if ( ! is_string( $stamp ) || ! ndm_pricing_is_customer( $user ) || ! hash_equals( ndm_pricing_account_stamp( $user ), $stamp ) ) {
		return new WP_Error( 'ndm_account_signed_out', 'This sign-in has ended.', array( 'status' => 401 ) );
	}

	return $user;
}

/**
 * An email address from the request, or an error.
 *
 * @param mixed $value Incoming value.
 * @return string|WP_Error
 */
function ndm_pricing_account_email( $value ) {
	$email = sanitize_email( is_string( $value ) ? trim( $value ) : '' );

	if ( ! is_email( $email ) || strlen( $email ) > 120 ) {
		return ndm_pricing_invalid( 'Please enter a valid email address.' );
	}

	return $email;
}

/**
 * A new password from the request, or an error. Passwords are never trimmed or cleaned.
 *
 * @param mixed $value Incoming value.
 * @return string|WP_Error
 */
function ndm_pricing_account_new_password( $value ) {
	if ( ! is_string( $value ) || mb_strlen( $value ) < NDM_PRICING_PASSWORD_MIN || mb_strlen( $value ) > NDM_PRICING_PASSWORD_MAX ) {
		return ndm_pricing_invalid( sprintf( 'Please choose a password of at least %d characters.', NDM_PRICING_PASSWORD_MIN ) );
	}

	return $value;
}

/**
 * The notification choices of a customer.
 *
 * @param int $user_id User ID.
 * @return array<string,bool>
 */
function ndm_pricing_account_notify( $user_id ) {
	$saved = get_user_meta( $user_id, 'ndm_notify', true );
	$out   = array();

	foreach ( NDM_PRICING_ACCOUNT_NOTIFY as $key ) {
		$out[ $key ] = is_array( $saved ) && ! empty( $saved[ $key ] );
	}

	return $out;
}

/**
 * What the account page shows: the customer's details and orders.
 *
 * @param WP_User $user Customer.
 * @return array
 */
function ndm_pricing_account_data( $user ) {
	$customer = new WC_Customer( $user->ID );
	$orders   = array();

	$found = wc_get_orders(
		array(
			'customer_id' => $user->ID,
			'type'        => 'shop_order',
			'limit'       => NDM_PRICING_ACCOUNT_ORDERS,
			'orderby'     => 'date',
			'order'       => 'DESC',
		)
	);

	foreach ( $found as $order ) {
		$items = array();

		foreach ( $order->get_items() as $item ) {
			$items[] = array(
				'name' => wp_strip_all_tags( $item->get_name() ),
				'qty'  => (int) $item->get_quantity(),
			);
		}

		$orders[] = array(
			'number'     => (string) $order->get_order_number(),
			'date'       => gmdate( 'c', $order->get_date_created() ? $order->get_date_created()->getTimestamp() : time() ),
			'status'     => $order->get_status(),
			'statusName' => wc_get_order_status_name( $order->get_status() ),
			'clinic'     => (string) $order->get_meta( '_ndm_clinic' ),
			'items'      => $items,
			'total'      => round( (float) $order->get_total(), 2 ),
		);
	}

	return array(
		'id'     => $user->ID,
		'stamp'  => ndm_pricing_account_stamp( $user ),
		'first'  => $customer->get_first_name(),
		'last'   => $customer->get_last_name(),
		'email'  => $customer->get_email(),
		'phone'  => $customer->get_billing_phone(),
		'clinic' => (string) get_user_meta( $user->ID, 'ndm_clinic', true ),
		'notify' => ndm_pricing_account_notify( $user->ID ),
		'since'  => gmdate( 'c', strtotime( $user->user_registered . ' UTC' ) ),
		'orders' => $orders,
	);
}

/**
 * POST /account/sign-in { email, password }.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_sign_in( $body ) {
	$email    = is_string( $body['email'] ?? null ) ? sanitize_email( trim( $body['email'] ) ) : '';
	$password = is_string( $body['password'] ?? null ) ? $body['password'] : '';
	$user     = '' !== $email ? get_user_by( 'email', $email ) : false;

	// One answer for a wrong address, a wrong password and an account that is not a customer's.
	if ( '' === $password || strlen( $password ) > 4096 || ! ndm_pricing_is_customer( $user ) || ! wp_check_password( $password, $user->user_pass, $user->ID ) ) {
		return new WP_Error( 'ndm_account_denied', 'The email address or the password is not right.', array( 'status' => 401 ) );
	}

	return array(
		'id'    => $user->ID,
		'stamp' => ndm_pricing_account_stamp( $user ),
	);
}

/**
 * POST /account/register { first, last, email, password }: a new WooCommerce customer.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_register( $body ) {
	$first = ndm_pricing_clean_text( $body['first'] ?? '', 'First name', 60, true );
	$last  = ndm_pricing_clean_text( $body['last'] ?? '', 'Last name', 60, true );
	$email = ndm_pricing_account_email( $body['email'] ?? '' );
	$pass  = ndm_pricing_account_new_password( $body['password'] ?? '' );

	foreach ( array( $first, $last, $email, $pass ) as $value ) {
		if ( is_wp_error( $value ) ) {
			return $value;
		}
	}

	if ( email_exists( $email ) ) {
		return new WP_Error( 'ndm_account_exists', 'An account with this email address already exists. Please sign in.', array( 'status' => 409 ) );
	}

	$names = array(
		'first_name' => $first,
		'last_name'  => $last,
	);
	$id    = wc_create_new_customer( $email, wc_create_new_customer_username( $email, $names ), $pass, $names );

	if ( is_wp_error( $id ) ) {
		return new WP_Error( 'ndm_account_failed', 'The account could not be created.', array( 'status' => 500 ) );
	}

	$user = get_user_by( 'id', $id );

	return array(
		'id'    => $user->ID,
		'stamp' => ndm_pricing_account_stamp( $user ),
	);
}

/**
 * POST /account/view { id, stamp }.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_view( $body ) {
	$user = ndm_pricing_account_user( $body );

	return is_wp_error( $user ) ? $user : ndm_pricing_account_data( $user );
}

/**
 * POST /account/profile { id, stamp, first, last, email, phone, clinic }.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_profile( $body ) {
	$user = ndm_pricing_account_user( $body );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$first  = ndm_pricing_clean_text( $body['first'] ?? '', 'First name', 60, true );
	$last   = ndm_pricing_clean_text( $body['last'] ?? '', 'Last name', 60, true );
	$phone  = ndm_pricing_clean_text( $body['phone'] ?? '', 'Phone', 30 );
	$clinic = ndm_pricing_clean_text( $body['clinic'] ?? '', 'Clinic', 40 );
	$email  = ndm_pricing_account_email( $body['email'] ?? '' );

	foreach ( array( $first, $last, $phone, $clinic, $email ) as $value ) {
		if ( is_wp_error( $value ) ) {
			return $value;
		}
	}

	if ( '' !== $phone && ! preg_match( '/^[0-9+().\-\s]{7,30}$/', $phone ) ) {
		return ndm_pricing_invalid( 'Please enter a valid phone number.' );
	}

	$owner = email_exists( $email );
	if ( $owner && (int) $owner !== $user->ID ) {
		return new WP_Error( 'ndm_account_exists', 'Another account already uses this email address.', array( 'status' => 409 ) );
	}

	$customer = new WC_Customer( $user->ID );
	$customer->set_first_name( $first );
	$customer->set_last_name( $last );
	$customer->set_display_name( trim( "$first $last" ) );
	$customer->set_email( $email );
	$customer->set_billing_phone( $phone );
	$customer->save();
	update_user_meta( $user->ID, 'ndm_clinic', $clinic );

	return ndm_pricing_account_data( get_user_by( 'id', $user->ID ) );
}

/**
 * POST /account/notifications { id, stamp, notify: { offers, news, events } }. The moment a choice
 * changes is kept beside it: consent to commercial messages (CASL) needs its date, and so does its
 * withdrawal.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_notifications( $body ) {
	$user = ndm_pricing_account_user( $body );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$wanted = $body['notify'] ?? null;
	if ( ! is_array( $wanted ) ) {
		return ndm_pricing_invalid( 'The notification choices are missing.' );
	}

	$saved = get_user_meta( $user->ID, 'ndm_notify', true );
	$saved = is_array( $saved ) ? $saved : array();

	foreach ( NDM_PRICING_ACCOUNT_NOTIFY as $key ) {
		if ( ! is_bool( $wanted[ $key ] ?? null ) ) {
			return ndm_pricing_invalid( 'A notification choice could not be read.' );
		}

		if ( empty( $saved[ $key ] ) !== ! $wanted[ $key ] ) {
			$saved[ $key . '_at' ] = gmdate( 'c' );
		}
		$saved[ $key ] = $wanted[ $key ];
	}

	update_user_meta( $user->ID, 'ndm_notify', $saved );

	return array( 'notify' => ndm_pricing_account_notify( $user->ID ) );
}

/**
 * POST /account/password { id, stamp, current, password }: answers with the new stamp.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_password( $body ) {
	$user = ndm_pricing_account_user( $body );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$current = is_string( $body['current'] ?? null ) ? $body['current'] : '';
	if ( '' === $current || ! wp_check_password( $current, $user->user_pass, $user->ID ) ) {
		return new WP_Error( 'ndm_account_denied', 'The current password is not right.', array( 'status' => 403 ) );
	}

	$password = ndm_pricing_account_new_password( $body['password'] ?? '' );
	if ( is_wp_error( $password ) ) {
		return $password;
	}

	wp_set_password( $password, $user->ID );

	return array( 'stamp' => ndm_pricing_account_stamp( get_user_by( 'id', $user->ID ) ) );
}

/**
 * POST /account/reset-request { email }: emails a link to the site's own "choose a new password"
 * page. The answer is the same whether or not an account exists.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_reset_request( $body ) {
	$email = is_string( $body['email'] ?? null ) ? sanitize_email( trim( $body['email'] ) ) : '';
	$user  = '' !== $email ? get_user_by( 'email', $email ) : false;
	$site  = function_exists( 'ndm_headless_frontend_base' ) ? ndm_headless_frontend_base() : '';

	if ( '' === $site ) {
		return new WP_Error( 'ndm_account_no_site', 'The website address is not set in WordPress (NDM_FRONTEND_URL).', array( 'status' => 503 ) );
	}

	if ( ndm_pricing_is_customer( $user ) ) {
		$key = get_password_reset_key( $user );

		if ( ! is_wp_error( $key ) ) {
			$link = $site . '/account/reset?key=' . rawurlencode( $key ) . '&login=' . rawurlencode( $user->user_login );
			$name = wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES );
			$text = "Hello,\n\nSomeone asked to choose a new password for the $name account of this email address.\n\nTo choose a new password, open this link:\n$link\n\nThe link works once, for a limited time. If this was not you, ignore this email: nothing changes.\n\n$name\n";

			wp_mail( $user->user_email, "Choose a new password, $name", $text );
		}
	}

	return array( 'sent' => true );
}

/**
 * POST /account/reset { login, key, password }: sets the new password of a reset link.
 *
 * @param array $body Request body.
 * @return array|WP_Error
 */
function ndm_pricing_account_reset( $body ) {
	$login = is_string( $body['login'] ?? null ) ? $body['login'] : '';
	$key   = is_string( $body['key'] ?? null ) ? $body['key'] : '';
	$user  = '' !== $login && '' !== $key ? check_password_reset_key( $key, $login ) : false;

	if ( ! ndm_pricing_is_customer( $user ) ) {
		return new WP_Error( 'ndm_account_link', 'This link has expired or was already used. Please ask for a new one.', array( 'status' => 410 ) );
	}

	$password = ndm_pricing_account_new_password( $body['password'] ?? '' );
	if ( is_wp_error( $password ) ) {
		return $password;
	}

	reset_password( $user, $password );

	return array( 'done' => true );
}

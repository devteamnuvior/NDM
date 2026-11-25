<?php
/**
 * Messages from the website's "Send us a message" form (About page, Contact), under ndm/v1:
 *
 *   POST /messages   The Next.js server only (shared secret). Saves one message.
 *
 * Every message is a post of the private post type "Messages" (ndm_message), built like the
 * consultation requests (includes/bookings.php, whose secret check, text helpers and email
 * addresses it reuses): no public address, not in the REST API, left out of searches. Only editors,
 * shop managers and administrators see the list (wp-admin > Messages), where each message carries a
 * status set by hand: New, Replied, Closed. Each saved message is emailed once to the clinic, with
 * Reply-To set to the visitor so the clinic can answer from its inbox.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

const NDM_HEADLESS_MESSAGE_TYPE   = 'ndm_message';
const NDM_HEADLESS_MESSAGE_META   = '_ndm_message';
const NDM_HEADLESS_MESSAGE_STATUS = '_ndm_message_status';

/**
 * The statuses a message can have.
 *
 * @return array<string,string>
 */
function ndm_headless_message_statuses() {
	return array(
		'new'     => 'New',
		'replied' => 'Replied',
		'closed'  => 'Closed',
	);
}

/**
 * Registers the post type.
 */
function ndm_headless_message_register() {
	$caps = array();

	foreach ( array( 'edit_post', 'read_post', 'delete_post', 'edit_posts', 'edit_others_posts', 'publish_posts', 'read_private_posts', 'delete_posts', 'delete_private_posts', 'delete_published_posts', 'delete_others_posts', 'edit_private_posts', 'edit_published_posts' ) as $cap ) {
		$caps[ $cap ] = NDM_HEADLESS_BOOKING_CAP;
	}

	// Messages come from the website only: nobody adds one by hand.
	$caps['create_posts'] = 'do_not_allow';

	register_post_type(
		NDM_HEADLESS_MESSAGE_TYPE,
		array(
			'labels'              => array(
				'name'               => 'Messages',
				'singular_name'      => 'Message',
				'menu_name'          => 'Messages',
				'edit_item'          => 'Message',
				'search_items'       => 'Search messages',
				'not_found'          => 'No messages yet.',
				'not_found_in_trash' => 'No messages in the trash.',
			),
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => false,
			'show_in_nav_menus'   => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			'can_export'          => false,
			'menu_icon'           => 'dashicons-email-alt',
			'menu_position'       => 27,
			'supports'            => array( 'title' ),
			'capabilities'        => $caps,
			'map_meta_cap'        => false,
		)
	);
}
add_action( 'init', 'ndm_headless_message_register' );

/**
 * Registers the route.
 */
function ndm_headless_message_register_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/messages',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'ndm_headless_rest_message',
			'permission_callback' => 'ndm_headless_booking_can_write',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_message_register_routes' );

/**
 * POST /messages: saves one message.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_rest_message( $request ) {
	$params  = $request->get_json_params();
	$invalid = static function ( $message ) {
		return new WP_Error( 'ndm_message_invalid', $message, array( 'status' => 400 ) );
	};

	if ( ! is_array( $params ) ) {
		return $invalid( 'The message could not be read.' );
	}

	$name   = ndm_headless_booking_text( $params, 'name', 80 );
	$phone  = ndm_headless_booking_text( $params, 'phone', 30 );
	$clinic = ndm_headless_booking_text( $params, 'clinic', 40 );
	$page   = ndm_headless_booking_text( $params, 'page', 200 );
	$email  = isset( $params['email'] ) && is_string( $params['email'] ) ? sanitize_email( $params['email'] ) : '';
	$text   = isset( $params['message'] ) && is_string( $params['message'] ) ? trim( sanitize_textarea_field( $params['message'] ) ) : '';

	if ( ! $name ) {
		return $invalid( 'A name is needed.' );
	}

	if ( '' === $email || ! is_email( $email ) || strlen( $email ) > 120 ) {
		return $invalid( 'A valid email address is needed.' );
	}

	if ( null === $phone ) {
		return $invalid( 'The phone number is too long.' );
	}

	if ( ! $clinic ) {
		return $invalid( 'A clinic is needed.' );
	}

	if ( '' === $text || mb_strlen( $text ) > 2000 ) {
		return $invalid( 'A message of at most 2000 characters is needed.' );
	}

	$record = array(
		'name'    => $name,
		'email'   => $email,
		'phone'   => $phone,
		'clinic'  => $clinic,
		'message' => $text,
		'page'    => (string) $page,
	);

	$id = wp_insert_post(
		array(
			'post_type'   => NDM_HEADLESS_MESSAGE_TYPE,
			// Private: never shown outside wp-admin, whatever else changes.
			'post_status' => 'private',
			'post_title'  => $name . ', ' . $clinic,
			'post_author' => 0,
		),
		true
	);

	if ( is_wp_error( $id ) ) {
		return new WP_Error( 'ndm_message_failed', 'The message could not be saved.', array( 'status' => 500 ) );
	}

	update_post_meta( $id, NDM_HEADLESS_MESSAGE_META, wp_slash( $record ) );
	update_post_meta( $id, NDM_HEADLESS_MESSAGE_STATUS, 'new' );

	// The message is saved: the email is a notice on top, and its failure never fails the message.
	ndm_headless_message_notify( $id );

	$response = rest_ensure_response(
		array(
			'saved'  => true,
			'number' => (string) $id,
		)
	);
	$response->set_status( 201 );
	$response->header( 'Cache-Control', 'no-store' );

	return $response;
}

/**
 * A saved message.
 *
 * @param int $id Post ID.
 * @return array
 */
function ndm_headless_message_record( $id ) {
	$record = get_post_meta( $id, NDM_HEADLESS_MESSAGE_META, true );

	return wp_parse_args(
		is_array( $record ) ? $record : array(),
		array(
			'name'    => '',
			'email'   => '',
			'phone'   => '',
			'clinic'  => '',
			'message' => '',
			'page'    => '',
		)
	);
}

/**
 * A saved message's status key.
 *
 * @param int $id Post ID.
 * @return string
 */
function ndm_headless_message_status( $id ) {
	$status = (string) get_post_meta( $id, NDM_HEADLESS_MESSAGE_STATUS, true );

	return isset( ndm_headless_message_statuses()[ $status ] ) ? $status : 'new';
}

/**
 * Emails a saved message to the clinic (the consultation requests' addresses, NDM_BOOKING_NOTIFY),
 * with Reply-To set to the visitor.
 *
 * @param int $id Post ID.
 * @return bool Whether WordPress handed the email on.
 */
function ndm_headless_message_notify( $id ) {
	$to = ndm_headless_booking_notify_to();

	if ( ! $to ) {
		return false;
	}

	$record = ndm_headless_message_record( $id );
	$rows   = array(
		'Name'           => $record['name'],
		'Email'          => $record['email'],
		'Phone'          => $record['phone'],
		'Clinic'         => $record['clinic'],
		'Sent from page' => ndm_headless_booking_page_label( $record['page'] ),
		'Received'       => get_the_date( 'D, M j, Y, g:i a', $id ),
	);
	$lines  = array( 'A new message came in from the website\'s contact form.', '' );

	foreach ( $rows as $label => $value ) {
		if ( '' !== trim( (string) $value ) ) {
			$lines[] = $label . ': ' . $value;
		}
	}

	$lines[] = '';
	$lines[] = 'Message:';
	$lines[] = $record['message'];
	$lines[] = '';
	$lines[] = 'Reply to this email to answer the visitor. Open it in WordPress to set its status:';
	$lines[] = admin_url( 'post.php?post=' . (int) $id . '&action=edit' );

	// The subject carries no contact details.
	$subject = 'New website message #' . (int) $id . ', ' . $record['clinic'];
	$headers = array( 'Content-Type: text/plain; charset=UTF-8' );

	if ( is_email( $record['email'] ) ) {
		$headers[] = 'Reply-To: ' . $record['email'];
	}

	return (bool) wp_mail( $to, $subject, implode( "\n", $lines ), $headers );
}

/**
 * The list's columns.
 *
 * @param array $columns Columns.
 * @return array
 */
function ndm_headless_message_columns( $columns ) {
	return array(
		'cb'          => isset( $columns['cb'] ) ? $columns['cb'] : '',
		'title'       => 'From',
		'ndm_contact' => 'Contact',
		'ndm_message' => 'Message',
		'ndm_status'  => 'Status',
		'date'        => 'Received',
	);
}
add_filter( 'manage_' . NDM_HEADLESS_MESSAGE_TYPE . '_posts_columns', 'ndm_headless_message_columns' );

/**
 * Fills the list's columns.
 *
 * @param string $column Column key.
 * @param int    $id     Post ID.
 */
function ndm_headless_message_column( $column, $id ) {
	$record = ndm_headless_message_record( $id );

	if ( 'ndm_contact' === $column ) {
		echo esc_html( $record['email'] ) . ( '' !== $record['phone'] ? '<br>' . esc_html( $record['phone'] ) : '' );
	} elseif ( 'ndm_message' === $column ) {
		echo esc_html( wp_trim_words( $record['message'], 24 ) );
	} elseif ( 'ndm_status' === $column ) {
		$status = ndm_headless_message_status( $id );

		echo 'new' === $status ? '<strong>New</strong>' : esc_html( ndm_headless_message_statuses()[ $status ] );
	}
}
add_action( 'manage_' . NDM_HEADLESS_MESSAGE_TYPE . '_posts_custom_column', 'ndm_headless_message_column', 10, 2 );

/**
 * The message and its status, on the edit screen.
 */
function ndm_headless_message_boxes() {
	add_meta_box( 'ndm-message-details', 'Message', 'ndm_headless_message_details_box', NDM_HEADLESS_MESSAGE_TYPE, 'normal', 'high' );
	remove_meta_box( 'submitdiv', NDM_HEADLESS_MESSAGE_TYPE, 'side' );
	add_meta_box( 'ndm-message-status', 'Status', 'ndm_headless_message_status_box', NDM_HEADLESS_MESSAGE_TYPE, 'side', 'high' );
}
add_action( 'add_meta_boxes_' . NDM_HEADLESS_MESSAGE_TYPE, 'ndm_headless_message_boxes' );

/**
 * Details box.
 *
 * @param WP_Post $post Message.
 */
function ndm_headless_message_details_box( $post ) {
	$record = ndm_headless_message_record( $post->ID );
	$rows   = array(
		'Name'           => $record['name'],
		'Email'          => $record['email'],
		'Phone'          => $record['phone'],
		'Clinic'         => $record['clinic'],
		'Sent from page' => ndm_headless_booking_page_label( $record['page'] ),
		'Received'       => get_the_date( 'D, M j, Y, g:i a', $post ),
	);

	echo '<table class="form-table" role="presentation"><tbody>';

	foreach ( $rows as $label => $value ) {
		if ( '' !== trim( (string) $value ) ) {
			echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . esc_html( $value ) . '</td></tr>';
		}
	}

	echo '<tr><th scope="row">Message</th><td>' . nl2br( esc_html( $record['message'] ) ) . '</td></tr>';
	echo '</tbody></table>';
}

/**
 * Status box, with the save button.
 *
 * @param WP_Post $post Message.
 */
function ndm_headless_message_status_box( $post ) {
	$current = ndm_headless_message_status( $post->ID );

	wp_nonce_field( 'ndm_message_status', 'ndm_message_nonce' );
	echo '<p><label class="screen-reader-text" for="ndm-message-status-field">Status</label><select id="ndm-message-status-field" name="ndm_message_status" style="width:100%">';

	foreach ( ndm_headless_message_statuses() as $key => $label ) {
		echo '<option value="' . esc_attr( $key ) . '"' . selected( $current, $key, false ) . '>' . esc_html( $label ) . '</option>';
	}

	echo '</select></p>';
	submit_button( 'Save status', 'primary', 'save', false );

	if ( current_user_can( NDM_HEADLESS_BOOKING_CAP ) ) {
		echo ' <a class="submitdelete deletion" style="margin-left:8px" href="' . esc_url( get_delete_post_link( $post->ID ) ) . '">Move to trash</a>';
	}
}

/**
 * Saves the status; nothing else on the screen can change the message.
 *
 * @param int $id Post ID.
 */
function ndm_headless_message_save_status( $id ) {
	if ( ! isset( $_POST['ndm_message_nonce'], $_POST['ndm_message_status'] ) || ! wp_verify_nonce( sanitize_key( $_POST['ndm_message_nonce'] ), 'ndm_message_status' ) || ! current_user_can( NDM_HEADLESS_BOOKING_CAP ) ) {
		return;
	}

	$status = sanitize_key( $_POST['ndm_message_status'] );

	if ( isset( ndm_headless_message_statuses()[ $status ] ) ) {
		update_post_meta( $id, NDM_HEADLESS_MESSAGE_STATUS, $status );
	}
}
add_action( 'save_post_' . NDM_HEADLESS_MESSAGE_TYPE, 'ndm_headless_message_save_status' );

/**
 * A message stays private and keeps its title, whatever the edit screen sends.
 *
 * @param array $data Post fields about to be saved.
 * @param array $raw  Incoming fields.
 * @return array
 */
function ndm_headless_message_keep_private( $data, $raw ) {
	if ( NDM_HEADLESS_MESSAGE_TYPE !== $data['post_type'] || in_array( $data['post_status'], array( 'trash', 'auto-draft' ), true ) ) {
		return $data;
	}

	$data['post_status'] = 'private';

	if ( ! empty( $raw['ID'] ) ) {
		$data['post_title'] = wp_slash( get_post_field( 'post_title', (int) $raw['ID'], 'raw' ) );
	}

	return $data;
}
add_filter( 'wp_insert_post_data', 'ndm_headless_message_keep_private', 10, 2 );

/**
 * No Quick Edit or View on a message.
 *
 * @param array   $actions Row actions.
 * @param WP_Post $post    Row.
 * @return array
 */
function ndm_headless_message_row_actions( $actions, $post ) {
	if ( NDM_HEADLESS_MESSAGE_TYPE === $post->post_type ) {
		unset( $actions['inline hide-if-no-js'], $actions['view'] );
	}

	return $actions;
}
add_filter( 'post_row_actions', 'ndm_headless_message_row_actions', 10, 2 );

/**
 * Shows how many messages are still new beside the menu name.
 */
function ndm_headless_message_menu_count() {
	global $menu;

	if ( ! is_array( $menu ) || ! current_user_can( NDM_HEADLESS_BOOKING_CAP ) ) {
		return;
	}

	$new = new WP_Query(
		array(
			'post_type'      => NDM_HEADLESS_MESSAGE_TYPE,
			'post_status'    => 'private',
			'meta_key'       => NDM_HEADLESS_MESSAGE_STATUS, // phpcs:ignore WordPress.DB.SlowDBQuery -- a short admin-only list.
			'meta_value'     => 'new', // phpcs:ignore WordPress.DB.SlowDBQuery
			'fields'         => 'ids',
			'posts_per_page' => 1,
		)
	);

	if ( ! $new->found_posts ) {
		return;
	}

	foreach ( $menu as $i => $item ) {
		if ( isset( $item[2] ) && 'edit.php?post_type=' . NDM_HEADLESS_MESSAGE_TYPE === $item[2] ) {
			$menu[ $i ][0] .= ' <span class="awaiting-mod">' . (int) $new->found_posts . '</span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- the menu's own counter.
		}
	}
}
add_action( 'admin_menu', 'ndm_headless_message_menu_count', 99 );

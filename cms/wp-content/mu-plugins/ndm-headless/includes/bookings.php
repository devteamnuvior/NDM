<?php
/**
 * Consultation requests from the website's "Book a free consultation" form, under ndm/v1:
 *
 *   POST /bookings   The Next.js server only (shared secret). Saves one request.
 *
 * Every request is a post of the private post type "Consultation" (ndm_booking): it has no
 * public address, is not in the REST API, is left out of searches and exports nothing to the site.
 * Only editors, shop managers and administrators see the list (wp-admin > Consultation),
 * where each request carries a status the team sets by hand: New, Contacted, Booked, Closed.
 *
 * A request holds a person's name and contact details. It is written here and read in wp-admin,
 * nowhere else: no route returns it, and the answer to the website is only a reference number.
 *
 * The secret is the one the two servers already share (NDM_REVALIDATE_SECRET).
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

const NDM_HEADLESS_BOOKING_TYPE = 'ndm_booking';
const NDM_HEADLESS_BOOKING_META = '_ndm_booking';
/** Its own meta key, so the list can be filtered and counted by status. */
const NDM_HEADLESS_BOOKING_STATUS = '_ndm_booking_status';
/** Who may read the requests: editors, shop managers, administrators. */
const NDM_HEADLESS_BOOKING_CAP = 'edit_others_posts';

/**
 * The statuses a request can have, in the order of the team's work.
 *
 * @return array<string,string>
 */
function ndm_headless_booking_statuses() {
	return array(
		'new'       => 'New',
		'contacted' => 'Contacted',
		'booked'    => 'Booked',
		'closed'    => 'Closed',
	);
}

/**
 * Registers the post type.
 */
function ndm_headless_booking_register() {
	$caps = array();

	foreach ( array( 'edit_post', 'read_post', 'delete_post', 'edit_posts', 'edit_others_posts', 'publish_posts', 'read_private_posts', 'delete_posts', 'delete_private_posts', 'delete_published_posts', 'delete_others_posts', 'edit_private_posts', 'edit_published_posts' ) as $cap ) {
		$caps[ $cap ] = NDM_HEADLESS_BOOKING_CAP;
	}

	// Requests come from the website only: nobody adds one by hand.
	$caps['create_posts'] = 'do_not_allow';

	register_post_type(
		NDM_HEADLESS_BOOKING_TYPE,
		array(
			'labels'              => array(
				'name'               => 'Consultation',
				'singular_name'      => 'Consultation',
				'menu_name'          => 'Consultation',
				'edit_item'          => 'Consultation',
				'search_items'       => 'Search consultations',
				'not_found'          => 'No consultations yet.',
				'not_found_in_trash' => 'No consultations in the trash.',
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
			'menu_icon'           => 'dashicons-calendar-alt',
			'menu_position'       => 26,
			'supports'            => array( 'title' ),
			'capabilities'        => $caps,
			'map_meta_cap'        => false,
		)
	);
}
add_action( 'init', 'ndm_headless_booking_register' );

/**
 * Permission check of the write route: the caller must carry the secret the two servers share.
 *
 * @param WP_REST_Request $request Request.
 * @return true|WP_Error
 */
function ndm_headless_booking_can_write( $request ) {
	$secret = ndm_headless_setting( 'NDM_REVALIDATE_SECRET' );
	$given  = (string) $request->get_header( 'x_ndm_site_key' );

	if ( strlen( $secret ) < 32 || '' === $given || ! hash_equals( $secret, $given ) ) {
		return new WP_Error( 'rest_forbidden', 'Not allowed.', array( 'status' => 401 ) );
	}

	return true;
}

/**
 * Registers the route.
 */
function ndm_headless_booking_register_routes() {
	register_rest_route(
		NDM_HEADLESS_REST_NAMESPACE,
		'/bookings',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'ndm_headless_rest_booking',
			'permission_callback' => 'ndm_headless_booking_can_write',
		)
	);
}
add_action( 'rest_api_init', 'ndm_headless_booking_register_routes' );

/**
 * One line of plain text from the request, or null when it is missing, not text, or too long.
 *
 * @param array  $params Request body.
 * @param string $key    Field name.
 * @param int    $max    Longest allowed length.
 * @return string|null
 */
function ndm_headless_booking_text( $params, $key, $max ) {
	if ( ! isset( $params[ $key ] ) || ! is_string( $params[ $key ] ) ) {
		return null;
	}

	$value = trim( sanitize_text_field( $params[ $key ] ) );

	return mb_strlen( $value ) <= $max ? $value : null;
}

/**
 * A list of short texts from the request (at most $count of them).
 *
 * @param array  $params Request body.
 * @param string $key    Field name.
 * @param int    $count  Most entries allowed.
 * @return string[]|null Null when the value is not such a list.
 */
function ndm_headless_booking_list( $params, $key, $count ) {
	if ( ! isset( $params[ $key ] ) || ! is_array( $params[ $key ] ) || count( $params[ $key ] ) > $count ) {
		return null;
	}

	$out = array();

	foreach ( $params[ $key ] as $value ) {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( sanitize_text_field( $value ) );

		if ( '' === $value || mb_strlen( $value ) > 80 ) {
			return null;
		}

		$out[] = $value;
	}

	return array_values( array_unique( $out ) );
}

/**
 * A request's day and hour as words: "Tue, Dec 1, 2026, 10:00 am".
 *
 * @param string $day  Y-m-d.
 * @param int    $hour 0 to 23.
 * @return string
 */
function ndm_headless_booking_when( $day, $hour ) {
	$date = DateTime::createFromFormat( '!Y-m-d', $day, new DateTimeZone( 'UTC' ) );

	if ( ! $date ) {
		return '';
	}

	return $date->format( 'D, M j, Y' ) . ', ' . ( $hour > 12 ? $hour - 12 : $hour ) . ':00 ' . ( $hour >= 12 ? 'pm' : 'am' );
}

/**
 * POST /bookings: saves one consultation request.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function ndm_headless_rest_booking( $request ) {
	$params  = $request->get_json_params();
	$invalid = static function ( $message ) {
		return new WP_Error( 'ndm_booking_invalid', $message, array( 'status' => 400 ) );
	};

	if ( ! is_array( $params ) ) {
		return $invalid( 'The request could not be read.' );
	}

	$first = ndm_headless_booking_text( $params, 'first', 60 );
	$last  = ndm_headless_booking_text( $params, 'last', 60 );
	$phone = ndm_headless_booking_text( $params, 'phone', 30 );
	$other = ndm_headless_booking_text( $params, 'other', 80 );
	$page  = ndm_headless_booking_text( $params, 'page', 200 );
	$email = isset( $params['email'] ) && is_string( $params['email'] ) ? sanitize_email( $params['email'] ) : '';

	if ( ! $first || ! $last || ! $phone || ! preg_match( '/\d.*\d.*\d.*\d.*\d.*\d.*\d/', $phone ) ) {
		return $invalid( 'A name and a phone number are needed.' );
	}

	if ( '' === $email || ! is_email( $email ) || strlen( $email ) > 120 ) {
		return $invalid( 'A valid email address is needed.' );
	}

	$interests = ndm_headless_booking_list( $params, 'interests', 60 );
	$via       = ndm_headless_booking_list( $params, 'via', 3 );

	if ( ! $interests ) {
		return $invalid( 'At least one concern is needed.' );
	}

	if ( ! $via || array_diff( $via, array( 'Call', 'Text', 'Email' ) ) ) {
		return $invalid( 'Choose how to be reached: Call, Text or Email.' );
	}

	$path = isset( $params['path'] ) ? $params['path'] : '';

	if ( 'book' !== $path && 'call' !== $path ) {
		return $invalid( 'Choose to book a time or to be called.' );
	}

	$clinic = ndm_headless_booking_text( $params, 'clinic', 40 );

	if ( ! $clinic ) {
		return $invalid( 'A clinic is needed.' );
	}

	$record = array(
		'first'     => $first,
		'last'      => $last,
		'phone'     => $phone,
		'email'     => $email,
		'via'       => $via,
		'interests' => $interests,
		'other'     => (string) $other,
		'visia'     => ! empty( $params['visia'] ),
		'path'      => $path,
		'clinic'    => $clinic,
		'day'       => '',
		'hour'      => 0,
		'call_time' => '',
		'page'      => (string) $page,
	);

	if ( 'book' === $path ) {
		$day  = isset( $params['day'] ) && is_string( $params['day'] ) ? $params['day'] : '';
		$hour = isset( $params['hour'] ) && is_int( $params['hour'] ) ? $params['hour'] : -1;
		$date = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $day ) ? DateTime::createFromFormat( '!Y-m-d', $day, new DateTimeZone( 'UTC' ) ) : false;

		// A real calendar day (not 2026-02-31), not a Sunday, at a whole hour of the working day.
		if ( ! $date || $date->format( 'Y-m-d' ) !== $day || '0' === $date->format( 'w' ) || $hour < 8 || $hour > 20 ) {
			return $invalid( 'A day and a time are needed.' );
		}

		$record['day']  = $day;
		$record['hour'] = $hour;
		$summary        = 'Book a time: ' . ndm_headless_booking_when( $day, $hour );
	} else {
		$call_time = ndm_headless_booking_text( $params, 'callTime', 40 );

		if ( ! $call_time ) {
			return $invalid( 'A time of day for the call is needed.' );
		}

		$record['call_time'] = $call_time;
		$summary             = 'Call back: ' . $call_time;
	}

	$id = wp_insert_post(
		array(
			'post_type'   => NDM_HEADLESS_BOOKING_TYPE,
			// Private: never shown outside wp-admin, whatever else changes.
			'post_status' => 'private',
			'post_title'  => $first . ' ' . $last . ', ' . $summary . ', ' . $clinic,
			'post_author' => 0,
		),
		true
	);

	if ( is_wp_error( $id ) ) {
		return new WP_Error( 'ndm_booking_failed', 'The request could not be saved.', array( 'status' => 500 ) );
	}

	update_post_meta( $id, NDM_HEADLESS_BOOKING_META, wp_slash( $record ) );
	update_post_meta( $id, NDM_HEADLESS_BOOKING_STATUS, 'new' );

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
 * A saved request.
 *
 * @param int $id Post ID.
 * @return array
 */
function ndm_headless_booking_record( $id ) {
	$record = get_post_meta( $id, NDM_HEADLESS_BOOKING_META, true );

	return wp_parse_args(
		is_array( $record ) ? $record : array(),
		array(
			'first'     => '',
			'last'      => '',
			'phone'     => '',
			'email'     => '',
			'via'       => array(),
			'interests' => array(),
			'other'     => '',
			'visia'     => false,
			'path'      => '',
			'clinic'    => '',
			'day'       => '',
			'hour'      => 0,
			'call_time' => '',
			'page'      => '',
		)
	);
}

/**
 * A saved request's status key.
 *
 * @param int $id Post ID.
 * @return string
 */
function ndm_headless_booking_status( $id ) {
	$status = (string) get_post_meta( $id, NDM_HEADLESS_BOOKING_STATUS, true );

	return isset( ndm_headless_booking_statuses()[ $status ] ) ? $status : 'new';
}

/**
 * What was asked for, in a few words.
 *
 * @param array $record Saved request.
 * @return string
 */
function ndm_headless_booking_request_line( $record ) {
	if ( 'book' === $record['path'] ) {
		return 'Book a time: ' . ndm_headless_booking_when( $record['day'], (int) $record['hour'] );
	}

	return 'Call back: ' . $record['call_time'];
}

/**
 * The list's columns.
 *
 * @param array $columns Columns.
 * @return array
 */
function ndm_headless_booking_columns( $columns ) {
	return array(
		'cb'           => isset( $columns['cb'] ) ? $columns['cb'] : '',
		'title'        => 'Request',
		'ndm_contact'  => 'Contact',
		'ndm_concerns' => 'Concerns',
		'ndm_clinic'   => 'Clinic',
		'ndm_status'   => 'Status',
		'date'         => 'Received',
	);
}
add_filter( 'manage_' . NDM_HEADLESS_BOOKING_TYPE . '_posts_columns', 'ndm_headless_booking_columns' );

/**
 * Fills the list's columns.
 *
 * @param string $column Column key.
 * @param int    $id     Post ID.
 */
function ndm_headless_booking_column( $column, $id ) {
	$record = ndm_headless_booking_record( $id );

	if ( 'ndm_contact' === $column ) {
		echo esc_html( $record['phone'] ) . '<br>' . esc_html( $record['email'] ) . '<br><span class="description">Reach by: ' . esc_html( implode( ', ', (array) $record['via'] ) ) . '</span>';
	} elseif ( 'ndm_concerns' === $column ) {
		echo esc_html( implode( ', ', (array) $record['interests'] ) );

		if ( '' !== $record['other'] ) {
			echo '<br><span class="description">' . esc_html( $record['other'] ) . '</span>';
		}
	} elseif ( 'ndm_clinic' === $column ) {
		echo esc_html( $record['clinic'] );
	} elseif ( 'ndm_status' === $column ) {
		$status = ndm_headless_booking_status( $id );

		echo 'new' === $status ? '<strong>New</strong>' : esc_html( ndm_headless_booking_statuses()[ $status ] );
	}
}
add_action( 'manage_' . NDM_HEADLESS_BOOKING_TYPE . '_posts_custom_column', 'ndm_headless_booking_column', 10, 2 );

/**
 * The request's details and its status, on the edit screen.
 */
function ndm_headless_booking_boxes() {
	add_meta_box( 'ndm-booking-details', 'Request', 'ndm_headless_booking_details_box', NDM_HEADLESS_BOOKING_TYPE, 'normal', 'high' );
	// The request is saved by its status; WordPress's own Publish box would let it be made public.
	remove_meta_box( 'submitdiv', NDM_HEADLESS_BOOKING_TYPE, 'side' );
	add_meta_box( 'ndm-booking-status', 'Status', 'ndm_headless_booking_status_box', NDM_HEADLESS_BOOKING_TYPE, 'side', 'high' );
}
add_action( 'add_meta_boxes_' . NDM_HEADLESS_BOOKING_TYPE, 'ndm_headless_booking_boxes' );

/**
 * Details box.
 *
 * @param WP_Post $post Request.
 */
function ndm_headless_booking_details_box( $post ) {
	$record = ndm_headless_booking_record( $post->ID );
	$rows   = array(
		'Name'                 => $record['first'] . ' ' . $record['last'],
		'Mobile number'        => $record['phone'],
		'Email'                => $record['email'],
		'Reach by'             => implode( ', ', (array) $record['via'] ),
		'Concerns'             => implode( ', ', (array) $record['interests'] ),
		'In their words'       => $record['other'],
		'VISIA® skin analysis' => $record['visia'] ? 'Included' : 'Not added',
		'Asked for'            => ndm_headless_booking_request_line( $record ),
		'Clinic'               => $record['clinic'],
		'Sent from'            => $record['page'],
		'Received'             => get_the_date( 'D, M j, Y, g:i a', $post ),
	);

	echo '<table class="form-table" role="presentation"><tbody>';

	foreach ( $rows as $label => $value ) {
		if ( '' === trim( (string) $value ) ) {
			continue;
		}

		echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . esc_html( $value ) . '</td></tr>';
	}

	echo '</tbody></table>';
	echo '<p class="description">A time picked on the website is a request: confirm it with the visitor and put it in the clinic calendar.</p>';
}

/**
 * Status box, with the save button.
 *
 * @param WP_Post $post Request.
 */
function ndm_headless_booking_status_box( $post ) {
	$current = ndm_headless_booking_status( $post->ID );

	wp_nonce_field( 'ndm_booking_status', 'ndm_booking_nonce' );
	echo '<p><label class="screen-reader-text" for="ndm-booking-status-field">Status</label><select id="ndm-booking-status-field" name="ndm_booking_status" style="width:100%">';

	foreach ( ndm_headless_booking_statuses() as $key => $label ) {
		echo '<option value="' . esc_attr( $key ) . '"' . selected( $current, $key, false ) . '>' . esc_html( $label ) . '</option>';
	}

	echo '</select></p>';
	submit_button( 'Save status', 'primary', 'save', false );

	if ( current_user_can( NDM_HEADLESS_BOOKING_CAP ) ) {
		echo ' <a class="submitdelete deletion" style="margin-left:8px" href="' . esc_url( get_delete_post_link( $post->ID ) ) . '">Move to trash</a>';
	}
}

/**
 * Saves the status; nothing else on the screen can change the request.
 *
 * @param int $id Post ID.
 */
function ndm_headless_booking_save_status( $id ) {
	if ( ! isset( $_POST['ndm_booking_nonce'], $_POST['ndm_booking_status'] ) || ! wp_verify_nonce( sanitize_key( $_POST['ndm_booking_nonce'] ), 'ndm_booking_status' ) || ! current_user_can( NDM_HEADLESS_BOOKING_CAP ) ) {
		return;
	}

	$status = sanitize_key( $_POST['ndm_booking_status'] );

	if ( isset( ndm_headless_booking_statuses()[ $status ] ) ) {
		update_post_meta( $id, NDM_HEADLESS_BOOKING_STATUS, $status );
	}
}
add_action( 'save_post_' . NDM_HEADLESS_BOOKING_TYPE, 'ndm_headless_booking_save_status' );

/**
 * A request stays private and keeps its title, whatever the edit screen sends.
 *
 * @param array $data Post fields about to be saved.
 * @param array $raw  Incoming fields.
 * @return array
 */
function ndm_headless_booking_keep_private( $data, $raw ) {
	if ( NDM_HEADLESS_BOOKING_TYPE !== $data['post_type'] || in_array( $data['post_status'], array( 'trash', 'auto-draft' ), true ) ) {
		return $data;
	}

	$data['post_status'] = 'private';

	if ( ! empty( $raw['ID'] ) ) {
		$data['post_title'] = wp_slash( get_post_field( 'post_title', (int) $raw['ID'], 'raw' ) );
	}

	return $data;
}
add_filter( 'wp_insert_post_data', 'ndm_headless_booking_keep_private', 10, 2 );

/**
 * No Quick Edit on a request (it could change the title or the visibility).
 *
 * @param array   $actions Row actions.
 * @param WP_Post $post    Row.
 * @return array
 */
function ndm_headless_booking_row_actions( $actions, $post ) {
	if ( NDM_HEADLESS_BOOKING_TYPE === $post->post_type ) {
		unset( $actions['inline hide-if-no-js'], $actions['view'] );
	}

	return $actions;
}
add_filter( 'post_row_actions', 'ndm_headless_booking_row_actions', 10, 2 );

/**
 * Shows how many requests are still new beside the menu name.
 */
function ndm_headless_booking_menu_count() {
	global $menu;

	if ( ! is_array( $menu ) || ! current_user_can( NDM_HEADLESS_BOOKING_CAP ) ) {
		return;
	}

	$new = new WP_Query(
		array(
			'post_type'      => NDM_HEADLESS_BOOKING_TYPE,
			'post_status'    => 'private',
			'meta_key'       => NDM_HEADLESS_BOOKING_STATUS, // phpcs:ignore WordPress.DB.SlowDBQuery -- a short admin-only list.
			'meta_value'     => 'new', // phpcs:ignore WordPress.DB.SlowDBQuery
			'fields'         => 'ids',
			'posts_per_page' => 1,
		)
	);

	if ( ! $new->found_posts ) {
		return;
	}

	foreach ( $menu as $i => $item ) {
		if ( isset( $item[2] ) && 'edit.php?post_type=' . NDM_HEADLESS_BOOKING_TYPE === $item[2] ) {
			$menu[ $i ][0] .= ' <span class="awaiting-mod">' . (int) $new->found_posts . '</span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride -- the menu's own counter.
		}
	}
}
add_action( 'admin_menu', 'ndm_headless_booking_menu_count', 99 );

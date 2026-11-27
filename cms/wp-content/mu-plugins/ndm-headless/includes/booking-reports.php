<?php
/**
 * Reports on the consultation requests (includes/bookings.php), sent by email:
 *
 *   every 3 days   the requests of the days since the last report (whole days, Toronto time)
 *   every month    on the 1st, the requests of the month that just ended
 *
 * To alin.gharibian@gmail.com, raymond@nuvior.com and info@newdermamed.com, or the addresses in
 * NDM_BOOKING_REPORT_TO (wp-config constant or environment; several separated by commas, "off" =
 * no reports).
 *
 * A report counts the requests by the page they were sent from (the page's name, linked) and by
 * clinic, then lists them: who, from which page, what was asked for, where, concerns. It carries
 * names but no phone number or email address; those stay in wp-admin.
 *
 * One WP-Cron event a day (about 8 am in Toronto) decides what is due, so a day without visits to
 * WordPress only delays a report: the next one still covers every day since the last.
 *
 *   wp ndm booking-report [--period=<days|month>] [--days=<n>] [--to=<addresses>] [--dry-run]
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

const NDM_HEADLESS_BOOKING_REPORT_HOOK  = 'ndm_headless_booking_reports';
const NDM_HEADLESS_BOOKING_REPORT_STATE = 'ndm_booking_report_state';
/** Days between two short reports. */
const NDM_HEADLESS_BOOKING_REPORT_DAYS = 3;
/** Most requests listed one by one in a report; the counts always cover all of them. */
const NDM_HEADLESS_BOOKING_REPORT_ROWS = 60;

/**
 * The clinics' time zone: a report's days are Toronto days.
 *
 * @return DateTimeZone
 */
function ndm_headless_booking_report_zone() {
	return new DateTimeZone( 'America/Toronto' );
}

/**
 * Who receives the reports.
 *
 * @return string[]
 */
function ndm_headless_booking_report_to() {
	$setting = ndm_headless_setting( 'NDM_BOOKING_REPORT_TO' );

	if ( 'off' === strtolower( $setting ) ) {
		return array();
	}

	if ( '' === $setting ) {
		$setting = 'alin.gharibian@gmail.com, raymond@nuvior.com, info@newdermamed.com';
	}

	return array_values( array_filter( array_map( 'sanitize_email', explode( ',', $setting ) ), 'is_email' ) );
}

/**
 * The requests received from $from up to, not including, $to.
 *
 * @param DateTimeImmutable $from Start.
 * @param DateTimeImmutable $to   End.
 * @return array[] Oldest first: id, received (DateTimeImmutable, Toronto), status, record.
 */
function ndm_headless_booking_report_requests( $from, $to ) {
	$utc   = new DateTimeZone( 'UTC' );
	$query = new WP_Query(
		array(
			'post_type'      => NDM_HEADLESS_BOOKING_TYPE,
			'post_status'    => 'private',
			'posts_per_page' => 5000,
			'orderby'        => 'date',
			'order'          => 'ASC',
			'no_found_rows'  => true,
			'date_query'     => array(
				array(
					'column'    => 'post_date_gmt',
					'after'     => $from->setTimezone( $utc )->format( 'Y-m-d H:i:s' ),
					'before'    => $to->setTimezone( $utc )->format( 'Y-m-d H:i:s' ),
					'inclusive' => true,
				),
			),
		)
	);
	$out   = array();

	foreach ( $query->posts as $post ) {
		$received = new DateTimeImmutable( $post->post_date_gmt, $utc );

		// The start belongs to the report, the end to the next one.
		if ( $received < $from || $received >= $to ) {
			continue;
		}

		$out[] = array(
			'id'       => (int) $post->ID,
			'received' => $received->setTimezone( ndm_headless_booking_report_zone() ),
			'status'   => ndm_headless_booking_status( $post->ID ),
			'record'   => ndm_headless_booking_record( $post->ID ),
		);
	}

	return $out;
}

/**
 * The name of the page a request was sent from, never its address: "Home", the title of the
 * procedure, concern, article or page with that address, or failing that the address's last part
 * as words ("/before-after" is "Before After"). "Not recorded" when the form sent none.
 *
 * @param string $page The page's path, as saved.
 * @return string
 */
function ndm_headless_booking_page_name( $page ) {
	static $names = array();

	$page = trim( (string) $page );

	if ( '' === $page || '/' !== $page[0] ) {
		return 'Not recorded';
	}

	if ( isset( $names[ $page ] ) ) {
		return $names[ $page ];
	}

	$parts = array_values( array_filter( explode( '/', $page ), 'strlen' ) );
	$slug  = $parts ? sanitize_title( end( $parts ) ) : '';
	$name  = $parts ? '' : 'Home';

	if ( '' !== $slug ) {
		$types = array( 'page', 'post' );

		if ( function_exists( 'ndm_headless_procedure_types' ) ) {
			$types = array_merge( array_keys( ndm_headless_procedure_types() ), $types );
		}

		if ( defined( 'NDM_CONCERN_POST_TYPE' ) ) {
			$types[] = NDM_CONCERN_POST_TYPE;
		}

		$found = get_posts(
			array(
				'name'             => $slug,
				'post_type'        => $types,
				'post_status'      => 'publish',
				'posts_per_page'   => 1,
				'suppress_filters' => true,
			)
		);
		$name  = $found ? trim( html_entity_decode( wp_strip_all_tags( get_the_title( $found[0] ) ), ENT_QUOTES, 'UTF-8' ) ) : '';
	}

	if ( '' === $name ) {
		$name = ucwords( str_replace( '-', ' ', $slug ) );
	}

	$names[ $page ] = '' === $name ? 'Not recorded' : $name;

	return $names[ $page ];
}

/**
 * Counts the requests by one of their values, largest first.
 *
 * @param array[]  $requests Requests.
 * @param callable $value    Gives a request's value.
 * @return array<string,int>
 */
function ndm_headless_booking_report_count( $requests, $value ) {
	$counts = array();

	foreach ( $requests as $request ) {
		$key = (string) $value( $request );
		$key = '' === trim( $key ) ? 'Not given' : $key;

		$counts[ $key ] = isset( $counts[ $key ] ) ? $counts[ $key ] + 1 : 1;
	}

	arsort( $counts );

	return $counts;
}

/**
 * A period in words: "Nov 15 to Nov 17, 2026" (the end is the last day in the report).
 *
 * @param DateTimeImmutable $from Start.
 * @param DateTimeImmutable $to   End, not included.
 * @return string
 */
function ndm_headless_booking_report_days( $from, $to ) {
	$last = $to->modify( '-1 second' );

	if ( $from->format( 'Y-m-d' ) === $last->format( 'Y-m-d' ) ) {
		return $from->format( 'M j, Y' );
	}

	return $from->format( $from->format( 'Y' ) === $last->format( 'Y' ) ? 'M j' : 'M j, Y' ) . ' to ' . $last->format( 'M j, Y' );
}

/**
 * Builds a report.
 *
 * @param DateTimeImmutable $from  Start.
 * @param DateTimeImmutable $to    End, not included.
 * @param string            $kind  "days" or "month".
 * @return array{subject:string,html:string,count:int}
 */
function ndm_headless_booking_report_build( $from, $to, $kind ) {
	$requests = ndm_headless_booking_report_requests( $from, $to );
	$count    = count( $requests );
	$period   = 'month' === $kind ? $from->format( 'F Y' ) : ndm_headless_booking_report_days( $from, $to );
	$name     = 'month' === $kind ? 'Monthly report' : NDM_HEADLESS_BOOKING_REPORT_DAYS . '-day report';
	$subject  = 'NewDermaMed Consultation Requests Report - ' . $count . ( 1 === $count ? ' Request' : ' Requests' );
	$list_url = admin_url( 'edit.php?post_type=' . NDM_HEADLESS_BOOKING_TYPE );

	$ink   = '#1B242B';
	$muted = '#5A646C';
	$blue  = '#0F80C3';
	$line  = '#E4E4DF';
	$font  = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;";
	// Cells stay short (the font sits on the table): mail programs cut a message off at about 100 KB.
	$table = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;' . $font . 'font-size:13px;line-height:19px;color:' . $ink . ';text-align:left;">';
	$th    = 'font-size:12px;color:' . $muted . ';text-align:left;padding:8px;border-bottom:1px solid ' . $line . ';';
	$td    = 'vertical-align:top;padding:8px;border-bottom:1px solid ' . $line . ';';

	// A small table of counts with each row's share of the total.
	$counts_table = static function ( $title, $counts, $links = array() ) use ( $count, $table, $th, $td, $font, $ink, $muted ) {
		$html = '<h2 style="' . $font . 'font-size:15px;line-height:20px;color:' . $ink . ';margin:26px 0 6px;">' . esc_html( $title ) . '</h2>'
			. $table
			. '<tr><th style="' . $th . '">' . esc_html( $title ) . '</th><th style="' . $th . 'text-align:right;width:80px;">Requests</th><th style="' . $th . 'text-align:right;width:70px;">Share</th></tr>';

		foreach ( $counts as $label => $n ) {
			$name = esc_html( $label );
			$name = empty( $links[ $label ] ) ? $name : '<a href="' . esc_url( $links[ $label ] ) . '" style="color:' . $ink . ';text-decoration:none;">' . $name . '</a>';

			$html .= '<tr><td style="' . $td . '">' . $name . '</td>'
				. '<td style="' . $td . 'text-align:right;font-weight:600;">' . (int) $n . '</td>'
				. '<td style="' . $td . 'text-align:right;color:' . $muted . ';">' . ( $count ? round( 100 * $n / $count ) : 0 ) . '%</td></tr>';
		}

		return $html . '</table>';
	};

	$html = '<div style="background:#FAFAF8;padding:24px 12px;">'
		. '<div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid ' . $line . ';border-radius:12px;padding:26px 24px;">'
		. '<p style="' . $font . 'font-size:12px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;color:' . $blue . ';margin:0 0 6px;font-weight:600;">NewDermaMed website, ' . esc_html( $name ) . '</p>'
		. '<h1 style="' . $font . 'font-size:22px;line-height:28px;color:' . $ink . ';margin:0;">Consultation Requests, ' . esc_html( $period ) . '</h1>'
		. '<p style="' . $font . 'font-size:40px;line-height:44px;color:' . $ink . ';margin:22px 0 0;font-weight:700;">' . $count . '</p>'
		. '<p style="' . $font . 'font-size:13px;line-height:18px;color:' . $muted . ';margin:0;">' . ( 1 === $count ? 'request' : 'requests' ) . ' in this period</p>';

	if ( ! $count ) {
		$html .= '<p style="' . $font . 'font-size:14px;line-height:21px;color:' . $ink . ';margin:22px 0 0;">No consultation request came in from the website in this period.</p>';
	} else {
		// Pages by name, each name linked to its page.
		$page_links = array();

		foreach ( $requests as $request ) {
			$page_links[ ndm_headless_booking_page_name( $request['record']['page'] ) ] = ndm_headless_booking_page_url( $request['record']['page'] );
		}

		$html .= $counts_table(
			'Pages',
			ndm_headless_booking_report_count(
				$requests,
				static function ( $request ) {
					return ndm_headless_booking_page_name( $request['record']['page'] );
				}
			),
			$page_links
		);
		$html .= $counts_table(
			'Clinic',
			ndm_headless_booking_report_count(
				$requests,
				static function ( $request ) {
					return $request['record']['clinic'];
				}
			)
		);

		$html .= '<h2 style="' . $font . 'font-size:15px;line-height:20px;color:' . $ink . ';margin:30px 0 6px;">Every Request</h2>'
			. $table
			. '<tr><th style="' . $th . '">Name</th><th style="' . $th . '">Page</th><th style="' . $th . '">Request</th><th style="' . $th . '">Clinic</th><th style="' . $th . '">Concerns</th></tr>';

		// Newest first, as in wp-admin.
		foreach ( array_slice( array_reverse( $requests ), 0, NDM_HEADLESS_BOOKING_REPORT_ROWS ) as $request ) {
			$record = $request['record'];
			$page   = ndm_headless_booking_page_name( $record['page'] );
			$url    = ndm_headless_booking_page_url( $record['page'] );
			// Short values keep the table readable on a phone: "Call, Morning", "Dec 1, 2 pm", "Online".
			$asked    = 'Call, ' . $record['call_time'];
			$clinic   = 0 === stripos( (string) $record['clinic'], 'online' ) ? 'Online' : $record['clinic'];
			$concerns = array_values( (array) $record['interests'] );
			$concerns = implode( ', ', array_slice( $concerns, 0, 2 ) ) . ( count( $concerns ) > 2 ? ' +' . ( count( $concerns ) - 2 ) : '' );

			if ( 'online' === $record['path'] ) {
				$asked = 'Online';
			} elseif ( 'book' === $record['path'] ) {
				$day   = DateTimeImmutable::createFromFormat( '!Y-m-d', (string) $record['day'], new DateTimeZone( 'UTC' ) );
				$hour  = (int) $record['hour'];
				$asked = ( $day ? $day->format( 'M j' ) . ', ' : '' ) . ( $hour > 12 ? $hour - 12 : $hour ) . ( $hour >= 12 ? ' pm' : ' am' );
			}

			$html .= '<tr>'
				. '<td style="' . $td . '"><a href="' . esc_url( admin_url( 'post.php?post=' . $request['id'] . '&action=edit' ) ) . '" style="color:' . $blue . ';text-decoration:none;font-weight:600;">' . esc_html( trim( $record['first'] . ' ' . $record['last'] ) ) . '</a></td>'
				. '<td style="' . $td . 'font-weight:600;">' . ( '' !== $url ? '<a href="' . esc_url( $url ) . '" style="color:' . $ink . ';text-decoration:none;">' . esc_html( $page ) . '</a>' : esc_html( $page ) ) . '</td>'
				. '<td style="' . $td . '">' . esc_html( $asked ) . '</td>'
				. '<td style="' . $td . '">' . esc_html( $clinic ) . '</td>'
				. '<td style="' . $td . '">' . esc_html( $concerns ) . '</td>'
				. '</tr>';
		}

		$html .= '</table>';

		if ( $count > NDM_HEADLESS_BOOKING_REPORT_ROWS ) {
			$html .= '<p style="' . $font . 'font-size:13px;line-height:19px;color:' . $muted . ';margin:10px 0 0;">The newest ' . NDM_HEADLESS_BOOKING_REPORT_ROWS . ' are listed. The other ' . ( $count - NDM_HEADLESS_BOOKING_REPORT_ROWS ) . ' are in WordPress.</p>';
		}
	}

	$html .= '<p style="margin:26px 0 0;"><a href="' . esc_url( $list_url ) . '" style="' . $font . 'display:inline-block;background:' . $blue . ';color:#ffffff;font-size:14px;line-height:20px;font-weight:600;text-decoration:none;padding:11px 22px;border-radius:999px;">Open the requests in WordPress</a></p>'
		. '<p style="' . $font . 'font-size:12px;line-height:18px;color:' . $muted . ';margin:22px 0 0;">Phone numbers and email addresses are not in this report: open a request in WordPress to see them. '
		. ( 'month' === $kind ? 'This report is sent on the 1st of every month.' : 'This report is sent every ' . NDM_HEADLESS_BOOKING_REPORT_DAYS . ' days.' )
		. ' It holds personal information, please do not forward it.</p>'
		. '</div></div>';

	return array(
		'subject' => $subject,
		'html'    => $html,
		'count'   => $count,
	);
}

/**
 * Builds a report and emails it.
 *
 * @param DateTimeImmutable $from Start.
 * @param DateTimeImmutable $to   End, not included.
 * @param string            $kind "days" or "month".
 * @param string[]|null     $recipients Addresses; null = the reports' own.
 * @return bool Whether WordPress handed the email on.
 */
function ndm_headless_booking_report_send( $from, $to, $kind, $recipients = null ) {
	$recipients = null === $recipients ? ndm_headless_booking_report_to() : $recipients;

	if ( ! $recipients ) {
		return false;
	}

	$report = ndm_headless_booking_report_build( $from, $to, $kind );

	return (bool) wp_mail( $recipients, $report['subject'], $report['html'], array( 'Content-Type: text/html; charset=UTF-8' ) );
}

/**
 * The daily check: sends the reports that are due.
 *
 * State (one option): `days_end`, the first day not yet in a short report, and `month`, the last
 * month a monthly report was sent for. A report that could not be sent is tried again the next day
 * and still covers every day since the last one.
 */
function ndm_headless_booking_reports_run() {
	if ( ! ndm_headless_booking_report_to() || get_transient( 'ndm_booking_report_lock' ) ) {
		return;
	}

	set_transient( 'ndm_booking_report_lock', 1, 10 * MINUTE_IN_SECONDS );

	$zone  = ndm_headless_booking_report_zone();
	$today = new DateTimeImmutable( 'today', $zone );
	$state = get_option( NDM_HEADLESS_BOOKING_REPORT_STATE );
	$state = is_array( $state ) ? $state : array();
	$step  = '-' . NDM_HEADLESS_BOOKING_REPORT_DAYS . ' days';

	// The short report: whole days, from the end of the last one up to today.
	$from = isset( $state['days_end'] ) ? DateTimeImmutable::createFromFormat( '!Y-m-d', (string) $state['days_end'], $zone ) : false;
	$from = $from ? $from : $today->modify( $step );

	if ( $from <= $today->modify( $step ) && ndm_headless_booking_report_send( $from, $today, 'days' ) ) {
		$state['days_end'] = $today->format( 'Y-m-d' );
	}

	// The monthly report: the month that ended. The first run only notes the month, so no report
	// goes out for a month before the reports existed.
	$month_start = $today->modify( 'first day of last month' );
	$month       = $month_start->format( 'Y-m' );

	if ( ! isset( $state['month'] ) ) {
		$state['month'] = $month;
	} elseif ( $state['month'] !== $month && ndm_headless_booking_report_send( $month_start, $today->modify( 'first day of this month' ), 'month' ) ) {
		$state['month'] = $month;
	}

	update_option( NDM_HEADLESS_BOOKING_REPORT_STATE, $state, false );
	delete_transient( 'ndm_booking_report_lock' );
}
add_action( NDM_HEADLESS_BOOKING_REPORT_HOOK, 'ndm_headless_booking_reports_run' );

/**
 * Keeps the daily check scheduled, at about 8 am in Toronto.
 */
function ndm_headless_booking_reports_schedule() {
	if ( wp_next_scheduled( NDM_HEADLESS_BOOKING_REPORT_HOOK ) ) {
		return;
	}

	$zone = ndm_headless_booking_report_zone();
	$next = new DateTimeImmutable( 'today 08:00', $zone );
	$next = $next->getTimestamp() <= time() ? $next->modify( '+1 day' ) : $next;

	wp_schedule_event( $next->getTimestamp(), 'daily', NDM_HEADLESS_BOOKING_REPORT_HOOK );
}
add_action( 'init', 'ndm_headless_booking_reports_schedule' );

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Sends a report on the consultation requests now, without touching the schedule.
	 *
	 * ## OPTIONS
	 *
	 * [--period=<period>]
	 * : "days" (the last whole days, the default) or "month" (the month that ended; with
	 * --this-month, the current month so far).
	 *
	 * [--days=<n>]
	 * : For "days": how many days back, today included (default 3 whole days before today).
	 *
	 * [--this-month]
	 * : For "month": the current month up to now.
	 *
	 * [--to=<addresses>]
	 * : Addresses separated by commas (default: the reports' own recipients).
	 *
	 * [--dry-run]
	 * : Only say what would be sent.
	 *
	 * ## EXAMPLES
	 *
	 *     wp ndm booking-report --days=7 --to=someone@example.com
	 */
	WP_CLI::add_command(
		'ndm booking-report',
		function ( $args, $assoc_args ) {
			$zone  = ndm_headless_booking_report_zone();
			$today = new DateTimeImmutable( 'today', $zone );
			$now   = new DateTimeImmutable( 'now', $zone );
			$kind  = isset( $assoc_args['period'] ) && 'month' === $assoc_args['period'] ? 'month' : 'days';

			if ( 'month' === $kind ) {
				$from = empty( $assoc_args['this-month'] ) ? $today->modify( 'first day of last month' ) : $today->modify( 'first day of this month' );
				$to   = empty( $assoc_args['this-month'] ) ? $today->modify( 'first day of this month' ) : $now;
			} elseif ( isset( $assoc_args['days'] ) ) {
				$from = $today->modify( '-' . max( 0, (int) $assoc_args['days'] - 1 ) . ' days' );
				$to   = $now;
			} else {
				$from = $today->modify( '-' . NDM_HEADLESS_BOOKING_REPORT_DAYS . ' days' );
				$to   = $today;
			}

			$recipients = isset( $assoc_args['to'] )
				? array_values( array_filter( array_map( 'sanitize_email', explode( ',', (string) $assoc_args['to'] ) ), 'is_email' ) )
				: ndm_headless_booking_report_to();

			if ( ! $recipients ) {
				WP_CLI::error( 'No address to send to.' );
			}

			$report = ndm_headless_booking_report_build( $from, $to, $kind );

			WP_CLI::log( $report['subject'] );
			WP_CLI::log( 'To: ' . implode( ', ', $recipients ) );

			if ( ! empty( $assoc_args['dry-run'] ) ) {
				WP_CLI::success( 'Dry run: nothing sent.' );
				return;
			}

			if ( ! wp_mail( $recipients, $report['subject'], $report['html'], array( 'Content-Type: text/html; charset=UTF-8' ) ) ) {
				WP_CLI::error( 'WordPress could not hand the email on.' );
			}

			WP_CLI::success( 'Sent.' );
		}
	);
}

<?php
/**
 * A parent page for procedures and concerns.
 *
 * A post of a procedure list (Procedures, Injectables, Skin, Laser, Body, Veins, Hair) or a concern may
 * have another post of the same list as its parent ("Parent Page" box of the edit screen). The child's
 * address on the site then runs through the parent: /injectables/double-chin/belkyra-kybella.
 *
 * - The parent is WordPress's own `post_parent`. The post types stay non-hierarchical on purpose: a
 *   hierarchical type also checks its slugs against the media library's, which could put a number on
 *   the slug of a page that is already live the next time it is saved.
 * - Slugs stay unique as before (across the procedure lists, and among the concerns), so the site still
 *   finds a page by its slug alone; a page asked for at an address that is not its own (its address
 *   before it got a parent) is sent on to its own.
 * - Only a published parent counts: a child of a draft or trashed parent keeps its short address.
 *
 * @package NDM_Headless
 */

defined( 'ABSPATH' ) || exit;

/** How many parents above a page are followed at most. */
const NDM_PARENT_DEPTH = 5;

/**
 * Whether posts of this type may have a parent page.
 *
 * @param string $type Post type.
 * @return bool
 */
function ndm_headless_has_parents( $type ) {
	return ( defined( 'NDM_CONCERN_POST_TYPE' ) && NDM_CONCERN_POST_TYPE === $type )
		|| ( function_exists( 'ndm_headless_is_procedure_type' ) && ndm_headless_is_procedure_type( $type ) );
}

/**
 * The published pages above a post, from the top down: each one the parent of the next, all of the
 * post's own type.
 *
 * @param WP_Post $post A post.
 * @return WP_Post[]
 */
function ndm_headless_post_parents( $post ) {
	if ( ! $post instanceof WP_Post || ! ndm_headless_has_parents( $post->post_type ) ) {
		return array();
	}

	$parents = array();
	$seen    = array( $post->ID => true );
	$id      = (int) $post->post_parent;

	while ( $id && ! isset( $seen[ $id ] ) && count( $parents ) < NDM_PARENT_DEPTH ) {
		$seen[ $id ] = true;
		$parent      = get_post( $id );

		if ( ! $parent || $parent->post_type !== $post->post_type || 'publish' !== $parent->post_status || '' === $parent->post_name ) {
			break;
		}

		array_unshift( $parents, $parent );
		$id = (int) $parent->post_parent;
	}

	return $parents;
}

/**
 * The pages above a post as the site receives them: slug and title, from the top down.
 *
 * @param WP_Post $post A post.
 * @return array[]
 */
function ndm_headless_post_parent_list( $post ) {
	$list = array();

	foreach ( ndm_headless_post_parents( $post ) as $parent ) {
		$list[] = array(
			'slug'  => $parent->post_name,
			'title' => html_entity_decode( get_the_title( $parent ), ENT_QUOTES, 'UTF-8' ),
		);
	}

	return $list;
}

/**
 * Whether a post sits somewhere under another one (any status), following `post_parent`.
 *
 * @param WP_Post $post     A post.
 * @param int     $ancestor The post it may sit under.
 * @return bool
 */
function ndm_headless_post_is_under( $post, $ancestor ) {
	$seen = array();
	$id   = (int) $post->post_parent;

	while ( $id && ! isset( $seen[ $id ] ) ) {
		if ( $id === (int) $ancestor ) {
			return true;
		}
		$seen[ $id ] = true;
		$id          = (int) get_post_field( 'post_parent', $id );
	}

	return false;
}

/**
 * The "Parent Page" box of the edit screen.
 *
 * @param string $post_type Post type of the screen.
 */
function ndm_headless_parent_meta_box( $post_type ) {
	if ( ndm_headless_has_parents( $post_type ) ) {
		add_meta_box( 'ndm-parent', 'Parent Page', 'ndm_headless_parent_box', $post_type, 'side', 'default' );
	}
}
add_action( 'add_meta_boxes', 'ndm_headless_parent_meta_box' );

/**
 * Prints the box: every other page of the same list, except the pages under this one.
 *
 * The field is named `parent_id`, which WordPress's own save reads as the post's parent.
 *
 * @param WP_Post $post The post being edited.
 */
function ndm_headless_parent_box( $post ) {
	$pages = get_posts(
		array(
			'post_type'    => $post->post_type,
			'post_status'  => array( 'publish', 'future', 'draft', 'pending', 'private' ),
			'numberposts'  => 500,
			'orderby'      => 'title',
			'order'        => 'ASC',
			'post__not_in' => array( $post->ID ),
		)
	);

	$current = (int) $post->post_parent;

	echo '<label class="screen-reader-text" for="ndm-parent-id">Parent page</label>';
	echo '<select name="parent_id" id="ndm-parent-id" style="width:100%">';
	echo '<option value="0">(no parent)</option>';
	foreach ( $pages as $page ) {
		if ( ndm_headless_post_is_under( $page, $post->ID ) ) {
			continue;
		}
		$label = get_the_title( $page ) . ( 'publish' === $page->post_status ? '' : ' (' . $page->post_status . ')' );
		echo '<option value="' . esc_attr( $page->ID ) . '"' . selected( $current, $page->ID, false ) . '>' . esc_html( $label ) . '</option>';
	}
	echo '</select>';
	echo '<p class="description">With a parent, this page\'s address runs through it: the parent\'s address, then this page\'s slug. The old address sends visitors on to the new one. Only a published parent counts.</p>';
}

/**
 * A parent must be another post of the same list; anything else is dropped. (WordPress itself already
 * refuses a parent that sits under the post.)
 *
 * @param int   $parent  The parent's post ID.
 * @param int   $post_id The post's ID.
 * @param array $data    The post as it is about to be saved.
 * @return int
 */
function ndm_headless_parent_check( $parent, $post_id, $data ) {
	$type = isset( $data['post_type'] ) ? $data['post_type'] : '';

	if ( ! $parent || ! ndm_headless_has_parents( $type ) ) {
		return $parent;
	}

	return ( (int) $parent !== (int) $post_id && get_post_type( $parent ) === $type ) ? (int) $parent : 0;
}
add_filter( 'wp_insert_post_parent', 'ndm_headless_parent_check', 9, 3 );

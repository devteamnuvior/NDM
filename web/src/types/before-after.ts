/**
 * The Before & After gallery as WordPress serves it (`ndm/v1/before-after`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/before-after.php): the "Before & After" page and
 * every published case of the "Before & After" post type.
 */

/** A case's photo: its featured image in WordPress, in WordPress's own sizes. */
export interface WPBeforeAfterPhoto {
  /** Media library ID. */
  id: number;
  src: string;
  width: number;
  height: number;
  srcSet: string;
}

export interface WPBeforeAfterCase {
  /** Post ID. */
  id: number;
  /** The post's title: the editor's own name for the case. */
  title: string;
  /** Its categories (the taxonomy "Category"): the treatment, and the filter it sits under. */
  categories: { slug: string; name: string }[];
  photo: WPBeforeAfterPhoto;
}

export interface WPBeforeAfter {
  /** The published page with the slug `before-after`, or null when there is none. */
  page: { title: string; content: string; modified: string } | null;
  /** In gallery order. */
  cases: WPBeforeAfterCase[];
}

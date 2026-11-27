/** One result of the site search: its name, the small label on the right, and where it goes. */
export interface SearchHit {
  name: string;
  category: string;
  href: string;
}

/** Answer of GET /api/search. */
export interface SearchAnswer {
  hits: SearchHit[];
}

/** Answer of GET /api/search/popular. */
export interface PopularAnswer {
  terms: string[];
}

/**
 * The Black Friday sale. Dates match the campaign; the badge is the best offer on the sale page.
 * Offers, dates and terms are placeholders until Raymond approves them.
 */
export const BF_SALE = {
  /* counted from the campaign's first day (user, 2026-11-19): the countdowns (bottom tab, pricing page) show Black
     Friday's time left to Dec 7 now, not the time to its official start on Nov 20, which was the VIP Sale's end */
  start: "2026-11-14T00:00:00-05:00",
  end: "2026-12-07T23:59:00-05:00",
  when: "Until Dec 7",
  badge: "Up to 70% off",
};

/** The VIP Sale, the campaign's first phase: while it runs, the tab at the bottom of every page shows it instead of Black Friday. */
export const VIP_SALE = {
  start: "2026-11-14T00:00:00-05:00",
  end: "2026-11-19T23:59:59-05:00",
  when: "Nov 14 to Nov 19",
  badge: "Up to 70% off",
};

/**
 * Before & after cases. Only the three Aptos pairs are real photos (served by the clinic's own site, as
 * in the prototype); the row repeats them across treatments as a placeholder gallery until each treatment
 * has its own photos. No prescription-drug cases: those are not allowed in consumer advertising.
 * Every before/after asset must carry "Individual results may vary".
 */

export interface BeforeAfterCase {
  /** Running number, and the same as a two-digit label ("01"). */
  n: number;
  id: string;
  view: string;
  /** Horizontal focus of the crop, in percent, so the face stays in frame. */
  fx: number;
  before: string;
  after: string;
  treat: string;
}

const UPLOADS = "https://newdermamedlaserclinic.com/wp-content/uploads/2025/10/";

const REAL_CASES = [
  { view: "Profile view", fx: 72, before: `${UPLOADS}1.jpg`, after: `${UPLOADS}2.jpg` },
  { view: "Three-quarter view", fx: 60, before: `${UPLOADS}3.jpg`, after: `${UPLOADS}4-1.jpg` },
  { view: "Three-quarter view", fx: 38, before: `${UPLOADS}5.jpg`, after: `${UPLOADS}6.jpg` },
];
const TREATMENTS = ["Aptos thread lift", "Laser acne", "Chemical peel", "Dermamelan®"];

/** The three real cases, numbered, as the treatment pages show them. */
export const BA_REAL_CASES: BeforeAfterCase[] = REAL_CASES.map((c, i) => ({ ...c, n: i + 1, id: String(i + 1).padStart(2, "0"), treat: "" }));

export const BA_MODELS: BeforeAfterCase[] = Array.from({ length: 12 }, (_, i) => ({
  ...REAL_CASES[i % REAL_CASES.length],
  n: i + 1,
  id: String(i + 1).padStart(2, "0"),
  treat: TREATMENTS[i % TREATMENTS.length],
}));

export const BA_DISCLAIMER = "Photos show individual cases and are shared for illustration only. Individual results may vary.";

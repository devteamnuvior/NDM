/** Clinic facts shown in the header. Source: the original prototype (newdermamedlaserclinic.com content). */

export interface Clinic {
  id: "uptown" | "downtown";
  name: string;
  /** Short cross-street label on the menu photo. */
  near: string;
  /** Transit note used in the phone menu. */
  note: string;
  /** Transit and parking, shown on the clinic card. */
  directions: string;
  address: string;
  phone: string;
}

export const CLINICS: Clinic[] = [
  {
    id: "uptown",
    name: "Uptown",
    near: "Yonge & Sheppard",
    note: "Near Sheppard-Yonge Station",
    directions: "Near Sheppard-Yonge Station · parking at Hallmark Centre, 4800 Yonge or 25 Sheppard Ave W",
    address: "4763 Yonge Street, Toronto, ON M2N 5M5",
    phone: "416-224-8800",
  },
  {
    id: "downtown",
    name: "Downtown",
    near: "Bay & College",
    note: "Near College Station",
    directions: "Near College Station · parking at 88 or 100 College Street",
    address: "790 Bay Street, Suite 900, Toronto, ON M5G 1N8",
    phone: "416-671-9766",
  },
];

export const HOURS: ReadonlyArray<readonly [days: string, hours: string]> = [
  ["Monday – Friday", "9am – 7pm"],
  ["Saturday", "10am – 5pm"],
];

/** The Aptos NAMICA badge, served by nuvior.com exactly as in the prototype. */
export const NAMICA_SPHERE_SRC = "https://nuvior.com/wp-content/themes/nuvior/assets/img/namica-sphere-240.png";

/** localStorage key the cart uses (shared with the original pages). */
export const CART_STORAGE_KEY = "ndm-cart";

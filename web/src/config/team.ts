import type { TeamIconId } from "@/components/team/team-icons";

/**
 * The medical team. Copy is trimmed from the NewDermaMed About page bios only.
 * Publishing gate: every name, face, credential and affiliation here needs Raymond Valadkhani's written
 * approval before it goes live.
 */

export interface TeamMember {
  id: string;
  /** Short name. */
  first: string;
  /** Short role under the portrait. */
  tag: string;
  name: string;
  role: string;
  img: string;
  /** The card shows, but there is no profile to open yet. */
  sample?: boolean;
  cred?: string;
  short?: string;
  bio?: string[];
  highlight?: string;
  focusLabel?: string;
  focus?: { icon: TeamIconId; label: string }[];
  facts?: [term: string, value: string][];
}

export const TEAM: TeamMember[] = [
  {
    id: 'team-negin', first: 'Dr. Negin', tag: 'Medical Director',
    name: 'Dr. Negin Mastouri', role: 'Medical Director / Aesthetic Doctor', img: '/assets/team/negin.jpg',
    cred: 'University of Toronto · Family Medicine · FMNM',
    short: 'Board-certified in Family Medicine and an Assistant Professor at McMaster University, with a special interest in skin disorders, aesthetic medicine and women’s health.',
    bio: [
      'Dr. Negin Mastouri is a graduate of the University of Toronto and is board-certified in Family Medicine, with a clinical fellowship in Hospital Medicine. She is also an international board-certified specialist in Infectious Disease, with a particular focus on infection prevention and control.',
      'With a special interest in skin disorders, aesthetic medicine and women’s health, she is dedicated to personalized, preventive and predictive healthcare. She is a Fellow in Metabolic and Nutritional Medicine (FMNM), a member of the American Academy of Anti-Aging Medicine, and an Assistant Professor at McMaster University, where she shares her knowledge with the next generation of medical professionals.',
      'Her approach is holistic, wellness-oriented and interdisciplinary. Using advanced dermal fillers, injectables and laser therapies, she addresses a range of cosmetic concerns and provides specialized treatments for skin issues like acne and hyperpigmentation, with a focus on safety and effectiveness.',
    ],
    highlight: 'Dr. Mastouri works closely with each client to develop a personalized treatment plan that aligns with their goals and needs.',
    focusLabel: 'Areas of focus',
    focus: [
      { icon: "spark", label: 'Aesthetic medicine' },
      { icon: "syringe", label: 'Dermal fillers & injectables' },
      { icon: "laser", label: 'Laser therapies' },
      { icon: "skin", label: 'Acne & hyperpigmentation' },
      { icon: "heart", label: 'Women’s health' },
      { icon: "shield", label: 'Infection prevention & control' },
    ],
    facts: [['Education', 'University of Toronto'], ['Board certification', 'Family Medicine'], ['Teaching', 'Assistant Professor, McMaster University']],
  },
  {
    id: 'team-luis', first: 'Dr. Luis', tag: 'Vascular Surgeon',
    name: 'Dr. Luis Figueroa', role: 'Vascular Surgeon', img: '/assets/team/luis.jpg',
    cred: 'Fellow, Royal College of Surgeons of Canada',
    short: 'A practicing vascular surgeon who graduated from the University of Toronto Vascular Surgery Program and thereafter joined the division as a lecturer.',
    bio: [
      'Dr. Figueroa is a practicing vascular surgeon and a fellow at the Royal College of Surgeons of Canada.',
      'He graduated from the University of Toronto, Vascular Surgery Program, and thereafter joined the division as a lecturer.',
    ],
    highlight: 'Dr. Figueroa has practiced vascular surgery at Toronto’s Humber River Hospital and North Toronto Vascular Surgery.',
    focusLabel: 'Training & experience',
    focus: [
      { icon: "vein", label: 'Vascular surgery' },
      { icon: "cap", label: 'University of Toronto Vascular Surgery Program' },
      { icon: "hospital", label: 'Humber River Hospital' },
      { icon: "hospital", label: 'North Toronto Vascular Surgery' },
    ],
    facts: [['Education', 'University of Toronto'], ['Specialty', 'Vascular surgery'], ['Fellow', 'Royal College of Surgeons of Canada']],
  },
  {
    id: 'team-alin', first: 'Alin', tag: 'Clinic Director',
    name: 'Alin Gharibian', role: 'Clinic Director / Cosmetic Consultant', img: '/assets/team/alin.jpg',
    cred: 'BSc Biology · Cosmetic Dermatology · Medical Aesthetics',
    short: 'As Director of NewDermaMed, Alin focuses on anti-aging and skin rejuvenation treatments, blending scientific knowledge with a personalized touch.',
    bio: [
      'With a Bachelor of Science in Biology and advanced certifications in Cosmetic Dermatology and Medical Aesthetics, Alin Gharibian focuses on anti-aging and skin rejuvenation treatments. Specialized training in anti-aging therapies supports evidence-based solutions tailored to each client’s unique needs.',
      'Driven by a passion for enhancing confidence and well-being, Alin combines science with artistry and compassion in every treatment plan.',
    ],
    highlight: 'As the Director of NewDermaMed, Alin leads with a dedication to excellence, blending scientific knowledge with a personalized touch.',
    focusLabel: 'Areas of focus',
    focus: [
      { icon: "hourglass", label: 'Anti-aging treatments' },
      { icon: "drop", label: 'Skin rejuvenation' },
      { icon: "flask", label: 'Cosmetic dermatology' },
      { icon: "spark", label: 'Medical aesthetics' },
      { icon: "plan", label: 'Tailored treatment plans' },
    ],
    facts: [['Education', 'BSc, Biology'], ['Certifications', 'Cosmetic Dermatology, Medical Aesthetics'], ['Role', 'Director of NewDermaMed']],
  },
  /* photo in; her profile (bio, focus, facts) is still to come, so the card has no profile dialog yet */
  { id: 'team-heather', first: 'Heather', tag: 'Nurse Practitioner', sample: true, name: 'Heather Bouchard, NP', role: 'Nurse Practitioner', img: '/assets/team/heather.jpg' },
];

/** Order of the portraits on the home page, and how far each drifts (px) as the section scrolls past. */
export const TEAM_ORDER = ["team-alin", "team-negin", "team-luis", "team-heather"];
export const TEAM_DRIFT = [-26, 30, -10, 22];

import { expect, test } from "@playwright/test";
import { menuPost } from "../src/lib/post-paths";

/*
 * Which WordPress page a menu entry links to (src/lib/post-paths.ts `menuPost`). A concern can share its
 * name with a procedure (Melasma, Stretch Marks), so its post carries "-concern" in its slug; the Concerns
 * menu must find it, and the Procedures menu must keep the procedure. Needs no server.
 */

const procedures = [
  { slug: "melasma", path: "/skin/melasma" },
  { slug: "stretch-marks", path: "/body/stretch-marks" },
  { slug: "botox", path: "/injectables/botox" },
];
const concerns = [
  { slug: "melasma-concern", path: "/concerns/melasma-concern" },
  { slug: "stretch-marks-concern", path: "/concerns/stretch-marks-concern" },
  { slug: "wrinkles-fine-lines", path: "/concerns/wrinkles-fine-lines" },
];

test("the Concerns menu links a concern before a procedure of the same name", () => {
  expect(menuPost("melasma", concerns, procedures, "concerns")?.path).toBe("/concerns/melasma-concern");
  expect(menuPost("stretch-marks", concerns, procedures, "concerns")?.path).toBe("/concerns/stretch-marks-concern");
  expect(menuPost("wrinkles-fine-lines", concerns, procedures, "concerns")?.path).toBe("/concerns/wrinkles-fine-lines");
});

test("the other menus link the procedure", () => {
  expect(menuPost("melasma", concerns, procedures)?.path).toBe("/skin/melasma");
  expect(menuPost("botox", concerns, procedures)?.path).toBe("/injectables/botox");
  expect(menuPost("wrinkles-fine-lines", concerns, procedures)?.path).toBe("/concerns/wrinkles-fine-lines");
});

test("the Concerns menu still finds a procedure when no concern exists", () => {
  expect(menuPost("botox", concerns, procedures, "concerns")?.path).toBe("/injectables/botox");
  expect(menuPost("unknown", concerns, procedures, "concerns")).toBeUndefined();
});

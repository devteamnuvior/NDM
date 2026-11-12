import { requirePricingSession } from "@/lib/pricing-admin/session";
import { WordPressError, uploadPromotionPhoto } from "@/lib/wordpress";

/**
 * POST /manage/promotions/photo: a signed-in administrator uploads a photo for an offer. It goes to
 * WordPress's media library with that person's own credentials (WordPress checks they may upload) and
 * the answer is its media ID; the photo is tied to a product only when the offers are saved.
 *
 * Checked here first: the session cookie with the session's own token, that the request comes from
 * this site, and that the file really is a JPEG, PNG or WebP image of a sensible size.
 */
const MAX_BYTES = 8 * 1024 * 1024;
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/** The image type the first bytes say it is, whatever the browser called it. */
function sniff(bytes: Uint8Array): { type: string; ext: string } | null {
  const at = (i: number, ...values: number[]) => values.every((v, k) => bytes[i + k] === v);
  if (at(0, 0xff, 0xd8, 0xff)) return { type: "image/jpeg", ext: "jpg" };
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { type: "image/png", ext: "png" };
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return { type: "image/webp", ext: "webp" };
  return null;
}

const refuse = (status: number, message: string) => Response.json({ ok: false, message }, { status, headers: HEADERS });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let sameSite = false;
  try {
    sameSite = !!origin && !!host && new URL(origin).host === host;
  } catch {
    sameSite = false;
  }
  if (!sameSite) return refuse(403, "This upload did not come from the management screen.");

  const session = await requirePricingSession(request.headers.get("x-ndm-csrf"));
  if (!session) return refuse(401, "Your sign-in has ended. Please sign in again.");

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES + 4096) return refuse(413, "That photo is larger than 8 MB.");

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("photo");
  } catch {
    return refuse(400, "That upload could not be read.");
  }
  if (!(file instanceof File) || file.size === 0) return refuse(400, "Choose a photo to upload.");
  if (file.size > MAX_BYTES) return refuse(413, "That photo is larger than 8 MB.");

  const bytes = await file.arrayBuffer();
  const kind = sniff(new Uint8Array(bytes, 0, Math.min(16, bytes.byteLength)));
  if (!kind) return refuse(415, "Photos must be JPEG, PNG or WebP images.");

  try {
    /* the name is ours: nothing of the uploaded file's name reaches WordPress */
    const media = await uploadPromotionPhoto(session.authorization, { bytes, type: kind.type, name: `offer-${Date.now()}.${kind.ext}` });
    return Response.json({ ok: true, id: media.id, src: media.src }, { headers: HEADERS });
  } catch (error) {
    if (!(error instanceof WordPressError)) throw error;
    if (error.kind === "http" && error.status === 401) return refuse(401, "Your sign-in has ended. Please sign in again.");
    if (error.kind === "http" && error.status === 403) return refuse(403, "This account may not upload photos.");
    if (error.kind === "http" && error.status && error.status < 500) return refuse(400, error.message);
    return refuse(502, "WordPress could not take the photo. Please try again.");
  }
}

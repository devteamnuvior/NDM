import "server-only";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";

/**
 * Messages from the About page's "Send us a message" form, kept by WordPress as private posts of the
 * post type "Messages" (the ndm-headless plugin's ndm/v1/messages route, includes/messages.php), which
 * also emails each one to the clinic. This site only writes them: nothing here can read a message back.
 */

const PATH = "ndm/v1/messages";

export interface ContactMessageInput {
  name: string;
  email: string;
  phone: string;
  clinic: string;
  message: string;
  /** The page the form was sent from ("/about"). */
  page: string;
}

/** Saves one message. Needs the secret the two servers share (REVALIDATE_SECRET). */
export async function saveContactMessage(input: ContactMessageInput): Promise<{ number: string }> {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new WordPressError("config", "REVALIDATE_SECRET is not set: messages cannot be saved.", { path: PATH });
  }
  const { data } = await wpFetch<{ saved?: boolean; number?: string }>(PATH, { body: input, headers: { "X-NDM-Site-Key": secret }, timeoutMs: 15_000 });
  if (data.saved !== true || typeof data.number !== "string") {
    throw new WordPressError("parse", "WordPress did not confirm the message.", { path: PATH });
  }
  return { number: data.number };
}

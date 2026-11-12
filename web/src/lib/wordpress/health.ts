import "server-only";
import type { WPHealth } from "@/types/wordpress";
import { wpFetch } from "./client";

/** Asks WordPress whether it is up (the site's own `ndm/v1/health` endpoint). Never cached. */
export async function getWordPressHealth(): Promise<WPHealth> {
  const { data } = await wpFetch<WPHealth>("ndm/v1/health");
  return data;
}

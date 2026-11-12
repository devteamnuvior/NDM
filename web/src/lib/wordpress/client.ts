import "server-only";
import type { WPRestError } from "@/types/wordpress";
import { getWordPressConfig } from "./config";
import { WordPressError } from "./errors";

/** A query value; arrays are sent comma separated, empty values are left out. */
export type WPQueryValue = string | number | boolean | ReadonlyArray<string | number> | null | undefined;

export interface WPRequest {
  query?: Record<string, WPQueryValue>;
  /**
   * Send the server's WordPress credentials. Off by default: public content is read anonymously, so a
   * cached answer can never contain something only a signed-in user may see.
   */
  auth?: boolean;
  /** Lets the caller cancel the request; the time limit applies as well. */
  signal?: AbortSignal;
}

export interface WPResponse<T> {
  data: T;
  /** X-WP-Total: all matching entries of a collection, null for single entries. */
  total: number | null;
  /** X-WP-TotalPages. */
  totalPages: number | null;
}

function buildUrl(apiUrl: string, path: string, query: WPRequest["query"]): string {
  const url = new URL(`${apiUrl}/${path.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) url.searchParams.set(key, value.join(","));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

const headerNumber = (headers: Headers, name: string): number | null => {
  const value = headers.get(name);
  return value !== null && /^\d+$/.test(value) ? Number(value) : null;
};

function isRestError(body: unknown): body is WPRestError {
  return typeof body === "object" && body !== null && typeof (body as WPRestError).code === "string";
}

/**
 * The one place this site talks to WordPress: a GET against the REST API (`path` is relative to the API
 * root, for example "wp/v2/posts"), with a time limit and every failure turned into a WordPressError.
 *
 * It does not cache by itself. The content modules beside this file wrap it in `"use cache"` with a
 * lifetime and tags; a read that must be fresh on every request calls it directly, inside <Suspense>.
 */
export async function wpFetch<T>(path: string, request: WPRequest = {}): Promise<WPResponse<T>> {
  const config = getWordPressConfig();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (request.auth) {
    if (!config.authorization) {
      throw new WordPressError("config", "This request needs WordPress credentials, and none are configured.", { path });
    }
    headers.Authorization = config.authorization;
  }

  const limit = AbortSignal.timeout(config.timeoutMs);
  const signal = request.signal ? AbortSignal.any([request.signal, limit]) : limit;

  let response: Response;
  try {
    response = await fetch(buildUrl(config.apiUrl, path, request.query), { headers, signal, redirect: "error" });
  } catch (cause) {
    if (limit.aborted) {
      throw new WordPressError("timeout", `WordPress did not answer within ${config.timeoutMs} ms.`, { path, cause });
    }
    throw new WordPressError("network", "WordPress could not be reached.", { path, cause });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new WordPressError("parse", `WordPress answered ${response.status} with something that is not JSON.`, {
      path,
      status: response.status,
      cause,
    });
  }

  if (!response.ok) {
    const detail = isRestError(body) ? body : null;
    throw new WordPressError("http", detail?.message ?? `WordPress answered ${response.status}.`, {
      path,
      status: response.status,
      code: detail?.code,
    });
  }

  return {
    data: body as T,
    total: headerNumber(response.headers, "x-wp-total"),
    totalPages: headerNumber(response.headers, "x-wp-totalpages"),
  };
}

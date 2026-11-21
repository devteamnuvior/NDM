import "server-only";
import { WordPressError } from "./errors";

/**
 * Where WordPress is and how to sign in to it, read from the server's environment (see `.env.example`).
 * This module is server-only: importing it from a Client Component fails the build, so the address
 * and the credentials cannot end up in the browser bundle.
 */
export interface WordPressConfig {
  /** REST API root without a trailing slash, for example "https://cms.example.com/wp-json". */
  apiUrl: string;
  /** Ready-made Authorization header value, or null when no credentials are configured. */
  authorization: string | null;
  /** How long one request may take. */
  timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** True when a WordPress address is configured, so callers can skip WordPress entirely when it is not. */
export function isWordPressConfigured(): boolean {
  return Boolean(process.env.WORDPRESS_API_URL?.trim());
}

/** Reads and checks the configuration. Throws a `config` WordPressError when it is missing or unsafe. */
export function getWordPressConfig(): WordPressConfig {
  const raw = process.env.WORDPRESS_API_URL?.trim();
  if (!raw) {
    throw new WordPressError("config", "WORDPRESS_API_URL is not set.");
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch (cause) {
    throw new WordPressError("config", "WORDPRESS_API_URL is not a valid address.", { cause });
  }
  const local = LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) {
    throw new WordPressError("config", "WORDPRESS_API_URL must use https (http is accepted for localhost only).");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new WordPressError("config", "WORDPRESS_API_URL must be a plain address: no credentials, query or fragment.");
  }

  const user = process.env.WORDPRESS_AUTH_USER?.trim();
  /* WordPress shows application passwords in groups of four with spaces; both forms are accepted */
  const password = process.env.WORDPRESS_AUTH_APP_PASSWORD?.replace(/\s+/g, "");
  if (Boolean(user) !== Boolean(password)) {
    throw new WordPressError("config", "Set both WORDPRESS_AUTH_USER and WORDPRESS_AUTH_APP_PASSWORD, or neither.");
  }

  const timeout = Number(process.env.WORDPRESS_TIMEOUT_MS);

  return {
    apiUrl: `${url.origin}${url.pathname.replace(/\/+$/, "")}`,
    authorization: user && password ? `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}` : null,
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS,
  };
}

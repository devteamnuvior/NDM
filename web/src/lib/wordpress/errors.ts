import "server-only";

/**
 * Why a WordPress request failed:
 * - `config`: the connection is not set up (or set up wrongly) on this server
 * - `network`: WordPress could not be reached
 * - `timeout`: WordPress did not answer in time
 * - `http`: WordPress answered with an error status
 * - `parse`: the answer was not the JSON that was expected
 */
export type WordPressErrorKind = "config" | "network" | "timeout" | "http" | "parse";

/** Every failure of the WordPress client is one of these, so callers can tell them apart from bugs. */
export class WordPressError extends Error {
  readonly kind: WordPressErrorKind;
  /** HTTP status, for `http` errors. */
  readonly status?: number;
  /** WordPress's own error code ("rest_post_invalid_id"), when it sent one. */
  readonly code?: string;
  /** The API path that was asked for. Never the full address and never credentials. */
  readonly path?: string;

  constructor(
    kind: WordPressErrorKind,
    message: string,
    details: { status?: number; code?: string; path?: string; cause?: unknown } = {},
  ) {
    super(message, details.cause === undefined ? undefined : { cause: details.cause });
    this.name = "WordPressError";
    this.kind = kind;
    this.status = details.status;
    this.code = details.code;
    this.path = details.path;
  }

  /** True when the entry simply does not exist (or is not public). */
  get notFound(): boolean {
    return this.kind === "http" && this.status === 404;
  }
}

export type Settled<T> = { ok: true; data: T } | { ok: false; error: WordPressError };

/**
 * Runs a WordPress read and returns its outcome instead of throwing, for places that want to fall
 * back (for example to the built-in content) when WordPress is down. Anything that is not a
 * WordPressError is a bug and is thrown on.
 */
export async function settle<T>(read: () => Promise<T>): Promise<Settled<T>> {
  try {
    return { ok: true, data: await read() };
  } catch (error) {
    if (error instanceof WordPressError) return { ok: false, error };
    throw error;
  }
}

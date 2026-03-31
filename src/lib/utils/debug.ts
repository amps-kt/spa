/**
 * Log a debug message tagged with `[DEBUG]`. Only runs in development.
 *
 * Filter in terminal: `pnpm dev:debug`
 *
 * @example
 * debug("user payload", payload);
 * // [DEBUG] user payload { ... }
 */
export function debug(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log("\x1b[36m[DEBUG]\x1b[0m", ...args);
  }
}

/**
 * Create a namespaced debug logger tagged with `[DEBUG:<namespace>]`. Only runs in development.
 *
 * Filter by namespace: `pnpm dev:debug 2>&1 | grep 'auth'`
 *
 * @example
 * const log = createDebug("auth");
 * log("session created", sessionId);
 * // [DEBUG:auth] session created abc123
 */
export function createDebug(namespace: string) {
  return (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`\x1b[36m[DEBUG:${namespace}]\x1b[0m`, ...args);
    }
  };
}

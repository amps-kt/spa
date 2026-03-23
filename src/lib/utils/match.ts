/**
 * Pattern matches a value against an exhaustive set of cases.
 *
 * @example
 * const result = match(status, {
 *   [Status.ACTIVE]: () => "active",
 *   [Status.INACTIVE]: () => "inactive",
 * });
 *
 * @param value - The value to match against.
 * @param cases - An exhaustive record mapping every possible value to a handler.
 * @returns The result of the matching handler.
 */
export function match<K extends string | number | symbol, R>(
  value: K,
  cases: Record<K, () => R>,
): R {
  return cases[value]();
}

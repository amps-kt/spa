/**
 * Transforms an array of items into an object keyed by a derived key.
 *
 * When called with two arguments, the values are the original items.
 * When called with a third `getValue` argument, the values are transformed
 * by that function before being stored.
 *
 * @template T - The type of items in the array
 * @template U - The type of the transformed value (only when `getValue` is provided)
 * @template K - The type of the key (must be a valid object key)
 * @param items - The array of items to transform
 * @param getKey - Function that extracts the key from each item
 * @param getValue - Optional function that extracts the value from each item
 * @returns An object where keys are derived from items and values are either
 *          the items themselves or the result of `getValue`
 *
 * @example
 * // Without getValue — values are the original items
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * const usersById = keyBy(users, (user) => user.id);
 * // { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
 *
 * @example
 * // With getValue — values are transformed
 * const namesById = keyBy(users, (user) => user.id, (user) => user.name);
 * // { 1: 'Alice', 2: 'Bob' }
 *
 * @note If multiple items produce the same key, the last one wins (earlier values are overwritten).
 */
export function keyBy<T, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T>;

export function keyBy<T, U, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
  getValue: (item: T) => U,
): Record<K, U>;

export function keyBy<T, U, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
  getValue?: (item: T) => U,
): Record<K, T | U> {
  const result = {} as Record<K, T | U>;
  for (const item of items) {
    result[getKey(item)] = getValue ? getValue(item) : item;
  }
  return result;
}

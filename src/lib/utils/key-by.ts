/**
 * Transforms an array of items into an object keyed by a derived key.
 * 
 * @template T - The type of items in the array
 * @template K - The type of the key (must be a valid object key)
 * @param items - The array of items to transform
 * @param getKey - Function that extracts the key from each item
 * @returns An object where keys are derived from items and values are the items themselves
 * 
 * @example
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * const usersById = keyBy(users, (user) => user.id);
 * // { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
 * 
 * @note If multiple items produce the same key, the last one wins (earlier values are overwritten).
 */
export function keyBy<T, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K
): Record<K, T> {
  const result: Record<K, T> = {} as Record<K, T>;
  for (const item of items) {
    result[getKey(item)] = item;
  }
  return result;
}
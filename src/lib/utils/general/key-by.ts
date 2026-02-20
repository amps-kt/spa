/**
 * Creates an object indexed by the result of a key function.
 * @template T - The type of items in the array.
 * @template K - The type of the key property.
 * @param items - The array of items to index.
 * @param getKey - A function that returns the key for each item.
 * @returns An object where keys are derived from the items using the getKey function, and values are the items themselves.
 */
export function keyBy<T, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T> {
  return items.reduce(
    (acc, item) => {
      acc[getKey(item)] = item;
      return acc;
    },
    {} as Record<K, T>,
  );
}

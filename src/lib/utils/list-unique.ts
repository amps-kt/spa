/**
 * Removes duplicate items from an array using a custom comparison function.
 * Keeps the first occurrence of each unique item.
 *
 * @template T - The type of items in the array
 * @param lst - The array to deduplicate
 * @param compare - Function that returns true if two items are equal
 * @returns A new array with duplicates removed
 *
 * @example
 * const items = [{ id: '1' }, { id: '2' }, { id: '1' }];
 * unique(items, (a, b) => a.id === b.id);
 * // [{ id: '1' }, { id: '2' }]
 */
export function unique<T>(lst: T[], compare: (a: T, b: T) => boolean) {
  return lst.filter(
    (val, idx, arr) => arr.findIndex((val2) => compare(val, val2)) === idx,
  );
}

/**
 * Removes duplicate items from an array by comparing their `id` field.
 * Keeps the first occurrence of each unique item.
 *
 * @template T - The type of items (must have an `id` field)
 * @param lst - The array to deduplicate
 * @returns A new array with duplicates removed
 *
 * @example
 * const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }, { id: '1', name: 'Charlie' }];
 * uniqueById(users);
 * // [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]
 */
export function uniqueById<T extends { id: string }>(lst: T[]) {
  return unique(lst, (a, b) => a.id === b.id);
}

/**
 * Filter predicate that removes duplicates using a custom comparison function.
 * Designed to be used with Array.filter().
 *
 * @template T - The type of items in the array
 * @param item - The current item being filtered
 * @param idx - The index of the current item
 * @param self - The array being filtered
 * @param compare - Function that returns true if two items are equal
 * @returns true if this is the first occurrence of this item, false otherwise
 *
 * @example
 * const items = [{ id: '1' }, { id: '2' }, { id: '1' }];
 * items.filter((item, idx, self) => nubs(item, idx, self, (a, b) => a.id === b.id));
 * // [{ id: '1' }, { id: '2' }]
 */
export function nubs<T>(
  item: T,
  idx: number,
  self: T[],
  compare: (a: T, b: T) => boolean,
) {
  return self.findIndex((f) => compare(item, f)) === idx;
}

/**
 * Filter predicate that removes duplicates by comparing the `id` field.
 * Designed to be used with Array.filter().
 *
 * @template T - The type of items (must have an `id` field)
 * @param item - The current item being filtered
 * @param idx - The index of the current item
 * @param self - The array being filtered
 * @returns true if this is the first occurrence of this item, false otherwise
 *
 * @example
 * const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }, { id: '1', name: 'Charlie' }];
 * users.filter((item, idx, self) => nubsById(item, idx, self));
 * // [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]
 */
export function nubsById<T extends { id: string }>(
  item: T,
  idx: number,
  self: T[],
) {
  return nubs(item, idx, self, (a, b) => a.id === b.id);
}

export function uniqueBy<T>(lst: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return lst.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

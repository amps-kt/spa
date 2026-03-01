export function groupBy<T, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T[]>;

export function groupBy<T, U, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
  getValue: (item: T) => U,
): Record<K, U[]>;

export function groupBy<T, U, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K,
  getValue?: (item: T) => U,
): Record<K, (T | U)[]> {
  const result = {} as Record<K, (T | U)[]>;
  for (const item of items) {
    const key = getKey(item);
    result[key] ??= [];
    result[key].push(getValue ? getValue(item) : item);
  }
  return result;
}

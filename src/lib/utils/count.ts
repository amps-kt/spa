export function count<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

/**
 *
 * @todo use relativeComplement to implement setDiff + rename
 *
 * Finds the elements unique to `setA` (not present in `setB`).
 * The order of elements in the returned array is not guaranteed.
 *
 * @template T A type with a `title` property (e.g., an object).
 * @param {T[]} setA The first set of elements.
 * @param {T[]} setB The second set of elements.
 * @param {(a: T) => string} getKey A function that returns a unique key for each element.
 * @returns {T[]} A new array containing the elements unique to `setA`.
 *
 * @example
 * const a = [{ title: 'A' }, { title: 'B' }, { title: 'C' }];
 * const b = [{ title: 'A' }, { title: 'D' }];
 * const notInB = setDiff(b, a, (x) => x.title);
 * console.log(notInB); // Output: [{ title: 'B' }, { title: 'C' }]
 */
export function setDiff<T>(
  setA: T[],
  setB: T[],
  getKey?: (a: T) => string,
): T[] {
  if (getKey === undefined) {
    const keysB = new Set(setB);
    return setA.filter((a) => !keysB.has(a));
  } else {
    const keysB = new Set(setB.map(getKey));
    return setA.filter((a) => !keysB.has(getKey(a)));
  }
}

/**
 * Finds the elements unique to `setA` (not present in `setB`).
 * The order of elements in the returned array is not guaranteed.
 *
 * @todo this comment is out of date
 *
 * @template T A type with a `title` property (e.g., an object).
 * @param {T[]} setA The first set of elements.
 * @param {T[]} setB The second set of elements.
 * @param {(a: T, b:T) => boolean} compare A function that compares two elements.
 * @returns {T[]} A new array containing the elements unique to `setA`.
 *
 * @example
 * const a = [{ title: 'A' }, { title: 'B' }, { title: 'C' }];
 * const b = [{ title: 'A' }, { title: 'D' }];
 * const notInB = relativeComplement(b, a, (x, y) => x.title===y.title);
 * console.log(notInB); // Output: [{ title: 'B' }, { title: 'C' }]
 */
export function relativeComplement<T, U>(
  setA: T[],
  setB: U[],
  compare: (a: T, b: U) => boolean,
): T[] {
  return setA.filter((a) => !setB.some((b) => compare(a, b)));
}

/**
 *
 * @todo refactor to use compare function instead of getKey
 *
 * Computes the intersection of two sets
 * @param a set A
 * @param b set B
 * @param getKey a function to get the key of the element
 * @returns the intersection of set A and set B
 * @example
 * const a = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
 * const b = [{ id: 2, name: 'B' }, { id: 3, name: 'C' }];
 * const intersection = setIntersection(a, b, (x) => x.id);
 * console.log(intersection); // Output: [{ id: 2, name: 'B' }]
 */
export function setIntersection<T>(
  a: T[],
  b: T[],
  getKey?: (a: T) => string,
): T[] {
  if (getKey === undefined) return a.filter((x) => b.some((y) => x === y));
  else return a.filter((x) => b.some((y) => getKey(x) === getKey(y)));
}

export function hasOverlap<T>(
  a: T[],
  b: T[],
  getKey?: (a: T) => string,
): boolean {
  if (getKey === undefined) return setIntersection(a, b).length > 0;
  else return setIntersection(a, b, getKey).length > 0;
}

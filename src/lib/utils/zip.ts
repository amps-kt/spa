/**
 * Combines two arrays element-by-element using a combining function.
 * Stops at the length of the shorter array.
 *
 * @template A - The type of items in the first array
 * @template B - The type of items in the second array
 * @template C - The type of the combined result
 * @param a - The first array
 * @param b - The second array
 * @param combine - Function that merges one element from each array
 * @returns A new array of combined values
 *
 * @example
 * zipWith([1, 2, 3], [10, 20, 30], (a, b) => a + b);
 * // [11, 22, 33]
 */
export function zipWith<A, B, C>(
  a: A[],
  b: B[],
  combine: (a: A, b: B) => C,
): C[] {
  // We stop at the shorter array, consistent with Haskell's zip semantics
  const length = Math.min(a.length, b.length);
  const result: C[] = [];
  for (let i = 0; i < length; i++) {
    result.push(combine(a[i], b[i]));
  }
  return result;
}

/**
 * Combines two arrays into an array of pairs, stopping at the shorter array.
 * Implemented in terms of zipWith — prefer zipWith when you need to transform
 * the pairs immediately, to avoid creating intermediate tuple arrays.
 *
 * @example
 * zip([1, 2, 3], ['a', 'b']);
 * // [[1, 'a'], [2, 'b']]
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return zipWith(a, b, (x, y) => [x, y]);
}

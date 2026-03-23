/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 *
 * @example clamp(1, [10, 20]) // 10
 */
export function clamp(value: number, [min, max]: [number, number]) {
  return Math.min(Math.max(value, min), max);
}

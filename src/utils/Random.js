/**
 * Random.js
 * Seeded and unseeded random utilities for ACID KHUTIR.
 * Provides weighted picks, shuffles, and range rolls.
 */
export default class Random {
  /**
   * Float in [0, 1).
   */
  static float() {
    return Math.random();
  }

  /**
   * Float in [min, max).
   */
  static range(min, max) {
    return min + Math.random() * (max - min);
  }

  /**
   * Integer in [min, max] inclusive.
   */
  static int(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  /**
   * Pick a random element from an array.
   * @template T
   * @param {T[]} arr
   * @returns {T}
   */
  static pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Pick `n` unique random elements from an array (without replacement).
   * @template T
   * @param {T[]} arr
   * @param {number} n
   * @returns {T[]}
   */
  static pickN(arr, n) {
    const copy = arr.slice();
    Random.shuffle(copy);
    return copy.slice(0, n);
  }

  /**
   * Fisher-Yates in-place shuffle.
   * @template T
   * @param {T[]} arr
   * @returns {T[]} same array, shuffled
   */
  static shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Weighted pick from an array of `{ value, weight }` objects.
   * @template T
   * @param {{ value: T, weight: number }[]} weightedArr
   * @returns {T}
   */
  static weighted(weightedArr) {
    const total = weightedArr.reduce((sum, item) => sum + item.weight, 0);
    let roll    = Math.random() * total;
    for (const item of weightedArr) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }
    return weightedArr[weightedArr.length - 1].value;
  }

  /**
   * Boolean with given probability (0–1).
   */
  static chance(probability) {
    return Math.random() < probability;
  }
}

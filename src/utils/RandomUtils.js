/**
 * RandomUtils.js
 * Random-number helpers used across the game.
 * Falls back to pure Math.random() — Phaser not required.
 */
export const RandomUtils = {
  /**
   * Random integer in [min, max] (inclusive).
   * Uses Phaser.Math.Between when available, otherwise Math.random.
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  between(min, max) {
    if (typeof Phaser !== 'undefined') {
      return Phaser.Math.Between(min, max);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Random float in [min, max).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  float(min, max) {
    return min + Math.random() * (max - min);
  },

  /**
   * Pick a uniformly random element from an array.
   * @template T
   * @param {T[]} arr
   * @returns {T}
   */
  choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Return true with the given probability (default 50%).
   * @param {number} chance - [0, 1]
   * @returns {boolean}
   */
  bool(chance = 0.5) {
    return Math.random() < chance;
  },

  /**
   * Shuffle an array in place (Fisher-Yates).
   * @template T
   * @param {T[]} arr
   * @returns {T[]} The same array, shuffled
   */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
};

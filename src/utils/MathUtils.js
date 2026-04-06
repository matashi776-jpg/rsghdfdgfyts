/**
 * MathUtils.js
 * Pure math helpers used across the game.
 * No Phaser dependency — safe to unit-test in isolation.
 */
export const MathUtils = {
  /**
   * Clamp a value between min and max.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Linear interpolation between a and b.
   * @param {number} a
   * @param {number} b
   * @param {number} t - [0, 1]
   * @returns {number}
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  /**
   * Euclidean distance between two points.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },

  /**
   * Squared distance (cheaper than distance, useful for comparisons).
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  distanceSq(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2;
  },

  /**
   * Enemy HP for a given wave (1-indexed).
   * @param {number} wave
   * @returns {number}
   */
  enemyHP(wave) {
    return Math.floor(100 * Math.pow(1.18, wave - 1));
  },

  /**
   * Tower damage for a given base damage and level (1-indexed).
   * @param {number} baseDamage
   * @param {number} level
   * @returns {number}
   */
  towerDamage(baseDamage, level) {
    return Math.floor(baseDamage * (1 + 0.35 * Math.log2(level + 1)));
  },

  /**
   * Gold reward for killing an enemy on a given wave.
   * @param {number} wave
   * @returns {number}
   */
  goldReward(wave) {
    return 20 + wave * 5;
  },
};

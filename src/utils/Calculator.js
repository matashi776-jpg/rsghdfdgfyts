/**
 * Calculator.js
 * Utility class for game math / progression formulas.
 */
export default class Calculator {
  /**
   * Enemy HP for a given wave.
   * @param {number} wave – 1-indexed wave number
   * @returns {number}
   */
  static enemyHP(wave) {
    return Math.floor(100 * Math.pow(1.2, wave - 1));
  }

  /**
   * Tower damage for a given base damage value and tower level.
   * @param {number} baseDamage
   * @param {number} level – 1-indexed tower level
   * @returns {number}
   */
  static towerDamage(baseDamage, level) {
    return Math.floor(baseDamage * (1 + 0.35 * Math.log2(level + 1)));
  }

  /**
   * Gold reward for killing an enemy in a given wave.
   * @param {number} wave
   * @returns {number}
   */
  static goldReward(wave) {
    return Math.floor(15 + 5 * Math.sqrt(wave));
  }
}

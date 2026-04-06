/**
 * Calculator.js
 * Utility class for game math / progression formulas.
 */
export default class Calculator {
  /**
   * Enemy HP for a given wave.
   *
   * Uses a stepped-logarithmic formula so difficulty grows in "staircases"
   * that align with perk milestones (every 5 waves).  After each perk the
   * game resets to the new tier's base, giving the player a brief respite
   * before ramping up again.
   *
   * Approximate values:
   *   Wave  1 →  100   Wave  5 →  180
   *   Wave  6 →  260   Wave 10 →  468
   *   Wave 11 →  580   Wave 15 → 1044
   *
   * @param {number} wave – 1-indexed wave number
   * @returns {number}
   */
  static enemyHP(wave) {
    const TIER_BASES = [100, 260, 580, 1100];
    const tier       = Math.floor((wave - 1) / 5);
    const waveInTier = (wave - 1) % 5;
    const base       = TIER_BASES[Math.min(tier, TIER_BASES.length - 1)];
    return Math.floor(base * (1 + 0.4 * Math.log2(waveInTier + 1)));
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
    return 100;
  }
}

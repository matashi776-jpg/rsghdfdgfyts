/**
 * Calculator.js
 * Utility class for game math / progression formulas.
 *
 * Part 4 — Balance, Formulas, Perks, Economy, Meta-Progression
 */
export default class Calculator {
  // ─── Constants ────────────────────────────────────────────────────────────

  static BASE_HP        = 60;
  static HP_GROWTH      = 15;
  static HP_LOG_FACTOR  = 10;
  static BASE_SPEED     = 40;
  static BASE_GOLD      = 5;

  // ─── Core Combat Formulas ─────────────────────────────────────────────────

  /**
   * Bullet / hit damage.
   * Damage = BaseDamage * (1 + PlayerDamageBonus) * CritMultiplier
   * @param {number} baseDamage
   * @param {number} playerDamageBonus – fractional bonus from perks/upgrades (e.g. 0.5 = +50%)
   * @param {number} critMultiplier    – 1 (normal) or 2 (crit)
   * @returns {number}
   */
  static damage(baseDamage, playerDamageBonus = 0, critMultiplier = 1) {
    return Math.floor(baseDamage * (1 + playerDamageBonus) * critMultiplier);
  }

  /**
   * Enemy HP for a given wave.
   * EnemyHP = BaseHP + (Wave * HP_Growth) + log(Wave + 1) * HP_LogFactor
   * Avoids exponential blowup while still feeling like growth.
   * @param {number} wave – 1-indexed wave number
   * @param {number} hpMult – enemy-type multiplier (default 1)
   * @returns {number}
   */
  static enemyHP(wave, hpMult = 1) {
    const hp =
      Calculator.BASE_HP +
      wave * Calculator.HP_GROWTH +
      Math.log(wave + 1) * Calculator.HP_LOG_FACTOR;
    return Math.floor(hp * hpMult);
  }

  /**
   * Enemy movement speed (pixels/second) for a given wave.
   * Speed = BaseSpeed + Wave * 2
   * @param {number} wave
   * @param {number} speedMult – enemy-type multiplier (default 1)
   * @returns {number}
   */
  static enemySpeed(wave, speedMult = 1) {
    return Math.floor((Calculator.BASE_SPEED + wave * 2) * speedMult);
  }

  /**
   * Gold reward for killing an enemy.
   * Gold = BaseGold * GoldMultiplier * (1 + Wave * 0.05)
   * @param {number} wave
   * @param {number} goldMultiplier – from perks/upgrades (default 1)
   * @returns {number}
   */
  static goldReward(wave, goldMultiplier = 1) {
    return Math.floor(Calculator.BASE_GOLD * goldMultiplier * (1 + wave * 0.05));
  }

  /**
   * Overall wave difficulty score.
   * Difficulty = (HP * 0.6) + (Speed * 0.3) + (EnemyCount * 0.1)
   * Useful for balancing and auto-generating waves.
   * @param {number} hp
   * @param {number} speed
   * @param {number} enemyCount
   * @returns {number}
   */
  static waveDifficulty(hp, speed, enemyCount) {
    return hp * 0.6 + speed * 0.3 + enemyCount * 0.1;
  }

  // ─── Tower / Defender Helpers ─────────────────────────────────────────────

  /**
   * Tower damage for a given base damage value and tower level.
   * Kept for backwards compatibility with Tower.js.
   * @param {number} baseDamage
   * @param {number} level – 1-indexed tower level
   * @returns {number}
   */
  static towerDamage(baseDamage, level) {
    return Math.floor(baseDamage * (1 + 0.35 * Math.log2(level + 1)));
  }

  // ─── Meta-Progression Costs ───────────────────────────────────────────────

  /**
   * Gold cost to upgrade the house from level → level+1 (max level 5).
   * @param {number} currentLevel
   * @returns {number}
   */
  static houseUpgradeCost(currentLevel) {
    const costs = [0, 200, 400, 600, 1000];
    return costs[currentLevel] ?? Infinity;
  }

  /**
   * Gold cost to upgrade the weapon from level → level+1 (max level 5).
   * @param {number} currentLevel
   * @returns {number}
   */
  static weaponUpgradeCost(currentLevel) {
    const costs = [0, 150, 300, 500, 800];
    return costs[currentLevel] ?? Infinity;
  }

  /**
   * Bonus damage granted by weapon level (additive flat damage bonus).
   * @param {number} level
   * @returns {number}
   */
  static weaponDamageBonus(level) {
    const bonuses = [0, 10, 20, 30, 40];
    return bonuses[Math.min(level, bonuses.length - 1)];
  }
}

/**
 * DifficultyDirector.js
 * Computes enemy stats per wave using the canonical ACID KHUTIR formulas:
 *
 *   HP    = 60 + wave*15 + log(wave+1)*10
 *   Speed = 40 + wave*2
 *   Gold  = 5  * (1 + wave*0.05)
 */
import GameConfig from './GameConfig.js';

export default class DifficultyDirector {
  /**
   * Enemy HP for a given wave.
   * @param {number} wave – 1-indexed
   * @returns {number}
   */
  static enemyHP(wave) {
    return Math.floor(
      GameConfig.ENEMY_BASE_HP
      + wave * GameConfig.ENEMY_HP_PER_WAVE
      + Math.log(wave + 1) * GameConfig.ENEMY_HP_LOG_FACTOR,
    );
  }

  /**
   * Enemy movement speed for a given wave (px/sec).
   * @param {number} wave
   * @returns {number}
   */
  static enemySpeed(wave) {
    return GameConfig.ENEMY_BASE_SPEED + wave * GameConfig.ENEMY_SPEED_PER_WAVE;
  }

  /**
   * Gold reward for killing an enemy on a given wave.
   * @param {number} wave
   * @returns {number}
   */
  static goldReward(wave) {
    return Math.floor(
      GameConfig.GOLD_BASE * (1 + wave * GameConfig.GOLD_WAVE_FACTOR),
    );
  }

  /**
   * Number of enemies to spawn per interval for a given wave.
   * Ramps up slowly so the game remains approachable early on.
   * @param {number} wave
   * @returns {number}
   */
  static enemiesPerInterval(wave) {
    return 1 + Math.floor(wave / 3);
  }

  /**
   * Spawn interval in ms for a given wave (shorter = more enemies faster).
   * @param {number} wave
   * @returns {number}
   */
  static spawnInterval(wave) {
    return Math.max(500, 2000 - wave * 100);
  }
}

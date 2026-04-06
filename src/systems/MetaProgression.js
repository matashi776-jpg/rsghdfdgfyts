/**
 * MetaProgression.js
 * Handles persistent progress between runs using SaveManager.
 * Meta-level unlocks starting bonuses carried into each new run.
 */
import SaveManager from '../core/SaveManager.js';

export default class MetaProgression {
  /**
   * Call after a run ends to record progress and level up if applicable.
   * @param {number} wavesReached – how many waves the player survived
   * @returns {{ newRecord: boolean, leveledUp: boolean }}
   */
  static recordRun(wavesReached) {
    const newRecord = SaveManager.updateWaveRecord(wavesReached);
    const prevLevel = SaveManager.getMetaLevel();

    // Level up every 5 waves beaten as a personal record
    const record   = SaveManager.getWaveRecord();
    const newLevel  = Math.floor(record / 5) + 1;
    if (newLevel > prevLevel) {
      SaveManager.setMetaLevel(newLevel);
      return { newRecord, leveledUp: true, level: newLevel };
    }
    return { newRecord, leveledUp: false, level: prevLevel };
  }

  /**
   * Returns the starting modifier bonuses for the current meta level.
   * @returns {object} partial modifiers to merge into run modifiers
   */
  static getStartingBonuses() {
    const level = SaveManager.getMetaLevel();
    return {
      damage:        1 + (level - 1) * 0.05,  // +5% damage per meta level
      passiveIncome: 1 + (level - 1) * 0.10,  // +10% income per meta level
      attackSpeed:   1,
      wallDefense:   1,
    };
  }

  /**
   * Current meta level.
   * @returns {number}
   */
  static get level() {
    return SaveManager.getMetaLevel();
  }

  /**
   * All-time wave record.
   * @returns {number}
   */
  static get waveRecord() {
    return SaveManager.getWaveRecord();
  }
}

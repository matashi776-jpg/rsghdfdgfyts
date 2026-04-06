/**
 * SaveManager.js
 * Handles all localStorage persistence for ACID KHUTIR.
 * Provides typed get/set helpers with JSON serialisation.
 */
import GameConfig from './GameConfig.js';

export default class SaveManager {
  // ── Meta-progression ──────────────────────────────────────────────────────

  static getMetaLevel() {
    return parseInt(localStorage.getItem(GameConfig.META_LEVEL_KEY) || '1', 10);
  }

  static setMetaLevel(level) {
    localStorage.setItem(GameConfig.META_LEVEL_KEY, String(level));
  }

  static incrementMetaLevel() {
    SaveManager.setMetaLevel(SaveManager.getMetaLevel() + 1);
  }

  // ── Unlocked meta-perks ───────────────────────────────────────────────────

  static getMetaPerks() {
    try {
      return JSON.parse(localStorage.getItem(GameConfig.META_PERKS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static addMetaPerk(perkId) {
    const perks = SaveManager.getMetaPerks();
    if (!perks.includes(perkId)) {
      perks.push(perkId);
      localStorage.setItem(GameConfig.META_PERKS_KEY, JSON.stringify(perks));
    }
  }

  static hasMetaPerk(perkId) {
    return SaveManager.getMetaPerks().includes(perkId);
  }

  // ── Wave record ───────────────────────────────────────────────────────────

  static getWaveRecord() {
    return parseInt(localStorage.getItem(GameConfig.META_RECORD_KEY) || '0', 10);
  }

  static updateWaveRecord(wave) {
    if (wave > SaveManager.getWaveRecord()) {
      localStorage.setItem(GameConfig.META_RECORD_KEY, String(wave));
      return true; // new record
    }
    return false;
  }

  // ── Full reset ────────────────────────────────────────────────────────────

  static resetAll() {
    localStorage.removeItem(GameConfig.META_LEVEL_KEY);
    localStorage.removeItem(GameConfig.META_PERKS_KEY);
    localStorage.removeItem(GameConfig.META_RECORD_KEY);
  }
}

/**
 * SaveManager.js
 * Handles save/load via localStorage for ACID KHUTIR meta-progression.
 */
const SAVE_KEY = 'acidkhutir_save';

const SaveManager = {
  defaultSave() {
    return {
      runs: 0,
      totalKills: 0,
      highestWave: 0,
      unlockedPerks: [],
      currency: 0,
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? { ...this.defaultSave(), ...JSON.parse(raw) } : this.defaultSave();
    } catch {
      return this.defaultSave();
    }
  },

  save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      console.warn('SaveManager: could not write to localStorage');
    }
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
  },
};

export default SaveManager;

/**
 * MetaProgression.js
 * Persistent meta-game data between runs.
 */
import SaveManager from '../core/SaveManager.js';

export default class MetaProgression {
  constructor() {
    this._data = SaveManager.load();
  }

  get data() { return this._data; }

  recordRun(wave, kills) {
    this._data.runs++;
    this._data.totalKills += kills;
    if (wave > this._data.highestWave) this._data.highestWave = wave;
    SaveManager.save(this._data);
  }

  addCurrency(amount) {
    this._data.currency += amount;
    SaveManager.save(this._data);
  }

  unlockPerk(perkId) {
    if (!this._data.unlockedPerks.includes(perkId)) {
      this._data.unlockedPerks.push(perkId);
      SaveManager.save(this._data);
    }
  }

  reset() {
    SaveManager.reset();
    this._data = SaveManager.defaultSave();
  }
}

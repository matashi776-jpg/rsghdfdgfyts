/**
 * PerkSystem.js
 * Manages perk selection and application to modifiers.
 * Launches the perk-selection overlay (PerkScene) then resumes GameScene.
 */
import GameConfig from '../core/GameConfig.js';

export default class PerkSystem {
  /**
   * @param {Phaser.Scene} scene     – GameScene
   * @param {object}       modifiers – shared modifiers object
   */
  constructor(scene, modifiers) {
    this._scene     = scene;
    this.modifiers  = modifiers;
  }

  /**
   * Apply the effect for a given perk ID to the current modifiers.
   * @param {string} perkId
   */
  applyPerk(perkId) {
    switch (perkId) {
      case 'golden_talon':
        this.modifiers.passiveIncome *= 2;
        break;
      case 'techno_pechatka':
        this.modifiers.wallDefense *= 1 / GameConfig.TECHNO_PECHATKA_REDUCTION; // 30% less incoming damage
        break;
      case 'acid_buryak':
        this.modifiers.damage     *= 1.5;
        this.modifiers.acidSplash  = (this.modifiers.acidSplash || 0) + 1;
        break;
      case 'cossack_drive':
        this.modifiers.attackSpeed = Math.max(0.1, this.modifiers.attackSpeed - 0.3);
        break;
      default:
        console.warn(`[PerkSystem] Unknown perk id: ${perkId}`);
    }
  }

  /**
   * Offer the player 3 perks to choose from (shows PerkScene overlay).
   * @param {number} wave – wave that just ended (for title)
   */
  showSelection(wave) {
    this._scene.scene.pause('GameScene');
    this._scene.scene.launch('PerkScene', {
      modifiers: this.modifiers,
      wave,
      perkSystem: this,
    });
  }

  /**
   * Retrieve the global perk definitions from GameConfig.
   * @returns {Array}
   */
  get definitions() {
    return GameConfig.PERKS;
  }
}

/**
 * UISystem.js
 * Manages HUD elements: HP bar, wave counter, gold display.
 */
import GameConfig from '../core/GameConfig.js';

export default class UISystem {
  constructor(scene) {
    this.scene = scene;
    this._elements = {};
  }

  create(player) {
    const { width } = this.scene.scale;
    const P = GameConfig.PALETTE;

    // Wave label
    this._elements.waveText = this.scene.add.text(width / 2, 20, 'Хвиля 1', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#00ffff',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(50).setScrollFactor(0);

    // Gold label
    this._elements.goldText = this.scene.add.text(16, 16, '💰 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#ffff00',
      stroke: '#000',
      strokeThickness: 3,
    }).setDepth(50).setScrollFactor(0);

    // HP bar background + fill
    this._elements.hpBg = this.scene.add.rectangle(16 + 100, 52, 200, 16, 0x220022).setDepth(50).setScrollFactor(0).setOrigin(0, 0.5);
    this._elements.hpFill = this.scene.add.rectangle(16 + 100, 52, 200, 16, P.NEON_PINK).setDepth(51).setScrollFactor(0).setOrigin(0, 0.5);

    this.update(player, 1, 0);
  }

  update(player, wave, gold) {
    if (!this._elements.waveText) return;
    this._elements.waveText.setText(`Хвиля ${wave}`);
    this._elements.goldText.setText(`💰 ${gold}`);
    const ratio = player ? Math.max(0, player.hp / player.maxHP) : 0;
    this._elements.hpFill.setDisplaySize(200 * ratio, 16);
  }

  destroy() {
    Object.values(this._elements).forEach(el => el && el.destroy());
    this._elements = {};
  }
}

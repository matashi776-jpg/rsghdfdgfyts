/**
 * UIScene.js
 * HUD overlay — Оборона Ланчина V5.0 ACID KHUTIR
 * UI Guide (8.6.3): Toxic Green HP bar, Electric Blue wave counter,
 * Neon Pink boss label, Ultra-Violet upgrade button.
 */
import L from '../utils/Localization.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.scale;
    this._lang = 'ua';

    // ── Top neon status line — Electric Blue (8.6.3) ─────────────────────────
    this._statusTxt = this.add.text(width / 2, 10, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      '#0088ff',
      stroke:     '#000033',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#0088ff', blur: 16, fill: true },
    }).setOrigin(0.5, 0).setDepth(20);

    // ── Boss bar label (shown during boss wave) ───────────────────────────────
    this._bossLabelTxt = this.add.text(width / 2, 42, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#ff00aa',
      stroke:     '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00aa', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

    // ── House upgrade button — Ultra-Violet glow (8.6.3) ─────────────────────
    this._upgradeBtn = this.add.text(80, 648, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#8800ff',
      backgroundColor: '#110022',
      padding: { x: 10, y: 5 },
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#8800ff', blur: 12, fill: true },
    }).setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });

    this._upgradeBtn.on('pointerover', () => {
      if (!this._isBattlePaused()) this._upgradeBtn.setColor('#ff00aa');
    });
    this._upgradeBtn.on('pointerout', () => {
      this._upgradeBtn.setColor('#8800ff');
    });
    this._upgradeBtn.on('pointerdown', () => {
      if (this._isBattlePaused()) return;
      const battle = this.scene.get('BattleScene');
      if (!battle) return;
      const cost = this._upgradeCost(battle.houseLevel);
      if (cost > 0 && battle.money >= cost && battle.houseLevel < 3) {
        battle.money -= cost;
        battle.upgradeHouse();
      }
    });

    this._elapsedSec = 0;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _isBattlePaused() {
    return this.scene.isPaused('BattleScene');
  }

  _upgradeCost(currentLevel) {
    if (currentLevel === 1) return 200;
    if (currentLevel === 2) return 500;
    return 0;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(time, delta) {
    const battle = this.scene.get('BattleScene');
    if (!battle || battle.gameOver) return;
    const lang = battle._lang ?? 'ua';

    // Wave counter — Electric Blue (8.6.3)
    const waveLabel = battle.wave <= 3
      ? `${L[lang].wave}: ${battle.wave}  |  ₴${battle.money}`
      : `${L[lang].bossName}  |  ₴${battle.money}`;
    this._statusTxt.setText(waveLabel);

    // Boss bar label
    if (battle.bossActive) {
      this._bossLabelTxt.setVisible(true).setText(L[lang].bossName);
    } else {
      this._bossLabelTxt.setVisible(false);
    }

    // Upgrade button
    const lvl  = battle.houseLevel;
    const cost = this._upgradeCost(lvl);
    const tierNames = ['', 'Затишна Хата', 'Цегляний Дім', 'КІБЕР-ФОРТЕЦЯ'];
    if (lvl >= 3) {
      this._upgradeBtn.setText(`🏰 ${tierNames[3]} — МАКСИМУМ`).setColor('#ff00aa');
    } else {
      const canAfford = battle.money >= cost;
      this._upgradeBtn
        .setText(`⬆ Покращити: ${tierNames[lvl + 1]} (${cost} ₴)`)
        .setColor(canAfford ? '#8800ff' : '#ff4466');
    }
  }
}

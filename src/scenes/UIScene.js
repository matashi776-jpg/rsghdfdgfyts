/**
 * UIScene.js
 * HUD overlay — Оборона Ланчина V4.0 NEON PSYCHEDELIC
 * Displays: "Рівень: [X] | Неон: [₴] | Час: [Y] сек", upgrade button,
 * and boss bar "КІБЕР-БОС: ТОВАРИШ ВАХТЕРША". All text is glowing neon.
 *
 * V4.1: listens to GlobalEvents 'waveChanged' for an animated bounce effect.
 */
import { GlobalEvents } from '../systems/EventBus.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Top neon status line ─────────────────────────────────────────────────
    this._statusTxt = this.add.text(width / 2, 10, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      '#00ffff',
      stroke:     '#000033',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 16, fill: true },
    }).setOrigin(0.5, 0).setDepth(20);

    // ── Boss bar label (shown during wave 10) ────────────────────────────────
    this._bossLabelTxt = this.add.text(width / 2, 42, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

    // ── House upgrade button ─────────────────────────────────────────────────
    this._upgradeBtn = this.add.text(80, 648, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#00ffff',
      backgroundColor: '#110022',
      padding: { x: 10, y: 5 },
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 12, fill: true },
    }).setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });

    this._upgradeBtn.on('pointerover', () => {
      if (!this._isBattlePaused()) this._upgradeBtn.setColor('#ff00ff');
    });
    this._upgradeBtn.on('pointerout', () => {
      this._upgradeBtn.setColor('#00ffff');
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

    // Track elapsed seconds for the timer display
    this._elapsedSec = 0;

    // ── Wave-change animation (driven by GlobalEvents from WaveSystem) ────────
    GlobalEvents.on('waveChanged', (wave) => {
      // Brief neon bounce on the status line to announce the new wave
      this._statusTxt.setScale(1.4);
      this.tweens.add({
        targets:  this._statusTxt,
        scale:    1,
        duration: 300,
        ease:     'Bounce',
      });
    }, this);
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

    // Accumulate wave time in seconds
    if (battle.waveActive && battle.wave !== 10) {
      this._elapsedSec += delta / 1000;
    } else if (!battle.waveActive) {
      this._elapsedSec = 0;
    }

    const secLeft = Math.max(0, Math.ceil(80 - this._elapsedSec));

    // Top status line: "Рівень: X | Неон: ₴ | Час: Y сек"
    this._statusTxt.setText(
      `Рівень: ${battle.wave}  |  Неон: ₴${battle.money}  |  Час: ${secLeft} сек`,
    );

    // Boss bar label (wave 10)
    if (battle.wave === 10 && battle.bossActive) {
      this._bossLabelTxt.setVisible(true).setText('КІБЕР-БОС: ТОВАРИШ ВАХТЕРША');
    } else {
      this._bossLabelTxt.setVisible(false);
    }

    // Upgrade button
    const lvl  = battle.houseLevel;
    const cost = this._upgradeCost(lvl);
    const tierNames = ['', 'Затишна Хата', 'Цегляний Дім', 'КІБЕР-ФОРТЕЦЯ'];
    if (lvl >= 3) {
      this._upgradeBtn.setText(`🏰 ${tierNames[3]} — МАКСИМУМ`).setColor('#ff00ff');
    } else {
      const canAfford = battle.money >= cost;
      this._upgradeBtn
        .setText(`⬆ Покращити: ${tierNames[lvl + 1]} (${cost} ₴)`)
        .setColor(canAfford ? '#00ffff' : '#ff4466');
    }
  }
}

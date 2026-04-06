/**
 * UISystem.js
 * Renders the HUD for ACID KHUTIR:
 *  • Top status line — Wave | Money | Timer
 *  • House HP bar
 *  • Enemy HP bars
 *  • Boss HP bar (wave 10)
 *  • Upgrade button
 */
import GameConfig from '../core/GameConfig.js';

export default class UISystem {
  /**
   * @param {Phaser.Scene} scene – UIScene (or GameScene when used inline)
   */
  constructor(scene) {
    this._scene = scene;
    const { width, height } = scene.scale;

    this._statusTxt = scene.add.text(width / 2, 10, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#00ffff',
      stroke: '#000033',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 16, fill: true },
    }).setOrigin(0.5, 0).setDepth(20);

    this._bossLabelTxt = scene.add.text(width / 2, 42, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

    this._upgradeBtn = scene.add.text(80, 648, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#00ffff',
      backgroundColor: '#110022',
      padding: { x: 10, y: 5 },
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 12, fill: true },
    }).setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });

    this._upgradeBtn.on('pointerover', () => { this._upgradeBtn.setColor('#ff00ff'); });
    this._upgradeBtn.on('pointerout',  () => { this._upgradeBtn.setColor('#00ffff'); });
    this._upgradeBtn.on('pointerdown', () => { this._tryUpgrade(); });

    this._hpGfx      = scene.add.graphics().setDepth(10);
    this._bossBarGfx  = scene.add.graphics().setDepth(10);
    this._timerGfx    = scene.add.graphics().setDepth(10);
    this._elapsedSec  = 0;
  }

  // ── Update each frame ─────────────────────────────────────────────────────

  /**
   * @param {object} battle – reference to the GameScene (or data object)
   * @param {number} delta  – ms since last frame
   */
  update(battle, delta) {
    if (!battle || battle.gameOver) return;

    if (battle.waveActive && battle.wave !== GameConfig.BOSS_WAVE) {
      this._elapsedSec += delta / 1000;
    } else if (!battle.waveActive) {
      this._elapsedSec = 0;
    }

    const secLeft = Math.max(0, Math.ceil(GameConfig.WAVE_DURATION / 1000 - this._elapsedSec));

    this._statusTxt.setText(
      `Хвиля: ${battle.wave}  |  Неон: ₴${battle.money}  |  Час: ${secLeft} сек`,
    );

    if (battle.wave === GameConfig.BOSS_WAVE && battle.bossActive) {
      this._bossLabelTxt.setVisible(true).setText('КІБЕР-БОС: ТОВАРИШ ВАХТЕРША');
    } else {
      this._bossLabelTxt.setVisible(false);
    }

    this._updateUpgradeBtn(battle);
    this._drawHouseHpBar(battle);
    this._drawWaveTimerBar(battle);
  }

  // ── House HP bar ──────────────────────────────────────────────────────────

  _drawHouseHpBar(battle) {
    if (!battle.house) return;
    const bx    = battle.house.x - 60;
    const by    = battle.house.y + (battle.house.displayHeight || 100) / 2 + 6;
    const ratio = Math.max(0, battle.houseHP / battle.houseMaxHP);
    this._hpGfx.clear();
    this._hpGfx.fillStyle(0x110022, 0.8);
    this._hpGfx.fillRect(bx, by, 120, 8);
    const barColor = ratio > 0.5 ? 0x00ff88 : ratio > 0.25 ? 0xffaa00 : 0xff2200;
    this._hpGfx.fillStyle(barColor, 1);
    this._hpGfx.fillRect(bx, by, Math.floor(120 * ratio), 8);
    this._hpGfx.lineStyle(1, 0x00ffff, 0.5);
    this._hpGfx.strokeRect(bx, by, 120, 8);
  }

  // ── Wave timer bar ────────────────────────────────────────────────────────

  _drawWaveTimerBar(battle) {
    const { width } = this._scene.scale;
    if (battle.waveActive && battle.wave !== GameConfig.BOSS_WAVE) {
      const ratio = Math.min(1, this._elapsedSec / (GameConfig.WAVE_DURATION / 1000));
      this._timerGfx.clear();
      this._timerGfx.fillStyle(0x110022, 0.7);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440, 10);
      this._timerGfx.fillStyle(0xff00ff, 1);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440 * (1 - ratio), 10);
      this._timerGfx.lineStyle(1, 0xff00ff, 0.6);
      this._timerGfx.strokeRect(width / 2 - 220, 38, 440, 10);
    } else {
      this._timerGfx.clear();
    }
  }

  // ── Upgrade button ────────────────────────────────────────────────────────

  _upgradeCost(level) {
    if (level === 1) return 200;
    if (level === 2) return 500;
    return 0;
  }

  _updateUpgradeBtn(battle) {
    const lvl  = battle.houseLevel;
    const cost = this._upgradeCost(lvl);
    const names = ['', 'Затишна Хата', 'Цегляний Дім', 'КІБЕР-ФОРТЕЦЯ'];
    if (lvl >= 3) {
      this._upgradeBtn.setText(`🏰 ${names[3]} — МАКСИМУМ`).setColor('#ff00ff');
    } else {
      const canAfford = battle.money >= cost;
      this._upgradeBtn
        .setText(`⬆ Покращити: ${names[lvl + 1]} (${cost} ₴)`)
        .setColor(canAfford ? '#00ffff' : '#ff4466');
    }
  }

  _tryUpgrade() {
    const battle = this._scene.scene
      ? this._scene.scene.get('GameScene')
      : this._scene;
    if (!battle || battle.scene.isPaused('GameScene')) return;
    const cost = this._upgradeCost(battle.houseLevel);
    if (cost > 0 && battle.money >= cost && battle.houseLevel < 3) {
      battle.money -= cost;
      battle.upgradeHouse();
    }
  }
}

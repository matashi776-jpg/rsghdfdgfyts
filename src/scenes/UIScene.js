/**
 * UIScene.js
 * HUD overlay — Acid Khutir V5.0 NEON PSYCHEDELIC CYBER-FOLK
 * UI Style Guide: dark bg, neon text, pulse + glitch animations.
 *
 * Displays: "Хвиля: [X] | Неон: ₴[Y] | Час: [Z] сек"
 * Upgrade button, boss bar "КІБЕР-БОС: ТОВ. ВАХТЕРША"
 *
 * Art Bible palette:
 *   Electric Blue  #00CFFF — UI primary
 *   Cyber-Amber    #FFB300 — money / gold
 *   Neon Pink      #FF00D4 — boss bar, warnings
 *   Toxic Green    #39FF14 — house HP high
 *   Deep Indigo    #0A0014 — UI backgrounds
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Top neon status line (Electric Blue — Art Bible UI primary) ──────────
    this._statusTxt = this.add.text(width / 2, 10, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      '#00CFFF',
      stroke:     '#0A0014',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#00CFFF', blur: 18, fill: true },
    }).setOrigin(0.5, 0).setDepth(20);

    // ── Glitch pulse on status text ──────────────────────────────────────────
    this._glitchTimer = this.time.addEvent({
      delay: 3200,
      loop:  true,
      callbackScope: this,
      callback: this._doGlitch,
    });

    // ── Boss bar label (Neon Pink — shown during wave 10) ─────────────────────
    this._bossLabelTxt = this.add.text(width / 2, 42, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#FF00D4',
      stroke:     '#0A0014',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#FF00D4', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

    // Pulsing scale tween on boss label
    this.tweens.add({
      targets:  this._bossLabelTxt,
      scaleX:   1.04,
      scaleY:   1.04,
      duration: 600,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    // ── House upgrade button (Electric Blue / Cyber-Amber) ───────────────────
    this._upgradeBtn = this.add.text(80, 648, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#00CFFF',
      backgroundColor: '#0A0014',
      padding: { x: 10, y: 5 },
      stroke:     '#0A0014',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00CFFF', blur: 12, fill: true },
    }).setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });

    this._upgradeBtn.on('pointerover', () => {
      if (!this._isBattlePaused()) this._upgradeBtn.setColor('#FF00D4');
    });
    this._upgradeBtn.on('pointerout', () => {
      this._upgradeBtn.setColor('#00CFFF');
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
  }

  // ─── Glitch effect on status text ─────────────────────────────────────────

  _doGlitch() {
    if (!this._statusTxt) return;
    const orig = this._statusTxt.x;
    this._statusTxt.setX(orig + 3).setAlpha(0.7);
    this.time.delayedCall(50, () => {
      if (!this._statusTxt) return;
      this._statusTxt.setX(orig - 2).setAlpha(0.9).setColor('#FF00D4');
    });
    this.time.delayedCall(100, () => {
      if (!this._statusTxt) return;
      this._statusTxt.setX(orig).setAlpha(1).setColor('#00CFFF');
    });
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

    // Top status line — Electric Blue for labels, Cyber-Amber for money value
    this._statusTxt.setText(
      `Хвиля: ${battle.wave}  |  ₴${battle.money}  |  Час: ${secLeft} сек`,
    );

    // Boss bar label (wave 10)
    if (battle.wave === 10 && battle.bossActive) {
      this._bossLabelTxt.setVisible(true).setText('КІБЕР-БОС: ТОВ. ВАХТЕРША');
    } else {
      this._bossLabelTxt.setVisible(false);
    }

    // Upgrade button
    const lvl  = battle.houseLevel;
    const cost = this._upgradeCost(lvl);
    // Art Bible house tier names
    const tierNames = ['', 'Затишна Хата (Традиція)', 'Укріплена Хата', 'КІБЕР-СІЧ'];
    if (lvl >= 3) {
      this._upgradeBtn.setText(`🏰 ${tierNames[3]} — МАКСИМУМ`).setColor('#FF00D4');
    } else {
      const canAfford = battle.money >= cost;
      this._upgradeBtn
        .setText(`⬆ Покращити: ${tierNames[lvl + 1]} (${cost} ₴)`)
        .setColor(canAfford ? '#FFB300' : '#FF0033'); // Cyber-Amber if can afford, Plasma Red if not
    }
  }
}

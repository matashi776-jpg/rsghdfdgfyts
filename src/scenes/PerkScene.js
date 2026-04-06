/**
 * PerkScene.js
 * Roguelike perk-selection overlay.
 *
 * Launched (not started) by BattleScene after waves 5 and 10.
 * BattleScene is paused while this scene is active.
 * Player picks one of 3 randomly drawn perk cards.
 * On selection the chosen perk mutates BattleScene.modifiers directly
 * (objects are passed by reference), this scene stops, and BattleScene resumes.
 *
 * All text is in Ukrainian.
 */

const ALL_PERKS = [
  {
    name:      'Радіоактивний Буряк',
    desc:      'Атака +50%',
    color:     0x1a4a1a,
    accent:    0x44dd44,
    textColor: '#88ff88',
    effect: (mod) => { mod.damage += 0.5; },
  },
  {
    name:      'Золотий Талон',
    desc:      'Пасивний прибуток ×2',
    color:     0x3a2a00,
    accent:    0xffcc00,
    textColor: '#ffdd44',
    effect: (mod) => { mod.passiveIncome += 1.0; },
  },
  {
    name:      'Козацький Драйв',
    desc:      'Швидкість атаки +30%',
    color:     0x0a1a3a,
    accent:    0x4488ff,
    textColor: '#88aaff',
    effect: (mod) => { mod.attackSpeed = Math.max(0.1, mod.attackSpeed - 0.3); },
  },
  {
    name:      'Чавунна Печатка',
    desc:      'Захист стін +50%',
    color:     0x2a1500,
    accent:    0xff8833,
    textColor: '#ffaa66',
    effect: (mod) => { mod.wallDefense += 0.5; },
  },
];

export default class PerkScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PerkScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init(data) {
    // `data.modifiers` is the live reference from BattleScene — mutating it
    // mutates BattleScene.modifiers directly.
    this.modifiers = data.modifiers;
    this.wave      = data.wave;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // Semi-transparent dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78);

    // Title
    this.add.text(width / 2, height * 0.12, `Хвиля ${this.wave} завершена!`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '34px',
      color:      '#ffee00',
    }).setOrigin(0.5).setStroke('#000000', 7);

    this.add.text(width / 2, height * 0.22, 'Обери здібність:', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '24px',
      color:      '#ffffff',
    }).setOrigin(0.5).setStroke('#000000', 5);

    // Draw 3 random cards
    const shuffled = Phaser.Utils.Array.Shuffle(ALL_PERKS.slice());
    const chosen   = shuffled.slice(0, 3);

    const CARD_W  = 290;
    const CARD_H  = 310;
    const GAP     = 44;
    const totalW  = CARD_W * 3 + GAP * 2;
    const startX  = (width - totalW) / 2 + CARD_W / 2;
    const cardY   = height / 2 + 40;

    chosen.forEach((perk, i) => {
      const cx = startX + i * (CARD_W + GAP);
      this._createCard(cx, cardY, CARD_W, CARD_H, perk);
    });
  }

  // ─── Card Builder ─────────────────────────────────────────────────────────

  _createCard(cx, cy, w, h, perk) {
    const container = this.add.container(cx, cy);

    // ── Background graphic ─────────────────────────────────────────────────
    const gfx = this.add.graphics();
    this._paintCard(gfx, w, h, perk.color, perk.accent, 1);
    container.add(gfx);

    // ── Perk name ──────────────────────────────────────────────────────────
    const nameTxt = this.add.text(0, -h / 2 + 44, perk.name, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      perk.textColor,
      wordWrap:   { width: w - 24 },
      align:      'center',
    }).setOrigin(0.5, 0.5);
    container.add(nameTxt);

    // ── Perk description ───────────────────────────────────────────────────
    const descTxt = this.add.text(0, 16, perk.desc, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '19px',
      color:      '#dddddd',
      wordWrap:   { width: w - 24 },
      align:      'center',
    }).setOrigin(0.5, 0.5);
    container.add(descTxt);

    // ── "Обрати" label ─────────────────────────────────────────────────────
    const pickTxt = this.add.text(0, h / 2 - 36, 'ОБРАТИ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '17px',
      color:      '#ffffff',
    }).setOrigin(0.5).setAlpha(0);
    container.add(pickTxt);

    // ── Interactive zone (screen-space, not container-space) ───────────────
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets:  container,
        scaleX:   1.06,
        scaleY:   1.06,
        duration: 140,
        ease:     'Sine.easeOut',
      });
      this._paintCard(gfx, w, h, perk.color, perk.accent, 1.5);
      this.tweens.add({ targets: pickTxt, alpha: 1, duration: 120 });
    });

    zone.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets:  container,
        scaleX:   1,
        scaleY:   1,
        duration: 140,
        ease:     'Sine.easeOut',
      });
      this._paintCard(gfx, w, h, perk.color, perk.accent, 1);
      this.tweens.add({ targets: pickTxt, alpha: 0, duration: 120 });
    });

    zone.on('pointerdown', () => {
      perk.effect(this.modifiers);
      this._confirmSelection();
    });
  }

  /** Redraws the card graphic; brightness multiplies fill channel intensities. */
  _paintCard(gfx, w, h, fillColor, accentColor, brightness) {
    gfx.clear();
    const c  = Phaser.Display.Color.IntegerToColor(fillColor);
    const r  = Math.min(255, Math.round(c.red   * brightness));
    const g  = Math.min(255, Math.round(c.green * brightness));
    const b  = Math.min(255, Math.round(c.blue  * brightness));
    const fc = Phaser.Display.Color.GetColor(r, g, b);
    gfx.fillStyle(fc, 0.92);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    gfx.lineStyle(3, accentColor, 0.9);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
  }

  // ─── Selection Flow ───────────────────────────────────────────────────────

  _confirmSelection() {
    // Brief flash effect
    const flash = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0xffffff, 0.5,
    ).setDepth(50);
    this.tweens.add({ targets: flash, alpha: 0, duration: 350 });

    this.cameras.main.fadeOut(450);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const battle = this.scene.get('BattleScene');
      // Increment wave and restart wave loop inside BattleScene
      battle.resumeFromPerk();
      this.scene.stop();
      this.scene.resume('BattleScene');
    });
  }
}

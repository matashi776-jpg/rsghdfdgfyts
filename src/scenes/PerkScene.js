/**
 * PerkScene.js
 * Neon Psychedelic perk-selection overlay — Оборона Ланчина V4.0
 *
 * Shows 3 stylized neon cards every 5 waves.
 * Perks (as specified):
 *   - Золотий Талон    — passive money generation ×2
 *   - Техно-Печатка    — house takes 30% less damage
 *   - Кислотний Буряк  — bullet damage ×1.5 + acid splash (extra AOE damage)
 *
 * All text is glowing neon (Cyan / Magenta).
 */

const ALL_PERKS = [
  {
    name:      'Золотий Талон',
    desc:      '💰 Пасивний прибуток ×2\n(Нео-монети течуть самі!)',
    color:     0x2a1a00,
    accent:    0xffcc00,
    textColor: '#ffdd44',
    glowColor: '#ffcc00',
    effect: (mod) => { mod.passiveIncome *= 2; },
  },
  {
    name:      'Техно-Печатка',
    desc:      '🛡 Хутір отримує на 30% менше шкоди\n(Нано-щит активовано!)',
    color:     0x001a33,
    accent:    0x00ffff,
    textColor: '#00ffff',
    glowColor: '#00ffff',
    // House takes 30% less damage: wallDefense acts as divisor in damage formula,
    // so multiplying by 1/0.7 ≈ 1.43 reduces incoming damage to 70% of original.
    effect: (mod) => { mod.wallDefense *= (1 / 0.7); },
  },
  {
    name:      'Кислотний Буряк',
    desc:      '⚗ Шкода кулі ×1.5\n+ Кислотний сплеск (AOE)',
    color:     0x1a0022,
    accent:    0xff00aa,
    textColor: '#ff44ff',
    glowColor: '#ff00aa',
    effect: (mod) => {
      mod.damage *= 1.5;
      mod.acidSplash = (mod.acidSplash || 0) + 1;
    },
  },
  {
    name:      'Козацький Драйв',
    desc:      '⚡ Швидкість атаки +30%\n(Сергій в кайфі!)',
    color:     0x001122,
    accent:    0x4488ff,
    textColor: '#88aaff',
    glowColor: '#4488ff',
    effect: (mod) => { mod.attackSpeed = Math.max(0.1, mod.attackSpeed - 0.3); },
  },
];

export default class PerkScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PerkScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init(data) {
    this.modifiers = data.modifiers;
    this.wave      = data.wave;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // Dark neon overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82);

    // Neon grid lines
    const grid = this.add.graphics().setAlpha(0.08);
    for (let y = 0; y < height; y += 8) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // Title — neon cyan
    this.add.text(width / 2, height * 0.10, `Хвиля ${this.wave} завершена!`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '36px',
      color:      '#00ffff',
      stroke:     '#000033',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 22, fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.20, 'ОБЕРИ ЗДІБНІСТЬ:', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '26px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 18, fill: true },
    }).setOrigin(0.5);

    // Always show the 3 required perks (first 3 from ALL_PERKS)
    const chosen = ALL_PERKS.slice(0, 3);

    const CARD_W  = 300;
    const CARD_H  = 320;
    const GAP     = 40;
    const totalW  = CARD_W * 3 + GAP * 2;
    const startX  = (width - totalW) / 2 + CARD_W / 2;
    const cardY   = height / 2 + 50;

    chosen.forEach((perk, i) => {
      const cx = startX + i * (CARD_W + GAP);
      this._createCard(cx, cardY, CARD_W, CARD_H, perk);
    });
  }

  // ─── Card Builder ─────────────────────────────────────────────────────────

  _createCard(cx, cy, w, h, perk) {
    const container = this.add.container(cx, cy);

    const gfx = this.add.graphics();
    this._paintCard(gfx, w, h, perk.color, perk.accent, 1);
    container.add(gfx);

    // Perk name — neon glow
    const nameTxt = this.add.text(0, -h / 2 + 48, perk.name, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      perk.textColor,
      wordWrap:   { width: w - 24 },
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: perk.glowColor, blur: 16, fill: true },
    }).setOrigin(0.5, 0.5);
    container.add(nameTxt);

    // Perk description
    const descTxt = this.add.text(0, 20, perk.desc, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '17px',
      color:      '#ddddee',
      wordWrap:   { width: w - 28 },
      align:      'center',
    }).setOrigin(0.5, 0.5);
    container.add(descTxt);

    // "Обрати" label
    const pickTxt = this.add.text(0, h / 2 - 38, 'ОБРАТИ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '18px',
      color:      perk.textColor,
      shadow: { offsetX: 0, offsetY: 0, color: perk.glowColor, blur: 18, fill: true },
    }).setOrigin(0.5).setAlpha(0);
    container.add(pickTxt);

    // Interactive zone
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets:  container,
        scaleX:   1.07,
        scaleY:   1.07,
        duration: 130,
        ease:     'Sine.easeOut',
      });
      this._paintCard(gfx, w, h, perk.color, perk.accent, 1.6);
      this.tweens.add({ targets: pickTxt, alpha: 1, duration: 110 });
    });

    zone.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets:  container,
        scaleX:   1,
        scaleY:   1,
        duration: 130,
        ease:     'Sine.easeOut',
      });
      this._paintCard(gfx, w, h, perk.color, perk.accent, 1);
      this.tweens.add({ targets: pickTxt, alpha: 0, duration: 110 });
    });

    zone.on('pointerdown', () => {
      perk.effect(this.modifiers);
      this._confirmSelection();
    });
  }

  _paintCard(gfx, w, h, fillColor, accentColor, brightness) {
    gfx.clear();
    const c  = Phaser.Display.Color.IntegerToColor(fillColor);
    const r  = Math.min(255, Math.round(c.red   * brightness));
    const g  = Math.min(255, Math.round(c.green * brightness));
    const b  = Math.min(255, Math.round(c.blue  * brightness));
    const fc = Phaser.Display.Color.GetColor(r, g, b);
    gfx.fillStyle(fc, 0.94);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    gfx.lineStyle(3, accentColor, 0.95);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    // Inner neon border glow
    gfx.lineStyle(1, accentColor, 0.35);
    gfx.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 12);
  }

  // ─── Selection Flow ───────────────────────────────────────────────────────

  _confirmSelection() {
    // Neon flash
    const flash = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0xff00ff, 0.45,
    ).setDepth(50);
    this.tweens.add({ targets: flash, alpha: 0, duration: 380 });

    this.cameras.main.fadeOut(460, 0, 0, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const battle = this.scene.get('BattleScene');
      battle.resumeFromPerk();
      this.scene.stop();
      this.scene.resume('BattleScene');
    });
  }
}

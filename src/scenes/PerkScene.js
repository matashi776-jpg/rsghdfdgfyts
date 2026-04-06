/**
 * PerkScene.js
 * Neon Psychedelic perk-selection overlay — Оборона Ланчина V4.0
 *
 * Shows 3 random neon cards every 5 waves.
 *
 * Full perk roster (Part 4 — Balance & Perks):
 *   - Золотий Талон    — +100% gold, golden explosion sparks
 *   - Кислотний Буряк  — poison bullets (5 dmg/s) + 20% slow
 *   - Залізна Печатка  — shield reflects 10% damage back to enemies
 *   - Кібер-Рушник     — +20% fire rate, neon bullet trails
 *   - Вибух Трембіти   — sound-wave blast every 10 s, knockback
 *   - Фолк-Овердрайв   — all stats +10% for 8 s (repeating buff)
 *
 * All text is glowing neon (Cyan / Magenta).
 */

const ALL_PERKS = [
  // ── Golden Coupon ──────────────────────────────────────────────────────────
  {
    id:        'goldenCoupon',
    name:      'Золотий Талон',
    desc:      '💰 +100% золота з ворогів\nВороги вибухають золотими іскрами\nЗолото притягується магнітом',
    color:     0x2a1a00,
    accent:    0xffcc00,
    textColor: '#ffdd44',
    glowColor: '#ffcc00',
    effect: (mod) => {
      mod.goldMultiplier = (mod.goldMultiplier || 1) * 2;
      mod.goldenExplosion = true;
    },
  },
  // ── Radioactive Beet ───────────────────────────────────────────────────────
  {
    id:        'radioactiveBeet',
    name:      'Кислотний Буряк',
    desc:      '☢ Кулі накладають отруту (5 шк/с)\nОтрута уповільнює ворогів на 20%\nВороги світяться фіолетовим',
    color:     0x1a0022,
    accent:    0xff00aa,
    textColor: '#ff44ff',
    glowColor: '#ff00aa',
    effect: (mod) => {
      mod.poisonDPS  = (mod.poisonDPS  || 0) + 5;
      mod.poisonSlow = Math.min(0.8, (mod.poisonSlow || 0) + 0.2);
    },
  },
  // ── Iron Seal ──────────────────────────────────────────────────────────────
  {
    id:        'ironSeal',
    name:      'Залізна Печатка',
    desc:      '🛡 Хутір отримує щит-рушник\nВідбиває 10% шкоди назад ворогам\nЩит пульсує в такт музиці',
    color:     0x001a33,
    accent:    0x00ffff,
    textColor: '#00ffff',
    glowColor: '#00ffff',
    effect: (mod) => {
      mod.reflectPercent = Math.min(0.5, (mod.reflectPercent || 0) + 0.10);
      // Backward-compat: keep wallDefense bonus for legacy damage formula
      mod.wallDefense *= (1 / 0.9);
    },
  },
  // ── Cyber-Rushnyk ──────────────────────────────────────────────────────────
  {
    id:        'cyberRushnyk',
    name:      'Кібер-Рушник',
    desc:      '⚡ Швидкість стрільби +20%\nКулі залишають неоновий слід\n(Сергій в кайфі!)',
    color:     0x001122,
    accent:    0x4488ff,
    textColor: '#88aaff',
    glowColor: '#4488ff',
    effect: (mod) => {
      mod.attackSpeed  = Math.max(0.1, (mod.attackSpeed || 1) * 0.8);
      mod.neonTrail    = true;
    },
  },
  // ── Trembita Blast ─────────────────────────────────────────────────────────
  {
    id:        'trembitaBlast',
    name:      'Вибух Трембіти',
    desc:      '📯 Кожні 10 сек — звукова хвиля\nВідкидає ворогів назад\n(Боюфи тікають від звуку!)',
    color:     0x1a0a00,
    accent:    0xff8800,
    textColor: '#ffaa44',
    glowColor: '#ff8800',
    effect: (mod) => {
      mod.trembitaBlast = true;
    },
  },
  // ── Folk Overdrive ─────────────────────────────────────────────────────────
  {
    id:        'folkOverdrive',
    name:      'Фолк-Овердрайв',
    desc:      '🎵 Музика прискорюється\nВсі характеристики +10% на 8 с\n(Повторюється кожні 20 с)',
    color:     0x00150a,
    accent:    0x00ff88,
    textColor: '#44ffaa',
    glowColor: '#00ff88',
    effect: (mod) => {
      mod.folkOverdrive = true;
    },
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

    // Show 3 randomly chosen distinct perks each time
    const shuffled = ALL_PERKS.slice().sort(() => Math.random() - 0.5);
    const chosen   = shuffled.slice(0, 3);

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

/**
 * PerkSystem.js
 * Amulet selection cards between waves — ACID KHUTIR Stage 1
 * Each amulet card shows bonus in neon-psychedelic cyber-folk style
 * with sun symbols (Olena), runic patterns (Serhiy), or craft icons (Mykhas).
 */

const AMULETS = [
  {
    id:      'damage_up',
    label:   '🌟 Сонячний Амулет',
    bonus:   '+25% Урон',
    symbol:  '☀',
    color:   0x1a0800,
    accent:  0xffaa00,
    text:    '#ffcc44',
    glow:    '#ffaa00',
    apply:   (scene) => { scene.projectileSystem.damage *= 1.25; },
  },
  {
    id:      'speed_up',
    label:   '💨 Вітровий Амулет',
    bonus:   '+20% Швидкість',
    symbol:  '⚡',
    color:   0x001a22,
    accent:  0x00ffcc,
    text:    '#44ffee',
    glow:    '#00ffcc',
    apply:   (scene) => { scene.player.speed *= 1.20; },
  },
  {
    id:      'hp_restore',
    label:   '🌿 Цілющий Амулет',
    bonus:   'Відновити 30% HP',
    symbol:  '✦',
    color:   0x001500,
    accent:  0x44ff88,
    text:    '#88ffaa',
    glow:    '#44ff88',
    apply:   (scene) => {
      scene.player.hp = Math.min(
        scene.player.maxHp,
        scene.player.hp + scene.player.maxHp * 0.3,
      );
    },
  },
  {
    id:      'fire_rate',
    label:   '🔥 Рунічний Амулет',
    bonus:   '+30% Швидкість вогню',
    symbol:  'ᚱ',
    color:   0x1a0011,
    accent:  0xff44ff,
    text:    '#ff88ff',
    glow:    '#ff44ff',
    apply:   (scene) => { scene.player.fireRate *= 0.70; },
  },
  {
    id:      'shield',
    label:   '🛡 Щит Майстра',
    bonus:   'Тимчасовий щит (10 сек)',
    symbol:  '⬡',
    color:   0x001133,
    accent:  0x4488ff,
    text:    '#88aaff',
    glow:    '#4488ff',
    apply:   (scene) => { scene.player.shieldUntil = scene.time.now + 10000; },
  },
];

export default class PerkSystem {
  constructor(scene) {
    this.scene    = scene;
    this._overlay = null;
  }

  offerPerks() {
    const { width, height } = this.scene.scale;

    // Pause physics
    this.scene.physics.pause();

    // Dark neon overlay
    this._overlay = this.scene.add.rectangle(
      width / 2, height / 2, width, height, 0x000000, 0.80,
    ).setDepth(80).setInteractive();

    // Scanline grid
    const grid = this.scene.add.graphics().setDepth(80).setAlpha(0.06);
    for (let y = 0; y < height; y += 7) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // Title
    this.scene.add.text(width / 2, height * 0.14, 'ОБЕРИ АМУЛЕТ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '46px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 26, fill: true },
    }).setOrigin(0.5).setDepth(82);

    this.scene.add.text(width / 2, height * 0.22, 'Кожен амулет дає унікальну силу', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '16px',
      color:      '#9988bb',
    }).setOrigin(0.5).setDepth(82);

    // Pick 3 random amulets
    const pool    = Phaser.Utils.Array.Shuffle([...AMULETS]).slice(0, 3);
    const CARD_W  = 280;
    const CARD_H  = 300;
    const GAP     = 38;
    const totalW  = CARD_W * 3 + GAP * 2;
    const startX  = (width - totalW) / 2 + CARD_W / 2;
    const cardY   = height * 0.57;

    pool.forEach((amulet, i) => {
      const cx = startX + i * (CARD_W + GAP);
      this._createAmuletCard(cx, cardY, CARD_W, CARD_H, amulet);
    });
  }

  _createAmuletCard(cx, cy, w, h, amulet) {
    const gfx = this.scene.add.graphics().setDepth(81);
    this._paintAmuletCard(gfx, cx, cy, w, h, amulet.color, amulet.accent, 1);

    // Large symbol (sun, rune, nature icon)
    this.scene.add.text(cx, cy - h / 2 + 58, amulet.symbol, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '48px',
      color:      amulet.text,
      shadow: { offsetX: 0, offsetY: 0, color: amulet.glow, blur: 22, fill: true },
    }).setOrigin(0.5).setDepth(83);

    // Amulet name
    this.scene.add.text(cx, cy - h / 2 + 120, amulet.label, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '17px',
      color:      amulet.text,
      wordWrap:   { width: w - 28 },
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: amulet.glow, blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(83);

    // Bonus text
    this.scene.add.text(cx, cy - h / 2 + 170, amulet.bonus, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      '#ffffff',
      stroke:     '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(83);

    // "Обрати" label (appears on hover)
    const pickTxt = this.scene.add.text(cx, cy + h / 2 - 36, 'ВЗЯТИ АМУЛЕТ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '16px',
      color:      amulet.text,
      shadow: { offsetX: 0, offsetY: 0, color: amulet.glow, blur: 18, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(83);

    // Interactive zone
    const zone = this.scene.add.zone(cx, cy, w, h)
      .setInteractive({ useHandCursor: true })
      .setDepth(84);

    zone.on('pointerover', () => {
      this._paintAmuletCard(gfx, cx, cy, w, h, amulet.color, amulet.accent, 1.7);
      this.scene.tweens.add({ targets: pickTxt, alpha: 1, duration: 100 });
    });
    zone.on('pointerout', () => {
      this._paintAmuletCard(gfx, cx, cy, w, h, amulet.color, amulet.accent, 1);
      this.scene.tweens.add({ targets: pickTxt, alpha: 0, duration: 100 });
    });
    zone.on('pointerdown', () => this._selectAmulet(amulet));
  }

  _paintAmuletCard(gfx, cx, cy, w, h, fillColor, accentColor, brightness) {
    gfx.clear();
    const c = Phaser.Display.Color.IntegerToColor(fillColor);
    const r = Math.min(255, Math.round(c.red   * brightness));
    const g = Math.min(255, Math.round(c.green * brightness));
    const b = Math.min(255, Math.round(c.blue  * brightness));
    const fc = Phaser.Display.Color.GetColor(r, g, b);

    gfx.fillStyle(fc, 0.95);
    gfx.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);

    gfx.lineStyle(3, accentColor, 0.95 * brightness);
    gfx.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);

    // Inner glow border
    gfx.lineStyle(1, accentColor, 0.32 * brightness);
    gfx.strokeRoundedRect(cx - w / 2 + 5, cy - h / 2 + 5, w - 10, h - 10, 12);

    // Decorative top ornament line
    gfx.lineStyle(1, accentColor, 0.5 * brightness);
    gfx.moveTo(cx - w / 2 + 24, cy - h / 2 + 26);
    gfx.lineTo(cx + w / 2 - 24, cy - h / 2 + 26);
    gfx.strokePath();
  }

  _selectAmulet(amulet) {
    amulet.apply(this.scene);

    // Neon flash
    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0xff00ff, 0.4,
    ).setDepth(90);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 360 });

    // Remove all perk/overlay objects (depth ≥ 80)
    this.scene.children.getAll().forEach(child => {
      if (child.depth >= 80) child.destroy();
    });

    this.scene.physics.resume();
    this.scene.waveSystem.startWave(this.scene.wave);
  }
}

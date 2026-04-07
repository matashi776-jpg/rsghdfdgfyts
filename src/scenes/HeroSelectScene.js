/**
 * HeroSelectScene.js
 * Hero selection screen — choose between Serhiy, Olena, and Mykhas.
 * Neon psychedelic cyber-folk aesthetic: dark background, thick neon outlines,
 * flat neon colours, portrait cards with stat bars and descriptions.
 */
export default class HeroSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HeroSelectScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Dark neon background
    this.add.rectangle(width / 2, height / 2, width, height, 0x050010);

    // Scanline grid (cyber-folk atmosphere)
    const grid = this.add.graphics().setAlpha(0.07);
    for (let y = 0; y < height; y += 7) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // Animated corner ornaments
    this._drawCornerOrnaments(width, height);

    // Title
    this.add.text(width / 2, height * 0.11, 'ОБЕРИ ГЕРОЯ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '52px',
      color:      '#ff00ff',
      stroke:     '#000033',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 30, fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.19, 'Оборона Ланчина — Кіберфолк Стиль', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '16px',
      color:      '#8888bb',
      stroke:     '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Hero definitions
    const heroes = [
      {
        key:     'serhiy',
        name:    'Сергій',
        height:  '185 см',
        desc:    'Мужній захисник Ланчина.\nПосох з руновими золотими узорами.\nЗбалансований боєць.',
        color:   0x1a0033,
        accent:  0x00ffcc,
        tint:    0xff00cc,
        portrait: 'player_serhiy_full',
        stats:   { hp: 100, spd: 220, atk: 350 },
        role:    '⚡ Збалансований',
      },
      {
        key:     'olena',
        name:    'Олена',
        height:  '170 см',
        desc:    'Елегантна мисткиня природи.\nОрбітальна квіткова магія.\nВища швидкість вогню.',
        color:   0x2a0a00,
        accent:  0xff8844,
        tint:    0xff6600,
        portrait: 'player_olena_full',
        stats:   { hp: 90, spd: 200, atk: 280 },
        role:    '🌸 Мисткиня',
      },
      {
        key:     'mykhas',
        name:    'Михась',
        height:  '160 см',
        desc:    'Майстер ремесел і пасток.\nМагічне ядро атакує ворогів.\nНайбільший запас HP.',
        color:   0x0a0022,
        accent:  0x44ff88,
        tint:    0x9900ff,
        portrait: 'player_mykhas_full',
        stats:   { hp: 130, spd: 170, atk: 480 },
        role:    '🔧 Ремісник',
      },
    ];

    const CARD_W = 310;
    const CARD_H = 440;
    const GAP    = 42;
    const totalW = CARD_W * 3 + GAP * 2;
    const startX = (width - totalW) / 2 + CARD_W / 2;
    const cardY  = height * 0.575;

    heroes.forEach((hero, i) => {
      this._buildHeroCard(startX + i * (CARD_W + GAP), cardY, CARD_W, CARD_H, hero);
    });
  }

  // ── Card Builder ──────────────────────────────────────────────────────────

  _buildHeroCard(cx, cy, w, h, hero) {
    const gfx = this.add.graphics();
    this._paintCard(gfx, cx, cy, w, h, hero.color, hero.accent, 1);

    // Portrait image
    this.add.image(cx, cy - h / 2 + 88, hero.portrait)
      .setDisplaySize(90, 130)
      .setDepth(2)
      .setTint(hero.tint);

    // Role badge
    this.add.text(cx, cy - h / 2 + 168, hero.role, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      `#${hero.accent.toString(16).padStart(6, '0')}`,
      shadow: { offsetX: 0, offsetY: 0, color: `#${hero.accent.toString(16).padStart(6, '0')}`, blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(2);

    // Hero name
    this.add.text(cx, cy - h / 2 + 198, hero.name, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '28px',
      color:      `#${hero.accent.toString(16).padStart(6, '0')}`,
      stroke:     '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: `#${hero.accent.toString(16).padStart(6, '0')}`, blur: 18, fill: true },
    }).setOrigin(0.5).setDepth(2);

    // Height
    this.add.text(cx, cy - h / 2 + 224, hero.height, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#7788aa',
    }).setOrigin(0.5).setDepth(2);

    // Description
    this.add.text(cx, cy - h / 2 + 272, hero.desc, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '14px',
      color:      '#ccccee',
      align:      'center',
      wordWrap:   { width: w - 36 },
    }).setOrigin(0.5).setDepth(2);

    // Stat bars
    this._buildStatBars(cx, cy + h / 2 - 110, w - 48, hero.stats, hero.accent);

    // "Обрати" button
    const btn = this.add.text(cx, cy + h / 2 - 36, '[ ОБРАТИ ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '19px',
      color:      `#${hero.accent.toString(16).padStart(6, '0')}`,
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: `#${hero.accent.toString(16).padStart(6, '0')}`, blur: 18, fill: true },
    }).setOrigin(0.5).setDepth(3).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout',  () => btn.setColor(`#${hero.accent.toString(16).padStart(6, '0')}`));
    btn.on('pointerdown', () => this._selectHero(hero.key));

    // Hover glow on whole card
    const zone = this.add.zone(cx, cy, w, h).setInteractive().setDepth(1);
    zone.on('pointerover', () => this._paintCard(gfx, cx, cy, w, h, hero.color, hero.accent, 1.5));
    zone.on('pointerout',  () => this._paintCard(gfx, cx, cy, w, h, hero.color, hero.accent, 1));
  }

  _buildStatBars(cx, cy, barW, stats, accent) {
    const barH  = 9;
    const lineH = 21;
    const x0    = cx - barW / 2;

    const defs = [
      { label: 'HP',  value: stats.hp  / 140 },
      { label: 'SPD', value: stats.spd / 250 },
      // Lower fire-rate number = faster attack, so invert for display
      { label: 'ATK', value: 1 - (stats.atk - 220) / 340 },
    ];

    defs.forEach((d, i) => {
      const y = cy + i * lineH;

      this.add.text(x0 - 6, y, d.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize:   '11px',
        color:      '#8899bb',
      }).setOrigin(1, 0.5).setDepth(2);

      const bg = this.add.graphics().setDepth(2);
      bg.fillStyle(0x110022, 1);
      bg.fillRect(x0, y - barH / 2, barW, barH);
      bg.fillStyle(accent, 0.88);
      bg.fillRect(x0, y - barH / 2, barW * Phaser.Math.Clamp(d.value, 0.05, 1), barH);
    });
  }

  _paintCard(gfx, cx, cy, w, h, fillColor, accentColor, brightness) {
    gfx.clear();
    const c = Phaser.Display.Color.IntegerToColor(fillColor);
    const r = Math.min(255, Math.round(c.red   * (0.18 + brightness * 0.12)));
    const g = Math.min(255, Math.round(c.green * (0.18 + brightness * 0.12)));
    const b = Math.min(255, Math.round(c.blue  * (0.18 + brightness * 0.12)));

    gfx.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 0.96);
    gfx.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 18);

    gfx.lineStyle(3, accentColor, 0.95 * brightness);
    gfx.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 18);

    // Inner neon border
    gfx.lineStyle(1, accentColor, 0.3 * brightness);
    gfx.strokeRoundedRect(cx - w / 2 + 6, cy - h / 2 + 6, w - 12, h - 12, 13);
  }

  _drawCornerOrnaments(width, height) {
    const gfx = this.add.graphics().setAlpha(0.35);
    const size = 40;
    [[0, 0], [width, 0], [0, height], [width, height]].forEach(([x, y]) => {
      const sx = x === 0 ? 1 : -1;
      const sy = y === 0 ? 1 : -1;
      gfx.lineStyle(2, 0xff00ff, 1);
      gfx.moveTo(x, y + sy * size);
      gfx.lineTo(x, y);
      gfx.lineTo(x + sx * size, y);
      gfx.strokePath();
    });
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  _selectHero(heroKey) {
    const flash = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0xff00ff, 0.5,
    ).setDepth(90);
    this.tweens.add({ targets: flash, alpha: 0, duration: 400 });

    this.cameras.main.fadeOut(520, 0, 0, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { heroKey, wave: 1, score: 0, perks: [] });
    });
  }
}

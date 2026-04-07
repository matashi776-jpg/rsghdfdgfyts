/**
 * ExploreScene.js
 * Lanchyn City Exploration — Оборона Ланчина
 *
 * Player explores Lanchyn city districts, finds ritual points,
 * upgrades the city cordon, and proceeds to TacticalBattleScene.
 */
export default class ExploreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ExploreScene' });
  }

  init(data) {
    this.resources       = data.resources       ?? { herbs: 5, runes: 3, pysanka: 2, money: 100 };
    this.cordonLevel     = data.cordonLevel     ?? 1;
    this.round           = data.round           ?? 1;
    this.xp              = data.xp              ?? 0;
    this.level           = data.level           ?? 1;
    this.modifiers       = data.modifiers       ?? { damage: 1, speed: 1, defense: 1, income: 1 };
    this.defeatedEnemies = data.defeatedEnemies ?? 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(800);

    this._drawBackground(width, height);
    this._drawTitle(width, height);
    this._drawDistricts(width, height);
    this._buildResourcesHUD(width);
    this._buildCityUpgradePanel(width, height);
    this._buildCordonProgress(width, height);

    this._infoText = this.add.text(width / 2, height - 24, 'Обери квартал і почни ритуал', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#aaffcc',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffaa', blur: 8, fill: true },
    }).setOrigin(0.5).setDepth(20);
  }

  // ─── Background ───────────────────────────────────────────────────────────

  _drawBackground(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x020c18).setDepth(0);

    const grid = this.add.graphics().setAlpha(0.06).setDepth(1);
    for (let x = 0; x < width; x += 44) {
      grid.lineStyle(1, 0x00ffff, 1);
      grid.moveTo(x, 0); grid.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 44) {
      grid.lineStyle(1, 0x00ffff, 1);
      grid.moveTo(0, y); grid.lineTo(width, y);
    }
    grid.strokePath();

    // Animated neon ring pulses
    for (let i = 0; i < 4; i++) {
      const px = Phaser.Math.Between(80, width - 80);
      const py = Phaser.Math.Between(80, height - 80);
      const ring = this.add.graphics().setDepth(1);
      ring.lineStyle(1, 0x0044ff, 0.4);
      ring.strokeCircle(px, py, 24 + i * 18);
      this.tweens.add({
        targets:  ring,
        alpha:    0,
        scaleX:   2,
        scaleY:   2,
        duration: 2200 + i * 500,
        repeat:   -1,
        ease:     'Sine.easeIn',
      });
    }
  }

  _drawTitle(width, height) {
    this.add.text(width / 2, 32, 'ЛАНЧИН — МІСТО КОРДОНУ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#d4a017',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(15);

    this.add.text(width / 2, 62, `Раунд: ${this.round}  •  Рівень героя: ${this.level}  •  Знищено: ${this.defeatedEnemies}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#8899aa',
    }).setOrigin(0.5).setDepth(15);
  }

  // ─── Districts ────────────────────────────────────────────────────────────

  _getDistricts() {
    return [
      {
        name:    'Центральна площа',
        emoji:   '🏛',
        desc:    'Серце Ланчина — ритуали захисту.',
        x: 0.50, y: 0.40,
        color:   0x0a2244, accent: 0x0088ff,
        rituals: [
          { name: 'Ритуал Захисту',   cost: { herbs: 2, runes: 1 }, buff: 'defense',   debuff: 'enemy_slow' },
          { name: 'Ритуал Зцілення',  cost: { herbs: 3 },           buff: 'heal',      debuff: null         },
        ],
      },
      {
        name:    'Базар',
        emoji:   '🏪',
        desc:    'Торговельний квартал — ритуали достатку.',
        x: 0.22, y: 0.36,
        color:   0x2a1a00, accent: 0xffcc00,
        rituals: [
          { name: 'Ритуал Достатку',  cost: { pysanka: 2 },          buff: 'income',   debuff: 'enemy_poor'  },
        ],
      },
      {
        name:    'Окраїна',
        emoji:   '🌾',
        desc:    'Поля та луки — ритуали сили.',
        x: 0.78, y: 0.36,
        color:   0x0a2200, accent: 0x44ff44,
        rituals: [
          { name: 'Ритуал Сили',      cost: { herbs: 1, runes: 2 }, buff: 'damage',    debuff: 'enemy_weak'  },
          { name: 'Ритуал Врожаю',    cost: { herbs: 4 },           buff: 'resources', debuff: null          },
        ],
      },
      {
        name:    'Чорний Ліс',
        emoji:   '🌑',
        desc:    'Таємні хащі — ризикові ритуали.',
        x: 0.22, y: 0.65,
        color:   0x0a0022, accent: 0x8800ff,
        rituals: [
          { name: 'Ритуал Тіні',      cost: { runes: 3 },             buff: 'speed',  debuff: 'enemy_blind' },
          { name: 'Темний Ритуал',    cost: { runes: 4, pysanka: 1 }, buff: 'all',    debuff: 'enemy_curse' },
        ],
      },
      {
        name:    'Кордон',
        emoji:   '🏰',
        desc:    'Укріплення Ланчина — ритуали кордону.',
        x: 0.78, y: 0.65,
        color:   0x220011, accent: 0xff4488,
        rituals: [
          { name: 'Ритуал Кордону',   cost: { runes: 2, pysanka: 2 }, buff: 'cordon', debuff: 'enemy_fear'  },
        ],
      },
    ];
  }

  _drawDistricts(width, height) {
    const districts = this._getDistricts();
    for (const district of districts) {
      const cx = width  * district.x;
      const cy = height * district.y;
      const dw = 190, dh = 110;

      const gfx = this.add.graphics().setDepth(5);
      this._paintCard(gfx, cx, cy, dw, dh, district.color, district.accent, 1.0);

      this.add.text(cx, cy - 26, district.emoji, { fontSize: '26px' }).setOrigin(0.5).setDepth(6);
      const accentHex = '#' + district.accent.toString(16).padStart(6, '0');
      this.add.text(cx, cy + 4, district.name, {
        fontFamily: 'Arial Black, Arial',
        fontSize:   '12px',
        color:      accentHex,
        wordWrap:   { width: dw - 24 },
        align:      'center',
        shadow: { offsetX: 0, offsetY: 0, color: accentHex, blur: 7, fill: true },
      }).setOrigin(0.5).setDepth(6);

      // Ritual point markers
      for (let r = 0; r < district.rituals.length; r++) {
        const angle = (r / district.rituals.length) * Math.PI * 2 - Math.PI / 4;
        const rpx = cx + Math.cos(angle) * 56;
        const rpy = cy + dh * 0.4 + Math.sin(angle) * 14;
        this._createRitualPoint(rpx, rpy, district.accent, district, district.rituals[r]);
      }

      // Breathing glow
      this.tweens.add({
        targets:  gfx,
        alpha:    0.72,
        duration: 1200 + Math.random() * 700,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
      });

      // Hover / click zone
      const zone = this.add.zone(cx, cy, dw, dh)
        .setInteractive({ useHandCursor: true })
        .setDepth(7);

      zone.on('pointerover', () => {
        this._paintCard(gfx, cx, cy, dw, dh, district.color, district.accent, 1.6);
        this._infoText?.setText(`${district.name} — ${district.desc}`);
      });
      zone.on('pointerout', () => {
        this._paintCard(gfx, cx, cy, dw, dh, district.color, district.accent, 1.0);
        this._infoText?.setText('Обери квартал і почни ритуал');
      });
    }
  }

  _paintCard(gfx, cx, cy, w, h, fillColor, accentColor, brightness) {
    gfx.clear();
    const c  = Phaser.Display.Color.IntegerToColor(fillColor);
    const r  = Math.min(255, Math.round(c.red   * brightness));
    const g  = Math.min(255, Math.round(c.green * brightness));
    const b  = Math.min(255, Math.round(c.blue  * brightness));
    const fc = Phaser.Display.Color.GetColor(r, g, b);
    gfx.fillStyle(fc, 0.93);
    gfx.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 12);
    gfx.lineStyle(2, accentColor, 0.9);
    gfx.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 12);
    gfx.lineStyle(1, accentColor, 0.3);
    gfx.strokeRoundedRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8, 9);
  }

  _createRitualPoint(x, y, color, district, ritual) {
    const hexColor = '#' + color.toString(16).padStart(6, '0');

    const dot = this.add.graphics().setDepth(8);
    dot.fillStyle(color, 0.9);
    dot.fillCircle(x, y, 9);
    dot.lineStyle(2, 0xffffff, 0.6);
    dot.strokeCircle(x, y, 9);

    const ring = this.add.graphics().setDepth(7);
    ring.lineStyle(2, color, 0.6);
    ring.strokeCircle(x, y, 16);
    this.tweens.add({
      targets:  ring,
      alpha:    0,
      scaleX:   2,
      scaleY:   2,
      duration: 1600,
      repeat:   -1,
      ease:     'Sine.easeIn',
    });

    this.add.text(x, y + 14, ritual.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '8px',
      color:      hexColor,
      align:      'center',
      wordWrap:   { width: 90 },
    }).setOrigin(0.5, 0).setDepth(9);

    const hitZone = this.add.zone(x, y, 30, 30)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    hitZone.on('pointerover', () => {
      const costStr = Object.entries(ritual.cost)
        .map(([k, v]) => `${this._resourceEmoji(k)} ${v}`)
        .join('  ');
      this._infoText?.setText(`⚗ ${ritual.name} — Вартість: ${costStr}`);
    });
    hitZone.on('pointerdown', () => this._startRitual(district, ritual));
  }

  _resourceEmoji(key) {
    return { herbs: '🌿', runes: 'ᚠ', pysanka: '🥚', money: '💰' }[key] ?? key;
  }

  // ─── Ritual entry ─────────────────────────────────────────────────────────

  _startRitual(district, ritual) {
    for (const [key, cost] of Object.entries(ritual.cost)) {
      if ((this.resources[key] ?? 0) < cost) {
        this._showMessage(`Недостатньо ${this._resourceEmoji(key)} ×${cost}`, 0xff4444);
        return;
      }
    }

    this.cameras.main.fadeOut(600, 0, 0, 30);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RitualScene', {
        ritual,
        district,
        resources:       { ...this.resources },
        cordonLevel:     this.cordonLevel,
        round:           this.round,
        xp:              this.xp,
        level:           this.level,
        modifiers:       { ...this.modifiers },
        defeatedEnemies: this.defeatedEnemies,
      });
    });
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  _buildResourcesHUD(width) {
    const { herbs, runes, pysanka, money } = this.resources;
    const items = [
      { label: `🌿 Трави: ${herbs}`,      color: '#44ff88' },
      { label: `ᚠ Руни: ${runes}`,        color: '#aa44ff' },
      { label: `🥚 Писанки: ${pysanka}`,  color: '#ff8844' },
      { label: `💰 Гроші: ${money}`,      color: '#ffdd44' },
    ];

    this.add.rectangle(width / 2, 92, width - 40, 38, 0x001122, 0.88).setDepth(14);

    const startX  = 50;
    const spacing = Math.floor((width - 100) / items.length);
    items.forEach((item, i) => {
      this.add.text(startX + i * spacing, 92, item.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize:   '14px',
        color:      item.color,
        shadow: { offsetX: 0, offsetY: 0, color: item.color, blur: 6, fill: true },
      }).setOrigin(0, 0.5).setDepth(15);
    });

    this.add.text(width - 20, 92, `XP: ${this.xp} | Lvl: ${this.level}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '14px',
      color:      '#00ffff',
    }).setOrigin(1, 0.5).setDepth(15);
  }

  // ─── City Upgrade ─────────────────────────────────────────────────────────

  _buildCityUpgradePanel(width, height) {
    const costs     = [0, 200, 400, 800];
    const upgradeCost = costs[Math.min(this.cordonLevel, costs.length - 1)];
    const maxed       = this.cordonLevel >= 3;
    const canAfford   = !maxed && this.resources.money >= upgradeCost;

    const px = width - 110, py = height - 80;

    const bg = this.add.graphics().setDepth(14);
    bg.fillStyle(0x002244, 0.9);
    bg.fillRoundedRect(px - 95, py - 30, 190, 60, 8);
    bg.lineStyle(2, canAfford ? 0x00ffff : 0x333355, 0.9);
    bg.strokeRoundedRect(px - 95, py - 30, 190, 60, 8);

    this.add.text(px, py - 22, `🏙 Ланчин: рівень ${this.cordonLevel}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '12px',
      color:      '#d4a017',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 8, fill: true },
    }).setOrigin(0.5).setDepth(15);

    const label = maxed ? '🏰 Максимальний рівень' : `⬆ Апгрейд (${upgradeCost}💰)`;
    const btn = this.add.text(px, py + 2, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '12px',
      color:      canAfford ? '#00ffff' : '#555577',
      wordWrap:   { width: 180 },
      align:      'center',
    }).setOrigin(0.5).setDepth(15);

    if (canAfford) {
      const zone = this.add.zone(px, py + 2, 190, 32)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);
      zone.on('pointerover', () => btn.setColor('#ffffff'));
      zone.on('pointerout',  () => btn.setColor('#00ffff'));
      zone.on('pointerdown', () => this._upgradeCity(upgradeCost));
    }
  }

  _upgradeCity(cost) {
    if (this.resources.money < cost || this.cordonLevel >= 3) return;
    this.resources.money -= cost;
    this.cordonLevel++;
    this.modifiers.defense = (this.modifiers.defense ?? 1) + 0.3;

    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x00ffff, 0.3).setDepth(60);
    this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });
    this.cameras.main.flash(400, 0, 220, 180);
    this._showMessage(`✨ Ланчин: рівень ${this.cordonLevel}! Захист +0.3!`, 0x00ffff);

    this.time.delayedCall(1300, () => {
      this.scene.restart({
        resources:       this.resources,
        cordonLevel:     this.cordonLevel,
        round:           this.round,
        xp:              this.xp,
        level:           this.level,
        modifiers:       this.modifiers,
        defeatedEnemies: this.defeatedEnemies,
      });
    });
  }

  // ─── Cordon progress ──────────────────────────────────────────────────────

  _buildCordonProgress(width, height) {
    const px = 20, py = height - 68, barW = 220;

    this.add.text(px, py - 14, '🛡 Захист кордону:', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '12px',
      color:      '#aaffcc',
    }).setOrigin(0, 0.5).setDepth(15);

    const gfx = this.add.graphics().setDepth(14);
    gfx.fillStyle(0x001122, 0.8);
    gfx.fillRoundedRect(px, py - 7, barW, 16, 4);
    const ratio = Math.min(1, this.cordonLevel / 3);
    const col   = ratio > 0.6 ? 0x00ffaa : ratio > 0.3 ? 0xffaa00 : 0xff4488;
    gfx.fillStyle(col, 1);
    gfx.fillRoundedRect(px, py - 7, barW * ratio, 16, 4);
    gfx.lineStyle(1, 0x00ffff, 0.5);
    gfx.strokeRoundedRect(px, py - 7, barW, 16, 4);

    this.add.text(px + barW / 2, py + 14, `${this.defeatedEnemies} ворогів знищено`, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '10px',
      color:      '#888888',
    }).setOrigin(0.5).setDepth(15);
  }

  // ─── Utility ──────────────────────────────────────────────────────────────

  _showMessage(text, color = 0x00ffff) {
    const { width, height } = this.scale;
    const hexColor = '#' + color.toString(16).padStart(6, '0');
    const msg = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '22px',
      color:      hexColor,
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: hexColor, blur: 18, fill: true },
      wordWrap: { width: width * 0.7 },
      align:    'center',
    }).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({
      targets: msg,
      alpha:   1,
      y:       height / 2 - 18,
      duration: 300,
      ease:    'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: msg, alpha: 0, duration: 300, delay: 1600, onComplete: () => msg.destroy() });
      },
    });
  }
}

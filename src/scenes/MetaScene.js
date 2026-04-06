/**
 * MetaScene.js
 * Between-run meta-progression screen — Оборона Ланчина V4.0
 *
 * Part 4 — Meta-Progression (Roguelike):
 *   House upgrades (5 levels):   +HP per level, lvl 4 → auto-turret, lvl 5 → dome shield
 *   Weapon upgrades (5 levels):  +damage, +fire-rate (lvl 4), +crits (lvl 5)
 *   Permanent perks:             +5% gold / +5% damage / +5% fire-rate / +5% HP (stackable)
 *
 * Gold earned during a run is persisted via BattleScene._saveMeta() into localStorage
 * so it accumulates across runs.  Upgrades are also saved.
 */

import Calculator from '../utils/Calculator.js';

// ─── Upgrade catalogue ────────────────────────────────────────────────────────

const HOUSE_UPGRADES = [
  { level: 2, label: 'Будинок рівень 2', effect: '+20% HP хутора',    key: 'houseLevel' },
  { level: 3, label: 'Будинок рівень 3', effect: '+30% HP хутора',    key: 'houseLevel' },
  { level: 4, label: 'Будинок рівень 4', effect: '+1 Авто-турель',    key: 'houseLevel' },
  { level: 5, label: 'Будинок рівень 5', effect: '+Купол-щит',        key: 'houseLevel' },
];

const WEAPON_UPGRADES = [
  { level: 2, label: 'Зброя рівень 2', effect: '+10 шкоди',          key: 'weaponLevel' },
  { level: 3, label: 'Зброя рівень 3', effect: '+20 шкоди',          key: 'weaponLevel' },
  { level: 4, label: 'Зброя рівень 4', effect: '+Швидкість стрільби', key: 'weaponLevel' },
  { level: 5, label: 'Зброя рівень 5', effect: '+Крити',             key: 'weaponLevel' },
];

const PERM_PERKS = [
  { id: 'permGold',    label: 'Золота Схильність',   effect: '+5% золота назавжди',             field: 'permGoldBonus',   step: 0.05, max: 0.5 },
  { id: 'permDamage',  label: 'Сталева Воля',        effect: '+5% шкоди назавжди',              field: 'permDamageBonus', step: 0.05, max: 0.5 },
  { id: 'permSpeed',   label: 'Козацький Вітер',     effect: '+5% швидкості стрільби назавжди', field: 'permSpeedBonus',  step: 0.05, max: 0.5 },
  { id: 'permHP',      label: 'Кам\'яна Хата',      effect: '+5% HP хутора назавжди',          field: 'permHPBonus',     step: 0.05, max: 0.5 },
];

const PERM_PERK_COST = 300;

// ─────────────────────────────────────────────────────────────────────────────

export default class MetaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MetaScene' });
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  create() {
    this._meta = this._load();
    this._buildUI();
  }

  // ─── Persistence ─────────────────────────────────────────────────────────

  _load() {
    try {
      const raw = localStorage.getItem('meta_upgrades');
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return {
      houseLevel:       1,
      weaponLevel:      1,
      permGoldBonus:    0,
      permDamageBonus:  0,
      permSpeedBonus:   0,
      permHPBonus:      0,
      savedGold:        0,
    };
  }

  _save() {
    try { localStorage.setItem('meta_upgrades', JSON.stringify(this._meta)); } catch (_) { /* ignore */ }
  }

  // ─── UI Builder ──────────────────────────────────────────────────────────

  _buildUI() {
    const { width, height } = this.scale;

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x050010, 1);

    // Neon grid
    const grid = this.add.graphics().setAlpha(0.06);
    for (let y = 0; y < height; y += 10) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // Title
    this.add.text(width / 2, 30, 'МЕТА-ПРОГРЕСІЯ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '38px',
      color:      '#ff00ff',
      stroke:     '#000033',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 22, fill: true },
    }).setOrigin(0.5, 0).setDepth(5);

    // Gold label (live-updating)
    this._goldLabel = this.add.text(width / 2, 82, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '26px',
      color:      '#ffd700',
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(5);
    this._refreshGoldLabel();

    // ── House upgrades column ────────────────────────────────────────────────
    this.add.text(120, 130, '🏠 ХУТІР', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#00ffcc',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 12, fill: true },
    }).setOrigin(0.5, 0).setDepth(5);

    HOUSE_UPGRADES.forEach((upg, i) => {
      const cost = Calculator.houseUpgradeCost(upg.level - 1);
      const already = this._meta.houseLevel >= upg.level;
      this._addUpgradeRow(120, 165 + i * 100, upg.label, upg.effect, cost, already, () => {
        if (this._meta.houseLevel >= upg.level - 1 && this._meta.savedGold >= cost) {
          this._meta.savedGold -= cost;
          this._meta.houseLevel = upg.level;
          this._save();
          this._rebuildUI();
        }
      });
    });

    // ── Weapon upgrades column ────────────────────────────────────────────────
    this.add.text(400, 130, '🔫 ЗБРОЯ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ff88ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff88ff', blur: 12, fill: true },
    }).setOrigin(0.5, 0).setDepth(5);

    WEAPON_UPGRADES.forEach((upg, i) => {
      const cost = Calculator.weaponUpgradeCost(upg.level - 1);
      const already = this._meta.weaponLevel >= upg.level;
      this._addUpgradeRow(400, 165 + i * 100, upg.label, upg.effect, cost, already, () => {
        if (this._meta.weaponLevel >= upg.level - 1 && this._meta.savedGold >= cost) {
          this._meta.savedGold -= cost;
          this._meta.weaponLevel = upg.level;
          this._save();
          this._rebuildUI();
        }
      });
    });

    // ── Permanent perks column ────────────────────────────────────────────────
    this.add.text(700, 130, '✨ ПОСТІЙНІ ПЕРКИ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ffcc44',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffcc44', blur: 12, fill: true },
    }).setOrigin(0.5, 0).setDepth(5);

    PERM_PERKS.forEach((perk, i) => {
      const current = this._meta[perk.field] || 0;
      const maxed   = current >= perk.max;
      const label   = `${perk.label} (${Math.round(current * 100)}%)`;
      this._addUpgradeRow(700, 165 + i * 100, label, perk.effect, PERM_PERK_COST, maxed, () => {
        if (!maxed && this._meta.savedGold >= PERM_PERK_COST) {
          this._meta.savedGold -= PERM_PERK_COST;
          this._meta[perk.field] = Math.min(perk.max, (this._meta[perk.field] || 0) + perk.step);
          this._save();
          this._rebuildUI();
        }
      });
    });

    // ── Wave table reference ──────────────────────────────────────────────────
    this._addWaveTable(1000, 130);

    // ── Continue button ───────────────────────────────────────────────────────
    const btnY = height - 50;
    const btnGfx = this.add.graphics().setDepth(5);
    btnGfx.fillStyle(0x1a003a, 0.95);
    btnGfx.fillRoundedRect(width / 2 - 150, btnY - 26, 300, 52, 8);
    btnGfx.lineStyle(2, 0xff00ff, 1);
    btnGfx.strokeRoundedRect(width / 2 - 150, btnY - 26, 300, 52, 8);

    const btnTxt = this.add.text(width / 2, btnY, '▶ ДАЛІ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '26px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 16, fill: true },
    }).setOrigin(0.5).setDepth(6);

    this.tweens.add({ targets: btnTxt, scaleX: 1.06, scaleY: 1.06, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const zone = this.add.zone(width / 2, btnY, 300, 52).setInteractive({ useHandCursor: true }).setDepth(7);
    zone.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  // ─── Upgrade Row ──────────────────────────────────────────────────────────

  _addUpgradeRow(cx, y, label, effectDesc, cost, alreadyOwned, onBuy) {
    const W = 220, H = 86;

    const bg = this.add.graphics().setDepth(4);
    const drawBg = (hover) => {
      bg.clear();
      if (alreadyOwned) {
        bg.fillStyle(0x003322, 0.85);
        bg.fillRoundedRect(cx - W / 2, y, W, H, 8);
        bg.lineStyle(2, 0x00ff88, 0.9);
        bg.strokeRoundedRect(cx - W / 2, y, W, H, 8);
      } else {
        bg.fillStyle(hover ? 0x1a003a : 0x0a001a, 0.9);
        bg.fillRoundedRect(cx - W / 2, y, W, H, 8);
        bg.lineStyle(2, hover ? 0xff00ff : 0x440066, 0.9);
        bg.strokeRoundedRect(cx - W / 2, y, W, H, 8);
      }
    };
    drawBg(false);

    const labelTxt = this.add.text(cx, y + 14, alreadyOwned ? `✔ ${label}` : label, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '13px',
      color:      alreadyOwned ? '#00ff88' : '#ddddee',
      wordWrap:   { width: W - 12 },
      align:      'center',
    }).setOrigin(0.5, 0).setDepth(5);

    this.add.text(cx, y + 40, effectDesc, {
      fontFamily: 'Arial',
      fontSize:   '12px',
      color:      '#aaaacc',
      wordWrap:   { width: W - 12 },
      align:      'center',
    }).setOrigin(0.5, 0).setDepth(5);

    if (!alreadyOwned) {
      this.add.text(cx, y + 62, `💰 ${cost} ₴`, {
        fontFamily: 'Arial Black, Arial',
        fontSize:   '13px',
        color:      '#ffd700',
      }).setOrigin(0.5, 0).setDepth(5);

      const zone = this.add.zone(cx, y + H / 2, W, H).setInteractive({ useHandCursor: true }).setDepth(6);
      zone.on('pointerover',  () => drawBg(true));
      zone.on('pointerout',   () => drawBg(false));
      zone.on('pointerdown',  onBuy);
    }
  }

  // ─── Wave Reference Table ─────────────────────────────────────────────────

  _addWaveTable(x, y) {
    const { height } = this.scale;
    this.add.text(x + 100, y, '📊 ТАБЛИЦЯ ХВИЛЬ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#00ffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, fill: true },
    }).setOrigin(0.5, 0).setDepth(5);

    const headers = ['Хв.', 'HP', 'Шв.', 'Скл.'];
    const colW    = 55;
    const startX  = x + 10;

    headers.forEach((h, i) => {
      this.add.text(startX + i * colW, y + 28, h, {
        fontFamily: 'Arial Black, Arial', fontSize: '12px', color: '#aaaaff',
      }).setDepth(5);
    });

    for (let w = 1; w <= Math.min(10, Math.floor((height - y - 80) / 26)); w++) {
      const hp    = Calculator.enemyHP(w);
      const speed = Calculator.enemySpeed(w);
      const count = 6 + Math.floor(w / 2);
      const diff  = Math.round(Calculator.waveDifficulty(hp, speed, count));
      const row   = [w, hp, speed, diff];
      const rowY  = y + 50 + (w - 1) * 24;

      row.forEach((val, i) => {
        this.add.text(startX + i * colW, rowY, String(val), {
          fontFamily: 'Arial', fontSize: '12px',
          color: w % 2 === 0 ? '#ccccee' : '#aaaacc',
        }).setDepth(5);
      });
    }
  }

  // ─── Refresh helpers ──────────────────────────────────────────────────────

  _refreshGoldLabel() {
    this._goldLabel && this._goldLabel.setText(`💰 Накопичено: ${this._meta.savedGold} ₴`);
  }

  _rebuildUI() {
    // Destroy all existing display objects and rebuild
    this.children.removeAll(true);
    this._buildUI();
  }
}

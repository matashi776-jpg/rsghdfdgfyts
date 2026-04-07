/**
 * PerkSystem.js
 * Ukrainian-themed spell and relic perk selection — Оборона Ланчина.
 *
 * Each perk is named after a Ukrainian folk symbol or deity.
 * Perks come in three categories:
 *   SPELL  — unlocks or upgrades a spell on the player's SpellSystem
 *   RELIC  — equipment bonus (virus resist, HP, etc.)
 *   BATTLE — direct battle modifiers (damage, speed, etc.)
 */
import { SPELLS } from '../core/SpellData.js';

// ── Perk pool ────────────────────────────────────────────────────────────────

const PERKS = [
  // ── BATTLE perks (народна сила) ──────────────────────────────────────────
  {
    id:       'damage_up',
    label:    '⚔ Козацький Удар',
    sublabel: '+25% Урон — Сила предків',
    color:    '#ff8800',
    glow:     0xff8800,
    apply: (scene) => {
      scene.modifiers.damage = (scene.modifiers.damage ?? 1) * 1.25;
      if (scene.projectileSystem) scene.projectileSystem.damage = (scene.projectileSystem.damage ?? 20) * 1.25;
    },
  },
  {
    id:       'speed_up',
    label:    '💨 Стрибогова Хода',
    sublabel: '+20% Швидкість — Вітер у спину',
    color:    '#00eeff',
    glow:     0x00eeff,
    apply: (scene) => { scene.player.speed *= 1.20; },
  },
  {
    id:       'hp_restore',
    label:    '💧 Жива Вода',
    sublabel: 'Відновити 30% HP — Берегиня зцілює',
    color:    '#00ff88',
    glow:     0x00ff88,
    apply: (scene) => {
      const p = scene.player;
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.3);
    },
  },
  {
    id:       'fire_rate',
    label:    '🔥 Перунів Ритм',
    sublabel: '+30% Швидкість вогню — Блискавка не чекає',
    color:    '#ffff00',
    glow:     0xffff00,
    apply: (scene) => { scene.player.fireRate *= 0.70; },
  },
  {
    id:       'shield',
    label:    '🛡 Оберіг (10с)',
    sublabel: 'Щит на 10 секунд — Символ захищає',
    color:    '#4488ff',
    glow:     0x4488ff,
    apply: (scene) => { scene.player.shieldUntil = scene.time.now + 10000; },
  },
  {
    id:       'hp_up',
    label:    '❤ Вишиванкова Броня',
    sublabel: '+20% Максимум HP — Вишивка захищає',
    color:    '#ff4488',
    glow:     0xff4488,
    apply: (scene) => {
      const p = scene.player;
      p.maxHp  = Math.round(p.maxHp * 1.20);
      p.hp     = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.10));
    },
  },
  {
    id:       'income_up',
    label:    '💰 Золотий Талон',
    sublabel: 'Пасивний прибуток ×2 — Хутір процвітає',
    color:    '#ffdd00',
    glow:     0xffdd00,
    apply: (scene) => { scene.modifiers.passiveIncome = (scene.modifiers.passiveIncome ?? 1) * 2; },
  },
  {
    id:       'wall_defense',
    label:    '🏰 Земляний Вал',
    sublabel: '+30% Захист хутора — Мати-Земля тримає',
    color:    '#886600',
    glow:     0x886600,
    apply: (scene) => { scene.modifiers.wallDefense = (scene.modifiers.wallDefense ?? 1) * (1 / 0.7); },
  },

  // ── SPELL perks (магічні дари) ────────────────────────────────────────────
  {
    id:       'spell_thunderbolt',
    label:    '⚡ Громовиця',
    sublabel: 'Вивчити заклинання Перуна',
    color:    '#ffff44',
    glow:     0xffff44,
    apply: (scene) => {
      scene.player?.spellSystem?.learnSpell('thunderbolt');
    },
  },
  {
    id:       'spell_healing_dew',
    label:    '🌿 Цілюща Роса',
    sublabel: 'Вивчити цілюще заклинання',
    color:    '#00ff88',
    glow:     0x00ff88,
    apply: (scene) => {
      scene.player?.spellSystem?.learnSpell('healing_dew');
    },
  },
  {
    id:       'spell_wind_dash',
    label:    '🌀 Вітровий Прорив',
    sublabel: 'Вивчити заклинання Стрибога',
    color:    '#00eeff',
    glow:     0x00eeff,
    apply: (scene) => {
      scene.player?.spellSystem?.learnSpell('wind_dash');
    },
  },
  {
    id:       'spell_nav_curse',
    label:    '💀 Прокляття Наві',
    sublabel: 'Вивчити темне заклинання',
    color:    '#9900ff',
    glow:     0x9900ff,
    apply: (scene) => {
      scene.player?.spellSystem?.learnSpell('nav_curse');
    },
  },
  {
    id:       'spell_earth_wall',
    label:    '🌍 Земляний Вал',
    sublabel: 'Вивчити заклинання Матері-Землі',
    color:    '#886600',
    glow:     0x886600,
    apply: (scene) => {
      scene.player?.spellSystem?.learnSpell('earth_wall');
    },
  },
  {
    id:       'spell_mana_up',
    label:    '✨ Мана Предків',
    sublabel: '+30% Мана — Дух народу живе',
    color:    '#cc44ff',
    glow:     0xcc44ff,
    apply: (scene) => {
      const ss = scene.player?.spellSystem;
      if (ss) { ss.maxMana = Math.round(ss.maxMana * 1.30); ss.mana = Math.min(ss.maxMana, ss.mana + 20); }
    },
  },
];

export default class PerkSystem {
  constructor(scene) {
    this.scene    = scene;
    this._overlay = null;
  }

  offerPerks() {
    const { width, height } = this.scene.scale;

    this.scene.physics.pause();

    // Dark neon overlay
    this._overlay = this.scene.add.rectangle(
      width / 2, height / 2, width, height, 0x000000, 0.80
    ).setDepth(80).setInteractive();

    // Neon grid
    const grid = this.scene.add.graphics().setDepth(80).setAlpha(0.07);
    for (let y = 0; y < height; y += 8) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    this.scene.add.text(width / 2, height * 0.13, '✦ ОБЕРИ ДАРУНОК ПРЕДКІВ ✦', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '38px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 22, fill: true },
    }).setOrigin(0.5).setDepth(81);

    // Pick 3 random perks
    const pool    = Phaser.Utils.Array.Shuffle([...PERKS]).slice(0, 3);
    const spacing = width / 4;

    pool.forEach((perk, i) => {
      const cx = spacing * (i + 1);
      const cy = height * 0.55;
      this._buildCard(cx, cy, perk);
    });
  }

  _buildCard(cx, cy, perk) {
    const scene = this.scene;
    const W = 240, H = 200;

    // Card background
    const gfx = scene.add.graphics().setDepth(81);
    const _draw = (bright) => {
      gfx.clear();
      gfx.fillStyle(0x000022, 0.92 * bright);
      gfx.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, 12);
      gfx.lineStyle(2, perk.glow, bright);
      gfx.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, 12);
      gfx.lineStyle(1, perk.glow, bright * 0.4);
      gfx.strokeRoundedRect(cx - W / 2 + 5, cy - H / 2 + 5, W - 10, H - 10, 8);
    };
    _draw(1);

    const nameTxt = scene.add.text(cx, cy - 48, perk.label, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      perk.color,
      wordWrap:   { width: W - 20 },
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: perk.color, blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(82);

    const subTxt = scene.add.text(cx, cy + 10, perk.sublabel, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '14px',
      color:      '#ccccdd',
      wordWrap:   { width: W - 20 },
      align:      'center',
    }).setOrigin(0.5).setDepth(82);

    const pickTxt = scene.add.text(cx, cy + H / 2 - 22, 'ОБРАТИ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '16px',
      color:      perk.color,
      shadow: { offsetX: 0, offsetY: 0, color: perk.color, blur: 14, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(82);

    const zone = scene.add.zone(cx, cy, W, H).setInteractive({ useHandCursor: true }).setDepth(83);

    zone.on('pointerover', () => {
      _draw(1.5);
      scene.tweens.add({ targets: [nameTxt, subTxt], scaleX: 1.04, scaleY: 1.04, duration: 100 });
      scene.tweens.add({ targets: pickTxt, alpha: 1, duration: 100 });
    });
    zone.on('pointerout', () => {
      _draw(1);
      scene.tweens.add({ targets: [nameTxt, subTxt], scaleX: 1, scaleY: 1, duration: 100 });
      scene.tweens.add({ targets: pickTxt, alpha: 0, duration: 100 });
    });
    zone.on('pointerdown', () => this._selectPerk(perk));
  }

  _selectPerk(perk) {
    perk.apply(this.scene);

    // Neon flash
    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2, this.scene.scale.height / 2,
      this.scene.scale.width, this.scene.scale.height,
      perk.glow, 0.35,
    ).setDepth(90);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 380 });

    // Remove overlay and cards
    this.scene.children.getAll().forEach(child => {
      if (child.depth >= 80) child.destroy();
    });

    this.scene.physics.resume();
    this.scene.waveSystem.startWave(this.scene.wave);
  }
}


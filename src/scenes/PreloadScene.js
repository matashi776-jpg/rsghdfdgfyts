/**
 * PreloadScene.js
 * Loads all assets for Оборона Ланчина V4.0 — NEON PSYCHEDELIC EDITION.
 * Generates neon fallback textures on asset error.
 *
 * Part 8.5 additions:
 *  - Animation frames: Serhiy idle/walk/shoot, enemies, boss phases 1+2
 *  - NPC sprites: Babtsya Healer, Mykhas Mechanic
 *  - Item sprites: Radioactive Beet, Golden Coupon, Iron Seal
 *  - Cutscene images: intro, boss_entrance
 *  - Comic panel: comic_panel_01
 *  - Phaser animation definitions for all frame sets
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Neon loading background
    this.add.rectangle(width / 2, height / 2, width, height, 0x050010);

    // Loading bar — neon style
    this.add.rectangle(width / 2, height / 2 + 50, 504, 32, 0x220044);
    this.add.rectangle(width / 2, height / 2 + 50, 500, 28, 0x110022);
    const bar = this.add.rectangle(width / 2 - 250, height / 2 + 50, 0, 28, 0xff00ff);
    bar.setOrigin(0, 0.5);

    this.add.text(width / 2, height / 2 - 10, 'ЗАВАНТАЖЕННЯ...', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 20, fill: true },
    }).setOrigin(0.5);

    this.load.on('progress', (v) => { bar.width = 500 * v; });

    this._failedKeys = new Set();
    this.load.on('loaderror', (file) => {
      console.warn(`Asset missing: ${file.key} (${file.url}) — using fallback`);
      this._failedKeys.add(file.key);
    });

    // ── Core images ──────────────────────────────────────────────────────────
    this.load.image('bg',              'bg.png');
    this.load.image('house_1',         'house_1.png');
    this.load.image('house_2',         'house_2.png');
    this.load.image('house_3',         'house_3.png');
    this.load.image('sergiy',          'sergiy.png');
    this.load.image('enemy_clerk',     'enemy_clerk.png');
    this.load.image('enemy_runner',    'enemy_runner.png');
    this.load.image('enemy_tank',      'enemy_tank.png');
    this.load.image('boss_vakhtersha', 'boss_vakhtersha.png');

    // ── Audio ────────────────────────────────────────────────────────────────
    this.load.audio('bgm', 'bgm.mp3');

    // ── Animation frames — Serhiy ────────────────────────────────────────────
    this._loadFrames('assets/sprites/player', 'serhiy_idle',  'player_serhiy_idle',  12);
    this._loadFrames('assets/sprites/player', 'serhiy_walk',  'player_serhiy_walk',  12);
    this._loadFrames('assets/sprites/player', 'serhiy_shoot', 'player_serhiy_shoot',  6);

    // ── Animation frames — Enemies ───────────────────────────────────────────
    this._loadFrames('assets/sprites/enemies', 'zombie_clerk_walk',    'enemy_zombie_clerk_walk',    8);
    this._loadFrames('assets/sprites/enemies', 'archivarius_attack',   'enemy_archivarius_attack',   6);
    this._loadFrames('assets/sprites/enemies', 'inspector_slam',       'enemy_inspector_slam',       6);

    // ── Animation frames — Boss ───────────────────────────────────────────────
    this._loadFrames('assets/sprites/boss', 'vakhtersha_phase1', 'boss_vakhtersha_phase1', 8);
    this._loadFrames('assets/sprites/boss', 'vakhtersha_phase2', 'boss_vakhtersha_phase2', 8);

    // ── NPC sprites ───────────────────────────────────────────────────────────
    this.load.image('npc_babtsya_healer',  'assets/sprites/npcs/npc_babtsya_healer_idle.png');
    this.load.image('npc_mykhas_mechanic', 'assets/sprites/npcs/npc_mykhas_mechanic_idle.png');

    // ── Item sprites ──────────────────────────────────────────────────────────
    this.load.image('item_radioactive_beet', 'assets/sprites/items/item_radioactive_beet.png');
    this.load.image('item_golden_coupon',    'assets/sprites/items/item_golden_coupon.png');
    this.load.image('item_iron_seal',        'assets/sprites/items/item_iron_seal.png');

    // ── Cutscene images ───────────────────────────────────────────────────────
    this.load.image('cutscene_intro_01',       'assets/cutscenes/cutscene_intro_01.png');
    this.load.image('cutscene_boss_entrance',  'assets/cutscenes/cutscene_boss_entrance.png');

    // ── Comic panels ──────────────────────────────────────────────────────────
    this.load.image('comic_panel_01', 'assets/comics/comic_panel_01.png');
  }

  create() {
    this._ensureFallbacks();
    this._makeParticleTextures();
    this._defineAnimations();
    this.scene.start('MenuScene');
  }

  // ─── Frame Loading Helper ─────────────────────────────────────────────────

  /**
   * Load a sequence of individually numbered PNG frames.
   * @param {string} dir      – directory relative to public root
   * @param {string} animKey  – base key prefix used for individual frame keys
   * @param {string} fileBase – file name base (without _NN.png)
   * @param {number} count    – total number of frames
   */
  _loadFrames(dir, animKey, fileBase, count) {
    for (let i = 1; i <= count; i++) {
      const pad = String(i).padStart(2, '0');
      this.load.image(`${animKey}_${pad}`, `${dir}/${fileBase}_${pad}.png`);
    }
  }

  // ─── Animation Definitions ────────────────────────────────────────────────

  _defineAnimations() {
    // Guard: don't recreate if PreloadScene is restarted
    if (this.anims.exists('serhiy-idle')) return;

    const mk = (key, frameBase, count, frameRate, repeat = -1) => {
      const frames = [];
      for (let i = 1; i <= count; i++) {
        frames.push({ key: `${frameBase}_${String(i).padStart(2, '0')}` });
      }
      this.anims.create({ key, frames, frameRate, repeat });
    };

    // Serhiy
    mk('serhiy-idle',  'serhiy_idle',  12, 8,  -1);
    mk('serhiy-walk',  'serhiy_walk',  12, 10, -1);
    mk('serhiy-shoot', 'serhiy_shoot',  6, 12,  0);

    // Enemies
    mk('zombie-clerk-walk',   'zombie_clerk_walk',   8, 8,  -1);
    mk('archivarius-attack',  'archivarius_attack',  6, 10,  0);
    mk('inspector-slam',      'inspector_slam',      6, 10,  0);

    // Boss
    mk('vakhtersha-phase1', 'vakhtersha_phase1', 8, 8, -1);
    mk('vakhtersha-phase2', 'vakhtersha_phase2', 8, 10, -1);
  }

  _ensureFallbacks() {
    const defs = [
      { key: 'bg',              color: 0x0a0020, w: 1280, h: 720  },
      { key: 'house_1',         color: 0x1a0040, w: 100,  h: 200  },
      { key: 'house_2',         color: 0x002244, w: 110,  h: 220  },
      { key: 'house_3',         color: 0x001a33, w: 120,  h: 240  },
      { key: 'sergiy',          color: 0xff00ff, w: 64,   h: 96   },
      { key: 'enemy_clerk',     color: 0x444466, w: 48,   h: 64   },
      { key: 'enemy_runner',    color: 0x664400, w: 40,   h: 56   },
      { key: 'enemy_tank',      color: 0x223355, w: 80,   h: 80   },
      { key: 'boss_vakhtersha', color: 0x440066, w: 120,  h: 140  },

      // Animation frame fallbacks (shared colour per character)
      ...this._frameFallbacks('serhiy_idle',        12, 0xff00ff, 64,  96),
      ...this._frameFallbacks('serhiy_walk',        12, 0xff44ff, 64,  96),
      ...this._frameFallbacks('serhiy_shoot',        6, 0xff88ff, 64,  96),
      ...this._frameFallbacks('zombie_clerk_walk',   8, 0x00ff44, 48,  64),
      ...this._frameFallbacks('archivarius_attack',  6, 0x0044ff, 52,  68),
      ...this._frameFallbacks('inspector_slam',      6, 0xff00aa, 52,  72),
      ...this._frameFallbacks('vakhtersha_phase1',   8, 0x440066, 120, 140),
      ...this._frameFallbacks('vakhtersha_phase2',   8, 0x880088, 120, 140),

      // NPCs
      { key: 'npc_babtsya_healer',  color: 0xff44aa, w: 56, h: 88 },
      { key: 'npc_mykhas_mechanic', color: 0x0044ff, w: 56, h: 88 },

      // Items
      { key: 'item_radioactive_beet', color: 0x00ff44, w: 40, h: 48 },
      { key: 'item_golden_coupon',    color: 0xffcc00, w: 56, h: 36 },
      { key: 'item_iron_seal',        color: 0x8844ff, w: 44, h: 44 },

      // Cutscenes
      { key: 'cutscene_intro_01',      color: 0x0a0030, w: 1280, h: 720 },
      { key: 'cutscene_boss_entrance', color: 0x220033, w: 1280, h: 720 },

      // Comics
      { key: 'comic_panel_01', color: 0x001122, w: 1280, h: 720 },
    ];

    for (const fb of defs) {
      if (
        this._failedKeys.has(fb.key) ||
        !this.textures.exists(fb.key) ||
        this.textures.get(fb.key).key === '__MISSING'
      ) {
        this._makeNeonRect(fb.key, fb.color, fb.w, fb.h);
      }
    }
  }

  _makeParticleTextures() {
    // Neon particle textures — glowing circles
    this._makeGlowCircle('particle_neon_pink',   0xff00aa, 8);
    this._makeGlowCircle('particle_neon_orange',  0xff6600, 7);
    this._makeGlowCircle('particle_neon_cyan',    0x00ffff, 6);
    this._makeGlowCircle('particle_neon_green',   0x00ff88, 6);
    // Legacy keys — now neon
    this._makeGlowCircle('particle_red',    0xff0044, 8);
    this._makeGlowCircle('particle_yellow', 0xffff00, 6);
  }

  _makeGlowCircle(key, color, r) {
    const size = r * 4;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer glow
    gfx.fillStyle(color, 0.25);
    gfx.fillCircle(size / 2, size / 2, r * 1.8);
    // Mid glow
    gfx.fillStyle(color, 0.6);
    gfx.fillCircle(size / 2, size / 2, r * 1.2);
    // Core
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(size / 2, size / 2, r * 0.6);
    gfx.generateTexture(key, size, size);
    gfx.destroy();
  }

  _makeNeonRect(key, color, w, h) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
    console.info(`Generated neon fallback texture: ${key}`);
  }

  /**
   * Build an array of fallback descriptor objects for a numbered frame sequence.
   * @param {string} base   – key prefix (e.g. 'serhiy_idle')
   * @param {number} count  – number of frames
   * @param {number} color  – fill colour
   * @param {number} w      – width in pixels
   * @param {number} h      – height in pixels
   * @returns {{ key: string, color: number, w: number, h: number }[]}
   */
  _frameFallbacks(base, count, color, w, h) {
    const out = [];
    for (let i = 1; i <= count; i++) {
      out.push({ key: `${base}_${String(i).padStart(2, '0')}`, color, w, h });
    }
    return out;
  }
}

/**
 * PreloadScene.js
 * Loads all assets for Acid Khutir — NEON PSYCHEDELIC CYBER-FOLK EDITION.
 * Generates neon fallback textures on asset error.
 *
 * Color palette (Art Bible):
 *   Electric Blue  #00CFFF — bullets, energy, UI
 *   Neon Pink      #FF00D4 — enemies, flashes, blood
 *   Toxic Green    #39FF14 — poison, beet, effects
 *   Ultra-Violet   #7F00FF — backgrounds, shadows, magic
 *   Cyber-Amber    #FFB300 — gold, money
 *   Plasma Red     #FF0033 — damage, crits
 *   Deep Indigo    #0A0014 — background, contrast
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Deep Indigo loading background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0A0014);

    // Loading bar — neon Ultra-Violet/Electric-Blue style
    this.add.rectangle(width / 2, height / 2 + 50, 504, 32, 0x1A0040);
    this.add.rectangle(width / 2, height / 2 + 50, 500, 28, 0x0D0020);
    const bar = this.add.rectangle(width / 2 - 250, height / 2 + 50, 0, 28, 0x00CFFF);
    bar.setOrigin(0, 0.5);

    this.add.text(width / 2, height / 2 - 10, 'ЗАВАНТАЖЕННЯ...', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#00CFFF',
      stroke: '#FF00D4',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#00CFFF', blur: 20, fill: true },
    }).setOrigin(0.5);

    this.load.on('progress', (v) => { bar.width = 500 * v; });

    this._failedKeys = new Set();
    this.load.on('loaderror', (file) => {
      console.warn(`Asset missing: ${file.key} (${file.url}) — using fallback`);
      this._failedKeys.add(file.key);
    });

    // Images
    this.load.image('bg',                 'bg.png');
    this.load.image('house_1',            'house_1.png');
    this.load.image('house_2',            'house_2.png');
    this.load.image('house_3',            'house_3.png');
    this.load.image('sergiy',             'sergiy.png');
    this.load.image('enemy_clerk',        'enemy_clerk.png');
    this.load.image('enemy_runner',       'enemy_runner.png');
    this.load.image('enemy_tank',         'enemy_tank.png');
    this.load.image('enemy_archivarius',  'enemy_archivarius.png');
    this.load.image('enemy_inspector',    'enemy_inspector.png');
    this.load.image('boss_vakhtersha',    'boss_vakhtersha.png');

    // Audio
    this.load.audio('bgm', 'bgm.mp3');
  }

  create() {
    this._ensureFallbacks();
    this._makeParticleTextures();
    this.scene.start('MenuScene');
  }

  // ─── Fallback textures ────────────────────────────────────────────────────

  _ensureFallbacks() {
    const defs = [
      { key: 'bg',                color: 0x0A0014, w: 1280, h: 720  },
      { key: 'house_1',           color: 0x2A1000, w: 100,  h: 200  }, // warm amber (Level 1 Традиція)
      { key: 'house_2',           color: 0x001A33, w: 110,  h: 220  }, // electric blue (Level 2 Укріплення)
      { key: 'house_3',           color: 0x150040, w: 120,  h: 240  }, // ultra-violet (Level 3 Кібер-Січ)
      { key: 'sergiy',            color: 0xFF00D4, w: 64,   h: 96   }, // neon pink (hero)
      { key: 'enemy_clerk',       color: 0x2A004A, w: 28,   h: 64   }, // tall thin clerk
      { key: 'enemy_runner',      color: 0x4A1A00, w: 40,   h: 56   },
      { key: 'enemy_tank',        color: 0x002233, w: 80,   h: 80   },
      { key: 'enemy_archivarius', color: 0x1A1A00, w: 56,   h: 56   }, // square, massive
      { key: 'enemy_inspector',   color: 0x3A0000, w: 44,   h: 60   },
      { key: 'boss_vakhtersha',   color: 0x1A004A, w: 120,  h: 140  },
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

  // ─── Particle textures ────────────────────────────────────────────────────

  _makeParticleTextures() {
    // Art Bible palette — primary FX circles
    this._makeGlowCircle('particle_electric',  0x00CFFF, 8);  // Electric Blue bullets
    this._makeGlowCircle('particle_neon_pink', 0xFF00D4, 8);  // Neon Pink flashes
    this._makeGlowCircle('particle_toxic',     0x39FF14, 7);  // Toxic Green poison
    this._makeGlowCircle('particle_violet',    0x7F00FF, 7);  // Ultra-Violet magic
    this._makeGlowCircle('particle_shield',    0xFF00D4, 6);  // Shield reflect
    this._makeGlowCircle('particle_stamp',     0xFF0033, 7);  // Plasma Red stamp slam

    // Pysanka-ornament particle — small diamond shape for explosion pattern
    this._makePysankaParticle('particle_pysanka', 0x00CFFF, 7);

    // Paper / document particle — small rectangle for clerk/archivarius death
    this._makePaperParticle('particle_paper', 9, 7);

    // Legacy keys kept for backward compat — now mapped to Art Bible palette
    this._makeGlowCircle('particle_neon_orange',  0xFFB300, 7); // Cyber-Amber
    this._makeGlowCircle('particle_neon_cyan',    0x00CFFF, 6);
    this._makeGlowCircle('particle_neon_green',   0x39FF14, 6);
    this._makeGlowCircle('particle_red',          0xFF0033, 8);
    this._makeGlowCircle('particle_yellow',       0xFFB300, 6);
  }

  /**
   * Glowing circle with core (used for most FX particles).
   */
  _makeGlowCircle(key, color, r) {
    if (this.textures.exists(key)) return;
    const size = r * 4;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(color, 0.22);
    gfx.fillCircle(size / 2, size / 2, r * 1.9);
    gfx.fillStyle(color, 0.55);
    gfx.fillCircle(size / 2, size / 2, r * 1.2);
    gfx.fillStyle(0xffffff, 0.92);
    gfx.fillCircle(size / 2, size / 2, r * 0.55);
    gfx.generateTexture(key, size, size);
    gfx.destroy();
  }

  /**
   * Pysanka-ornament: small diamond/cross shape for explosion bursts.
   * Colors cycle via particle tint, so we just draw a bright white shape.
   */
  _makePysankaParticle(key, color, r) {
    if (this.textures.exists(key)) return;
    const size = r * 4;
    const cx = size / 2;
    const cy = size / 2;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer glow
    gfx.fillStyle(color, 0.3);
    gfx.fillCircle(cx, cy, r * 1.6);
    // Diamond shape
    gfx.fillStyle(0xffffff, 0.95);
    gfx.fillTriangle(cx, cy - r, cx + r * 0.7, cy, cx, cy + r);
    gfx.fillTriangle(cx, cy - r, cx - r * 0.7, cy, cx, cy + r);
    // Cross arms
    gfx.fillStyle(color, 0.8);
    gfx.fillRect(cx - 1, cy - r * 1.1, 2, r * 2.2);
    gfx.fillRect(cx - r * 0.6, cy - 1, r * 1.2, 2);
    gfx.generateTexture(key, size, size);
    gfx.destroy();
  }

  /**
   * Small rectangular paper fragment for clerk/archivarius death showers.
   */
  _makePaperParticle(key, w, h) {
    if (this.textures.exists(key)) return;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(0xFFFFEE, 0.9);
    gfx.fillRect(0, 0, w, h);
    gfx.lineStyle(1, 0xCCCCBB, 0.7);
    gfx.strokeRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
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
}

/**
 * PreloadScene.js
 * Loads all assets for Оборона Ланчина V4.0 — NEON PSYCHEDELIC EDITION.
 * Generates neon fallback textures on asset error.
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

    // Images
    this.load.image('bg',              'bg.png');
    this.load.image('house_1',         'house_1.png');
    this.load.image('house_2',         'house_2.png');
    this.load.image('house_3',         'house_3.png');
    this.load.image('sergiy',          'sergiy.png');
    this.load.image('enemy_clerk',     'enemy_clerk.png');
    this.load.image('enemy_runner',    'enemy_runner.png');
    this.load.image('enemy_tank',      'enemy_tank.png');
    this.load.image('boss_vakhtersha', 'boss_vakhtersha.png');

    // Audio
    this.load.audio('bgm', 'bgm.mp3');
  }

  create() {
    this._ensureFallbacks();
    this._makeParticleTextures();
    this._makeBossAttackTextures();
    this.scene.start('MenuScene');
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

  /** Procedural textures for boss attack projectiles. */
  _makeBossAttackTextures() {
    // boss_stamp — red rectangle with a border (looks like an ink stamp)
    if (!this.textures.exists('boss_stamp')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xcc0000, 1);
      g.fillRect(0, 0, 34, 34);
      g.lineStyle(3, 0xff4444, 1);
      g.strokeRect(3, 3, 28, 28);
      g.fillStyle(0xff6666, 1);
      g.fillRect(8, 8, 18, 18);
      g.generateTexture('boss_stamp', 34, 34);
      g.destroy();
    }

    // boss_varenyk — yellow-white crescent shape (dumpling silhouette)
    if (!this.textures.exists('boss_varenyk')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffee44, 1);
      g.fillEllipse(15, 13, 30, 22);
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(11, 10, 14, 10);
      g.generateTexture('boss_varenyk', 30, 26);
      g.destroy();
    }
  }
}

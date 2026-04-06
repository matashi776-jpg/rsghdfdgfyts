/**
 * PreloadScene.js
 * Loads all assets for Оборона Ланчина V3.0; generates fallback textures on error.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Loading bar
    this.add.rectangle(width / 2, height / 2 + 50, 500, 28, 0x333333);
    const bar = this.add.rectangle(width / 2 - 250, height / 2 + 50, 0, 28, 0x22cc66);
    bar.setOrigin(0, 0.5);
    this.add.text(width / 2, height / 2, 'Завантаження...', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#ffffff',
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
    this.scene.start('MenuScene');
  }

  _ensureFallbacks() {
    const defs = [
      { key: 'bg',              color: 0x1a1a2e, w: 1280, h: 720  },
      { key: 'house_1',         color: 0x8b4513, w: 100,  h: 200  },
      { key: 'house_2',         color: 0xa0522d, w: 110,  h: 220  },
      { key: 'house_3',         color: 0xcd853f, w: 120,  h: 240  },
      { key: 'sergiy',          color: 0xff8800, w: 64,   h: 96   },
      { key: 'enemy_clerk',     color: 0x888888, w: 48,   h: 64   },
      { key: 'enemy_runner',    color: 0xcc6600, w: 40,   h: 56   },
      { key: 'enemy_tank',      color: 0x334455, w: 80,   h: 80   },
      { key: 'boss_vakhtersha', color: 0x660066, w: 120,  h: 140  },
    ];

    for (const fb of defs) {
      if (
        this._failedKeys.has(fb.key) ||
        !this.textures.exists(fb.key) ||
        this.textures.get(fb.key).key === '__MISSING'
      ) {
        this._makeRect(fb.key, fb.color, fb.w, fb.h);
      }
    }
  }

  _makeParticleTextures() {
    this._makeRect('particle_red',    0xff2200, 8, 8);
    this._makeRect('particle_yellow', 0xffcc00, 6, 6);
  }

  _makeRect(key, color, w, h) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
    console.info(`Generated fallback texture: ${key}`);
  }
}

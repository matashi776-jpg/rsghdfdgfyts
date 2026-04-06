/**
 * PreloadScene.js
 * Loads all assets for Castle Defense; generates fallback textures on error.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Loading bar
    const barBg = this.add.rectangle(width / 2, height / 2, 300, 20, 0x333333);
    const bar = this.add.rectangle(width / 2 - 150, height / 2, 0, 20, 0x22cc66);
    bar.setOrigin(0, 0.5);
    this.load.on('progress', (v) => { bar.width = 300 * v; });

    // Graceful fallback: track failed keys
    this._failedKeys = new Set();
    this.load.on('loaderror', (file) => {
      console.warn(`Asset missing: ${file.key} (${file.url}) — using fallback`);
      this._failedKeys.add(file.key);
    });

    this.load.image('bg',           'bg.png');
    this.load.image('sergiy',       'sergiy.png');
    this.load.image('heroine',      'heroine.png');
    this.load.image('enemy_clerk',  'enemy_clerk.png');
    this.load.image('enemy_tank',   'enemy_tank.png');
  }

  create() {
    this._ensureFallbacks();
    this.scene.start('MenuScene');
  }

  _ensureFallbacks() {
    const fallbacks = [
      { key: 'bg',          color: 0x0a0a1a, w: 800, h: 640 },
      { key: 'sergiy',      color: 0xff8800, w: 64,  h: 96  },
      { key: 'heroine',     color: 0xff44aa, w: 64,  h: 96  },
      { key: 'enemy_clerk', color: 0x888888, w: 48,  h: 64  },
      { key: 'enemy_tank',  color: 0x334455, w: 80,  h: 64  },
    ];

    for (const fb of fallbacks) {
      if (
        this._failedKeys.has(fb.key) ||
        !this.textures.exists(fb.key) ||
        this.textures.get(fb.key).key === '__MISSING'
      ) {
        this._makeRect(fb.key, fb.color, fb.w, fb.h);
      }
    }
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

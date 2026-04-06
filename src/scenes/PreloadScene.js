/**
 * PreloadScene.js
 * Loads all assets; generates fallback textures if files are missing.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Show a simple loading bar
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 300, 20, 0x333333);
    const bar = this.add.rectangle(width / 2 - 150, height / 2, 0, 20, 0x22cc66);
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      bar.width = 300 * value;
    });

    // Attempt to load real assets – errors are caught gracefully
    this.load.on('loaderror', (file) => {
      console.warn(`Asset not found: ${file.key} (${file.url}) – using fallback`);
    });

    this.load.image('bg', '/image_1.png');
    this.load.image('hero', '/hero.png');
    this.load.image('goose', '/goose.png');
    this.load.image('borshch', '/borshch.png');
    this.load.audio('bg_music', '/bgm.mp3');
  }

  create() {
    this._ensureFallbacks();
    this.scene.start('MenuScene');
  }

  /**
   * For each key that failed to load (or returned the default missing texture),
   * generate a simple coloured rectangle texture instead.
   */
  _ensureFallbacks() {
    const fallbacks = [
      { key: 'bg', color: 0x0a0a1a, w: 800, h: 600 },
      { key: 'hero', color: 0xff8800, w: 64, h: 96 },
      { key: 'goose', color: 0xffffff, w: 48, h: 64 },
      { key: 'borshch', color: 0xcc1111, w: 16, h: 16 },
    ];

    for (const fb of fallbacks) {
      if (!this.textures.exists(fb.key) || this.textures.get(fb.key).key === '__MISSING') {
        this._makeRect(fb.key, fb.color, fb.w, fb.h);
      }
    }

    // Always ensure the enemy fallback textures will be available
    // (they are generated on-demand in Enemy.js, but we register grey here as well)
    if (!this.textures.exists('enemy_grey')) {
      this._makeRect('enemy_grey', 0x888888, 28, 38);
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

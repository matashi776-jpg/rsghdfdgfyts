/**
 * DeathScene.js
 * Game-over / death screen for ACID KHUTIR.
 * Shows wave reached, whether a new record was set, meta-level, and offers restart.
 */
import MetaProgression from '../systems/MetaProgression.js';

export default class DeathScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeathScene' });
  }

  init(data) {
    this._wave      = data.wave      || 1;
    this._newRecord = data.newRecord || false;
    this._leveledUp = data.leveledUp || false;
    this._level     = data.level     || MetaProgression.level;
  }

  create() {
    const { width, height } = this.scale;

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

    // Scanline grid
    const grid = this.add.graphics().setAlpha(0.09);
    for (let y = 0; y < height; y += 6) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y); grid.lineTo(width, y);
    }
    grid.strokePath();

    // Title
    this.add.text(width / 2, height * 0.18, 'ХУТІР ВПАВ!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 12,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 40, fill: true },
    }).setOrigin(0.5);

    // Wave reached
    this.add.text(width / 2, height * 0.35, `Дійшов до хвилі: ${this._wave}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#00ffff',
      stroke: '#000033',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 16, fill: true },
    }).setOrigin(0.5);

    // New record badge
    if (this._newRecord) {
      this.add.text(width / 2, height * 0.44, '🏆 НОВИЙ РЕКОРД!', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 5,
        shadow: { offsetX: 0, offsetY: 0, color: '#ffdd00', blur: 18, fill: true },
      }).setOrigin(0.5);
    }

    // Level-up notice
    if (this._leveledUp) {
      this.add.text(width / 2, height * 0.52, `⬆ Мета-рівень ${this._level}!`, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '22px',
        color: '#ff00aa',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff00aa', blur: 14, fill: true },
      }).setOrigin(0.5);
    }

    // All-time record
    this.add.text(width / 2, height * 0.61, `Рекорд: хвиля ${MetaProgression.waveRecord}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#aaaaff',
    }).setOrigin(0.5);

    // Restart button
    const restartBtn = this.add.text(width / 2, height * 0.75, '▶  ГРАТИ ЗНОВУ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '30px',
      color: '#00ffff',
      backgroundColor: '#110022',
      padding: { x: 24, y: 10 },
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 18, fill: true },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerover', () => restartBtn.setColor('#ff00ff'));
    restartBtn.on('pointerout',  () => restartBtn.setColor('#00ffff'));
    restartBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(600, 0, 0, 20);
    });

    // Menu button
    const menuBtn = this.add.text(width / 2, height * 0.86, '🏠  ГОЛОВНЕ МЕНЮ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(600, 0, 0, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Restart — stop UIScene too then re-launch GameScene
      if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
      this.scene.start('GameScene');
    });

    // Neon pulse on title
    this.tweens.add({
      targets: this,
      duration: 1200,
      repeat: -1,
      yoyo: true,
      onUpdate: () => {},
    });
  }
}

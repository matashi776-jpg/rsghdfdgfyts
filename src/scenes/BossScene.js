/**
 * BossScene.js
 * Dedicated boss intro / cutscene before the boss fight.
 */
export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BossScene' });
  }

  init(data) {
    this._nextScene = data.nextScene || 'GameScene';
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(0);

    this.add.text(width / 2, height * 0.3, '⚠ MAUSOLEUM PROTOCOL 2.1 ⚠', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '36px',
      color: '#ff0055',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0055', blur: 30, fill: true },
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, height * 0.5, 'ВАХТЕРША\nактивовано', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '52px',
      color: '#ff00aa',
      align: 'center',
      stroke: '#000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(5);

    // Flash and transition
    this.cameras.main.flash(600, 255, 0, 85);
    this.time.delayedCall(3000, () => {
      this.cameras.main.fadeOut(800);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(this._nextScene);
      });
    });
  }
}

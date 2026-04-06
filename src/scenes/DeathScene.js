/**
 * DeathScene.js
 * Game over screen for ACID KHUTIR.
 */
export default class DeathScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeathScene' });
  }

  init(data) {
    this._wave = data.wave || 1;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x050010).setDepth(0);

    this.add.text(width / 2, height * 0.28, 'ТИ ЗАГИНУВ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#ff0055',
      stroke: '#000',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0055', blur: 40, fill: true },
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, height * 0.45, `Хвиля ${this._wave}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#ff00aa',
      stroke: '#000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, height * 0.56, 'Хутір захоплено вірусом Mausoleum 2.1', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(5);

    // Retry button
    const btn = this.add.text(width / 2, height * 0.72, '↺  СПРОБУВАТИ ЗНОВУ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#00ffff',
      stroke: '#000',
      strokeThickness: 5,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(5);

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout',  () => btn.setColor('#00ffff'));
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(600);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    this.cameras.main.fadeIn(800);
  }
}

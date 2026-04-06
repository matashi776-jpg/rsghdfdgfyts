/**
 * MenuScene.js
 * Main menu for Castle Defense.
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background with slow zoom tween
    const bg = this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);
    this.tweens.add({
      targets: bg,
      scaleX: bg.scaleX * 1.05,
      scaleY: bg.scaleY * 1.05,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Title
    this.add.text(width / 2, height * 0.32, 'ОБОРОНА ЛАНЧИНА', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '52px',
      color: '#ffffff',
    })
      .setOrigin(0.5)
      .setStroke('#000000', 8)
      .setShadow(4, 4, '#ff0000', 0, true, true);

    // Start button — "СТАРТ" with Neon Pink glow border (UI guide 8.6.3)
    const btn = this.add.text(width / 2, height * 0.58, 'СТАРТ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '40px',
      color: '#ff00aa',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00aa', blur: 22, fill: true },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout',  () => btn.setColor('#ff00aa'));
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(1000);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StoryScene');
    });
  }
}

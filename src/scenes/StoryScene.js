/**
 * StoryScene.js
 * Cinematic lore sequence before battle.
 */
export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Black background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    // Fade in bg image
    const bg = this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setAlpha(0);
    this.tweens.add({ targets: bg, alpha: 1, duration: 1500, ease: 'Linear' });

    const textStyle = {
      fontFamily: 'Arial Black, Arial',
      fontSize: '26px',
      color: '#ffffff',
      wordWrap: { width: width * 0.8 },
      align: 'center',
    };

    const showText = (msg, delay, duration = 3000) => {
      this.time.delayedCall(delay, () => {
        const t = this.add.text(width / 2, height / 2, msg, textStyle)
          .setOrigin(0.5)
          .setStroke('#000000', 8)
          .setAlpha(0);
        this.tweens.add({
          targets: t,
          alpha: 1,
          duration: 500,
          ease: 'Linear',
          onComplete: () => {
            this.tweens.add({ targets: t, alpha: 0, duration: 500, delay: duration, ease: 'Linear' });
          },
        });
      });
    };

    // Sequence
    showText('Ланчин, 2026. Сергей варил идеальный крафтовый борщ...', 0, 3500);

    this.time.delayedCall(4000, () => {
      this.cameras.main.shake(1500, 0.01);
    });

    showText('...пока из тумана не выполз Некро-Мавзолей с талончиками на снос!', 4500, 3500);

    showText('ВОЙНА НАЧАЛАСЬ!', 9000, 1500);

    this.time.delayedCall(11000, () => {
      this.scene.start('BattleScene');
    });
  }
}

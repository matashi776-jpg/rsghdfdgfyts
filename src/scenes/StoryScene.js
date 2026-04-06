/**
 * StoryScene.js
 * Cinematic intro — Ukrainian narrative with bgm, tweened text and camera shake.
 */
export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Play BGM (avoid duplicate if already playing from a previous visit)
    if (!this.sound.get('bgm')) {
      this.sound.add('bgm', { loop: true, volume: 0.4 }).play();
    }

    // Background fades in
    const bg = this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setAlpha(0);
    this.tweens.add({ targets: bg, alpha: 1, duration: 1500, ease: 'Sine.easeInOut' });

    const textStyle = {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#ffffff',
      wordWrap: { width: width * 0.72 },
      align: 'center',
    };

    const showText = (msg, delay, duration = 3200, y = height * 0.44) => {
      this.time.delayedCall(delay, () => {
        const t = this.add.text(width / 2, y, msg, textStyle)
          .setOrigin(0.5)
          .setStroke('#000000', 8)
          .setAlpha(0);
        this.tweens.add({
          targets: t,
          alpha: 1,
          duration: 700,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.tweens.add({
              targets: t,
              alpha: 0,
              duration: 600,
              delay: duration,
              ease: 'Sine.easeInOut',
            });
          },
        });
      });
    };

    // ── Narrative sequence ────────────────────────────────────────────────────
    showText('Ланчин, 2026 рік.', 600, 2200);
    showText('Сергій варив ідеальний крафтовий борщ\nдля всього Хутора...', 3200, 3000);

    // Screen shake on the critical line
    this.time.delayedCall(7000, () => {
      this.cameras.main.shake(3000, 0.005);
    });

    showText(
      "Вірус 'Мавзолей 2.1' заразив їхні мізки...\nЛанчин — останній рубіж. Захисти Хутір!",
      7200,
      4000,
      height * 0.42,
    );

    showText('ВІЙНА ПОЧИНАЄТЬСЯ!', 12200, 1600, height * 0.5);

    this.time.delayedCall(14400, () => {
      this.cameras.main.fadeOut(900);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BattleScene');
    });
  }
}

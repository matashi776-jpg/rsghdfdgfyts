/**
 * BossScene.js
 * Dedicated boss-fight scene for ACID KHUTIR.
 * Transitions to DeathScene on player defeat, or back to GameScene continuation on win.
 *
 * Currently implemented as a lightweight wrapper that patches GameScene to know
 * it is in boss mode. The full cinematic boss intro is handled here before handing
 * control back to GameScene.
 */
export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BossScene' });
  }

  init(data) {
    this._data = data || {};
  }

  create() {
    const { width, height } = this.scale;

    // Full-screen neon flash overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0xff00ff, 0);
    this.tweens.add({
      targets: overlay, fillAlpha: 0.7,
      duration: 300, yoyo: true, repeat: 2,
    });

    // Boss title crawl
    const title = this.add.text(width / 2, height * 0.3, 'ТОВАРИШ ВАХТЕРША\nАКТИВУЄ ПРОТОКОЛ 2.1', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '38px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 8,
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 30, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({ targets: title, alpha: 1, duration: 600, ease: 'Sine.easeInOut' });

    const sub = this.add.text(width / 2, height * 0.56, 'ГОТУЙСЯ ДО БОЮ!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '26px',
      color:      '#00ffff',
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 20, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: sub, alpha: 1, duration: 400 });
    });

    // After intro, resume / start GameScene at boss wave
    this.time.delayedCall(2800, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      // If GameScene is paused resume it; otherwise start it
      if (this.scene.isActive('GameScene')) {
        this.scene.resume('GameScene');
      } else {
        this.scene.start('GameScene');
      }
    });
  }
}

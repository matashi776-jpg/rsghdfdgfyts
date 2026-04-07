/**
 * StoryScene.js
 * Cinematic intro — Neon Psychedelic edition with Ukrainian narrative,
 * sine-tween floating text, and high-contrast neon background.
 */
export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Play BGM — psy-trance loop at max energy
    if (!this.sound.get('bgm')) {
      this.sound.add('bgm', { loop: true, volume: 0.55 }).play();
    }

    // ── Neon background ──────────────────────────────────────────────────────
    const bg = this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setTint(0x6600ff);
    this.tweens.add({ targets: bg, alpha: 0.85, duration: 1400, ease: 'Sine.easeInOut' });

    // Dark overlay for contrast
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(1);
    this.tweens.add({ targets: overlay, fillAlpha: 0.55, duration: 1400, ease: 'Sine.easeInOut' });

    // Scanline-style horizontal grid lines for cyberpunk feel
    const grid = this.add.graphics().setDepth(2).setAlpha(0.12);
    for (let y = 0; y < height; y += 6) {
      grid.lineStyle(1, 0x00ffff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // ── Floating/waving neon text helper ─────────────────────────────────────
    const showNeonText = (msg, delay, color, strokeColor, yBase = height * 0.44, shakeDuration = 0) => {
      this.time.delayedCall(delay, () => {
        const t = this.add.text(width / 2, yBase, msg, {
          fontFamily: 'Arial Black, Arial',
          fontSize: '30px',
          color,
          stroke: strokeColor,
          strokeThickness: 6,
          wordWrap: { width: width * 0.74 },
          align: 'center',
          shadow: { offsetX: 0, offsetY: 0, color, blur: 22, fill: true },
        })
          .setOrigin(0.5)
          .setAlpha(0)
          .setDepth(10);

        // Fade in
        this.tweens.add({
          targets: t,
          alpha: 1,
          duration: 600,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Sine-wave float tween (continuous Y oscillation while visible)
            this.tweens.add({
              targets: t,
              y: yBase - 12,
              duration: 1100,
              yoyo: true,
              repeat: 3,
              ease: 'Sine.easeInOut',
            });

            if (shakeDuration > 0) {
              this.cameras.main.shake(shakeDuration, 0.009);
            }

            // Fade out after 3.5 s visible
            this.tweens.add({
              targets: t,
              alpha: 0,
              duration: 600,
              delay: 3500,
              ease: 'Sine.easeInOut',
            });
          },
        });
      });
    };

    // ── Neon pulse background tint cycle ─────────────────────────────────────
    const tints = [0x6600ff, 0xff00aa, 0x0000ff, 0x00ffaa];
    let tintIdx = 0;
    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        tintIdx = (tintIdx + 1) % tints.length;
        this.tweens.add({ targets: bg, tint: tints[tintIdx], duration: 800 });
      },
    });

    // ── Narrative sequence (3 specified lines) ────────────────────────────────
    // Line 1 — Neon Blue
    showNeonText(
      'Ланчин, 2026.\nСергій спокійно варив свій неоновий борщ...',
      700,
      '#00aaff',
      '#000033',
      height * 0.42,
    );

    // Line 2 — Neon Pink, Shaking
    showNeonText(
      '...але з кислотного туману виповз\nНекро-Мавзолей під кайфом вірусу «Мавзолей 2.1»!',
      5500,
      '#ff00aa',
      '#330011',
      height * 0.44,
      2200,
    );

    // Line 3 — Pulsing Ultra-Violet (bright magenta)
    showNeonText(
      'ЗАХИСТИ СВІЙ РІВЕНЬ РЕАЛЬНОСТІ!',
      10500,
      '#cc44ff',
      '#110022',
      height * 0.50,
    );

    // ── Transition ────────────────────────────────────────────────────────────
    this.time.delayedCall(15000, () => {
      this.cameras.main.fadeOut(900, 0, 0, 20);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ExploreScene');
    });
  }
}

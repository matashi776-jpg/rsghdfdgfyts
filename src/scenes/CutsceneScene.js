/**
 * CutsceneScene.js
 * Cinematic cutscene overlay — Neon Psychedelic Cyber-Folk.
 * Supports cutscene types: 'intro' | 'boss_entrance'
 *
 * Launch from another scene:
 *   this.scene.launch('CutsceneScene', { type: 'boss_entrance', onComplete: () => {} });
 *
 * The calling scene should pause itself before launching, and resume in onComplete.
 */
import Locale from '../utils/Locale.js';

export default class CutsceneScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CutsceneScene' });
  }

  init(data) {
    this._type       = data.type || 'intro';
    this._onComplete = data.onComplete || null;
    this._dismissed  = false;
  }

  create() {
    const { width, height } = this.scale;

    // Full-screen overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.90).setDepth(0);

    // Neon scanline grid
    const grid = this.add.graphics().setDepth(1).setAlpha(0.09);
    for (let y = 0; y < height; y += 5) {
      grid.lineStyle(1, 0xff00ff, 1);
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    if (this._type === 'boss_entrance') {
      this._playBossEntrance(width, height);
    } else {
      this._playIntro(width, height);
    }
  }

  // ─── Boss Entrance Cutscene ───────────────────────────────────────────────

  _playBossEntrance(width, height) {
    // Cutscene background image (falls back to neon rect if file missing)
    const bg = this.add.image(width / 2, height / 2, 'cutscene_boss_entrance')
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setDepth(2);
    this.tweens.add({ targets: bg, alpha: 0.85, duration: 700, ease: 'Sine.easeIn' });

    // Glitch flash effect
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xff0044, 0).setDepth(20);
    this.tweens.add({
      targets:   flash,
      fillAlpha: 0.45,
      duration:  110,
      yoyo:      true,
      repeat:    3,
    });

    // Header text
    const header = this.add.text(width / 2, height * 0.20, Locale.t('cutscene_boss_header'), {
      fontFamily:      'Arial Black, Arial',
      fontSize:        '40px',
      color:           '#ff00ff',
      stroke:          '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 30, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: header, alpha: 1, duration: 500, delay: 350 });

    // Boss title subtitle
    const sub = this.add.text(width / 2, height * 0.79, Locale.t('boss_title'), {
      fontFamily:      'Arial Black, Arial',
      fontSize:        '28px',
      color:           '#00ffff',
      stroke:          '#000033',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 20, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: sub, alpha: 1, duration: 500, delay: 750 });

    // Camera shake
    this.cameras.main.shake(1400, 0.014);

    // Auto-dismiss
    this.time.delayedCall(3000, () => this._finish());
  }

  // ─── Intro Cutscene ───────────────────────────────────────────────────────

  _playIntro(width, height) {
    const bg = this.add.image(width / 2, height / 2, 'cutscene_intro_01')
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setDepth(2);
    this.tweens.add({ targets: bg, alpha: 0.90, duration: 900, ease: 'Sine.easeIn' });

    const caption = this.add.text(
      width / 2,
      height * 0.82,
      Locale.t('cutscene_intro'),
      {
        fontFamily:      'Arial Black, Arial',
        fontSize:        '24px',
        color:           '#00ffff',
        stroke:          '#000033',
        strokeThickness: 5,
        wordWrap:        { width: width * 0.78 },
        align:           'center',
        shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 18, fill: true },
      },
    ).setOrigin(0.5).setAlpha(0).setDepth(10);
    this.tweens.add({ targets: caption, alpha: 1, duration: 600, delay: 700 });

    this.time.delayedCall(3400, () => this._finish());
  }

  // ─── Finish ───────────────────────────────────────────────────────────────

  _finish() {
    if (this._dismissed) return;
    this._dismissed = true;
    this.cameras.main.fadeOut(380, 0, 0, 10);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this._onComplete) this._onComplete();
      this.scene.stop();
    });
  }
}

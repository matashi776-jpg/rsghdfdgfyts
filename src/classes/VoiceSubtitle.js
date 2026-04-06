/**
 * VoiceSubtitle.js
 * In-game HUD component that displays character voice-line subtitles.
 *
 * Usage (from a Phaser Scene):
 *   this._subtitle = new VoiceSubtitle(this);
 *   this._subtitle.show('Сергій', line.ua, line.en);
 *
 * The subtitle fades in, holds for a few seconds, then fades out automatically.
 * A new call while one is visible replaces the current line immediately.
 */
export default class VoiceSubtitle {
  /**
   * @param {Phaser.Scene} scene  — the scene that owns this component
   * @param {object}       [opts]
   * @param {number}       [opts.x=640]       — centre-X of the subtitle box
   * @param {number}       [opts.y=620]       — top-Y of the subtitle box
   * @param {number}       [opts.holdMs=3200] — how long the subtitle stays at full opacity
   * @param {number}       [opts.fadeMs=400]  — fade in / out duration in ms
   * @param {number}       [opts.depth=30]    — render depth
   */
  constructor(scene, opts = {}) {
    this._scene   = scene;
    this._holdMs  = opts.holdMs  ?? 3200;
    this._fadeMs  = opts.fadeMs  ?? 400;
    this._depth   = opts.depth   ?? 30;
    const cx      = opts.x ?? scene.scale.width  / 2;
    const cy      = opts.y ?? scene.scale.height - 100;

    // Semi-transparent dark backing
    this._bg = scene.add.rectangle(cx, cy + 18, 780, 60, 0x000000, 0.62)
      .setOrigin(0.5, 0)
      .setDepth(this._depth)
      .setAlpha(0);

    // Speaker name
    this._nameTxt = scene.add.text(cx - 380, cy + 6, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 10, fill: true },
    }).setDepth(this._depth + 1).setAlpha(0);

    // Subtitle text (EN line)
    this._lineTxt = scene.add.text(cx, cy + 24, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '17px',
      color:      '#ffffff',
      stroke:     '#000000',
      strokeThickness: 3,
      wordWrap: { width: 720 },
    }).setOrigin(0.5, 0).setDepth(this._depth + 1).setAlpha(0);

    // UA dialect line (smaller, below)
    this._uaTxt = scene.add.text(cx, cy + 44, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#ccccff',
      stroke:     '#000000',
      strokeThickness: 2,
      wordWrap: { width: 720 },
    }).setOrigin(0.5, 0).setDepth(this._depth + 1).setAlpha(0);

    this._tween  = null;
    this._holdTimer = null;
  }

  /**
   * Display a voice line.
   * @param {string} speaker  — character display name
   * @param {string} ua       — Ukrainian dialect text
   * @param {string} en       — English text
   */
  show(speaker, ua, en) {
    this._cancelCurrent();

    this._nameTxt.setText(speaker + ':');
    this._lineTxt.setText(en);
    this._uaTxt.setText(ua);

    const targets = [this._bg, this._nameTxt, this._lineTxt, this._uaTxt];

    // Fade in
    this._tween = this._scene.tweens.add({
      targets,
      alpha: 1,
      duration: this._fadeMs,
      ease: 'Linear',
      onComplete: () => {
        // Hold
        this._holdTimer = this._scene.time.delayedCall(this._holdMs, () => {
          this._fadeOut();
        });
      },
    });
  }

  _fadeOut() {
    const targets = [this._bg, this._nameTxt, this._lineTxt, this._uaTxt];
    this._tween = this._scene.tweens.add({
      targets,
      alpha: 0,
      duration: this._fadeMs,
      ease: 'Linear',
    });
  }

  _cancelCurrent() {
    if (this._tween)      { this._tween.stop();      this._tween = null; }
    if (this._holdTimer)  { this._holdTimer.remove(); this._holdTimer = null; }
    [this._bg, this._nameTxt, this._lineTxt, this._uaTxt].forEach((o) => o.setAlpha(0));
  }

  /** Remove all display objects (call when scene shuts down). */
  destroy() {
    this._cancelCurrent();
    this._bg.destroy();
    this._nameTxt.destroy();
    this._lineTxt.destroy();
    this._uaTxt.destroy();
  }
}

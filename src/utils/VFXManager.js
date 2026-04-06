/**
 * VFXManager.js
 * Centralised VFX controller — camera shake, hit stop, screen glitch,
 * low-HP vignette, and scanline overlay.
 *
 * Usage (inside a Phaser.Scene):
 *   this.vfx = new VFXManager(this);
 *   this.vfx.shake(150, 0.015);
 *   this.vfx.hitStop(80);
 *   this.vfx.screenGlitch(400);
 */
export default class VFXManager {
  constructor(scene) {
    this.scene          = scene;
    this._hitStopActive = false;
    this._glitchTimer   = null;
    this._glitchGfx     = null;
    this._lowHPOverlay  = null;
    this._lowHPActive   = false;

    // Auto-cleanup when the owning scene shuts down
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy(), this);
  }

  // ── Camera Shake ──────────────────────────────────────────────────────────
  // Wraps Phaser's built-in camera shake so callers don't need a direct ref.
  shake(duration = 150, intensity = 0.015) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  // ── Hit Stop ──────────────────────────────────────────────────────────────
  // Freezes physics for a brief moment — adds "juice" to powerful hits.
  hitStop(duration = 80) {
    if (this._hitStopActive) return;
    this._hitStopActive = true;
    this.scene.physics.pause();
    this.scene.time.delayedCall(duration, () => {
      if (this.scene && this.scene.physics) this.scene.physics.resume();
      this._hitStopActive = false;
    });
  }

  // ── Screen Flash ──────────────────────────────────────────────────────────
  // Brief full-screen colour burst (e.g. boss arrival, phase transition).
  flash(color = 0xff00aa, peakAlpha = 0.4, duration = 200) {
    const { width, height } = this.scene.scale;
    const rect = this.scene.add
      .rectangle(width / 2, height / 2, width, height, color, 0)
      .setDepth(55);
    this.scene.tweens.add({
      targets:   rect,
      fillAlpha: peakAlpha,
      duration:  duration * 0.4,
      yoyo:      true,
      ease:      'Sine.easeInOut',
      onComplete: () => { if (rect.active) rect.destroy(); },
    });
  }

  // ── Screen Glitch ─────────────────────────────────────────────────────────
  // Horizontal RGB-shift bars — boss phase transitions, low HP, crits.
  // Re-draws every ~35 ms for the full `duration`.
  screenGlitch(duration = 400) {
    if (this._glitchGfx) return; // don't stack glitch layers
    const { width, height } = this.scene.scale;
    this._glitchGfx = this.scene.add.graphics()
      .setDepth(62)
      .setBlendMode(Phaser.BlendModes.SCREEN);

    const draw = () => {
      if (!this._glitchGfx) return;
      this._glitchGfx.clear();
      const numBars = Phaser.Math.Between(4, 10);
      for (let i = 0; i < numBars; i++) {
        const barY  = Phaser.Math.Between(0, height - 20);
        const barH  = Phaser.Math.Between(3, 22);
        const shift = Phaser.Math.Between(-14, 14);
        // Red channel shifted right
        this._glitchGfx.fillStyle(0xff0000, 0.18);
        this._glitchGfx.fillRect(shift, barY, width, barH);
        // Cyan channel shifted left
        this._glitchGfx.fillStyle(0x00ffff, 0.18);
        this._glitchGfx.fillRect(-shift, barY + 2, width, barH);
        // White noise band
        this._glitchGfx.fillStyle(0xffffff, 0.05);
        this._glitchGfx.fillRect(Phaser.Math.Between(-4, 4), barY + 1, width, barH);
      }
    };

    draw();
    this._glitchTimer = this.scene.time.addEvent({
      delay:    35,
      repeat:   Math.ceil(duration / 35) - 1,
      callback: draw,
    });

    this.scene.time.delayedCall(duration, () => {
      if (this._glitchTimer) { this._glitchTimer.remove(); this._glitchTimer = null; }
      if (this._glitchGfx)   { this._glitchGfx.destroy();  this._glitchGfx   = null; }
    });
  }

  // ── Low-HP Vignette ───────────────────────────────────────────────────────
  // Pulsing neon-red border when the house HP is critical (< 25 %).
  // Call every frame or whenever the HP ratio changes.
  setLowHPMode(active) {
    if (active === this._lowHPActive) return;
    this._lowHPActive = active;
    const { width, height } = this.scene.scale;

    if (active) {
      this._lowHPOverlay = this.scene.add.graphics().setDepth(58).setAlpha(0);
      const borderW = 60;
      this._lowHPOverlay.fillStyle(0xff0022, 0.38);
      this._lowHPOverlay.fillRect(0,             0,              width,   borderW);
      this._lowHPOverlay.fillRect(0,             height - borderW, width,   borderW);
      this._lowHPOverlay.fillRect(0,             0,              borderW, height);
      this._lowHPOverlay.fillRect(width - borderW, 0,            borderW, height);

      this.scene.tweens.add({
        targets:  this._lowHPOverlay,
        alpha:    1,
        duration: 600,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
      });
    } else {
      if (this._lowHPOverlay) {
        this.scene.tweens.killTweensOf(this._lowHPOverlay);
        this._lowHPOverlay.destroy();
        this._lowHPOverlay = null;
      }
    }
  }

  // ── Scanline Overlay ──────────────────────────────────────────────────────
  // Static CRT-style horizontal lines (call once on scene create).
  createScanlines(alpha = 0.07) {
    const { width, height } = this.scene.scale;
    const gfx = this.scene.add.graphics().setAlpha(alpha).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      gfx.lineStyle(1, 0x00ffff, 1);
      gfx.moveTo(0, y);
      gfx.lineTo(width, y);
    }
    gfx.strokePath();
    return gfx;
  }

  // ── Destroy ───────────────────────────────────────────────────────────────
  destroy() {
    if (this._glitchTimer)  { this._glitchTimer.remove();  this._glitchTimer  = null; }
    if (this._glitchGfx)    { this._glitchGfx.destroy();   this._glitchGfx    = null; }
    if (this._lowHPOverlay) { this._lowHPOverlay.destroy(); this._lowHPOverlay = null; }
    // Resume physics if frozen mid-hitstop (e.g. scene change during stop)
    if (this._hitStopActive && this.scene && this.scene.physics) {
      this.scene.physics.resume();
      this._hitStopActive = false;
    }
  }
}

/**
 * BossTelegraphs.js
 * Visual warning shapes displayed before boss attacks so the player has time to react.
 *
 *  • Red circle        – before Stamp Shot
 *  • Green triangle    – before Varenyk Bomb
 *  • Purple rectangle  – before Bureaucratic Meteor
 */
export default class BossTelegraphs {
  constructor(scene) {
    this.scene  = scene;
    this._active = [];
  }

  // ── Red circle under the boss: warns of an incoming stamp ────────────────────
  showStampTelegraph(x, y, duration, onComplete) {
    const circle = this.scene.add.circle(x, y, 55, 0xff0000, 0).setDepth(9);
    circle.setStrokeStyle(3, 0xff2200, 1);

    // Fade in
    this.scene.tweens.add({
      targets: circle,
      fillAlpha: 0.40,
      duration: duration * 0.65,
      onComplete: () => {
        // Flash + expand on fire
        this.scene.tweens.add({
          targets: circle,
          scaleX: 1.5, scaleY: 1.5, fillAlpha: 0, alpha: 0,
          duration: duration * 0.35,
          onComplete: () => {
            circle.destroy();
            this._removeActive(circle);
            if (onComplete) onComplete();
          },
        });
      },
    });
    this._active.push(circle);
  }

  // ── Green triangle: warns of an incoming varenyk bomb ────────────────────────
  showVarenykTelegraph(x, y, duration, onComplete) {
    // Phaser triangle: (x, y, x1, y1, x2, y2, x3, y3)
    const tri = this.scene.add
      .triangle(x, y + 16, 0, 44, 44, -22, -44, -22, 0x00ff44, 0)
      .setDepth(9);
    tri.setStrokeStyle(2, 0x00ff44, 1);

    this.scene.tweens.add({
      targets: tri,
      fillAlpha: 0.55,
      duration: duration * 0.6,
      onComplete: () => {
        this.scene.tweens.add({
          targets: tri,
          scaleX: 1.6, scaleY: 1.6, fillAlpha: 0, alpha: 0,
          duration: duration * 0.4,
          onComplete: () => {
            tri.destroy();
            this._removeActive(tri);
            if (onComplete) onComplete();
          },
        });
      },
    });
    this._active.push(tri);
  }

  // ── Purple vertical column: warns of a meteor strike at x ────────────────────
  showMeteorTelegraph(x, duration, onComplete) {
    const { height } = this.scene.scale;
    const rect = this.scene.add
      .rectangle(x, height / 2, 92, height, 0x8800ff, 0)
      .setDepth(9);
    rect.setStrokeStyle(2, 0xcc00ff, 1);

    this.scene.tweens.add({
      targets: rect,
      fillAlpha: 0.28,
      duration: duration * 0.55,
      onComplete: () => {
        // Pulse twice then fire
        this.scene.tweens.add({
          targets: rect,
          fillAlpha: 0.55,
          duration: 120,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            rect.destroy();
            this._removeActive(rect);
            if (onComplete) onComplete();
          },
        });
      },
    });
    this._active.push(rect);
  }

  // ── Vibration effect on the boss sprite (phase 3 speed-up warning) ──────────
  showVibrateTelegraph(sprite, duration) {
    if (!sprite || !sprite.active) return;
    const origX = sprite.x;
    const tween = this.scene.tweens.add({
      targets: sprite,
      x: origX + 6,
      duration: 60,
      yoyo: true,
      repeat: Math.floor(duration / 120),
      onComplete: () => { if (sprite.active) sprite.x = origX; },
    });
    this._active.push(tween);
  }

  _removeActive(obj) {
    const i = this._active.indexOf(obj);
    if (i !== -1) this._active.splice(i, 1);
  }

  destroy() {
    for (const obj of this._active) {
      if (!obj) continue;
      if (typeof obj.destroy === 'function' && obj.active !== false) obj.destroy();
      else if (typeof obj.stop === 'function') obj.stop();
    }
    this._active = [];
  }
}

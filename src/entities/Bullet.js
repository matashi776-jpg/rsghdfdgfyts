/**
 * Bullet.js
 * A single neon projectile fired by a defender.
 * Extends Phaser.Physics.Arcade.Sprite so it can live inside a physics Group.
 */
import { TRAIL_CLEANUP_DELAY_MS, BULLET_LIFETIME_MS } from './constants.js';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'particle_neon_pink');
    this.speed = 460;
    /** @type {Phaser.GameObjects.Particles.ParticleEmitter|null} */
    this.particleTrail = null;
  }

  /**
   * Activate and fire this bullet toward (targetX, targetY).
   * @param {number} x
   * @param {number} y
   * @param {number} targetX
   * @param {number} targetY
   */
  fire(x, y, targetX, targetY) {
    this.enableBody(true, x, y, true, true);
    this.setDisplaySize(16, 10);
    this.setDepth(6);
    this.setTint(0xff00aa);

    const angle = Math.atan2(targetY - y, targetX - x);
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

    // Neon trail
    const trail = this.scene.add.particles(x, y, 'particle_neon_orange', {
      speed:     { min: 8, max: 40 },
      scale:     { start: 0.7, end: 0 },
      alpha:     { start: 0.9, end: 0 },
      lifespan:  200,
      frequency: 20,
      quantity:  2,
      tint:      [0xff00aa, 0xff6600],
    }).setDepth(5);
    trail.startFollow(this);
    this.particleTrail = trail;

    // Auto-destroy after BULLET_LIFETIME_MS if it hasn't hit anything
    this.scene.time.delayedCall(BULLET_LIFETIME_MS, () => this._retire());
  }

  /** Deactivate and clean up trail. */
  _retire() {
    if (!this.active) return;
    if (this.particleTrail && this.particleTrail.active) {
      this.particleTrail.stopFollow();
      this.scene.time.delayedCall(TRAIL_CLEANUP_DELAY_MS, () => {
        if (this.particleTrail && this.particleTrail.active) {
          this.particleTrail.destroy();
          this.particleTrail = null;
        }
      });
    }
    this.disableBody(true, true);
  }

  /** Called by Phaser every frame for active pool members. */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // Keep trail position synced (startFollow handles it, but guard against edge cases)
  }
}

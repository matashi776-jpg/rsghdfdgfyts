/**
 * BulletPool.js
 * Object pool of Bullet sprites backed by a Phaser physics group.
 * Manages firing and lifetime of all projectiles in BattleScene.
 */
import Bullet from './Bullet.js';
import { BULLET_SPAWN_OFFSET_X, TRAIL_CLEANUP_DELAY_MS } from './constants.js';

export default class BulletPool {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;

    /** @type {Phaser.Physics.Arcade.Group} */
    this.group = scene.physics.add.group({
      classType:      Bullet,
      maxSize:        50,
      runChildUpdate: true,
    });
  }

  /**
   * Fire a bullet from a defender sprite toward a target sprite.
   * @param {Phaser.GameObjects.Image} defender
   * @param {Phaser.GameObjects.Sprite} target
   */
  fire(defender, target) {
    const bullet = this.group.get(
      defender.x + BULLET_SPAWN_OFFSET_X,
      defender.y,
    );
    if (!bullet) return; // pool exhausted

    bullet.fire(
      defender.x + BULLET_SPAWN_OFFSET_X,
      defender.y,
      target.x,
      target.y,
    );
  }

  /**
   * Deactivate a specific bullet (called after it hits an enemy).
   * Cleans up the neon trail before pooling the sprite.
   * @param {Bullet} bullet
   */
  retire(bullet) {
    if (!bullet.active) return;
    if (bullet.particleTrail && bullet.particleTrail.active) {
      bullet.particleTrail.stopFollow();
      this.scene.time.delayedCall(TRAIL_CLEANUP_DELAY_MS, () => {
        if (bullet.particleTrail && bullet.particleTrail.active) {
          bullet.particleTrail.destroy();
          bullet.particleTrail = null;
        }
      });
    }
    bullet.disableBody(true, true);
  }
}

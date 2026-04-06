/**
 * CollisionSystem.js
 * Wires up Phaser arcade-physics overlaps for BattleScene.
 *
 * Depends on scene properties:
 *   scene.enemiesGroup, scene.projectilesGroup, scene.house,
 *   scene.modifiers, scene.bulletPool
 */
import { TRAIL_CLEANUP_DELAY_MS } from '../entities/constants.js';
export default class CollisionSystem {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
  }

  /** Register all overlap handlers — call once in BattleScene.create(). */
  setup() {
    const scene = this.scene;

    // Enemy reaches the defensive wall
    scene.physics.add.overlap(
      scene.enemiesGroup,
      scene.house,
      (enemy) => this._onEnemyReachWall(enemy),
      null,
      this,
    );

    // Projectile hits an enemy
    scene.physics.add.overlap(
      scene.projectilesGroup,
      scene.enemiesGroup,
      (proj, enemy) => this._onProjectileHitEnemy(proj, enemy),
      null,
      this,
    );
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  _onEnemyReachWall(enemy) {
    if (!enemy.active) return;
    enemy.body.setVelocityX(0);
    enemy.isAttackingWall = true;
  }

  _onProjectileHitEnemy(proj, enemy) {
    const scene = this.scene;
    if (!proj.active || !enemy.active) return;

    const damage = Math.floor(20 * scene.modifiers.damage);
    enemy.hp -= damage;

    scene._spawnHitParticle(proj.x, proj.y);

    // Retire the bullet via the pool so the trail is cleaned up properly
    if (scene.bulletPool) {
      scene.bulletPool.retire(proj);
    } else {
      // Fallback for plain sprites (backward compat)
      if (proj.particleTrail && proj.particleTrail.active) {
        proj.particleTrail.stopFollow();
        scene.time.delayedCall(TRAIL_CLEANUP_DELAY_MS, () => {
          if (proj.particleTrail && proj.particleTrail.active) {
            proj.particleTrail.destroy();
          }
        });
      }
      proj.destroy();
    }

    if (enemy.hp <= 0) {
      scene._killEnemy(enemy);
    }
  }
}

/**
 * ProjectileSystem.js
 * Spawns and manages projectiles for ACID KHUTIR defenders.
 * Handles firing logic, neon trails, and collision clean-up.
 */
import GameConfig from '../core/GameConfig.js';

export default class ProjectileSystem {
  /**
   * @param {Phaser.Scene}          scene
   * @param {Phaser.Physics.Arcade.Group} projectilesGroup
   * @param {FXSystem}              fxSystem
   */
  constructor(scene, projectilesGroup, fxSystem) {
    this._scene   = scene;
    this._group   = projectilesGroup;
    this._fx      = fxSystem;
  }

  /**
   * Fire a projectile from `origin` toward `targetSprite`.
   * @param {{x:number, y:number}} origin
   * @param {Phaser.GameObjects.Sprite} targetSprite
   * @param {number} damage
   */
  fire(origin, targetSprite, damage) {
    const proj = this._group.create(origin.x + 22, origin.y, 'particle_neon_pink');
    if (!proj) return;
    proj.setDisplaySize(16, 10);
    proj.setDepth(6);
    proj.setTint(0xff00aa);
    proj.damage = damage;

    const angle = Math.atan2(
      targetSprite.y - origin.y,
      targetSprite.x - origin.x,
    );
    proj.body.setVelocity(
      Math.cos(angle) * GameConfig.PROJECTILE_SPEED,
      Math.sin(angle) * GameConfig.PROJECTILE_SPEED,
    );

    proj.trail = this._fx ? this._fx.attachTrail(proj) : null;

    this._scene.time.delayedCall(GameConfig.PROJECTILE_LIFETIME, () => {
      this._destroyProjectile(proj);
    });
  }

  /**
   * Called by the scene's overlap collider when a projectile hits an enemy.
   * @param {Phaser.GameObjects.Sprite} proj
   * @param {Phaser.GameObjects.Sprite} enemySprite
   * @param {object}                    modifiers
   */
  onHit(proj, enemySprite, modifiers) {
    if (!proj.active || !enemySprite.active) return;
    const damage = Math.floor((proj.damage || GameConfig.PROJECTILE_BASE_DAMAGE) * modifiers.damage);

    if (this._fx) this._fx.spawnHitSpark(proj.x, proj.y);

    // Acid splash AOE (Кислотний Буряк perk)
    if (modifiers.acidSplash > 0 && this._fx) {
      this._fx.spawnAcidSplash(proj.x, proj.y);
    }

    this._destroyProjectile(proj);

    const enemy = enemySprite.enemyRef;
    if (enemy) {
      enemy.takeDamage(damage);
    } else {
      // Legacy fallback for raw sprite enemies
      enemySprite.hp = (enemySprite.hp || 0) - damage;
    }
  }

  _destroyProjectile(proj) {
    if (!proj || !proj.active) return;
    if (proj.trail && proj.trail.active) {
      proj.trail.stopFollow();
      this._scene.time.delayedCall(260, () => {
        if (proj.trail && proj.trail.active) proj.trail.destroy();
      });
    }
    proj.destroy();
  }
}

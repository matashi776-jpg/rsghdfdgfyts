/**
 * ProjectileSystem.js
 * Manages player and enemy projectiles for ACID KHUTIR — Stage 1
 */
export default class ProjectileSystem {
  constructor(scene) {
    this.scene   = scene;
    this.bullets = scene.physics.add.group({
      defaultKey:    'fx_bullet_blue',
      maxSize:       80,
      runChildUpdate: false,
    });
    this.speed  = 700;
    this.damage = 25;
  }

  /**
   * Fire a bullet from (x, y) in direction (angle in radians).
   * @param {number} x
   * @param {number} y
   * @param {number} angle  radians
   * @param {boolean} [explosive=false]  Vohniana Ptashka amulet effect
   */
  fire(x, y, angle, explosive = false) {
    const bullet = this.bullets.get(x, y);
    if (!bullet) return null;

    bullet.setActive(true).setVisible(true);
    bullet.setScale(0.8);
    bullet.lifespan  = 1500;
    bullet.damage    = this.damage;
    bullet.explosive = explosive;

    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    bullet.setVelocity(vx, vy);
    bullet.setRotation(angle);

    return bullet;
  }

  /**
   * Fire three bullets in a spread — ritual burst triggered by Веселка amulet.
   * @param {number} x
   * @param {number} y
   * @param {number} angle      central angle in radians
   * @param {number} spread     half-angle spread in radians
   * @param {boolean} explosive
   */
  fireBurst(x, y, angle, spread, explosive = false) {
    this.fire(x, y, angle - spread, explosive);
    this.fire(x, y, angle,          explosive);
    this.fire(x, y, angle + spread, explosive);
  }

  /**
   * Called when a bullet hits an enemy.
   */
  onHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    enemy.takeDamage?.(bullet.damage ?? this.damage);

    // Explosive bullets (Вогняна пташка amulet) — AoE splash
    if (bullet.explosive) {
      const SPLASH_RADIUS = 90;
      const splashDmg     = Math.round((bullet.damage ?? this.damage) * 0.5);
      this.scene.enemies?.getChildren().forEach(e => {
        if (!e.active || e === enemy) return;
        const dist = Phaser.Math.Distance.Between(bullet.x, bullet.y, e.x, e.y);
        if (dist <= SPLASH_RADIUS) {
          e.takeDamage?.(splashDmg);
          this.scene.fxSystem?.spawnHit?.(e.x, e.y);
        }
      });
      this.scene.fxSystem?.spawnExplosion?.(bullet.x, bullet.y);
    }

    bullet.setActive(false).setVisible(false);
    bullet.setVelocity(0, 0);
  }

  update(time, delta) {
    this.bullets.getChildren().forEach(b => {
      if (!b.active) return;
      b.lifespan -= delta;
      if (b.lifespan <= 0 || b.x < -50 || b.x > this.scene.scale.width + 50) {
        b.setActive(false).setVisible(false);
        b.setVelocity(0, 0);
      }
    });
  }
}

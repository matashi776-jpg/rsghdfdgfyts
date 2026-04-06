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
   */
  fire(x, y, angle) {
    const bullet = this.bullets.get(x, y);
    if (!bullet) return null;

    bullet.setActive(true).setVisible(true);
    bullet.setScale(0.8);
    bullet.lifespan = 1500;

    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    bullet.setVelocity(vx, vy);
    bullet.setRotation(angle);
    bullet.damage = this.damage;

    return bullet;
  }

  /**
   * Called when a bullet hits an enemy.
   */
  onHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    bullet.setActive(false).setVisible(false);
    bullet.setVelocity(0, 0);
    enemy.takeDamage?.(bullet.damage ?? this.damage);
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

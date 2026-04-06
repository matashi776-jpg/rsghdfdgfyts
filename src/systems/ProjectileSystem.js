/**
 * ProjectileSystem.js
 * Manages player and enemy projectiles for ACID KHUTIR.
 */
export default class ProjectileSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
  }

  fire(x, y, targetX, targetY, damage, speed = 520, texKey = 'particle_neon_cyan') {
    const useTex = this.scene.textures.exists(texKey) ? texKey : '__DEFAULT';
    const bullet = this.group.create(x, y, useTex);
    bullet.setDepth(10);
    bullet.damage = damage;

    const angle = Math.atan2(targetY - y, targetX - x);
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.setRotation(angle);

    // Auto-destroy after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });

    return bullet;
  }

  addOverlapWithGroup(enemyGroup, callback) {
    this.scene.physics.add.overlap(this.group, enemyGroup, callback);
  }

  destroy() {
    this.group.clear(true, true);
  }
}

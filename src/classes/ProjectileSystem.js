/**
 * ProjectileSystem.js
 * Manages player bullet spawning and pooling — Acid Khutir
 */
export default class ProjectileSystem {
  constructor(scene) {
    this.scene = scene;

    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 50,
      runChildUpdate: true,
    });
  }

  spawnBullet(x, y, pointer) {
    const bullet = this.bullets.get(x, y, 'sprites', 'fx_bullet_blue');

    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);

    const angle = Phaser.Math.Angle.Between(x, y, pointer.worldX, pointer.worldY);
    this.scene.physics.velocityFromRotation(angle, 500, bullet.body.velocity);

    bullet.update = () => {
      if (
        bullet.x < 0 ||
        bullet.x > 1280 ||
        bullet.y < 0 ||
        bullet.y > 720
      ) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    };
  }
}

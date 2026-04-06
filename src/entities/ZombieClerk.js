/**
 * ZombieClerk.js
 * Basic enemy — Zombie Clerk — ACID KHUTIR Stage 1
 */
export default class ZombieClerk extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_zombie_clerk_walk_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp       = 60;
    this.hp          = 60;
    this.speed       = 80;
    this.scoreValue  = 10;
    this.contactDamage = 15;

    this.setDepth(4);
    this._buildAnims(scene);
    this.play('zombie_clerk_walk', true);
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    // Move toward player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.setFlipX(player.x < this.x);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => this.clearTint());
  }

  _buildAnims(scene) {
    if (scene.anims.exists('zombie_clerk_walk')) return;
    scene.anims.create({
      key:       'zombie_clerk_walk',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `enemy_zombie_clerk_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 8,
      repeat:    -1,
    });
  }
}

/**
 * Archivarius.js
 * Mid-tier enemy — Archivarius — ACID KHUTIR Stage 1
 */
export default class Archivarius extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_archivarius_full');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp       = 120;
    this.hp          = 120;
    this.speed       = 60;
    this.scoreValue  = 25;
    this.contactDamage = 20;
    this._attackTimer  = 0;
    this._attackRate   = 2200; // ms

    this.setDepth(4);
    this._buildAnims(scene);
    this.play('archivarius_attack', true);
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // Charge in range, otherwise drift slowly
    const s = dist < 350 ? this.speed * 1.4 : this.speed * 0.5;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(Math.cos(angle) * s, Math.sin(angle) * s);
    this.setFlipX(player.x < this.x);

    // Ranged attack
    if (time - this._attackTimer > this._attackRate && dist < 400) {
      this._attackTimer = time;
      this._throwPaper(angle);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => this.clearTint());
  }

  _throwPaper(angle) {
    // Reuse projectile system but in reverse direction
    const bullet = this.scene.add.rectangle(this.x, this.y, 12, 6, 0xffcc00)
      .setDepth(5);
    this.scene.physics.add.existing(bullet);
    bullet.body.setVelocity(
      Math.cos(angle) * 260,
      Math.sin(angle) * 260
    );
    // Collide with player
    this.scene.physics.add.overlap(bullet, this.scene.player, () => {
      this.scene.player.takeDamage(12);
      bullet.destroy();
    });
    this.scene.time.delayedCall(1800, () => bullet.destroy?.());
  }

  _buildAnims(scene) {
    if (scene.anims.exists('archivarius_attack')) return;
    scene.anims.create({
      key:       'archivarius_attack',
      frames:    Array.from({ length: 6 }, (_, i) =>
        ({ key: `enemy_archivarius_attack_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 7,
      repeat:    -1,
    });
  }
}

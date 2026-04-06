/**
 * Inspector.js
 * Heavy enemy — Inspector — ACID KHUTIR Stage 1
 */
export default class Inspector extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_inspector_full');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp       = 200;
    this.hp          = 200;
    this.speed       = 45;
    this.scoreValue  = 40;
    this.contactDamage = 30;
    this._slamTimer   = 0;
    this._slamRate    = 3000;
    this._slamming    = false;

    this.setDepth(4);
    this.setScale(1.3);
    this._buildAnims(scene);
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active || this._slamming) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.setFlipX(player.x < this.x);

    if (time - this._slamTimer > this._slamRate && dist < 180) {
      this._slamTimer = time;
      this._doSlam();
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(120, () => this.clearTint());
  }

  _doSlam() {
    this._slamming = true;
    this.setVelocity(0, 0);
    this.play('inspector_slam', true);

    this.scene.time.delayedCall(600, () => {
      // AoE damage in radius
      const player = this.scene.player;
      if (player && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 160) {
        player.takeDamage(30);
        this.scene.cameras.main.shake(300, 0.015);
      }
      this._slamming = false;
    });
  }

  _buildAnims(scene) {
    if (scene.anims.exists('inspector_slam')) return;
    scene.anims.create({
      key:       'inspector_slam',
      frames:    Array.from({ length: 6 }, (_, i) =>
        ({ key: `enemy_inspector_slam_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 10,
      repeat:    0,
    });
  }
}

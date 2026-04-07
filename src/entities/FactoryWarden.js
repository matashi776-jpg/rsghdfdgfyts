/**
 * FactoryWarden.js
 * Enemy — Factory Warden — large industrial enforcer with chain hammer
 * Chain-hammer AoE slam, persistent toxic smoke trail.
 * Toxic green/industrial palette; scaled up 1.4×.
 */
export default class FactoryWarden extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_factory_warden_full');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp         = 350;
    this.hp            = 350;
    this.speed         = 36;
    this.scoreValue    = 60;
    this.contactDamage = 35;

    this._hammerTimer = 0;
    this._hammerRate  = 3600; // ms between hammer slams
    this._hammering   = false;

    this._smokeTimer  = 0;
    this._smokeRate   = 850; // ms between smoke puffs

    this.setDepth(4);
    this.setScale(1.4);
    this.setTint(0x44cc44); // Toxic green
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    if (!this._hammering) {
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
      this.setFlipX(player.x < this.x);
    }

    // Toxic smoke trail
    if (time - this._smokeTimer > this._smokeRate) {
      this._smokeTimer = time;
      this._emitToxicSmoke();
    }

    // Chain-hammer AoE slam
    if (!this._hammering && time - this._hammerTimer > this._hammerRate && dist < 200) {
      this._hammerTimer = time;
      this._doHammerSlam();
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(120, () => this.setTint(0x44cc44));
  }

  _doHammerSlam() {
    this._hammering = true;
    this.setVelocity(0, 0);
    this.setTint(0x00ff00);
    this.scene.cameras.main.shake(380, 0.018);

    // Expanding shockwave ring
    const ring = this.scene.add.circle(this.x, this.y, 12, 0x44ff44, 0.65).setDepth(5);
    this.scene.tweens.add({
      targets:  ring,
      scaleX:   15,
      scaleY:   15,
      alpha:    0,
      duration: 520,
      onComplete: () => ring.destroy(),
    });

    // AoE damage check at peak of swing
    this.scene.time.delayedCall(260, () => {
      const player = this.scene.player;
      if (player?.active && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 195) {
        player.takeDamage(this.contactDamage);
      }
    });

    this.scene.time.delayedCall(720, () => {
      this._hammering = false;
      this.setTint(0x44cc44);
    });
  }

  _emitToxicSmoke() {
    const sx = this.x + Phaser.Math.Between(-18, 18);
    const sy = this.y + Phaser.Math.Between(-12, 12);
    const r  = Phaser.Math.Between(9, 20);

    const smoke = this.scene.add.circle(sx, sy, r, 0x33ff44, 0.32).setDepth(3);

    this.scene.tweens.add({
      targets:  smoke,
      y:        smoke.y - 44,
      alpha:    0,
      scaleX:   2.2,
      scaleY:   2.2,
      duration: 1300,
      onComplete: () => smoke.destroy(),
    });

    // Damage the player if they overlap the smoke cloud
    const player = this.scene.player;
    if (player?.active) {
      this.scene.time.delayedCall(350, () => {
        if (smoke.active && Phaser.Math.Distance.Between(sx, sy, player.x, player.y) < r + 18) {
          player.takeDamage(3);
        }
      });
    }
  }
}

/**
 * PropagandaHerald.js
 * Enemy — Propaganda Herald — theatrical ranged attacker with megaphone
 * Fires a 3-way spread of propaganda blasts; retreats to keep distance.
 * Yellow-green palette with ribbon-like symbol projectiles.
 */
export default class PropagandaHerald extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_propaganda_herald_full');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp         = 90;
    this.hp            = 90;
    this.speed         = 70;
    this.scoreValue    = 30;
    this.contactDamage = 10;

    this._blastTimer  = 0;
    this._blastRate   = 1900; // ms between megaphone bursts
    this._preferDist  = 230;  // preferred engagement distance

    this.setDepth(4);
    this.setTint(0xccff44); // Yellow-green tint
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    // Kite: retreat if too close, drift forward if too far, strafe in range
    if (dist < this._preferDist - 20) {
      this.setVelocity(-Math.cos(angle) * this.speed, -Math.sin(angle) * this.speed);
    } else if (dist > this._preferDist + 80) {
      this.setVelocity(Math.cos(angle) * this.speed * 0.5, Math.sin(angle) * this.speed * 0.5);
    } else {
      // Lateral strafe
      this.setVelocity(-Math.sin(angle) * this.speed * 0.6, Math.cos(angle) * this.speed * 0.6);
    }

    this.setFlipX(player.x < this.x);

    // Propaganda blast
    if (time - this._blastTimer > this._blastRate && dist < 460) {
      this._blastTimer = time;
      this._firePropagandaBlast(angle);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => this.setTint(0xccff44));
  }

  _firePropagandaBlast(angle) {
    const spread = 0.28;
    [-spread, 0, spread].forEach(offset => {
      const a = angle + offset;
      const bullet = this.scene.add.rectangle(this.x, this.y, 15, 6, 0xaaff00)
        .setDepth(5)
        .setRotation(a);
      this.scene.physics.add.existing(bullet);
      bullet.body.setVelocity(Math.cos(a) * 230, Math.sin(a) * 230);

      this.scene.physics.add.overlap(bullet, this.scene.player, () => {
        if (this.scene.player?.active) this.scene.player.takeDamage(8);
        bullet.destroy();
      });
      // Auto-destroy after 2 s
      this.scene.time.delayedCall(2000, () => bullet.destroy?.());
    });
  }
}

/**
 * RetroEnforcer.js
 * Enemy — Retro Enforcer — strict Soviet-style guard with mechanical implants
 * Chain club for a knockback slam; cyan-glowing implant veins.
 * Neon psychedelic cyber-folk: thick outlines, flat neon colours.
 */
export default class RetroEnforcer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_retro_enforcer_full');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp         = 180;
    this.hp            = 180;
    this.speed         = 52;
    this.scoreValue    = 35;
    this.contactDamage = 22;

    this._clubTimer  = 0;
    this._clubRate   = 2600; // ms between chain-club slams
    this._clubbing   = false;

    this.setDepth(4);
    this.setTint(0x88ffff); // Cyan implant vein tint
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active || this._clubbing) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.setFlipX(player.x < this.x);

    // Chain-club slam when close
    if (time - this._clubTimer > this._clubRate && dist < 150) {
      this._clubTimer = time;
      this._doClubStrike();
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => this.setTint(0x88ffff));
  }

  _doClubStrike() {
    this._clubbing = true;
    this.setVelocity(0, 0);
    this.setTint(0x00ffff);
    this.scene.cameras.main.shake(180, 0.010);

    const player = this.scene.player;
    if (player && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 145) {
      player.takeDamage(Math.round(this.contactDamage * 1.5));
      // Knockback
      const ang = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      player.setVelocity(Math.cos(ang) * 280, Math.sin(ang) * 280);
      this.scene.time.delayedCall(200, () => {
        if (player.active) player.setVelocity(0, 0);
      });
    }

    this.scene.time.delayedCall(480, () => {
      this._clubbing = false;
      this.setTint(0x88ffff);
    });
  }
}

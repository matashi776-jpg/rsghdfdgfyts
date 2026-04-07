/**
 * RetroEnforcer.js
 * Mid-tier enemy — Retro Enforcer — Neon Psychedelic Cyber-Folk
 *
 * A strict cyber-guard with mechanical body inserts, a metal baton,
 * and pulsing cyan vein lighting. Intercepts the player and delivers
 * a baton-charge strike at close range.
 */
export default class RetroEnforcer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_retro_enforcer_walk_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp         = 150;
    this.hp            = 150;
    this.speed         = 55;
    this.scoreValue    = 30;
    this.contactDamage = 25;

    this._chargeTimer   = 0;
    this._chargeRate    = 2800; // ms between charges
    this._charging      = false;
    this._pulseTween    = null;

    this.setDepth(4);
    this._buildAnims(scene);
    this.play('retro_enforcer_walk', true);
    this._startCyanPulse();
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    if (this._charging) return;

    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.setFlipX(player.x < this.x);

    // Baton charge when close enough
    if (time - this._chargeTimer > this._chargeRate && dist < 220) {
      this._chargeTimer = time;
      this._doChargeStrike(angle);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(110, () => {
      if (this.active) this._applyCyanTint();
    });
  }

  destroy(fromScene) {
    this._pulseTween?.stop();
    super.destroy(fromScene);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _doChargeStrike(angle) {
    this._charging = true;
    const speed    = this.speed * 3.5;

    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Spark flash on charge start
    this._spawnCyanSpark();

    this.scene.time.delayedCall(380, () => {
      if (!this.active) return;

      // Baton-range AoE damage
      const player = this.scene.player;
      if (player && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 130) {
        player.takeDamage(28);
        this.scene.cameras.main.shake(250, 0.012);
      }

      this.setVelocity(0, 0);
      this._charging = false;
    });
  }

  _startCyanPulse() {
    this._applyCyanTint();
    this._pulseTween = this.scene.tweens.add({
      targets:  this,
      alpha:    { from: 1, to: 0.82 },
      duration: 650,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
  }

  _applyCyanTint() {
    if (this.active) this.setTint(0x33ddff);
  }

  _spawnCyanSpark() {
    const gfx = this.scene.add.graphics().setDepth(5);
    gfx.fillStyle(0x00ffff, 0.9);
    gfx.fillCircle(this.x, this.y, 14);
    this.scene.tweens.add({
      targets:  gfx,
      alpha:    0,
      scaleX:   2.5,
      scaleY:   2.5,
      duration: 300,
      onComplete: () => gfx.destroy(),
    });
  }

  _buildAnims(scene) {
    if (scene.anims.exists('retro_enforcer_walk')) return;
    scene.anims.create({
      key:       'retro_enforcer_walk',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `enemy_retro_enforcer_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 9,
      repeat:    -1,
    });
  }
}

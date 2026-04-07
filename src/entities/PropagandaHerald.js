/**
 * PropagandaHerald.js
 * Ranged enemy — Propaganda Herald — Neon Psychedelic Cyber-Folk
 *
 * A theatrical infected carrier with a mechanical megaphone. Keeps a
 * mid-range distance from the player and fires yellow-green propaganda
 * shockwaves at regular intervals. Satirical and unsettling in equal measure.
 */
export default class PropagandaHerald extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_propaganda_herald_walk_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp         = 95;
    this.hp            = 95;
    this.speed         = 68;
    this.scoreValue    = 35;
    this.contactDamage = 12;

    this._shoutTimer   = 0;
    this._shoutRate    = 2400; // ms between shout waves
    this._preferDist   = 310; // ideal distance from player

    this.setDepth(4);
    this._buildAnims(scene);
    this.play('propaganda_herald_walk', true);
    this.setTint(0xbbff22);
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    // Maintain preferred distance: retreat if too close, advance if too far
    let moveSpeed;
    if (dist < this._preferDist - 50) {
      // Too close — retreat
      moveSpeed = -this.speed * 0.9;
    } else if (dist > this._preferDist + 60) {
      // Too far — advance
      moveSpeed = this.speed * 0.75;
    } else {
      // Strafe perpendicular
      const perp = angle + Math.PI * 0.5;
      this.setVelocity(Math.cos(perp) * this.speed * 0.5, Math.sin(perp) * this.speed * 0.5);
      this.setFlipX(player.x < this.x);

      if (time - this._shoutTimer > this._shoutRate) {
        this._shoutTimer = time;
        this._fireShoutWave(angle);
      }
      return;
    }

    this.setVelocity(Math.cos(angle) * moveSpeed, Math.sin(angle) * moveSpeed);
    this.setFlipX(player.x < this.x);

    // Fire even while repositioning
    if (time - this._shoutTimer > this._shoutRate && dist < 500) {
      this._shoutTimer = time;
      this._fireShoutWave(angle);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.setTint(0xbbff22);
    });
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _fireShoutWave(angle) {
    // Spread of 3 shockwave pellets — propaganda shotgun
    const spreadAngles = [angle - 0.18, angle, angle + 0.18];

    spreadAngles.forEach(a => {
      const wave = this.scene.add
        .ellipse(this.x, this.y, 18, 10, 0xaaff00)
        .setDepth(5);
      this.scene.physics.add.existing(wave);
      wave.body.setVelocity(Math.cos(a) * 290, Math.sin(a) * 290);

      // Collide with player
      this.scene.physics.add.overlap(wave, this.scene.player, () => {
        if (!wave.active) return;
        this.scene.player.takeDamage(14);
        wave.destroy();
      });

      this.scene.time.delayedCall(1600, () => wave.destroy?.());
    });

    // Visual megaphone burst
    this._spawnMegaphoneBurst();
  }

  _spawnMegaphoneBurst() {
    const gfx = this.scene.add.graphics().setDepth(5);
    gfx.fillStyle(0xccff00, 0.7);
    // Fan shape — three arcs radiating forward
    for (let i = 0; i < 3; i++) {
      gfx.fillCircle(
        this.x + Phaser.Math.Between(-12, 12),
        this.y + Phaser.Math.Between(-8,  8),
        Phaser.Math.Between(5, 9)
      );
    }
    this.scene.tweens.add({
      targets:  gfx,
      alpha:    0,
      scaleX:   1.8,
      scaleY:   1.8,
      duration: 280,
      onComplete: () => gfx.destroy(),
    });
  }

  _buildAnims(scene) {
    if (scene.anims.exists('propaganda_herald_walk')) return;
    scene.anims.create({
      key:       'propaganda_herald_walk',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `enemy_propaganda_herald_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 10,
      repeat:    -1,
    });
  }
}

/**
 * FactoryWarden.js
 * Heavy enemy — Factory Warden — Neon Psychedelic Cyber-Folk
 *
 * A massive infected bruiser with mechanical implants and a chain hammer.
 * Slow but devastating — its hammer slam creates an AoE shockwave, and it
 * periodically exhales a toxic green smoke cloud that lingers and damages
 * any player who steps inside.
 */
export default class FactoryWarden extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_factory_warden_walk_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp         = 320;
    this.hp            = 320;
    this.speed         = 28;
    this.scoreValue    = 75;
    this.contactDamage = 40;

    this._hammerTimer   = 0;
    this._hammerRate    = 3200;  // ms between hammer slams
    this._smokeTimer    = 0;
    this._smokeRate     = 4500;  // ms between smoke puffs
    this._slamming      = false;

    /** Array of live smoke-cloud zones { gfx, bounds } */
    this._smokeClouds   = [];

    this.setDepth(4);
    this.setScale(1.35);
    this._buildAnims(scene);
    this.play('factory_warden_walk', true);
    this.setTint(0x44ff88);
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player || !this.active) return;

    const dist  = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    if (!this._slamming) {
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
      this.setFlipX(player.x < this.x);

      // Hammer slam
      if (time - this._hammerTimer > this._hammerRate && dist < 180) {
        this._hammerTimer = time;
        this._doHammerSlam();
      }
    }

    // Smoke puff — independent of slam state
    if (time - this._smokeTimer > this._smokeRate) {
      this._smokeTimer = time;
      this._spawnSmokeCloud();
    }

    // Damage player standing inside any smoke cloud
    this._smokeClouds.forEach(cloud => {
      if (!cloud.active) return;
      if (Phaser.Math.Distance.Between(this.scene.player?.x ?? -9999, this.scene.player?.y ?? -9999, cloud.cx, cloud.cy) < cloud.radius) {
        this.scene.player?.takeDamage(8 * (delta / 1000));
      }
    });
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(120, () => {
      if (this.active) this.setTint(0x44ff88);
    });
  }

  destroy(fromScene) {
    // Clean up lingering smoke clouds
    this._smokeClouds.forEach(c => c.gfx?.destroy());
    this._smokeClouds = [];
    super.destroy(fromScene);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _doHammerSlam() {
    this._slamming = true;
    this.setVelocity(0, 0);

    // Brief wind-up flash
    this.setTint(0xffffff);
    this.scene.time.delayedCall(200, () => {
      if (this.active) this.setTint(0x44ff88);
    });

    this.scene.time.delayedCall(420, () => {
      if (!this.active) return;

      // Ground-pound shockwave — expanding ring
      this._spawnShockwave();

      // AoE damage + camera shake
      const player = this.scene.player;
      if (player && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 170) {
        player.takeDamage(38);
        this.scene.cameras.main.shake(400, 0.022);
      }

      this._slamming = false;
    });
  }

  _spawnShockwave() {
    const ring = this.scene.add.graphics().setDepth(5);
    ring.lineStyle(6, 0x00ff66, 0.9);
    ring.strokeCircle(this.x, this.y, 20);

    this.scene.tweens.add({
      targets:  ring,
      alpha:    0,
      duration: 500,
      ease:     'Power2',
      onUpdate: (tween) => {
        if (!ring.active) return;
        const r = 20 + tween.progress * 160;
        ring.clear();
        ring.lineStyle(6 * (1 - tween.progress), 0x00ff66, 0.9 * (1 - tween.progress));
        ring.strokeCircle(this.x, this.y, r);
      },
      onComplete: () => ring.destroy(),
    });
  }

  _spawnSmokeCloud() {
    const cx     = this.x + Phaser.Math.Between(-30, 30);
    const cy     = this.y + Phaser.Math.Between(-20, 20);
    const radius = Phaser.Math.Between(55, 80);

    const gfx = this.scene.add.graphics().setDepth(3).setAlpha(0.7);
    gfx.fillStyle(0x00dd55, 0.45);
    gfx.fillCircle(cx, cy, radius);
    gfx.fillStyle(0x88ff44, 0.25);
    gfx.fillCircle(cx + Phaser.Math.Between(-15, 15), cy + Phaser.Math.Between(-10, 10), radius * 0.6);

    const cloud = { gfx, cx, cy, radius, active: true };
    this._smokeClouds.push(cloud);

    // Expand and fade
    this.scene.tweens.add({
      targets:  gfx,
      alpha:    0,
      scaleX:   1.6,
      scaleY:   1.6,
      duration: 3200,
      ease:     'Sine.easeOut',
      onComplete: () => {
        cloud.active = false;
        gfx.destroy();
        this._smokeClouds = this._smokeClouds.filter(c => c !== cloud);
      },
    });
  }

  _buildAnims(scene) {
    if (scene.anims.exists('factory_warden_walk')) return;
    scene.anims.create({
      key:       'factory_warden_walk',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `enemy_factory_warden_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 6,
      repeat:    -1,
    });
  }
}

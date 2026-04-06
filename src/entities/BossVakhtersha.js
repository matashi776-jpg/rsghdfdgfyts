/**
 * BossVakhtersha.js
 * Final boss — Vakhtersha — ACID KHUTIR Stage 1
 */
export default class BossVakhtersha extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_vakhtersha_phase1_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp          = 1000;
    this.hp             = 1000;
    this.speed          = 55;
    this.scoreValue     = 500;
    this.projectileDamage = 20;
    this._phase         = 1;
    this._attackTimer   = 0;
    this._attackRate    = 1800;
    this._moveTimer     = 0;
    this._moveRate      = 2200;
    this._targetY       = y;

    // Boss projectile group
    this.projectiles = scene.physics.add.group({ maxSize: 30 });

    this.setDepth(6);
    this.setScale(1.6);
    this._buildAnims(scene);
    this.play('boss_phase1', true);
  }

  update(time, delta) {
    if (!this.active) return;

    // Vertical patrol
    if (time - this._moveTimer > this._moveRate) {
      this._moveTimer = time;
      const { height } = this.scene.scale;
      this._targetY = Phaser.Math.Between(120, height - 120);
    }
    const dy = this._targetY - this.y;
    this.setVelocityY(Math.sign(dy) * Math.min(Math.abs(dy), this.speed));
    this.setVelocityX(0);

    // Attack
    if (time - this._attackTimer > this._attackRate) {
      this._attackTimer = time;
      this._fire();
    }

    // Clean up projectiles out of bounds
    this.projectiles.getChildren().forEach(p => {
      if (p.active && (p.x < -50 || p.x > this.scene.scale.width + 50)) {
        p.setActive(false).setVisible(false);
        p.body?.setVelocity?.(0, 0);
      }
    });
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => this.clearTint());
  }

  enterPhase2() {
    this._phase      = 2;
    this._attackRate = 1100;
    this._moveRate   = 1400;
    this.speed       = 90;
    this.play('boss_phase2', true);
  }

  _fire() {
    const player = this.scene.player;
    if (!player) return;

    const angles = this._phase === 1
      ? [Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)]
      : [
          Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y),
          Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) - 0.3,
          Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) + 0.3,
        ];

    angles.forEach(angle => {
      const p = this.projectiles.get(this.x, this.y);
      if (!p) return;
      p.setActive(true).setVisible(true).setScale(0.9).setTint(0xff00ff);
      p.setTexture('fx_bullet_blue');
      p.lifespan = 2000;
      p.body.setVelocity(Math.cos(angle) * 380, Math.sin(angle) * 380);
      p.setRotation(angle);
    });
  }

  _buildAnims(scene) {
    if (scene.anims.exists('boss_phase1')) return;

    scene.anims.create({
      key:       'boss_phase1',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `boss_vakhtersha_phase1_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 8,
      repeat:    -1,
    });

    scene.anims.create({
      key:       'boss_phase2',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `boss_vakhtersha_phase2_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 12,
      repeat:    -1,
    });
  }
}

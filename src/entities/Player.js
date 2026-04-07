/**
 * Player.js
 * Player entity — Serhiy — ACID KHUTIR Stage 1
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_serhiy_idle_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp          = 100;
    this.hp             = 100;
    this.speed          = 220;
    this.fireRate       = 350;  // ms between shots
    this._lastFire      = 0;
    this.shieldUntil    = 0;

    // Amulet / vyshyvanka stats
    this.resistance       = 0;     // damage reduction 0–0.75
    this.ritualChance     = 0;     // chance 0–0.9 for a burst triple-shot
    this.hpRegen          = 0;     // HP restored per second
    this.explosiveBullets = false; // amulet: vohniana_ptashka
    this.amulets          = [];    // ids of collected amulets
    this.vyshyvankaCount  = 1;     // Serhiy already wears one

    this.setCollideWorldBounds(true);
    this.setDepth(5);

    // Input
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd    = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    // Animations
    this._buildAnims(scene);
    this.play('player_idle', true);
  }

  update(time, delta) {
    const { _cursors: cur, _wasd: ws } = this;
    let vx = 0, vy = 0;

    if (cur.left.isDown  || ws.left.isDown)  vx -= this.speed;
    if (cur.right.isDown || ws.right.isDown) vx += this.speed;
    if (cur.up.isDown    || ws.up.isDown)    vy -= this.speed;
    if (cur.down.isDown  || ws.down.isDown)  vy += this.speed;

    this.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.play('player_walk', true);
      if (vx < 0) this.setFlipX(true);
      if (vx > 0) this.setFlipX(false);
    } else {
      this.play('player_idle', true);
    }

    // HP regeneration from amulets
    if (this.hpRegen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * delta / 1000);
    }

    // Auto-fire toward nearest enemy
    if (time - this._lastFire > this.fireRate) {
      const target = this._nearestEnemy();
      if (target) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const ps = this.scene.projectileSystem;

        // Ritual burst: triple spread shot
        if (ps && Math.random() < this.ritualChance) {
          const spread = 0.26; // ~15 degrees
          ps.fireBurst(this.x, this.y, angle, spread, this.explosiveBullets);
        } else if (ps) {
          ps.fire(this.x, this.y, angle, this.explosiveBullets);
        }

        this.play('player_shoot', true);
        this._lastFire = time;
      }
    }
  }

  takeDamage(amount) {
    if (this.scene.time.now < this.shieldUntil) return; // shielded
    const reduced = Math.round(amount * (1 - this.resistance));
    this.hp -= reduced;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => this.clearTint());
  }

  _nearestEnemy() {
    const enemies = this.scene.enemies?.getChildren() ?? [];
    let best = null, bestDist = Infinity;
    enemies.forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < bestDist) { bestDist = d; best = e; }
    });
    return best;
  }

  _buildAnims(scene) {
    if (scene.anims.exists('player_idle')) return;

    scene.anims.create({
      key:        'player_idle',
      frames:     Array.from({ length: 12 }, (_, i) =>
        ({ key: `player_serhiy_idle_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate:  10,
      repeat:     -1,
    });

    scene.anims.create({
      key:        'player_walk',
      frames:     Array.from({ length: 12 }, (_, i) =>
        ({ key: `player_serhiy_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate:  12,
      repeat:     -1,
    });

    scene.anims.create({
      key:        'player_shoot',
      frames:     Array.from({ length: 6 }, (_, i) =>
        ({ key: `player_serhiy_shoot_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate:  18,
      repeat:     0,
    });
  }
}

/**
 * HeroMykhas.js
 * Hero — Mykhas — craftsman with floating magic core and trap deployment
 * 160 cm, curly hair, purple-green cloak, belt with tools.
 * Specials: floating magic core attacks nearby enemies; periodically
 * drops an energy trap that one-shots any enemy stepping on it.
 */
export default class HeroMykhas extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_mykhas_idle_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp       = 130;
    this.hp          = 130;
    this.speed       = 170;
    this.fireRate    = 480; // ms between shots — slower but more powerful
    this._lastFire   = 0;
    this.shieldUntil = 0;

    this._trapTimer = 0;
    this._trapRate  = 6000; // drop a trap every 6 s
    this._coreAngle = 0;

    this.setCollideWorldBounds(true);
    this.setDepth(5);
    this.setTint(0xaa44ff); // Purple tint

    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd    = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    this._buildAnims(scene);
    this.play('mykhas_idle', true);

    // Floating magic core
    this._core     = scene.add.circle(x, y - 42, 10, 0x8800ff, 0.85).setDepth(6);
    this._coreGlow = scene.add.circle(x, y - 42, 19, 0x6600cc, 0.28).setDepth(5);
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
      this.play('mykhas_walk', true);
      if (vx < 0) this.setFlipX(true);
      if (vx > 0) this.setFlipX(false);
    } else {
      this.play('mykhas_idle', true);
    }

    // Float the magic core above Mykhas
    this._coreAngle += delta * 0.0022;
    const coreX = this.x + Math.sin(this._coreAngle) * 13;
    const coreY = this.y - 44 + Math.cos(this._coreAngle * 1.4) * 7;
    this._core.setPosition(coreX, coreY);
    this._coreGlow.setPosition(coreX, coreY);

    // Core continuously damages nearest enemy within 180 px
    const enemies = this.scene.enemies?.getChildren() ?? [];
    let nearest = null, nearDist = 180;
    enemies.forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(coreX, coreY, e.x, e.y);
      if (d < nearDist) { nearDist = d; nearest = e; }
    });
    if (nearest) {
      nearest.takeDamage?.(0.04 * delta); // ~40 DPS continuous beam
    }

    // Auto-fire toward nearest enemy
    if (time - this._lastFire > this.fireRate) {
      const target = this._nearestEnemy();
      if (target) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.scene.projectileSystem?.fire(this.x, this.y, angle);
        this._lastFire = time;
      }
    }

    // Drop craft trap periodically
    if (time - this._trapTimer > this._trapRate) {
      this._trapTimer = time;
      this._dropTrap();
    }
  }

  takeDamage(amount) {
    if (this.scene.time.now < this.shieldUntil) return;
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => this.setTint(0xaa44ff));
  }

  destroy(fromScene) {
    this._core?.destroy();
    this._coreGlow?.destroy();
    super.destroy(fromScene);
  }

  _dropTrap() {
    const trap = this.scene.add.rectangle(this.x, this.y, 26, 26, 0x00ff88, 0.85)
      .setDepth(3)
      .setStrokeStyle(2, 0x44ffcc);

    this.scene.physics.add.existing(trap, true);

    const enemyGroup = this.scene.enemies;
    if (enemyGroup) {
      const overlap = this.scene.physics.add.overlap(trap, enemyGroup, (t, enemy) => {
        enemy.takeDamage?.(50);
        this.scene.fxSystem?.spawnHit(trap.x, trap.y);
        if (overlap.active) overlap.active = false;
        trap.destroy();
      });
    }

    // Trap expires after 10 s
    this.scene.time.delayedCall(10000, () => trap.destroy?.());
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
    if (scene.anims.exists('mykhas_idle')) return;

    scene.anims.create({
      key:       'mykhas_idle',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `player_mykhas_idle_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 8,
      repeat:    -1,
    });

    scene.anims.create({
      key:       'mykhas_walk',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `player_mykhas_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 10,
      repeat:    -1,
    });
  }
}

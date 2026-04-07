/**
 * HeroOlena.js
 * Hero — Olena — elegant mage with sun symbols and nature magic
 * 170 cm, soft features, long blonde hair with braid,
 * orange-pink tones, neon cyber-folk style.
 * Special ability: orbiting nature orb damages nearby enemies.
 */
export default class HeroOlena extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_olena_idle_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp       = 90;
    this.hp          = 90;
    this.speed       = 200;
    this.fireRate    = 280; // ms between shots — faster than Serhiy
    this._lastFire   = 0;
    this.shieldUntil = 0;

    // Orbiting nature orb parameters
    this._orbitAngle  = 0;
    this._orbitRadius = 52;
    this._orbitDamage = 6;

    this.setCollideWorldBounds(true);
    this.setDepth(5);
    this.setTint(0xff8844); // Orange-pink tint

    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd    = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    this._buildAnims(scene);
    this.play('olena_idle', true);

    // Floating nature orb (sun symbol style)
    this._orb     = scene.add.circle(x, y, 9, 0xff6600, 0.9).setDepth(6);
    this._orbGlow = scene.add.circle(x, y, 17, 0xff9900, 0.28).setDepth(5);
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
      this.play('olena_walk', true);
      if (vx < 0) this.setFlipX(true);
      if (vx > 0) this.setFlipX(false);
    } else {
      this.play('olena_idle', true);
    }

    // Orbit the nature orb around Olena
    this._orbitAngle += delta * 0.0030;
    const ox = this.x + Math.cos(this._orbitAngle) * this._orbitRadius;
    const oy = this.y + Math.sin(this._orbitAngle) * this._orbitRadius * 0.55;
    this._orb.setPosition(ox, oy);
    this._orbGlow.setPosition(ox, oy);

    // Orb damages any enemy it touches
    const enemies = this.scene.enemies?.getChildren() ?? [];
    enemies.forEach(e => {
      if (!e.active) return;
      if (Phaser.Math.Distance.Between(ox, oy, e.x, e.y) < 22) {
        e.takeDamage?.(this._orbitDamage);
      }
    });

    // Auto-fire toward nearest enemy
    if (time - this._lastFire > this.fireRate) {
      const target = this._nearestEnemy();
      if (target) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.scene.projectileSystem?.fire(this.x, this.y, angle);
        this._lastFire = time;
      }
    }
  }

  takeDamage(amount) {
    if (this.scene.time.now < this.shieldUntil) return;
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => this.setTint(0xff8844));
  }

  destroy(fromScene) {
    this._orb?.destroy();
    this._orbGlow?.destroy();
    super.destroy(fromScene);
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
    if (scene.anims.exists('olena_idle')) return;

    scene.anims.create({
      key:       'olena_idle',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `player_olena_idle_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 8,
      repeat:    -1,
    });

    scene.anims.create({
      key:       'olena_walk',
      frames:    Array.from({ length: 8 }, (_, i) =>
        ({ key: `player_olena_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate: 10,
      repeat:    -1,
    });
  }
}

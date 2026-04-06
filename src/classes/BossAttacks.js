/**
 * BossAttacks.js
 * Four attack patterns for Товариш Вахтерша.
 *
 *  5.1 stampShot          — projectile that travels toward the house
 *  5.2 summonClerks       — spawns 5–8 enemy clerks from a portal
 *  5.3 varenykBomb        — arcing bomb that explodes into a sticky slow zone
 *  5.4 bureaucraticMeteor — giant stamp falls from above, damages the house
 *
 * Each attack shows a telegraph first, then fires after the warning expires.
 * Boss projectiles are added to scene.bossProjectilesGroup so the existing
 * house-overlap collider can register hits.
 */
import BossTelegraphs from './BossTelegraphs.js';

export default class BossAttacks {
  constructor(scene) {
    this.scene       = scene;
    this.telegraphs  = new BossTelegraphs(scene);
    this._stickyZones = []; // [{ x, halfW, gfx }]
  }

  // ── 5.1 Stamp Shot ──────────────────────────────────────────────────────────
  stampShot(x, y) {
    const TELEGRAPH_MS = 650;

    this.telegraphs.showStampTelegraph(x, y, TELEGRAPH_MS, () => {
      if (!this._sceneAlive()) return;

      const stamp = this.scene.physics.add.sprite(x, y, 'boss_stamp');
      stamp.setDisplaySize(34, 34);
      stamp.setTint(0xff2200);
      stamp.setDepth(7);
      stamp.body.allowGravity = false;
      stamp.setVelocityX(-300);

      if (this.scene.bossProjectilesGroup) {
        this.scene.bossProjectilesGroup.add(stamp);
      }

      // Neon trail
      const trail = this.scene.add.particles(stamp.x, stamp.y, 'particle_neon_pink', {
        speed:     { min: 10, max: 45 },
        scale:     { start: 0.55, end: 0 },
        alpha:     { start: 0.85, end: 0 },
        lifespan:  190,
        frequency: 22,
        quantity:  2,
        tint:      [0xff0000, 0xff00ff],
      }).setDepth(6);
      trail.startFollow(stamp);
      stamp._trail = trail;

      // Auto-cleanup after 3 s if it misses
      this.scene.time.delayedCall(3000, () => {
        if (stamp.active) {
          this._destroyStamp(stamp);
        }
      });
    });
  }

  _destroyStamp(stamp) {
    if (stamp._trail && stamp._trail.active) {
      stamp._trail.stopFollow();
      stamp._trail.destroy();
    }
    stamp.destroy();
  }

  // ── 5.2 Clerk Summon ────────────────────────────────────────────────────────
  summonClerks() {
    if (!this._sceneAlive()) return;
    const count  = Phaser.Math.Between(5, 8);
    const portalX = Phaser.Math.Between(820, 1100);
    const { height } = this.scene.scale;

    // Portal VFX — toxic green circle
    const portal = this.scene.add.circle(portalX, height / 2, 65, 0x00ff44, 0).setDepth(8);
    portal.setStrokeStyle(3, 0x00ff44, 1);
    this.scene.tweens.add({
      targets:  portal,
      fillAlpha: 0.6,
      scaleX:   1.5,
      scaleY:   1.5,
      duration: 450,
      yoyo:     true,
      onComplete: () => portal.destroy(),
    });

    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!this._sceneAlive()) return;
        const ey = Phaser.Math.Between(
          Math.floor(height * 0.18),
          Math.floor(height * 0.82),
        );
        this.scene._spawnEnemy(portalX, ey);
      });
    }
  }

  // ── 5.3 Varenyk Bomb ────────────────────────────────────────────────────────
  varenykBomb(x, y) {
    const TELEGRAPH_MS = 750;

    this.telegraphs.showVarenykTelegraph(x, y, TELEGRAPH_MS, () => {
      if (!this._sceneAlive()) return;

      const bomb = this.scene.physics.add.sprite(x, y, 'boss_varenyk');
      bomb.setDisplaySize(30, 26);
      bomb.setTint(0xffff44);
      bomb.setDepth(7);
      bomb.body.allowGravity = false;
      // Initial velocity — arcs left and down
      bomb.setVelocity(-220, -300);
      // Custom gravity so it follows a parabolic arc (world gravity = 0)
      bomb.body.setGravityY(580);

      // Check landing each frame tick
      const groundY = this.scene.scale.height * 0.86;
      const checkTimer = this.scene.time.addEvent({
        delay:    16,
        loop:     true,
        callback: () => {
          if (!bomb.active) { checkTimer.remove(); return; }
          if (bomb.y >= groundY) {
            checkTimer.remove();
            this._explodeVarenyk(bomb.x, bomb.y);
            bomb.destroy();
          }
        },
      });

      // Safety cleanup after 4 s
      this.scene.time.delayedCall(4000, () => {
        if (bomb.active) { checkTimer.remove(); bomb.destroy(); }
      });
    });
  }

  _explodeVarenyk(x, y) {
    if (!this._sceneAlive()) return;

    // Explosion burst
    const em = this.scene.add.particles(x, y, 'particle_neon_green', {
      speed:    { min: 60, max: 260 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 280, max: 720 },
      angle:    { min: 0, max: 360 },
      tint:     [0xffff00, 0x00ff44, 0x00ffaa],
      emitting: false,
    }).setDepth(15);
    em.explode(28, x, y);
    this.scene.time.delayedCall(850, () => { if (em.active) em.destroy(); });

    // Sticky zone slows defenders' fire rate
    this._createStickyZone(x);

    // Minor direct damage to house if explosion is close enough
    if (x < 420 && this.scene.houseHP !== undefined) {
      this.scene.houseHP = Math.max(0, this.scene.houseHP - 90);
    }
  }

  _createStickyZone(x) {
    if (!this._sceneAlive()) return;
    const { height } = this.scene.scale;
    const zone = this.scene.add
      .rectangle(x, height * 0.76, 210, 44, 0x00ff44, 0.38)
      .setDepth(3);
    zone.setStrokeStyle(2, 0x00ff44, 0.7);

    const entry = { x, halfW: 105, gfx: zone };
    this._stickyZones.push(entry);

    // Zone lingers 8 s then fades
    this.scene.tweens.add({
      targets: zone,
      alpha:   0,
      delay:   8000,
      duration: 2000,
      onComplete: () => {
        zone.destroy();
        const idx = this._stickyZones.indexOf(entry);
        if (idx !== -1) this._stickyZones.splice(idx, 1);
      },
    });
  }

  /** Returns true if a defender at defX is inside any sticky zone. */
  isDefenderStuck(defX) {
    return this._stickyZones.some((z) => Math.abs(z.x - defX) < z.halfW);
  }

  // ── 5.4 Bureaucratic Meteor ─────────────────────────────────────────────────
  bureaucraticMeteor() {
    if (!this._sceneAlive()) return;
    const { width, height } = this.scene.scale;
    const x = Phaser.Math.Between(200, width - 160);
    const TELEGRAPH_MS = 950;

    this.telegraphs.showMeteorTelegraph(x, TELEGRAPH_MS, () => {
      if (!this._sceneAlive()) return;

      // Giant stamp rectangle
      const meteor = this.scene.add.rectangle(x, -70, 94, 116, 0xff00ff, 0.88).setDepth(8);
      meteor.setStrokeStyle(4, 0x8800ff, 1);

      const lbl = this.scene.add.text(x, -70, 'ВІДМОВЛЕНО', {
        fontFamily:      'Arial Black, Arial',
        fontSize:        '10px',
        color:           '#ffffff',
        stroke:          '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9);

      this.scene.tweens.add({
        targets:  [meteor, lbl],
        y:        height * 0.80,
        duration: 680,
        ease:     'Power2',
        onComplete: () => {
          if (!this._sceneAlive()) { meteor.destroy(); lbl.destroy(); return; }

          // Impact VFX
          const em = this.scene.add.particles(x, meteor.y, 'particle_neon_pink', {
            speed:    { min: 80, max: 340 },
            scale:    { start: 2.2, end: 0 },
            alpha:    { start: 1, end: 0 },
            lifespan: { min: 300, max: 850 },
            angle:    { min: 0, max: 360 },
            tint:     [0xff00ff, 0x8800ff, 0xff0000, 0xffff00],
            emitting: false,
          }).setDepth(15);
          em.explode(38, x, meteor.y);
          this.scene.time.delayedCall(950, () => { if (em.active) em.destroy(); });

          // Camera shake
          this.scene.cameras.main.shake(320, 0.020);

          // Damage house if meteor landed near the left side
          if (Math.abs(x - 150) < 220 && this.scene.houseHP !== undefined) {
            this.scene.houseHP = Math.max(0, this.scene.houseHP - 130);
          }

          meteor.destroy();
          lbl.destroy();
        },
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _sceneAlive() {
    return this.scene && this.scene.sys && this.scene.sys.isActive();
  }

  destroy() {
    this.telegraphs.destroy();
    for (const z of this._stickyZones) {
      if (z.gfx && z.gfx.active) z.gfx.destroy();
    }
    this._stickyZones = [];
  }
}

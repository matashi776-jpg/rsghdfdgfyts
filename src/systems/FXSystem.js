/**
 * FXSystem.js
 * Central visual-effects factory for ACID KHUTIR.
 * Uses Phaser 3 particle emitters. All FX are fire-and-forget.
 */
export default class FXSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this._scene       = scene;
    this._glitchLayer = null;
    this._glitchTimer = null;
  }

  // ── Enemy death ────────────────────────────────────────────────────────────

  spawnDeathExplosion(x, y) {
    const em = this._scene.add.particles(x, y, 'particle_neon_pink', {
      speed:    { min: 60,  max: 260 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 300,   max: 700 },
      angle:    { min: 0,     max: 360 },
      tint:     [0xff00aa, 0xff6600, 0xffff00, 0x00ffff],
      emitting: false,
    }).setDepth(15);
    em.explode(30, x, y);
    this._scene.time.delayedCall(800, () => { if (em.active) em.destroy(); });
  }

  // ── Projectile hit ────────────────────────────────────────────────────────

  spawnHitSpark(x, y) {
    const em = this._scene.add.particles(x, y, 'particle_neon_orange', {
      speed:    { min: 30, max: 110 },
      scale:    { start: 0.9, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: 280,
      angle:    { min: 0, max: 360 },
      tint:     [0xff6600, 0xffff00],
      emitting: false,
    }).setDepth(15);
    em.explode(10, x, y);
    this._scene.time.delayedCall(400, () => { if (em.active) em.destroy(); });
  }

  // ── Acid splash (ZombieClerk death) ───────────────────────────────────────

  spawnAcidSplash(x, y) {
    const em = this._scene.add.particles(x, y, 'particle_neon_green', {
      speed:    { min: 40, max: 180 },
      scale:    { start: 1.2, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 400,   max: 900 },
      angle:    { min: 0,     max: 360 },
      tint:     [0x00ff88, 0x39ff14, 0x00ffff],
      emitting: false,
    }).setDepth(15);
    em.explode(20, x, y);
    this._scene.time.delayedCall(1000, () => { if (em.active) em.destroy(); });
  }

  // ── Boss slam wave ─────────────────────────────────────────────────────────

  spawnSlamWave(x, y) {
    const em = this._scene.add.particles(x, y, 'particle_neon_pink', {
      speed:    { min: 80, max: 400 },
      scale:    { start: 2.0, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 200,   max: 600 },
      angle:    { min: 160,   max: 200 }, // horizontal shockwave
      tint:     [0xff00ff, 0xff0000, 0xff00aa],
      emitting: false,
    }).setDepth(15);
    em.explode(50, x, y);
    this._scene.time.delayedCall(700, () => { if (em.active) em.destroy(); });
  }

  // ── House upgrade ─────────────────────────────────────────────────────────

  spawnUpgradeBurst(x, y) {
    const em = this._scene.add.particles(x, y, 'particle_neon_cyan', {
      speed:    { min: 60,  max: 300 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 400,   max: 900 },
      angle:    { min: 0,     max: 360 },
      tint:     [0x00ffff, 0xff00aa, 0xffff00],
      emitting: false,
    }).setDepth(15);
    em.explode(40, x, y);
    this._scene.time.delayedCall(1000, () => { if (em.active) em.destroy(); });
  }

  // ── Glitch flash (Phase 2 boss) ───────────────────────────────────────────

  triggerGlitch() {
    const { width, height } = this._scene.scale;
    const flash = this._scene.add.rectangle(
      width / 2, height / 2, width, height, 0x00ffff, 0.06,
    ).setDepth(60);
    this._scene.time.delayedCall(80, () => { if (flash.active) flash.destroy(); });
  }

  // ── Projectile neon trail ─────────────────────────────────────────────────

  attachTrail(projectile) {
    const trail = this._scene.add.particles(projectile.x, projectile.y, 'particle_neon_orange', {
      speed:     { min: 8, max: 40 },
      scale:     { start: 0.7, end: 0 },
      alpha:     { start: 0.9, end: 0 },
      lifespan:  200,
      frequency: 20,
      quantity:  2,
      tint:      [0xff00aa, 0xff6600],
    }).setDepth(5);
    trail.startFollow(projectile);
    return trail;
  }
}

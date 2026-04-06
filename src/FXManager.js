/**
 * FXManager.js
 * Centralized FX system — Acid Khutir (Neon Psychedelic Cyber-Folk)
 *
 * Palette:
 *   Electric Blue   #00CFFF  — bullets, energy, UI
 *   Neon Pink       #FF00D4  — enemies, flashes, blood
 *   Toxic Green     #39FF14  — poison, beet, effects
 *   Ultra-Violet    #7F00FF  — backgrounds, shadows, magic
 *   Cyber-Amber     #FFB300  — gold, money
 *   Plasma Red      #FF0033  — damage, crits
 *   Deep Indigo     #0A0014  — background, contrast
 */

export const PALETTE = {
  ELECTRIC_BLUE:  0x00CFFF,
  NEON_PINK:      0xFF00D4,
  TOXIC_GREEN:    0x39FF14,
  ULTRA_VIOLET:   0x7F00FF,
  CYBER_AMBER:    0xFFB300,
  PLASMA_RED:     0xFF0033,
  DEEP_INDIGO:    0x0A0014,
  WHITE_CORE:     0xFFFFFF,
};

export default class FXManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  // ─── Bullet FX ────────────────────────────────────────────────────────────

  /**
   * Attach an Electric Smoke trail to a projectile (Electric Blue particle tail).
   * Particles linger and fade out with a delay for the "electric smoke" effect.
   * @param {Phaser.GameObjects.GameObject} proj
   * @returns {Phaser.GameObjects.Particles.ParticleEmitter}
   */
  attachBulletTrail(proj) {
    const trail = this.scene.add.particles(proj.x, proj.y, 'particle_electric', {
      speed:     { min: 5, max: 25 },
      scale:     { start: 0.8, end: 0 },
      alpha:     { start: 0.85, end: 0 },
      lifespan:  { min: 180, max: 320 },
      frequency: 18,
      quantity:  2,
      tint:      [PALETTE.ELECTRIC_BLUE, PALETTE.WHITE_CORE, PALETTE.ULTRA_VIOLET],
      blendMode: 'ADD',
    }).setDepth(5);
    trail.startFollow(proj);
    return trail;
  }

  /**
   * Stop and clean up a bullet trail after the projectile is gone.
   * @param {Phaser.GameObjects.Particles.ParticleEmitter} trail
   */
  stopBulletTrail(trail) {
    if (!trail || !trail.active) return;
    trail.stopFollow();
    this.scene.time.delayedCall(300, () => {
      if (trail && trail.active) trail.destroy();
    });
  }

  // ─── Explosion FX (Pysanka-pattern neon flash) ───────────────────────────

  /**
   * Death explosion: neon pysanka-pattern burst (NOT fire — neon flashes).
   */
  spawnDeathExplosion(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_pysanka', {
      speed:    { min: 70, max: 280 },
      scale:    { start: 1.4, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 320, max: 720 },
      angle:    { min: 0, max: 360 },
      tint:     [PALETTE.NEON_PINK, PALETTE.ELECTRIC_BLUE, PALETTE.TOXIC_GREEN, PALETTE.CYBER_AMBER],
      blendMode: 'ADD',
      emitting: false,
    }).setDepth(15);
    em.explode(32, x, y);
    this.scene.time.delayedCall(800, () => { if (em && em.active) em.destroy(); });

    // Screen flash
    this._screenFlash(PALETTE.NEON_PINK, 0.22, 150);
  }

  /**
   * Small hit spark.
   */
  spawnHitSpark(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_electric', {
      speed:    { min: 35, max: 120 },
      scale:    { start: 0.9, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: 240,
      angle:    { min: 0, max: 360 },
      tint:     [PALETTE.ELECTRIC_BLUE, PALETTE.WHITE_CORE],
      blendMode: 'ADD',
      emitting: false,
    }).setDepth(15);
    em.explode(10, x, y);
    this.scene.time.delayedCall(350, () => { if (em && em.active) em.destroy(); });
  }

  // ─── Poison / Radioactive Beet FX ─────────────────────────────────────────

  /**
   * Apply radioactive beet poison cloud around a target position.
   * Enemies entering the zone get a toxic-green glow.
   */
  spawnPoisonCloud(x, y, radius = 80) {
    const em = this.scene.add.particles(x, y, 'particle_toxic', {
      speed:    { min: 8, max: 32 },
      scale:    { start: 1.2, end: 0.2 },
      alpha:    { start: 0.7, end: 0 },
      lifespan: { min: 1200, max: 2000 },
      angle:    { min: 0, max: 360 },
      distance: { min: 0, max: radius },
      tint:     [PALETTE.TOXIC_GREEN, PALETTE.ULTRA_VIOLET],
      frequency: 80,
      quantity: 3,
      blendMode: 'ADD',
    }).setDepth(7);
    // Auto-destroy after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (em && em.active) {
        em.stop();
        this.scene.time.delayedCall(2200, () => { if (em && em.active) em.destroy(); });
      }
    });
    return em;
  }

  /**
   * Apply glitch-green tint to a sprite to show poisoned state.
   */
  applyPoisonGlow(sprite) {
    if (!sprite || !sprite.active) return;
    sprite.setTint(PALETTE.TOXIC_GREEN);
    // Glitch flicker
    this.scene.time.addEvent({
      delay: 180,
      repeat: 8,
      callbackScope: this,
      callback: () => {
        if (!sprite || !sprite.active) return;
        sprite.setTint(Math.random() < 0.5 ? PALETTE.TOXIC_GREEN : 0x88FF88);
      },
    });
  }

  // ─── Shield FX (Rushnik / Iron Seal) ─────────────────────────────────────

  /**
   * Flash the house with a rushnik-shield pink burst when damage is deflected.
   */
  spawnShieldReflect(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_shield', {
      speed:    { min: 50, max: 180 },
      scale:    { start: 1.1, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 250, max: 500 },
      angle:    { min: 200, max: 340 },
      tint:     [PALETTE.NEON_PINK, PALETTE.WHITE_CORE, PALETTE.ELECTRIC_BLUE],
      blendMode: 'ADD',
      emitting: false,
    }).setDepth(16);
    em.explode(18, x, y);
    this.scene.time.delayedCall(600, () => { if (em && em.active) em.destroy(); });
  }

  // ─── House Upgrade Burst ──────────────────────────────────────────────────

  spawnUpgradeBurst(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_electric', {
      speed:    { min: 80, max: 340 },
      scale:    { start: 1.8, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 420, max: 950 },
      angle:    { min: 0, max: 360 },
      tint:     [PALETTE.ELECTRIC_BLUE, PALETTE.NEON_PINK, PALETTE.CYBER_AMBER, PALETTE.TOXIC_GREEN],
      blendMode: 'ADD',
      emitting: false,
    }).setDepth(16);
    em.explode(50, x, y);
    this._screenFlash(PALETTE.ELECTRIC_BLUE, 0.3, 250);
    this.scene.time.delayedCall(1100, () => { if (em && em.active) em.destroy(); });
  }

  // ─── Boss arrival flash ───────────────────────────────────────────────────

  spawnBossArrival(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_pysanka', {
      speed:    { min: 100, max: 400 },
      scale:    { start: 2.0, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 400, max: 900 },
      angle:    { min: 0, max: 360 },
      tint:     [PALETTE.NEON_PINK, PALETTE.ULTRA_VIOLET, PALETTE.TOXIC_GREEN],
      blendMode: 'ADD',
      emitting: false,
    }).setDepth(18);
    em.explode(60, x, y);
    this._screenFlash(PALETTE.NEON_PINK, 0.5, 200);
    this.scene.time.delayedCall(1200, () => { if (em && em.active) em.destroy(); });
  }

  // ─── Stamp / Inspector slam FX ────────────────────────────────────────────

  spawnStampSlam(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_stamp', {
      speed:    { min: 20, max: 90 },
      scale:    { start: 1.0, end: 0 },
      alpha:    { start: 0.9, end: 0 },
      lifespan: { min: 300, max: 600 },
      angle:    { min: 200, max: 340 },
      tint:     [PALETTE.PLASMA_RED, 0xAA0022, PALETTE.NEON_PINK],
      blendMode: 'ADD',
      emitting: false,
    }).setDepth(12);
    em.explode(16, x, y);
    this.scene.time.delayedCall(700, () => { if (em && em.active) em.destroy(); });
  }

  // ─── Paper death shower (Archivarius / Clerk) ─────────────────────────────

  spawnPaperShower(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_paper', {
      speed:    { min: 40, max: 200 },
      scale:    { start: 0.9, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 500, max: 1200 },
      angle:    { min: 0, max: 360 },
      gravityY: 120,
      tint:     [0xFFFFEE, 0xDDDDCC, PALETTE.CYBER_AMBER],
      emitting: false,
    }).setDepth(15);
    em.explode(24, x, y);
    this.scene.time.delayedCall(1400, () => { if (em && em.active) em.destroy(); });
  }

  // ─── Varenyky sticky splat (Tank Babtsia) ────────────────────────────────

  spawnVarenykySplat(x, y) {
    const em = this.scene.add.particles(x, y, 'particle_toxic', {
      speed:    { min: 30, max: 130 },
      scale:    { start: 1.3, end: 0.3 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 700, max: 1500 },
      angle:    { min: 0, max: 360 },
      tint:     [0xFFFFCC, 0xFFEE88, PALETTE.CYBER_AMBER],
      emitting: false,
    }).setDepth(7);
    em.explode(20, x, y);
    this.scene.time.delayedCall(1600, () => { if (em && em.active) em.destroy(); });
  }

  // ─── UV-Reactive pysanka pulse on a sprite ────────────────────────────────

  /**
   * Create a persistent UV-pulse tween on a sprite (pulsing neon ornaments).
   * @param {Phaser.GameObjects.Sprite|Phaser.GameObjects.Image} sprite
   * @param {number} baseColor  hex color
   */
  addUVPulse(sprite, baseColor = PALETTE.ULTRA_VIOLET) {
    if (!sprite || !sprite.scene) return null;
    return sprite.scene.tweens.add({
      targets: sprite,
      alpha:   { from: 0.75, to: 1.0 },
      duration: 600 + Math.random() * 400,
      yoyo:    true,
      repeat:  -1,
      ease:    'Sine.easeInOut',
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  _screenFlash(color, maxAlpha = 0.35, duration = 180) {
    const { width, height } = this.scene.scale;
    const flash = this.scene.add.rectangle(
      width / 2, height / 2, width, height, color, 0,
    ).setDepth(50);
    this.scene.tweens.add({
      targets:  flash,
      fillAlpha: maxAlpha,
      duration: duration / 2,
      yoyo:    true,
      repeat:  1,
      onComplete: () => { if (flash && flash.active) flash.destroy(); },
    });
  }
}

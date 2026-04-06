/**
 * Boss_Vakhtersha.js
 * Вахтёрша Mausoleum Protocol 2.1 — final boss.
 * Concrete monolith + multi-armed woman + glitch-monitor face.
 *
 * Phases:
 *  Phase 1 (HP > 50%): Slow walk + periodic slam (stunning nearby defenders).
 *  Phase 2 (HP ≤ 50%): Speed increases, BGM rate rises, glitch VFX activates.
 */
import Enemy from './Enemy.js';

export default class Boss_Vakhtersha extends Enemy {
  constructor(scene, x, y) {
    const hp    = 15000;
    const speed = 15;
    super(scene, x, y, hp, speed, 'boss');
    this._phase       = 1;
    this._slamTimer   = null;
    this._glitchTimer = null;
    this._scheduleSlamAttack();
  }

  // ── Phase management ──────────────────────────────────────────────────────

  takeDamage(amount) {
    super.takeDamage(amount);
    if (this.alive && this._phase === 1 && this.hp <= this.maxHP * 0.5) {
      this._enterPhase2();
    }
  }

  _enterPhase2() {
    this._phase = 2;
    this.speed  *= 2;
    if (this.sprite) this.sprite.setTint(0xff0000);
    if (this.scene.audioManager) this.scene.audioManager.setBGMRate(1.2);
    if (this.scene.fxSystem)     this._glitchTimer = this.scene.time.addEvent({
      delay:    300,
      loop:     true,
      callback: () => this.scene.fxSystem.triggerGlitch(),
    });
  }

  // ── Slam attack ───────────────────────────────────────────────────────────

  _scheduleSlamAttack() {
    this._slamTimer = this.scene.time.addEvent({
      delay:    4000,
      loop:     true,
      callback: this._slam,
      callbackScope: this,
    });
  }

  _slam() {
    if (!this.alive || !this.sprite) return;
    // Neon flash + camera shake
    if (this.scene.cameras) this.scene.cameras.main.shake(400, 0.012);
    if (this.scene.fxSystem) this.scene.fxSystem.spawnSlamWave(this.sprite.x, this.sprite.y);
  }

  // ── Override die to clean up timers ──────────────────────────────────────

  die() {
    if (!this.alive) return;
    if (this._slamTimer)   { this._slamTimer.remove();   this._slamTimer   = null; }
    if (this._glitchTimer) { this._glitchTimer.remove(); this._glitchTimer = null; }
    if (this.scene.audioManager) this.scene.audioManager.setBGMRate(1.0);
    super.die();
  }
}

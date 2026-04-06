/**
 * SergiyStateMachine.js
 * Finite state machine for a single Sergiy defender unit.
 *
 * States:
 *   IDLE      – no target in range; defender is resting.
 *   SHOOTING  – target detected; firing in bursts.
 *   RELOADING – burst exhausted; cooling down before next burst.
 *   UPGRADING – house upgrade animation; cannot shoot.
 *
 * Usage (inside BattleScene.update per defender):
 *   const fired = defender.sm.update(delta, hasTarget);
 *   if (fired) _defenderShoot(defender);
 */

export const SERGIY_STATE = Object.freeze({
  IDLE:      'IDLE',
  SHOOTING:  'SHOOTING',
  RELOADING: 'RELOADING',
  UPGRADING: 'UPGRADING',
});

export default class SergiyStateMachine {
  /**
   * @param {object} [opts]
   * @param {number} [opts.fireRate=1200]   – ms between shots while shooting
   * @param {number} [opts.reloadTime=800]  – ms for the reload pause
   * @param {number} [opts.burstSize=5]     – shots before forced reload
   */
  constructor({ fireRate = 1200, reloadTime = 800, burstSize = 5 } = {}) {
    this.baseFireRate = fireRate;   // preserved for modifier recalculation
    this.fireRate   = fireRate;
    this.reloadTime = reloadTime;
    this.burstSize  = burstSize;

    this._state      = SERGIY_STATE.IDLE;
    this._cooldown   = 0;
    this._burstCount = 0;
  }

  /** Current state string. */
  get state() { return this._state; }

  /**
   * Tick the state machine.
   * @param {number}  delta     – ms elapsed this frame
   * @param {boolean} hasTarget – whether an enemy is in range
   * @returns {boolean} true if the defender should fire a projectile this tick
   */
  update(delta, hasTarget) {
    if (this._state === SERGIY_STATE.UPGRADING) return false;

    this._cooldown = Math.max(0, this._cooldown - delta);

    // ── Reloading ────────────────────────────────────────────────────────────
    if (this._state === SERGIY_STATE.RELOADING) {
      if (this._cooldown === 0) {
        this._burstCount = 0;
        this._state = hasTarget ? SERGIY_STATE.SHOOTING : SERGIY_STATE.IDLE;
      }
      return false;
    }

    // ── No target ────────────────────────────────────────────────────────────
    if (!hasTarget) {
      this._state = SERGIY_STATE.IDLE;
      return false;
    }

    // ── Shooting ─────────────────────────────────────────────────────────────
    this._state = SERGIY_STATE.SHOOTING;

    if (this._cooldown === 0) {
      this._cooldown = this.fireRate;
      this._burstCount++;

      if (this._burstCount >= this.burstSize) {
        this._state    = SERGIY_STATE.RELOADING;
        this._cooldown = this.reloadTime;
      }
      return true;
    }

    return false;
  }

  /**
   * Force the defender into the Upgrading state for a given duration (ms).
   * After the duration it returns to IDLE automatically.
   * @param {number} duration
   */
  startUpgrade(duration) {
    this._state    = SERGIY_STATE.UPGRADING;
    this._cooldown = duration;
  }

  /** Immediately exit the Upgrading state. */
  endUpgrade() {
    if (this._state === SERGIY_STATE.UPGRADING) {
      this._state    = SERGIY_STATE.IDLE;
      this._cooldown = 0;
    }
  }

  /**
   * Apply a fire-rate modifier (e.g. from an attack-speed perk).
   * @param {number} multiplier – values < 1 speed up firing
   */
  applyAttackSpeedModifier(multiplier) {
    this.fireRate = Math.max(200, this.baseFireRate * multiplier);
  }
}

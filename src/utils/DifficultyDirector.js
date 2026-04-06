/**
 * DifficultyDirector.js
 * Dynamic difficulty as in Left 4 Dead — Оборона Ланчина V4.0
 *
 * Tracks player performance each wave and nudges the difficulty
 * multiplier up or down so the game always feels challenging but fair.
 *
 * Formula:
 *   Performance = (KillSpeed × 0.4) + (Accuracy × 0.3)
 *               + (GoldPerMinute × 0.2) − (DamagePenalty × 0.3)
 *   Performance > 0.7  →  difficulty ↑
 *   Performance < 0.3  →  difficulty ↓
 */
export default class DifficultyDirector {
    constructor() {
        this.multiplier = 1.0;
        this._reset();
    }

    /** Reset per-wave counters (call at wave start). */
    _reset() {
        this._kills      = 0;
        this._shots      = 0;
        this._hits       = 0;
        this._goldEarned = 0;
        this._damage     = 0;
        this._startTime  = Date.now();
    }

    // ─── Recording ────────────────────────────────────────────────────────────

    recordKill()         { this._kills++;        }
    recordShot()         { this._shots++;        }
    recordHit()          { this._hits++;         }
    recordGold(amount)   { this._goldEarned += amount; }
    recordDamage(amount) { this._damage += amount;     }

    // ─── Evaluation ───────────────────────────────────────────────────────────

    /**
     * Call at the end of each wave.
     * Adjusts this.multiplier in ±0.05 steps.
     * @returns {number} current multiplier
     */
    evaluate() {
        const elapsed = Math.max(0.1, (Date.now() - this._startTime) / 60000);

        const killSpeed    = Math.min(1, this._kills / (elapsed * 20 + 1));
        const accuracy     = this._shots > 0
            ? Math.min(1, this._hits / this._shots)
            : 0.5;
        const goldPerMin   = Math.min(1, this._goldEarned / (elapsed * 400 + 1));
        const damagePen    = Math.min(1, this._damage / 3000);

        const performance =
            (killSpeed  * 0.4) +
            (accuracy   * 0.3) +
            (goldPerMin * 0.2) -
            (damagePen  * 0.3);

        if (performance > 0.7) {
            this.multiplier = Math.min(2.0, this.multiplier + 0.05);
        } else if (performance < 0.3) {
            this.multiplier = Math.max(0.5, this.multiplier - 0.05);
        }

        this._reset();
        return this.multiplier;
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /** HP multiplier applied to newly spawned enemies. */
    getHPMultiplier() {
        return this.multiplier;
    }

    /** Speed multiplier applied to newly spawned enemies. */
    getSpeedMultiplier() {
        return 0.85 + this.multiplier * 0.15;
    }

    /**
     * Spawn-interval multiplier.
     * multiplier > 1 → shorter interval (faster spawns).
     * multiplier < 1 → longer interval (slower spawns).
     */
    getSpawnIntervalMultiplier() {
        return Math.max(0.4, Math.min(1.5, 1.0 / this.multiplier));
    }
}

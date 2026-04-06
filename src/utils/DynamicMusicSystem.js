/**
 * DynamicMusicSystem.js
 * Reacts to wave number, boss phase, and game events
 * to smoothly shift the BGM rate — Оборона Ланчина V4.0
 *
 * Layers (BGM rate):
 *   Waves 1–3  →  1.00  (light techno-folk)
 *   Waves 4–7  →  1.03  (bass enters)
 *   Waves 8–12 →  1.08  (trembita builds)
 *   Wave 13+   →  1.15  (full intensity)
 *   Boss       →  1.20+ (rave mode)
 *   Boss P4    →  1.40  (glitch mode, oscillates)
 *   Death      →  0.55 / vol 0.15 (low-pass feel)
 */
export default class DynamicMusicSystem {
    constructor(scene) {
        this._scene      = scene;
        this._bgm        = null;
        this._targetRate = 1.0;
    }

    /** Call once in BattleScene.create() after BGM is confirmed playing. */
    init() {
        this._bgm = this._scene.sound.get('bgm');
    }

    /**
     * Call every update tick.
     * @param {number} wave        current wave number
     * @param {boolean} bossActive is a boss alive?
     * @param {number} bossPhase   0-3 (0 = fresh, 3 = < 25 % HP)
     */
    update(wave, bossActive, bossPhase) {
        if (!this._bgm) { this.init(); return; }

        if (bossActive) {
            if (bossPhase >= 3) {
                // Glitch mode — oscillating rate
                this._targetRate = 1.40 + Math.sin(Date.now() / 500) * 0.05;
            } else {
                this._targetRate = 1.20 + bossPhase * 0.07;
            }
        } else if (wave >= 13) {
            this._targetRate = 1.15;
        } else if (wave >= 8) {
            this._targetRate = 1.08;
        } else if (wave >= 4) {
            this._targetRate = 1.03;
        } else {
            this._targetRate = 1.00;
        }

        // Smooth interpolation — avoids jarring rate jumps
        try {
            const current  = this._bgm.rate || 1.0;
            const smoothed = current + (this._targetRate - current) * 0.03;
            this._bgm.setRate(Math.max(0.1, smoothed));
        } catch (_) { /* ignore if sound is not ready */ }
    }

    /**
     * Call on game-over.
     * Slows and quiets the BGM to simulate a low-pass filter effect.
     */
    onDeath() {
        if (!this._bgm) return;
        try {
            const rateObj = { rate: this._bgm.rate || 1.0 };
            const volObj  = { vol:  this._bgm.volume || 0.55 };

            this._scene.tweens.add({
                targets:  rateObj,
                rate:     0.55,
                duration: 1800,
                ease:     'Sine.easeIn',
                onUpdate: () => {
                    try { this._bgm.setRate(rateObj.rate); } catch (_) {}
                },
            });

            this._scene.tweens.add({
                targets:  volObj,
                vol:      0.15,
                duration: 1800,
                ease:     'Sine.easeIn',
                onUpdate: () => {
                    try { this._bgm.setVolume(volObj.vol); } catch (_) {}
                },
            });
        } catch (_) { /* ignore */ }
    }
}

/**
 * Calculator — centralised game-balance formulas.
 */
export class Calculator {
    /**
     * Returns the damage a tower projectile deals.
     * @param {number} baseDamage  Tower's base damage stat.
     * @param {number} level       Tower level (1-based).
     * @returns {number}
     */
    static getTowerDamage(baseDamage, level) {
        return Math.floor(baseDamage * (1 + (level - 1) * 0.5));
    }

    /**
     * Returns the HP an enemy spawns with for the given wave.
     * @param {number} wave  Current wave number (1-based).
     * @returns {number}
     */
    static getEnemyHealth(wave) {
        return Math.floor(100 * Math.pow(1.2, wave - 1));
    }

    /**
     * Returns the gold reward for killing one enemy on the given wave.
     * @param {number} wave  Current wave number (1-based).
     * @returns {number}
     */
    static getGoldReward(wave) {
        return 10 + (wave - 1) * 5;
    }
}

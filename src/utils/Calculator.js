export default class Calculator {
    static getTowerDamage(baseDamage, level) {
        return Math.floor(baseDamage * (1 + (level - 1) * 0.5));
    }

    static getEnemyHealth(wave) {
        return Math.floor(50 + wave * 20);
    }

    static getGoldReward(wave) {
        return Math.floor(10 + wave * 2);
    }

    static getUpgradeCost(level) {
        return level * 50;
    }
}

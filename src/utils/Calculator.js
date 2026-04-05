export class Calculator {
    // Здоровье врагов растет на 18% каждую волну
    static getEnemyHealth(wave) {
        return Math.floor(100 * Math.pow(1.18, wave - 1));
    }

    // Урон башен (логарифмический рост, чтобы не было дисбаланса)
    static getTowerDamage(baseDamage, level) {
        return Math.floor(baseDamage * (1 + 0.35 * Math.log2(level + 1)));
    }

    // Награда за волну (добавляем корень из номера волны)
    static getGoldReward(wave) {
        return Math.floor(15 + 5 * Math.sqrt(wave));
    }

    // Стоимость лечения колена (Мазь)
    static getOintmentCost() {
        return 100;
    }
}

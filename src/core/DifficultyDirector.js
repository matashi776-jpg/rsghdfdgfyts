/**
 * DifficultyDirector.js
 * Scales difficulty per wave using ACID KHUTIR formulas.
 * HP  = 60 + wave*15 + log(wave+1)*10
 * SPD = 40 + wave*2
 * GOLD = 5 * (1 + wave*0.05)
 */
const DifficultyDirector = {
  enemyHP(wave) {
    return Math.floor(60 + wave * 15 + Math.log(wave + 1) * 10);
  },

  enemySpeed(wave) {
    return 40 + wave * 2;
  },

  goldReward(wave) {
    return Math.floor(5 * (1 + wave * 0.05));
  },

  waveEnemyCount(wave) {
    return 3 + Math.floor(wave * 1.5);
  },

  isBossWave(wave) {
    return wave % 10 === 0;
  },
};

export default DifficultyDirector;

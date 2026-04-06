/**
 * Enemy_ZombieClerk.js
 * Зомбі-клерк — заражений паперовий раб системи.
 */
import Enemy from '../classes/Enemy.js';
import DifficultyDirector from '../core/DifficultyDirector.js';

export default class Enemy_ZombieClerk extends Enemy {
  constructor(scene, x, y, wave = 1) {
    const hp = DifficultyDirector.enemyHP(wave);
    const speed = DifficultyDirector.enemySpeed(wave);
    super(scene, x, y, hp, speed, 'clerk');
    this.type = 'zombie_clerk';
    this.goldValue = DifficultyDirector.goldReward(wave);
  }
}

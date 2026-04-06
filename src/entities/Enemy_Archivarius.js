/**
 * Enemy_Archivarius.js
 * Архіваріус — людина-картотека. Tanky, slow.
 */
import Enemy from '../classes/Enemy.js';
import DifficultyDirector from '../core/DifficultyDirector.js';

export default class Enemy_Archivarius extends Enemy {
  constructor(scene, x, y, wave = 1) {
    const hp = Math.floor(DifficultyDirector.enemyHP(wave) * 2.2);
    const speed = Math.floor(DifficultyDirector.enemySpeed(wave) * 0.55);
    super(scene, x, y, hp, speed, 'department_head');
    this.type = 'archivarius';
    this.goldValue = DifficultyDirector.goldReward(wave) * 3;
  }
}

/**
 * Enemy_Inspector.js
 * Інспектор — ходяча печать-каратель. Fast, low HP.
 */
import Enemy from '../classes/Enemy.js';
import DifficultyDirector from '../core/DifficultyDirector.js';

export default class Enemy_Inspector extends Enemy {
  constructor(scene, x, y, wave = 1) {
    const hp = Math.floor(DifficultyDirector.enemyHP(wave) * 0.65);
    const speed = Math.floor(DifficultyDirector.enemySpeed(wave) * 1.8);
    super(scene, x, y, hp, speed, 'intern');
    this.type = 'inspector';
    this.goldValue = DifficultyDirector.goldReward(wave) * 1.5;
  }
}

/**
 * Enemy_ZombieClerk.js
 * Zombie Soviet bureaucrat — most common enemy.
 * Medium HP, medium speed. Spawns neon-green slime on death.
 */
import Enemy from './Enemy.js';

export default class Enemy_ZombieClerk extends Enemy {
  constructor(scene, x, y, hp, speed) {
    super(scene, x, y, hp, speed, 'zombie_clerk');
  }

  die() {
    if (!this.alive) return;
    // Acid splash VFX before standard die()
    if (this.sprite && this.sprite.active && this.scene.fxSystem) {
      this.scene.fxSystem.spawnAcidSplash(this.sprite.x, this.sprite.y);
    }
    super.die();
  }
}

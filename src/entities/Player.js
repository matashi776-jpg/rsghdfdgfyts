/**
 * Player.js
 * Сергій — кибер-тракторист з Ланчина.
 * Manages player state, movement, and shooting.
 */
import GameConfig from '../core/GameConfig.js';

export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp = GameConfig.PLAYER.BASE_HP;
    this.maxHP = GameConfig.PLAYER.BASE_HP;
    this.damage = GameConfig.PLAYER.BASE_DAMAGE;
    this.speed = GameConfig.PLAYER.SPEED;
    this.fireRate = GameConfig.PLAYER.FIRE_RATE;
    this.alive = true;

    const texKey = scene.textures.exists('player_idle') ? 'player_idle' : '__DEFAULT';
    this.sprite = scene.physics.add.sprite(x, y, texKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(8);

    this._lastShot = 0;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.die();
  }

  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + amount);
  }

  canShoot(time) {
    return this.alive && time - this._lastShot >= this.fireRate;
  }

  markShot(time) {
    this._lastShot = time;
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    if (this.scene.onPlayerDied) this.scene.onPlayerDied();
  }

  update(cursors, time) {
    if (!this.alive || !this.sprite || !this.sprite.active) return;
    const spd = this.speed;
    const vx = (cursors.left.isDown ? -spd : cursors.right.isDown ? spd : 0);
    const vy = (cursors.up.isDown ? -spd : cursors.down.isDown ? spd : 0);
    this.sprite.setVelocity(vx, vy);
  }

  destroy() {
    this.alive = false;
    if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
  }
}

/**
 * Enemy.js
 * Represents a single enemy sprite in the game world.
 * Wraps the raw Phaser physics sprite created by EnemyManager and exposes
 * typed HP / speed accessors along with a stun helper.
 */
export default class Enemy {
  /**
   * @typedef {'enemy_clerk'|'enemy_runner'|'enemy_tank'|'boss_vakhtersha'} EnemyType
   */

  /**
   * Definitions for each enemy type.
   * baseSpeed: px/s at wave 1 (+10% per wave)
   * hpMult: multiplier on top of the wave-scaled baseHP
   * w/h: display dimensions in pixels
   * tint: neon colour tint applied to the sprite
   * @type {Object.<string, {baseSpeed:number, hpMult:number, w:number, h:number, tint:number, isBoss:boolean}>}
   */
  static DEFS = {
    enemy_clerk:      { baseSpeed: 60,  hpMult: 1.0, w: 48,  h: 64,  tint: 0xaa44ff, isBoss: false },
    enemy_runner:     { baseSpeed: 120, hpMult: 0.7, w: 40,  h: 56,  tint: 0xff6600, isBoss: false },
    enemy_tank:       { baseSpeed: 30,  hpMult: 3.0, w: 80,  h: 80,  tint: 0x00ff44, isBoss: false },
    boss_vakhtersha:  { baseSpeed: 15,  hpMult: 1.0, w: 120, h: 140, tint: 0xff00ff, isBoss: true  },
  };

  /**
   * @param {Phaser.Physics.Arcade.Sprite} sprite - Pre-created physics sprite
   * @param {EnemyType} type
   * @param {number} wave - Current wave number (used to scale stats)
   * @param {number} baseHP - Base HP before wave scaling
   */
  constructor(sprite, type, wave, baseHP) {
    const def = Enemy.DEFS[type] || Enemy.DEFS.enemy_clerk;

    this.sprite = sprite;
    this.type   = type;

    // Apply visual properties
    sprite.setDisplaySize(def.w, def.h);
    sprite.setTint(def.tint);
    sprite.setDepth(def.isBoss ? 6 : 4);

    // Calculate scaled stats
    const speedScale = 1 + (wave - 1) * 0.10;
    this.speed = def.baseSpeed * speedScale;

    sprite.body.setVelocityX(-this.speed);

    sprite.maxHp = def.isBoss
      ? 15000
      : Math.round(baseHP * (1 + (wave - 1) * 0.30) * def.hpMult);
    sprite.hp = sprite.maxHp;
    sprite.isBoss          = def.isBoss;
    sprite.isAttackingWall = false;
  }

  /** Freeze the enemy for `duration` ms (stun mechanic). */
  stun(duration) {
    if (!this.sprite.active) return;
    this.sprite.body.setVelocityX(0);
    this.sprite.isStunned = true;
    this.sprite.scene.time.delayedCall(duration, () => {
      if (this.sprite && this.sprite.active && !this.sprite.isAttackingWall) {
        this.sprite.body.setVelocityX(-this.speed);
        this.sprite.isStunned = false;
      }
    });
  }
}

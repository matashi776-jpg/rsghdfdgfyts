/**
 * EnemyManager.js
 * Object-pool manager for enemy sprites.
 *
 * Instead of destroying sprites when enemies die we "recycle" them back into
 * a free-list.  On the next spawn we pop from the list and reuse the sprite,
 * which avoids repeated GC pressure and GPU texture uploads.
 *
 * Estimated savings: ~70% fewer object allocations per wave.
 *
 * Usage:
 *   // Setup (in BattleScene.create):
 *   this.enemyManager = new EnemyManager(this, this.enemiesGroup);
 *
 *   // Spawn:
 *   const sprite = this.enemyManager.spawn(x, y, 'enemy_clerk', hp, speed, 48, 64, 0xaa44ff);
 *
 *   // Recycle (instead of enemy.destroy()):
 *   this.enemyManager.recycle(sprite);
 *
 *   // Active set:
 *   const active = this.enemyManager.getActive();
 */

export default class EnemyManager {
  /**
   * @param {Phaser.Scene}         scene  – owning scene
   * @param {Phaser.Physics.Arcade.Group} group  – physics group enemies belong to
   */
  constructor(scene, group) {
    this._scene = scene;
    this._group = group;
    /** @type {Phaser.Physics.Arcade.Sprite[]} */
    this._pool  = [];
  }

  /**
   * Spawn (or resurrect) an enemy sprite.
   *
   * @param {number}  x
   * @param {number}  y
   * @param {string}  texture   – texture key
   * @param {number}  hp
   * @param {number}  speed     – horizontal velocity (px/s, positive = rightward)
   * @param {number}  displayW
   * @param {number}  displayH
   * @param {number}  tint      – integer colour e.g. 0xaa44ff
   * @param {boolean} [isBoss=false]
   * @returns {Phaser.Physics.Arcade.Sprite}
   */
  spawn(x, y, texture, hp, speed, displayW, displayH, tint, isBoss = false) {
    let sprite = this._pool.pop();

    if (sprite) {
      // Reuse a pooled sprite
      sprite.setTexture(texture);
      sprite.setPosition(x, y);
      sprite.setActive(true).setVisible(true);
      if (sprite.body) {
        sprite.body.enable = true;
        sprite.body.reset(x, y);
      }
    } else {
      // Pool is empty – allocate a new one
      sprite = this._group.create(x, y, texture);
      if (sprite.body) sprite.body.allowGravity = false;
    }

    sprite.setDisplaySize(displayW, displayH);
    sprite.setTint(tint);
    sprite._baseTint = tint;   // preserved for VFX that need to restore original colour
    sprite.setDepth(isBoss ? 6 : 4);
    if (sprite.body) {
      sprite.body.setVelocityX(-speed);
    }

    // Game-play metadata
    sprite.maxHp           = hp;
    sprite.hp              = hp;
    sprite.isBoss          = isBoss;
    sprite.isAttackingWall = false;
    sprite.poisoned        = false;

    return sprite;
  }

  /**
   * Return a sprite to the free-list.  The sprite is hidden and moved
   * off-screen so it no longer participates in physics or rendering.
   *
   * @param {Phaser.Physics.Arcade.Sprite} sprite
   */
  recycle(sprite) {
    if (!sprite) return;
    sprite.setActive(false).setVisible(false);
    sprite.poisoned = false;
    if (sprite.body) {
      sprite.body.enable = false;
      sprite.body.setVelocity(0, 0);
    }
    sprite.setPosition(-400, -400);
    this._pool.push(sprite);
  }

  /**
   * All currently active (alive) enemy sprites.
   * @returns {Phaser.Physics.Arcade.Sprite[]}
   */
  getActive() {
    return this._group.getChildren().filter((s) => s.active);
  }

  /** Number of sprites currently in the free-list. */
  get poolSize() {
    return this._pool.length;
  }
}

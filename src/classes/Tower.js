/**
 * Tower.js
 * Represents a placed defender unit.
 * Supports unitType: 'goose' | 'superHero' | 'goldenGoose'
 */
import Calculator from '../utils/Calculator.js';

const UNIT_DEFS = {
  goose: {
    texture: 'goose',
    scale: 0.15,
    baseDamage: 30,
    fireRate: 1000,
    range: 220,
    incomeInterval: 0,
    incomeAmount: 0,
  },
  superHero: {
    texture: 'hero',
    scale: 0.18,
    baseDamage: 150,
    fireRate: 2500,
    range: 280,
    incomeInterval: 0,
    incomeAmount: 0,
  },
  goldenGoose: {
    texture: 'goose',
    scale: 0.15,
    baseDamage: 0,
    fireRate: 0,
    range: 0,
    incomeInterval: 5000,
    incomeAmount: 50,
  },
};

export default class Tower {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} lane  – 0|1|2
   * @param {string} unitType – 'goose' | 'superHero' | 'goldenGoose'
   */
  constructor(scene, x, y, lane, unitType = 'goose') {
    this.scene = scene;
    this.lane = lane;
    this.unitType = unitType;
    this.level = 1;
    this.alive = true;
    this._boosted = false;

    const def = UNIT_DEFS[unitType] || UNIT_DEFS.goose;
    this.baseDamage = def.baseDamage;
    this.fireRate = def.fireRate;
    this._originalFireRate = this.fireRate;
    this.range = def.range;

    this.sprite = scene.physics.add.sprite(x, y, def.texture);
    this.sprite.setScale(def.scale);
    this.sprite.body.allowGravity = false;
    this.sprite.setImmovable(true);
    this.sprite.setDepth(6);
    this.sprite.towerRef = this;

    // Golden Goose gets a golden tint so it's visually distinct
    if (unitType === 'goldenGoose') {
      this.sprite.setTint(0xffd700);
    }

    // Drop shadow
    this._shadow = scene.add.ellipse(x, y + 12, 28, 8, 0x000000, 0.38).setDepth(5);

    // Breathing idle tween
    const s = def.scale;
    scene.tweens.add({
      targets: this.sprite,
      scaleX: s * 1.02,
      scaleY: s * 1.02,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Shooting timer (only for combat units)
    this._shootTimer = null;
    if (this.fireRate > 0) {
      this._shootTimer = scene.time.addEvent({
        delay: this.fireRate,
        callback: this._tryShoot,
        callbackScope: this,
        loop: true,
      });
    }

    // Income timer (Golden Goose only)
    this._incomeTimer = null;
    if (def.incomeInterval > 0 && def.incomeAmount > 0) {
      this._incomeTimer = scene.time.addEvent({
        delay: def.incomeInterval,
        loop: true,
        callback: () => {
          if (!this.alive) return;
          scene.gold += def.incomeAmount;
          scene.events.emit('goldChanged', scene.gold);
          scene._floatingText && scene._floatingText(x, y - 30, `+${def.incomeAmount} ₴`, '#ffd700');
        },
      });
    }
  }

  get damage() {
    return Calculator.towerDamage(this.baseDamage, this.level);
  }

  _tryShoot() {
    if (!this.alive || !this.scene) return;

    const enemies = this.scene.enemies || [];
    let target = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive || !enemy.sprite || !enemy.sprite.active) continue;
      if (Math.abs(enemy.sprite.y - this.sprite.y) > 60) continue;
      const dist = enemy.sprite.x - this.sprite.x;
      if (dist > 0 && dist < this.range && dist < minDist) {
        minDist = dist;
        target = enemy;
      }
    }

    if (target) {
      this._shoot(target);
    }
  }

  _shoot(target) {
    if (this.scene.fireProjectile) {
      this.scene.fireProjectile(this, target);
    }
  }

  boost(duration) {
    if (this._boosted || !this._shootTimer) return;
    this._boosted = true;
    this._shootTimer.reset({
      delay: this.fireRate / 2,
      callback: this._tryShoot,
      callbackScope: this,
      loop: true,
    });
    this.scene.time.delayedCall(duration, () => {
      if (!this.alive) return;
      this._boosted = false;
      if (this._shootTimer) {
        this._shootTimer.reset({
          delay: this.fireRate,
          callback: this._tryShoot,
          callbackScope: this,
          loop: true,
        });
      }
    });
  }

  destroy() {
    this.alive = false;
    if (this._shootTimer) {
      this._shootTimer.destroy();
      this._shootTimer = null;
    }
    if (this._incomeTimer) {
      this._incomeTimer.destroy();
      this._incomeTimer = null;
    }
    if (this._shadow) {
      this._shadow.destroy();
      this._shadow = null;
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}

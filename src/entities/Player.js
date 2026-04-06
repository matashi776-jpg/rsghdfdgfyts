/**
 * Player.js
 * Сергій — кибер-тракторист. Supports WASD movement and LMB shooting.
 */
export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.alive = true;
    this.maxHP = 200;
    this.hp = 200;
    this.speed = 200;
    this.damage = 30;
    this.fireRate = 400; // ms between shots
    this._lastShot = 0;

    // Sprite — use 'sergiy' texture if loaded, otherwise generate a neon fallback
    if (!scene.textures.exists('sergiy_player')) {
      const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0xff00ff, 1);
      gfx.fillRect(0, 0, 40, 60);
      gfx.fillStyle(0x00ffff, 1);
      gfx.fillRect(8, 10, 24, 20);
      gfx.generateTexture('sergiy_player', 40, 60);
      gfx.destroy();
    }
    const texKey = scene.textures.exists('sergiy') ? 'sergiy' : 'sergiy_player';

    this.sprite = scene.physics.add.sprite(x, y, texKey);
    this.sprite.setDepth(8);
    this.sprite.body.allowGravity = false;
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.playerRef = this;

    // HP bar graphics
    this._hpBar = scene.add.graphics().setDepth(10);

    // Input
    this._cursors = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Pointer for LMB shooting
    this._pointer = scene.input.activePointer;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    if (this.sprite && this.sprite.active) {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        angle: 90,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
          }
        },
      });
    }
    if (this.scene.onPlayerDied) {
      this.scene.onPlayerDied();
    }
  }

  _shoot() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;
    const now = this.scene.time.now;
    if (now - this._lastShot < this.fireRate) return;
    this._lastShot = now;

    const ptr = this._pointer;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      ptr.worldX,    ptr.worldY,
    );
    const speed = 600;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Reuse scene's projectilesGroup if available
    const group = this.scene.projectilesGroup;
    const bullet = group
      ? group.create(this.sprite.x, this.sprite.y, 'particle_neon_pink')
      : this.scene.physics.add.image(this.sprite.x, this.sprite.y, 'particle_neon_pink');

    bullet.setDepth(7);
    bullet.body.allowGravity = false;
    bullet.setVelocity(vx, vy);
    bullet.playerDamage = this.damage;

    // Destroy bullet after 1.5 s if it hits nothing
    this.scene.time.delayedCall(1500, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  _drawHPBar() {
    if (!this.sprite || !this.sprite.active) return;
    this._hpBar.clear();
    const bx = this.sprite.x - 20;
    const by = this.sprite.y - (this.sprite.displayHeight / 2) - 10;
    const bw = 40;
    const bh = 5;
    const ratio = Math.max(0, this.hp / this.maxHP);
    this._hpBar.fillStyle(0x000000, 0.7);
    this._hpBar.fillRect(bx, by, bw, bh);
    const barColor = ratio > 0.5 ? 0x00ff88 : ratio > 0.25 ? 0xffaa00 : 0xff2200;
    this._hpBar.fillStyle(barColor, 1);
    this._hpBar.fillRect(bx, by, Math.floor(bw * ratio), bh);
  }

  update(time, delta) {
    if (!this.alive || !this.sprite || !this.sprite.active) return;

    // Movement
    const vx = (this._cursors.left.isDown ? -1 : this._cursors.right.isDown ? 1 : 0) * this.speed;
    const vy = (this._cursors.up.isDown   ? -1 : this._cursors.down.isDown  ? 1 : 0) * this.speed;
    this.sprite.setVelocity(vx, vy);

    // Shoot on LMB held
    if (this._pointer.isDown) {
      this._shoot();
    }

    this._drawHPBar();
  }

  destroy() {
    this.alive = false;
    if (this._hpBar) {
      this._hpBar.destroy();
      this._hpBar = null;
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

/**
 * Enemy.js
 * Represents an enemy unit (bureaucrat or boss).
 */
export default class Enemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} hp
   * @param {number} speed   – pixels per second
   * @param {string} tier    – 'bureaucrat' | 'boss' | 'intern' | 'clerk' | 'department_head'
   */
  constructor(scene, x, y, hp, speed, tier) {
    this.scene = scene;
    this.tier = tier;
    this.maxHP = hp;
    this.hp = hp;
    this.speed = speed;
    this.alive = true;

    // Support new named types as well as legacy tiers
    const isBoss = tier === 'boss';
    const isBureaucrat = tier === 'bureaucrat';

    // Colour coding per tier (legacy fallback)
    const colours = {
      intern: 0xaaaaaa,
      clerk: 0x888888,
      department_head: 0x555555,
      bureaucrat: 0x888888,
      boss: 0x333366,
    };
    const sizes = {
      intern: { w: 22, h: 32 },
      clerk: { w: 28, h: 38 },
      department_head: { w: 36, h: 48 },
      bureaucrat: { w: 28, h: 38 },
      boss: { w: 64, h: 80 },
    };
    const { w, h } = sizes[tier] || sizes.intern;

    // Use named asset texture if available, otherwise generate a fallback
    let texKey;
    if ((isBureaucrat || isBoss) && scene.textures.exists(tier)) {
      texKey = tier;
    } else {
      texKey = `enemy_tex_${tier}`;
      if (!scene.textures.exists(texKey)) {
        const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
        gfx.fillStyle(colours[tier] || 0xaaaaaa, 1);
        gfx.fillRect(0, 0, w, h);
        // Briefcase detail for bureaucrat-type enemies
        if (!isBoss) {
          gfx.fillStyle(0x333333, 1);
          gfx.fillRect(Math.floor(w * 0.3), Math.floor(h * 0.55), Math.floor(w * 0.4), Math.floor(h * 0.25));
        }
        gfx.generateTexture(texKey, w, h);
        gfx.destroy();
      }
    }

    this.sprite = scene.physics.add.sprite(x, y, texKey);
    this.sprite.setImmovable(false);
    this.sprite.body.allowGravity = false;
    this.sprite.setDepth(6);
    this.sprite.enemyRef = this;
    // Attach health variables directly to the sprite
    this.sprite.hp = this.hp;
    this.sprite.maxHP = this.maxHP;
    this.sprite.enemyTier = tier;

    // Drop shadow – semi-transparent oval under the bureaucrat
    const shadowW = w * 1.6;
    this._shadow = scene.add.ellipse(x, y + h / 2 + 2, shadowW, 9, 0x000000, 0.35).setDepth(5);

    // Health bar (drawn as graphics, updated each frame)
    this.hpBar = scene.add.graphics();
    this._drawHPBar();

    // Speech bubble (optional)
    this.bubble = null;
    this.bubbleText = null;

    // 30% chance to show a speech bubble on spawn
    if (Math.random() < 0.3) {
      this._showSpeechBubble();
    }
  }

  _drawHPBar() {
    if (!this.sprite || !this.sprite.active) return;
    this.hpBar.clear();
    const bx = this.sprite.x - 18;
    const by = this.sprite.y - (this.sprite.height / 2) - 8;
    const bw = 36;
    const bh = 4;
    const ratio = Math.max(0, this.hp / this.maxHP);
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRect(bx, by, bw, bh);
    this.hpBar.fillStyle(ratio > 0.5 ? 0x00cc44 : ratio > 0.25 ? 0xffaa00 : 0xff2200, 1);
    this.hpBar.fillRect(bx, by, Math.floor(bw * ratio), bh);
  }

  _showSpeechBubble() {
    // Ukrainian bureaucrat excuses:
    //   'Come back tomorrow!', 'We are on lunch break!', 'Where is the certificate?'
    const phrases = ['Приходьте завтра!', 'У нас обід!', 'Де довідка?'];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    this.bubbleText = this.scene.add
      .text(this.sprite.x, this.sprite.y - 50, phrase, {
        fontSize: '9px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: '#fffbe6',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(20);

    this.scene.time.delayedCall(2500, () => {
      if (this.bubbleText) {
        this.bubbleText.destroy();
        this.bubbleText = null;
      }
    });
  }

  stun(duration) {
    this._stunned = true;
    if (this._stunTimer) this._stunTimer.remove();
    this._stunTimer = this.scene.time.delayedCall(duration, () => {
      this._stunned = false;
      this._stunTimer = null;
    });
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.sprite) this.sprite.hp = this.hp;
    if (this.hp <= 0) {
      this.hp = 0;
      if (this.sprite) this.sprite.hp = 0;
      this.die();
    } else {
      this._drawHPBar();
    }
  }

  die() {
    if (!this.alive) return;
    this.alive = false;

    // Clean up non-sprite elements immediately
    if (this.bubbleText) {
      this.bubbleText.destroy();
      this.bubbleText = null;
    }
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }

    if (this.sprite && this.sprite.active) {
      // Disable physics so it no longer interacts
      this.sprite.disableBody(true, false);

      // Defeat animation: spin ~half-turn and fall downward while fading out (500 ms)
      this.scene.tweens.add({
        targets: this.sprite,
        angle: 160, // roughly half rotation for a dramatic topple effect
        y: this.sprite.y + 70,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
          }
        },
      });

      // Shadow fades and shrinks in sync
      if (this._shadow) {
        this.scene.tweens.add({
          targets: this._shadow,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            if (this._shadow) {
              this._shadow.destroy();
              this._shadow = null;
            }
          },
        });
      }
    } else {
      if (this._shadow) {
        this._shadow.destroy();
        this._shadow = null;
      }
    }

    // Notify scene
    if (this.scene && this.scene.onEnemyDied) {
      this.scene.onEnemyDied(this);
    }
  }

  _cleanup() {
    if (this.bubbleText) {
      this.bubbleText.destroy();
      this.bubbleText = null;
    }
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }
    if (this._shadow) {
      this._shadow.destroy();
      this._shadow = null;
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.disableBody(true, true);
      this.scene.time.delayedCall(50, () => {
        if (this.sprite) {
          this.sprite.destroy();
          this.sprite = null;
        }
      });
    }
  }

  update() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;
    // Move left (pause when stunned by a defender)
    if (!this._stunned) {
      this.sprite.setVelocityX(-this.speed);
    } else {
      this.sprite.setVelocityX(0);
    }
    this._drawHPBar();

    // Keep shadow grounded under the unit
    if (this._shadow) {
      this._shadow.setPosition(
        this.sprite.x,
        this.sprite.y + this.sprite.height / 2 + 2
      );
    }

    // Update speech bubble position
    if (this.bubbleText) {
      this.bubbleText.setPosition(this.sprite.x, this.sprite.y - 50);
    }
  }

  destroy() {
    this.alive = false;
    this._cleanup();
  }
}

/**
 * Enemy.js
 * Base enemy entity for ACID KHUTIR.
 * Specialised subtypes extend this class and override _buildSprite().
 */
export default class Enemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} hp
   * @param {number} speed   – pixels per second
   * @param {string} tier    – 'zombie_clerk' | 'archivarius' | 'inspector' | 'boss'
   */
  constructor(scene, x, y, hp, speed, tier) {
    this.scene  = scene;
    this.tier   = tier;
    this.maxHP  = hp;
    this.hp     = hp;
    this.speed  = speed;
    this.alive  = true;
    this._stunned = false;

    const { w, h, texKey, tint } = this._resolveAsset(tier);
    this.sprite = scene.physics.add.sprite(x, y, texKey);
    this.sprite.setDisplaySize(w, h);
    this.sprite.setTint(tint);
    this.sprite.body.allowGravity = false;
    this.sprite.setImmovable(false);
    this.sprite.setDepth(6);
    this.sprite.enemyRef = this;
    this.sprite.hp     = this.hp;
    this.sprite.maxHP  = this.maxHP;
    this.sprite.enemyTier = tier;

    this._shadow = scene.add.ellipse(
      x, y + h / 2 + 2, w * 1.6, 9, 0x000000, 0.35,
    ).setDepth(5);

    this.hpBar = scene.add.graphics();
    this._drawHPBar();

    this.bubbleText = null;
    if (Math.random() < 0.3) this._showSpeechBubble();
  }

  // ── Asset resolution ──────────────────────────────────────────────────────

  _resolveAsset(tier) {
    const DEFS = {
      zombie_clerk: { w: 48, h: 64, tex: 'enemy_clerk',     tint: 0xaa44ff },
      archivarius:  { w: 56, h: 72, tex: 'enemy_archivarius', tint: 0x00ff88 },
      inspector:    { w: 44, h: 60, tex: 'enemy_inspector',  tint: 0xff00aa },
      runner:       { w: 40, h: 56, tex: 'enemy_runner',     tint: 0xff6600 },
      tank:         { w: 80, h: 80, tex: 'enemy_tank',       tint: 0x00ff44 },
      boss:         { w: 120, h: 140, tex: 'boss_vakhtersha', tint: 0xff00ff },
    };
    const def = DEFS[tier] || DEFS.zombie_clerk;
    const texKey = this._ensureTexture(def.tex, def.w, def.h, def.tint);
    return { w: def.w, h: def.h, texKey, tint: def.tint };
  }

  _ensureTexture(key, w, h, color) {
    if (this.scene.textures.exists(key) && this.scene.textures.get(key).key !== '__MISSING') {
      return key;
    }
    const fk = `enemy_fb_${key}`;
    if (!this.scene.textures.exists(fk)) {
      const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, 0, w, h);
      gfx.generateTexture(fk, w, h);
      gfx.destroy();
    }
    return fk;
  }

  // ── HP bar ────────────────────────────────────────────────────────────────

  _drawHPBar() {
    if (!this.sprite || !this.sprite.active) return;
    this.hpBar.clear();
    const bx    = this.sprite.x - 18;
    const by    = this.sprite.y - (this.sprite.displayHeight / 2) - 8;
    const ratio = Math.max(0, this.hp / this.maxHP);
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRect(bx, by, 36, 4);
    const barColor = ratio > 0.5 ? 0x00ff88 : ratio > 0.25 ? 0xffaa00 : 0xff2200;
    this.hpBar.fillStyle(barColor, 1);
    this.hpBar.fillRect(bx, by, Math.floor(36 * ratio), 4);
  }

  // ── Speech bubble ─────────────────────────────────────────────────────────

  _showSpeechBubble() {
    const phrases = ['Приходьте завтра!', 'У нас обід!', 'Де довідка?', 'Не по регламенту!'];
    const phrase  = phrases[Math.floor(Math.random() * phrases.length)];
    this.bubbleText = this.scene.add
      .text(this.sprite.x, this.sprite.y - 55, phrase, {
        fontSize: '9px', fontFamily: 'Arial',
        color: '#000000', backgroundColor: '#fffbe6',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(20);
    this.scene.time.delayedCall(2500, () => {
      if (this.bubbleText) { this.bubbleText.destroy(); this.bubbleText = null; }
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

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
      this.die();
    } else {
      this._drawHPBar();
    }
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    if (this.bubbleText) { this.bubbleText.destroy(); this.bubbleText = null; }
    if (this.hpBar)      { this.hpBar.destroy();      this.hpBar      = null; }

    if (this.sprite && this.sprite.active) {
      this.sprite.disableBody(true, false);
      this.scene.tweens.add({
        targets: this.sprite,
        angle: 160, y: this.sprite.y + 70, alpha: 0,
        duration: 500, ease: 'Power2',
        onComplete: () => { if (this.sprite) { this.sprite.destroy(); this.sprite = null; } },
      });
      if (this._shadow) {
        this.scene.tweens.add({
          targets: this._shadow,
          alpha: 0, scaleX: 0, scaleY: 0,
          duration: 400, ease: 'Power2',
          onComplete: () => { if (this._shadow) { this._shadow.destroy(); this._shadow = null; } },
        });
      }
    } else {
      if (this._shadow) { this._shadow.destroy(); this._shadow = null; }
    }

    if (this.scene && this.scene.onEnemyDied) this.scene.onEnemyDied(this);
  }

  update() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;
    this.sprite.setVelocityX(this._stunned ? 0 : -this.speed);
    this._drawHPBar();
    if (this._shadow) this._shadow.setPosition(this.sprite.x, this.sprite.y + this.sprite.displayHeight / 2 + 2);
    if (this.bubbleText) this.bubbleText.setPosition(this.sprite.x, this.sprite.y - 55);
  }

  destroy() {
    this.alive = false;
    if (this.bubbleText) { this.bubbleText.destroy(); this.bubbleText = null; }
    if (this.hpBar)      { this.hpBar.destroy();      this.hpBar      = null; }
    if (this._shadow)    { this._shadow.destroy();    this._shadow    = null; }
    if (this.sprite && this.sprite.active) {
      this.sprite.disableBody(true, true);
      this.scene.time.delayedCall(50, () => {
        if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
      });
    }
  }
}

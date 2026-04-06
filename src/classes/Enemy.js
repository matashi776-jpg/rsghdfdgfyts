/**
 * Enemy.js
 * Represents an enemy unit — Acid Khutir Enemy Bible.
 *
 * Tiers / types:
 *   zombie_clerk   — tall, thin, jerky walk, papers fly on hit
 *   archivarius    — square, massive, slow; paper-rain death explosion
 *   inspector      — medium, wide shoulders; stamps ground → slows defender fire
 *   tank_babtsia   — round, low; shoots hot varenyky on move timer
 *   bureaucrat     — legacy alias for zombie_clerk
 *   intern         — small, fast bureaucrat
 *   clerk          — legacy alias for zombie_clerk
 *   department_head — legacy alias for archivarius
 *   boss           — Comrade Vakhtersha (3 phases)
 */
import { PALETTE } from '../FXManager.js';

// ─── Enemy definitions ────────────────────────────────────────────────────────
const ENEMY_DEFS = {
  intern:          { w: 22, h: 32, color: 0x444466, tint: 0x9955FF, silhouette: 'thin'   },
  clerk:           { w: 28, h: 64, color: 0x2A004A, tint: 0xFF00D4, silhouette: 'tall'   },
  zombie_clerk:    { w: 28, h: 64, color: 0x2A004A, tint: 0xFF00D4, silhouette: 'tall'   },
  bureaucrat:      { w: 28, h: 38, color: 0x444466, tint: 0xAA44FF, silhouette: 'medium' },
  archivarius:     { w: 56, h: 56, color: 0x1A1A00, tint: 0xFFB300, silhouette: 'square' },
  department_head: { w: 36, h: 48, color: 0x333300, tint: 0xFFB300, silhouette: 'square' },
  inspector:       { w: 44, h: 60, color: 0x3A0000, tint: 0xFF0033, silhouette: 'medium' },
  tank_babtsia:    { w: 80, h: 60, color: 0x002233, tint: 0x39FF14, silhouette: 'round'  },
  enemy_tank:      { w: 80, h: 80, color: 0x002233, tint: 0x39FF14, silhouette: 'round'  },
  boss:            { w: 120, h: 140, color: 0x1A004A, tint: 0xFF00D4, silhouette: 'boss' },
};

// Speech bubbles per type (bureaucratic Ukrainian excuses)
const SPEECH = {
  zombie_clerk:    ['Приходьте завтра!', 'У нас обід!', 'Де довідка?'],
  archivarius:     ['Форма застаріла!', 'Не той штамп!', 'Архів зачинено!'],
  inspector:       ['ПЕРЕВІРКА!', 'Документи!', 'Порушення!'],
  tank_babtsia:    ['Вареники!', 'Ану стій!', 'Куди без черги?!'],
  boss:            ['Пропуск є?', 'ПОРЯДОК!', 'ТОВАРИШ ВАХТЕРША ПРИЙШЛА!'],
  default:         ['Приходьте завтра!', 'У нас обід!', 'Де довідка?'],
};

export default class Enemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} hp
   * @param {number} speed   – pixels per second
   * @param {string} tier    – Enemy type. One of: 'zombie_clerk' | 'archivarius' |
   *                           'inspector' | 'tank_babtsia' | 'boss' | 'bureaucrat' |
   *                           'intern' | 'clerk' | 'department_head' | 'enemy_tank'
   */
  constructor(scene, x, y, hp, speed, tier) {
    this.scene = scene;
    this.tier = tier;
    this.maxHP = hp;
    this.hp = hp;
    this.speed = speed;
    this.alive = true;
    this._stunned = false;
    this._stunTimer = null;
    this._phase = 1; // for boss phases

    const def = ENEMY_DEFS[tier] || ENEMY_DEFS.intern;
    const { w, h } = def;

    // Resolve texture key
    let texKey = tier;
    // Map legacy / alias types to actual asset keys
    const texMap = {
      zombie_clerk:    'enemy_clerk',
      bureaucrat:      'enemy_clerk',
      clerk:           'enemy_clerk',
      department_head: 'enemy_archivarius',
      archivarius:     'enemy_archivarius',
      inspector:       'enemy_inspector',
      tank_babtsia:    'enemy_tank',
      enemy_tank:      'enemy_tank',
      boss:            'boss_vakhtersha',
    };
    texKey = texMap[tier] || tier;

    if (!scene.textures.exists(texKey)) {
      texKey = `enemy_fallback_${tier}`;
      if (!scene.textures.exists(texKey)) {
        const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
        gfx.fillStyle(def.color, 1);
        gfx.fillRect(0, 0, w, h);
        // Silhouette detail
        if (def.silhouette === 'boss') {
          // Wide shoulders
          gfx.fillStyle(0x550088, 1);
          gfx.fillRect(Math.floor(w * 0.1), Math.floor(h * 0.1), Math.floor(w * 0.8), Math.floor(h * 0.25));
        } else if (def.silhouette !== 'round') {
          // Briefcase / document
          gfx.fillStyle(0x222222, 1);
          gfx.fillRect(Math.floor(w * 0.3), Math.floor(h * 0.55), Math.floor(w * 0.4), Math.floor(h * 0.25));
        }
        gfx.generateTexture(texKey, w, h);
        gfx.destroy();
      }
    }

    this.sprite = scene.physics.add.sprite(x, y, texKey);
    this.sprite.setDisplaySize(w, h);
    this.sprite.setTint(def.tint);
    this.sprite.body.allowGravity = false;
    this.sprite.setImmovable(false);
    this.sprite.setDepth(6);
    this.sprite.enemyRef = this;
    this.sprite.hp = this.hp;
    this.sprite.maxHP = this.maxHP;
    this.sprite.enemyTier = tier;

    // Drop shadow
    const shadowW = w * 1.5;
    this._shadow = scene.add.ellipse(x, y + h / 2 + 2, shadowW, 9, 0x000000, 0.38).setDepth(5);

    // Health bar
    this.hpBar = scene.add.graphics();
    this._drawHPBar();

    // UV-Reactive neon pulse (pulsing tint brightness)
    this._uvTween = this._startUVPulse(def.tint);

    // Chromatic aberration overlay (red/blue shift silhouette ghost)
    this._caLeft  = null;
    this._caRight = null;
    if (tier !== 'intern') {
      this._buildChromaticAberration(texKey, w, h);
    }

    // Speech bubble (30% chance on spawn)
    this.bubble = null;
    this.bubbleText = null;
    if (Math.random() < 0.3) {
      this._showSpeechBubble();
    }

    // Inspector stamp timer
    this._stampTimer = null;
    if (tier === 'inspector') {
      this._stampTimer = scene.time.addEvent({
        delay: 3000,
        loop: true,
        callbackScope: this,
        callback: this._doInspectorStamp,
      });
    }
  }

  // ─── UV-Reactive pulse ───────────────────────────────────────────────────

  _startUVPulse(tint) {
    if (!this.sprite) return null;
    // Pulsates between 100% and 70% alpha to simulate neon ornament breathing
    return this.scene.tweens.add({
      targets: this.sprite,
      alpha:   { from: 1.0, to: 0.72 },
      duration: 500 + Math.random() * 400,
      yoyo:    true,
      repeat:  -1,
      ease:    'Sine.easeInOut',
    });
  }

  // ─── Chromatic Aberration (red/blue ghost contours) ──────────────────────

  _buildChromaticAberration(texKey, w, h) {
    const shift = 2;
    // Red ghost (right shift)
    this._caRight = this.scene.add.image(this.sprite.x + shift, this.sprite.y, texKey)
      .setDisplaySize(w, h)
      .setTint(0xFF0033)
      .setAlpha(0.28)
      .setDepth(5);
    // Blue ghost (left shift)
    this._caLeft = this.scene.add.image(this.sprite.x - shift, this.sprite.y, texKey)
      .setDisplaySize(w, h)
      .setTint(0x00CFFF)
      .setAlpha(0.28)
      .setDepth(5);
  }

  // ─── Inspector stamp mechanic ─────────────────────────────────────────────

  _doInspectorStamp() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;
    // Notify scene to apply stamp slow effect
    if (this.scene.onInspectorStamp) {
      this.scene.onInspectorStamp(this.sprite.x, this.sprite.y);
    }
    // Visual stamp slam via FXManager
    if (this.scene.fx) {
      this.scene.fx.spawnStampSlam(this.sprite.x, this.sprite.y + this.sprite.displayHeight / 2);
    }
  }

  // ─── HP Bar ───────────────────────────────────────────────────────────────

  _drawHPBar() {
    if (!this.sprite || !this.sprite.active) return;
    this.hpBar.clear();
    const bx = this.sprite.x - 18;
    const by = this.sprite.y - (this.sprite.displayHeight / 2) - 8;
    const bw = 36;
    const bh = 4;
    const ratio = Math.max(0, this.hp / this.maxHP);
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRect(bx, by, bw, bh);
    const fillColor = ratio > 0.5 ? PALETTE.TOXIC_GREEN : ratio > 0.25 ? PALETTE.CYBER_AMBER : PALETTE.PLASMA_RED;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRect(bx, by, Math.floor(bw * ratio), bh);
  }

  // ─── Speech Bubble ────────────────────────────────────────────────────────

  _showSpeechBubble() {
    const pool = SPEECH[this.tier] || SPEECH.default;
    const phrase = pool[Math.floor(Math.random() * pool.length)];

    this.bubbleText = this.scene.add
      .text(this.sprite.x, this.sprite.y - 54, phrase, {
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

  // ─── Stun ─────────────────────────────────────────────────────────────────

  stun(duration) {
    this._stunned = true;
    if (this._stunTimer) this._stunTimer.remove();
    this._stunTimer = this.scene.time.delayedCall(duration, () => {
      this._stunned = false;
      this._stunTimer = null;
    });
  }

  // ─── Damage ───────────────────────────────────────────────────────────────

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.sprite) this.sprite.hp = this.hp;

    // Hit flash — brief tint to white
    if (this.sprite && this.sprite.active) {
      this.sprite.setTint(0xFFFFFF);
      this.scene.time.delayedCall(80, () => {
        if (this.sprite && this.sprite.active) {
          this.sprite.setTint(ENEMY_DEFS[this.tier]?.tint || 0xAAAAAA);
        }
      });
    }

    if (this.hp <= 0) {
      this.hp = 0;
      if (this.sprite) this.sprite.hp = 0;
      this.die();
    } else {
      this._drawHPBar();
    }
  }

  // ─── Death ────────────────────────────────────────────────────────────────

  die() {
    if (!this.alive) return;
    this.alive = false;

    // Stop special timers
    if (this._stampTimer) { this._stampTimer.remove(); this._stampTimer = null; }
    if (this._uvTween)    { this._uvTween.stop(); this._uvTween = null; }

    // Destroy CA overlays
    if (this._caRight) { this._caRight.destroy(); this._caRight = null; }
    if (this._caLeft)  { this._caLeft.destroy();  this._caLeft  = null; }

    if (this.bubbleText) { this.bubbleText.destroy(); this.bubbleText = null; }
    if (this.hpBar)      { this.hpBar.destroy(); this.hpBar = null; }

    if (this.sprite && this.sprite.active) {
      this.sprite.disableBody(true, false);

      // Topple death animation
      this.scene.tweens.add({
        targets:  this.sprite,
        angle:    160,
        y:        this.sprite.y + 70,
        alpha:    0,
        duration: 500,
        ease:     'Power2',
        onComplete: () => {
          if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
        },
      });

      if (this._shadow) {
        this.scene.tweens.add({
          targets:  this._shadow,
          alpha:    0,
          scaleX:   0,
          scaleY:   0,
          duration: 400,
          ease:     'Power2',
          onComplete: () => {
            if (this._shadow) { this._shadow.destroy(); this._shadow = null; }
          },
        });
      }
    } else {
      if (this._shadow) { this._shadow.destroy(); this._shadow = null; }
    }

    if (this.scene && this.scene.onEnemyDied) {
      this.scene.onEnemyDied(this);
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  _cleanup() {
    if (this._stampTimer) { this._stampTimer.remove(); this._stampTimer = null; }
    if (this._uvTween)    { this._uvTween.stop(); this._uvTween = null; }
    if (this._caRight)    { this._caRight.destroy(); this._caRight = null; }
    if (this._caLeft)     { this._caLeft.destroy();  this._caLeft  = null; }
    if (this.bubbleText)  { this.bubbleText.destroy(); this.bubbleText = null; }
    if (this.hpBar)       { this.hpBar.destroy(); this.hpBar = null; }
    if (this._shadow)     { this._shadow.destroy(); this._shadow = null; }
    if (this.sprite && this.sprite.active) {
      this.sprite.disableBody(true, true);
      this.scene.time.delayedCall(50, () => {
        if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
      });
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;

    if (!this._stunned) {
      this.sprite.setVelocityX(-this.speed);
    } else {
      this.sprite.setVelocityX(0);
    }

    this._drawHPBar();

    // Shadow follows feet
    if (this._shadow) {
      this._shadow.setPosition(
        this.sprite.x,
        this.sprite.y + this.sprite.displayHeight / 2 + 2,
      );
    }

    // Chromatic aberration follows sprite with ±2 px offset
    if (this._caRight) this._caRight.setPosition(this.sprite.x + 2, this.sprite.y);
    if (this._caLeft)  this._caLeft.setPosition(this.sprite.x - 2, this.sprite.y);

    // Speech bubble follows sprite
    if (this.bubbleText) {
      this.bubbleText.setPosition(this.sprite.x, this.sprite.y - 54);
    }
  }

  destroy() {
    this.alive = false;
    this._cleanup();
  }
}

/**
 * BossEntity.js
 * Товариш Вахтерша — the main boss of Chapter 1.
 *
 * Manages the boss physics sprite, HP tracking, phase visual changes,
 * and speech bubbles. Phases 1–4 change speed, tint, and label text.
 * The sprite is added to BattleScene.enemiesGroup by BattleScene._spawnBoss()
 * so defender targeting and existing wall-damage logic continue to work.
 */
export default class BossEntity {
  constructor(scene, x, y) {
    this.scene  = scene;
    this.maxHP  = 15000;
    this.hp     = 15000;
    this.baseSpeed = 15; // px/s in phase 1
    this.speed     = this.baseSpeed;
    this.phase     = 1;
    this.alive     = true;

    // ── Sprite ──────────────────────────────────────────────────────────────
    this.sprite = scene.physics.add.sprite(x, y, 'boss_vakhtersha');
    this.sprite.setDisplaySize(120, 140);
    this.sprite.setTint(0xff00ff);
    this.sprite.body.allowGravity = false;
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(6);

    // Properties used by BattleScene overlap callbacks
    this.sprite.isBoss          = true;
    this.sprite.isAttackingWall = false;
    this.sprite.hp              = this.hp;
    this.sprite.maxHp           = this.maxHP;
    this.sprite.bossRef         = this; // back-reference for _hitEnemy delegation

    // ── Phase label above boss ──────────────────────────────────────────────
    this._phaseTxt = scene.add.text(x, y - 88, 'ФАЗА 1', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '11px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(14);

    // ── Speech bubble ───────────────────────────────────────────────────────
    this._speechTxt   = null;
    this._speechTimer = null;

    // ── Phase 4 glitch timer ────────────────────────────────────────────────
    this._glitchTimer = null;
  }

  // ── Damage & Death ──────────────────────────────────────────────────────────

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    // Keep sprite.hp in sync so _drawBossHpBar can read it
    if (this.sprite) this.sprite.hp = this.hp;
    if (this.hp <= 0) {
      this.hp = 0;
      if (this.sprite) this.sprite.hp = 0;
      this.die();
    }
  }

  die() {
    if (!this.alive) return;
    this.alive = false;

    // Stop glitch / speech
    if (this._glitchTimer) { this._glitchTimer.remove(); this._glitchTimer = null; }
    if (this._speechTimer) { this._speechTimer.remove(); this._speechTimer = null; }
    if (this._speechTxt)   { this._speechTxt.destroy();  this._speechTxt   = null; }
    if (this._phaseTxt)    { this._phaseTxt.destroy();   this._phaseTxt    = null; }

    if (this.sprite && this.sprite.active) {
      // Disable physics body so overlaps stop firing
      this.sprite.disableBody(true, false);
      // Dramatic spin-shrink death animation
      this.scene.tweens.add({
        targets:  this.sprite,
        angle:    720,
        scaleX:   0,
        scaleY:   0,
        alpha:    0,
        duration: 1200,
        ease:     'Power3',
        onComplete: () => {
          if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
        },
      });
    }

    // Notify BattleScene
    this.scene.events.emit('bossDefeated');
  }

  // ── Phase Management ────────────────────────────────────────────────────────

  setPhase(phase) {
    this.phase = phase;

    const labels = {
      1: 'ФАЗА 1',
      2: 'ФАЗА 2 — ПІДКРІПЛЕННЯ!',
      3: 'ФАЗА 3 — КИПЯТОК!',
      4: 'ФАЗА 4 — АПОКАЛІПСИС!',
    };
    const colors = { 1: '#ff00ff', 2: '#ffff00', 3: '#ff6600', 4: '#ff0000' };
    const tints  = { 1: 0xff00ff,  2: 0xffff00,  3: 0xff6600,  4: 0xff0000 };

    if (this._phaseTxt) {
      this._phaseTxt.setText(labels[phase] || '');
      this._phaseTxt.setColor(colors[phase] || '#ffffff');
    }
    if (this.sprite && this.sprite.active) {
      this.sprite.setTint(tints[phase] || 0xff00ff);
    }

    // Phase 3+: double movement speed
    this.speed = phase >= 3 ? this.baseSpeed * 2 : this.baseSpeed;

    // Phase 4: random colour glitch on the sprite
    if (phase === 4 && !this._glitchTimer) {
      this._startGlitch();
    }
  }

  _startGlitch() {
    this._glitchTimer = this.scene.time.addEvent({
      delay:    140,
      loop:     true,
      callback: () => {
        if (!this.alive || !this.sprite || !this.sprite.active) return;
        const r = Phaser.Math.Between(100, 255);
        const g = Phaser.Math.Between(0,   80);
        const b = Phaser.Math.Between(100, 255);
        this.sprite.setTint(Phaser.Display.Color.GetColor(r, g, b));
      },
    });
  }

  // ── Speech Bubble ───────────────────────────────────────────────────────────

  say(phrase) {
    if (this._speechTxt)  { this._speechTxt.destroy();  this._speechTxt  = null; }
    if (this._speechTimer){ this._speechTimer.remove();  this._speechTimer = null; }
    if (!this.sprite || !this.sprite.active) return;

    this._speechTxt = this.scene.add.text(
      this.sprite.x, this.sprite.y - 100, phrase,
      {
        fontFamily:      'Arial, sans-serif',
        fontSize:        '13px',
        color:           '#000000',
        backgroundColor: '#fffbe6',
        padding:         { x: 6, y: 3 },
      },
    ).setOrigin(0.5, 1).setDepth(20);

    this._speechTimer = this.scene.time.delayedCall(2200, () => {
      if (this._speechTxt) { this._speechTxt.destroy(); this._speechTxt = null; }
      this._speechTimer = null;
    });
  }

  // ── Update (called every frame from BattleScene.update) ────────────────────

  update() {
    if (!this.alive || !this.sprite || !this.sprite.active) return;

    // Movement — BossEntity drives velocity each frame (wall stop is set by
    // BattleScene._enemyReachWall via the enemiesGroup ↔ house overlap)
    if (!this.sprite.isAttackingWall) {
      this.sprite.setVelocityX(-this.speed);
    } else {
      this.sprite.setVelocityX(0);
    }

    // Track floating labels to the sprite's position
    if (this._phaseTxt) {
      this._phaseTxt.setPosition(this.sprite.x, this.sprite.y - 88);
    }
    if (this._speechTxt) {
      this._speechTxt.setPosition(this.sprite.x, this.sprite.y - 100);
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  destroy() {
    if (this._glitchTimer) { this._glitchTimer.remove(); this._glitchTimer = null; }
    if (this._speechTimer) { this._speechTimer.remove(); this._speechTimer = null; }
    if (this._speechTxt)   { this._speechTxt.destroy();  this._speechTxt   = null; }
    if (this._phaseTxt)    { this._phaseTxt.destroy();   this._phaseTxt    = null; }
    if (this.sprite && this.sprite.active) { this.sprite.destroy(); this.sprite = null; }
  }
}

/**
 * AnimSystem.js
 * Manages hero idle bob animations, defender sway, and spell-cast effects.
 * All animations support the humorous caricature style of ACID KHUTIR
 * while keeping the magic and power visually serious.
 */
export default class AnimSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {Map<Phaser.GameObjects.GameObject, Phaser.Tweens.Tween[]>} */
    this._tweenMap = new Map();
  }

  // ── Hero / defender idle bob ───────────────────────────────────────────────

  /**
   * Adds a gentle idle float (bob) animation to a game object.
   * Gives characters subtle movement while in the wait state.
   * @param {Phaser.GameObjects.GameObject} target
   * @param {object} [opts]
   * @param {number} [opts.amplitude=5]  vertical bob in pixels
   * @param {number} [opts.duration=1800] ms per half-cycle
   * @param {number} [opts.phase=0]       delay offset in ms (stagger multiple heroes)
   */
  addIdleBob(target, { amplitude = 5, duration = 1800, phase = 0 } = {}) {
    const startY = target.y;
    const tween = this.scene.tweens.add({
      targets:  target,
      y:        startY + amplitude,
      duration,
      delay:    phase,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
    this._register(target, tween);
    return tween;
  }

  /**
   * Adds a very subtle scale breathe to simulate breathing.
   * @param {Phaser.GameObjects.GameObject} target
   * @param {number} [amount=0.03]
   * @param {number} [duration=2200]
   */
  addBreath(target, amount = 0.03, duration = 2200) {
    const base = target.scaleX;
    const tween = this.scene.tweens.add({
      targets:  target,
      scaleX:   base + amount,
      scaleY:   base + amount,
      duration,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
    this._register(target, tween);
    return tween;
  }

  // ── Spell cast effect ─────────────────────────────────────────────────────

  /**
   * Plays a spell-cast visual: expanding neon circle + floating glyphs.
   * @param {number} x
   * @param {number} y
   * @param {number} [color=0x00ffff]
   */
  playSpellCast(x, y, color = 0x00ffff) {
    if (this.scene.fxSystem) {
      this.scene.fxSystem.spawnSpellCircle(x, y, color);
    } else {
      this._fallbackSpellCircle(x, y, color);
    }
  }

  // ── Item / rune glow when inspecting inventory ────────────────────────────

  /**
   * Applies an animated glow pulse to an inventory item image or icon.
   * @param {Phaser.GameObjects.GameObject} target
   * @param {number} [glowColor=0xffcc00]
   */
  addItemGlow(target, glowColor = 0xffcc00) {
    const tween = this.scene.tweens.add({
      targets:  target,
      alpha:    0.6,
      scaleX:   target.scaleX * 1.12,
      scaleY:   target.scaleY * 1.12,
      duration: 900,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
    target.setTint(glowColor);
    this._register(target, tween);
    return tween;
  }

  // ── Upgrade reveal animation ──────────────────────────────────────────────

  /**
   * Plays a dramatic "level up" scale bounce for a building/house object.
   * @param {Phaser.GameObjects.Image|Phaser.GameObjects.Sprite} target
   * @param {Function} [onComplete]
   */
  playUpgradeBounce(target, onComplete) {
    this.scene.tweens.add({
      targets:   target,
      scaleX:    (target.scaleX || 1) * 1.25,
      scaleY:    (target.scaleY || 1) * 1.25,
      duration:  180,
      yoyo:      true,
      repeat:    1,
      ease:      'Back.easeOut',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  // ── Enemy retreat (visual push-back when wall upgrades) ───────────────────

  /**
   * Applies a quick rightward push to each enemy to simulate retreating.
   * @param {Phaser.GameObjects.Group} enemiesGroup
   * @param {number} [pushDist=120]
   */
  playEnemyRetreat(enemiesGroup, pushDist = 120) {
    for (const enemy of enemiesGroup.getChildren()) {
      if (!enemy.active) continue;
      const origX = enemy.x;
      this.scene.tweens.add({
        targets:  enemy,
        x:        enemy.x + pushDist,
        duration: 300,
        ease:     'Power2',
        yoyo:     true,
      });
      // Flash enemy red-white
      if (enemy.setTint) {
        enemy.setTint(0xffffff);
        this.scene.time.delayedCall(180, () => {
          if (enemy.active) enemy.clearTint();
        });
      }
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  /**
   * Stops and removes all tracked idle tweens for a specific target.
   * @param {Phaser.GameObjects.GameObject} target
   */
  stopAnimsFor(target) {
    const tweens = this._tweenMap.get(target);
    if (tweens) {
      tweens.forEach((t) => t.stop());
      this._tweenMap.delete(target);
    }
  }

  update() {}

  // ── Private ───────────────────────────────────────────────────────────────

  _register(target, tween) {
    if (!this._tweenMap.has(target)) this._tweenMap.set(target, []);
    this._tweenMap.get(target).push(tween);
  }

  _fallbackSpellCircle(x, y, color) {
    const s    = this.scene;
    const ring = s.add.graphics().setDepth(12);
    ring.lineStyle(3, color, 0.9);
    ring.strokeCircle(0, 0, 1);
    ring.setPosition(x, y);
    s.tweens.add({
      targets:    ring,
      scaleX:     8,
      scaleY:     8,
      alpha:      0,
      duration:   600,
      ease:       'Power2',
      onComplete: () => ring.destroy(),
    });
  }
}

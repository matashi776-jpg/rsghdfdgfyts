/**
 * FXSystem.js
 * Manages visual effects for ACID KHUTIR — Stage 1.
 * Includes: hit sparks, explosions, glitch storms, floating glyphs,
 * toxic splashes, spell circles, rune pickup animations, wall glow bursts.
 */

const GLYPH_CHARS  = ['ᚠ', 'ᚢ', 'ᚱ', 'ᚲ', 'ᛁ', 'ᛊ', 'ᛏ', '☽', '✦', '⊕', '⊗', '∞', '◈', '⟡'];
const GLYPH_COLORS = [0xff00ff, 0x00ffff, 0xff8800, 0xff0066, 0x8800ff, 0x00ff88, 0xffff00];

export default class FXSystem {
  constructor(scene) {
    this.scene = scene;
  }

  // ── Existing effects ─────────────────────────────────────────────────────

  spawnHit(x, y) {
    this._flash(x, y, 0xff69b4, 'fx_hit_pink');
    // Extra micro-glyphs burst on hit
    this._spawnMicroGlyphs(x, y, 3);
  }

  spawnExplosion(x, y) {
    this._flash(x, y, 0xff9900, 'fx_explosion_pysanka');
    this.scene.cameras.main.shake(200, 0.01);
    this._spawnMicroGlyphs(x, y, 5);
  }

  spawnGlitchStorm(x, y) {
    this._flash(x, y, 0x8800ff, 'fx_boss_glitch_storm');
    this.scene.cameras.main.flash(300, 128, 0, 255);
    this._spawnGlitchRects(x, y);
  }

  // ── Hero spell: glowing circle with rising glyphs ─────────────────────────

  spawnSpellCircle(x, y, color = 0x00ffff) {
    const s = this.scene;

    // Outer expanding ring
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

    // Inner solid circle pulse
    const circle = s.add.graphics().setDepth(11);
    circle.fillStyle(color, 0.35);
    circle.fillCircle(0, 0, 28);
    circle.setPosition(x, y);
    s.tweens.add({
      targets:    circle,
      scaleX:     2.5,
      scaleY:     2.5,
      alpha:      0,
      duration:   450,
      ease:       'Power1',
      onComplete: () => circle.destroy(),
    });

    // Rising glyphs
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 70, () => this._spawnRisingGlyph(x, y, color));
    }
  }

  // ── Floating glyph that rises from a position ────────────────────────────

  spawnGlyph(x, y, color = 0xff00ff) {
    this._spawnRisingGlyph(x, y, color);
  }

  // ── Toxic / acid splash ───────────────────────────────────────────────────

  spawnToxic(x, y) {
    const s = this.scene;
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist  = Phaser.Math.Between(14, 55);
      const tx    = x + Math.cos(angle) * dist;
      const ty    = y + Math.sin(angle) * dist;

      const drop = s.add.graphics().setDepth(13);
      drop.fillStyle(0x00ff44, 0.85);
      drop.fillCircle(0, 0, Phaser.Math.Between(3, 8));
      drop.setPosition(x, y);

      s.tweens.add({
        targets:    drop,
        x:          tx,
        y:          ty,
        alpha:      0,
        scaleX:     0.2,
        scaleY:     0.2,
        duration:   Phaser.Math.Between(350, 700),
        ease:       'Power2',
        onComplete: () => drop.destroy(),
      });
    }

    // Central glow
    const glow = s.add.graphics().setDepth(13);
    glow.fillStyle(0x00ff44, 0.5);
    glow.fillCircle(0, 0, 20);
    glow.setPosition(x, y);
    s.tweens.add({
      targets:    glow,
      scaleX:     2.4,
      scaleY:     2.4,
      alpha:      0,
      duration:   500,
      ease:       'Power1',
      onComplete: () => glow.destroy(),
    });

    // Rising toxic glyph
    this._spawnRisingGlyph(x, y, 0x00ff44);
  }

  // ── Glitch rectangle distortion ───────────────────────────────────────────

  spawnGlitch(x, y) {
    const s = this.scene;
    for (let i = 0; i < 6; i++) {
      const w   = Phaser.Math.Between(12, 60);
      const h   = Phaser.Math.Between(4, 14);
      const rx  = x + Phaser.Math.Between(-40, 40);
      const ry  = y + Phaser.Math.Between(-30, 30);
      const col = Phaser.Utils.Array.GetRandom([0xff00ff, 0x00ffff, 0xff0044, 0x8800ff]);

      const rect = s.add.graphics().setDepth(14);
      rect.fillStyle(col, 0.7);
      rect.fillRect(-w / 2, -h / 2, w, h);
      rect.setPosition(rx, ry);

      s.tweens.add({
        targets:    rect,
        x:          rx + Phaser.Math.Between(-30, 30),
        alpha:      0,
        duration:   Phaser.Math.Between(180, 340),
        ease:       'Linear',
        onComplete: () => rect.destroy(),
      });
    }
  }

  // ── Rune pickup animation (inventory item) ────────────────────────────────

  spawnRunePickup(x, y, runeChar = '✦') {
    const s = this.scene;
    const color = Phaser.Utils.Array.GetRandom(['#ff00ff', '#00ffff', '#ffcc00', '#00ff88']);

    const rune = s.add.text(x, y, runeChar, {
      fontFamily: 'serif',
      fontSize:   '36px',
      color,
      shadow: { offsetX: 0, offsetY: 0, color, blur: 22, fill: true },
    }).setOrigin(0.5).setDepth(20);

    // Spin and rise
    s.tweens.add({
      targets:    rune,
      y:          y - 80,
      scaleX:     2,
      scaleY:     2,
      alpha:      0,
      angle:      360,
      duration:   900,
      ease:       'Power2',
      onComplete: () => rune.destroy(),
    });

    // Concentric glow rings
    for (let i = 0; i < 3; i++) {
      s.time.delayedCall(i * 90, () => {
        const col = Phaser.Display.Color.HexStringToColor(color.replace('#', '')).color;
        const ring = s.add.graphics().setDepth(19);
        ring.lineStyle(2, col, 0.8);
        ring.strokeCircle(0, 0, 8);
        ring.setPosition(x, y);
        s.tweens.add({
          targets:    ring,
          scaleX:     6,
          scaleY:     6,
          alpha:      0,
          duration:   500,
          ease:       'Power1',
          onComplete: () => ring.destroy(),
        });
      });
    }
  }

  // ── Wall glow burst (city upgrade) ────────────────────────────────────────

  spawnWallGlowBurst(x, y, level) {
    const colors  = [0xffffff, 0x00ffff, 0xff00aa]; // level 1/2/3
    const color   = colors[Math.min(level - 1, colors.length - 1)] || 0x00ffff;
    const s       = this.scene;
    const { width, height } = s.scale;

    // Screen-wide flash in upgrade color
    const col  = Phaser.Display.Color.IntegerToColor(color);
    s.cameras.main.flash(300, col.red, col.green, col.blue, false);

    // Radial burst from house position
    const em = s.add.particles(x, y, 'particle_neon_cyan', {
      speed:    { min: 80, max: 380 },
      scale:    { start: 2.0, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 400, max: 900 },
      angle:    { min: 0, max: 360 },
      tint:     [color, 0xffffff, 0xffff00],
      emitting: false,
    }).setDepth(18);
    em.explode(50, x, y);
    s.time.delayedCall(1100, () => { if (em.active) em.destroy(); });

    // Rising glyphs around the wall
    for (let i = 0; i < 8; i++) {
      s.time.delayedCall(i * 80, () => {
        const rx = x + Phaser.Math.Between(-60, 60);
        this._spawnRisingGlyph(rx, y, color);
      });
    }

    // Symbols become brighter: short screen shake
    s.cameras.main.shake(120, 0.008);
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  _flash(x, y, tint, textureKey) {
    const img = this.scene.add.image(x, y, textureKey).setScale(1.2);
    if (!this.scene.textures.exists(textureKey)) {
      img.destroy();
      this._drawFallback(x, y, tint);
      return;
    }
    img.setTint(tint);
    this.scene.tweens.add({
      targets:    img,
      alpha:      0,
      scaleX:     2,
      scaleY:     2,
      duration:   350,
      ease:       'Power2',
      onComplete: () => img.destroy(),
    });
  }

  _drawFallback(x, y, color) {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(color, 0.8);
    gfx.fillCircle(x, y, 18);
    this.scene.tweens.add({
      targets:    gfx,
      alpha:      0,
      duration:   300,
      onComplete: () => gfx.destroy(),
    });
  }

  _spawnRisingGlyph(x, y, color) {
    const s    = this.scene;
    const char = Phaser.Utils.Array.GetRandom(GLYPH_CHARS);
    const hex  = '#' + color.toString(16).padStart(6, '0');

    const glyph = s.add.text(x + Phaser.Math.Between(-18, 18), y, char, {
      fontFamily: 'serif',
      fontSize:   `${Phaser.Math.Between(16, 28)}px`,
      color:      hex,
      shadow:     { offsetX: 0, offsetY: 0, color: hex, blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(15);

    s.tweens.add({
      targets:    glyph,
      y:          y - Phaser.Math.Between(50, 100),
      alpha:      0,
      scaleX:     1.6,
      scaleY:     1.6,
      duration:   Phaser.Math.Between(700, 1200),
      ease:       'Power1',
      onComplete: () => glyph.destroy(),
    });
  }

  _spawnMicroGlyphs(x, y, count) {
    for (let i = 0; i < count; i++) {
      const color = Phaser.Utils.Array.GetRandom(GLYPH_COLORS);
      this._spawnRisingGlyph(x + Phaser.Math.Between(-12, 12), y, color);
    }
  }

  _spawnGlitchRects(x, y) {
    this.spawnGlitch(x, y);
  }

  get time() { return this.scene.time; }

  update() {}
}

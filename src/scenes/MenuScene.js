/**
 * MenuScene.js
 * Main menu — Neon Psychedelic style with floating runes,
 * glowing buttons and smooth scene transitions.
 */

// Ukrainian-flavoured magic rune symbols shown as floating glyphs
const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', '☽', '✦', '⊕', '⊗'];
const RUNE_COLORS = ['#ff00ff', '#00ffff', '#ff8800', '#ff0066', '#8800ff', '#00ff88', '#ffff00'];

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Background with slow breathing zoom ────────────────────────────────
    const bg = this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setTint(0x220044)
      .setDepth(0);
    this.tweens.add({
      targets:  bg,
      scaleX:   bg.scaleX * 1.06,
      scaleY:   bg.scaleY * 1.06,
      duration: 5000,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    // Scanline overlay for cyber feel
    const scan = this.add.graphics().setAlpha(0.05).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scan.lineStyle(1, 0x00ffff, 1);
      scan.moveTo(0, y);
      scan.lineTo(width, y);
    }
    scan.strokePath();

    // ── Floating neon runes ────────────────────────────────────────────────
    this._spawnFloatingRunes(width, height);

    // ── Title panel ────────────────────────────────────────────────────────
    const panelGfx = this.add.graphics().setDepth(3);
    panelGfx.fillStyle(0x000000, 0.62);
    panelGfx.fillRoundedRect(width / 2 - 320, height * 0.18, 640, 130, 12);
    panelGfx.lineStyle(2, 0xff00ff, 1);
    panelGfx.strokeRoundedRect(width / 2 - 320, height * 0.18, 640, 130, 12);

    const titleTxt = this.add.text(width / 2, height * 0.26, 'ОБОРОНА ЛАНЧИНА', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '52px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 28, fill: true },
    }).setOrigin(0.5).setDepth(4);

    // Title pulsing glow
    this.tweens.add({
      targets:  titleTxt,
      alpha:    0.78,
      duration: 1200,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    this.add.text(width / 2, height * 0.35, 'NEON PSYCHEDELIC EDITION', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '16px',
      fontStyle:  'italic',
      color:      '#00ffff',
      stroke:     '#000033',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(4);

    // ── Start button with glow pulse ────────────────────────────────────────
    const btnY   = height * 0.58;
    const btnGfx = this.add.graphics().setDepth(5);

    const drawBtn = (borderAlpha) => {
      btnGfx.clear();
      btnGfx.fillStyle(0x1a0030, 0.92);
      btnGfx.fillRoundedRect(width / 2 - 200, btnY - 32, 400, 64, 10);
      btnGfx.lineStyle(3, 0xffee00, borderAlpha);
      btnGfx.strokeRoundedRect(width / 2 - 200, btnY - 32, 400, 64, 10);
      // Inner glow line
      btnGfx.lineStyle(1, 0xffee00, borderAlpha * 0.4);
      btnGfx.strokeRoundedRect(width / 2 - 193, btnY - 25, 386, 50, 8);
    };
    drawBtn(1);

    const btn = this.add.text(width / 2, btnY, '▶  РОЗПОЧАТИ КАМПАНІЮ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '28px',
      color:      '#ffee00',
      stroke:     '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffcc00', blur: 18, fill: true },
    }).setOrigin(0.5).setDepth(6);

    // Border glow pulse
    const gObj = { v: 1 };
    this.tweens.add({
      targets: gObj,
      v:       0.28,
      duration: 1000,
      yoyo:    true,
      repeat:  -1,
      ease:    'Sine.easeInOut',
      onUpdate: () => drawBtn(gObj.v),
    });

    // Button text scale pulse
    this.tweens.add({
      targets:  btn,
      scaleX:   1.04,
      scaleY:   1.04,
      duration: 1000,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    const btnZone = this.add.zone(width / 2, btnY, 400, 64)
      .setInteractive({ useHandCursor: true })
      .setDepth(7);

    btnZone.on('pointerover', () => {
      btn.setColor('#ffffff');
      this._burstRuneFlash(width / 2, btnY);
    });
    btnZone.on('pointerout',  () => btn.setColor('#ffee00'));
    btnZone.on('pointerdown', () => {
      this._burstRuneFlash(width / 2, btnY);
      this.cameras.main.flash(120, 255, 238, 0, false);
      this.time.delayedCall(200, () => this.cameras.main.fadeOut(900));
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StoryScene');
    });

    // Fade in
    this.cameras.main.fadeIn(800);
  }

  // ─── Floating rune symbols in background ─────────────────────────────────

  _spawnFloatingRunes(width, height) {
    for (let i = 0; i < 22; i++) {
      this.time.delayedCall(i * 160, () => this._spawnOneRune(width, height));
    }
    // Keep spawning periodically
    this.time.addEvent({
      delay:    1400,
      loop:     true,
      callback: () => this._spawnOneRune(width, height),
    });
  }

  _spawnOneRune(width, height) {
    const char  = Phaser.Utils.Array.GetRandom(RUNE_CHARS);
    const color = Phaser.Utils.Array.GetRandom(RUNE_COLORS);
    const x     = Phaser.Math.Between(30, width - 30);
    const startY = height + 20;

    const rune = this.add.text(x, startY, char, {
      fontFamily: 'serif',
      fontSize:   `${Phaser.Math.Between(18, 38)}px`,
      color,
      alpha:      0,
      shadow: { offsetX: 0, offsetY: 0, color, blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(2).setAlpha(0);

    const duration = Phaser.Math.Between(4500, 8000);
    this.tweens.add({
      targets:  rune,
      y:        -30,
      alpha:    { from: 0, to: 0.55 },
      duration,
      ease:     'Linear',
      onComplete: () => rune.destroy(),
    });

    // Subtle x drift
    this.tweens.add({
      targets:  rune,
      x:        x + Phaser.Math.Between(-40, 40),
      duration,
      ease:     'Sine.easeInOut',
    });
  }

  // ─── Rune burst flash on button interaction ───────────────────────────────

  _burstRuneFlash(cx, cy) {
    for (let i = 0; i < 8; i++) {
      const char  = Phaser.Utils.Array.GetRandom(RUNE_CHARS);
      const color = Phaser.Utils.Array.GetRandom(RUNE_COLORS);
      const angle = (i / 8) * Math.PI * 2;
      const dist  = Phaser.Math.Between(40, 110);
      const tx    = cx + Math.cos(angle) * dist;
      const ty    = cy + Math.sin(angle) * dist;

      const r = this.add.text(cx, cy, char, {
        fontFamily: 'serif',
        fontSize:   `${Phaser.Math.Between(20, 34)}px`,
        color,
        shadow: { offsetX: 0, offsetY: 0, color, blur: 16, fill: true },
      }).setOrigin(0.5).setDepth(8);

      this.tweens.add({
        targets:    r,
        x:          tx,
        y:          ty,
        alpha:      0,
        scaleX:     1.8,
        scaleY:     1.8,
        duration:   600,
        ease:       'Power2',
        onComplete: () => r.destroy(),
      });
    }
  }
}

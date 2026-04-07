/**
 * KhutirScene.js
 * Animated Lanchyn map — Heroes of Might & Magic 5 style with neon glow.
 * Buildings flicker with neon light; ritual points pulse and highlight
 * when the cursor approaches them.
 */

// Ritual / location markers on the animated map
const RITUAL_POINTS = [
  { x: 0.22, y: 0.55, label: 'Стара Хата',    color: 0x00ffff, textColor: '#00ffff' },
  { x: 0.42, y: 0.42, label: 'Ритуальна Площа', color: 0xff00ff, textColor: '#ff88ff' },
  { x: 0.60, y: 0.62, label: 'Лісова Галявина', color: 0x00ff88, textColor: '#00ff88' },
  { x: 0.78, y: 0.45, label: 'Межа Кордону',   color: 0xff8800, textColor: '#ffaa44' },
];

export default class KhutirScene extends Phaser.Scene {
  constructor() {
    super({ key: 'KhutirScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Background ──────────────────────────────────────────────────────────
    if (this.textures.exists('bg')) {
      this.add
        .image(width / 2, height / 2, 'bg')
        .setDisplaySize(width, height)
        .setTint(0x220044)
        .setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a).setDepth(0);
    }

    // Scanlines
    const scan = this.add.graphics().setAlpha(0.05).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scan.lineStyle(1, 0xff00ff, 1);
      scan.moveTo(0, y);
      scan.lineTo(width, y);
    }
    scan.strokePath();

    // ── Neon grid overlay (map feel) ────────────────────────────────────────
    const grid = this.add.graphics().setAlpha(0.07).setDepth(1);
    for (let gx = 0; gx < width; gx += 80) {
      grid.lineStyle(1, 0x00ffff, 1);
      grid.moveTo(gx, 0); grid.lineTo(gx, height);
    }
    for (let gy = 0; gy < height; gy += 80) {
      grid.lineStyle(1, 0x00ffff, 1);
      grid.moveTo(0, gy); grid.lineTo(width, gy);
    }
    grid.strokePath();

    // ── Central chasm divider ────────────────────────────────────────────────
    const chasm = this.add.graphics().setDepth(2);
    chasm.fillStyle(0x000000, 0.85);
    chasm.fillRect(width / 2 - 12, 0, 24, height);
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 - 12, 0); chasm.lineTo(width / 2 - 12, height);
    chasm.strokePath();
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 + 12, 0); chasm.lineTo(width / 2 + 12, height);
    chasm.strokePath();
    for (let y = 0; y < height; y += 60) {
      chasm.fillStyle(0x4a0080, 0.25);
      chasm.fillRect(width / 2 - 6, y, 12, 30);
    }

    // Animated chasm pulse
    this.tweens.add({
      targets:  chasm,
      alpha:    0.6,
      duration: 1200,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    // ── Title panel ─────────────────────────────────────────────────────────
    const panelW = 480, panelH = 130, panelY = height * 0.22;
    const panel = this.add.graphics().setDepth(3);
    panel.fillStyle(0x000000, 0.72);
    panel.fillRoundedRect(width / 2 - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panel.lineStyle(2, 0xff00ff, 1);
    panel.strokeRoundedRect(width / 2 - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    // Inner glow line
    panel.lineStyle(1, 0xff00ff, 0.3);
    panel.strokeRoundedRect(width / 2 - panelW / 2 + 5, panelY - panelH / 2 + 5, panelW - 10, panelH - 10, 6);

    const titleTxt = this.add.text(width / 2, panelY - 22, 'LANCHYN', {
      fontSize: '46px',
      fontFamily: '"Times New Roman", serif',
      fontStyle: 'bold',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 24, fill: true },
    }).setOrigin(0.5).setDepth(4);

    // Title glow pulse
    this.tweens.add({
      targets:  titleTxt,
      alpha:    0.75,
      duration: 1500,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    this.add.text(width / 2, panelY + 14, 'vs  SAVOK', {
      fontSize: '28px',
      fontFamily: '"Times New Roman", serif',
      fontStyle: 'italic',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(4);

    this.add.text(width / 2, panelY + 48, 'A Satirical Tower Defense', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      color: '#8a8a8a',
      stroke: '#000',
      strokeThickness: 1,
    }).setOrigin(0.5).setDepth(4);

    // ── Hero sprite with idle float ──────────────────────────────────────────
    const hero = this.add.image(width * 0.18, height * 0.58, 'hero')
      .setScale(0.3)
      .setTint(0xff88ff)
      .setDepth(5);
    this.tweens.add({
      targets:  hero,
      y:        hero.y + 7,
      duration: 1800,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
    // Hero glow pulse
    this.tweens.add({
      targets:  hero,
      alpha:    0.82,
      duration: 2200,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    // ── Enemy preview (neon silhouette) ─────────────────────────────────────
    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(0x757575, 1);
    gfx.fillRect(width * 0.78, height * 0.52, 30, 45);
    this.tweens.add({
      targets:  gfx,
      x:        -5,
      duration: 900,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    // ── Ritual / location points ─────────────────────────────────────────────
    this._ritualMarkers = [];
    for (const rp of RITUAL_POINTS) {
      this._createRitualPoint(rp, width, height);
    }
    // Pointer move check
    this.input.on('pointermove', (ptr) => this._checkRitualHover(ptr));

    // ── START GAME button ────────────────────────────────────────────────────
    const btnX = width / 2;
    const btnY = height * 0.68;

    const btnBg = this.add.graphics().setDepth(5);
    const _drawBtn = (alpha) => {
      btnBg.clear();
      btnBg.fillStyle(0x1a0030, 0.92);
      btnBg.fillRoundedRect(btnX - 130, btnY - 28, 260, 56, 6);
      btnBg.lineStyle(2, 0xb8860b, alpha);
      btnBg.strokeRoundedRect(btnX - 130, btnY - 28, 260, 56, 6);
      btnBg.lineStyle(1, 0xb8860b, alpha * 0.4);
      btnBg.strokeRoundedRect(btnX - 126, btnY - 24, 252, 48, 4);
    };
    _drawBtn(1);

    const btnText = this.add.text(btnX, btnY, '▶  START GAME', {
      fontSize: '24px',
      fontFamily: '"Times New Roman", serif',
      fontStyle: 'bold',
      color: '#d4a017',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(6);

    this.tweens.add({
      targets:  btnText,
      scaleX:   1.06,
      scaleY:   1.06,
      duration: 900,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    const glowObj = { v: 1 };
    this.tweens.add({
      targets:  glowObj,
      v:        0.3,
      duration: 900,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
      onUpdate: () => _drawBtn(glowObj.v),
    });

    const btnZone = this.add.zone(btnX, btnY, 260, 56)
      .setInteractive({ useHandCursor: true })
      .setDepth(7);

    btnZone.on('pointerover', () => {
      btnText.setColor('#ffe066');
      this.cameras.main.flash(80, 255, 140, 0, false);
    });
    btnZone.on('pointerout',  () => btnText.setColor('#d4a017'));
    btnZone.on('pointerdown', () => {
      this.cameras.main.flash(120, 180, 0, 255, false);
      this.time.delayedCall(220, () => {
        this.cameras.main.fadeOut(600);
      });
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene');
        this.scene.launch('UIScene');
      });
    });

    // ── Instructions ─────────────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.88,
      'Drag geese onto lanes to defend the farm!\nStop the bureaucrats before they reach Nika!', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#8a8a8a',
        align: 'center',
        stroke: '#000',
        strokeThickness: 1,
      }).setOrigin(0.5).setDepth(5);

    this.cameras.main.fadeIn(700);
  }

  // ─── Ritual point creation ────────────────────────────────────────────────

  _createRitualPoint(rp, width, height) {
    const px = width  * rp.x;
    const py = height * rp.y;
    const r  = 18;

    // Outer glow ring (graphics)
    const ringGfx = this.add.graphics().setDepth(6);
    ringGfx.lineStyle(2, rp.color, 0.6);
    ringGfx.strokeCircle(px, py, r + 6);
    ringGfx.fillStyle(rp.color, 0.18);
    ringGfx.fillCircle(px, py, r);

    // Label (hidden by default)
    const label = this.add.text(px, py - r - 14, rp.label, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '13px',
      color:      rp.textColor,
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: rp.textColor, blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(7).setAlpha(0);

    // Pulse tween on the ring
    this.tweens.add({
      targets:  ringGfx,
      alpha:    0.4,
      duration: 1000 + Math.random() * 600,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    this._ritualMarkers.push({ px, py, r: r + 22, ringGfx, label, rp, hovered: false });
  }

  // ─── Proximity hover for ritual points ───────────────────────────────────

  _checkRitualHover(ptr) {
    for (const m of this._ritualMarkers) {
      const dist = Phaser.Math.Distance.Between(ptr.x, ptr.y, m.px, m.py);
      if (dist < m.r && !m.hovered) {
        m.hovered = true;
        // Brighten ring
        this.tweens.add({ targets: m.ringGfx, alpha: 1, duration: 200 });
        // Show label
        this.tweens.add({ targets: m.label, alpha: 1, y: m.py - 40, duration: 250, ease: 'Back.easeOut' });
        // Camera micro-flash in the rune color
        const col = Phaser.Display.Color.IntegerToColor(m.rp.color);
        this.cameras.main.flash(60, col.red, col.green, col.blue, false);
      } else if (dist >= m.r && m.hovered) {
        m.hovered = false;
        this.tweens.add({ targets: m.ringGfx, alpha: 0.6, duration: 300 });
        this.tweens.add({
          targets:  m.label,
          alpha:    0,
          y:        m.py - 28,
          duration: 200,
          ease:     'Sine.easeIn',
        });
      }
    }
  }
}

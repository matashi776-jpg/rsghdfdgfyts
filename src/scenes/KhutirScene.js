/**
 * KhutirScene.js
 * Main Menu – Heroes of Might & Magic 5 style.
 */
export default class KhutirScene extends Phaser.Scene {
  constructor() {
    super({ key: 'KhutirScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Background image (image_1.png) ──────────────────────────────────────
    if (this.textures.exists('bg')) {
      this.add
        .image(width / 2, height / 2, 'bg')
        .setDisplaySize(width, height)
        .setDepth(0);
    } else {
      // Deep-dark fallback matching H5 palette
      this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a).setDepth(0);
    }

    // ── Central chasm divider ────────────────────────────────────────────────
    const chasm = this.add.graphics().setDepth(1);
    // Dark abyss core
    chasm.fillStyle(0x000000, 0.85);
    chasm.fillRect(width / 2 - 12, 0, 24, height);
    // Golden rim – left
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 - 12, 0);
    chasm.lineTo(width / 2 - 12, height);
    chasm.strokePath();
    // Golden rim – right
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 + 12, 0);
    chasm.lineTo(width / 2 + 12, height);
    chasm.strokePath();
    // Inner glow
    for (let y = 0; y < height; y += 60) {
      chasm.fillStyle(0x4a0080, 0.25);
      chasm.fillRect(width / 2 - 6, y, 12, 30);
    }

    // ── Dark ornate title panel ──────────────────────────────────────────────
    const panelW = 480;
    const panelH = 130;
    const panelY = height * 0.22;
    const panel = this.add.graphics().setDepth(3);
    panel.fillStyle(0x000000, 0.72);
    panel.fillRoundedRect(width / 2 - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panel.lineStyle(2, 0xb8860b, 1);
    panel.strokeRoundedRect(width / 2 - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);

    // ── Game title ───────────────────────────────────────────────────────────
    this.add
      .text(width / 2, panelY - 22, 'LANCHYN', {
        fontSize: '46px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#d4a017',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 18, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    this.add
      .text(width / 2, panelY + 14, 'vs  SAVOK', {
        fontSize: '28px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#c0c0c0',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 0, color: '#ffffff', blur: 8, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    this.add
      .text(width / 2, panelY + 48, 'A Satirical Tower Defense', {
        fontSize: '14px',
        fontFamily: 'Arial',
        fontStyle: 'italic',
        color: '#8a8a8a',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    // ── Hero sprite preview ──────────────────────────────────────────────────
    const hero = this.add.image(width * 0.18, height * 0.58, 'hero').setScale(0.3).setDepth(5);
    this.tweens.add({
      targets: hero,
      y: hero.y + 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Enemy preview
    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(0x757575, 1);
    gfx.fillRect(width * 0.78, height * 0.52, 30, 45);
    this.tweens.add({
      targets: gfx,
      x: -5,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Pulsating START GAME button ──────────────────────────────────────────
    const btnX = width / 2;
    const btnY = height * 0.68;

    const btnBg = this.add.graphics().setDepth(5);
    const _drawBtn = (alpha) => {
      btnBg.clear();
      btnBg.fillStyle(0x1a0030, 0.92);
      btnBg.fillRoundedRect(btnX - 130, btnY - 28, 260, 56, 6);
      btnBg.lineStyle(2, 0xb8860b, alpha);
      btnBg.strokeRoundedRect(btnX - 130, btnY - 28, 260, 56, 6);
    };
    _drawBtn(1);

    const btnText = this.add
      .text(btnX, btnY, '▶  START GAME', {
        fontSize: '24px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#d4a017',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 12, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(6);

    // Pulsate the button text scale
    this.tweens.add({
      targets: btnText,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Border glow pulse via tween on a value object
    const glowObj = { v: 1 };
    this.tweens.add({
      targets: glowObj,
      v: 0.3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => _drawBtn(glowObj.v),
    });

    // Hit zone
    const btnZone = this.add
      .zone(btnX, btnY, 260, 56)
      .setInteractive({ useHandCursor: true })
      .setDepth(7);

    btnZone.on('pointerover', () => {
      btnText.setColor('#ffe066');
    });
    btnZone.on('pointerout', () => {
      btnText.setColor('#d4a017');
    });
    btnZone.on('pointerdown', () => {
      this.time.delayedCall(120, () => {
        this.scene.start('BattleScene');
        this.scene.launch('UIScene');
      });
    });

    // ── Instructions ─────────────────────────────────────────────────────────
    this.add
      .text(width / 2, height * 0.88, 'Drag geese onto lanes to defend the farm!\nStop the bureaucrats before they reach Nika!', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#8a8a8a',
        align: 'center',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(5);
  }
}

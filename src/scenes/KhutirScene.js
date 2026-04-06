/**
 * KhutirScene.js
 * Main Menu – rich 2D / pseudo-3D circa-2005 style (Warcraft III / Heroes 5).
 */

// ─── Shared button-drawing helpers ──────────────────────────────────────────

/**
 * Draw a stone-textured beveled button on a Graphics object.
 * pressed=true inverts the bevel to simulate a click.
 */
function drawStoneButton(gfx, x, y, w, h, pressed = false) {
  const r = 6;
  // Stone fill – layered gradient simulation
  gfx.fillStyle(0x5a5248, 1);
  gfx.fillRoundedRect(x, y, w, h, r);
  // Inner lighter face
  gfx.fillStyle(0x6e6560, 1);
  gfx.fillRoundedRect(x + 3, y + 3, w - 6, h - 6, r - 1);

  // Bevel highlights / shadows
  const hiColor = pressed ? 0x2a2520 : 0x9a9188;
  const shColor = pressed ? 0x9a9188 : 0x2a2520;

  // Top-left highlight edge
  gfx.lineStyle(2, hiColor, 0.95);
  gfx.beginPath();
  gfx.moveTo(x + r, y + 1);
  gfx.lineTo(x + w - r, y + 1);
  gfx.strokePath();
  gfx.beginPath();
  gfx.moveTo(x + 1, y + r);
  gfx.lineTo(x + 1, y + h - r);
  gfx.strokePath();

  // Bottom-right shadow edge
  gfx.lineStyle(2, shColor, 0.95);
  gfx.beginPath();
  gfx.moveTo(x + r, y + h - 1);
  gfx.lineTo(x + w - r, y + h - 1);
  gfx.strokePath();
  gfx.beginPath();
  gfx.moveTo(x + w - 1, y + r);
  gfx.lineTo(x + w - 1, y + h - r);
  gfx.strokePath();

  // Outer gold frame (double-line ornate border)
  gfx.lineStyle(1, 0x7a6000, 1);
  gfx.strokeRoundedRect(x, y, w, h, r);
  gfx.lineStyle(1, 0xf0c040, 0.85);
  gfx.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, r - 1);
  gfx.lineStyle(1, 0x9a7010, 0.6);
  gfx.strokeRoundedRect(x - 1, y - 1, w + 2, h + 2, r + 1);
}

export default class KhutirScene extends Phaser.Scene {
  constructor() {
    super({ key: 'KhutirScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Background image (image_2.png) ──────────────────────────────────────
    if (this.textures.exists('bg')) {
      this.add
        .image(width / 2, height / 2, 'bg')
        .setDisplaySize(width, height)
        .setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a).setDepth(0);
    }

    // ── Central chasm divider ────────────────────────────────────────────────
    const chasm = this.add.graphics().setDepth(1);
    chasm.fillStyle(0x000000, 0.85);
    chasm.fillRect(width / 2 - 12, 0, 24, height);
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 - 12, 0);
    chasm.lineTo(width / 2 - 12, height);
    chasm.strokePath();
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 + 12, 0);
    chasm.lineTo(width / 2 + 12, height);
    chasm.strokePath();
    for (let y = 0; y < height; y += 60) {
      chasm.fillStyle(0x4a0080, 0.25);
      chasm.fillRect(width / 2 - 6, y, 12, 30);
    }

    // ── Ornate title panel (stone + double-gold frame) ───────────────────────
    const panelW = 500;
    const panelH = 140;
    const panelY = height * 0.22;
    const panel = this.add.graphics().setDepth(3);
    // Stone fill
    panel.fillStyle(0x3a322a, 0.92);
    panel.fillRoundedRect(width / 2 - panelW / 2, panelY - panelH / 2, panelW, panelH, 10);
    // Inner lighter face
    panel.fillStyle(0x4e4540, 0.85);
    panel.fillRoundedRect(width / 2 - panelW / 2 + 4, panelY - panelH / 2 + 4, panelW - 8, panelH - 8, 8);
    // Outer gold border
    panel.lineStyle(3, 0xb8860b, 1);
    panel.strokeRoundedRect(width / 2 - panelW / 2, panelY - panelH / 2, panelW, panelH, 10);
    // Inner gold border
    panel.lineStyle(1, 0xf0c040, 0.7);
    panel.strokeRoundedRect(width / 2 - panelW / 2 + 4, panelY - panelH / 2 + 4, panelW - 8, panelH - 8, 8);
    // Corner ornaments
    for (const [cx, cy] of [
      [width / 2 - panelW / 2, panelY - panelH / 2],
      [width / 2 + panelW / 2, panelY - panelH / 2],
      [width / 2 - panelW / 2, panelY + panelH / 2],
      [width / 2 + panelW / 2, panelY + panelH / 2],
    ]) {
      panel.fillStyle(0xf0c040, 1);
      panel.fillCircle(cx, cy, 5);
    }

    // ── Game title ───────────────────────────────────────────────────────────
    this.add
      .text(width / 2, panelY - 26, 'LANCHYN', {
        fontSize: '50px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#f0c040',
        stroke: '#2a1800',
        strokeThickness: 7,
        shadow: { offsetX: 2, offsetY: 2, color: '#7a4000', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    this.add
      .text(width / 2, panelY + 18, 'vs  SAVOK', {
        fontSize: '28px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#d0d0d0',
        stroke: '#1a1000',
        strokeThickness: 4,
        shadow: { offsetX: 1, offsetY: 1, color: '#555', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    this.add
      .text(width / 2, panelY + 52, 'A Satirical Tower Defense', {
        fontSize: '13px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#9a8a70',
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

    // Enemy preview silhouette
    const enemyGfx = this.add.graphics().setDepth(5);
    enemyGfx.fillStyle(0x757575, 1);
    enemyGfx.fillRect(width * 0.78, height * 0.52, 30, 45);
    this.tweens.add({
      targets: enemyGfx,
      x: -5,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Ornate START GAME button ─────────────────────────────────────────────
    const btnW = 280;
    const btnH = 58;
    const btnX = width / 2 - btnW / 2;
    const btnCX = width / 2;
    const btnY = height * 0.66;
    const btnBY = btnY - btnH / 2;

    const startBtnGfx = this.add.graphics().setDepth(5);
    drawStoneButton(startBtnGfx, btnX, btnBY, btnW, btnH, false);

    const startText = this.add
      .text(btnCX, btnY, '▶  START GAME', {
        fontSize: '24px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#f0c040',
        stroke: '#1a0800',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#7a4000', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(6);

    // Gentle pulsation on START GAME text
    this.tweens.add({
      targets: startText,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const startZone = this.add
      .zone(btnCX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(7);

    startZone.on('pointerover', () => startText.setColor('#ffe88a'));
    startZone.on('pointerout', () => startText.setColor('#f0c040'));
    startZone.on('pointerdown', () => {
      startBtnGfx.clear();
      drawStoneButton(startBtnGfx, btnX, btnBY, btnW, btnH, true);
      startText.setPosition(btnCX + 1, btnY + 1);
    });
    startZone.on('pointerup', () => {
      startBtnGfx.clear();
      drawStoneButton(startBtnGfx, btnX, btnBY, btnW, btnH, false);
      startText.setPosition(btnCX, btnY);
      this.time.delayedCall(80, () => {
        this.scene.start('BattleScene');
        this.scene.start('UIScene');
      });
    });

    // ── Ornate QUIT button ───────────────────────────────────────────────────
    const qBtnW = 180;
    const qBtnH = 46;
    const qBtnX = width / 2 - qBtnW / 2;
    const qBtnCX = width / 2;
    const qBtnY = height * 0.78;
    const qBtnBY = qBtnY - qBtnH / 2;

    const quitBtnGfx = this.add.graphics().setDepth(5);
    drawStoneButton(quitBtnGfx, qBtnX, qBtnBY, qBtnW, qBtnH, false);

    const quitText = this.add
      .text(qBtnCX, qBtnY, 'QUIT', {
        fontSize: '20px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#d0b870',
        stroke: '#1a0800',
        strokeThickness: 3,
        shadow: { offsetX: 1, offsetY: 1, color: '#5a3000', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(6);

    const quitZone = this.add
      .zone(qBtnCX, qBtnY, qBtnW, qBtnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(7);

    quitZone.on('pointerover', () => quitText.setColor('#ffe88a'));
    quitZone.on('pointerout', () => quitText.setColor('#d0b870'));
    quitZone.on('pointerdown', () => {
      quitBtnGfx.clear();
      drawStoneButton(quitBtnGfx, qBtnX, qBtnBY, qBtnW, qBtnH, true);
      quitText.setPosition(qBtnCX + 1, qBtnY + 1);
    });
    quitZone.on('pointerup', () => {
      quitBtnGfx.clear();
      drawStoneButton(quitBtnGfx, qBtnX, qBtnBY, qBtnW, qBtnH, false);
      quitText.setPosition(qBtnCX, qBtnY);
      // Graceful quit: reload page (works for web-based deployment)
      window.location.reload();
    });

    // ── Instructions ─────────────────────────────────────────────────────────
    this.add
      .text(width / 2, height * 0.90, 'Drag geese onto lanes to defend the farm!\nStop the bureaucrats before they reach Nika!', {
        fontSize: '12px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#8a7a60',
        align: 'center',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(5);
  }
}

/**
 * UIScene.js
 * HUD overlay running in parallel over BattleScene.
 * Provides: gold display, wave display, goose drag-and-drop inventory,
 * the Medical Ointment hero ability button, and a centred title/start overlay.
 * Visual style: rich 2D / pseudo-3D circa-2005 (stone-textured buttons, ornate gold frames).
 */

const GOOSE_COST = 50;
const OINTMENT_COST = 100;
const OINTMENT_COOLDOWN = 30000; // 30 s
const LANE_Y = [150, 300, 450];

// ─── Shared button-drawing helper ───────────────────────────────────────────

/**
 * Draw a stone-textured beveled button.
 * pressed=true inverts the bevel to simulate a click.
 */
function drawStoneButton(gfx, x, y, w, h, pressed = false) {
  const r = 6;
  gfx.fillStyle(0x5a5248, 1);
  gfx.fillRoundedRect(x, y, w, h, r);
  gfx.fillStyle(0x6e6560, 1);
  gfx.fillRoundedRect(x + 3, y + 3, w - 6, h - 6, r - 1);

  const hiColor = pressed ? 0x2a2520 : 0x9a9188;
  const shColor = pressed ? 0x9a9188 : 0x2a2520;

  gfx.lineStyle(2, hiColor, 0.95);
  gfx.beginPath();
  gfx.moveTo(x + r, y + 1);
  gfx.lineTo(x + w - r, y + 1);
  gfx.strokePath();
  gfx.beginPath();
  gfx.moveTo(x + 1, y + r);
  gfx.lineTo(x + 1, y + h - r);
  gfx.strokePath();

  gfx.lineStyle(2, shColor, 0.95);
  gfx.beginPath();
  gfx.moveTo(x + r, y + h - 1);
  gfx.lineTo(x + w - r, y + h - 1);
  gfx.strokePath();
  gfx.beginPath();
  gfx.moveTo(x + w - 1, y + r);
  gfx.lineTo(x + w - 1, y + h - r);
  gfx.strokePath();

  gfx.lineStyle(1, 0x7a6000, 1);
  gfx.strokeRoundedRect(x, y, w, h, r);
  gfx.lineStyle(1, 0xf0c040, 0.85);
  gfx.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, r - 1);
  gfx.lineStyle(1, 0x9a7010, 0.6);
  gfx.strokeRoundedRect(x - 1, y - 1, w + 2, h + 2, r + 1);
}

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.scale;
    this._battle = this.scene.get('BattleScene');
    this._ointmentReady = true;
    this._ointmentCooldownRemaining = 0;
    this._dragging = null; // currently dragged goose icon

    this._buildTitleOverlay(width, height);
    this._buildTopBar(width);
    this._buildBottomBar(width, height);
    this._buildDragIcon(width, height);
    this._buildOintmentButton(width, height);
    this._buildLaneDropZones(width, height);

    // Listen to BattleScene events
    this._battle.events.on('goldChanged', (gold) => {
      this._goldText.setText(`₴ ${gold}`);
    });
    this._battle.events.on('waveChanged', (wave) => {
      this._waveText.setText(`Wave ${wave}`);
    });
    this._battle.events.on('gameOver', () => {
      this._disableUI();
    });

    // Initial sync
    this._goldText.setText(`₴ ${this._battle.gold}`);
    this._waveText.setText(`Wave ${this._battle.wave}`);
  }

  // ─── Title / Start overlay ───────────────────────────────────────────────────

  _buildTitleOverlay(width, height) {
    const overlayBg = this.add.graphics().setDepth(70);
    overlayBg.fillStyle(0x000000, 0.78);
    overlayBg.fillRect(0, 0, width, height);

    // Centred game title
    const titleText = this.add
      .text(width / 2, height * 0.30, 'LANCHYN', {
        fontSize: '54px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#f0c040',
        stroke: '#2a1800',
        strokeThickness: 7,
        shadow: { offsetX: 2, offsetY: 2, color: '#7a4000', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(71);

    const subtitleText = this.add
      .text(width / 2, height * 0.40, 'vs  SAVOK', {
        fontSize: '30px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#d0d0d0',
        stroke: '#1a1000',
        strokeThickness: 4,
        shadow: { offsetX: 1, offsetY: 1, color: '#555', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(71);

    // Ornate stone START GAME button
    const btnW = 280;
    const btnH = 58;
    const btnCX = width / 2;
    const btnCY = height * 0.58;
    const btnLeft = btnCX - btnW / 2;
    const btnTop = btnCY - btnH / 2;

    const btnBg = this.add.graphics().setDepth(71);
    drawStoneButton(btnBg, btnLeft, btnTop, btnW, btnH, false);

    const startText = this.add
      .text(btnCX, btnCY, '▶  START GAME', {
        fontSize: '26px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#f0c040',
        stroke: '#1a0800',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#7a4000', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(72);

    // Gentle pulsation on START GAME text
    this.tweens.add({
      targets: startText,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Hit zone – dismiss overlay and start battle
    const startZone = this.add
      .zone(btnCX, btnCY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(73);

    startZone.on('pointerover', () => startText.setColor('#ffe88a'));
    startZone.on('pointerout', () => startText.setColor('#f0c040'));
    startZone.on('pointerdown', () => {
      btnBg.clear();
      drawStoneButton(btnBg, btnLeft, btnTop, btnW, btnH, true);
      startText.setPosition(btnCX + 1, btnCY + 1);
    });
    startZone.on('pointerup', () => {
      btnBg.clear();
      drawStoneButton(btnBg, btnLeft, btnTop, btnW, btnH, false);
      startText.setPosition(btnCX, btnCY);
      const toFade = [overlayBg, titleText, subtitleText, startText, btnBg];
      this.tweens.add({
        targets: toFade,
        alpha: 0,
        duration: 350,
        onComplete: () => {
          toFade.forEach((c) => c.destroy());
          startZone.destroy();
        },
      });
    });
  }

  // ─── Top Bar (ornate gold HUD) ────────────────────────────────────────────────

  _buildTopBar(width) {
    // Stone base strip
    const bar = this.add.graphics().setDepth(40);
    bar.fillStyle(0x3a322a, 0.95);
    bar.fillRect(0, 0, width, 44);
    // Highlight top edge
    bar.lineStyle(1, 0x9a9188, 0.9);
    bar.beginPath();
    bar.moveTo(0, 1);
    bar.lineTo(width, 1);
    bar.strokePath();
    // Gold bottom border
    bar.lineStyle(2, 0xb8860b, 1);
    bar.beginPath();
    bar.moveTo(0, 43);
    bar.lineTo(width, 43);
    bar.strokePath();
    bar.lineStyle(1, 0xf0c040, 0.5);
    bar.beginPath();
    bar.moveTo(0, 42);
    bar.lineTo(width, 42);
    bar.strokePath();

    // Gold coin icon (simple circle)
    const coinGfx = this.add.graphics().setDepth(41);
    coinGfx.fillStyle(0xf0c040, 1);
    coinGfx.fillCircle(18, 22, 9);
    coinGfx.fillStyle(0xb8860b, 1);
    coinGfx.fillCircle(18, 22, 6);
    coinGfx.fillStyle(0xf0c040, 1);
    coinGfx.fillCircle(18, 22, 3);

    this._goldText = this.add
      .text(34, 22, '₴ 0', {
        fontSize: '17px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#f0c040',
        stroke: '#1a0800',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#5a3000', blur: 0, fill: true },
      })
      .setOrigin(0, 0.5)
      .setDepth(41);

    this._waveText = this.add
      .text(width / 2, 22, 'Wave 1', {
        fontSize: '18px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#e8e0d0',
        stroke: '#1a0800',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#3a2000', blur: 0, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(41);
  }

  // ─── Bottom Bar (stone-textured inventory panel) ──────────────────────────────

  _buildBottomBar(width, height) {
    const bar = this.add.graphics().setDepth(40);
    bar.fillStyle(0x3a322a, 0.95);
    bar.fillRect(0, height - 76, width, 76);
    // Gold top border
    bar.lineStyle(2, 0xb8860b, 1);
    bar.beginPath();
    bar.moveTo(0, height - 76);
    bar.lineTo(width, height - 76);
    bar.strokePath();
    bar.lineStyle(1, 0xf0c040, 0.5);
    bar.beginPath();
    bar.moveTo(0, height - 75);
    bar.lineTo(width, height - 75);
    bar.strokePath();
    // Shadow bottom edge
    bar.lineStyle(1, 0x2a2520, 0.9);
    bar.beginPath();
    bar.moveTo(0, height - 1);
    bar.lineTo(width, height - 1);
    bar.strokePath();

    // Label
    this.add
      .text(12, height - 68, 'Inventory', {
        fontSize: '11px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#9a8a70',
      })
      .setDepth(41);
  }

  // ─── Draggable Goose Icon ────────────────────────────────────────────────────

  _buildDragIcon(width, height) {
    const iconX = 60;
    const iconY = height - 38;

    // Stone slot background
    const slotGfx = this.add.graphics().setDepth(41);
    drawStoneButton(slotGfx, iconX - 30, iconY - 30, 60, 60, false);

    // Goose icon image
    const gooseImg = this.add
      .image(iconX, iconY, 'goose')
      .setScale(0.12)
      .setDepth(42)
      .setInteractive({ draggable: false });

    // Invisible drag region
    this._gooseDragZone = this.add
      .zone(iconX, iconY, 60, 60)
      .setInteractive({ draggable: true })
      .setDepth(43);

    // Cost label
    this.add
      .text(iconX, iconY + 28, `${GOOSE_COST} ₴`, {
        fontSize: '10px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#f0c040',
        stroke: '#1a0800',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(42);

    // Description label
    this.add
      .text(iconX, iconY + 40, 'Стріляє борщем', {
        fontSize: '8px',
        fontFamily: '"Times New Roman", serif',
        color: '#9a8a70',
      })
      .setOrigin(0.5)
      .setDepth(42);

    // Ghost sprite while dragging
    this._ghostGoose = this.add
      .image(0, 0, 'goose')
      .setScale(0.13)
      .setAlpha(0.75)
      .setDepth(60)
      .setVisible(false);

    this.input.setDraggable(this._gooseDragZone);

    this._gooseDragZone.on('dragstart', (pointer) => {
      if (this._battle.gold < GOOSE_COST) {
        this._showNotEnoughGold();
        return;
      }
      this._ghostGoose.setVisible(true);
      this._ghostGoose.setPosition(pointer.x, pointer.y);
    });

    this._gooseDragZone.on('drag', (pointer) => {
      this._ghostGoose.setPosition(pointer.x, pointer.y);
      this._highlightLane(pointer.y);
    });

    this._gooseDragZone.on('dragend', (pointer) => {
      this._ghostGoose.setVisible(false);
      this._clearLaneHighlights();

      if (this._battle.gold < GOOSE_COST) return;

      const lane = this._getLaneFromY(pointer.y);
      if (lane !== -1) {
        this._purchaseGoose(lane, pointer.x);
      }
    });
  }

  _getLaneFromY(y) {
    for (let i = 0; i < LANE_Y.length; i++) {
      if (Math.abs(y - LANE_Y[i]) < 60) return i;
    }
    return -1;
  }

  _purchaseGoose(laneIndex, dropX) {
    this._battle.gold -= GOOSE_COST;
    this._goldText.setText(`₴ ${this._battle.gold}`);
    this._battle.placeTower(laneIndex, dropX);

    const { width } = this.scale;
    this._floatingText(width / 2, 55, `-${GOOSE_COST} ₴  [Goose] placed!`, '#80cbc4');
  }

  // ─── Lane Drop Highlights ────────────────────────────────────────────────────

  _buildLaneDropZones(width, height) {
    this._laneHighlights = [];
    for (const y of LANE_Y) {
      const h = this.add
        .rectangle(width / 2, y, width - 20, 58, 0xffffff, 0)
        .setDepth(5)
        .setStrokeStyle(2, 0x00e676, 0);
      this._laneHighlights.push(h);
    }
  }

  _highlightLane(pointerY) {
    for (let i = 0; i < LANE_Y.length; i++) {
      const isActive = Math.abs(pointerY - LANE_Y[i]) < 60;
      this._laneHighlights[i].setStrokeStyle(2, 0x00e676, isActive ? 1 : 0);
      this._laneHighlights[i].setFillStyle(0xffffff, isActive ? 0.06 : 0);
    }
  }

  _clearLaneHighlights() {
    for (const h of this._laneHighlights) {
      h.setStrokeStyle(2, 0x00e676, 0);
      h.setFillStyle(0xffffff, 0);
    }
  }

  // ─── Ointment Button (stone-textured) ────────────────────────────────────────

  _buildOintmentButton(width, height) {
    const btnW = 130;
    const btnH = 62;
    const btnCX = width - 80;
    const btnCY = height - 38;
    const btnLeft = btnCX - btnW / 2;
    const btnTop = btnCY - btnH / 2;

    this._ointmentBtnGfx = this.add.graphics().setDepth(41);
    drawStoneButton(this._ointmentBtnGfx, btnLeft, btnTop, btnW, btnH, false);
    // Greenish tint overlay
    this._ointmentBtnGfx.fillStyle(0x1a4a1a, 0.35);
    this._ointmentBtnGfx.fillRoundedRect(btnLeft + 3, btnTop + 3, btnW - 6, btnH - 6, 5);

    // Interactive hit area
    this._ointmentBg = this.add
      .zone(btnCX, btnCY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(42);

    this._ointmentLabel = this.add
      .text(btnCX, btnCY - 10, '💊 Ointment', {
        fontSize: '12px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#a8d8a8',
        stroke: '#0a1a0a',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(43);

    this._ointmentCostLabel = this.add
      .text(btnCX, btnCY + 8, `${OINTMENT_COST} ₴  30s CD`, {
        fontSize: '10px',
        fontFamily: '"Times New Roman", serif',
        color: '#80c080',
      })
      .setOrigin(0.5)
      .setDepth(43);

    this._ointmentCdText = this.add
      .text(btnCX, btnCY + 22, '', {
        fontSize: '13px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#ef9a9a',
        stroke: '#0a0000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(44);

    // Store button geometry for press effect
    this._ointmentBtnLeft = btnLeft;
    this._ointmentBtnTop = btnTop;
    this._ointmentBtnW = btnW;
    this._ointmentBtnH = btnH;
    this._ointmentBtnCX = btnCX;
    this._ointmentBtnCY = btnCY;

    this._ointmentBg.on('pointerdown', () => {
      this._ointmentBtnGfx.clear();
      drawStoneButton(this._ointmentBtnGfx, btnLeft, btnTop, btnW, btnH, true);
      if (this._ointmentReady) {
        this._ointmentBtnGfx.fillStyle(0x1a4a1a, 0.35);
        this._ointmentBtnGfx.fillRoundedRect(btnLeft + 3, btnTop + 3, btnW - 6, btnH - 6, 5);
      }
      this._useOintment();
    });
    this._ointmentBg.on('pointerup', () => {
      this._redrawOintmentBtn(false);
    });
    this._ointmentBg.on('pointerout', () => {
      this._redrawOintmentBtn(false);
    });
  }

  _redrawOintmentBtn(pressed) {
    const { btnLeft, btnTop, btnW, btnH } = {
      btnLeft: this._ointmentBtnLeft,
      btnTop: this._ointmentBtnTop,
      btnW: this._ointmentBtnW,
      btnH: this._ointmentBtnH,
    };
    this._ointmentBtnGfx.clear();
    drawStoneButton(this._ointmentBtnGfx, btnLeft, btnTop, btnW, btnH, pressed);
    if (this._ointmentReady) {
      this._ointmentBtnGfx.fillStyle(0x1a4a1a, 0.35);
      this._ointmentBtnGfx.fillRoundedRect(btnLeft + 3, btnTop + 3, btnW - 6, btnH - 6, 5);
    } else {
      this._ointmentBtnGfx.fillStyle(0x1a1a1a, 0.5);
      this._ointmentBtnGfx.fillRoundedRect(btnLeft + 3, btnTop + 3, btnW - 6, btnH - 6, 5);
    }
  }

  _useOintment() {
    if (!this._ointmentReady) return;
    if (this._battle.gold < OINTMENT_COST) {
      this._showNotEnoughGold();
      return;
    }
    if (this._battle.gameOver) return;

    this._battle.gold -= OINTMENT_COST;
    this._goldText.setText(`₴ ${this._battle.gold}`);
    this._battle.activateMedicalOintment();

    this._ointmentReady = false;
    this._redrawOintmentBtn(false);
    this._ointmentCooldownRemaining = OINTMENT_COOLDOWN / 1000;

    this.time.addEvent({
      delay: 1000,
      repeat: OINTMENT_COOLDOWN / 1000 - 1,
      callback: () => {
        this._ointmentCooldownRemaining -= 1;
        if (this._ointmentCooldownRemaining > 0) {
          this._ointmentCdText.setText(`${this._ointmentCooldownRemaining}s`);
        } else {
          this._ointmentCdText.setText('');
          this._ointmentReady = true;
          this._redrawOintmentBtn(false);
        }
      },
    });
    this._ointmentCdText.setText(`${this._ointmentCooldownRemaining}s`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _showNotEnoughGold() {
    const { width } = this.scale;
    this._floatingText(width / 2, 55, '⚠ Not enough gold!', '#ef9a9a');
  }

  _floatingText(x, y, text, color = '#ffd700') {
    const t = this.add
      .text(x, y, text, {
        fontSize: '14px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color,
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(60);

    this.tweens.add({
      targets: t,
      y: y - 35,
      alpha: 0,
      duration: 1100,
      ease: 'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  _disableUI() {
    if (this._gooseDragZone) this._gooseDragZone.disableInteractive();
    if (this._ointmentBg) this._ointmentBg.disableInteractive();
  }
}

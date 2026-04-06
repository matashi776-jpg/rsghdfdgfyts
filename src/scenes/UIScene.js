/**
 * UIScene.js
 * HUD overlay running in parallel over BattleScene.
 * Provides: gold display, wave display, goose drag-and-drop inventory,
 * the Medical Ointment hero ability button, and a centred title/start overlay.
 */

const GOOSE_COST = 50;
const OINTMENT_COST = 100;
const OINTMENT_COOLDOWN = 30000; // 30 s
const LANE_Y = [150, 300, 450];

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
    this._lastPurchaseTime = 0; // purchase cooldown (0.5 s)

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

  // ─── Title / Start overlay (Heroes 5 style) ──────────────────────────────────

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
        color: '#d4a017',
        stroke: '#000000',
        strokeThickness: 7,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 20, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(71);

    const subtitleText = this.add
      .text(width / 2, height * 0.40, 'vs  SAVOK', {
        fontSize: '30px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'italic',
        color: '#c0c0c0',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(71);

    // Pulsating START GAME button
    const btnX = width / 2;
    const btnY = height * 0.58;

    const btnBg = this.add.graphics().setDepth(71);
    const _drawBtn = (alpha) => {
      btnBg.clear();
      btnBg.fillStyle(0x1a0030, 0.92);
      btnBg.fillRoundedRect(btnX - 130, btnY - 28, 260, 56, 6);
      btnBg.lineStyle(2, 0xb8860b, alpha);
      btnBg.strokeRoundedRect(btnX - 130, btnY - 28, 260, 56, 6);
    };
    _drawBtn(1);

    const startText = this.add
      .text(btnX, btnY, '▶  START GAME', {
        fontSize: '26px',
        fontFamily: '"Times New Roman", serif',
        fontStyle: 'bold',
        color: '#d4a017',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff8c00', blur: 14, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(72);

    // Pulsate text scale
    this.tweens.add({
      targets: startText,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pulsate border glow
    const glowObj = { v: 1 };
    this.tweens.add({
      targets: glowObj,
      v: 0.3,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => _drawBtn(glowObj.v),
    });

    // Hit zone – dismiss overlay and start battle
    const startZone = this.add
      .zone(btnX, btnY, 260, 56)
      .setInteractive({ useHandCursor: true })
      .setDepth(73);

    startZone.on('pointerover', () => startText.setColor('#ffe066'));
    startZone.on('pointerout', () => startText.setColor('#d4a017'));
    startZone.on('pointerdown', () => {
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

  // ─── Top Bar ─────────────────────────────────────────────────────────────────

  _buildTopBar(width) {
    this.add.rectangle(width / 2, 22, width, 44, 0x1a237e, 0.82).setDepth(40);

    this._goldText = this.add
      .text(16, 22, '₴ 0', {
        fontSize: '18px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5)
      .setDepth(41);

    this._waveText = this.add
      .text(width / 2, 22, 'Wave 1', {
        fontSize: '18px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#e8f5e9',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(41);
  }

  // ─── Bottom Bar ──────────────────────────────────────────────────────────────

  _buildBottomBar(width, height) {
    this.add
      .rectangle(width / 2, height - 38, width, 76, 0x263238, 0.88)
      .setDepth(40);

    // Label
    this.add
      .text(12, height - 60, 'Inventory', {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#b0bec5',
      })
      .setDepth(41);
  }

  // ─── Draggable Goose Icon ────────────────────────────────────────────────────

  _buildDragIcon(width, height) {
    const iconX = 60;
    const iconY = height - 38;

    // Background slot
    this.add
      .rectangle(iconX, iconY, 60, 60, 0x37474f, 0.95)
      .setDepth(41)
      .setStrokeStyle(2, 0x78909c);

    // Goose icon image (non-interactive, just visual)
    const gooseImg = this.add
      .image(iconX, iconY, 'goose')
      .setScale(0.12)
      .setDepth(42)
      .setInteractive({ draggable: false }); // not directly draggable

    // Invisible drag region
    this._gooseDragZone = this.add
      .zone(iconX, iconY, 60, 60)
      .setInteractive({ draggable: true })
      .setDepth(43);

    // Cost label
    this.add
      .text(iconX, iconY + 28, `${GOOSE_COST} ₴`, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#ffd54f',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(42);

    // Description label
    this.add
      .text(iconX, iconY + 40, 'Стріляє борщем', {
        fontSize: '8px',
        fontFamily: 'Arial',
        color: '#b0bec5',
      })
      .setOrigin(0.5)
      .setDepth(42);

    // Create a "ghost" sprite that follows the pointer while dragging
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
      // Highlight hovered lane
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
    // Enforce 0.5 s cooldown between purchases
    if (this.time.now - this._lastPurchaseTime < 500) return;
    this._lastPurchaseTime = this.time.now;

    this._battle.gold -= GOOSE_COST;
    this._goldText.setText(`₴ ${this._battle.gold}`);
    this._battle.placeTower(laneIndex, dropX);

    // Visual feedback
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

  // ─── Ointment Button ─────────────────────────────────────────────────────────

  _buildOintmentButton(width, height) {
    const btnX = width - 90;
    const btnY = height - 38;

    this._ointmentBg = this.add
      .rectangle(btnX, btnY, 120, 60, 0x2e7d32, 0.95)
      .setInteractive({ useHandCursor: true })
      .setDepth(41)
      .setStrokeStyle(2, 0x66bb6a);

    this._ointmentLabel = this.add
      .text(btnX, btnY - 10, '💊 Ointment', {
        fontSize: '12px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#c8e6c9',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(42);

    this._ointmentCostLabel = this.add
      .text(btnX, btnY + 8, `${OINTMENT_COST} ₴  30s CD`, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#a5d6a7',
      })
      .setOrigin(0.5)
      .setDepth(42);

    this._ointmentCdText = this.add
      .text(btnX, btnY + 20, '', {
        fontSize: '13px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ef9a9a',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(43);

    this._ointmentBg.on('pointerdown', () => this._useOintment());
    this._ointmentBg.on('pointerover', () => {
      if (this._ointmentReady) this._ointmentBg.setFillStyle(0x388e3c, 0.95);
    });
    this._ointmentBg.on('pointerout', () => {
      if (this._ointmentReady) this._ointmentBg.setFillStyle(0x2e7d32, 0.95);
    });
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

    // Start cooldown
    this._ointmentReady = false;
    this._ointmentBg.setFillStyle(0x546e7a, 0.95);
    this._ointmentCooldownRemaining = OINTMENT_COOLDOWN / 1000;

    const tick = this.time.addEvent({
      delay: 1000,
      repeat: OINTMENT_COOLDOWN / 1000 - 1,
      callback: () => {
        this._ointmentCooldownRemaining -= 1;
        if (this._ointmentCooldownRemaining > 0) {
          this._ointmentCdText.setText(`${this._ointmentCooldownRemaining}s`);
        } else {
          this._ointmentCdText.setText('');
          this._ointmentReady = true;
          this._ointmentBg.setFillStyle(0x2e7d32, 0.95);
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
        fontFamily: 'Arial',
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

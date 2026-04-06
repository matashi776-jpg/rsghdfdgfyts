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
    // Dark strip behind all panels
    const strip = this.add.graphics().setDepth(39);
    strip.fillStyle(0x0d0800, 0.72);
    strip.fillRect(0, 0, width, 44);

    // Ornate Gold panel
    const goldGfx = this.add.graphics().setDepth(40);
    goldGfx.fillStyle(0x1a0a00, 0.92);
    goldGfx.fillRoundedRect(6, 4, 150, 36, 5);
    goldGfx.lineStyle(3, 0xb8860b, 1);
    goldGfx.strokeRoundedRect(6, 4, 150, 36, 5);
    goldGfx.lineStyle(1, 0xffd700, 0.45);
    goldGfx.strokeRoundedRect(9, 7, 144, 30, 4);

    this._goldText = this.add
      .text(81, 22, '₴ 0', {
        fontSize: '20px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(41);

    // Ornate Wave panel
    const wavePW = 160;
    const wavePX = width / 2 - wavePW / 2;
    const waveGfx = this.add.graphics().setDepth(40);
    waveGfx.fillStyle(0x1a0a00, 0.92);
    waveGfx.fillRoundedRect(wavePX, 4, wavePW, 36, 5);
    waveGfx.lineStyle(3, 0xb8860b, 1);
    waveGfx.strokeRoundedRect(wavePX, 4, wavePW, 36, 5);
    waveGfx.lineStyle(1, 0xffd700, 0.45);
    waveGfx.strokeRoundedRect(wavePX + 3, 7, wavePW - 6, 30, 4);

    this._waveText = this.add
      .text(width / 2, 22, 'Wave 1', {
        fontSize: '20px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#e8f5e9',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(41);
  }

  // ─── Bottom Bar ──────────────────────────────────────────────────────────────

  _buildBottomBar(width, height) {
    // Ornate dark panel with golden border
    const barGfx = this.add.graphics().setDepth(40);
    barGfx.fillStyle(0x0d0800, 0.92);
    barGfx.fillRect(0, height - 76, width, 76);
    barGfx.lineStyle(3, 0xb8860b, 1);
    barGfx.moveTo(0, height - 76);
    barGfx.lineTo(width, height - 76);
    barGfx.strokePath();
    barGfx.lineStyle(1, 0xffd700, 0.35);
    barGfx.moveTo(0, height - 73);
    barGfx.lineTo(width, height - 73);
    barGfx.strokePath();

    // Label
    this.add
      .text(12, height - 62, 'Inventory', {
        fontSize: '11px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#c8a96e',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setDepth(41);
  }

  // ─── Draggable Goose Icon ────────────────────────────────────────────────────

  _buildDragIcon(width, height) {
    const iconX = 60;
    const iconY = height - 38;
    const slotW = 64;
    const slotH = 64;

    // ── Beveled wood/stone slot using a Container ──────────────────────────────
    this._slotContainer = this.add.container(iconX, iconY).setDepth(41);

    // Draw beveled block (wood/stone aesthetic)
    const slotGfx = this.add.graphics();
    // Base fill – dark wood
    slotGfx.fillStyle(0x3d2609, 1);
    slotGfx.fillRect(-slotW / 2, -slotH / 2, slotW, slotH);
    // Inner face – slightly lighter wood
    slotGfx.fillStyle(0x5c3d14, 1);
    slotGfx.fillRect(-slotW / 2 + 3, -slotH / 2 + 3, slotW - 6, slotH - 6);
    // Top-left highlight (light edge)
    slotGfx.lineStyle(3, 0x9b6e2e, 1);
    slotGfx.moveTo(-slotW / 2, slotH / 2);
    slotGfx.lineTo(-slotW / 2, -slotH / 2);
    slotGfx.lineTo(slotW / 2, -slotH / 2);
    slotGfx.strokePath();
    // Bottom-right shadow (dark edge)
    slotGfx.lineStyle(3, 0x1a0a00, 1);
    slotGfx.moveTo(slotW / 2, -slotH / 2);
    slotGfx.lineTo(slotW / 2, slotH / 2);
    slotGfx.lineTo(-slotW / 2, slotH / 2);
    slotGfx.strokePath();
    // Golden inner rim
    slotGfx.lineStyle(1, 0xb8860b, 0.7);
    slotGfx.strokeRect(-slotW / 2 + 3, -slotH / 2 + 3, slotW - 6, slotH - 6);

    const gooseImg = this.add.image(0, -4, 'goose').setScale(0.12);

    const costLabel = this.add.text(0, 18, `${GOOSE_COST} ₴`, {
      fontSize: '10px',
      fontFamily: '"Times New Roman", Georgia, serif',
      fontStyle: 'bold',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
    }).setOrigin(0.5);

    const descLabel = this.add.text(0, 29, 'Стріляє борщем', {
      fontSize: '8px',
      fontFamily: '"Times New Roman", Georgia, serif',
      color: '#c8a96e',
    }).setOrigin(0.5);

    this._slotContainer.add([slotGfx, gooseImg, costLabel, descLabel]);

    // Invisible drag region (outside container so scaling doesn't affect hit area)
    this._gooseDragZone = this.add
      .zone(iconX, iconY, slotW, slotH)
      .setInteractive({ draggable: true })
      .setDepth(43);

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
      // Pressed tween: scale down then snap back
      this.tweens.add({
        targets: this._slotContainer,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 80,
        yoyo: true,
        ease: 'Power2',
      });
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
    const btnW = 128;
    const btnH = 64;

    // ── Beveled stone/wood button (Graphics + Zone) ───────────────────────────
    this._ointmentGfx = this.add.graphics().setDepth(41);
    this._ointmentState = 'normal';
    this._ointmentBtnX = btnX;
    this._ointmentBtnY = btnY;
    this._ointmentBtnW = btnW;
    this._ointmentBtnH = btnH;
    this._drawOintmentBevel('normal');

    // Hit zone
    this._ointmentBg = this.add
      .zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .setDepth(42);

    this._ointmentLabel = this.add
      .text(btnX, btnY - 12, '💊 Ointment', {
        fontSize: '12px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#c8e6c9',
        stroke: '#000000',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(43);

    this._ointmentCostLabel = this.add
      .text(btnX, btnY + 6, `${OINTMENT_COST} ₴  30s CD`, {
        fontSize: '10px',
        fontFamily: '"Times New Roman", Georgia, serif',
        color: '#a5d6a7',
        stroke: '#000000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(43);

    this._ointmentCdText = this.add
      .text(btnX, btnY + 20, '', {
        fontSize: '13px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#ef9a9a',
        stroke: '#000',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(43);

    this._ointmentBg.on('pointerdown', () => {
      // Pressed tween: shift down 2px, scale 0.95, then snap back
      this._drawOintmentBevel('pressed');
      this.tweens.add({
        targets: [this._ointmentLabel, this._ointmentCostLabel, this._ointmentCdText],
        y: '+=2',
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => this._drawOintmentBevel(this._ointmentReady ? 'normal' : 'cooldown'),
      });
      this._useOintment();
    });
    this._ointmentBg.on('pointerover', () => {
      if (this._ointmentReady) this._drawOintmentBevel('hover');
    });
    this._ointmentBg.on('pointerout', () => {
      if (this._ointmentReady) this._drawOintmentBevel('normal');
    });
  }

  _drawOintmentBevel(state) {
    const gfx = this._ointmentGfx;
    const bx = this._ointmentBtnX - this._ointmentBtnW / 2;
    const by = this._ointmentBtnY - this._ointmentBtnH / 2;
    const bw = this._ointmentBtnW;
    const bh = this._ointmentBtnH;

    const baseColors = {
      normal:  0x2e5c2e,
      hover:   0x3d7a3d,
      pressed: 0x1e3e1e,
      cooldown: 0x3a3a4a,
    };
    const edgeColors = {
      normal:  { hi: 0x5a9a5a, lo: 0x0f2a0f },
      hover:   { hi: 0x72b472, lo: 0x1a421a },
      pressed: { hi: 0x0f2a0f, lo: 0x5a9a5a }, // invert for pressed
      cooldown: { hi: 0x5a5a6e, lo: 0x1a1a28 },
    };

    gfx.clear();
    const base = baseColors[state] || baseColors.normal;
    const edges = edgeColors[state] || edgeColors.normal;

    // Base fill
    gfx.fillStyle(base, 1);
    gfx.fillRect(bx, by, bw, bh);
    // Golden inner glow strip at top
    gfx.fillStyle(0xb8860b, 0.18);
    gfx.fillRect(bx + 4, by + 3, bw - 8, 6);
    // Top-left highlight edge
    gfx.lineStyle(3, edges.hi, 1);
    gfx.moveTo(bx, by + bh);
    gfx.lineTo(bx, by);
    gfx.lineTo(bx + bw, by);
    gfx.strokePath();
    // Bottom-right shadow edge
    gfx.lineStyle(3, edges.lo, 1);
    gfx.moveTo(bx + bw, by);
    gfx.lineTo(bx + bw, by + bh);
    gfx.lineTo(bx, by + bh);
    gfx.strokePath();
    // Outer golden border
    gfx.lineStyle(2, 0xb8860b, 0.8);
    gfx.strokeRect(bx, by, bw, bh);
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
    this._drawOintmentBevel('cooldown');
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
          this._drawOintmentBevel('normal');
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
        fontSize: '15px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color,
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true },
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

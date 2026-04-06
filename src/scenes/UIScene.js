/**
 * UIScene.js
 * HUD overlay running in parallel over BattleScene.
 * Provides: money + wave display, a 2005-style unit-selection panel with
 * descriptions, and the Medical Ointment hero ability.
 */

const UNIT_DEFS = [
  {
    id: 'goose',
    label: 'Goose',
    cost: 100,
    desc: 'Standard defender.\nThrows hot borsch.',
    color: 0x1a4a2e,
    borderColor: 0x44cc88,
  },
  {
    id: 'superHero',
    label: 'Super Hero',
    cost: 500,
    desc: 'Heavy unit.\nHigh damage, high health.',
    color: 0x2a1a4a,
    borderColor: 0x8844cc,
  },
  {
    id: 'goldenGoose',
    label: 'Golden Goose',
    cost: 50,
    desc: 'Economic unit.\nProduces +50 ₴ every 5s.',
    color: 0x3a2a00,
    borderColor: 0xffd700,
  },
];

const OINTMENT_COST = 100;
const OINTMENT_COOLDOWN = 30000;

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.scale;
    this._battle = this.scene.get('BattleScene');
    this._ointmentReady = true;
    this._ointmentCooldownRemaining = 0;
    this._selectedUnitId = 'goose';

    this._buildTitleOverlay(width, height);
    this._buildTopBar(width);
    this._buildUnitPanel(width, height);
    this._buildOintmentButton(width, height);

    // Listen to BattleScene events
    this._battle.events.on('goldChanged', (gold) => {
      this._goldText.setText(`₴ ${gold}`);
      this._refreshButtonStates();
    });
    this._battle.events.on('waveChanged', (wave) => {
      this._waveText.setText(`Wave ${wave}`);
    });
    this._battle.events.on('gameOver', () => {
      this._disableUI();
    });
    this._battle.events.on('notEnoughGold', () => {
      this._showNotEnoughGold();
    });

    // Initial sync
    this._goldText.setText(`₴ ${this._battle.gold}`);
    this._waveText.setText(`Wave ${this._battle.wave}`);
  }

  // ─── Title / Start overlay (2005 style) ──────────────────────────────────────

  _buildTitleOverlay(width, height) {
    const overlayBg = this.add.graphics().setDepth(70);
    overlayBg.fillStyle(0x000000, 0.78);
    overlayBg.fillRect(0, 0, width, height);

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
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(71);

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

    this.tweens.add({
      targets: startText,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

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
    const strip = this.add.graphics().setDepth(39);
    strip.fillStyle(0x0d0800, 0.72);
    strip.fillRect(0, 0, width, 44);

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

  // ─── Unit Selection Panel ────────────────────────────────────────────────────

  _buildUnitPanel(width, height) {
    const panelH = 110;
    const panelY = height - panelH;

    // Dark backdrop
    const bg = this.add.graphics().setDepth(40);
    bg.fillStyle(0x0d0800, 0.94);
    bg.fillRect(0, panelY, width, panelH);
    bg.lineStyle(3, 0xb8860b, 1);
    bg.moveTo(0, panelY);
    bg.lineTo(width, panelY);
    bg.strokePath();
    bg.lineStyle(1, 0xffd700, 0.35);
    bg.moveTo(0, panelY + 3);
    bg.lineTo(width, panelY + 3);
    bg.strokePath();

    // "BUILD" label
    this.add
      .text(12, panelY + 6, 'BUILD', {
        fontSize: '10px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#c8a96e',
        stroke: '#000000',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
      })
      .setDepth(41);

    // Three unit cards (use 60% of the panel width, leaving room for ointment)
    const cardW = 160;
    const cardH = 90;
    const cardSpacing = 170;
    const startX = 20;
    const cardY = panelY + 10;

    this._unitButtons = [];
    this._unitGfxList = [];

    for (let i = 0; i < UNIT_DEFS.length; i++) {
      const def = UNIT_DEFS[i];
      const cx = startX + i * cardSpacing;
      this._buildUnitCard(def, cx, cardY, cardW, cardH);
    }

    this._selectUnit(this._selectedUnitId);
  }

  _buildUnitCard(def, x, y, w, h) {
    const gfx = this.add.graphics().setDepth(41);
    this._drawUnitCard(gfx, x, y, w, h, def, false);
    this._unitGfxList.push({ gfx, def, x, y, w, h });

    // Name
    this.add
      .text(x + w / 2, y + 8, def.label, {
        fontSize: '12px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
      })
      .setOrigin(0.5, 0)
      .setDepth(42);

    // Cost
    this.add
      .text(x + w / 2, y + 26, `${def.cost} ₴`, {
        fontSize: '11px',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontStyle: 'bold',
        color: '#aaffaa',
        stroke: '#000000',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
      })
      .setOrigin(0.5, 0)
      .setDepth(42);

    // Description
    this.add
      .text(x + w / 2, y + 44, def.desc, {
        fontSize: '9px',
        fontFamily: '"Times New Roman", Georgia, serif',
        color: '#c8a96e',
        stroke: '#000000',
        strokeThickness: 1,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
        align: 'center',
        wordWrap: { width: w - 10 },
      })
      .setOrigin(0.5, 0)
      .setDepth(42);

    // Invisible hit zone
    const zone = this.add
      .zone(x + w / 2, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true })
      .setDepth(43);

    zone.on('pointerdown', () => {
      this._selectUnit(def.id);
    });
    zone.on('pointerover', () => {
      this._hoverCard(def.id, true);
    });
    zone.on('pointerout', () => {
      this._hoverCard(def.id, false);
    });

    this._unitButtons.push({ zone, def });
  }

  _drawUnitCard(gfx, x, y, w, h, def, selected) {
    gfx.clear();
    // Base
    gfx.fillStyle(def.color, selected ? 1 : 0.75);
    gfx.fillRoundedRect(x, y, w, h, 5);
    // Border – brighter when selected
    gfx.lineStyle(selected ? 3 : 1.5, def.borderColor, selected ? 1 : 0.6);
    gfx.strokeRoundedRect(x, y, w, h, 5);
    if (selected) {
      // Inner glow strip
      gfx.fillStyle(def.borderColor, 0.18);
      gfx.fillRoundedRect(x + 3, y + 3, w - 6, h - 6, 4);
    }
  }

  _selectUnit(id) {
    this._selectedUnitId = id;
    if (this._battle) this._battle.selectedUnit = id;

    for (const entry of this._unitGfxList) {
      const selected = entry.def.id === id;
      this._drawUnitCard(entry.gfx, entry.x, entry.y, entry.w, entry.h, entry.def, selected);
    }
  }

  _hoverCard(id, over) {
    if (id === this._selectedUnitId) return;
    for (const entry of this._unitGfxList) {
      if (entry.def.id !== id) continue;
      this._drawUnitCard(entry.gfx, entry.x, entry.y, entry.w, entry.h, entry.def, over);
    }
  }

  _refreshButtonStates() {
    // Could dim cards when unaffordable; currently left as visual-only
  }

  // ─── Ointment Button ─────────────────────────────────────────────────────────

  _buildOintmentButton(width, height) {
    const btnX = width - 90;
    const btnY = height - 55;
    const btnW = 128;
    const btnH = 64;

    this._ointmentGfx = this.add.graphics().setDepth(41);
    this._ointmentState = 'normal';
    this._ointmentBtnX = btnX;
    this._ointmentBtnY = btnY;
    this._ointmentBtnW = btnW;
    this._ointmentBtnH = btnH;
    this._drawOintmentBevel('normal');

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
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true },
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

    const baseColors = { normal: 0x2e5c2e, hover: 0x3d7a3d, pressed: 0x1e3e1e, cooldown: 0x3a3a4a };
    const edgeColors = {
      normal:  { hi: 0x5a9a5a, lo: 0x0f2a0f },
      hover:   { hi: 0x72b472, lo: 0x1a421a },
      pressed: { hi: 0x0f2a0f, lo: 0x5a9a5a },
      cooldown: { hi: 0x5a5a6e, lo: 0x1a1a28 },
    };

    gfx.clear();
    const base = baseColors[state] || baseColors.normal;
    const edges = edgeColors[state] || edgeColors.normal;

    gfx.fillStyle(base, 1);
    gfx.fillRect(bx, by, bw, bh);
    gfx.fillStyle(0xb8860b, 0.18);
    gfx.fillRect(bx + 4, by + 3, bw - 8, 6);
    gfx.lineStyle(3, edges.hi, 1);
    gfx.moveTo(bx, by + bh);
    gfx.lineTo(bx, by);
    gfx.lineTo(bx + bw, by);
    gfx.strokePath();
    gfx.lineStyle(3, edges.lo, 1);
    gfx.moveTo(bx + bw, by);
    gfx.lineTo(bx + bw, by + bh);
    gfx.lineTo(bx, by + bh);
    gfx.strokePath();
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

    this._ointmentReady = false;
    this._drawOintmentBevel('cooldown');
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
    if (this._unitButtons) {
      for (const btn of this._unitButtons) btn.zone.disableInteractive();
    }
    if (this._ointmentBg) this._ointmentBg.disableInteractive();
  }
}

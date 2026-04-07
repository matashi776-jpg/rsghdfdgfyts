/**
 * RitualScene.js
 * Ritual interaction system — Оборона Ланчина
 *
 * Player performs a ritual at a ritual point. Resources are consumed.
 * Two choices: buff player OR debuff enemies. Interrupt risk if too slow.
 */
export default class RitualScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RitualScene' });
  }

  init(data) {
    this.ritual          = data.ritual;
    this.district        = data.district;
    this.resources       = data.resources       ?? { herbs: 5, runes: 3, pysanka: 2, money: 100 };
    this.cordonLevel     = data.cordonLevel     ?? 1;
    this.round           = data.round           ?? 1;
    this.xp              = data.xp              ?? 0;
    this.level           = data.level           ?? 1;
    this.modifiers       = data.modifiers       ?? { damage: 1, speed: 1, defense: 1, income: 1 };
    this.defeatedEnemies = data.defeatedEnemies ?? 0;

    this.ritualDone  = false;
    this.interrupted = false;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(600);

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x030012).setDepth(0);
    this._drawRuneBackground(width, height);

    // Ritual circle (centre)
    this._drawRitualCircle(width / 2, height * 0.52);

    // Title
    this.add.text(width / 2, 44, `⚗ ${this.ritual.name}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '32px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 20, fill: true },
    }).setOrigin(0.5).setDepth(20);

    this.add.text(width / 2, 80, this.district.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '15px',
      color:      '#888888',
    }).setOrigin(0.5).setDepth(20);

    // Resource cost panel
    this._drawResourceCost(width, height);

    // Choice buttons
    this._drawChoiceButtons(width, height);

    // Interrupt-risk countdown
    this._startInterruptTimer(width, height);

    // Back button
    this._drawBackButton(height);
  }

  // ─── Background runes ─────────────────────────────────────────────────────

  _drawRuneBackground(width, height) {
    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(10, width - 10);
      const y = Phaser.Math.Between(10, height - 10);
      const t = this.add.text(x, y, Phaser.Utils.Array.GetRandom(runes), {
        fontSize: '22px',
        color:    '#1a0033',
      }).setOrigin(0.5).setAlpha(0).setDepth(2);
      this.tweens.add({
        targets:  t,
        alpha:    0.55,
        duration: 900 + Math.random() * 1200,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
        delay:    Math.random() * 1000,
      });
    }
  }

  // ─── Ritual circle ────────────────────────────────────────────────────────

  _drawRitualCircle(cx, cy) {
    const outerRing = this.add.graphics().setDepth(5);
    outerRing.lineStyle(3, 0xff00ff, 0.8);
    outerRing.strokeCircle(cx, cy, 90);
    outerRing.lineStyle(1, 0x8800ff, 0.4);
    outerRing.strokeCircle(cx, cy, 118);

    this.tweens.add({
      targets:  outerRing,
      angle:    360,
      duration: 9000,
      repeat:   -1,
    });

    // Orbiting spark
    const spark = this.add.graphics().setDepth(6);
    let sparkAngle = 0;
    this.time.addEvent({
      delay:    80,
      loop:     true,
      callback: () => {
        if (this.ritualDone || this.interrupted) return;
        sparkAngle += 12;
        const rad = Phaser.Math.DegToRad(sparkAngle);
        spark.clear();
        spark.fillStyle(0xdd44ff, 0.8);
        spark.fillCircle(cx + Math.cos(rad) * 94, cy + Math.sin(rad) * 94, 5);
      },
    });

    // Central pysanka symbol
    const sym = this.add.text(cx, cy, '🥚', { fontSize: '52px' }).setOrigin(0.5).setDepth(7);
    this.tweens.add({
      targets:  sym,
      y:        cy - 10,
      scaleX:   1.1,
      scaleY:   1.1,
      duration: 1400,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
  }

  // ─── Resource cost ────────────────────────────────────────────────────────

  _drawResourceCost(width, height) {
    const panelY = height * 0.20;

    this.add.text(width / 2, panelY, 'Вартість ритуалу:', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '17px',
      color:      '#00ffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(20);

    const labels = { herbs: '🌿 Трави', runes: 'ᚠ Руни', pysanka: '🥚 Писанки', money: '💰 Гроші' };
    let row = 0;
    for (const [key, val] of Object.entries(this.ritual.cost)) {
      const have   = this.resources[key] ?? 0;
      const enough = have >= val;
      this.add.text(width / 2, panelY + 26 + row * 22, `${labels[key] ?? key}: ${val}  (є: ${have})`, {
        fontFamily: 'Arial, sans-serif',
        fontSize:   '14px',
        color:      enough ? '#aaffaa' : '#ff4444',
      }).setOrigin(0.5).setDepth(20);
      row++;
    }
  }

  // ─── Choice buttons ───────────────────────────────────────────────────────

  _drawChoiceButtons(width, height) {
    const buffNames = {
      defense:   '🛡 Захист +30%',
      damage:    '⚔ Шкода +30%',
      speed:     '⚡ Швидкість +20%',
      income:    '💰 Прибуток ×2',
      heal:      '❤ Відновити HP героїв',
      resources: '🌿 Ресурси +5',
      cordon:    '🏰 Захист кордону +50%',
      all:       '✨ Всі бонуси',
    };
    const debuffNames = {
      enemy_slow:  '🐢 Вороги сповільнені',
      enemy_weak:  '💀 Вороги ослаблені',
      enemy_blind: '👁 Вороги засліплені',
      enemy_poor:  '🚫 Вороги без ресурсів',
      enemy_fear:  '😱 Вороги злякані',
      enemy_curse: '☠ Вороги прокляті',
    };

    const btnY = height * 0.80;
    const buffLabel  = buffNames[this.ritual.buff]   ?? '✨ Бонус';
    const debuffLabel = this.ritual.debuff ? debuffNames[this.ritual.debuff] : null;

    const halfGap = debuffLabel ? 140 : 0;

    this._makeChoiceButton(width / 2 - halfGap, btnY, buffLabel, 0x003311, 0x00ff88,
      () => this._performRitual('buff'));

    if (debuffLabel) {
      this._makeChoiceButton(width / 2 + 140, btnY, debuffLabel, 0x330011, 0xff4488,
        () => this._performRitual('debuff'));
    }
  }

  _makeChoiceButton(cx, cy, label, bgColor, accent, onClick) {
    const w = 220, h = 52;
    const hexColor = '#' + accent.toString(16).padStart(6, '0');

    const gfx = this.add.graphics().setDepth(25);
    const draw = (bright) => {
      const c  = Phaser.Display.Color.IntegerToColor(bgColor);
      const fc = Phaser.Display.Color.GetColor(
        Math.min(255, c.red   * bright),
        Math.min(255, c.green * bright),
        Math.min(255, c.blue  * bright),
      );
      gfx.clear();
      gfx.fillStyle(fc, 0.94);
      gfx.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
      gfx.lineStyle(2, accent, 0.9);
      gfx.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
    };
    draw(1);

    const txt = this.add.text(cx, cy, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '14px',
      color:      hexColor,
      wordWrap:   { width: w - 20 },
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: hexColor, blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(26);

    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true }).setDepth(27);
    zone.on('pointerover', () => draw(1.6));
    zone.on('pointerout',  () => draw(1));
    zone.on('pointerdown', onClick);
  }

  // ─── Interrupt timer ──────────────────────────────────────────────────────

  _startInterruptTimer(width, height) {
    const barY    = height - 52;
    const barW    = 400;
    const total   = 15000;
    let elapsed   = 0;

    this.add.text(width / 2, barY - 20, '⚠ Ризик переривання:', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#ffaa00',
    }).setOrigin(0.5).setDepth(20);

    const timerGfx = this.add.graphics().setDepth(20);
    const drawBar = (ratio) => {
      timerGfx.clear();
      timerGfx.fillStyle(0x220000, 0.8);
      timerGfx.fillRoundedRect(width / 2 - barW / 2, barY - 7, barW, 14, 4);
      const col = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222;
      timerGfx.fillStyle(col, 1);
      timerGfx.fillRoundedRect(width / 2 - barW / 2, barY - 7, barW * ratio, 14, 4);
      timerGfx.lineStyle(1, 0xff4400, 0.7);
      timerGfx.strokeRoundedRect(width / 2 - barW / 2, barY - 7, barW, 14, 4);
    };
    drawBar(1);

    this._timerEvent = this.time.addEvent({
      delay:    100,
      loop:     true,
      callback: () => {
        if (this.ritualDone || this.interrupted) return;
        elapsed += 100;
        drawBar(Math.max(0, 1 - elapsed / total));
        if (elapsed >= total) this._onInterrupted(width, height);
      },
    });
  }

  // ─── Back button ──────────────────────────────────────────────────────────

  _drawBackButton(height) {
    const btn = this.add.text(54, height - 24, '← Назад', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '15px',
      color:      '#666666',
    }).setOrigin(0.5).setDepth(25).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#cccccc'));
    btn.on('pointerout',  () => btn.setColor('#666666'));
    btn.on('pointerdown', () => {
      this._timerEvent?.remove();
      this.cameras.main.fadeOut(400);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ExploreScene', this._baseData());
      });
    });
  }

  // ─── Ritual actions ───────────────────────────────────────────────────────

  _performRitual(type) {
    if (this.ritualDone || this.interrupted) return;
    this.ritualDone = true;
    this._timerEvent?.remove();

    // Deduct resources
    for (const [key, cost] of Object.entries(this.ritual.cost)) {
      this.resources[key] = Math.max(0, (this.resources[key] ?? 0) - cost);
    }

    // Apply effect
    if (type === 'buff')   this._applyBuff(this.ritual.buff);
    else                   this._applyDebuff(this.ritual.debuff);

    this.cameras.main.flash(500, 100, 0, 200);
    this._showSuccessOverlay();

    this.time.delayedCall(1600, () => {
      this.cameras.main.fadeOut(700);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TacticalBattleScene', {
          ...this._baseData(),
          ritualBuff:   type === 'buff'   ? this.ritual.buff   : null,
          ritualDebuff: type === 'debuff' ? this.ritual.debuff : null,
          interrupted:  false,
        });
      });
    });
  }

  _applyBuff(buff) {
    const m = this.modifiers;
    switch (buff) {
      case 'defense':   m.defense  = (m.defense  ?? 1) + 0.3; break;
      case 'damage':    m.damage   = (m.damage   ?? 1) + 0.3; break;
      case 'speed':     m.speed    = (m.speed    ?? 1) + 0.2; break;
      case 'income':    m.income   = (m.income   ?? 1) * 2;   break;
      case 'heal':      m.healBonus = (m.healBonus ?? 0) + 30; break;
      case 'resources':
        this.resources.herbs   = (this.resources.herbs   ?? 0) + 5;
        this.resources.runes   = (this.resources.runes   ?? 0) + 3;
        this.resources.pysanka = (this.resources.pysanka ?? 0) + 2;
        break;
      case 'cordon':    m.defense  = (m.defense  ?? 1) + 0.5; break;
      case 'all':
        m.damage  = (m.damage  ?? 1) + 0.15;
        m.defense = (m.defense ?? 1) + 0.15;
        m.speed   = (m.speed   ?? 1) + 0.1;
        break;
    }
  }

  _applyDebuff(debuff) {
    const m = this.modifiers;
    switch (debuff) {
      case 'enemy_slow':  m.enemySlow  = (m.enemySlow  ?? 0) + 0.30; break;
      case 'enemy_weak':  m.enemyWeak  = (m.enemyWeak  ?? 0) + 0.25; break;
      case 'enemy_blind': m.enemyBlind = (m.enemyBlind ?? 0) + 0.20; break;
      case 'enemy_poor':  m.enemyPoor  = true; break;
      case 'enemy_fear':  m.enemyFear  = (m.enemyFear  ?? 0) + 0.15; break;
      case 'enemy_curse': m.enemyCurse = true; break;
    }
  }

  _onInterrupted(width, height) {
    if (this.ritualDone || this.interrupted) return;
    this.interrupted = true;

    this.cameras.main.shake(600, 0.025);
    this.cameras.main.flash(400, 200, 0, 0);

    this.add.text(width / 2, height / 2, '⚠ РИТУАЛ ПЕРЕРВАНИЙ!\nПерсонаж вразливий!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '28px',
      color:      '#ff4444',
      stroke:     '#000000',
      strokeThickness: 6,
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 20, fill: true },
    }).setOrigin(0.5).setDepth(60);

    this.modifiers.vulnerable = true;

    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(600);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TacticalBattleScene', {
          ...this._baseData(),
          ritualBuff:   null,
          ritualDebuff: null,
          interrupted:  true,
        });
      });
    });
  }

  _showSuccessOverlay() {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2, '✨ РИТУАЛ ЗАВЕРШЕНО!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '36px',
      color:      '#00ffaa',
      stroke:     '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffaa', blur: 24, fill: true },
    }).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({
      targets:  txt,
      alpha:    1,
      y:        height / 2 - 16,
      duration: 400,
      ease:     'Back.easeOut',
    });
  }

  // ─── Shared data package ─────────────────────────────────────────────────

  _baseData() {
    return {
      resources:       this.resources,
      cordonLevel:     this.cordonLevel,
      round:           this.round,
      xp:              this.xp,
      level:           this.level,
      modifiers:       this.modifiers,
      defeatedEnemies: this.defeatedEnemies,
    };
  }
}

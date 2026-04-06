/**
 * MenuScene.js
 * Main menu — Оборона Ланчина V4.0 NEON PSYCHEDELIC
 */
import SaveManager from '../utils/SaveManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Load persistent save data
    const saveData = SaveManager.load();

    // Background with slow zoom tween
    const bg = this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height).setTint(0x8800ff);
    this.tweens.add({
      targets: bg,
      scaleX: bg.scaleX * 1.05,
      scaleY: bg.scaleY * 1.05,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Scanlines
    const scanlines = this.add.graphics().setAlpha(0.05).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineStyle(1, 0x00ffff, 1);
      scanlines.moveTo(0, y);
      scanlines.lineTo(width, y);
    }
    scanlines.strokePath();

    // Title
    this.add.text(width / 2, height * 0.20, 'ОБОРОНА ЛАНЧИНА', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '52px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 30, fill: true },
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, height * 0.29, 'NEON PSYCHEDELIC EDITION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#00ffff',
      stroke: '#000033',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(5);

    // ── Buttons ───────────────────────────────────────────────────────────────
    const btnStyle = (color, glow) => ({
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color,
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: glow, blur: 18, fill: true },
    });

    // Start button
    const startBtn = this.add.text(width / 2, height * 0.45, 'РОЗПОЧАТИ КАМПАНІЮ', btnStyle('#ffee00', '#ffee00'))
      .setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
    startBtn.on('pointerout',  () => startBtn.setColor('#ffee00'));
    startBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(1000);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StoryScene');
    });

    // Upgrades button
    const upgBtn = this.add.text(width / 2, height * 0.55, 'ПОКРАЩЕННЯ', btnStyle('#00ffff', '#00ffff'))
      .setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });

    upgBtn.on('pointerover', () => upgBtn.setColor('#ffffff'));
    upgBtn.on('pointerout',  () => upgBtn.setColor('#00ffff'));
    upgBtn.on('pointerdown', () => this._showUpgradesOverlay(saveData));

    // Settings button
    const setBtn = this.add.text(width / 2, height * 0.64, 'НАЛАШТУВАННЯ', btnStyle('#aaaaff', '#aaaaff'))
      .setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });

    setBtn.on('pointerover', () => setBtn.setColor('#ffffff'));
    setBtn.on('pointerout',  () => setBtn.setColor('#aaaaff'));
    setBtn.on('pointerdown', () => this._showSettingsOverlay());

    // ── Run stats strip ───────────────────────────────────────────────────────
    const statsText = [
      `Найкраща хвиля: ${saveData.stats.bestWave}`,
      `Всього забігів: ${saveData.stats.runs}`,
      `Всього золота: ₴${saveData.stats.totalGold}`,
    ].join('   |   ');

    this.add.text(width / 2, height * 0.88, statsText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#888899',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);
  }

  // ─── Overlays ─────────────────────────────────────────────────────────────

  _showUpgradesOverlay(saveData) {
    const { width, height } = this.scale;

    const overlay = this.add.container(0, 0).setDepth(20);

    const bg = this.add.rectangle(width / 2, height / 2, width * 0.7, height * 0.65, 0x000000, 0.92);
    bg.setStrokeStyle(3, 0x00ffff, 1);
    overlay.add(bg);

    overlay.add(this.add.text(width / 2, height * 0.22, 'ПОКРАЩЕННЯ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#00ffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 18, fill: true },
    }).setOrigin(0.5).setDepth(21));

    const lines = [
      `Рівень хаосу хати: ${saveData.meta.houseLevel}`,
      `Рівень зброї: ${saveData.meta.weaponLevel}`,
      `Постійні перки: ${saveData.meta.permanentPerks.length > 0 ? saveData.meta.permanentPerks.join(', ') : 'ще немає'}`,
      '',
      `Кращий забіг: хвиля ${saveData.stats.bestWave}`,
      `Забіги: ${saveData.stats.runs}`,
      `Все золото: ₴${saveData.stats.totalGold}`,
    ];

    lines.forEach((line, i) => {
      overlay.add(this.add.text(width / 2, height * 0.32 + i * 30, line, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: '#ddddee',
      }).setOrigin(0.5).setDepth(21));
    });

    const closeBtn = this.add.text(width / 2, height * 0.74, '[ ЗАКРИТИ ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ff00ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => overlay.destroy());
    overlay.add(closeBtn);
  }

  _showSettingsOverlay() {
    const { width, height } = this.scale;

    const overlay = this.add.container(0, 0).setDepth(20);

    const bg = this.add.rectangle(width / 2, height / 2, width * 0.55, height * 0.45, 0x000000, 0.92);
    bg.setStrokeStyle(3, 0xff00ff, 1);
    overlay.add(bg);

    overlay.add(this.add.text(width / 2, height * 0.28, 'НАЛАШТУВАННЯ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#ff00ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 16, fill: true },
    }).setOrigin(0.5).setDepth(21));

    overlay.add(this.add.text(width / 2, height * 0.44, '🔊 Музика: ввімкнена', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#aaddff',
    }).setOrigin(0.5).setDepth(21));

    overlay.add(this.add.text(width / 2, height * 0.52, '🖥 Повноекранний режим: F11', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#aaddff',
    }).setOrigin(0.5).setDepth(21));

    const closeBtn = this.add.text(width / 2, height * 0.65, '[ ЗАКРИТИ ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ff00ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => overlay.destroy());
    overlay.add(closeBtn);
  }
}

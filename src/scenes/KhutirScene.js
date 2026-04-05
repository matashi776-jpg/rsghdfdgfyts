/**
 * KhutirScene.js
 * Main Menu – "The Khutir" (Farm) scene.
 */
export default class KhutirScene extends Phaser.Scene {
  constructor() {
    super({ key: 'KhutirScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Start background music (safe – does nothing if file is missing)
    this._playBgMusic();

    // Background gradient: green farm on left, grey office on right
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4caf50, 0x4caf50, 0x9e9e9e, 0x9e9e9e, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative dividing line
    this.add.rectangle(width / 2, height / 2, 4, height, 0x333333);

    // Title
    this.add
      .text(width / 2, 100, 'Lanchyn\nvs\nSavok', {
        fontSize: '52px',
        fontFamily: 'Arial Black, Arial',
        fontStyle: 'bold',
        color: '#fff8e1',
        stroke: '#1b5e20',
        strokeThickness: 6,
        align: 'center',
        shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Subtitle
    this.add
      .text(width / 2, 230, 'A Satirical Tower Defense', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#fffde7',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // High-score record read from localStorage
    const maxWave = parseInt(localStorage.getItem('maxWaveReached') || '1', 10);
    this.add
      .text(width / 2, 265, `Рекорд: Хвиля ${maxWave}`, {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#ffd54f',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Hero sprite preview
    const hero = this.add.image(width * 0.18, height * 0.62, 'hero').setScale(0.3).setDepth(5);
    this.tweens.add({
      targets: hero,
      y: hero.y + 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Enemy preview (grey rectangle stand-in)
    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(0x757575, 1);
    gfx.fillRect(width * 0.78, height * 0.55, 30, 45);
    this.tweens.add({
      targets: gfx,
      x: -5,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // "Start Shift" button
    const btnX = width / 2;
    const btnY = height * 0.72;
    const btn = this.add
      .rectangle(btnX, btnY, 220, 54, 0xf57f17)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    const btnText = this.add
      .text(btnX, btnY, '▶  Start Shift', {
        fontSize: '22px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#fff8e1',
      })
      .setOrigin(0.5)
      .setDepth(6);

    btn.on('pointerover', () => btn.setFillStyle(0xffa000));
    btn.on('pointerout', () => btn.setFillStyle(0xf57f17));
    btn.on('pointerdown', () => {
      btn.setFillStyle(0xe65100);
      this.time.delayedCall(120, () => {
        this.scene.start('BattleScene');
        this.scene.start('UIScene');
      });
    });

    // Instructions text
    this.add
      .text(width / 2, height * 0.88, 'Drag geese onto lanes to defend the farm!\nStop the bureaucrats before they reach Nika!', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#fffde7',
        align: 'center',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  _playBgMusic() {
    try {
      const existing = this.sound.get('bg_music');
      if (existing) {
        if (!existing.isPlaying) existing.play({ loop: true, volume: 0.2 });
      } else {
        this.sound.play('bg_music', { loop: true, volume: 0.2 });
      }
    } catch (e) {
      console.warn('bg_music unavailable:', e.message);
    }
  }
}

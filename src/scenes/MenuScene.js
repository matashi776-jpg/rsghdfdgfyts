/**
 * MenuScene.js
 * Main menu — Acid Khutir NEON PSYCHEDELIC CYBER-FOLK
 * Art Bible: Deep Indigo bg, Electric Blue/Neon Pink title, UV-reactive pulse
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Deep Indigo base
    this.add.rectangle(width / 2, height / 2, width, height, 0x0A0014);

    // Background with Ultra-Violet tint + slow zoom
    const bg = this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setTint(0x7F00FF)
      .setAlpha(0.72);
    this.tweens.add({
      targets: bg,
      scaleX: bg.scaleX * 1.06,
      scaleY: bg.scaleY * 1.06,
      duration: 5000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Scanline overlay
    const scan = this.add.graphics().setAlpha(0.06).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scan.lineStyle(1, 0x00CFFF, 1);
      scan.moveTo(0, y);
      scan.lineTo(width, y);
    }
    scan.strokePath();

    // ── Title — Electric Blue neon, Neon Pink stroke ──────────────────────────
    const titleTxt = this.add.text(width / 2, height * 0.30, 'ACID KHUTIR', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '58px',
      color: '#00CFFF',
      stroke: '#FF00D4',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#00CFFF', blur: 28, fill: true },
    }).setOrigin(0.5).setDepth(5);

    // UV-reactive title pulse
    this.tweens.add({
      targets: titleTxt,
      alpha: { from: 1.0, to: 0.75 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(width / 2, height * 0.30 + 68, 'NEON PSYCHEDELIC CYBER-FOLK', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#7F00FF',
      shadow: { offsetX: 0, offsetY: 0, color: '#7F00FF', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(5);

    // ── Start button — Cyber-Amber glow ──────────────────────────────────────
    const btn = this.add.text(width / 2, height * 0.58, '▶  РОЗПОЧАТИ КАМПАНІЮ', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '30px',
      color: '#FFB300',
      stroke: '#0A0014',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#FFB300', blur: 22, fill: true },
      backgroundColor: '#0A0014CC',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setDepth(6).setInteractive({ useHandCursor: true });

    // Pulsing button scale
    this.tweens.add({
      targets: btn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    btn.on('pointerover', () => btn.setColor('#FF00D4').setFontSize('32px'));
    btn.on('pointerout',  () => btn.setColor('#FFB300').setFontSize('30px'));
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(800, 10, 0, 20);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StoryScene');
    });

    // ── Bottom instructions (Toxic Green subtle) ──────────────────────────────
    this.add.text(width / 2, height * 0.88,
      'Захищай хутір від бюрократів!\nStrike them with Electric Blue!', {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#39FF14',
        align: 'center',
        alpha: 0.7,
      }).setOrigin(0.5).setDepth(5);
  }
}

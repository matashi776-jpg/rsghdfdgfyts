/**
 * ComicScene.js
 * Comic-style panel overlay — Neon Psychedelic Cyber-Folk.
 * Displays a comic panel image with speech bubble using current locale.
 *
 * Launch from another scene:
 *   this.scene.launch('ComicScene', { panel: 'comic_panel_01', onComplete: () => {} });
 *
 * The calling scene should pause itself before launching, and resume in onComplete.
 * The panel auto-dismisses after 5 s, or immediately when the ✕ button is clicked.
 */
import Locale from '../utils/Locale.js';

export default class ComicScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ComicScene' });
  }

  init(data) {
    this._panel      = data.panel || 'comic_panel_01';
    this._captionKey = data.captionKey || 'comic_caption';
    this._onComplete = data.onComplete || null;
    this._dismissed  = false;
  }

  create() {
    const { width, height } = this.scale;

    // Outer dark frame
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.93).setDepth(0);

    // Thick comic-style border (yellow outer, pink inner)
    const border = this.add.graphics().setDepth(1);
    border.lineStyle(8, 0xffff00, 1);
    border.strokeRect(18, 18, width - 36, height - 36);
    border.lineStyle(3, 0xff00ff, 0.75);
    border.strokeRect(26, 26, width - 52, height - 52);

    // Half-tone dot pattern overlay for comic feel
    const dots = this.add.graphics().setDepth(1).setAlpha(0.05);
    for (let dx = 0; dx < width; dx += 12) {
      for (let dy = 0; dy < height; dy += 12) {
        dots.fillStyle(0xffffff, 1);
        dots.fillCircle(dx, dy, 1.5);
      }
    }

    // Panel image (centre area, leaves room for speech bubble at bottom)
    const img = this.add.image(width / 2, height / 2 - 36, this._panel)
      .setDisplaySize(width - 72, height - 200)
      .setAlpha(0)
      .setDepth(2);
    this.tweens.add({ targets: img, alpha: 1, duration: 450 });

    // Speech bubble (white rounded rect at the bottom)
    const bw = width * 0.74;
    const bh = 72;
    const bx = width / 2;
    const by = height - 70;
    const bubble = this.add.graphics().setDepth(5);
    bubble.fillStyle(0xffffff, 0.96);
    bubble.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 14);
    bubble.lineStyle(3, 0xff00ff, 1);
    bubble.strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 14);

    // Speech text — uses dynamic caption key
    this.add.text(bx, by, Locale.t(this._captionKey), {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '17px',
      color:      '#220044',
      wordWrap:   { width: bw - 28 },
      align:      'center',
    }).setOrigin(0.5).setDepth(6);

    // ✕ close button (top-right)
    this.add.text(width - 36, 36, '✕', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '24px',
      color:      '#ff00ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 10, fill: true },
    })
      .setOrigin(0.5)
      .setDepth(7)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function () { this.setColor('#ffffff'); })
      .on('pointerout',  function () { this.setColor('#ff00ff'); })
      .on('pointerdown', () => this._finish());

    // Auto-dismiss after 5 s
    this.time.delayedCall(5000, () => this._finish());
  }

  // ─── Finish ───────────────────────────────────────────────────────────────

  _finish() {
    if (this._dismissed) return;
    this._dismissed = true;
    this.cameras.main.fadeOut(340, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this._onComplete) this._onComplete();
      this.scene.stop();
    });
  }
}

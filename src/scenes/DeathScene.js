/**
 * DeathScene.js
 * "Архівовано..." death screen — Оборона Ланчина V4.0
 *
 * Receives { wave, gold, perks[] } from BattleScene.
 * Displays stats with neon glitch aesthetics, then returns to MenuScene.
 */
export default class DeathScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DeathScene' });
    }

    init(data) {
        this.waveReached = data.wave || 1;
        this.goldEarned  = data.gold || 0;
        this.perks       = data.perks || [];
    }

    create() {
        const { width, height } = this.scale;

        // Pitch-black background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

        // Red scanlines — glitch feel
        const scanlines = this.add.graphics().setAlpha(0.06).setDepth(1);
        for (let y = 0; y < height; y += 4) {
            scanlines.lineStyle(1, 0xff0000, 1);
            scanlines.moveTo(0, y);
            scanlines.lineTo(width, y);
        }
        scanlines.strokePath();

        // ── "АРХІВОВАНО..." title ────────────────────────────────────────────
        const title = this.add.text(width / 2, height * 0.18, 'АРХІВОВАНО...', {
            fontFamily: 'Arial Black, Arial',
            fontSize:   '72px',
            color:      '#ff0044',
            stroke:     '#000000',
            strokeThickness: 12,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff0044', blur: 40, fill: true },
        }).setOrigin(0.5).setAlpha(0).setDepth(5);

        this.tweens.add({ targets: title, alpha: 1, duration: 1200, ease: 'Sine.easeInOut' });

        // Glitch horizontal shake on the title
        this.time.addEvent({
            delay:    280,
            loop:     true,
            callback: () => {
                if (!title.active) return;
                this.tweens.add({
                    targets:  title,
                    x:        width / 2 + Phaser.Math.Between(-5, 5),
                    duration: 50,
                    yoyo:     true,
                });
            },
        });

        // ── Stats ─────────────────────────────────────────────────────────────
        const statStyle = (color, glow) => ({
            fontFamily: 'Arial Black, Arial',
            fontSize:   '26px',
            color,
            stroke:     '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: glow, blur: 16, fill: true },
        });

        const waveTxt = this.add.text(
            width / 2, height * 0.38,
            `⚔ Дійшов до хвилі: ${this.waveReached}`,
            statStyle('#00ffff', '#00ffff'),
        ).setOrigin(0.5).setAlpha(0).setDepth(5);

        const goldTxt = this.add.text(
            width / 2, height * 0.50,
            `💰 Зароблено золота: ₴${this.goldEarned}`,
            statStyle('#ffcc00', '#ffcc00'),
        ).setOrigin(0.5).setAlpha(0).setDepth(5);

        const perksStr = this.perks.length > 0
            ? this.perks.join('  •  ')
            : '—';
        const perkTxt = this.add.text(
            width / 2, height * 0.61,
            `🧪 Перки: ${perksStr}`,
            {
                fontFamily: 'Arial, sans-serif',
                fontSize:   '18px',
                color:      '#ff88ff',
                stroke:     '#000000',
                strokeThickness: 3,
                wordWrap: { width: width * 0.72 },
                align:   'center',
                shadow: { offsetX: 0, offsetY: 0, color: '#ff88ff', blur: 10, fill: true },
            },
        ).setOrigin(0.5).setAlpha(0).setDepth(5);

        // Staggered fade-in of stats after title appears
        this.time.delayedCall(900, () => {
            this.tweens.add({ targets: waveTxt, alpha: 1, duration: 700, ease: 'Sine.easeInOut' });
        });
        this.time.delayedCall(1400, () => {
            this.tweens.add({ targets: goldTxt, alpha: 1, duration: 700, ease: 'Sine.easeInOut' });
        });
        this.time.delayedCall(1900, () => {
            this.tweens.add({ targets: perkTxt, alpha: 1, duration: 700, ease: 'Sine.easeInOut' });
        });

        // ── Return button ─────────────────────────────────────────────────────
        const retBtn = this.add.text(width / 2, height * 0.78, '[ ПОВЕРНУТИСЬ ]', {
            fontFamily: 'Arial Black, Arial',
            fontSize:   '28px',
            color:      '#ff00ff',
            stroke:     '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 22, fill: true },
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        // Pulse animation on button
        this.tweens.add({
            targets:  retBtn,
            alpha:    0.65,
            duration: 800,
            yoyo:     true,
            repeat:   -1,
            ease:     'Sine.easeInOut',
        });

        retBtn.on('pointerover', () => {
            this.tweens.killTweensOf(retBtn);
            retBtn.setAlpha(1).setColor('#ffffff');
        });
        retBtn.on('pointerout', () => {
            retBtn.setColor('#ff00ff');
            this.tweens.add({
                targets: retBtn, alpha: 0.65, duration: 800,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
        });
        retBtn.on('pointerdown', () => this._returnToMenu());

        // Auto-return after 14 seconds
        this.time.delayedCall(14000, () => {
            if (this.scene.isActive('DeathScene')) this._returnToMenu();
        });

        this.cameras.main.fadeIn(700, 0, 0, 0);
    }

    _returnToMenu() {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
}

import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    init(data) {
        this.playerHP = data.playerHP ?? 100;
        this.playerMaxHP = data.playerMaxHP ?? 100;
        this.enemyHP = data.enemyHP ?? 80;
        this.enemyMaxHP = data.enemyMaxHP ?? 80;
    }

    create() {
        this.createHPBars();
        this.createTurnIndicator();

        // Listen to HP update events from BattleScene
        const battleScene = this.scene.get('BattleScene');
        battleScene.events.on('hpUpdate', this.onHPUpdate, this);

        // Clean up listener when this scene shuts down
        this.events.on('shutdown', () => {
            battleScene.events.off('hpUpdate', this.onHPUpdate, this);
        });
    }

    createHPBars() {
        // ── Player HP bar (top-left) ──────────────────────────────────────────
        const pPanel = this.add.graphics();
        pPanel.fillStyle(0x000000, 0.55);
        pPanel.fillRoundedRect(10, 10, 220, 70, 8);
        pPanel.lineStyle(1, 0x4466aa, 1);
        pPanel.strokeRoundedRect(10, 10, 220, 70, 8);

        this.add.text(20, 18, 'HERO', {
            fontSize: '14px',
            fill: '#88aaff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        });

        // HP label
        this.playerHPLabel = this.add.text(20, 38, `HP: ${this.playerHP} / ${this.playerMaxHP}`, {
            fontSize: '12px',
            fill: '#aaccff',
            fontFamily: 'monospace'
        });

        // Bar background
        this.add.graphics()
            .fillStyle(0x222244, 1)
            .fillRoundedRect(20, 55, 200, 16, 4);

        // Bar fill
        this.playerHPBar = this.add.graphics();
        this.drawHPBar(this.playerHPBar, 20, 55, 200, 16, this.playerHP / this.playerMaxHP, 0x44cc66);

        // Bar border
        this.add.graphics()
            .lineStyle(1, 0x4466aa, 0.8)
            .strokeRoundedRect(20, 55, 200, 16, 4);

        // ── Enemy HP bar (top-right) ──────────────────────────────────────────
        const ePanel = this.add.graphics();
        ePanel.fillStyle(0x000000, 0.55);
        ePanel.fillRoundedRect(570, 10, 220, 70, 8);
        ePanel.lineStyle(1, 0xaa4444, 1);
        ePanel.strokeRoundedRect(570, 10, 220, 70, 8);

        this.add.text(580, 18, 'DRAGON', {
            fontSize: '14px',
            fill: '#ff8888',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        });

        this.enemyHPLabel = this.add.text(580, 38, `HP: ${this.enemyHP} / ${this.enemyMaxHP}`, {
            fontSize: '12px',
            fill: '#ffaaaa',
            fontFamily: 'monospace'
        });

        this.add.graphics()
            .fillStyle(0x442222, 1)
            .fillRoundedRect(580, 55, 200, 16, 4);

        this.enemyHPBar = this.add.graphics();
        this.drawHPBar(this.enemyHPBar, 580, 55, 200, 16, this.enemyHP / this.enemyMaxHP, 0xee4444);

        this.add.graphics()
            .lineStyle(1, 0xaa4444, 0.8)
            .strokeRoundedRect(580, 55, 200, 16, 4);
    }

    createTurnIndicator() {
        this.turnBg = this.add.graphics();
        this.turnBg.fillStyle(0x000000, 0.5);
        this.turnBg.fillRoundedRect(300, 10, 200, 36, 8);

        this.turnText = this.add.text(400, 28, '⚔ Your Turn', {
            fontSize: '15px',
            fill: '#ffee88',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Pulse animation on the turn indicator
        this.tweens.add({
            targets: this.turnText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    drawHPBar(graphics, x, y, width, height, ratio, color) {
        graphics.clear();
        if (ratio <= 0) return;

        const fillWidth = Math.max(0, Math.floor(width * ratio));

        // Choose color based on HP ratio
        let barColor = color;
        if (ratio < 0.25) {
            barColor = 0xff2222;
        } else if (ratio < 0.5) {
            barColor = 0xffaa22;
        }

        graphics.fillStyle(barColor, 1);
        graphics.fillRoundedRect(x, y, fillWidth, height, 4);

        // Shine highlight
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillRoundedRect(x, y, fillWidth, Math.floor(height / 2), 4);
    }

    onHPUpdate(data) {
        this.playerHP = data.playerHP;
        this.enemyHP = data.enemyHP;

        // Update player HP bar and label
        this.drawHPBar(
            this.playerHPBar,
            20, 55, 200, 16,
            this.playerHP / this.playerMaxHP,
            0x44cc66
        );
        this.playerHPLabel.setText(`HP: ${this.playerHP} / ${this.playerMaxHP}`);

        // Flash red on low HP
        if (this.playerHP < this.playerMaxHP * 0.25) {
            this.cameras.main.flash(150, 200, 0, 0, false);
        }

        // Update enemy HP bar and label
        this.drawHPBar(
            this.enemyHPBar,
            580, 55, 200, 16,
            this.enemyHP / this.enemyMaxHP,
            0xee4444
        );
        this.enemyHPLabel.setText(`HP: ${this.enemyHP} / ${this.enemyMaxHP}`);
    }
}

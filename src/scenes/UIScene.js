import Phaser from 'phaser';

// ─── UIScene ─────────────────────────────────────────────────────────────────
// Runs in parallel with BattleScene as a transparent overlay.
// Displays HP bars, score, controls help, and end-game screens.

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    // ── Init ──────────────────────────────────────────────────────────────────

    init(data) {
        this.heroHP      = data.heroHP      ?? 100;
        this.heroMaxHP   = data.heroMaxHP   ?? 100;
        this.enemyHP     = data.enemyHP     ?? 150;
        this.enemyMaxHP  = data.enemyMaxHP  ?? 150;
        this.score       = data.score       ?? 0;
        this.battleScene = data.battleScene ?? null;
    }

    // ── Create ────────────────────────────────────────────────────────────────

    create() {
        this._buildHUD();
        this._buildControls();
        this._buildEndScreen();
        this._updateBars();
    }

    // ── HUD ───────────────────────────────────────────────────────────────────

    _buildHUD() {
        // Bottom panel
        this.add.image(400, 560, 'ui_panel').setAlpha(0.9);

        // ── Hero HP ──
        this.add.text(20, 510, 'HERO', {
            fontSize: '13px',
            color:    '#60a5fa',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        });

        this.add.image(20 + 100, 535, 'hp_bg').setOrigin(0.5, 0.5);

        this.heroHPBar = this.add.graphics();
        this._drawBar(this.heroHPBar, 20, 527, 200, 16, 0x22c55e, 1.0);

        this.heroHPText = this.add.text(228, 527, `${this.heroHP}/${this.heroMaxHP}`, {
            fontSize: '12px',
            color:    '#d1fae5',
            fontFamily: 'monospace'
        });

        // ── Enemy HP ──
        this.add.text(780 - 20 - 200, 510, 'ENEMY', {
            fontSize: '13px',
            color:    '#f87171',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0, 0);

        this.add.image(780 - 20 - 100, 535, 'hp_bg').setOrigin(0.5, 0.5);

        this.enemyHPBar = this.add.graphics();
        this._drawBar(this.enemyHPBar, 780 - 20 - 200, 527, 200, 16, 0xef4444, 1.0);

        this.enemyHPText = this.add.text(780 - 20 - 200, 549, `${this.enemyHP}/${this.enemyMaxHP}`, {
            fontSize: '12px',
            color:    '#fee2e2',
            fontFamily: 'monospace'
        });

        // ── Score ──
        this.scoreTxt = this.add.text(400, 510, `SCORE: ${this.score}`, {
            fontSize: '16px',
            color:    '#fbbf24',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
    }

    _drawBar(gfx, x, y, w, h, color, pct) {
        gfx.clear();
        if (pct > 0) {
            gfx.fillStyle(color, 1);
            gfx.fillRect(x, y, Math.round(w * pct), h);
        }
    }

    _updateBars() {
        const heroPct  = Math.max(0, this.heroHP  / this.heroMaxHP);
        const enemyPct = Math.max(0, this.enemyHP / this.enemyMaxHP);

        // Color transitions: green → yellow → red
        const heroColor  = this._hpColor(heroPct);
        const enemyColor = this._hpColor(enemyPct);

        this._drawBar(this.heroHPBar,  20,              527, 200, 16, heroColor,  heroPct);
        this._drawBar(this.enemyHPBar, 780 - 20 - 200,  527, 200, 16, enemyColor, enemyPct);

        this.heroHPText.setText(`${this.heroHP}/${this.heroMaxHP}`);
        this.enemyHPText.setText(`${this.enemyHP}/${this.enemyMaxHP}`);
        this.scoreTxt.setText(`SCORE: ${this.score}`);
    }

    _hpColor(pct) {
        if (pct > 0.5) return 0x22c55e; // green
        if (pct > 0.25) return 0xf59e0b; // yellow
        return 0xef4444;                  // red
    }

    // ── Controls help ─────────────────────────────────────────────────────────

    _buildControls() {
        const lines = [
            '← → / A D  Move',
            '↑ / W       Jump',
            'SPACE       Shoot'
        ];
        lines.forEach((line, i) => {
            this.add.text(400, 548 + i * 14, line, {
                fontSize: '11px',
                color:    '#94a3b8',
                fontFamily: 'monospace'
            }).setOrigin(0.5, 0);
        });
    }

    // ── End Screen ────────────────────────────────────────────────────────────

    _buildEndScreen() {
        // Overlay container (hidden by default)
        this.endContainer = this.add.container(400, 300);
        this.endContainer.setVisible(false);

        // Dark backdrop
        const backdrop = this.add.graphics();
        backdrop.fillStyle(0x000000, 0.7);
        backdrop.fillRect(-400, -300, 800, 600);
        this.endContainer.add(backdrop);

        // Result text
        this.resultText = this.add.text(0, -80, '', {
            fontSize:   '48px',
            color:      '#ffffff',
            fontFamily: 'monospace',
            fontStyle:  'bold',
            stroke:     '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.endContainer.add(this.resultText);

        // Score text
        this.finalScoreText = this.add.text(0, -10, '', {
            fontSize:   '22px',
            color:      '#fbbf24',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.endContainer.add(this.finalScoreText);

        // Restart button image
        const btnImg = this.add.image(0, 70, 'btn');
        this.endContainer.add(btnImg);

        // Restart button label
        const btnLabel = this.add.text(0, 70, 'PLAY AGAIN', {
            fontSize:   '16px',
            color:      '#ffffff',
            fontFamily: 'monospace',
            fontStyle:  'bold'
        }).setOrigin(0.5);
        this.endContainer.add(btnLabel);

        // Make button interactive
        btnImg.setInteractive({ useHandCursor: true });

        btnImg.on('pointerover', () => {
            btnImg.setTexture('btn_hover');
        });
        btnImg.on('pointerout', () => {
            btnImg.setTexture('btn');
        });
        btnImg.on('pointerdown', () => {
            this._onRestart();
        });

        // Also allow pressing Enter/Space to restart
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.endContainer.visible) this._onRestart();
        });
        this.input.keyboard.on('keydown-R', () => {
            if (this.endContainer.visible) this._onRestart();
        });
    }

    showEndScreen(victory, score) {
        this.endContainer.setVisible(true);

        if (victory) {
            this.resultText.setText('VICTORY!');
            this.resultText.setColor('#4ade80');
        } else {
            this.resultText.setText('GAME OVER');
            this.resultText.setColor('#ef4444');
        }

        this.finalScoreText.setText(`Final Score: ${score}`);

        // Pop-in animation
        this.endContainer.setScale(0.5);
        this.tweens.add({
            targets:  this.endContainer,
            scaleX:   1,
            scaleY:   1,
            duration: 350,
            ease:     'Back.easeOut'
        });
    }

    _onRestart() {
        if (this.battleScene) {
            this.battleScene.restart();
        } else {
            this.scene.stop('UIScene');
            this.scene.start('BattleScene');
        }
    }

    // ── Public: update stats from BattleScene ─────────────────────────────────

    updateStats({ heroHP, enemyHP, score }) {
        this.heroHP  = heroHP  ?? this.heroHP;
        this.enemyHP = enemyHP ?? this.enemyHP;
        this.score   = score   ?? this.score;
        this._updateBars();
    }
}

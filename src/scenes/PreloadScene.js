import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background
        this.cameras.main.setBackgroundColor('#0d0d1a');

        // Title text
        this.add.text(width / 2, height / 2 - 80, 'BATTLE ARENA', {
            fontSize: '32px',
            fill: '#e0c060',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Loading label
        const loadingText = this.add.text(width / 2, height / 2 - 20, 'Loading...', {
            fontSize: '18px',
            fill: '#aaaaaa',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // Progress bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333355, 1);
        barBg.fillRoundedRect(width / 2 - 160, height / 2 + 10, 320, 24, 4);

        // Progress bar fill
        const barFill = this.add.graphics();

        // Progress bar border
        const barBorder = this.add.graphics();
        barBorder.lineStyle(2, 0x8888cc, 1);
        barBorder.strokeRoundedRect(width / 2 - 160, height / 2 + 10, 320, 24, 4);

        // Percentage text
        const percentText = this.add.text(width / 2, height / 2 + 22, '0%', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0x5566ee, 1);
            barFill.fillRoundedRect(width / 2 - 158, height / 2 + 12, 316 * value, 20, 3);
            percentText.setText(`${Math.floor(value * 100)}%`);
        });

        this.load.on('complete', () => {
            loadingText.setText('Ready!');
            percentText.setText('100%');
        });

        // Generate all game graphics as textures using RenderTexture
        this.createTextures();
    }

    createTextures() {
        // Player character texture (blue knight silhouette)
        const playerRT = this.add.renderTexture(0, 0, 80, 96).setVisible(false);
        const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Body
        playerGfx.fillStyle(0x3366cc, 1);
        playerGfx.fillRect(20, 32, 40, 44);
        // Head
        playerGfx.fillStyle(0x4488ee, 1);
        playerGfx.fillCircle(40, 22, 18);
        // Helmet crest
        playerGfx.fillStyle(0xee4444, 1);
        playerGfx.fillRect(35, 4, 10, 16);
        // Legs
        playerGfx.fillStyle(0x224499, 1);
        playerGfx.fillRect(20, 72, 16, 20);
        playerGfx.fillRect(44, 72, 16, 20);
        // Sword
        playerGfx.fillStyle(0xccccdd, 1);
        playerGfx.fillRect(62, 20, 6, 40);
        playerGfx.fillStyle(0xaa8833, 1);
        playerGfx.fillRect(56, 42, 18, 6);
        playerRT.draw(playerGfx, 0, 0);
        playerRT.saveTexture('player');
        playerGfx.destroy();
        playerRT.destroy();

        // Enemy texture (red dragon/monster)
        const enemyRT = this.add.renderTexture(0, 0, 96, 96).setVisible(false);
        const enemyGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Body
        enemyGfx.fillStyle(0xaa2222, 1);
        enemyGfx.fillEllipse(48, 56, 60, 52);
        // Head
        enemyGfx.fillStyle(0xcc3333, 1);
        enemyGfx.fillCircle(48, 24, 20);
        // Horns
        enemyGfx.fillStyle(0x882222, 1);
        enemyGfx.fillTriangle(32, 16, 26, 0, 40, 10);
        enemyGfx.fillTriangle(64, 16, 70, 0, 56, 10);
        // Eyes
        enemyGfx.fillStyle(0xffee00, 1);
        enemyGfx.fillCircle(40, 22, 5);
        enemyGfx.fillCircle(56, 22, 5);
        enemyGfx.fillStyle(0x000000, 1);
        enemyGfx.fillCircle(41, 22, 2);
        enemyGfx.fillCircle(57, 22, 2);
        // Wings
        enemyGfx.fillStyle(0x881111, 1);
        enemyGfx.fillTriangle(10, 40, 0, 20, 30, 50);
        enemyGfx.fillTriangle(86, 40, 96, 20, 66, 50);
        // Claws
        enemyGfx.fillStyle(0x551111, 1);
        enemyGfx.fillRect(18, 76, 8, 16);
        enemyGfx.fillRect(70, 76, 8, 16);
        enemyRT.draw(enemyGfx, 0, 0);
        enemyRT.saveTexture('enemy');
        enemyGfx.destroy();
        enemyRT.destroy();

        // Attack button texture
        const btnRT = this.add.renderTexture(0, 0, 140, 44).setVisible(false);
        const btnGfx = this.make.graphics({ x: 0, y: 0, add: false });
        btnGfx.fillStyle(0xcc3300, 1);
        btnGfx.fillRoundedRect(0, 0, 140, 44, 8);
        btnGfx.lineStyle(2, 0xff6633, 1);
        btnGfx.strokeRoundedRect(1, 1, 138, 42, 8);
        btnRT.draw(btnGfx, 0, 0);
        btnRT.saveTexture('btn_attack');
        btnGfx.destroy();
        btnRT.destroy();

        // Attack button hover texture
        const btnHoverRT = this.add.renderTexture(0, 0, 140, 44).setVisible(false);
        const btnHoverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        btnHoverGfx.fillStyle(0xff4400, 1);
        btnHoverGfx.fillRoundedRect(0, 0, 140, 44, 8);
        btnHoverGfx.lineStyle(2, 0xff8855, 1);
        btnHoverGfx.strokeRoundedRect(1, 1, 138, 42, 8);
        btnHoverRT.draw(btnHoverGfx, 0, 0);
        btnHoverRT.saveTexture('btn_attack_hover');
        btnHoverGfx.destroy();
        btnHoverRT.destroy();
    }

    create() {
        // Brief delay so the "Ready!" text is visible, then transition
        this.time.delayedCall(400, () => {
            this.scene.start('BattleScene');
        });
    }
}

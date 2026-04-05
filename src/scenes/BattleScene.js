import Phaser from 'phaser';

const PLAYER_MAX_HP = 100;
const ENEMY_MAX_HP = 80;
const PLAYER_ATTACK_MIN = 8;
const PLAYER_ATTACK_MAX = 18;
const ENEMY_ATTACK_MIN = 5;
const ENEMY_ATTACK_MAX = 14;

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init() {
        this.playerHP = PLAYER_MAX_HP;
        this.enemyHP = ENEMY_MAX_HP;
        this.playerMaxHP = PLAYER_MAX_HP;
        this.enemyMaxHP = ENEMY_MAX_HP;
        this.battleActive = true;
        this.turnInProgress = false;
    }

    create() {
        this.drawBackground();
        this.createCombatants();
        this.createAttackButton();
        this.createBattleLog();

        // Launch the UI overlay scene in parallel
        this.scene.launch('UIScene', {
            playerHP: this.playerHP,
            playerMaxHP: this.playerMaxHP,
            enemyHP: this.enemyHP,
            enemyMaxHP: this.enemyMaxHP
        });

        this.addLogMessage('A wild DRAGON appears!');
        this.addLogMessage('Choose your action...');

    }

    drawBackground() {
        // Sky gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0d0d2e, 0x0d0d2e, 0x1a1a4e, 0x1a1a4e, 1);
        bg.fillRect(0, 0, 800, 600);

        // Ground
        bg.fillStyle(0x2d4a1e, 1);
        bg.fillRect(0, 400, 800, 200);

        // Ground highlight
        bg.fillStyle(0x3a5c28, 1);
        bg.fillRect(0, 400, 800, 8);

        // Stars
        bg.fillStyle(0xffffff, 0.6);
        const starPositions = [
            [50, 30], [120, 60], [200, 20], [300, 50], [420, 15],
            [530, 40], [640, 25], [720, 55], [780, 10], [160, 90],
            [380, 80], [580, 70], [700, 85], [90, 110], [460, 100]
        ];
        starPositions.forEach(([x, y]) => {
            bg.fillRect(x, y, 2, 2);
        });

        // Moon
        const moon = this.add.graphics();
        moon.fillStyle(0xf0e68c, 0.9);
        moon.fillCircle(700, 80, 30);
        moon.fillStyle(0x1a1a4e, 1);
        moon.fillCircle(712, 72, 26);

        // Distant mountains
        const mountains = this.add.graphics();
        mountains.fillStyle(0x1a2840, 1);
        mountains.fillTriangle(0, 400, 100, 200, 200, 400);
        mountains.fillTriangle(150, 400, 280, 180, 400, 400);
        mountains.fillTriangle(350, 400, 480, 220, 600, 400);
        mountains.fillTriangle(550, 400, 680, 190, 800, 400);
        mountains.fillTriangle(700, 400, 800, 240, 900, 400);

        // Battle platform
        const platform = this.add.graphics();
        platform.fillStyle(0x4a3a2a, 1);
        platform.fillEllipse(400, 420, 600, 40);
        platform.fillStyle(0x5a4a3a, 1);
        platform.fillEllipse(400, 416, 580, 30);
    }

    createCombatants() {
        // Player sprite (left side)
        this.playerSprite = this.add.image(200, 320, 'player')
            .setScale(2.5)
            .setOrigin(0.5, 0.8);

        // Player name
        this.add.text(200, 355, 'HERO', {
            fontSize: '14px',
            fill: '#88aaff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Enemy sprite (right side)
        this.enemySprite = this.add.image(600, 300, 'enemy')
            .setScale(2.5)
            .setOrigin(0.5, 0.8);

        // Enemy name
        this.add.text(600, 355, 'DRAGON', {
            fontSize: '14px',
            fill: '#ff8888',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Idle animation for player
        this.tweens.add({
            targets: this.playerSprite,
            y: this.playerSprite.y - 6,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Idle animation for enemy
        this.tweens.add({
            targets: this.enemySprite,
            y: this.enemySprite.y - 8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createAttackButton() {
        const btnX = 200;
        const btnY = 520;

        this.attackBtn = this.add.image(btnX, btnY, 'btn_attack').setInteractive({ useHandCursor: true });

        this.attackBtnText = this.add.text(btnX, btnY, '⚔ ATTACK', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.attackBtn.on('pointerover', () => {
            if (!this.turnInProgress && this.battleActive) {
                this.attackBtn.setTexture('btn_attack_hover');
                this.attackBtnText.setScale(1.05);
            }
        });

        this.attackBtn.on('pointerout', () => {
            this.attackBtn.setTexture('btn_attack');
            this.attackBtnText.setScale(1);
        });

        this.attackBtn.on('pointerdown', () => {
            if (!this.turnInProgress && this.battleActive) {
                this.executeTurn();
            }
        });
    }

    createBattleLog() {
        // Log panel background
        const logBg = this.add.graphics();
        logBg.fillStyle(0x000000, 0.6);
        logBg.fillRoundedRect(390, 460, 390, 120, 6);
        logBg.lineStyle(1, 0x445566, 1);
        logBg.strokeRoundedRect(390, 460, 390, 120, 6);

        this.add.text(585, 470, '— Battle Log —', {
            fontSize: '12px',
            fill: '#778899',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.logLines = [];
        for (let i = 0; i < 4; i++) {
            this.logLines.push(
                this.add.text(400, 488 + i * 22, '', {
                    fontSize: '13px',
                    fill: '#ccddee',
                    fontFamily: 'monospace'
                })
            );
        }

        this.battleMessages = [];
    }

    addLogMessage(msg) {
        this.battleMessages.push(msg);
        const start = Math.max(0, this.battleMessages.length - 4);
        for (let i = 0; i < 4; i++) {
            const idx = start + i;
            this.logLines[i].setText(this.battleMessages[idx] || '');
        }
    }

    executeTurn() {
        this.turnInProgress = true;
        this.attackBtn.setAlpha(0.5);

        // Player attacks enemy
        const playerDmg = Phaser.Math.Between(PLAYER_ATTACK_MIN, PLAYER_ATTACK_MAX);
        this.animateAttack(this.playerSprite, this.enemySprite, () => {
            this.enemyHP = Math.max(0, this.enemyHP - playerDmg);
            this.addLogMessage(`Hero attacks for ${playerDmg} damage!`);
            this.showDamageNumber(600, 280, playerDmg, '#ffee44');
            this.shakeSprite(this.enemySprite);
            this.emitHPUpdate();

            if (this.enemyHP <= 0) {
                this.handleVictory();
                return;
            }

            // Enemy counter-attacks after a delay
            this.time.delayedCall(700, () => {
                const enemyDmg = Phaser.Math.Between(ENEMY_ATTACK_MIN, ENEMY_ATTACK_MAX);
                this.animateAttack(this.enemySprite, this.playerSprite, () => {
                    this.playerHP = Math.max(0, this.playerHP - enemyDmg);
                    this.addLogMessage(`Dragon strikes for ${enemyDmg} damage!`);
                    this.showDamageNumber(200, 260, enemyDmg, '#ff4444');
                    this.shakeSprite(this.playerSprite);
                    this.emitHPUpdate();

                    if (this.playerHP <= 0) {
                        this.handleDefeat();
                        return;
                    }

                    this.addLogMessage('Your turn...');
                    this.turnInProgress = false;
                    this.attackBtn.setAlpha(1);
                });
            });
        });
    }

    animateAttack(attacker, target, onComplete) {
        const origX = attacker.x;
        const targetX = attacker.x < target.x ? attacker.x + 80 : attacker.x - 80;

        this.tweens.add({
            targets: attacker,
            x: targetX,
            duration: 200,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
                attacker.x = origX;
                // Flash effect on target
                this.tweens.add({
                    targets: target,
                    alpha: 0.2,
                    duration: 80,
                    yoyo: true,
                    repeat: 2,
                    onComplete
                });
            }
        });
    }

    shakeSprite(sprite) {
        const origX = sprite.x;
        this.tweens.add({
            targets: sprite,
            x: origX + 8,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => { sprite.x = origX; }
        });
    }

    showDamageNumber(x, y, damage, color) {
        const dmgText = this.add.text(x, y, `-${damage}`, {
            fontSize: '24px',
            fill: color,
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText,
            y: y - 60,
            alpha: 0,
            duration: 900,
            ease: 'Power1',
            onComplete: () => dmgText.destroy()
        });
    }

    emitHPUpdate() {
        this.events.emit('hpUpdate', {
            playerHP: this.playerHP,
            playerMaxHP: this.playerMaxHP,
            enemyHP: this.enemyHP,
            enemyMaxHP: this.enemyMaxHP
        });
    }

    handleVictory() {
        this.battleActive = false;
        this.addLogMessage('Dragon defeated! VICTORY!');

        // Death animation for enemy
        this.tweens.add({
            targets: this.enemySprite,
            alpha: 0,
            y: this.enemySprite.y + 30,
            angle: 45,
            duration: 600,
            ease: 'Power2'
        });

        this.time.delayedCall(700, () => {
            this.showEndScreen(true);
        });
    }

    handleDefeat() {
        this.battleActive = false;
        this.addLogMessage('Hero fell in battle... DEFEAT!');

        this.tweens.add({
            targets: this.playerSprite,
            alpha: 0,
            y: this.playerSprite.y + 30,
            angle: -45,
            duration: 600,
            ease: 'Power2'
        });

        this.time.delayedCall(700, () => {
            this.showEndScreen(false);
        });
    }

    showEndScreen(victory) {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, 800, 600);
        overlay.setAlpha(0);

        this.tweens.add({ targets: overlay, alpha: 1, duration: 400 });

        const color = victory ? '#ffee44' : '#ff4444';
        const msg = victory ? '✦ VICTORY ✦' : '✦ DEFEAT ✦';
        const sub = victory ? 'The dragon has been slain!' : 'You have been defeated...';

        const titleText = this.add.text(400, 220, msg, {
            fontSize: '48px',
            fill: color,
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        const subText = this.add.text(400, 290, sub, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: [titleText, subText], alpha: 1, duration: 500, delay: 300 });

        // Restart button
        const restartBg = this.add.graphics();
        restartBg.fillStyle(0x334466, 1);
        restartBg.fillRoundedRect(290, 340, 220, 50, 8);
        restartBg.lineStyle(2, 0x6688aa, 1);
        restartBg.strokeRoundedRect(290, 340, 220, 50, 8);
        restartBg.setAlpha(0).setInteractive(
            new Phaser.Geom.Rectangle(290, 340, 220, 50),
            Phaser.Geom.Rectangle.Contains
        );

        const restartText = this.add.text(400, 365, '↺  Play Again', {
            fontSize: '20px',
            fill: '#aaccff',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [restartBg, restartText],
            alpha: 1,
            duration: 400,
            delay: 600
        });

        restartBg.on('pointerover', () => {
            restartText.setStyle({ fill: '#ffffff' });
            restartBg.clear();
            restartBg.fillStyle(0x4455aa, 1);
            restartBg.fillRoundedRect(290, 340, 220, 50, 8);
            restartBg.lineStyle(2, 0x88aacc, 1);
            restartBg.strokeRoundedRect(290, 340, 220, 50, 8);
        });

        restartBg.on('pointerout', () => {
            restartText.setStyle({ fill: '#aaccff' });
            restartBg.clear();
            restartBg.fillStyle(0x334466, 1);
            restartBg.fillRoundedRect(290, 340, 220, 50, 8);
            restartBg.lineStyle(2, 0x6688aa, 1);
            restartBg.strokeRoundedRect(290, 340, 220, 50, 8);
        });

        restartBg.on('pointerdown', () => {
            this.scene.stop('UIScene');
            this.scene.restart();
        });
    }

}

import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.wave = 1;
        this.score = 0;
        this.lives = 3;
        this.enemiesKilled = 0;
        this.enemiesPerWave = 10;

        // Start UIScene in parallel
        this.scene.launch('UIScene');

        // Player (simple rectangle as placeholder)
        this.player = this.add.rectangle(400, 500, 40, 40, 0x00BFFF);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Enemies group
        this.enemies = this.physics.add.group();

        // Bullets group
        this.bullets = this.physics.add.group();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Shooting cooldown
        this.lastFired = 0;
        this.fireRate = 300;

        // Spawn timer
        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Draw office floor pattern
        this.createBackground();

        // Collider: bullet hits enemy
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

        // Collider: enemy reaches player
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

        // Wave intro text
        this.showWaveText(1);
    }

    createBackground() {
        const graphics = this.add.graphics();
        // Grid pattern to represent office floor
        graphics.lineStyle(1, 0x3a7a34, 0.4);
        for (let x = 0; x < 800; x += 50) {
            graphics.lineBetween(x, 0, x, 600);
        }
        for (let y = 0; y < 600; y += 50) {
            graphics.lineBetween(0, y, 800, y);
        }
    }

    update(time) {
        // Player movement
        const body = this.player.body;
        body.setVelocity(0);

        if (this.cursors.left.isDown) {
            body.setVelocityX(-250);
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(250);
        }
        if (this.cursors.up.isDown) {
            body.setVelocityY(-250);
        } else if (this.cursors.down.isDown) {
            body.setVelocityY(250);
        }

        // Shooting
        if (Phaser.Input.Keyboard.JustDown(this.fireKey) && time > this.lastFired + this.fireRate) {
            this.fireBullet();
            this.lastFired = time;
        }

        // Clean up off-screen bullets
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.y < -20) {
                bullet.destroy();
            }
        });

        // Clean up enemies that reached the bottom
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.y > 620) {
                enemy.destroy();
                this.loseLife();
            }
        });
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(30, 770);
        const enemy = this.add.rectangle(x, -20, 36, 36, 0xFF4500);
        this.physics.add.existing(enemy);

        // Speed increases with wave
        const speed = 80 + (this.wave * 15);
        enemy.body.setVelocityY(speed);

        this.enemies.add(enemy);

        // Add a label so enemies look like bureaucrats
        this.add.text(x, -20, '📋', { fontSize: '24px' })
            .setOrigin(0.5)
            .setName('label_' + enemy.name);
    }

    fireBullet() {
        const bullet = this.add.rectangle(this.player.x, this.player.y - 30, 6, 18, 0xFFFF00);
        this.physics.add.existing(bullet);
        bullet.body.setVelocityY(-500);
        this.bullets.add(bullet);
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();

        this.score += 10 * this.wave;
        this.enemiesKilled += 1;

        this.scene.get('UIScene').updateScore(this.score);

        // Advance wave after killing enough enemies
        if (this.enemiesKilled >= this.enemiesPerWave) {
            this.enemiesKilled = 0;
            this.enemiesPerWave = Math.floor(this.enemiesPerWave * 1.2);
            this.nextWave();
        }
    }

    playerHit(player, enemy) {
        enemy.destroy();
        this.loseLife();
    }

    loseLife() {
        this.lives -= 1;
        this.scene.get('UIScene').updateLives(this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.spawnTimer.remove();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);

        this.add.rectangle(400, 300, 500, 200, 0x000000, 0.8).setDepth(10);
        this.add.text(400, 260, 'ИГРА ОКОНЧЕНА', {
            fontSize: '48px',
            fill: '#FF0000',
            stroke: '#FFF',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);

        this.add.text(400, 330, 'Счёт: ' + this.score + '\nВолна: ' + this.wave, {
            fontSize: '24px',
            fill: '#FFD700',
            align: 'center'
        }).setOrigin(0.5).setDepth(11);

        this.add.text(400, 400, 'Нажмите R для перезапуска', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(11);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }

    nextWave() {
        this.wave += 1;

        // Оповещаем интерфейс
        this.scene.get('UIScene').updateWave(this.wave);

        // Делаем врагов быстрее с каждой волной (до определенного предела)
        let newDelay = Math.max(1000, 3000 - (this.wave * 200));
        this.spawnTimer.reset({
            delay: newDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Большое оповещение на экране
        let waveText = this.add.text(400, 300, 'ВОЛНА ' + this.wave + '\nБюрократы злеют!', {
            fontSize: '40px',
            fill: '#FF0000',
            align: 'center',
            stroke: '#FFF',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: waveText,
            alpha: 0,
            y: '-=50',
            duration: 3000,
            onComplete: () => waveText.destroy()
        });
    }

    showWaveText(wave) {
        let waveText = this.add.text(400, 300, 'ВОЛНА ' + wave + '\nГотовьтесь!', {
            fontSize: '40px',
            fill: '#00FF00',
            align: 'center',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: waveText,
            alpha: 0,
            y: '-=50',
            duration: 3000,
            onComplete: () => waveText.destroy()
        });
    }
}

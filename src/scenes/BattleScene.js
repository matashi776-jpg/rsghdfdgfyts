import Phaser from 'phaser';
import Calculator from '../utils/Calculator.js';

const DAMAGE_FLASH_DURATION = 100; // ms the enemy flashes red after taking a hit
const BOSS_SPAWN_CHANCE = 0.2;     // 20% probability of spawning a boss on a boss wave

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    preload() {
        // Generate placeholder textures if assets are missing
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Goose (tower) - white bird shape
        graphics.fillStyle(0xffffff);
        graphics.fillEllipse(32, 32, 48, 36);
        graphics.fillCircle(50, 20, 12);
        graphics.fillStyle(0xffa500);
        graphics.fillTriangle(58, 20, 70, 17, 58, 24);
        graphics.generateTexture('goose', 80, 64);
        graphics.clear();

        // Borshch projectile - red circle
        graphics.fillStyle(0xcc0000);
        graphics.fillCircle(16, 16, 14);
        graphics.fillStyle(0xff6666);
        graphics.fillCircle(10, 10, 5);
        graphics.generateTexture('borshch', 32, 32);
        graphics.clear();

        // Bureaucrat enemy - grey rectangle figure
        graphics.fillStyle(0x555566);
        graphics.fillRect(10, 0, 44, 50);
        graphics.fillStyle(0xffcc99);
        graphics.fillCircle(32, 0, 18);
        graphics.fillStyle(0x333355);
        graphics.fillRect(14, 50, 16, 30);
        graphics.fillRect(34, 50, 16, 30);
        graphics.generateTexture('bureaucrat', 64, 80);
        graphics.clear();

        // Background grass
        graphics.fillStyle(0x4a7c3f);
        graphics.fillRect(0, 0, 800, 600);
        graphics.fillStyle(0x5a9e4f);
        for (let i = 0; i < 40; i++) {
            graphics.fillRect(
                Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600),
                Phaser.Math.Between(20, 60), Phaser.Math.Between(10, 30)
            );
        }
        graphics.generateTexture('background', 800, 600);
        graphics.clear();

        graphics.destroy();
    }

    create() {
        // Background
        this.add.image(400, 300, 'background').setDepth(0);

        // Lane lines
        this.lanes = [150, 300, 450];
        this.lanes.forEach(y => {
            this.add.rectangle(400, y, 800, 4, 0x00000033).setDepth(1).setAlpha(0.3);
        });

        // Hut (home base) on the left
        this.add.rectangle(60, 300, 80, 400, 0x8B4513).setDepth(2);
        this.add.text(60, 300, '🏠\nНіка', { fontSize: '20px', align: 'center' }).setOrigin(0.5).setDepth(3);

        // Game state
        this.gold = 100;
        this.wave = 1;
        this.gooseLevel = 1;
        this.gameOver = false;

        // Geese towers (static shooters on the left side)
        this.geese = [];
        this.lanes.forEach((y, i) => {
            let goose = this.physics.add.staticImage(120 + i * 30, y, 'goose')
                .setScale(0.12)
                .setDepth(4);
            goose.baseDamage = 25;
            goose.fireRate = 1500;
            goose.lastFired = 0;
            this.geese.push(goose);
        });

        // Physics groups
        this.projectiles = this.physics.add.group({
            defaultKey: 'borshch',
            maxSize: 50
        });

        this.enemies = this.physics.add.group();

        // Collider
        this.physics.add.overlap(this.projectiles, this.enemies, this.handleHit, null, this);

        // Start UI scene on top
        this.scene.launch('UIScene');

        // Spawn timer
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Wave timer — advance wave every 20 seconds
        this.time.addEvent({
            delay: 20000,
            callback: this.nextWave,
            callbackScope: this,
            loop: true
        });

        // Goose firing loop
        this.time.addEvent({
            delay: 500,
            callback: this.fireGeese,
            callbackScope: this,
            loop: true
        });
    }

    nextWave() {
        if (this.gameOver) return;
        this.wave++;
        this.scene.get('UIScene').updateWave(this.wave);

        // Brief wave announcement
        let txt = this.add.text(400, 200, 'ХВИЛЯ ' + this.wave, {
            fontSize: '40px', fill: '#FFD700', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(150);
        this.tweens.add({ targets: txt, alpha: 0, y: 160, duration: 2000, onComplete: () => txt.destroy() });
    }

    fireGeese() {
        if (this.gameOver) return;
        let now = this.time.now;
        this.geese.forEach(goose => {
            if (now - goose.lastFired > goose.fireRate) {
                goose.lastFired = now;
                this.shootBorshch(goose);
            }
        });
    }

    upgradeGeese() {
        let cost = this.gooseLevel * 50;
        if (this.gold >= cost) {
            this.gold -= cost;
            this.gooseLevel++;
            this.geese.forEach(g => {
                g.baseDamage = Math.floor(g.baseDamage * 1.3);
                g.fireRate = Math.max(500, g.fireRate - 100);
            });
            this.scene.get('UIScene').updateGold(this.gold);
            let txt = this.add.text(400, 280, 'Гуси прокачані! Рівень ' + this.gooseLevel, {
                fontSize: '22px', fill: '#00FF00', fontStyle: 'bold',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(150);
            this.tweens.add({ targets: txt, alpha: 0, y: 240, duration: 2000, onComplete: () => txt.destroy() });
        } else {
            let txt = this.add.text(400, 280, 'Недостатньо золота!', {
                fontSize: '22px', fill: '#FF0000', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(150);
            this.tweens.add({ targets: txt, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
        }
    }

    // --- ИСПРАВЛЕННАЯ СТРЕЛЬБА (Глубина и слои) ---
    shootBorshch(goose) {
        let projectile = this.projectiles.get(goose.x + 30, goose.y, 'borshch');
        if (projectile) {
            projectile.setActive(true).setVisible(true).setScale(0.08);
            projectile.body.reset(goose.x + 30, goose.y);
            projectile.setVelocityX(300);
            projectile.damage = Calculator.getTowerDamage(goose.baseDamage, 1);
            projectile.setDepth(10); // Борщ всегда летит поверх всего

            this.tweens.add({ targets: projectile, angle: 360, duration: 1000, loop: -1 });
        }
    }

    // --- ИСПРАВЛЕННОЕ ПОПАДАНИЕ (Нет двойному урону) ---
    handleHit(projectile, enemy) {
        // Если снаряд или враг уже неактивны - игнорируем (ФИКС БАГА)
        if (!projectile.active || !enemy.active) return;

        enemy.hp -= projectile.damage;

        // Моментально отключаем физику снаряда, чтобы он не ударил дважды
        projectile.disableBody(true, true);

        if (enemy.hp <= 0) {
            // Если это был Босс, даем много золота
            let reward = enemy.isBoss ? 200 : Calculator.getGoldReward(this.wave);
            this.gold += reward;

            let goldText = this.add.text(enemy.x, enemy.y, '+' + reward + ' Gold', { fontSize: '18px', fill: '#00FF00', fontStyle: 'bold' });
            this.tweens.add({ targets: goldText, y: '-=40', alpha: 0, duration: 1200, onComplete: () => goldText.destroy() });

            enemy.disableBody(true, true); // ФИКС: Безопасное удаление врага
            this.time.delayedCall(0, () => enemy.destroy());

            this.scene.get('UIScene').updateGold(this.gold);
        } else {
            // Эффект "мигания" врага при получении урона, если он выжил
            enemy.setTint(0xff0000);
            this.time.delayedCall(DAMAGE_FLASH_DURATION, () => { if (enemy.active) enemy.clearTint(); });
        }
    }

    // --- ПРОДВИНУТЫЙ СПАВН (С Боссами) ---
    spawnEnemy() {
        let y = this.lanes[Phaser.Math.Between(0, 2)];

        // Каждая 5-я волна спавнит Босса с вероятностью 20%
        let isBossWave = (this.wave % 5 === 0);
        let spawnBoss = isBossWave && Math.random() < BOSS_SPAWN_CHANCE;

        let enemy = this.enemies.create(850, y, 'bureaucrat');

        if (spawnBoss) {
            // Настройки Босса
            enemy.setScale(0.3); // Он в два раза больше
            enemy.setTint(0xffa500); // Оранжевый цвет опасности (если нет картинки босса)
            enemy.hp = Calculator.getEnemyHealth(this.wave) * 5; // В 5 раз больше ХП
            enemy.setVelocityX(-15); // Идет очень медленно
            enemy.isBoss = true;

            // Зловещая надпись
            let bossText = this.add.text(400, 100, 'УВАГА: ГОЛОВНИЙ ІНСПЕКТОР!', { fontSize: '30px', fill: '#FF0000', fontStyle: 'bold' }).setOrigin(0.5);
            this.tweens.add({ targets: bossText, alpha: 0, duration: 3000, onComplete: () => bossText.destroy() });
        } else {
            // Обычный заочник
            enemy.setScale(0.15);
            enemy.hp = Calculator.getEnemyHealth(this.wave);
            enemy.setVelocityX(Phaser.Math.Between(-35, -55)); // Немного разная скорость
            enemy.isBoss = false;
        }

        enemy.setDepth(5); // Враги идут поверх травы, но под борщом

        // Фразы бюрократов
        if (Math.random() > 0.7) {
            let phrases = spawnBoss ? ['ДЕ ВСІ ПЕЧАТКИ?!', 'ЗАКРИТИ ХУТІР!'] : ['Де довідка?', 'У нас обід!', 'Форма №404!'];
            let text = this.add.text(enemy.x, enemy.y - 40, phrases[Phaser.Math.Between(0, phrases.length - 1)], {
                fontSize: '12px', color: '#000', backgroundColor: '#FFF', padding: { x: 4, y: 2 }
            }).setOrigin(0.5);

            // Заставляем текст двигаться за врагом
            this.time.addEvent({
                delay: 20,
                repeat: 100,
                callback: () => { if (enemy.active && text.active) { text.x = enemy.x; } else { text.destroy(); } }
            });
            this.time.delayedCall(2000, () => { if (text.active) text.destroy(); });
        }
    }

    update() {
        // Убираем улетевший борщ
        this.projectiles.getChildren().forEach(p => {
            if (p.active && p.x > 850) {
                this.projectiles.killAndHide(p);
                p.disableBody(true, true);
            }
        });

        // Проверка на проигрыш
        this.enemies.getChildren().forEach(e => {
            if (e.active && e.x < 100) {
                this.gameOver = true;
                this.physics.pause(); // Останавливаем всю физику
                this.spawnTimer.remove(); // Отключаем спавн

                // Темный экран поверх всего
                this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setDepth(100);

                this.add.text(400, 250, 'БЮРОКРАТІЯ ПЕРЕМОГЛА\nХутір закрито на інвентаризацію.', {
                    fontSize: '32px', fill: '#FF0000', align: 'center', fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(101);

                // Кнопка Рестарта
                let restartBtn = this.add.text(400, 350, '[ ПОЧАТИ ЗНОВУ ]', {
                    fontSize: '24px', fill: '#FFF', backgroundColor: '#333', padding: { x: 10, y: 5 }
                }).setOrigin(0.5).setDepth(101).setInteractive();

                restartBtn.on('pointerdown', () => {
                    // Чистим UI и перезапускаем битву
                    this.scene.stop('UIScene');
                    this.scene.restart();
                });
            }
        });
    }
}

import Phaser from 'phaser';
import { Calculator } from '../utils/Calculator';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    create() {
        // Зеленый цвет Хутора
        this.cameras.main.setBackgroundColor('#8FBC8F');

        // Стартовые ресурсы
        this.gold = 300;
        this.wave = 1;
        this.lanes = [150, 300, 450];
        this.defenders = []; // Массив всех гусей на поле

        // 1. Ставим Героя (Нику)
        this.hero = this.add.sprite(60, 300, 'hero').setScale(0.2);
        this.tweens.add({
            targets: this.hero, y: '+=8', duration: 2000,
            yoyo: true, loop: -1, ease: 'Sine.easeInOut'
        });

        // 2. Группы для снарядов и врагов
        this.projectiles = this.physics.add.group({ maxSize: 100 });
        this.enemies = this.physics.add.group();

        // 3. Столкновения (Борщ попадает в Бюрократа)
        this.physics.add.overlap(this.projectiles, this.enemies, this.handleHit, null, this);

        // 4. Таймер спавна врагов (Каждые 3 секунды)
        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Запускаем UI параллельно
        this.scene.launch('UIScene');
    }

    // --- ФУНКЦИЯ ИЗ UIScene: ПОСТАВИТЬ ГУСЯ ---
    placeDefender(x, y) {
        // Привязываем Y к ближайшей линии
        let closestLane = this.lanes.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        );

        let goose = this.add.sprite(x, closestLane, 'goose').setScale(0.15);
        goose.fireRate = 1500; // Базовая скорость стрельбы
        goose.baseDamage = 30;

        // Анимация дыхания
        this.tweens.add({
            targets: goose, y: '+=5', duration: 1500,
            yoyo: true, loop: -1, ease: 'Sine.easeInOut'
        });

        // Таймер стрельбы для этого гуся
        goose.shootTimer = this.time.addEvent({
            delay: goose.fireRate,
            callback: () => this.shootBorshch(goose),
            loop: true
        });

        this.defenders.push(goose);
    }

    // --- СТРЕЛЬБА ---
    shootBorshch(goose) {
        let projectile = this.projectiles.get(goose.x + 30, goose.y, 'borshch');
        if (projectile) {
            projectile.setActive(true).setVisible(true).setScale(0.08);
            projectile.body.reset(goose.x + 30, goose.y);
            projectile.setVelocityX(300);
            projectile.damage = Calculator.getTowerDamage(goose.baseDamage, 1);

            this.tweens.add({ targets: projectile, angle: 360, duration: 1000, loop: -1 });
        }
    }

    // --- СПАВН БЮРОКРАТОВ ---
    spawnEnemy() {
        let y = this.lanes[Phaser.Math.Between(0, 2)];
        let enemy = this.enemies.create(850, y, 'bureaucrat').setScale(0.15);

        enemy.hp = Calculator.getEnemyHealth(this.wave);
        enemy.setVelocityX(-40); // Медленно идут к Нике

        // Сатира: Фразы бюрократов
        if (Math.random() > 0.6) {
            let phrases = ['Где справка?', 'У нас обед!', 'Приходите завтра!'];
            let text = this.add.text(enemy.x, enemy.y - 30, phrases[Phaser.Math.Between(0, 2)], { fontSize: '12px', color: '#000', backgroundColor: '#FFF' });
            this.time.delayedCall(2000, () => text.destroy());
        }
    }

    // --- ПОПАДАНИЕ СНАРЯДА ---
    handleHit(projectile, enemy) {
        enemy.hp -= projectile.damage;

        // Безопасное удаление снаряда
        this.projectiles.killAndHide(projectile);
        projectile.body.stop();

        if (enemy.hp <= 0) {
            this.gold += Calculator.getGoldReward(this.wave);

            // Всплывающее золото
            let goldText = this.add.text(enemy.x, enemy.y, '+Gold', { fontSize: '16px', fill: '#00FF00' });
            this.tweens.add({ targets: goldText, y: '-=30', alpha: 0, duration: 1000, onComplete: () => goldText.destroy() });

            // Безопасное удаление врага
            enemy.disableBody(true, true);
            this.time.delayedCall(0, () => enemy.destroy());

            // Обновляем текст в UI
            this.scene.get('UIScene').updateGold(this.gold);
        }
    }

    // --- ЛЕЧЕБНАЯ МАЗЬ (СПОСОБНОСТЬ НИКИ) ---
    applyOintmentBuff() {
        // Ускоряем всех гусей в 2 раза на 5 секунд
        this.defenders.forEach(goose => {
            goose.shootTimer.timeScale = 2.0;
            this.time.delayedCall(5000, () => {
                if (goose.shootTimer) goose.shootTimer.timeScale = 1.0;
            });
        });

        // Визуальный эффект лечения вокруг Ники
        let healText = this.add.text(this.hero.x, this.hero.y - 40, 'Knee Healed!', { fill: '#00FF00', fontSize: '18px' }).setOrigin(0.5);
        this.tweens.add({ targets: healText, y: '-=20', alpha: 0, duration: 1500, onComplete: () => healText.destroy() });
    }

    update() {
        // Убираем снаряды, которые улетели за экран
        this.projectiles.getChildren().forEach(p => {
            if (p.active && p.x > 850) {
                this.projectiles.killAndHide(p);
            }
        });

        // Проверка на проигрыш (Бюрократ дошел до Ники)
        this.enemies.getChildren().forEach(e => {
            if (e.active && e.x < 100) {
                this.scene.pause();
                this.add.text(400, 300, 'БЮРОКРАТИЯ ПОБЕДИЛА\nПриходите завтра...', { fontSize: '40px', fill: '#FF0000', align: 'center' }).setOrigin(0.5);
            }
        });
    }
}

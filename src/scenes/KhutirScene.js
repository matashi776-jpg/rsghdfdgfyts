import Phaser from 'phaser';

export default class KhutirScene extends Phaser.Scene {
    constructor() {
        super({ key: 'KhutirScene' });
    }

    create() {
        // Уютный зеленый фон Хутора
        this.cameras.main.setBackgroundColor('#2E8B57');

        // Главный заголовок
        this.add.text(400, 200, 'ЛАНЧИН VS САВОК', { 
            fontSize: '48px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Подзаголовок
        this.add.text(400, 260, 'Защити Нику и его колено от бюрократов!', { 
            fontSize: '20px', 
            fill: '#FFD700' 
        }).setOrigin(0.5);

        // Кнопка "Начать смену"
        let startBtn = this.add.rectangle(400, 350, 200, 60, 0xFF4500).setInteractive();
        let btnText = this.add.text(400, 350, 'НАЧАТЬ СМЕНУ', { 
            fontSize: '24px', 
            fill: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Эффекты при наведении
        startBtn.on('pointerover', () => startBtn.setFillStyle(0xFF6347));
        startBtn.on('pointerout', () => startBtn.setFillStyle(0xFF4500));

        // Запуск игры по клику
        startBtn.on('pointerdown', () => {
            this.scene.start('BattleScene');
        });

        // Добавим Нику на экран меню для атмосферы (если картинка загружена)
        if (this.textures.exists('hero')) {
            let menuHero = this.add.sprite(150, 400, 'hero').setScale(0.3);
            this.tweens.add({
                targets: menuHero, y: '+=10', duration: 2000, yoyo: true, loop: -1, ease: 'Sine.easeInOut'
            });
        }
    }
}

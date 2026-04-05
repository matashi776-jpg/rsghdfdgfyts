import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Ссылка на основную сцену битвы, чтобы передавать туда гусей
        this.battleScene = this.scene.get('BattleScene');
        
        // Панель интерфейса снизу
        this.add.rectangle(0, 500, 800, 100, 0x333333).setOrigin(0, 0);

        // Текст с золотом и волной
        this.goldText = this.add.text(20, 520, 'Gold: 300', { fontSize: '24px', fill: '#FFD700' });
        this.waveText = this.add.text(20, 560, 'Wave: 1', { fontSize: '24px', fill: '#FFFFFF' });

        // --- КНОПКА ПОКУПКИ ГУСЯ (Drag & Drop) ---
        let gooseIcon = this.add.sprite(200, 550, 'goose').setScale(0.1).setInteractive();
        this.add.text(170, 510, 'Buy: 50g', { fontSize: '16px' });
        
        // Настройка перетаскивания (Drag & Drop)
        this.input.setDraggable(gooseIcon);

        this.input.on('dragstart', (pointer, gameObject) => {
            // Создаем полупрозрачную копию при старте перетаскивания
            this.dragGhost = this.add.sprite(pointer.x, pointer.y, 'goose')
                .setScale(0.15).setAlpha(0.5);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.dragGhost) {
                this.dragGhost.x = pointer.x;
                this.dragGhost.y = pointer.y;
            }
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (this.dragGhost) {
                // Если мы бросили гуся на поле (выше UI панели) и есть золото
                if (pointer.y < 500 && this.battleScene.gold >= 50) {
                    this.battleScene.gold -= 50;
                    this.updateGold(this.battleScene.gold);
                    // Просим BattleScene поставить Гуся на ближайшую линию
                    this.battleScene.placeDefender(pointer.x, pointer.y);
                }
                this.dragGhost.destroy(); // Удаляем призрака
            }
        });

        // --- СПЕЦСПОСОБНОСТЬ "ЛЕЧЕБНАЯ МАЗЬ" ДЛЯ НИКИ ---
        let ointmentBtn = this.add.rectangle(400, 550, 120, 40, 0x2E8B57).setInteractive();
        this.add.text(355, 542, 'Ointment (100g)', { fontSize: '14px', fill: '#FFF' });

        ointmentBtn.on('pointerdown', () => {
            if (this.battleScene.gold >= 100) {
                this.battleScene.gold -= 100;
                this.updateGold(this.battleScene.gold);
                this.battleScene.applyOintmentBuff();
                
                // Анимация нажатия
                this.tweens.add({ targets: ointmentBtn, scale: 0.9, yoyo: true, duration: 100 });
            }
        });
    }

    updateGold(amount) {
        this.goldText.setText('Gold: ' + amount);
    }

    updateWave(wave) {
        this.waveText.setText('Wave: ' + wave);
    }
}

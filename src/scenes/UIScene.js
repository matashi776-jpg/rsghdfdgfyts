import Phaser from 'phaser';

const GOOSE_COST = 100;

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        this.battleScene = this.scene.get('BattleScene');

        // --- Золото ---
        this.goldText = this.add.text(10, 10, `Золото: ${this.battleScene.gold}`, {
            fontSize: '20px',
            fill: '#FFD700',
            backgroundColor: '#000000AA',
            padding: { x: 6, y: 4 }
        });

        // --- Подсказка ---
        this.add.text(10, 45, `[Нажми на поле, чтобы поставить гуся — ${GOOSE_COST}g]`, {
            fontSize: '13px',
            fill: '#FFFFFF',
            backgroundColor: '#000000AA',
            padding: { x: 4, y: 2 }
        });

        // --- Кнопка способности ---
        const btn = this.add.text(700, 10, '💊 Мазь (бесплатно)', {
            fontSize: '16px',
            fill: '#00FF88',
            backgroundColor: '#000000CC',
            padding: { x: 8, y: 4 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.battleScene.applyOintmentBuff();
        });

        // --- Клик по полю для размещения защитника ---
        this.input.on('pointerdown', (pointer) => {
            // Не реагируем на клики по кнопке
            if (pointer.y < 70 && pointer.x > 650) return;

            const battle = this.battleScene;
            if (battle.gold >= GOOSE_COST) {
                battle.gold -= GOOSE_COST;
                battle.placeDefender(pointer.x, pointer.y);
                this.updateGold(battle.gold);
            } else {
                this.showMessage('Недостаточно золота!', '#FF4444');
            }
        });
    }

    updateGold(amount) {
        this.goldText.setText(`Золото: ${amount}`);
    }

    showMessage(msg, color = '#FFFFFF') {
        const text = this.add.text(450, 550, msg, {
            fontSize: '18px',
            fill: color,
            backgroundColor: '#000000BB',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        this.tweens.add({
            targets: text, y: '-=30', alpha: 0, duration: 1200,
            onComplete: () => text.destroy()
        });
    }
}

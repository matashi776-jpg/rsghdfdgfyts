import Phaser from 'phaser';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');

        this.add.text(400, 300, 'БОЙ НАЧИНАЕТСЯ!', {
            fontSize: '40px',
            fill: '#FF4500',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(400, 380, 'Нажми, чтобы вернуться в меню', {
            fontSize: '18px',
            fill: '#AAAAAA'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('KhutirScene');
        });
    }
}

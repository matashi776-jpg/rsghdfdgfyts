import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        this.goldText = this.add.text(10, 10, 'Gold: 100', {
            fontSize: '20px',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setDepth(200);

        this.waveText = this.add.text(10, 36, 'Wave: 1', {
            fontSize: '18px',
            fill: '#FFF',
            stroke: '#000',
            strokeThickness: 3
        }).setDepth(200);

        this.hpText = this.add.text(10, 60, 'HP: 3', {
            fontSize: '18px',
            fill: '#FF4444',
            stroke: '#000',
            strokeThickness: 3
        }).setDepth(200);

        this.upgradeBtn = this.add.text(650, 10, '[ АПГРЕЙД ГУСЕЙ: 50g ]', {
            fontSize: '16px',
            fill: '#FFF',
            backgroundColor: '#444',
            padding: { x: 8, y: 4 }
        }).setDepth(200).setInteractive();

        this.upgradeBtn.on('pointerover', () => this.upgradeBtn.setStyle({ fill: '#FFD700' }));
        this.upgradeBtn.on('pointerout', () => this.upgradeBtn.setStyle({ fill: '#FFF' }));
        this.upgradeBtn.on('pointerdown', () => {
            this.scene.get('BattleScene').upgradeGeese();
        });
    }

    updateGold(gold) {
        if (this.goldText) this.goldText.setText('Gold: ' + gold);
    }

    updateWave(wave) {
        if (this.waveText) this.waveText.setText('Wave: ' + wave);
        const cost = wave * 50;
        if (this.upgradeBtn) this.upgradeBtn.setText('[ АПГРЕЙД ГУСЕЙ: ' + cost + 'g ]');
    }

    updateHP(hp) {
        if (this.hpText) this.hpText.setText('HP: ' + hp);
    }
}

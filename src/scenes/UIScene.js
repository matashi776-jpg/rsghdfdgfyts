import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        this.wave = 1;
        this.score = 0;
        this.lives = 3;

        // Wave text
        this.waveText = this.add.text(16, 16, 'Волна: 1', {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Score text
        this.scoreText = this.add.text(16, 44, 'Счёт: 0', {
            fontSize: '20px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Lives text
        this.livesText = this.add.text(16, 72, 'Жизни: ❤❤❤', {
            fontSize: '20px',
            fill: '#FF4444',
            stroke: '#000000',
            strokeThickness: 3
        });
    }

    updateWave(wave) {
        this.wave = wave;
        this.waveText.setText('Волна: ' + wave);
    }

    updateScore(score) {
        this.score = score;
        this.scoreText.setText('Счёт: ' + score);
    }

    updateLives(lives) {
        this.lives = lives;
        const hearts = '❤'.repeat(Math.max(0, lives));
        this.livesText.setText('Жизни: ' + hearts);
    }
}

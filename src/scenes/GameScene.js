import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.wave = 1;
        this.waveTimerText = null;
        this.waveText = null;
        this.timeUntilNextWave = 30;
    }

    create() {
        // --- UI ---
        this.waveText = this.add.text(16, 16, `Волна: ${this.wave}`, {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });

        this.waveTimerText = this.add.text(16, 56, `Следующая волна через: ${this.timeUntilNextWave}с`, {
            fontSize: '18px',
            fill: '#aaaaff'
        });

        const hint = this.add.text(400, 300, 'Выживите!', {
            fontSize: '48px',
            fill: '#ff4444',
            fontStyle: 'bold'
        });
        hint.setOrigin(0.5);

        // --- СИСТЕМА ВОЛН ---
        // Каждые 30 секунд увеличиваем волну
        this.time.addEvent({
            delay: 30000,
            callback: this.nextWave,
            callbackScope: this,
            loop: true
        });

        // Обновляем счётчик обратного отсчёта каждую секунду
        this.time.addEvent({
            delay: 1000,
            callback: this.updateWaveCountdown,
            callbackScope: this,
            loop: true
        });
    }

    nextWave() {
        this.wave += 1;
        this.timeUntilNextWave = 30;
        this.waveText.setText(`Волна: ${this.wave}`);
        this.showWaveAnnouncement();
    }

    updateWaveCountdown() {
        if (this.timeUntilNextWave > 0) {
            this.timeUntilNextWave -= 1;
        }
        this.waveTimerText.setText(`Следующая волна через: ${this.timeUntilNextWave}с`);
    }

    showWaveAnnouncement() {
        const announcement = this.add.text(400, 300, `ВОЛНА ${this.wave}!`, {
            fontSize: '64px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        announcement.setOrigin(0.5);

        this.tweens.add({
            targets: announcement,
            alpha: 0,
            y: 220,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => announcement.destroy()
        });
    }
}

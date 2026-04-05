import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.wave = 1;
        this.waveTimer = null;
        this.waveTimerText = null;
        this.waveText = null;
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
        this.waveTimer = this.time.addEvent({
            delay: 30000,
            callback: this.nextWave,
            callbackScope: this,
            loop: true
        });
    }

    nextWave() {
        this.wave += 1;
        this.waveText.setText(`Волна: ${this.wave}`);
        this.showWaveAnnouncement();
    }

    update() {
        // Обновляем счётчик обратного отсчёта на основе оставшегося времени волнового таймера
        const remaining = Math.ceil(this.waveTimer.getRemainingSeconds());
        this.waveTimerText.setText(`Следующая волна через: ${remaining}с`);
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

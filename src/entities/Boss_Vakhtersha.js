export default class BossVakhtersha extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "sprites", "boss_vakhtersha");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hp = 600;
        this.speed = 20;
        this.target = scene.player;
        this.phase = 1;
    }

    update() {
        if (!this.active) return;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        if (this.hp < 300 && this.phase === 1) {
            this.phase = 2;
            this.speed = 35;
            this.scene.waveSystem.spawnZombieClerks(2);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;

        if (this.hp <= 0) {
            this.destroy();
            this.scene.fxSystem.spawnBossDeathFX(this.x, this.y);
            this.scene.scene.start("DeathScene");
        }
    }
}

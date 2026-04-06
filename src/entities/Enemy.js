export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 40;
        this.hp = 60;
        this.target = scene.player;
    }

    update() {
        if (!this.active) return;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
    }

    takeDamage(amount) {
        this.hp -= amount;

        if (this.hp <= 0) {
            this.destroy();
            this.scene.fxSystem.spawnDeathFX(this.x, this.y);
        }
    }
}

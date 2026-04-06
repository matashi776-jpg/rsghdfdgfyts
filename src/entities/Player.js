export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "sprites", "player_serhiy_idle");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.speed = 180;
        this.fireRate = 250;
        this.lastShot = 0;

        this.createAnimations(scene);
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "serhiy_idle",
            frames: scene.anims.generateFrameNames("sprites", {
                prefix: "player_serhiy_idle_",
                start: 1,
                end: 4,
                zeroPad: 2
            }),
            frameRate: 6,
            repeat: -1
        });

        scene.anims.create({
            key: "serhiy_walk",
            frames: scene.anims.generateFrameNames("sprites", {
                prefix: "player_serhiy_walk_",
                start: 1,
                end: 6,
                zeroPad: 2
            }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: "serhiy_shoot",
            frames: scene.anims.generateFrameNames("sprites", {
                prefix: "player_serhiy_shoot_",
                start: 1,
                end: 4,
                zeroPad: 2
            }),
            frameRate: 12,
            repeat: 0
        });

        this.play("serhiy_idle");
    }

    update(time, delta) {
        const keys = this.scene.input.keyboard.createCursorKeys();
        const wasd = this.scene.input.keyboard.addKeys("W,A,S,D");

        let vx = 0;
        let vy = 0;

        if (keys.left.isDown || wasd.A.isDown) vx = -this.speed;
        if (keys.right.isDown || wasd.D.isDown) vx = this.speed;
        if (keys.up.isDown || wasd.W.isDown) vy = -this.speed;
        if (keys.down.isDown || wasd.S.isDown) vy = this.speed;

        this.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.play("serhiy_walk", true);
        } else {
            this.play("serhiy_idle", true);
        }

        if (this.scene.input.activePointer.isDown) {
            this.shoot(time);
        }
    }

    shoot(time) {
        if (time < this.lastShot + this.fireRate) return;

        this.lastShot = time;
        this.play("serhiy_shoot", true);

        this.scene.projectileSystem.spawnBullet(this.x, this.y, this.scene.input.activePointer);
    }
}

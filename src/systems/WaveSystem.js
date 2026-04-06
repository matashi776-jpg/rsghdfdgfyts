import ZombieClerk from "../entities/Enemy_ZombieClerk.js";
import Archivarius from "../entities/Enemy_Archivarius.js";
import Inspector from "../entities/Enemy_Inspector.js";
import BossVakhtersha from "../entities/Boss_Vakhtersha.js";

export default class WaveSystem {
    constructor(scene) {
        this.scene = scene;
        this.wave = 1;
        this.enemies = scene.add.group();
    }

    start() {
        this.spawnWave();
    }

    spawnWave() {
        if (this.wave === 1) {
            this.spawnZombieClerks(6);
        }
        if (this.wave === 2) {
            this.spawnZombieClerks(8);
            this.spawnArchivarius(2);
        }
        if (this.wave === 3) {
            this.spawnZombieClerks(10);
            this.spawnArchivarius(3);
            this.spawnInspector(1);
        }
        if (this.wave === 4) {
            this.spawnBoss();
        }
    }

    spawnZombieClerks(count) {
        for (let i = 0; i < count; i++) {
            this.enemies.add(new ZombieClerk(this.scene, 900, 100 + i * 50));
        }
    }

    spawnArchivarius(count) {
        for (let i = 0; i < count; i++) {
            this.enemies.add(new Archivarius(this.scene, 900, 200 + i * 50));
        }
    }

    spawnInspector(count) {
        for (let i = 0; i < count; i++) {
            this.enemies.add(new Inspector(this.scene, 900, 300 + i * 50));
        }
    }

    spawnBoss() {
        this.enemies.add(new BossVakhtersha(this.scene, 900, 360));
    }

    update() {
        if (this.enemies.countActive() === 0) {
            this.wave++;
            this.spawnWave();
        }
    }
}

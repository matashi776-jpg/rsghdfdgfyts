import Enemy from "./Enemy.js";

export default class ZombieClerk extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, "sprites", "enemy_zombie_clerk");
        this.speed = 40;
        this.hp = 60;
    }
}

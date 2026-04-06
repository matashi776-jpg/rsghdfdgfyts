import Enemy from "./Enemy.js";

export default class Archivarius extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, "sprites", "enemy_archivarius");
        this.speed = 30;
        this.hp = 120;
    }
}

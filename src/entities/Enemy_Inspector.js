import Enemy from "./Enemy.js";

export default class Inspector extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, "sprites", "enemy_inspector");
        this.speed = 25;
        this.hp = 180;
    }
}

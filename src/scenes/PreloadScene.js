import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Generate placeholder textures programmatically so the game
        // works without external image assets.
        const generate = (key, color, w, h) => {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, w, h);
            this.textures.addCanvas(key, canvas);
        };

        generate('hero', '#4169E1', 200, 300);       // blue hero
        generate('goose', '#F5F5DC', 160, 200);      // cream goose
        generate('borshch', '#B22222', 60, 60);      // red borshch
        generate('bureaucrat', '#808080', 160, 200); // grey bureaucrat
    }

    create() {
        this.scene.start('BattleScene');
    }
}

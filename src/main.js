import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d5a27',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [GameScene, UIScene]
};

new Phaser.Game(config);

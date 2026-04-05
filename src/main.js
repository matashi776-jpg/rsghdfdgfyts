import Phaser from 'phaser';
import BattleScene from './scenes/BattleScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#4a7c3f',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BattleScene, UIScene]
};

new Phaser.Game(config);

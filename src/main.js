import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import BattleScene from './scenes/BattleScene';
import UIScene from './scenes/UIScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [PreloadScene, BattleScene, UIScene]
};

const game = new Phaser.Game(config);

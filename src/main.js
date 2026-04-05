import Phaser from 'phaser';
import BattleScene from './scenes/BattleScene';
import UIScene from './scenes/UIScene';
import PreloadScene from './scenes/PreloadScene';

const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    backgroundColor: '#8FBC8F',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [PreloadScene, BattleScene, UIScene]
};

new Phaser.Game(config);

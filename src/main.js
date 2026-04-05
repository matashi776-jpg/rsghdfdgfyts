import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import BattleScene from './scenes/BattleScene';
import UIScene from './scenes/UIScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true, // ВАЖНО: делает графику четкой, без размытия
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // Поставь true, если захочешь увидеть зоны столкновений
        }
    },
    scene: [PreloadScene, BattleScene, UIScene]
};

const game = new Phaser.Game(config);

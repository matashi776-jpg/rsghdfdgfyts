import Phaser from 'phaser';
import KhutirScene from './scenes/KhutirScene.js';
import BattleScene from './scenes/BattleScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    scene: [KhutirScene, BattleScene]
};

new Phaser.Game(config);

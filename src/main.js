/**
 * main.js
 * Phaser 3 game entry point — Castle Defense Phase 1.
 */
import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import StoryScene from './scenes/StoryScene.js';
import BattleScene from './scenes/BattleScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 640,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [PreloadScene, MenuScene, StoryScene, BattleScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);

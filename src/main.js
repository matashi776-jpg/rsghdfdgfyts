/**
 * main.js
 * Phaser 3 game entry point — Оборона Ланчина V4.0 NEON PSYCHEDELIC
 */
import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import StoryScene from './scenes/StoryScene.js';
import BattleScene from './scenes/BattleScene.js';
import UIScene from './scenes/UIScene.js';
import PerkScene from './scenes/PerkScene.js';
import CutsceneScene from './scenes/CutsceneScene.js';
import ComicScene from './scenes/ComicScene.js';

const config = {
  type: Phaser.WEBGL,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [PreloadScene, MenuScene, StoryScene, BattleScene, UIScene, PerkScene, CutsceneScene, ComicScene],
};

new Phaser.Game(config);

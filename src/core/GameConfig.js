/**
 * GameConfig.js
 * Central Phaser 3 game configuration — Оборона Ланчина NEON PSYCHEDELIC.
 * Import this in main.js instead of defining config inline.
 */
import Phaser from 'phaser';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import StoryScene from '../scenes/StoryScene.js';
import BattleScene from '../scenes/BattleScene.js';
import UIScene from '../scenes/UIScene.js';
import PerkScene from '../scenes/PerkScene.js';

export const GameConfig = {
  type: Phaser.WEBGL,
  backgroundColor: '#000000',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      fps: 120,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },

  scene: [PreloadScene, MenuScene, StoryScene, BattleScene, UIScene, PerkScene],
};

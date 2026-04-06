/**
 * main.js
 * ACID KHUTIR — Neon Psychedelic Cyber-Folk Defense Game
 * Phaser 3 entry point.
 */
import Phaser from 'phaser';

// Core scenes (always present in registry)
import BootScene    from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene    from './scenes/MenuScene.js';
import StoryScene   from './scenes/StoryScene.js';

// Gameplay scenes
import GameScene    from './scenes/GameScene.js';
import BossScene    from './scenes/BossScene.js';
import DeathScene   from './scenes/DeathScene.js';
import PerkScene    from './scenes/PerkScene.js';
import UIScene      from './scenes/UIScene.js';

// Legacy / kept for compatibility
import BattleScene  from './scenes/BattleScene.js';

import GameConfig from './core/GameConfig.js';

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
    width: GameConfig.WIDTH,
    height: GameConfig.HEIGHT,
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    StoryScene,
    GameScene,
    BossScene,
    DeathScene,
    UIScene,
    PerkScene,
    BattleScene,
  ],
};

new Phaser.Game(config);

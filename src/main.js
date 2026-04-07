/**
 * main.js
 * Phaser 3 game entry point — ACID KHUTIR
 */
import Phaser from 'phaser';
import PreloadScene          from './scenes/PreloadScene.js';
import MenuScene             from './scenes/MenuScene.js';
import StoryScene            from './scenes/StoryScene.js';
import ExploreScene          from './scenes/ExploreScene.js';
import RitualScene           from './scenes/RitualScene.js';
import TacticalBattleScene   from './scenes/TacticalBattleScene.js';
import BattleScene           from './scenes/BattleScene.js';
import UIScene               from './scenes/UIScene.js';
import PerkScene             from './scenes/PerkScene.js';
import GameScene             from './scenes/GameScene.js';
import BossScene             from './scenes/BossScene.js';

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
  scene: [
    PreloadScene,
    MenuScene,
    StoryScene,
    ExploreScene,
    RitualScene,
    TacticalBattleScene,
    BattleScene,
    UIScene,
    PerkScene,
    GameScene,
    BossScene,
  ],
};

new Phaser.Game(config);

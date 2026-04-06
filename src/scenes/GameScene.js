/**
 * GameScene.js
 * Main gameplay scene for ACID KHUTIR.
 * Wires together Player, WaveSystem, PerkSystem, FXSystem, UISystem.
 */
import Player from '../entities/Player.js';
import WaveSystem from '../systems/WaveSystem.js';
import PerkSystem from '../systems/PerkSystem.js';
import FXSystem from '../systems/FXSystem.js';
import UISystem from '../systems/UISystem.js';
import AnimationSystem from '../systems/AnimationSystem.js';
import AudioManager from '../core/AudioManager.js';
import GameConfig from '../core/GameConfig.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    if (this.textures.exists('bg')) {
      this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, GameConfig.PALETTE.DARK_BG).setDepth(0);
    }

    // Systems
    this._audio = new AudioManager(this);
    this._anims = new AnimationSystem(this);
    this._anims.createAll();

    this._player = new Player(this, 200, height / 2);
    this._waves = new WaveSystem(this);
    this._perks = new PerkSystem(this._player);
    this._fx = new FXSystem(this);
    this._ui = new UISystem(this);
    this._ui.create(this._player);

    this._gold = GameConfig.GOLD.START;
    this._cursors = this.input.keyboard.createCursorKeys();

    // Wire wave callbacks
    this.onWaveStart = (wave) => this._onWaveStart(wave);
    this.onWaveComplete = (wave) => this._onWaveComplete(wave);
    this.onEnemyDied = (enemy) => this._onEnemyDied(enemy);
    this.onPlayerDied = () => this._onPlayerDied();
    this.onBossSpawn = (boss) => this._fx.glitchFlash(0xff0055, 400);
    this.onBossPhase2 = () => this._fx.glitchFlash(0xff00aa, 600);

    this._waves.start();
    this._audio.playBGM('bgm');
  }

  _onWaveStart(wave) {
    this._currentWave = wave;
    this._ui.update(this._player, wave, this._gold);
  }

  _onWaveComplete(wave) {
    this.scene.launch('PerkScene', {
      perks: this._perks.getOffering(3),
      onChoice: (perkId) => {
        this._perks.applyPerk(perkId, this);
        this.scene.stop('PerkScene');
      },
    });
  }

  _onEnemyDied(enemy) {
    if (!enemy || !enemy.sprite) return;
    const { x, y } = enemy.sprite;
    this._gold += enemy.goldValue || 5;
    this._fx.enemyDeathFX(x, y);
    this._ui.update(this._player, this._currentWave || 1, this._gold);
  }

  _onPlayerDied() {
    this._audio.stopBGM();
    this._waves.stop();
    this.time.delayedCall(800, () => {
      this.scene.start('DeathScene', { wave: this._currentWave || 1 });
    });
  }

  update(time, delta) {
    if (this._player) this._player.update(this._cursors, time);
    if (this._waves) this._waves.update();
  }

  shutdown() {
    if (this._waves) this._waves.destroy();
    if (this._ui) this._ui.destroy();
    if (this._audio) this._audio.stopBGM();
  }
}

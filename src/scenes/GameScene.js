/**
 * GameScene.js
 * Main gameplay scene for ACID KHUTIR — Stage 1
 */
import WaveSystem      from '../systems/WaveSystem.js';
import ProjectileSystem from '../systems/ProjectileSystem.js';
import FXSystem        from '../systems/FXSystem.js';
import UISystem        from '../systems/UISystem.js';
import PerkSystem      from '../systems/PerkSystem.js';
import Player          from '../entities/Player.js';
import ZombieClerk     from '../entities/ZombieClerk.js';
import Archivarius     from '../entities/Archivarius.js';
import Inspector       from '../entities/Inspector.js';
import RetroEnforcer   from '../entities/RetroEnforcer.js';
import PropagandaHerald from '../entities/PropagandaHerald.js';
import FactoryWarden   from '../entities/FactoryWarden.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.wave      = data?.wave  ?? 1;
    this.score     = data?.score ?? 0;
    this.perks     = data?.perks ?? [];
    this.gameOver  = false;
  }

  create() {
    const { width, height } = this.scale;

    // Background location
    this.add.image(width / 2, height / 2, 'location_khutir_day')
      .setDisplaySize(width, height);

    // Systems
    this.projectileSystem = new ProjectileSystem(this);
    this.fxSystem         = new FXSystem(this);
    this.perkSystem       = new PerkSystem(this);
    this.uiSystem         = new UISystem(this);
    this.waveSystem       = new WaveSystem(this);

    // Player
    this.player = new Player(this, width * 0.15, height * 0.5);

    // Enemy groups
    this.enemies = this.physics.add.group();

    // Collisions
    this.physics.add.overlap(
      this.projectileSystem.bullets,
      this.enemies,
      (bullet, enemy) => {
        this.projectileSystem.onHitEnemy(bullet, enemy);
        this.fxSystem.spawnHit(enemy.x, enemy.y);
      }
    );

    this.physics.add.overlap(
      this.enemies,
      this.player,
      (enemy, player) => {
        player.takeDamage(enemy.contactDamage ?? 10);
        enemy.destroy();
      }
    );

    // Wave complete / game over callbacks
    this.waveSystem.onWaveComplete = () => this._onWaveComplete();
    this.waveSystem.onAllWavesDone = () => this._startBoss();

    // UI overlay
    this.uiSystem.create();

    // Start first wave
    this.waveSystem.startWave(this.wave);

    // Camera fade-in
    this.cameras.main.fadeIn(800);
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.player.update(time, delta);
    this.waveSystem.update(time, delta);
    this.projectileSystem.update(time, delta);
    this.fxSystem.update(time, delta);
    this.uiSystem.update(time, delta);

    // Clean up dead enemies
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      e.update(time, delta);
      if (e.hp <= 0) {
        this.score += e.scoreValue ?? 10;
        this.fxSystem.spawnExplosion(e.x, e.y);
        e.destroy();
      }
    });

    // Player death
    if (this.player.hp <= 0 && !this.gameOver) {
      this._onGameOver();
    }
  }

  spawnEnemy(type, x, y) {
    let enemy;
    const { height } = this.scale;
    const spawnY = y ?? Phaser.Math.Between(100, height - 100);
    const spawnX = x ?? this.scale.width + 60;

    switch (type) {
      case 'archivarius':        enemy = new Archivarius(this, spawnX, spawnY);       break;
      case 'inspector':          enemy = new Inspector(this,   spawnX, spawnY);       break;
      case 'retro_enforcer':     enemy = new RetroEnforcer(this, spawnX, spawnY);     break;
      case 'propaganda_herald':  enemy = new PropagandaHerald(this, spawnX, spawnY);  break;
      case 'factory_warden':     enemy = new FactoryWarden(this, spawnX, spawnY);     break;
      default:                   enemy = new ZombieClerk(this, spawnX, spawnY);       break;
    }

    this.enemies.add(enemy, true);
    return enemy;
  }

  _onWaveComplete() {
    this.wave++;
    this.uiSystem.showWaveBanner(this.wave);
    this.perkSystem.offerPerks();
  }

  _startBoss() {
    this.cameras.main.fadeOut(1200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BossScene', { score: this.score, wave: this.wave });
    });
  }

  _onGameOver() {
    this.gameOver = true;
    this.physics.pause();
    this.uiSystem.showGameOver(this.score);
  }
}

/**
 * BossScene.js
 * Boss encounter scene — Boss Vakhtersha — ACID KHUTIR Stage 1
 */
import FXSystem        from '../systems/FXSystem.js';
import UISystem        from '../systems/UISystem.js';
import ProjectileSystem from '../systems/ProjectileSystem.js';
import Player          from '../entities/Player.js';
import BossVakhtersha  from '../entities/BossVakhtersha.js';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BossScene' });
  }

  init(data) {
    this.score    = data?.score ?? 0;
    this.wave     = data?.wave  ?? 5;
    this.phase    = 1;
    this.gameOver = false;
  }

  create() {
    const { width, height } = this.scale;

    // Boss arena background
    this.add.image(width / 2, height / 2, 'location_boss_arena')
      .setDisplaySize(width, height);

    // Systems
    this.projectileSystem = new ProjectileSystem(this);
    this.fxSystem         = new FXSystem(this);
    this.uiSystem         = new UISystem(this);

    // Player
    this.player = new Player(this, width * 0.15, height * 0.5);

    // Boss
    this.boss = new BossVakhtersha(this, width * 0.78, height * 0.5);

    // Collisions: player bullets → boss
    this.physics.add.overlap(
      this.projectileSystem.bullets,
      this.boss,
      (bullet, boss) => {
        this.projectileSystem.onHitEnemy(bullet, boss);
        this.fxSystem.spawnHit(boss.x, boss.y);
      }
    );

    // Collisions: boss projectiles → player
    this.physics.add.overlap(
      this.boss.projectiles,
      this.player,
      (proj, player) => {
        proj.destroy();
        player.takeDamage(this.boss.projectileDamage ?? 20);
      }
    );

    // Intro cutscene text
    this._playIntro();
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.player.update(time, delta);
    this.boss.update(time, delta);
    this.projectileSystem.update(time, delta);
    this.fxSystem.update(time, delta);
    this.uiSystem.update(time, delta);

    // Phase transition at 50% HP
    if (this.phase === 1 && this.boss.hp <= this.boss.maxHp * 0.5) {
      this.phase = 2;
      this.boss.enterPhase2();
      this.fxSystem.spawnGlitchStorm(this.boss.x, this.boss.y);
      this.cameras.main.shake(600, 0.02);
    }

    // Boss defeated
    if (this.boss.hp <= 0 && !this.gameOver) {
      this._onVictory();
    }

    // Player defeated
    if (this.player.hp <= 0 && !this.gameOver) {
      this._onGameOver();
    }
  }

  _playIntro() {
    const { width, height } = this.scale;
    const text = this.add.text(width / 2, height * 0.2, 'ВАХТЕРША НАДХОДИТЬ!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '48px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets:  text,
      alpha:    1,
      duration: 600,
      yoyo:     true,
      hold:     1200,
      onComplete: () => text.destroy(),
    });

    this.cameras.main.fadeIn(800);
  }

  _onVictory() {
    this.gameOver = true;
    this.physics.pause();

    const { width, height } = this.scale;
    this.fxSystem.spawnExplosion(this.boss.x, this.boss.y);

    this.time.delayedCall(1500, () => {
      this.uiSystem.showVictory(this.score);
    });
  }

  _onGameOver() {
    this.gameOver = true;
    this.physics.pause();
    this.uiSystem.showGameOver(this.score);
  }
}

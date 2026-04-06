/**
 * EnemyManager.js
 * Handles enemy spawning via a Phaser physics group and encapsulates
 * all type/scaling logic so BattleScene stays lean.
 */
import Enemy from './Enemy.js';

export default class EnemyManager {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Spawn a regular enemy of a randomly chosen type, scaled to the current wave.
   * The new sprite is added to scene.enemiesGroup.
   */
  spawnEnemy() {
    const scene = this.scene;
    if (scene.gameOver) return;

    const { height } = scene.scale;
    const roll = Math.random();
    let type;

    if (roll < 0.5)       type = 'enemy_clerk';
    else if (roll < 0.80) type = 'enemy_runner';
    else                  type = 'enemy_tank';

    const y      = Phaser.Math.Between(
      Math.floor(height * 0.18),
      Math.floor(height * 0.82),
    );
    const sprite = scene.enemiesGroup.create(1340, y, type);
    // eslint-disable-next-line no-new
    new Enemy(sprite, type, scene.wave, scene.baseEnemyHP);
  }

  /**
   * Spawn the wave-10 boss enemy.
   * Emits a neon screen flash and speeds up BGM.
   */
  spawnBoss() {
    const scene = this.scene;
    const { width, height } = scene.scale;

    const sprite = scene.enemiesGroup.create(1200, height / 2, 'boss_vakhtersha');
    // eslint-disable-next-line no-new
    new Enemy(sprite, 'boss_vakhtersha', scene.wave, scene.baseEnemyHP);

    scene.bossActive = true;
    scene._bossTitleTxt.setVisible(true);

    // Speed up BGM for boss fight
    const bgm = scene.sound.get('bgm');
    if (bgm) bgm.setRate(1.2);

    // Neon screen flash
    const flash = scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0xff00aa, 0,
    ).setDepth(50);
    scene.tweens.add({
      targets:   flash,
      fillAlpha: 0.45,
      duration:  200,
      yoyo:      true,
      repeat:    2,
    });
  }
}

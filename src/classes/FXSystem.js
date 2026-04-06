/**
 * FXSystem.js
 * Spawns visual effects (death, hit, boss explosions) — Acid Khutir
 * Uses Phaser sprite animations backed by the shared texture atlas.
 */
export default class FXSystem {
  constructor(scene) {
    this.scene = scene;
  }

  spawnDeathFX(x, y) {
    const fx = this.scene.add.sprite(x, y, 'sprites', 'fx_explosion_01');
    fx.play('fx_explosion');
    fx.once('animationcomplete', () => fx.destroy());
  }

  spawnBossDeathFX(x, y) {
    const fx = this.scene.add.sprite(x, y, 'sprites', 'fx_boss_explosion_01');
    fx.play('fx_boss_explosion');
    fx.once('animationcomplete', () => fx.destroy());
  }

  spawnHitFX(x, y) {
    const fx = this.scene.add.sprite(x, y, 'sprites', 'fx_hit_01');
    fx.play('fx_hit');
    fx.once('animationcomplete', () => fx.destroy());
  }
}

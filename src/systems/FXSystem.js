/**
 * FXSystem.js
 * Manages visual effects: glitch, hit-stop, camera shake, neon particles.
 */
export default class FXSystem {
  constructor(scene) {
    this.scene = scene;
  }

  hitStop(duration = 80) {
    this.scene.physics.pause();
    this.scene.time.delayedCall(duration, () => {
      if (this.scene.physics) this.scene.physics.resume();
    });
  }

  cameraShake(intensity = 0.012, duration = 200) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  glitchFlash(color = 0xff00aa, duration = 120) {
    const { width, height } = this.scene.scale;
    const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, color, 0.35).setDepth(99);
    this.scene.time.delayedCall(duration, () => flash.destroy());
  }

  spawnParticles(x, y, texKey = 'particle_neon_pink', count = 12) {
    if (!this.scene.textures.exists(texKey)) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Phaser.Math.Between(80, 200);
      const p = this.scene.add.image(x, y, texKey).setDepth(15).setScale(0.6);
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: Phaser.Math.Between(300, 600),
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  enemyDeathFX(x, y) {
    this.spawnParticles(x, y, 'particle_neon_green', 10);
    this.cameraShake(0.006, 120);
  }

  bossDeathFX(x, y) {
    this.glitchFlash(0xff00aa, 300);
    this.spawnParticles(x, y, 'particle_neon_pink', 30);
    this.cameraShake(0.025, 400);
  }
}

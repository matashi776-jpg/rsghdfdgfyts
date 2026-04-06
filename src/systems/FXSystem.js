/**
 * FXSystem.js
 * Manages visual effects for ACID KHUTIR — Stage 1
 */
export default class FXSystem {
  constructor(scene) {
    this.scene = scene;
  }

  spawnHit(x, y) {
    this._flash(x, y, 0xff69b4, 'fx_hit_pink');
  }

  spawnExplosion(x, y) {
    this._flash(x, y, 0xff9900, 'fx_explosion_pysanka');
    this.scene.cameras.main.shake(200, 0.01);
  }

  spawnGlitchStorm(x, y) {
    this._flash(x, y, 0x8800ff, 'fx_boss_glitch_storm');
    this.scene.cameras.main.flash(300, 128, 0, 255);
  }

  /** Generic single-frame burst */
  _flash(x, y, tint, textureKey) {
    const img = this.scene.add.image(x, y, textureKey).setScale(1.2);
    if (!this.scene.textures.exists(textureKey)) {
      img.destroy();
      this._drawFallback(x, y, tint);
      return;
    }
    img.setTint(tint);
    this.scene.tweens.add({
      targets:  img,
      alpha:    0,
      scaleX:   2,
      scaleY:   2,
      duration: 350,
      ease:     'Power2',
      onComplete: () => img.destroy(),
    });
  }

  _drawFallback(x, y, color) {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(color, 0.8);
    gfx.fillCircle(x, y, 18);
    this.scene.tweens.add({
      targets:  gfx,
      alpha:    0,
      duration: 300,
      onComplete: () => gfx.destroy(),
    });
  }

  update() {}
}

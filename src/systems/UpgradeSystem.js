/**
 * UpgradeSystem.js
 * Encapsulates house-upgrade logic and modifier management for BattleScene.
 *
 * Depends on scene properties:
 *   scene.house, scene.houseLevel, scene.houseHP, scene.houseMaxHP,
 *   scene.modifiers
 */
export default class UpgradeSystem {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Upgrade the house to the next tier.
   * House tiers:
   *   1 – Затишна Хата  (2 000 HP, magenta tint)
   *   2 – Цегляний Дім  (5 000 HP, cyan tint)
   *   3 – КІБЕР-ФОРТЕЦЯ (12 000 HP, pink tint + attack-speed bonus)
   */
  upgradeHouse() {
    const scene = this.scene;
    if (scene.houseLevel >= 3) return;

    scene.houseLevel++;
    scene.house.setTexture(`house_${scene.houseLevel}`);

    if (scene.houseLevel === 2) {
      scene.houseMaxHP = 5000;
      scene.house.setTint(0x00ffff);
    } else if (scene.houseLevel === 3) {
      scene.houseMaxHP = 12000;
      scene.house.setTint(0xff00aa);
      // Tier-3 bonus: auto-turret mode — halve the attack-speed modifier floor
      scene.modifiers.attackSpeed = Math.max(0.1, scene.modifiers.attackSpeed - 0.35);
      this._spawnUpgradeParticles();
    }

    // Restore to full HP on upgrade
    scene.houseHP = scene.houseMaxHP;

    // Grow the house sprite slightly each tier
    const newW = 100 + (scene.houseLevel - 1) * 10;
    const newH = 200 + (scene.houseLevel - 1) * 20;
    scene.house.setDisplaySize(newW, newH);
    scene.house.refreshBody();
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _spawnUpgradeParticles() {
    const scene = this.scene;
    const em = scene.add.particles(scene.house.x, scene.house.y, 'particle_neon_cyan', {
      speed:    { min: 60, max: 300 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 400, max: 900 },
      angle:    { min: 0,   max: 360 },
      tint:     [0x00ffff, 0xff00aa, 0xffff00],
      emitting: false,
    }).setDepth(15);

    em.explode(40, scene.house.x, scene.house.y);
    scene.time.delayedCall(1000, () => { if (em.active) em.destroy(); });
  }
}

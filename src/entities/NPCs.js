/**
 * NPCs.js
 * Friendly NPCs: Бабця-цілителька та Михась-механік.
 */
export class NPC_Babtsya {
  constructor(scene, x, y) {
    this.scene = scene;
    this.type = 'babtsya_healer';
    const texKey = scene.textures.exists('npc_babtsya') ? 'npc_babtsya' : '__DEFAULT';
    this.sprite = scene.add.image(x, y, texKey).setDepth(7);
    scene.tweens.add({
      targets: this.sprite,
      y: y + 5,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  heal(player, amount = 20) {
    player.heal(amount);
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

export class NPC_Mykhas {
  constructor(scene, x, y) {
    this.scene = scene;
    this.type = 'mykhas_mechanic';
    const texKey = scene.textures.exists('npc_mykhas') ? 'npc_mykhas' : '__DEFAULT';
    this.sprite = scene.add.image(x, y, texKey).setDepth(7);
    scene.tweens.add({
      targets: this.sprite,
      angle: 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  upgradeFireRate(player, amount = 50) {
    player.fireRate = Math.max(100, player.fireRate - amount);
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

/**
 * PerkSystem.js
 * Manages perk selection and application — Acid Khutir
 */
export default class PerkSystem {
  constructor(scene) {
    this.scene = scene;
    this.perks = [];
    this.availablePerks = [
      'golden_coupon',
      'radioactive_beet',
      'iron_seal',
    ];
  }

  showPerkSelection() {
    const choices = Phaser.Utils.Array.Shuffle([...this.availablePerks]).slice(0, 3);

    this.scene.uiSystem.showPerkCards(choices, (selected) => {
      this.applyPerk(selected);
    });
  }

  applyPerk(perk) {
    if (perk === 'golden_coupon') {
      this.scene.player.goldMultiplier = (this.scene.player.goldMultiplier || 1) * 1.25;
    }

    if (perk === 'radioactive_beet') {
      this.scene.player.poisonDamage = (this.scene.player.poisonDamage || 0) + 5;
    }

    if (perk === 'iron_seal') {
      this.scene.player.armor = (this.scene.player.armor || 0) + 10;
    }

    this.perks.push(perk);
  }
}

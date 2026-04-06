/**
 * PerkSystem.js
 * Manages perk card selection between waves — ACID KHUTIR Stage 1
 */

const PERKS = [
  { id: 'damage_up',   label: '+25% Урон',           apply: (scene) => { scene.projectileSystem.damage *= 1.25; } },
  { id: 'speed_up',    label: '+20% Швидкість',       apply: (scene) => { scene.player.speed        *= 1.20; } },
  { id: 'hp_restore',  label: 'Відновити 30% HP',     apply: (scene) => { scene.player.hp = Math.min(scene.player.maxHp, scene.player.hp + scene.player.maxHp * 0.3); } },
  { id: 'fire_rate',   label: '+30% Швидкість вогню', apply: (scene) => { scene.player.fireRate    *= 0.70; } },
  { id: 'shield',      label: 'Тимчасовий щит (10s)', apply: (scene) => { scene.player.shieldUntil  = scene.time.now + 10000; } },
];

export default class PerkSystem {
  constructor(scene) {
    this.scene    = scene;
    this._overlay = null;
  }

  offerPerks() {
    const { width, height } = this.scene.scale;

    // Pause wave logic
    this.scene.physics.pause();

    // Dark overlay
    this._overlay = this.scene.add.rectangle(
      width / 2, height / 2, width, height, 0x000000, 0.75
    ).setDepth(80).setInteractive();

    this.scene.add.text(width / 2, height * 0.2, 'ОБЕРИ ПЕРК', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '48px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(81);

    // Pick 3 random perks
    const pool    = Phaser.Utils.Array.Shuffle([...PERKS]).slice(0, 3);
    const spacing = width / 4;

    pool.forEach((perk, i) => {
      const cx = spacing * (i + 1);
      const cy = height * 0.55;

      const card = this.scene.add.image(cx, cy, 'ui_perk_card')
        .setDepth(81)
        .setInteractive({ useHandCursor: true });

      const label = this.scene.add.text(cx, cy, perk.label, {
        fontFamily: 'Arial Black, Arial',
        fontSize:   '22px',
        color:      '#ffffff',
        align:      'center',
        wordWrap:   { width: 160 },
      }).setOrigin(0.5).setDepth(82);

      card.on('pointerover', () => card.setTint(0xffff00));
      card.on('pointerout',  () => card.clearTint());
      card.on('pointerdown', () => this._selectPerk(perk));
    });
  }

  _selectPerk(perk) {
    perk.apply(this.scene);

    // Remove overlay and cards
    this.scene.children.getAll().forEach(child => {
      if (child.depth >= 80) child.destroy();
    });

    this.scene.physics.resume();
    this.scene.waveSystem.startWave(this.scene.wave);
  }
}

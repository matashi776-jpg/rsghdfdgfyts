/**
 * UISystem.js
 * In-scene HUD helper — HP, wave counter, and perk card overlay — Acid Khutir
 */
export default class UISystem {
  constructor(scene) {
    this.scene = scene;

    this.hpText = scene.add.text(20, 20, 'HP: 100', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color: '#00ffcc',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(20);

    this.waveText = scene.add.text(20, 60, 'Wave: 1', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(20);
  }

  updateHP(value) {
    this.hpText.setText('HP: ' + value);
  }

  updateWave(value) {
    this.waveText.setText('Wave: ' + value);
  }

  showPerkCards(perks, callback) {
    const cards = [];

    perks.forEach((perk, i) => {
      const card = this.scene.add
        .text(300 + i * 300, 300, perk.toUpperCase(), {
          fontSize: '48px',
          fontFamily: 'Arial Black, Arial',
          color: '#00ffff',
          backgroundColor: '#000000aa',
          padding: { x: 20, y: 20 },
        })
        .setInteractive({ useHandCursor: true })
        .setDepth(30);

      card.on('pointerdown', () => {
        cards.forEach((c) => c.destroy());
        callback(perk);
      });

      cards.push(card);
    });
  }
}

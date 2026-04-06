/**
 * UIScene.js
 * HUD overlay running on top of BattleScene.
 * Displays: money, wave counter, house HP (redundant visual), boss HP bar label,
 * and an upgrade button for the house wall.
 * All text is in Ukrainian.
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width } = this.scale;

    // ── Money display (top-right) ────────────────────────────────────────────
    this._moneyTxt = this.add.text(width - 20, 10, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '22px',
      color:      '#ffdd44',
    }).setOrigin(1, 0).setStroke('#000000', 5).setDepth(20);

    // ── Wave display (top-right, below money) ────────────────────────────────
    this._waveTxt = this.add.text(width - 20, 40, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '17px',
      color:      '#aaffaa',
    }).setOrigin(1, 0).setStroke('#000000', 4).setDepth(20);

    // ── House upgrade button (bottom-left area) ──────────────────────────────
    this._upgradeBtn = this.add.text(80, 648, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '15px',
      color:      '#ffffff',
      backgroundColor: '#224422',
      padding: { x: 10, y: 5 },
    }).setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });

    this._upgradeBtn.on('pointerover', () => {
      if (!this._isBattlePaused()) this._upgradeBtn.setColor('#ffff88');
    });
    this._upgradeBtn.on('pointerout', () => {
      this._upgradeBtn.setColor('#ffffff');
    });
    this._upgradeBtn.on('pointerdown', () => {
      if (this._isBattlePaused()) return;
      const battle = this.scene.get('BattleScene');
      if (!battle) return;
      const cost = this._upgradeCost(battle.houseLevel);
      if (cost > 0 && battle.money >= cost && battle.houseLevel < 3) {
        battle.money -= cost;
        battle.upgradeHouse();
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _isBattlePaused() {
    return this.scene.isPaused('BattleScene');
  }

  _upgradeCost(currentLevel) {
    if (currentLevel === 1) return 200;
    if (currentLevel === 2) return 500;
    return 0; // max level
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update() {
    const battle = this.scene.get('BattleScene');
    if (!battle || battle.gameOver) return;

    // Money
    this._moneyTxt.setText(`💰 ${battle.money} грн`);

    // Wave counter
    this._waveTxt.setText(`Хвиля ${battle.wave} / 10`);

    // Upgrade button
    const lvl  = battle.houseLevel;
    const cost = this._upgradeCost(lvl);
    if (lvl >= 3) {
      this._upgradeBtn.setText('Хутір: МАКСИМУМ');
    } else {
      const canAfford = battle.money >= cost;
      this._upgradeBtn
        .setText(`Покращити Хутір (${cost} грн)`)
        .setColor(canAfford ? '#aaffaa' : '#ff8888');
    }
  }
}

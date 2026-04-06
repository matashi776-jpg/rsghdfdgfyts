/**
 * UISystem.js
 * Manages in-game HUD for ACID KHUTIR — Stage 1
 */
export default class UISystem {
  constructor(scene) {
    this.scene = scene;
    this._hpBarBg  = null;
    this._hpBarFg  = null;
    this._waveTxt  = null;
    this._scoreTxt = null;
  }

  create() {
    const { width } = this.scene.scale;

    // HP bar background
    this._hpBarBg = this.scene.add.image(160, 28, 'ui_hp_bar')
      .setDisplaySize(300, 28)
      .setTint(0x333333)
      .setDepth(10);

    // HP bar fill (overlay) — starts at left edge of background (160 - 300/2 = 10)
    this._hpBarFg = this.scene.add.rectangle(10, 28, 296, 24, 0xff0044)
      .setOrigin(0, 0.5)
      .setDepth(11);

    // Wave counter
    this._waveTxt = this.scene.add.image(width / 2, 28, 'ui_wave_counter')
      .setDepth(10);
    this._waveLabel = this.scene.add.text(width / 2, 28, 'ХВИЛЯ 1', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '20px',
      color:      '#ffffff',
    }).setOrigin(0.5).setDepth(12);

    // Score
    this._scoreTxt = this.scene.add.text(width - 20, 16, 'ОЧКИ: 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '18px',
      color:      '#ffee00',
    }).setOrigin(1, 0).setDepth(12);
  }

  update() {
    const player = this.scene.player;
    if (!player) return;

    // Update HP bar fill width
    const ratio = Math.max(0, player.hp / player.maxHp);
    this._hpBarFg?.setDisplaySize(296 * ratio, 24);

    // Update wave label
    this._waveLabel?.setText(`ХВИЛЯ ${this.scene.wave ?? 1}`);

    // Update score
    this._scoreTxt?.setText(`ОЧКИ: ${this.scene.score ?? 0}`);
  }

  showWaveBanner(wave) {
    const { width, height } = this.scene.scale;
    const txt = this.scene.add.text(width / 2, height * 0.4, `ХВИЛЯ ${wave}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '72px',
      color:      '#00ffff',
      stroke:     '#ff00ff',
      strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0).setDepth(50);

    this.scene.tweens.add({
      targets:  txt,
      alpha:    1,
      duration: 400,
      yoyo:     true,
      hold:     900,
      onComplete: () => txt.destroy(),
    });
  }

  showGameOver(score) {
    const { width, height } = this.scene.scale;
    this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(60);
    this.scene.add.text(width / 2, height * 0.38, 'КІНЕЦЬ ГРИ', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '72px',
      color:      '#ff0000',
    }).setOrigin(0.5).setDepth(61);
    this.scene.add.text(width / 2, height * 0.55, `ОЧКИ: ${score}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '36px',
      color:      '#ffffff',
    }).setOrigin(0.5).setDepth(61);

    const restart = this.scene.add.text(width / 2, height * 0.7, '[ ГРАТИ ЗНОВУ ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '28px',
      color:      '#ffee00',
    }).setOrigin(0.5).setDepth(61).setInteractive({ useHandCursor: true });
    restart.on('pointerdown', () => this.scene.scene.start('MenuScene'));
  }

  showVictory(score) {
    const { width, height } = this.scene.scale;
    this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(60);
    this.scene.add.text(width / 2, height * 0.35, 'ПЕРЕМОГА!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '80px',
      color:      '#ffee00',
      stroke:     '#ff00ff',
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(61);
    this.scene.add.text(width / 2, height * 0.52, `ОЧКИ: ${score}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '40px',
      color:      '#00ffff',
    }).setOrigin(0.5).setDepth(61);

    const menu = this.scene.add.text(width / 2, height * 0.68, '[ У МЕНЮ ]', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '28px',
      color:      '#ffffff',
    }).setOrigin(0.5).setDepth(61).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.scene.start('MenuScene'));
  }
}

/**
 * BattleScene.js
 * Castle Defense engine — Phase 1.
 */
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init() {
    this.wallMaxHP = 3000;
    this.wallHP    = 3000;
    this.gameOver  = false;
  }

  create() {
    const { width, height } = this.scale;

    // Environment — no grid, no lanes
    this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);

    // The Wall — invisible static physics body
    this.theWall = this.physics.add.staticImage(180, 320, null).setSize(40, 640);

    // Health bar graphics object (drawn each frame)
    this._hpGfx = this.add.graphics();
    this.drawHealthBar();

    // Enemy group
    this.enemiesGroup = this.physics.add.group();

    // Spawn a dummy enemy_clerk every 3000ms
    this._spawnTimer = this.time.addEvent({
      delay: 3000,
      loop: true,
      callbackScope: this,
      callback: this._spawnClerk,
    });
    // Spawn one immediately
    this._spawnClerk();

    // Siege collider: enemies stop and start attacking when they touch the wall
    this.physics.add.overlap(
      this.enemiesGroup,
      this.theWall,
      (enemy) => {
        enemy.body.setVelocityX(0);
        enemy.isAttackingWall = true;
      }
    );

    // Game Over text (hidden until triggered)
    this._gameOverText = this.add.text(width / 2, height / 2, 'СТЕНА РАЗРУШЕНА!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '56px',
      color: '#ff0000',
    })
      .setOrigin(0.5)
      .setStroke('#000000', 10)
      .setVisible(false);

    // Launch blank UI layer
    this.scene.launch('UIScene');
  }

  // ─── Health Bar ───────────────────────────────────────────────────────────────

  drawHealthBar() {
    const BAR_X  = 140;
    const BAR_Y  = 10;
    const BAR_W  = 80;
    const BAR_H  = 18;
    const ratio  = Math.max(0, this.wallHP / this.wallMaxHP);

    this._hpGfx.clear();
    // Red background
    this._hpGfx.fillStyle(0xff0000, 1);
    this._hpGfx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
    // Green fill
    this._hpGfx.fillStyle(0x00cc44, 1);
    this._hpGfx.fillRect(BAR_X, BAR_Y, BAR_W * ratio, BAR_H);
    // Border
    this._hpGfx.lineStyle(2, 0xffffff, 1);
    this._hpGfx.strokeRect(BAR_X, BAR_Y, BAR_W, BAR_H);
  }

  // ─── Spawn ────────────────────────────────────────────────────────────────────

  _spawnClerk() {
    const enemy = this.enemiesGroup.create(950, 400, 'enemy_clerk');
    enemy.setDisplaySize(48, 64);
    enemy.body.setVelocityX(-40);
    enemy.isAttackingWall = false;
  }

  // ─── Update ───────────────────────────────────────────────────────────────────

  update() {
    if (this.gameOver) return;

    // Damage loop
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (enemy.isAttackingWall) {
        this.wallHP -= 1;
        this.drawHealthBar();
      }
    }

    if (this.wallHP <= 0) {
      this.wallHP = 0;
      this.gameOver = true;
      this._spawnTimer.remove();
      this._gameOverText.setVisible(true);
      this.cameras.main.shake(800, 0.02);
    }
  }
}

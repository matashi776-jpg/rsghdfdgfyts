/**
 * GameScene.js
 * Main playable scene for ACID KHUTIR — Level 1.
 * Wires together Player, WaveSystem, the khata (house), and the UI overlay.
 */
import Player from '../entities/Player.js';
import WaveSystem from '../systems/WaveSystem.js';

/** Fraction of enemy damage applied to the house per frame on contact. */
const HOUSE_DAMAGE_MULTIPLIER = 0.05;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  init() {
    this._gameOver = false;
    this._victory = false;
    this.houseMaxHP = 500;
    this.houseHP = 500;
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // Background — neon-tinted
    this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setTint(0x220044);

    // Khata (house / wall) on the left
    this._khata = this.physics.add.staticImage(80, height / 2, 'house_1');
    this._khata.setDisplaySize(90, 180);
    this._khata.setTint(0xff88ff);
    this._khata.refreshBody();

    // Physics groups
    this.enemiesGroup     = this.physics.add.group();
    this.projectilesGroup = this.physics.add.group();

    // Player (Сергій)
    this.player = new Player(this, 300, height / 2);

    // Wave system
    this.waveSystem = new WaveSystem(this);

    // Colliders
    this.physics.add.overlap(
      this.enemiesGroup,
      this._khata,
      (enemySprite) => this._enemyHitsKhata(enemySprite),
      null,
      this,
    );

    this.physics.add.overlap(
      this.projectilesGroup,
      this.enemiesGroup,
      (bullet, enemySprite) => this._bulletHitsEnemy(bullet, enemySprite),
      null,
      this,
    );

    // UI overlay (neon HUD)
    this._createHUD();

    // Event listeners from WaveSystem
    this.events.on('waveStart', (n) => {
      this._waveLabel.setText(`ХВИЛЯ ${n}`);
    });
    this.events.on('bossStart', () => {
      this._waveLabel.setText('МІНІ-БОС!').setColor('#ff0000');
    });

    // Start wave 1
    this.waveSystem.start();
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this._gameOver || this._victory) return;
    this.player.update(time, delta);
    this.waveSystem.update(time, delta);
    this._updateKhataHPBar();
  }

  // ── Callbacks ────────────────────────────────────────────────────────────────

  onPlayerDied() {
    this._endGame(false);
  }

  onEnemyDied(enemy) {
    this.waveSystem.onEnemyDied(enemy);

    // Check victory: mini-boss dead
    if (enemy.type === 'mini_vakhtersha') {
      this._endGame(true);
    }
  }

  onEnemySpawned(_enemy) {
    // Enemy sprite is already added to enemiesGroup by WaveSystem.
    // Additional per-enemy setup (e.g. sounds) can go here.
  }

  _enemyHitsKhata(enemySprite) {
    const enemy = enemySprite.enemyRef;
    if (!enemy || !enemy.alive) return;

    const dmg = enemy.damage || 10;
    this.houseHP = Math.max(0, this.houseHP - dmg * HOUSE_DAMAGE_MULTIPLIER);

    if (this.houseHP <= 0) {
      this._endGame(false);
    }
  }

  _bulletHitsEnemy(bullet, enemySprite) {
    if (!bullet.active) return;
    bullet.destroy();

    const enemy = enemySprite.enemyRef;
    if (!enemy || !enemy.alive) return;

    const dmg = bullet.playerDamage || this.player.damage;
    enemy.hp -= dmg;
    enemySprite.hp = enemy.hp;

    if (enemy.hp <= 0) {
      enemy.alive = false;
      this.scene.tweens.add({
        targets: enemySprite,
        alpha: 0,
        angle: 120,
        y: enemySprite.y + 50,
        duration: 400,
        ease: 'Power2',
        onComplete: () => { enemySprite.destroy(); },
      });
      this.onEnemyDied(enemy);
    }
  }

  // ── HUD ──────────────────────────────────────────────────────────────────────

  _createHUD() {
    const { width, height } = this.scale;

    // Wave label — pysanka-framed style
    this._waveLabel = this.add.text(width / 2, 32, 'ХВИЛЯ 1', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    // Khata HP bar background
    this._khataHPBg = this.add.rectangle(120, height - 30, 200, 16, 0x220022).setDepth(20);
    this._khataHPFill = this.add.rectangle(20, height - 30, 200, 12, 0x00ff88).setDepth(21).setOrigin(0, 0.5);
    this.add.text(20, height - 50, 'ХАТА', {
      fontFamily: 'Arial', fontSize: '12px', color: '#ff00ff',
    }).setDepth(21);
  }

  _updateKhataHPBar() {
    const ratio = Math.max(0, this.houseHP / this.houseMaxHP);
    this._khataHPFill.width = 200 * ratio;
    this._khataHPFill.setFillStyle(ratio > 0.5 ? 0x00ff88 : ratio > 0.25 ? 0xffaa00 : 0xff2200);
  }

  // ── End Game ─────────────────────────────────────────────────────────────────

  _endGame(won) {
    if (this._gameOver || this._victory) return;
    this._victory  = won;
    this._gameOver = !won;

    const { width, height } = this.scale;
    const msg  = won ? 'ПЕРЕМОГА!' : 'ПОРАЗКА';
    const col  = won ? '#00ff88'   : '#ff2200';

    this.add.text(width / 2, height / 2, msg, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: col,
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(30);

    this.time.delayedCall(3000, () => {
      this.scene.start('MenuScene');
    });
  }
}

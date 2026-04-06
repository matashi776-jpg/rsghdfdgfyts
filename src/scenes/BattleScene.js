/**
 * BattleScene.js
 * Dynamic battle engine — Оборона Ланчина V4.0 NEON PSYCHEDELIC
 *
 * Changes from V3:
 *  - Wave duration: 80 s (was 60 s)
 *  - Enemy scaling: +30% HP and +10% speed per wave
 *  - Boss appearance: bgm.setRate(1.2)
 *  - Neon projectile trails (pink/orange additive particles)
 *  - House tiers with gameplay bonuses
 *  - Neon visual style throughout
 *
 * V4.1 refactor — systems extracted to:
 *  - WaveSystem (wave progression & enemy spawning)
 *  - CollisionSystem (overlap handlers)
 *  - UpgradeSystem (house upgrade logic)
 *  - EnemyManager (enemy pool)
 *  - BulletPool (projectile pool)
 *  - Player (defender entity with StateMachine)
 */
import EnemyManager   from '../entities/EnemyManager.js';
import BulletPool     from '../entities/BulletPool.js';
import Player         from '../entities/Player.js';
import WaveSystem     from '../systems/WaveSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import UpgradeSystem  from '../systems/UpgradeSystem.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init() {
    this.wave          = 1;
    this.houseLevel    = 1;
    this.baseEnemyHP   = 100;
    this.money         = 50;
    this.gameOver      = false;
    this.bossActive    = false;
    this.waveActive    = false;
    this._waveElapsed  = 0;
    this._waveDuration = 80000; // 80 seconds per wave
    this.modifiers     = {
      damage:        1,
      passiveIncome: 1,
      attackSpeed:   1,
      wallDefense:   1,
    };
    this.houseMaxHP = 2000;
    this.houseHP    = 2000;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // Neon-tinted background
    this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setTint(0x8800ff);

    // Scanline overlay for cyber feel
    const scanlines = this.add.graphics().setAlpha(0.07).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineStyle(1, 0x00ffff, 1);
      scanlines.moveTo(0, y);
      scanlines.lineTo(width, y);
    }
    scanlines.strokePath();

    // ── The Wall (House) ────────────────────────────────────────────────────
    this.house = this.physics.add.staticImage(150, 360, 'house_1');
    this.house.setDisplaySize(100, 200);
    this.house.setTint(0xff88ff);
    this.house.refreshBody();

    // ── Physics groups ──────────────────────────────────────────────────────
    this.enemiesGroup     = this.physics.add.group();

    // ── Systems & entities ──────────────────────────────────────────────────
    this.bulletPool       = new BulletPool(this);
    /** Expose bullet group under the legacy name so HUD code still works. */
    this.projectilesGroup = this.bulletPool.group;

    this.enemyManager    = new EnemyManager(this);
    this.waveSystem      = new WaveSystem(this);
    this.upgradeSystem   = new UpgradeSystem(this);
    this.collisionSystem = new CollisionSystem(this);

    // ── Defenders (Sergiy) — wrapped in Player entities ─────────────────────
    /** @type {Player[]} */
    this.defenders      = [];
    this.defendersGroup = this.add.group(); // kept for compatibility
    this._createDefenders();

    // ── Colliders ───────────────────────────────────────────────────────────
    this.collisionSystem.setup();

    // ── HUD graphics ────────────────────────────────────────────────────────
    this._hpGfx        = this.add.graphics().setDepth(10);
    this._timerGfx     = this.add.graphics().setDepth(10);
    this._bossBarGfx   = this.add.graphics().setDepth(10);
    this._waveLabelTxt = this.add.text(width / 2, 8, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '22px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(10);

    // Boss HP label
    this._bossTitleTxt = this.add.text(width / 2, 10, 'КІБЕР-БОС: ТОВАРИШ ВАХТЕРША', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '16px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(11).setVisible(false);

    // House HP label
    this._houseHpLabel = this.add.text(82, 676, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#00ffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 8, fill: true },
    }).setDepth(10);

    // Game-over text
    this._gameOverTxt = this.add.text(width / 2, height / 2, 'ХУТІР ВПАВ!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '72px',
      color:      '#ff00ff',
      stroke:     '#000000',
      strokeThickness: 12,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 40, fill: true },
    }).setOrigin(0.5).setVisible(false).setDepth(40);

    // ── Economy: passive income ──────────────────────────────────────────────
    this._passiveTimer = this.time.addEvent({
      delay: 2000,
      loop:  true,
      callbackScope: this,
      callback: () => {
        if (!this.gameOver) {
          this.money += Math.floor(10 * this.modifiers.passiveIncome);
        }
      },
    });

    // ── Neon pulse on house (breathing glow) ─────────────────────────────────
    this.tweens.add({
      targets: this.house,
      alpha: 0.8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Start first wave ────────────────────────────────────────────────────
    this.waveSystem.startWave();

    // ── Launch persistent UI overlay ────────────────────────────────────────
    this.scene.launch('UIScene');
  }

  // ─── House Upgrade ────────────────────────────────────────────────────────

  /** Delegate to UpgradeSystem; also called by UIScene. */
  upgradeHouse() {
    this.upgradeSystem.upgradeHouse();
  }

  // ─── Defenders ────────────────────────────────────────────────────────────

  _createDefenders() {
    const positions = [
      { x: 230, y: 270 },
      { x: 230, y: 360 },
      { x: 230, y: 450 },
      { x: 290, y: 315 },
      { x: 290, y: 405 },
    ];
    for (const pos of positions) {
      const player = new Player(this, pos.x, pos.y);
      this.defenders.push(player);
      this.defendersGroup.add(player.sprite);
    }
  }

  // ─── Wave Management ──────────────────────────────────────────────────────

  /** Called by PerkScene after a perk is chosen. */
  resumeFromPerk() {
    this.waveSystem.resumeFromPerk();
  }

  // ─── Combat ───────────────────────────────────────────────────────────────

  _killEnemy(enemy) {
    this.money += 20;
    this._spawnDeathExplosion(enemy.x, enemy.y);
    const wasBoss = enemy.isBoss;
    enemy.destroy();

    if (wasBoss) {
      this.bossActive = false;
      this._bossTitleTxt.setVisible(false);
      this._bossBarGfx.clear();
      const bgm = this.sound.get('bgm');
      if (bgm) bgm.setRate(1.0);
      this.waveSystem.endWave();
    }
  }

  // ─── VFX — Neon Particle Manager ─────────────────────────────────────────

  _spawnDeathExplosion(x, y) {
    const emitter = this.add.particles(x, y, 'particle_neon_pink', {
      speed:    { min: 60, max: 260 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 300, max: 700 },
      angle:    { min: 0, max: 360 },
      tint:     [0xff00aa, 0xff6600, 0xffff00, 0x00ffff],
      emitting: false,
    }).setDepth(15);
    emitter.explode(30, x, y);
    this.time.delayedCall(800, () => { if (emitter.active) emitter.destroy(); });
  }

  _spawnHitParticle(x, y) {
    const emitter = this.add.particles(x, y, 'particle_neon_orange', {
      speed:    { min: 30, max: 110 },
      scale:    { start: 0.9, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: 280,
      angle:    { min: 0, max: 360 },
      tint:     [0xff6600, 0xffff00],
      emitting: false,
    }).setDepth(15);
    emitter.explode(10, x, y);
    this.time.delayedCall(400, () => { if (emitter.active) emitter.destroy(); });
  }

  // ─── Defender Shooting ────────────────────────────────────────────────────

  _defenderShoot(defenderSprite) {
    const enemies = this.enemiesGroup.getChildren().filter((e) => e.active);
    if (enemies.length === 0) return;

    let target  = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const dx = e.x - defenderSprite.x;
      const dy = e.y - defenderSprite.y;
      const d  = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; target = e; }
    }
    if (!target || minDist > 700 * 700) return;

    this.bulletPool.fire(defenderSprite, target);
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.gameOver) return;
    const { width } = this.scale;

    // Defender fire timers — advance each Player's state machine and shoot
    const cooldown = Math.max(300, 1200 * this.modifiers.attackSpeed);
    for (const player of this.defenders) {
      player.update(delta);
      if (player.fireTimer >= cooldown) {
        player.fireTimer = 0;
        this._defenderShoot(player.sprite);
      }
    }

    // Wall damage
    const defenseInv = delta / (Math.max(0.1, this.modifiers.wallDefense) * 1000);
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active || !enemy.isAttackingWall) continue;
      const dps = enemy.isBoss ? 2.0 : 0.5;
      this.houseHP -= dps * defenseInv;
    }

    // Wave timer bar (neon style)
    if (this.waveActive && this.wave !== 10) {
      this._waveElapsed += delta;
      const ratio = Math.min(1, this._waveElapsed / this._waveDuration);
      this._timerGfx.clear();
      this._timerGfx.fillStyle(0x110022, 0.7);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440, 10);
      this._timerGfx.fillStyle(0xff00ff, 1);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440 * (1 - ratio), 10);
      this._timerGfx.lineStyle(1, 0xff00ff, 0.6);
      this._timerGfx.strokeRect(width / 2 - 220, 38, 440, 10);
    } else if (this.wave === 10) {
      this._timerGfx.clear();
    }

    // HUD
    this._drawHouseHpBar();
    this._drawEnemyHpBars();
    if (this.bossActive) this._drawBossHpBar();

    // Out-of-bounds cleanup
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (enemy.active && enemy.x < -120) enemy.destroy();
    }

    // Game-over check
    if (this.houseHP <= 0 && !this.gameOver) {
      this.houseHP  = 0;
      this.gameOver = true;
      this._triggerGameOver();
    }
  }

  // ─── HUD Drawing ──────────────────────────────────────────────────────────

  _drawHouseHpBar() {
    const ratio = Math.max(0, this.houseHP / this.houseMaxHP);
    this._hpGfx.clear();
    this._hpGfx.fillStyle(0x110022, 1);
    this._hpGfx.fillRect(80, 680, 180, 22);
    const fillColor = ratio > 0.5 ? 0x00ffaa : ratio > 0.25 ? 0xffaa00 : 0xff00aa;
    this._hpGfx.fillStyle(fillColor, 1);
    this._hpGfx.fillRect(80, 680, 180 * ratio, 22);
    this._hpGfx.lineStyle(2, 0x00ffff, 0.9);
    this._hpGfx.strokeRect(80, 680, 180, 22);
    const hp = Math.max(0, Math.ceil(this.houseHP));
    this._houseHpLabel.setText(`Хутір: ${hp} / ${this.houseMaxHP}`);
  }

  _drawEnemyHpBars() {
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active) continue;
      const r  = Math.max(0, enemy.hp / enemy.maxHp);
      const bw = enemy.isBoss ? 0 : 42;
      if (bw === 0) continue;
      const bx = enemy.x - bw / 2;
      const by = enemy.y - enemy.displayHeight / 2 - 9;
      this._hpGfx.fillStyle(0x330022, 1);
      this._hpGfx.fillRect(bx, by, bw, 5);
      this._hpGfx.fillStyle(0x00ffaa, 1);
      this._hpGfx.fillRect(bx, by, bw * r, 5);
    }
  }

  _drawBossHpBar() {
    const boss = this.enemiesGroup.getChildren().find((e) => e.active && e.isBoss);
    if (!boss) return;
    const { width } = this.scale;
    const ratio = Math.max(0, boss.hp / boss.maxHp);
    const barX  = 200;
    const barW  = width - 400;
    // Pulsing pink boss bar
    const pulse = 0.7 + 0.3 * Math.sin(this.time.now / 200);
    this._bossBarGfx.clear();
    this._bossBarGfx.fillStyle(0x220033, 0.9);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW, 34, 7);
    this._bossBarGfx.fillStyle(0xff00aa, pulse);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW * ratio, 34, 7);
    this._bossBarGfx.lineStyle(2, 0xff00ff, 0.9);
    this._bossBarGfx.strokeRoundedRect(barX, 4, barW, 34, 7);
  }

  // ─── Game Over ────────────────────────────────────────────────────────────

  _triggerGameOver() {
    this.waveSystem.cleanup();
    this._passiveTimer.remove();

    // Reset BGM rate
    const bgm = this.sound.get('bgm');
    if (bgm) bgm.setRate(1.0);

    this._gameOverTxt.setVisible(true);
    this.cameras.main.shake(900, 0.03);

    this.time.delayedCall(4200, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }
}

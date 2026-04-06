/**
 * BattleScene.js
 * Core gameplay scene for Lanchyn vs Savok.
 */
import Calculator from '../utils/Calculator.js';
import Enemy from '../classes/Enemy.js';
import Tower from '../classes/Tower.js';

const LANES = [150, 300, 450];
const SPAWN_X = 870;
const HERO_X = 60;
const HERO_Y = 300;
const DEATH_X = 100;

// Grid system (Heroes 5 tactics)
const GRID_LEFT = 80;
const GRID_RIGHT = 880;
const GRID_COLS = 8;
const GRID_COL_W = (GRID_RIGHT - GRID_LEFT) / GRID_COLS; // 100 px per column
const GRID_TOP = 120;
const GRID_BOTTOM = 480;

// PvZ balance: all bureaucrats crawl at 0.5 px/frame (≈ 30 px/s at 60 fps)
const BUREAUCRAT_SPEED = 30;
const ORDERS_PHASE_DURATION = 10; // seconds

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init() {
    this.wave = 1;
    this.gold = 120;
    this.lives = 1; // one hit = game over
    this.enemies = [];
    this.towers = [];
    this.gameOver = false;
    this._waveInProgress = false;
    this._enemiesLeftInWave = 0;
  }

  create() {
    this._buildEnvironment();
    this._placeHero();
    this._buildProjectilePool();
    this._buildParticleSystem();
    this._setupPhysics();
    this._setupPause();
    this._setupBGMusic();
    this._startCountdown();
  }

  // ─── Environment ─────────────────────────────────────────────────────────────

  _buildEnvironment() {
    const { width, height } = this.scale;

    // Background: image_1.png (Heroes 5 style), fallback to dark solid
    if (this.textures.exists('bg')) {
      this.add
        .image(width / 2, height / 2, 'bg')
        .setDisplaySize(width, height)
        .setDepth(0);
    } else {
      const bgFill = this.add.graphics().setDepth(0);
      bgFill.fillStyle(0x0a0a1a, 1);
      bgFill.fillRect(0, 0, width, height);
    }

    // Central chasm divider – powerful visual separator
    const chasm = this.add.graphics().setDepth(1);
    chasm.fillStyle(0x000000, 0.80);
    chasm.fillRect(width / 2 - 10, 0, 20, height);
    chasm.lineStyle(2, 0xb8860b, 1);
    chasm.moveTo(width / 2 - 10, 0);
    chasm.lineTo(width / 2 - 10, height);
    chasm.strokePath();
    chasm.moveTo(width / 2 + 10, 0);
    chasm.lineTo(width / 2 + 10, height);
    chasm.strokePath();

    // Tactical grid overlay (Heroes 5 style) – battlefield is clean and empty
    this._drawGrid();

    // Hero zone marker
    const heroZone = this.add.graphics().setDepth(3);
    heroZone.lineStyle(2, 0xffcc00, 0.5);
    heroZone.strokeCircle(HERO_X, HERO_Y, 50);

    // Wave label (updated via events)
    this._waveLabel = this.add
      .text(width / 2, 12, `Wave ${this.wave}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#fff9c4',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(10);
  }

  // ─── Tactical Grid (Heroes 5 style) ─────────────────────────────────────────

  _drawGrid() {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00ff44, 0.18);

    // Vertical column lines
    for (let col = 0; col <= GRID_COLS; col++) {
      const gx = GRID_LEFT + col * GRID_COL_W;
      grid.moveTo(gx, GRID_TOP);
      grid.lineTo(gx, GRID_BOTTOM);
    }

    // Horizontal lane-band borders
    for (const y of LANES) {
      grid.moveTo(GRID_LEFT, y - 30);
      grid.lineTo(GRID_RIGHT, y - 30);
      grid.moveTo(GRID_LEFT, y + 30);
      grid.lineTo(GRID_RIGHT, y + 30);
    }

    grid.strokePath();
    grid.setDepth(2);
  }

  // ─── Hero ─────────────────────────────────────────────────────────────────────

  _placeHero() {
    this._hero = this.physics.add.sprite(HERO_X, HERO_Y, 'hero');
    this._hero.setScale(0.2);
    this._hero.body.allowGravity = false;
    this._hero.setImmovable(true);
    this._hero.setDepth(8);

    // Limping idle tween
    this.tweens.add({
      targets: this._hero,
      y: HERO_Y + 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ─── Projectile Pool ─────────────────────────────────────────────────────────

  _buildProjectilePool() {
    this._borshchPool = this.physics.add.group({
      maxSize: 100,
      createCallback: (proj) => {
        proj.body.allowGravity = false;
        proj.setScale(0.08);
        proj.setDepth(7);
        proj.setActive(false).setVisible(false);
        proj.isProjectile = true;
      },
    });
  }

  _getProjectile() {
    let proj = this._borshchPool.getFirstDead(false);
    if (!proj) {
      proj = this._borshchPool.create(0, 0, 'borshch');
      proj.body.allowGravity = false;
      proj.setScale(0.08);
      proj.setDepth(7);
      proj.isProjectile = true;
    }
    return proj;
  }

  // ─── Particles ───────────────────────────────────────────────────────────────

  _buildParticleSystem() {
    // We'll emit particles manually using graphics (no atlas needed)
    this._particles = [];
  }

  _emitHitExplosion(x, y) {
    // Borsch splash: red droplets that spread and fade
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.3, 0.3); // ±0.3 rad jitter
      const dist = Phaser.Math.Between(30, 90);
      const radius = Phaser.Math.Between(3, 8);
      const p = this.add
        .circle(x, y, radius, Phaser.Math.RND.pick([0xcc2222, 0xff4444, 0x991111]), 1)
        .setDepth(15);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(300, 500),
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  _emitHealingParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Phaser.Math.Between(20, 55);
      const p = this.add.circle(x, y, 4, 0x66ff66, 0.9).setDepth(16);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius - 20,
        alpha: 0,
        duration: 700,
        ease: 'Sine.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  _floatingText(x, y, text, color = '#ffd700') {
    const t = this.add
      .text(x, y, text, {
        fontSize: '16px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color,
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: t,
      y: y - 50,
      alpha: 0,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  // ─── Physics ──────────────────────────────────────────────────────────────────

  _setupPhysics() {
    // Overlap between projectiles and enemies is handled in update()
    // to avoid destroy-in-callback issues.
  }

  // ─── Preparation Countdown ───────────────────────────────────────────────────

  _startCountdown() {
    const { width, height } = this.scale;
    let count = 5;

    const countText = this.add
      .text(width / 2, height / 2, `Підготовка до зміни... ${count}`, {
        fontSize: '52px',
        fontFamily: 'Arial Black, Arial',
        fontStyle: 'bold',
        color: '#fff176',
        stroke: '#000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(40);

    // Pulsing tween
    this.tweens.add({
      targets: countText,
      scaleX: 1.12,
      scaleY: 1.12,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut',
    });

    this._countdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: 4,
      callback: () => {
        count -= 1;
        if (count > 0) {
          countText.setText(`Підготовка до зміни... ${count}`);
        } else {
          this.tweens.killTweensOf(countText);
          countText.destroy();
          this._countdownTimer = null;
          this._startWave();
        }
      },
    });
  }

  // ─── Pause System ─────────────────────────────────────────────────────────────

  _setupPause() {
    this._isPaused = false;
    this._pauseOverlay = null;
    this._pauseText = null;

    const { width, height } = this.scale;

    this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this._pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this._escKey.on('down', () => this._togglePause());
    this._pKey.on('down', () => this._togglePause());
  }

  _togglePause() {
    if (this.gameOver) return;
    this._isPaused = !this._isPaused;

    if (this._isPaused) {
      this.physics.pause();
      this.time.paused = true;

      const { width, height } = this.scale;
      this._pauseOverlay = this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
        .setDepth(80);

      this._pauseText = this.add
        .text(width / 2, height / 2, 'ПАУЗА', {
          fontSize: '72px',
          fontFamily: 'Arial Black, Arial',
          fontStyle: 'bold',
          color: '#ffffff',
          stroke: '#000',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(81);
    } else {
      this.physics.resume();
      this.time.paused = false;

      if (this._pauseOverlay) {
        this._pauseOverlay.destroy();
        this._pauseOverlay = null;
      }
      if (this._pauseText) {
        this._pauseText.destroy();
        this._pauseText = null;
      }
    }
  }

  // ─── Background Music ─────────────────────────────────────────────────────────

  _setupBGMusic() {
    if (this.cache.audio.exists('bg_music')) {
      this.sound.play('bg_music', { loop: true, volume: 0.2 });
    }
  }

  // ─── Wave Spawning ───────────────────────────────────────────────────────────

  _startWave() {
    if (this.gameOver) return;
    this._waveInProgress = true;
    this._waveLabel.setText(`Wave ${this.wave}`);

    // Emit event so UIScene can refresh
    this.events.emit('waveChanged', this.wave);

    const waveSize = 3 + this.wave * 2;
    this._enemiesLeftInWave = waveSize;
    this._enemiesKilledInWave = 0;
    this._totalInWave = waveSize;

    // Show wave announcement
    const { width, height } = this.scale;
    const ann = this.add
      .text(width / 2, height / 2 - 40, `⚠  Wave ${this.wave}  ⚠`, {
        fontSize: '36px',
        fontFamily: 'Arial Black, Arial',
        fontStyle: 'bold',
        color: '#fff176',
        stroke: '#b71c1c',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.tweens.add({
      targets: ann,
      alpha: 0,
      y: ann.y - 60,
      duration: 1800,
      delay: 600,
      onComplete: () => ann.destroy(),
    });

    // 10-second Orders Phase before enemies spawn
    this._runOrdersPhase(() => {
      // Spawn enemies with a stagger after the orders phase
      for (let i = 0; i < waveSize; i++) {
        this.time.delayedCall(i * 1500 + 800, () => {
          if (!this.gameOver) this._spawnEnemy();
        });
      }
    });
  }

  // ─── Orders Phase ─────────────────────────────────────────────────────────────

  _runOrdersPhase(onComplete) {
    const { width, height } = this.scale;
    let remaining = ORDERS_PHASE_DURATION;

    const bg = this.add
      .rectangle(width / 2, 80, 300, 44, 0x1a237e, 0.82)
      .setDepth(35);

    const label = this.add
      .text(width / 2, 80, `📋 Orders Phase: ${remaining}s`, {
        fontSize: '18px',
        fontFamily: 'Arial Black, Arial',
        fontStyle: 'bold',
        color: '#fff176',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(36);

    const timer = this.time.addEvent({
      delay: 1000,
      repeat: ORDERS_PHASE_DURATION - 1,
      callback: () => {
        remaining -= 1;
        if (remaining > 0) {
          label.setText(`📋 Orders Phase: ${remaining}s`);
        } else {
          label.destroy();
          bg.destroy();
          onComplete();
        }
      },
    });
  }

  _spawnEnemy() {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const roll = Math.random();
    let tier, hpMult;

    if (roll < 0.45) {
      tier = 'intern';
      hpMult = 0.7;
    } else if (roll < 0.80) {
      tier = 'clerk';
      hpMult = 1.0;
    } else {
      tier = 'department_head';
      hpMult = 2.2;
    }
    const speed = BUREAUCRAT_SPEED;

    const hp = Math.floor(Calculator.enemyHP(this.wave) * hpMult);
    const enemy = new Enemy(this, SPAWN_X, lane, hp, speed, tier);
    this.enemies.push(enemy);
  }

  // ─── Projectile Firing ───────────────────────────────────────────────────────

  fireProjectile(tower, target) {
    if (!target.alive || !target.sprite || !target.sprite.active) return;

    const proj = this._getProjectile();
    proj.setActive(true).setVisible(true);
    proj.setPosition(tower.sprite.x + 20, tower.sprite.y);
    proj.body.enable = true;

    const dx = target.sprite.x - proj.x;
    const dy = target.sprite.y - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 320;
    proj.setVelocity((dx / dist) * speed, (dy / dist) * speed);

    // Rotation tween
    this.tweens.add({
      targets: proj,
      angle: 360,
      duration: 400,
      repeat: -1,
    });

    proj._damage = tower.damage;
    proj._target = target;
    proj._targetId = target.sprite ? target.sprite.x + '' + target.sprite.y : '';
  }

  // ─── Main Update ─────────────────────────────────────────────────────────────

  update() {
    if (this.gameOver) return;

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        this.enemies.splice(i, 1);
        continue;
      }

      enemy.update();

      // Check if enemy reached the hero
      if (enemy.sprite && enemy.sprite.active && enemy.sprite.x <= DEATH_X) {
        enemy.destroy();
        this.enemies.splice(i, 1);
        this._triggerGameOver();
        return;
      }
    }

    // Check projectile–enemy collisions
    const activeProjs = this._borshchPool.getMatching('active', true);
    for (const proj of activeProjs) {
      if (!proj.active || !proj.body) continue;

      // Out of bounds
      if (proj.x < -20 || proj.x > 900 || proj.y < -20 || proj.y > 620) {
        this._recycleProjectile(proj);
        continue;
      }

      // Check against enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy.alive || !enemy.sprite || !enemy.sprite.active) continue;

        const dx = proj.x - enemy.sprite.x;
        const dy = proj.y - enemy.sprite.y;
        const hitRadius = 22;

        if (Math.abs(dx) < hitRadius && Math.abs(dy) < hitRadius) {
          // Hit!
          this._emitHitExplosion(proj.x, proj.y);
          this._recycleProjectile(proj);
          enemy.takeDamage(proj._damage || 30);

          if (!enemy.alive) {
            this._onEnemyKilled(enemy, j);
          }
          break;
        }
      }
    }

    // Check wave completion
    if (this._waveInProgress && this.enemies.length === 0 && this._enemiesLeftInWave <= 0) {
      this._waveInProgress = false;
      this.time.delayedCall(5500, () => {
        if (!this.gameOver) {
          this.wave += 1;
          this._startWave();
          this.events.emit('goldChanged', this.gold);
        }
      });
    }
  }

  _recycleProjectile(proj) {
    this.tweens.killTweensOf(proj);
    proj.setActive(false).setVisible(false);
    proj.setVelocity(0, 0);
    proj.body.enable = false;
    proj.setAngle(0);
  }

  // ─── Enemy Death ─────────────────────────────────────────────────────────────

  onEnemyDied(enemy) {
    // Called from Enemy.die() – just mark; actual award in _onEnemyKilled
  }

  _onEnemyKilled(enemy, idx) {
    this.enemies.splice(idx, 1);
    this._enemiesLeftInWave = Math.max(0, this._enemiesLeftInWave - 1);
    this._enemiesKilledInWave = (this._enemiesKilledInWave || 0) + 1;

    const reward = Calculator.goldReward(this.wave);
    this.gold += reward;
    this.events.emit('goldChanged', this.gold);

    // Screen shake
    this.cameras.main.shake(80, 0.006);

    // Floating gold text
    const ex = enemy.sprite ? enemy.sprite.x : 400;
    const ey = enemy.sprite ? enemy.sprite.y : 300;
    this._floatingText(ex, ey, `+${reward} ₴`);
  }

  // ─── Tower Placement ─────────────────────────────────────────────────────────

  placeTower(laneIndex, dropX) {
    const y = LANES[laneIndex];

    // Snap dropX to the nearest grid column centre, restricted to player side (columns 0–3)
    let col = Math.round((dropX - GRID_LEFT - GRID_COL_W / 2) / GRID_COL_W);
    col = Phaser.Math.Clamp(col, 0, 3); // columns 0-3 are on the player's side of the fence
    const x = GRID_LEFT + col * GRID_COL_W + GRID_COL_W / 2;

    const tower = new Tower(this, x, y, laneIndex);
    this.towers.push(tower);
    return tower;
  }

  // ─── Ability: Medical Ointment ───────────────────────────────────────────────

  activateMedicalOintment() {
    // Boost all geese for 5 seconds
    for (const tower of this.towers) {
      tower.boost(5000);
    }
    // Healing particles around hero
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        this._emitHealingParticles(this._hero.x, this._hero.y);
      });
    }
    this._floatingText(this._hero.x, this._hero.y - 60, '💊 Ointment!', '#66ff66');
  }

  // ─── Game Over ───────────────────────────────────────────────────────────────

  _triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this._waveInProgress = false;

    // Notify UIScene
    this.events.emit('gameOver');

    // Stop all enemies
    for (const e of this.enemies) e.destroy();
    this.enemies = [];

    // Screen flash
    this.cameras.main.flash(500, 180, 30, 30);

    const { width, height } = this.scale;

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(50);

    this.add
      .text(width / 2, height / 2 - 60, '📋  Bureaucracy Won  📋', {
        fontSize: '36px',
        fontFamily: 'Arial Black, Arial',
        fontStyle: 'bold',
        color: '#ef9a9a',
        stroke: '#b71c1c',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(51);

    this.add
      .text(width / 2, height / 2, `You survived ${this.wave - 1} wave(s)`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#eeeeee',
      })
      .setOrigin(0.5)
      .setDepth(51);

    // Restart button
    const restartBtn = this.add
      .rectangle(width / 2, height / 2 + 70, 200, 48, 0xf57f17)
      .setInteractive({ useHandCursor: true })
      .setDepth(51);

    this.add
      .text(width / 2, height / 2 + 70, '↺  Try Again', {
        fontSize: '20px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#fff8e1',
      })
      .setOrigin(0.5)
      .setDepth(52);

    restartBtn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.stop('BattleScene');
      this.scene.start('KhutirScene');
    });
  }
}

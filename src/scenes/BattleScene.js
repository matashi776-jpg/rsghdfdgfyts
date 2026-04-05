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

// Balance constants
const NIGHT_SHIFT_SPEED_MULT = 1.3;
const STEAM_SLOW_MULT = 0.5;

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
    this.steamTowers = [];
    this.gameOver = false;
    this._waveInProgress = false;
    this._enemiesLeftInWave = 0;
    this._paused = false;
    this._nightShiftActive = false;
    this._totalGoldEarned = parseInt(localStorage.getItem('totalGoldEarned') || '0', 10);
  }

  create() {
    this._buildEnvironment();
    this._placeHero();
    this._buildProjectilePool();
    this._buildParticleSystem();
    this._setupPhysics();
    this._setupPause();
    this._playBgMusic();
    this._startWave();
  }

  // ─── Environment ─────────────────────────────────────────────────────────────

  _buildEnvironment() {
    const { width, height } = this.scale;

    // Green farm (left half) / grey office (right half)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x33691e, 0x33691e, 0x616161, 0x616161, 1);
    bg.fillRect(0, 0, width, height);

    // Lane tracks
    for (const y of LANES) {
      const lane = this.add.graphics();
      lane.lineStyle(2, 0xc8b900, 0.35);
      lane.strokeRect(80, y - 30, width - 100, 60);
    }

    // Dividing fence
    const fence = this.add.graphics();
    fence.lineStyle(3, 0x8d6e63, 0.9);
    fence.strokeRect(width / 2 - 1, 0, 2, height);
    for (let py = 20; py < height; py += 40) {
      fence.fillStyle(0x8d6e63, 1);
      fence.fillRect(width / 2 - 5, py, 10, 20);
    }

    // Hero zone marker
    const heroZone = this.add.graphics();
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
    // Spawn small red circles that spread and fade
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = Phaser.Math.Between(40, 100);
      const p = this.add.circle(x, y, Phaser.Math.Between(3, 7), 0xcc2222, 1).setDepth(15);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400,
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

  // ─── Wave Spawning ───────────────────────────────────────────────────────────

  _startWave() {
    if (this.gameOver) return;
    this._waveInProgress = true;
    this._waveLabel.setText(`Wave ${this.wave}`);

    // Persist record
    const saved = parseInt(localStorage.getItem('maxWaveReached') || '1', 10);
    if (this.wave > saved) {
      localStorage.setItem('maxWaveReached', String(this.wave));
    }

    // Emit event so UIScene can refresh
    this.events.emit('waveChanged', this.wave);

    const waveSize = 3 + this.wave * 2;
    this._enemiesLeftInWave = waveSize;
    this._enemiesKilledInWave = 0;
    this._totalInWave = waveSize;

    const { width, height } = this.scale;

    // ── Night Shift activation at wave 10 ──────────────────────────────────
    if (this.wave === 10 && !this._nightShiftActive) {
      this._nightShiftActive = true;

      const nightOverlay = this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
        .setDepth(2);
      this.tweens.add({ targets: nightOverlay, alpha: 0.4, duration: 2000 });

      const nightAlert = this.add
        .text(width / 2, height / 2 - 60, 'НОЧНА ЗМІНА:\nЗаочники хочуть додому!', {
          fontSize: '36px',
          fontFamily: 'Arial Black, Arial',
          fontStyle: 'bold',
          color: '#ff1744',
          stroke: '#000',
          strokeThickness: 5,
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(36);

      this.tweens.add({
        targets: nightAlert,
        scaleX: 1.25,
        scaleY: 1.25,
        duration: 280,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          this.tweens.add({
            targets: nightAlert,
            alpha: 0,
            duration: 800,
            delay: 600,
            onComplete: () => nightAlert.destroy(),
          });
        },
      });
    }

    // ── Wave announcement ───────────────────────────────────────────────────
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

    // ── 5-second preparation countdown ─────────────────────────────────────
    const countText = this.add
      .text(width / 2, height / 2 + 30, '', {
        fontSize: '54px',
        fontFamily: 'Arial Black, Arial',
        fontStyle: 'bold',
        color: '#ffeb3b',
        stroke: '#000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(31);

    for (let c = 5; c >= 1; c--) {
      this.time.delayedCall((5 - c) * 1000, () => {
        if (this.gameOver) return;
        countText.setText(`Підготовка до зміни... ${c}`);
        this.tweens.killTweensOf(countText);
        this.tweens.add({
          targets: countText,
          scaleX: { from: 1.3, to: 1 },
          scaleY: { from: 1.3, to: 1 },
          duration: 700,
          ease: 'Sine.easeOut',
        });
      });
    }

    // ── Spawn enemies after the 5-second delay ──────────────────────────────
    this.time.delayedCall(5000, () => {
      if (this.gameOver) return;
      countText.destroy();
      for (let i = 0; i < waveSize; i++) {
        this.time.delayedCall(i * 4500 + 200, () => {
          if (!this.gameOver) this._spawnEnemy();
        });
      }
    });
  }

  _spawnEnemy() {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const roll = Math.random();
    let tier, speed, hpMult;

    if (roll < 0.45) {
      tier = 'intern';
      speed = Phaser.Math.Between(10, 20) + this.wave;
      hpMult = 0.7;
    } else if (roll < 0.80) {
      tier = 'clerk';
      speed = Phaser.Math.Between(8, 16) + this.wave;
      hpMult = 1.0;
    } else {
      tier = 'department_head';
      speed = Phaser.Math.Between(5, 12) + this.wave;
      hpMult = 2.2;
    }

    // Night Shift: permanent 30% speed increase for all enemies from wave 10 onwards
    if (this._nightShiftActive) {
      speed = Math.ceil(speed * NIGHT_SHIFT_SPEED_MULT);
    }

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
    if (this.gameOver || this._paused) return;

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
          const dmg = proj._damage || 30;
          this._emitRedSquares(proj.x, proj.y);
          this._floatingDamage(enemy.sprite.x, enemy.sprite.y, dmg);
          this._recycleProjectile(proj);
          enemy.takeDamage(dmg);

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
      this.time.delayedCall(2500, () => {
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

    // Persist total gold earned
    this._totalGoldEarned += reward;
    localStorage.setItem('totalGoldEarned', String(this._totalGoldEarned));

    this.events.emit('goldChanged', this.gold);

    // Camera shake – bigger for bosses
    if (enemy.tier === 'department_head') {
      this.cameras.main.shake(200, 0.01);
    } else {
      this.cameras.main.shake(80, 0.006);
    }

    // Floating gold text
    const ex = enemy.sprite ? enemy.sprite.x : 400;
    const ey = enemy.sprite ? enemy.sprite.y : 300;
    this._floatingText(ex, ey, `+${reward} ₴`);
  }

  // ─── Tower Placement ─────────────────────────────────────────────────────────

  placeTower(laneIndex) {
    const y = LANES[laneIndex];
    // Place slightly right of hero, stagger if multiple geese on same lane
    const allInLane = [
      ...this.towers.filter((t) => t.lane === laneIndex),
      ...this.steamTowers.filter((t) => t.lane === laneIndex),
    ];
    const x = 130 + allInLane.length * 80;
    const tower = new Tower(this, x, y, laneIndex);
    this.towers.push(tower);
    return tower;
  }

  // ─── Steam Tower Placement ───────────────────────────────────────────────────

  placeSteamTower(laneIndex) {
    const y = LANES[laneIndex];
    const allInLane = [
      ...this.towers.filter((t) => t.lane === laneIndex),
      ...this.steamTowers.filter((t) => t.lane === laneIndex),
    ];
    const x = 130 + allInLane.length * 80;

    const sprite = this.physics.add.sprite(x, y, 'goose');
    sprite.setScale(0.15);
    sprite.body.allowGravity = false;
    sprite.setImmovable(true);
    sprite.setTint(0xadd8e6);
    sprite.setDepth(8);

    this.tweens.add({
      targets: sprite,
      scaleX: 0.155,
      scaleY: 0.145,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const steamTower = { sprite, lane: laneIndex };
    this.steamTowers.push(steamTower);

    steamTower._timer = this.time.addEvent({
      delay: 2500,
      callback: () => this._fireSteamAttack(steamTower),
      loop: true,
    });

    return steamTower;
  }

  _fireSteamAttack(steamTower) {
    if (this.gameOver || this._paused) return;
    if (!steamTower.sprite || !steamTower.sprite.active) return;

    const tx = steamTower.sprite.x;
    const ty = steamTower.sprite.y;
    const STEAM_RANGE = 100;

    // Visual: white expanding circle
    const circle = this.add.circle(tx, ty, 10, 0xffffff, 0.7).setDepth(12);
    this.tweens.add({
      targets: circle,
      scaleX: STEAM_RANGE / 10,
      scaleY: STEAM_RANGE / 10,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    });

    // Slow enemies within range
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.sprite || !enemy.sprite.active) continue;
      if (enemy._slowed) continue;
      const dx = enemy.sprite.x - tx;
      const dy = enemy.sprite.y - ty;
      if (Math.sqrt(dx * dx + dy * dy) <= STEAM_RANGE) {
        this._applySlowEffect(enemy);
      }
    }
  }

  _applySlowEffect(enemy) {
    enemy._originalSpeed = enemy.speed;
    enemy.speed = Math.max(1, Math.floor(enemy.speed * STEAM_SLOW_MULT));
    enemy._slowed = true;
    enemy.sprite.setTint(0xadd8e6);

    this.time.delayedCall(3000, () => {
      if (!enemy.alive || !enemy.sprite) return;
      enemy.speed = enemy._originalSpeed;
      enemy._slowed = false;
      enemy.sprite.clearTint();
    });
  }

  // ─── Pause System ─────────────────────────────────────────────────────────────

  _setupPause() {
    const { width, height } = this.scale;

    this._pauseOverlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setDepth(100)
      .setVisible(false);

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
      .setDepth(101)
      .setVisible(false);

    this._pauseHint = this.add
      .text(width / 2, height / 2 + 70, 'Натисніть P або ESC щоб продовжити', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#cccccc',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setVisible(false);

    this.input.keyboard.on('keydown-ESC', () => this._togglePause());
    this.input.keyboard.on('keydown-P', () => this._togglePause());
  }

  _togglePause() {
    if (this.gameOver) return;
    this._paused = !this._paused;

    if (this._paused) {
      this.physics.pause();
      this.time.paused = true;
      this._pauseOverlay.setVisible(true);
      this._pauseText.setVisible(true);
      this._pauseHint.setVisible(true);
    } else {
      this.physics.resume();
      this.time.paused = false;
      this._pauseOverlay.setVisible(false);
      this._pauseText.setVisible(false);
      this._pauseHint.setVisible(false);
    }
  }

  // ─── Audio ────────────────────────────────────────────────────────────────────

  _playBgMusic() {
    try {
      const existing = this.sound.get('bg_music');
      if (existing) {
        if (!existing.isPlaying) existing.play({ loop: true, volume: 0.2 });
      } else {
        this.sound.play('bg_music', { loop: true, volume: 0.2 });
      }
    } catch (e) {
      console.warn('bg_music unavailable:', e.message);
    }
  }

  // ─── Game Juice: Red Square Particles ────────────────────────────────────────

  _emitRedSquares(x, y) {
    const count = Phaser.Math.Between(3, 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Phaser.Math.Between(50, 130);
      const size = Phaser.Math.Between(3, 7);
      const sq = this.add.rectangle(x, y, size, size, 0xcc1111, 1).setDepth(15);
      this.tweens.add({
        targets: sq,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + Phaser.Math.Between(20, 50), // gravity pull
        alpha: 0,
        duration: Phaser.Math.Between(300, 600),
        ease: 'Power2',
        onComplete: () => sq.destroy(),
      });
    }
  }

  // ─── Game Juice: Floating Damage Numbers ─────────────────────────────────────

  _floatingDamage(x, y, amount) {
    const t = this.add
      .text(x, y - 10, String(amount), {
        fontSize: '13px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ff4444',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: t,
      y: y - 55,
      alpha: 0,
      duration: 600,
      ease: 'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
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

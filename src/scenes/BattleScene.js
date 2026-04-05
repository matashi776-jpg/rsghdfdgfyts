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

    // Spawn enemies with a stagger
    for (let i = 0; i < waveSize; i++) {
      this.time.delayedCall(i * 1500 + 800, () => {
        if (!this.gameOver) this._spawnEnemy();
      });
    }
  }

  _spawnEnemy() {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const roll = Math.random();
    let tier, speed, hpMult;

    if (roll < 0.45) {
      tier = 'intern';
      speed = 80 + this.wave * 5;
      hpMult = 0.7;
    } else if (roll < 0.80) {
      tier = 'clerk';
      speed = 55 + this.wave * 3;
      hpMult = 1.0;
    } else {
      tier = 'department_head';
      speed = 35 + this.wave * 2;
      hpMult = 2.2;
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
    this.events.emit('goldChanged', this.gold);

    // Screen shake
    this.cameras.main.shake(80, 0.006);

    // Floating gold text
    const ex = enemy.sprite ? enemy.sprite.x : 400;
    const ey = enemy.sprite ? enemy.sprite.y : 300;
    this._floatingText(ex, ey, `+${reward} ₴`);
  }

  // ─── Tower Placement ─────────────────────────────────────────────────────────

  placeTower(laneIndex) {
    const y = LANES[laneIndex];
    // Place slightly right of hero, stagger if multiple geese on same lane
    const laneTowers = this.towers.filter((t) => t.lane === laneIndex);
    const x = 130 + laneTowers.length * 80;
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

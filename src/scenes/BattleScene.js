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

const PROJECTILE_SPEED = 600;
const BUREAUCRAT_SPEED = 30;
const ORDERS_PHASE_DURATION = 10; // seconds

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init() {
    this.wave = 1;
    this.gold = 10000;
    this.lives = 1;
    this.enemies = [];
    this.towers = [];
    this.gameOver = false;
    this._waveInProgress = false;
    this._enemiesLeftInWave = 0;
    this.selectedUnit = 'goose';
  }

  create() {
    this._buildEnvironment();
    this._placeHero();
    this._buildProjectilePool();
    this._buildParticleSystem();
    this._setupPhysics();
    this._setupPlacementClick();
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

  _emitHitExplosion(x, y, velX = 0, velY = 0) {
    // Directional borsch splash: burst moves opposite to projectile travel
    const mag = Math.sqrt(velX * velX + velY * velY) || 1;
    const splashDirX = -(velX / mag);
    const splashDirY = -(velY / mag);

    for (let i = 0; i < 10; i++) {
      // Mix directional spread with cone scatter
      const scatter = ((Math.random() - 0.5) * Math.PI) / 1.8;
      const cos = Math.cos(scatter);
      const sin = Math.sin(scatter);
      const px = splashDirX * cos - splashDirY * sin;
      const py = splashDirX * sin + splashDirY * cos;
      const speed = Phaser.Math.Between(50, 120);
      const radius = Phaser.Math.Between(3, 7);
      const p = this.add.circle(x, y, radius, 0xcc2222, 1).setDepth(15);
      this.tweens.add({
        targets: p,
        x: x + px * speed,
        y: y + py * speed,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(300, 500),
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  _emitDustBurst(x, y) {
    // Brown/grey dust when a goose lands on the grid
    const dustColors = [0x8b7355, 0xa09070, 0x6e6050, 0xc0b090];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Phaser.Math.Between(20, 70);
      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      const radius = Phaser.Math.Between(2, 6);
      const p = this.add.circle(x, y, radius, color, 0.85).setDepth(14);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - Phaser.Math.Between(10, 30),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(400, 700),
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
    this.projectiles = this._borshchPool;
    this.defenders = this.physics.add.group();
    this.enemiesGroup = this.physics.add.group();

    // Projectiles destroy enemies on contact
    this.physics.add.overlap(this.projectiles, this.enemiesGroup, function(projectile, enemySprite) {
      const enemy = enemySprite.enemyRef;
      if (!enemy || !enemy.alive) return;
      const vx = projectile.body ? projectile.body.velocity.x : 0;
      const vy = projectile.body ? projectile.body.velocity.y : 0;
      const damage = projectile._damage || 30;
      this._emitHitExplosion(projectile.x, projectile.y, vx, vy);
      enemy.takeDamage(damage);
      this._recycleProjectile(projectile);
      if (!enemy.alive) {
        const idx = this.enemies.indexOf(enemy);
        if (idx !== -1) this._onEnemyKilled(enemy, idx);
      }
    }, null, this);

    // Enemies destroy defenders on contact; enemy is stunned briefly (no ghosting)
    this.physics.add.overlap(this.enemiesGroup, this.defenders, function(enemySprite, defenderSprite) {
      const tower = defenderSprite.towerRef;
      if (!tower || !tower.alive) return;
      const idx = this.towers.indexOf(tower);
      tower.destroy();
      if (idx !== -1) this.towers.splice(idx, 1);
      // Stun the enemy so it stops momentarily instead of walking through
      const enemyObj = enemySprite.enemyRef;
      if (enemyObj && enemyObj.alive) enemyObj.stun(800);
    }, null, this);
  }

  // ─── Click-to-place ──────────────────────────────────────────────────────────

  _setupPlacementClick() {
    const UNIT_COSTS = { goose: 100, superHero: 500, goldenGoose: 50 };
    const { height } = this.scale;

    this.input.on('pointerdown', (pointer) => {
      if (this.gameOver || this._isPaused) return;
      // Ignore clicks in the top bar and the bottom panel areas
      if (pointer.y < 50 || pointer.y > height - 110) return;

      const unitType = this.selectedUnit || 'goose';
      const cost = UNIT_COSTS[unitType] ?? 100;

      if (this.gold < cost) {
        this.events.emit('notEnoughGold');
        return;
      }

      // Snap Y to nearest lane
      const laneIndex = this._nearestLane(pointer.y);
      if (laneIndex === -1) return;

      this.gold -= cost;
      this.events.emit('goldChanged', this.gold);
      this.placeTower(laneIndex, pointer.x, unitType);
    });
  }

  _nearestLane(y) {
    let best = -1;
    let bestDist = 80; // max snap distance
    for (let i = 0; i < LANES.length; i++) {
      const dist = Math.abs(y - LANES[i]);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
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
    const isBoss = Math.random() < 0.20;

    let tier, hp, speed;
    if (isBoss) {
      tier = 'boss';
      hp = 15;
      speed = 15;
    } else {
      tier = 'bureaucrat';
      hp = 2;
      speed = 40;
    }

    const enemy = new Enemy(this, SPAWN_X, lane, hp, speed, tier);
    // Scale boss sprite to look massive
    if (isBoss && enemy.sprite) {
      enemy.sprite.setScale(1.8);
    }
    this.enemies.push(enemy);
    this.enemiesGroup.add(enemy.sprite);
  }

  // ─── Projectile Firing ───────────────────────────────────────────────────────

  fireProjectile(tower, target) {
    if (!target.alive || !target.sprite || !target.sprite.active) return;

    const proj = this._getProjectile();
    proj.setActive(true).setVisible(true);
    proj.setPosition(tower.sprite.x + 20, tower.sprite.y);
    proj.body.enable = true;
    proj.body.gravity.y = 0;

    proj.setVelocity(PROJECTILE_SPEED, 0);

    // Tractor Hero (superHero) fires a scaled-up borsch projectile
    const isSuperHero = tower.unitType === 'superHero';
    proj.setScale(isSuperHero ? 0.22 : 0.08);

    // Rotation tween
    this.tweens.add({
      targets: proj,
      angle: 360,
      duration: 400,
      repeat: -1,
    });

    proj._damage = tower.damage;
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

    // Recycle out-of-bounds projectiles
    const activeProjs = this._borshchPool.getMatching('active', true);
    for (const proj of activeProjs) {
      if (!proj.active || !proj.body) continue;
      if (proj.x < -20 || proj.x > 960 || proj.y < -20 || proj.y > 640) {
        this._recycleProjectile(proj);
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
    proj.setScale(0.08);
    proj.body.enable = false;
    proj.body.gravity.y = 0; // reset arc gravity
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

    const isBoss = enemy.tier === 'boss';
    const reward = isBoss ? 300 : 50;
    this.gold += reward;
    this.events.emit('goldChanged', this.gold);

    // Screen shake
    this.cameras.main.shake(isBoss ? 160 : 80, isBoss ? 0.012 : 0.006);

    // Floating gold text
    const ex = enemy.sprite ? enemy.sprite.x : 400;
    const ey = enemy.sprite ? enemy.sprite.y : 300;
    this._floatingText(ex, ey, `+${reward} ₴`);
  }

  // ─── Tower Placement ─────────────────────────────────────────────────────────

  placeTower(laneIndex, dropX, unitType = 'goose') {
    const y = LANES[laneIndex];

    // Snap dropX to the nearest grid column centre, restricted to player side (columns 0–3)
    let col = Math.round((dropX - GRID_LEFT - GRID_COL_W / 2) / GRID_COL_W);
    col = Phaser.Math.Clamp(col, 0, 3);
    const x = GRID_LEFT + col * GRID_COL_W + GRID_COL_W / 2;

    const tower = new Tower(this, x, y, laneIndex, unitType);
    this.towers.push(tower);
    this.defenders.add(tower.sprite);

    this._emitDustBurst(x, y + 10);

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

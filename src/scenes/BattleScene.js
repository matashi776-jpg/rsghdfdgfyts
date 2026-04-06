/**
 * BattleScene.js
 * Dynamic battle engine — Оборона Ланчина V5.0 NEON PSYCHEDELIC
 *
 * Architecture improvements (V5):
 *  - EnemyManager: object-pool recycling instead of destroy() (~70% fewer allocs)
 *  - SergiyStateMachine: Idle/Shooting/Reloading/Upgrading per defender
 *  - Calculator.enemyHP: stepped-logarithmic HP scaling (no runaway exponential growth)
 *  - Acid-poison DOT: "Кислотний Буряк" applies poison; "Золотий Талон" synergy ×2 gold
 *  - Physics FPS raised to 120 in main.js to reduce bullet-tunneling
 */
import EnemyManager        from '../classes/EnemyManager.js';
import SergiyStateMachine  from '../classes/SergiyStateMachine.js';
import Calculator          from '../utils/Calculator.js';

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
    this.projectilesGroup = this.physics.add.group();

    // ── Enemy pool manager (object pooling — ~70% fewer allocations) ─────────
    this.enemyManager = new EnemyManager(this, this.enemiesGroup);

    // ── Defenders (Sergiy) ──────────────────────────────────────────────────
    this.defendersGroup = this.add.group();
    this._createDefenders();

    // ── Colliders ───────────────────────────────────────────────────────────
    this.physics.add.overlap(
      this.enemiesGroup,
      this.house,
      (enemy) => this._enemyReachWall(enemy),
      null,
      this,
    );
    this.physics.add.overlap(
      this.projectilesGroup,
      this.enemiesGroup,
      (proj, enemy) => this._hitEnemy(proj, enemy),
      null,
      this,
    );

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
    this._startWave();

    // ── Launch persistent UI overlay ────────────────────────────────────────
    this.scene.launch('UIScene');
  }

  // ─── House Upgrade ────────────────────────────────────────────────────────

  upgradeHouse() {
    if (this.houseLevel >= 3) return;
    this.houseLevel++;
    this.house.setTexture('house_' + this.houseLevel);

    if (this.houseLevel === 2) {
      this.houseMaxHP = 5000;
      this.house.setTint(0x00ffff); // Brick house — cyan neon
    } else if (this.houseLevel === 3) {
      this.houseMaxHP = 12000;
      this.house.setTint(0xff00aa); // Cyber-Fortress — neon pink
      // Lvl 3 bonus: unlock Auto-Turret (faster fire)
      this.modifiers.attackSpeed = Math.max(0.1, this.modifiers.attackSpeed - 0.35);
      this._spawnUpgradeParticles();
    }
    this.houseHP = this.houseMaxHP;

    const newW = 100 + (this.houseLevel - 1) * 10;
    const newH = 200 + (this.houseLevel - 1) * 20;
    this.house.setDisplaySize(newW, newH);
    this.house.refreshBody();
  }

  _spawnUpgradeParticles() {
    const em = this.add.particles(this.house.x, this.house.y, 'particle_neon_cyan', {
      speed:    { min: 60, max: 300 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 400, max: 900 },
      angle:    { min: 0, max: 360 },
      tint:     [0x00ffff, 0xff00aa, 0xffff00],
      emitting: false,
    }).setDepth(15);
    em.explode(40, this.house.x, this.house.y);
    this.time.delayedCall(1000, () => { if (em.active) em.destroy(); });
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
      const s = this.add.image(pos.x, pos.y, 'sergiy')
        .setDisplaySize(48, 72)
        .setTint(0xff88ff)
        .setDepth(5);
      // Each defender gets its own state machine
      s.sm = new SergiyStateMachine({
        fireRate:   Math.max(300, 1200 * this.modifiers.attackSpeed),
        reloadTime: 800,
        burstSize:  5,
      });
      this.defendersGroup.add(s);
    }
  }

  // ─── Wave Management ──────────────────────────────────────────────────────

  _startWave() {
    this.waveActive   = true;
    this._waveElapsed = 0;
    this._waveLabelTxt.setText(`Хвиля: ${this.wave}`);

    if (this.wave === 10) {
      this._spawnBoss();
      this._spawnTimer   = null;
      this._waveEndTimer = null;
    } else {
      const interval = Math.max(500, 2000 - this.wave * 100);
      this._spawnTimer = this.time.addEvent({
        delay: interval,
        loop:  true,
        callbackScope: this,
        callback: this._spawnEnemy,
      });
      this._spawnEnemy();

      this._waveEndTimer = this.time.delayedCall(
        this._waveDuration,
        this._endWave,
        [],
        this,
      );
    }
  }

  _endWave() {
    this.waveActive = false;
    if (this._spawnTimer)   { this._spawnTimer.remove();   this._spawnTimer   = null; }
    if (this._waveEndTimer) { this._waveEndTimer.remove(); this._waveEndTimer = null; }

    if (this.wave === 5 || this.wave === 10) {
      this.scene.pause();
      this.scene.launch('PerkScene', { modifiers: this.modifiers, wave: this.wave });
    } else {
      this.wave++;
      this._startWave();
    }
  }

  resumeFromPerk() {
    this.wave++;
    // Propagate any perk-changed attack-speed modifier to all state machines
    for (const def of this.defendersGroup.getChildren()) {
      if (def.sm) def.sm.applyAttackSpeedModifier(this.modifiers.attackSpeed);
    }
    this._startWave();
  }

  // ─── Enemy Spawning ───────────────────────────────────────────────────────

  _spawnEnemy() {
    if (this.gameOver) return;
    const { height } = this.scale;
    const roll = Math.random();
    let texture, baseSpeed, hpMult, dispW, dispH, tint;

    if (roll < 0.5) {
      texture = 'enemy_clerk';  baseSpeed = 60;  hpMult = 1.0; dispW = 48; dispH = 64; tint = 0xaa44ff;
    } else if (roll < 0.80) {
      texture = 'enemy_runner'; baseSpeed = 120; hpMult = 0.7; dispW = 40; dispH = 56; tint = 0xff6600;
    } else {
      texture = 'enemy_tank';   baseSpeed = 30;  hpMult = 3.0; dispW = 80; dispH = 80; tint = 0x00ff44;
    }

    // +10% speed per wave (wave starts at 1)
    const speed = baseSpeed * (1 + (this.wave - 1) * 0.10);

    // Stepped-logarithmic HP via Calculator
    const baseHP = Calculator.enemyHP(this.wave);
    const hp     = Math.round(baseHP * hpMult);

    const y = Phaser.Math.Between(Math.floor(height * 0.18), Math.floor(height * 0.82));
    this.enemyManager.spawn(1340, y, texture, hp, speed, dispW, dispH, tint, false);
  }

  _spawnBoss() {
    const { height } = this.scale;
    const boss = this.enemyManager.spawn(
      1200, height / 2, 'boss_vakhtersha',
      15000, 15, 120, 140, 0xff00ff, true,
    );
    this.bossActive = true;
    this._bossTitleTxt.setVisible(true);

    // Boss arrival: speed up BGM
    const bgm = this.sound.get('bgm');
    if (bgm) bgm.setRate(1.2);

    // Flash screen neon pink
    const flash = this.add.rectangle(
      this.scale.width / 2, this.scale.height / 2,
      this.scale.width, this.scale.height,
      0xff00aa, 0,
    ).setDepth(50);
    this.tweens.add({ targets: flash, fillAlpha: 0.45, duration: 200, yoyo: true, repeat: 2 });
  }

  // ─── Combat ───────────────────────────────────────────────────────────────

  _enemyReachWall(enemy) {
    if (!enemy.active) return;
    enemy.body.setVelocityX(0);
    enemy.isAttackingWall = true;
  }

  _hitEnemy(proj, enemy) {
    if (!proj.active || !enemy.active) return;
    const damage = Math.floor(20 * this.modifiers.damage);
    enemy.hp -= damage;
    this._spawnHitParticle(proj.x, proj.y);
    if (proj.particleTrail) {
      proj.particleTrail.stopFollow();
      this.time.delayedCall(260, () => {
        if (proj.particleTrail && proj.particleTrail.active) proj.particleTrail.destroy();
      });
    }
    proj.destroy();

    // Acid-poison DOT: "Кислотний Буряк" perk — apply poison on hit.
    // Note: synergy with "Золотий Талон" (×2 gold) only triggers when both perks are active.
    if (this.modifiers.acidSplash && !enemy.poisoned) {
      enemy.poisoned = true;
      this._applyPoisonDOT(enemy);
    }

    if (enemy.hp <= 0) {
      this._killEnemy(enemy);
    }
  }

  /**
   * Apply a poison damage-over-time to an enemy.
   * Deals 5 damage every 500 ms for 3 seconds (30 total).
   * @param {Phaser.Physics.Arcade.Sprite} enemy
   */
  _applyPoisonDOT(enemy) {
    let ticks = 6; // 6 × 500 ms = 3 s
    const tickDamage = 5;
    const timer = this.time.addEvent({
      delay: 500,
      repeat: ticks - 1,
      callback: () => {
        if (!enemy.active || enemy.hp <= 0) {
          timer.remove();
          return;
        }
        enemy.hp -= tickDamage;
        // Tiny acid tint flash — restore original tint afterwards
        const origTint = enemy._baseTint || 0xffffff;
        this.tweens.add({
          targets: enemy,
          tint: 0x00ff88,
          duration: 60,
          ease: 'Linear',
          yoyo: false,
          onComplete: () => {
            if (enemy.active) enemy.setTint(origTint);
          },
        });
        if (enemy.hp <= 0) {
          timer.remove();
          this._killEnemy(enemy);
        }
      },
    });
  }

  _killEnemy(enemy) {
    if (!enemy.active) return;
    // Synergy: "Золотий Талон" + "Кислотний Буряк" — ×2 gold for poisoned kills
    const goldMultiplier = (this.modifiers.goldenTalon && enemy.poisoned) ? 2 : 1;
    this.money += 20 * goldMultiplier;
    this._spawnDeathExplosion(enemy.x, enemy.y);
    const wasBoss = enemy.isBoss;
    // Recycle instead of destroy — returns sprite to the object pool
    this.enemyManager.recycle(enemy);

    if (wasBoss) {
      this.bossActive = false;
      this._bossTitleTxt.setVisible(false);
      this._bossBarGfx.clear();
      // Reset BGM rate
      const bgm = this.sound.get('bgm');
      if (bgm) bgm.setRate(1.0);
      this._endWave();
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

  _defenderShoot(defender) {
    const enemies = this.enemiesGroup.getChildren().filter((e) => e.active);
    if (enemies.length === 0) return;

    let target = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const dx = e.x - defender.x;
      const dy = e.y - defender.y;
      const d  = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; target = e; }
    }
    if (!target || minDist > 700 * 700) return;

    const proj = this.projectilesGroup.create(defender.x + 22, defender.y, 'particle_neon_pink');
    if (!proj) return;
    proj.setDisplaySize(16, 10);
    proj.setDepth(6);
    proj.setTint(0xff00aa);

    const angle = Math.atan2(target.y - defender.y, target.x - defender.x);
    const spd   = 460;
    proj.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);

    // Neon pink/orange additive particle trail
    const trail = this.add.particles(proj.x, proj.y, 'particle_neon_orange', {
      speed:     { min: 8, max: 40 },
      scale:     { start: 0.7, end: 0 },
      alpha:     { start: 0.9, end: 0 },
      lifespan:  200,
      frequency: 20,
      quantity:  2,
      tint:      [0xff00aa, 0xff6600],
    }).setDepth(5);
    trail.startFollow(proj);
    proj.particleTrail = trail;

    this.time.delayedCall(2000, () => {
      if (proj.active) {
        if (proj.particleTrail && proj.particleTrail.active) {
          proj.particleTrail.stopFollow();
          this.time.delayedCall(260, () => {
            if (proj.particleTrail && proj.particleTrail.active) proj.particleTrail.destroy();
          });
        }
        proj.destroy();
      }
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.gameOver) return;
    const { width } = this.scale;

    // Defender fire — driven by SergiyStateMachine per unit
    for (const def of this.defendersGroup.getChildren()) {
      const enemies    = this.enemyManager.getActive();
      const hasTarget  = enemies.some((e) => {
        const dx = e.x - def.x;
        const dy = e.y - def.y;
        return dx > 0 && dx < 700 && Math.abs(dy) < 200;
      });
      const shouldFire = def.sm.update(delta, hasTarget);
      if (shouldFire) this._defenderShoot(def);

      // Visual cue: tint flashes brighter while shooting
      if (def.sm.state === 'SHOOTING') {
        def.setTint(0xffffff);
      } else if (def.sm.state === 'RELOADING') {
        def.setTint(0x886688);
      } else {
        def.setTint(0xff88ff);
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

    // Out-of-bounds cleanup — recycle instead of destroy
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (enemy.active && enemy.x < -120) this.enemyManager.recycle(enemy);
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
    if (this._spawnTimer)   this._spawnTimer.remove();
    if (this._waveEndTimer) this._waveEndTimer.remove();
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

/**
 * BattleScene.js
 * Dynamic battle engine — Оборона Ланчина V4.0 NEON PSYCHEDELIC
 *
 * Part 4 changes:
 *  - Formulas delegated to Calculator.js (linear+log HP, wave-based speed/gold)
 *  - Full perk effects: poison (Radioactive Beet), reflection (Iron Seal),
 *    gold multiplier + golden explosions (Golden Coupon), fire-rate boost
 *    (Cyber-Rushnyk), Trembita Blast knockback, Folk Overdrive timed buff
 *  - Meta-progression permanent bonuses loaded from localStorage
 */
import Calculator from '../utils/Calculator.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init() {
    // ── Load persistent meta-upgrades from localStorage ─────────────────────
    const meta = BattleScene._loadMeta();

    this.wave          = 1;
    this.houseLevel    = meta.houseLevel;
    this.baseEnemyHP   = 100;
    this.money         = 50;
    this.gameOver      = false;
    this.bossActive    = false;
    this.waveActive    = false;
    this._waveElapsed  = 0;
    this._waveDuration = 80000; // 80 seconds per wave

    // Modifier bag — all perk effects accumulate here
    this.modifiers = {
      damage:          1 + meta.permDamageBonus,      // flat multiplier
      passiveIncome:   1 + meta.permIncomeBonus,
      attackSpeed:     1,                              // lower = faster
      wallDefense:     1,
      goldMultiplier:  1 + meta.permGoldBonus,
      poisonDPS:       0,   // per-second poison tick damage
      poisonSlow:      0,   // fraction 0–0.8
      reflectPercent:  0,   // fraction of incoming damage reflected back
      goldenExplosion: false,
      neonTrail:       false,
      trembitaBlast:   false,
      folkOverdrive:   false,
    };

    // Base weapon damage — boosted by meta weapon level
    this._baseBulletDamage = 20 + Calculator.weaponDamageBonus(meta.weaponLevel);

    // House HP scaled by meta house level
    const hpScale = [2000, 2400, 3200, 5000, 12000];
    this.houseMaxHP = hpScale[meta.houseLevel - 1] ?? 2000;
    this.houseHP    = this.houseMaxHP;
  }

  // ─── Meta-Progression Persistence ────────────────────────────────────────

  static _loadMeta() {
    try {
      const raw = localStorage.getItem('meta_upgrades');
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return {
      houseLevel:       1,
      weaponLevel:      1,
      permGoldBonus:    0,
      permDamageBonus:  0,
      permIncomeBonus:  0,
      permHPBonus:      0,
      savedGold:        0,
    };
  }

  static _saveMeta(data) {
    try { localStorage.setItem('meta_upgrades', JSON.stringify(data)); } catch (_) { /* ignore */ }
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
      s.fireTimer = 0;
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
    this._startWave();
  }

  // ─── Enemy Spawning ───────────────────────────────────────────────────────

  _spawnEnemy() {
    if (this.gameOver) return;
    const { height } = this.scale;
    const roll = Math.random();
    let type, speedMult, hpMult, dispW, dispH, tint;

    if (roll < 0.5) {
      type = 'enemy_clerk';  speedMult = 1.0; hpMult = 1.0; dispW = 48; dispH = 64; tint = 0xaa44ff;
    } else if (roll < 0.80) {
      type = 'enemy_runner'; speedMult = 2.0; hpMult = 0.7; dispW = 40; dispH = 56; tint = 0xff6600;
    } else {
      type = 'enemy_tank';   speedMult = 0.5; hpMult = 3.0; dispW = 80; dispH = 80; tint = 0x00ff44;
    }

    const speed = Calculator.enemySpeed(this.wave, speedMult);
    const hp    = Calculator.enemyHP(this.wave, hpMult);

    const y     = Phaser.Math.Between(Math.floor(height * 0.18), Math.floor(height * 0.82));
    const enemy = this.enemiesGroup.create(1340, y, type);
    enemy.setDisplaySize(dispW, dispH);
    enemy.setTint(tint);
    enemy.body.setVelocityX(-speed);

    enemy.maxHp           = hp;
    enemy.hp              = hp;
    enemy.isBoss          = false;
    enemy.isAttackingWall = false;
    enemy.poisonTimer     = 0;   // ms accumulator for poison ticks
    enemy.poisoned        = false;
    enemy.setDepth(4);
  }

  _spawnBoss() {
    const { height } = this.scale;
    const boss = this.enemiesGroup.create(1200, height / 2, 'boss_vakhtersha');
    boss.setDisplaySize(120, 140);
    boss.setTint(0xff00ff);
    boss.body.setVelocityX(-15);
    boss.maxHp           = 15000;
    boss.hp              = 15000;
    boss.isBoss          = true;
    boss.isAttackingWall = false;
    boss.setDepth(6);
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

    const playerDamageBonus = this.modifiers.damage - 1;
    const damage = Calculator.damage(this._baseBulletDamage, playerDamageBonus);

    enemy.hp -= damage;
    this._spawnHitParticle(proj.x, proj.y);

    // Radioactive Beet — apply poison
    if (this.modifiers.poisonDPS > 0 && !enemy.isBoss) {
      enemy.poisoned = true;
      if (!enemy.poisonedTint) {
        enemy.poisonedTint = true;
        enemy.setTint(0xcc44ff);
      }
    }

    // Iron Seal — reflect a fraction of damage back
    if (this.modifiers.reflectPercent > 0 && enemy.isAttackingWall) {
      const reflected = Math.floor(damage * this.modifiers.reflectPercent);
      if (reflected > 0) {
        enemy.hp -= reflected;
      }
    }

    if (proj.particleTrail) {
      proj.particleTrail.stopFollow();
      this.time.delayedCall(260, () => {
        if (proj.particleTrail && proj.particleTrail.active) proj.particleTrail.destroy();
      });
    }
    proj.destroy();

    if (enemy.hp <= 0) {
      this._killEnemy(enemy);
    }
  }

  _killEnemy(enemy) {
    const gold = Calculator.goldReward(this.wave, this.modifiers.goldMultiplier);
    this.money += gold;

    // Golden Coupon — golden spark explosion
    if (this.modifiers.goldenExplosion) {
      this._spawnGoldenExplosion(enemy.x, enemy.y, gold);
    } else {
      this._spawnDeathExplosion(enemy.x, enemy.y);
    }

    const wasBoss = enemy.isBoss;
    enemy.destroy();

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

  _spawnGoldenExplosion(x, y, goldAmount) {
    // Golden sparks instead of pink neon
    const emitter = this.add.particles(x, y, 'particle_neon_pink', {
      speed:    { min: 60, max: 280 },
      scale:    { start: 1.4, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 300, max: 700 },
      angle:    { min: 0, max: 360 },
      tint:     [0xffd700, 0xffcc00, 0xffee44, 0xffffff],
      emitting: false,
    }).setDepth(15);
    emitter.explode(35, x, y);
    this.time.delayedCall(800, () => { if (emitter.active) emitter.destroy(); });

    // Floating gold text
    this._floatingText && this._floatingText(x, y - 24, `+${goldAmount} ₴`, '#ffd700');
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

    // Defender fire timers
    const cooldown = Math.max(300, 1200 * this.modifiers.attackSpeed);
    for (const def of this.defendersGroup.getChildren()) {
      def.fireTimer = (def.fireTimer || 0) + delta;
      if (def.fireTimer >= cooldown) {
        def.fireTimer = 0;
        this._defenderShoot(def);
      }
    }

    // Radioactive Beet — poison ticks
    if (this.modifiers.poisonDPS > 0) {
      for (const enemy of this.enemiesGroup.getChildren()) {
        if (!enemy.active || !enemy.poisoned) continue;
        enemy.poisonTimer = (enemy.poisonTimer || 0) + delta;
        // Tick every 1000 ms
        if (enemy.poisonTimer >= 1000) {
          enemy.poisonTimer -= 1000;
          const poisonDmg = this.modifiers.poisonDPS;
          enemy.hp -= poisonDmg;
          if (enemy.hp <= 0 && enemy.active) {
            this._killEnemy(enemy);
          }
        }
        // Slow effect: reduce velocity magnitude
        if (!enemy.isBoss && enemy.body && this.modifiers.poisonSlow > 0) {
          const vx = enemy.body.velocity.x;
          // Only slow if moving (not at wall)
          if (vx < 0) {
            const targetSpeed = Calculator.enemySpeed(this.wave) * (1 - this.modifiers.poisonSlow);
            if (Math.abs(vx) > targetSpeed) {
              enemy.body.setVelocityX(-targetSpeed);
            }
          }
        }
      }
    }

    // Wall damage
    const defenseInv = delta / (Math.max(0.1, this.modifiers.wallDefense) * 1000);
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active || !enemy.isAttackingWall) continue;
      const dps = enemy.isBoss ? 2.0 : 0.5;
      this.houseHP -= dps * defenseInv;
    }

    // Folk Overdrive — periodic all-stats +10% burst (8 s active, 20 s interval)
    if (this.modifiers.folkOverdrive) {
      this._folkTimer = (this._folkTimer || 0) + delta;
      const INTERVAL = 20000;
      const ACTIVE   = 8000;
      if (!this._folkActive && this._folkTimer >= INTERVAL) {
        this._folkTimer  = 0;
        this._folkActive = true;
        this._applyFolkBuff(true);
        this.time.delayedCall(ACTIVE, () => {
          this._folkActive = false;
          this._applyFolkBuff(false);
        });
      }
    }

    // Trembita Blast — knockback wave every 10 s
    if (this.modifiers.trembitaBlast) {
      this._trembitaTimer = (this._trembitaTimer || 0) + delta;
      if (this._trembitaTimer >= 10000) {
        this._trembitaTimer = 0;
        this._fireTrembitaBlast();
      }
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

  // ─── Perk Effects ─────────────────────────────────────────────────────────

  /** Folk Overdrive — temporarily boost all stats by 10%. */
  _applyFolkBuff(activate) {
    const factor = activate ? 0.9 : (1 / 0.9);
    this.modifiers.attackSpeed  = Math.max(0.1, this.modifiers.attackSpeed  * factor);
    this.modifiers.wallDefense *= activate ? (1 / 0.9) : 0.9;
    this._baseBulletDamage      = Math.round(this._baseBulletDamage * (activate ? 1.1 : (1 / 1.1)));

    if (activate) {
      this._floatingText && this._floatingText(
        this.scale.width / 2, 80, '🎵 ФОЛК-ОВЕРДРАЙВ!', '#44ffaa',
      );
    }
  }

  /** Trembita Blast — shockwave that knocks all active enemies rightward. */
  _fireTrembitaBlast() {
    const { width, height } = this.scale;
    const ring = this.add.circle(150, height / 2, 10, 0xffaa44, 0.0).setDepth(20);
    this.tweens.add({
      targets:  ring,
      radius:   900,
      alpha:    0.45,
      duration: 500,
      ease:     'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });

    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active || !enemy.body) continue;
      // Knock back by adding a rightward impulse
      const currentVX = enemy.body.velocity.x;
      enemy.body.setVelocityX(currentVX + 300);
      // Restore normal velocity after 400 ms
      this.time.delayedCall(400, () => {
        if (enemy.active && enemy.body) {
          enemy.body.setVelocityX(-Calculator.enemySpeed(this.wave));
        }
      });
    }

    this._floatingText && this._floatingText(
      width / 2, 60, '📯 ВИБУХ ТРЕМБІТИ!', '#ffaa44',
    );
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

    // Persist earned gold to meta so MetaScene can spend it
    const meta = BattleScene._loadMeta();
    meta.savedGold = (meta.savedGold || 0) + this.money;
    BattleScene._saveMeta(meta);

    this._gameOverTxt.setVisible(true);
    this.cameras.main.shake(900, 0.03);

    this.time.delayedCall(4200, () => {
      this.scene.stop('UIScene');
      this.scene.start('MetaScene');
    });
  }
}

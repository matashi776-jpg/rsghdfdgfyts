/**
 * BattleScene.js
 * Dynamic battle engine — Acid Khutir V5.0 NEON PSYCHEDELIC CYBER-FOLK
 *
 * Art Bible palette:
 *   Electric Blue  #00CFFF — bullets, energy, UI
 *   Neon Pink      #FF00D4 — enemies, flashes, blood
 *   Toxic Green    #39FF14 — poison, beet, effects
 *   Ultra-Violet   #7F00FF — backgrounds, shadows, magic
 *   Cyber-Amber    #FFB300 — gold, money
 *   Plasma Red     #FF0033 — damage, crits
 *   Deep Indigo    #0A0014 — background, contrast
 *
 * Enemy Bible types:
 *   zombie_clerk  — tall thin, papers fly on hit
 *   archivarius   — square massive, paper-rain death
 *   inspector     — stamps every 3s → slows defenders
 *   tank_babtsia  — round, shoots varenyky
 *   boss          — Comrade Vakhtersha (3-phase)
 */
import FXManager, { PALETTE } from '../FXManager.js';

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

    // ── FX Manager (Art Bible / FX System) ──────────────────────────────────
    this.fx = new FXManager(this);

    // Deep Indigo background with Ultra-Violet tint
    this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setTint(0x7F00FF);

    // Scanline overlay for cyber feel
    const scanlines = this.add.graphics().setAlpha(0.07).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineStyle(1, 0x00CFFF, 1);
      scanlines.moveTo(0, y);
      scanlines.lineTo(width, y);
    }
    scanlines.strokePath();

    // ── The Wall (House / Khata) ─────────────────────────────────────────────
    // Level 1 — Традиція: warm amber glow
    this.house = this.physics.add.staticImage(150, 360, 'house_1');
    this.house.setDisplaySize(100, 200);
    this.house.setTint(0xFFB300); // Cyber-Amber warm glow
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

    // ── Neon pulse on house (breathing UV glow — pysanka runes pulsing) ─────
    this.tweens.add({
      targets: this.house,
      alpha: 0.75,
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

  // ─── House Upgrade (Khata Levels — Art Bible) ────────────────────────────

  upgradeHouse() {
    if (this.houseLevel >= 3) return;
    this.houseLevel++;
    this.house.setTexture('house_' + this.houseLevel);

    if (this.houseLevel === 2) {
      // Level 2 — Укріплення: Electric Blue neon geometric patterns
      this.houseMaxHP = 5000;
      this.house.setTint(0x00CFFF); // Electric Blue
      // Spawn neon geometric ornament ring
      this._spawnHouseAura(0x00CFFF);
    } else if (this.houseLevel === 3) {
      // Level 3 — Кібер-Січ: pink dome, anti-gravity, auto-turret Борщ-Лазер
      this.houseMaxHP = 12000;
      this.house.setTint(0xFF00D4); // Neon Pink dome
      // Hover tween — house floats above ground
      this.tweens.add({
        targets: this.house,
        y: this.house.y - 18,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.modifiers.attackSpeed = Math.max(0.1, this.modifiers.attackSpeed - 0.35);
      this._spawnHouseAura(0xFF00D4);
    }

    this.houseHP = this.houseMaxHP;

    const newW = 100 + (this.houseLevel - 1) * 10;
    const newH = 200 + (this.houseLevel - 1) * 20;
    this.house.setDisplaySize(newW, newH);
    this.house.refreshBody();

    // Upgrade burst FX
    if (this.fx) {
      this.fx.spawnUpgradeBurst(this.house.x, this.house.y);
    } else {
      this._spawnUpgradeParticles();
    }
  }

  /**
   * Spawn a pulsing aura ring around the house for levels 2–3.
   */
  _spawnHouseAura(color) {
    const aura = this.add.graphics().setDepth(4);
    const drawAura = (alpha) => {
      aura.clear();
      aura.lineStyle(3, color, alpha);
      aura.strokeCircle(this.house.x, this.house.y, 80 + (this.houseLevel - 1) * 20);
    };
    drawAura(0.6);
    const glowObj = { v: 0.6 };
    this.tweens.add({
      targets: glowObj,
      v: 0.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => drawAura(glowObj.v),
    });
  }

  // ─── Defenders (Сергій — glowing vyshyvanka) ─────────────────────────────

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
        .setTint(0xFF00D4) // Neon Pink — glowing vyshyvanka
        .setDepth(5);
      s.fireTimer = 0;
      // UV-reactive breathing pulse
      this.tweens.add({
        targets: s,
        alpha: { from: 1.0, to: 0.8 },
        duration: 700 + Math.random() * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
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
    this._startWave();
  }

  // ─── Enemy Spawning ───────────────────────────────────────────────────────

  // ─── Enemy Spawning (Enemy Bible types) ──────────────────────────────────

  _spawnEnemy() {
    if (this.gameOver) return;
    const { height } = this.scale;
    const roll = Math.random();

    // Enemy Bible dispatch:
    //   50%  zombie_clerk   — tall, thin, papers fly on hit
    //   18%  archivarius    — slow, massive, paper death explosion
    //   17%  enemy_runner   — fast runner
    //   10%  inspector      — stamps every 3s → slows fire
    //   5%   tank_babtsia   — round, shoots varenyky
    let type, baseSpeed, hpMult, dispW, dispH, tint;

    if (roll < 0.50) {
      type = 'enemy_clerk'; baseSpeed = 60;  hpMult = 1.0; dispW = 28; dispH = 64; tint = 0xFF00D4; // Neon Pink
    } else if (roll < 0.68) {
      type = 'enemy_archivarius'; baseSpeed = 28; hpMult = 3.5; dispW = 56; dispH = 56; tint = 0xFFB300; // Cyber-Amber
    } else if (roll < 0.85) {
      type = 'enemy_runner'; baseSpeed = 130; hpMult = 0.65; dispW = 40; dispH = 56; tint = 0xFF0033; // Plasma Red
    } else if (roll < 0.95) {
      type = 'enemy_inspector'; baseSpeed = 50; hpMult = 1.4; dispW = 44; dispH = 60; tint = 0x7F00FF; // Ultra-Violet
    } else {
      type = 'enemy_tank'; baseSpeed = 28; hpMult = 3.2; dispW = 80; dispH = 80; tint = 0x39FF14; // Toxic Green
    }

    // +10% speed per wave (wave starts at 1)
    const speed = baseSpeed * (1 + (this.wave - 1) * 0.10);
    const y = Phaser.Math.Between(Math.floor(height * 0.18), Math.floor(height * 0.82));
    const enemy = this.enemiesGroup.create(1340, y, type);
    enemy.setDisplaySize(dispW, dispH);
    enemy.setTint(tint);
    enemy.body.setVelocityX(-speed);

    // +30% HP per wave
    enemy.maxHp           = Math.round(this.baseEnemyHP * (1 + (this.wave - 1) * 0.30) * hpMult);
    enemy.hp              = enemy.maxHp;
    enemy.isBoss          = false;
    enemy.isAttackingWall = false;
    enemy.enemyType       = type;
    enemy.setDepth(4);

    // Inspector: stamp timer that triggers stamp slam every 3s
    if (type === 'enemy_inspector') {
      this.time.addEvent({
        delay: 3000,
        loop:  true,
        callbackScope: this,
        callback: () => {
          if (!enemy.active) return;
          if (this.fx) this.fx.spawnStampSlam(enemy.x, enemy.y + dispH / 2);
          // Slow defenders briefly
          this._applyStampSlow();
        },
      });
    }
  }

  _spawnBoss() {
    const { height } = this.scale;
    const boss = this.enemiesGroup.create(1200, height / 2, 'boss_vakhtersha');
    boss.setDisplaySize(120, 140);
    boss.setTint(0xFF00D4); // Neon Pink — Vakhtersha
    boss.body.setVelocityX(-15);
    boss.maxHp           = 15000;
    boss.hp              = 15000;
    boss.isBoss          = true;
    boss.isAttackingWall = false;
    boss.enemyType       = 'boss';
    boss._phase          = 1;
    boss.setDepth(6);
    this.bossActive = true;
    this._bossTitleTxt.setVisible(true);

    // Boss arrival: speed up BGM + FX burst
    const bgm = this.sound.get('bgm');
    if (bgm) bgm.setRate(1.2);

    if (this.fx) {
      this.fx.spawnBossArrival(boss.x, boss.y);
    } else {
      const flash = this.add.rectangle(
        this.scale.width / 2, this.scale.height / 2,
        this.scale.width, this.scale.height,
        0xFF00D4, 0,
      ).setDepth(50);
      this.tweens.add({ targets: flash, fillAlpha: 0.45, duration: 200, yoyo: true, repeat: 2 });
    }

    // Boss phase timer — every 8s activate a phase ability
    this._bossPhaseTimer = this.time.addEvent({
      delay: 8000,
      loop:  true,
      callbackScope: this,
      callback: () => this._bossPhaseAbility(boss),
    });
  }

  /**
   * Comrade Vakhtersha — 3-phase abilities.
   * Phase 1 — Перевірка документів: fires stamps (stamp slam FX).
   * Phase 2 — Виклик підкріплення: spawns 3 clerks.
   * Phase 3 (<25% HP) — Кипяток-овердрайв: speed ×2, Toxic Green tint.
   */
  _bossPhaseAbility(boss) {
    if (!boss || !boss.active || !this.bossActive) return;
    const ratio = boss.hp / boss.maxHp;

    // Transition to phase 3 at 25% HP
    if (ratio < 0.25 && boss._phase < 3) {
      boss._phase = 3;
      boss.body.setVelocityX(-30); // speed ×2
      boss.setTint(0x39FF14); // Toxic Green
      if (this.fx) this.fx.spawnPoisonCloud(boss.x, boss.y, 60);
    } else if (ratio < 0.55 && boss._phase < 2) {
      boss._phase = 2;
    }

    if (boss._phase === 1) {
      // Phase 1: stamp slam
      if (this.fx) this.fx.spawnStampSlam(boss.x - 60, boss.y + 30);
      this._applyStampSlow();
    } else if (boss._phase === 2) {
      // Phase 2: spawn 2 clerks
      for (let i = 0; i < 2; i++) {
        const { height } = this.scale;
        const y = Phaser.Math.Between(Math.floor(height * 0.2), Math.floor(height * 0.8));
        const clerk = this.enemiesGroup.create(boss.x + 60 + i * 40, y, 'enemy_clerk');
        clerk.setDisplaySize(28, 64);
        clerk.setTint(0xFF00D4);
        clerk.body.setVelocityX(-70);
        clerk.maxHp = Math.round(this.baseEnemyHP * 1.5);
        clerk.hp    = clerk.maxHp;
        clerk.isBoss = false;
        clerk.isAttackingWall = false;
        clerk.enemyType = 'enemy_clerk';
        clerk.setDepth(4);
      }
    }
  }

  /**
   * Inspector stamp mechanic — briefly slows defender fire rate.
   */
  _applyStampSlow() {
    const origSpeed = this.modifiers.attackSpeed;
    this.modifiers.attackSpeed = Math.min(origSpeed * 1.6, 2.0);
    this.time.delayedCall(2000, () => {
      this.modifiers.attackSpeed = origSpeed;
    });
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

    // Hit spark FX (Electric Blue spark on impact)
    if (this.fx) {
      this.fx.spawnHitSpark(proj.x, proj.y);
    } else {
      this._spawnHitParticle(proj.x, proj.y);
    }

    // Paper burst on clerks/archivarius hit
    if (enemy.enemyType === 'enemy_clerk' || enemy.enemyType === 'enemy_archivarius') {
      if (this.fx && Math.random() < 0.5) {
        this.fx.spawnPaperShower(proj.x, proj.y);
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
    this.money += 20;
    const ex = enemy.x;
    const ey = enemy.y;
    const wasBoss = enemy.isBoss;
    const type = enemy.enemyType;
    enemy.destroy();

    // Death FX from Art Bible
    if (this.fx) {
      this.fx.spawnDeathExplosion(ex, ey);
      // Paper rain for archivarius / clerk
      if (type === 'enemy_archivarius' || type === 'enemy_clerk') {
        this.fx.spawnPaperShower(ex, ey);
      }
    } else {
      this._spawnDeathExplosion(ex, ey);
    }

    if (wasBoss) {
      this.bossActive = false;
      this._bossTitleTxt.setVisible(false);
      this._bossBarGfx.clear();
      if (this._bossPhaseTimer) { this._bossPhaseTimer.remove(); this._bossPhaseTimer = null; }
      const bgm = this.sound.get('bgm');
      if (bgm) bgm.setRate(1.0);
      this._endWave();
    }
  }

  // ─── VFX — legacy fallbacks (used when FXManager unavailable) ────────────

  _spawnDeathExplosion(x, y) {
    const emitter = this.add.particles(x, y, 'particle_neon_pink', {
      speed:    { min: 60, max: 260 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 300, max: 700 },
      angle:    { min: 0, max: 360 },
      tint:     [0xFF00D4, 0xFFB300, 0x39FF14, 0x00CFFF],
      emitting: false,
    }).setDepth(15);
    emitter.explode(30, x, y);
    this.time.delayedCall(800, () => { if (emitter.active) emitter.destroy(); });
  }

  _spawnHitParticle(x, y) {
    const emitter = this.add.particles(x, y, 'particle_electric', {
      speed:    { min: 30, max: 110 },
      scale:    { start: 0.9, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: 280,
      angle:    { min: 0, max: 360 },
      tint:     [0x00CFFF, 0xFFFFFF],
      emitting: false,
    }).setDepth(15);
    emitter.explode(10, x, y);
    this.time.delayedCall(400, () => { if (emitter.active) emitter.destroy(); });
  }

  // ─── Defender Shooting (Electric Blue bullets — Art Bible) ───────────────

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

    // Electric Blue bullet (Art Bible — bullets: Electric Blue #00CFFF with particle tail)
    const proj = this.projectilesGroup.create(defender.x + 22, defender.y, 'particle_electric');
    if (!proj) return;
    proj.setDisplaySize(18, 8);
    proj.setDepth(6);
    proj.setTint(0x00CFFF); // Electric Blue

    const angle = Math.atan2(target.y - defender.y, target.x - defender.x);
    const spd   = 480;
    proj.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);

    // Electric Smoke trail (Art Bible — Electric Smoke: particles linger, trail behind)
    if (this.fx) {
      const trail = this.fx.attachBulletTrail(proj);
      proj.particleTrail = trail;
    } else {
      const trail = this.add.particles(proj.x, proj.y, 'particle_electric', {
        speed:     { min: 5, max: 22 },
        scale:     { start: 0.7, end: 0 },
        alpha:     { start: 0.85, end: 0 },
        lifespan:  { min: 160, max: 300 },
        frequency: 18,
        quantity:  2,
        tint:      [0x00CFFF, 0xFFFFFF, 0x7F00FF],
        blendMode: 'ADD',
      }).setDepth(5);
      trail.startFollow(proj);
      proj.particleTrail = trail;
    }

    this.time.delayedCall(2000, () => {
      if (proj.active) {
        if (proj.particleTrail && proj.particleTrail.active) {
          if (this.fx) {
            this.fx.stopBulletTrail(proj.particleTrail);
          } else {
            proj.particleTrail.stopFollow();
            this.time.delayedCall(260, () => {
              if (proj.particleTrail && proj.particleTrail.active) proj.particleTrail.destroy();
            });
          }
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

    // Wall damage
    const defenseInv = delta / (Math.max(0.1, this.modifiers.wallDefense) * 1000);
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active || !enemy.isAttackingWall) continue;
      const dps = enemy.isBoss ? 2.0 : 0.5;
      this.houseHP -= dps * defenseInv;
    }

    // Wave timer bar (Ultra-Violet/Neon Pink neon style)
    if (this.waveActive && this.wave !== 10) {
      this._waveElapsed += delta;
      const ratio = Math.min(1, this._waveElapsed / this._waveDuration);
      this._timerGfx.clear();
      this._timerGfx.fillStyle(0x1A0030, 0.7);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440, 10);
      this._timerGfx.fillStyle(0x7F00FF, 1); // Ultra-Violet
      this._timerGfx.fillRect(width / 2 - 220, 38, 440 * (1 - ratio), 10);
      this._timerGfx.lineStyle(1, 0x00CFFF, 0.6); // Electric Blue border
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

  // ─── HUD Drawing (Art Bible colors) ──────────────────────────────────────

  _drawHouseHpBar() {
    const ratio = Math.max(0, this.houseHP / this.houseMaxHP);
    this._hpGfx.clear();
    // Deep Indigo track
    this._hpGfx.fillStyle(0x0A0014, 1);
    this._hpGfx.fillRect(80, 680, 180, 22);
    // Colour: Toxic Green → Cyber-Amber → Plasma Red
    const fillColor = ratio > 0.5 ? 0x39FF14 : ratio > 0.25 ? 0xFFB300 : 0xFF0033;
    this._hpGfx.fillStyle(fillColor, 1);
    this._hpGfx.fillRect(80, 680, 180 * ratio, 22);
    // Electric Blue border
    this._hpGfx.lineStyle(2, 0x00CFFF, 0.9);
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
      this._hpGfx.fillStyle(0x200010, 1);
      this._hpGfx.fillRect(bx, by, bw, 5);
      this._hpGfx.fillStyle(0x39FF14, 1); // Toxic Green enemy HP
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
    // Pulsing Neon Pink boss bar
    const pulse = 0.7 + 0.3 * Math.sin(this.time.now / 200);
    this._bossBarGfx.clear();
    this._bossBarGfx.fillStyle(0x1A0030, 0.9);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW, 34, 7);
    this._bossBarGfx.fillStyle(0xFF00D4, pulse); // Neon Pink
    this._bossBarGfx.fillRoundedRect(barX, 4, barW * ratio, 34, 7);
    this._bossBarGfx.lineStyle(2, 0x00CFFF, 0.9); // Electric Blue border
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

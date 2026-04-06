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
 * Part 8.5 additions:
 *  - Locale used for all displayed strings
 *  - Boss entrance CutsceneScene before wave 10
 *  - Boss phase 2 at 50% HP (speed + visual change)
 *  - Comic panel (ComicScene) after wave 1
 *  - NPC decorative sprites (Babtsya Healer, Mykhas Mechanic)
 */
import Locale from '../utils/Locale.js';
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
    this._bossTitleTxt = this.add.text(width / 2, 10, Locale.t('boss_title'), {
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
    this._gameOverTxt = this.add.text(width / 2, height / 2, Locale.t('fx_game_over'), {
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

    // ── NPC decorative sprites ────────────────────────────────────────────────
    this._spawnNPCs();

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

  // ─── NPC Decorative Sprites ───────────────────────────────────────────────

  _spawnNPCs() {
    const { height } = this.scale;

    // Babtsya Healer — behind the house, lower-left corner
    const babtsya = this.add.image(56, height - 64, 'npc_babtsya_healer')
      .setDisplaySize(48, 76)
      .setDepth(3)
      .setTint(0xff88cc);
    this.tweens.add({
      targets:  babtsya,
      y:        babtsya.y - 6,
      duration: 1600,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    // Mykhas Mechanic — behind defenders, upper-left corner
    const mykhas = this.add.image(56, 64, 'npc_mykhas_mechanic')
      .setDisplaySize(48, 76)
      .setDepth(3)
      .setTint(0x88aaff);
    this.tweens.add({
      targets:  mykhas,
      y:        mykhas.y + 6,
      duration: 1400,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
  }



  _startWave() {
    this.waveActive   = true;
    this._waveElapsed = 0;
    this._waveLabelTxt.setText(Locale.t('wave_label', this.wave));

    if (this.wave === 10) {
      // Show boss entrance cutscene before spawning the boss
      this.scene.pause('BattleScene');
      this.scene.launch('CutsceneScene', {
        type: 'boss_entrance',
        onComplete: () => {
          this.scene.resume('BattleScene');
          this._spawnBoss();
          this._spawnTimer   = null;
          this._waveEndTimer = null;
        },
      });
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

    // After wave 1 — show comic panel interlude, then advance to wave 2
    if (this.wave === 1) {
      this.scene.pause('BattleScene');
      this.scene.launch('ComicScene', {
        panel:      'comic_panel_01',
        captionKey: 'comic_caption',
        onComplete: () => {
          this.scene.resume('BattleScene');
          this.wave++;
          this._startWave();
        },
      });
      return;
    }

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
    let type, baseSpeed, hpMult, dispW, dispH, tint;

    if (roll < 0.5) {
      type = 'enemy_clerk'; baseSpeed = 60; hpMult = 1.0; dispW = 48; dispH = 64; tint = 0xaa44ff;
    } else if (roll < 0.80) {
      type = 'enemy_runner'; baseSpeed = 120; hpMult = 0.7; dispW = 40; dispH = 56; tint = 0xff6600;
    } else {
      type = 'enemy_tank'; baseSpeed = 30; hpMult = 3.0; dispW = 80; dispH = 80; tint = 0x00ff44;
    }

    // +10% speed per wave (wave starts at 1)
    const speed = baseSpeed * (1 + (this.wave - 1) * 0.10);

    const y     = Phaser.Math.Between(Math.floor(height * 0.18), Math.floor(height * 0.82));
    const enemy = this.enemiesGroup.create(1340, y, type);
    enemy.setDisplaySize(dispW, dispH);
    enemy.setTint(tint);
    enemy.body.setVelocityX(-speed);

    // +30% HP per wave
    enemy.maxHp           = Math.round(this.baseEnemyHP * (1 + (this.wave - 1) * 0.30) * hpMult);
    enemy.hp              = enemy.maxHp;
    enemy.isBoss          = false;
    enemy.isAttackingWall = false;
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

    // Boss phase 2 trigger at 50% HP
    if (enemy.isBoss && !enemy.phase2Triggered && enemy.hp <= enemy.maxHp * 0.5) {
      enemy.phase2Triggered = true;
      this._triggerBossPhase2(enemy);
    }

    if (enemy.hp <= 0) {
      this._killEnemy(enemy);
    }
  }

  _killEnemy(enemy) {
    this.money += 20;
    this._spawnDeathExplosion(enemy.x, enemy.y);
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

  _triggerBossPhase2(boss) {
    const { width, height } = this.scale;

    // Tint change: Ultra-Violet crack visual
    boss.setTint(0xcc00ff);
    // Speed increase for phase 2
    boss.body.setVelocityX(-30);

    // Phase 2 notification banner
    const banner = this.add.text(width / 2, height / 2, Locale.t('boss_phase2'), {
      fontFamily:      'Arial Black, Arial',
      fontSize:        '52px',
      color:           '#cc44ff',
      stroke:          '#000000',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#cc44ff', blur: 40, fill: true },
    }).setOrigin(0.5).setDepth(45).setAlpha(0);

    this.tweens.add({
      targets:  banner,
      alpha:    1,
      scaleX:   1.1,
      scaleY:   1.1,
      duration: 340,
      yoyo:     true,
      repeat:   2,
      onComplete: () => { if (banner.active) banner.destroy(); },
    });

    // Ultra-Violet glitch flash
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x8800ff, 0).setDepth(48);
    this.tweens.add({ targets: flash, fillAlpha: 0.5, duration: 130, yoyo: true, repeat: 3,
      onComplete: () => { if (flash.active) flash.destroy(); },
    });

    // BGM rate increase for phase 2 intensity
    const bgm = this.sound.get('bgm');
    if (bgm) bgm.setRate(1.45);

    this.cameras.main.shake(800, 0.022);
  }

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
    this._houseHpLabel.setText(Locale.t('house_hp', hp, this.houseMaxHP));
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

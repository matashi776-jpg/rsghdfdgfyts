/**
 * BattleScene.js
 * Dynamic battle engine — Оборона Ланчина V5.0 ACID KHUTIR
 *
 * Level 1 — Cyber-Khutir (1280×720) per design spec 8.6.10:
 *   Wave 1 : 6  Zombie Clerks
 *   Wave 2 : 8  Zombie Clerks + 2 Archivarius
 *   Wave 3 : 10 Zombie Clerks + 3 Archivarius + 1 Inspector
 *   Boss   : Mini-Vakhtersha (HP 600, wave 4)
 *
 * Music layers progress with waves (8.6.1):
 *   Layer 1 (BGM ×0.85) → Layer 2 (×1.0) → Layer 3 (×1.1) → Boss (×1.25)
 *
 * FX guide (8.6.2): pysanka-burst hit FX, expanding mandala explosion,
 *   glitch-vortex boss FX.
 *
 * Localization: UA (Прикарпатська) / EN — via Localization.js (8.6.9)
 */
import L from '../utils/Localization.js';

// ─── Level 1 wave definitions (spec 8.6.10) ───────────────────────────────────
const LEVEL1_WAVES = [
  // Wave 1
  [{ type: 'enemy_clerk', count: 6 }],
  // Wave 2
  [{ type: 'enemy_clerk', count: 8 }, { type: 'enemy_archivarius', count: 2 }],
  // Wave 3
  [{ type: 'enemy_clerk', count: 10 }, { type: 'enemy_archivarius', count: 3 }, { type: 'enemy_inspector', count: 1 }],
];

// Per-type spawn profiles
const ENEMY_PROFILES = {
  enemy_clerk:       { baseSpeed: 60,  hpMult: 1.0, dispW: 48, dispH: 64, tint: 0xaa44ff, reward: 20 },
  enemy_archivarius: { baseSpeed: 90,  hpMult: 1.4, dispW: 56, dispH: 72, tint: 0x00ffaa, reward: 30 },
  enemy_inspector:   { baseSpeed: 30,  hpMult: 3.5, dispW: 80, dispH: 80, tint: 0xff8800, reward: 50 },
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init() {
    this.wave               = 1;   // waves 1-3 regular; wave 4 = mini-boss
    this.houseLevel         = 1;
    this.baseEnemyHP        = 100;
    this.money              = 50;
    this.gameOver           = false;
    this.bossActive         = false;
    this.waveActive         = false;
    this._waveElapsed       = 0;
    this._waveDuration      = 80000; // kept for UIScene compatibility
    this.modifiers          = {
      damage:        1,
      passiveIncome: 1,
      attackSpeed:   1,
      wallDefense:   1,
    };
    this.houseMaxHP         = 2000;
    this.houseHP            = 2000;
    this._pendingSpawns     = 0;
    this._aliveEnemies      = 0;
    this._spawnQueue        = [];
    this._spawnIndex        = 0;
    this._babtsyaHealUsed   = false;
    this._lang              = 'ua';
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

    // ── NPC: Babtsya Healer ─────────────────────────────────────────────────
    this._createBabtsya();

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
    // Wave counter — Electric Blue (UI guide 8.6.3)
    this._waveLabelTxt = this.add.text(width / 2, 8, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '22px',
      color:      '#0088ff',
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#0088ff', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(10);

    // Boss HP label — Neon Pink
    this._bossTitleTxt = this.add.text(width / 2, 10, L[this._lang].bossName, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '16px',
      color:      '#ff00aa',
      stroke:     '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00aa', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(11).setVisible(false);

    // House HP label — Toxic Green (UI guide 8.6.3)
    this._houseHpLabel = this.add.text(82, 676, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#00ff44',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff44', blur: 8, fill: true },
    }).setDepth(10);

    // Game-over text — localized (8.6.9)
    this._gameOverTxt = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '52px',
      color:      '#ff00aa',
      stroke:     '#000000',
      strokeThickness: 12,
      wordWrap:   { width: width * 0.85 },
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00aa', blur: 40, fill: true },
    }).setOrigin(0.5).setVisible(false).setDepth(40);

    // Victory text — Toxic Green (8.6.9)
    this._victoryTxt = this.add.text(width / 2, height / 2, L[this._lang].victory, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '64px',
      color:      '#00ff44',
      stroke:     '#000000',
      strokeThickness: 12,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff44', blur: 40, fill: true },
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

  // ─── NPC: Babtsya Healer (spec 8.6.5 + 8.6.10) ───────────────────────────

  _createBabtsya() {
    this._babtsya = this.add.image(80, 480, 'npc_babtsya')
      .setDisplaySize(48, 72)
      .setTint(0xcc44ff)
      .setDepth(5);
    this.tweens.add({
      targets:  this._babtsya,
      y:        this._babtsya.y - 8,
      duration: 1200,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
    this._babtsyaDialogTxt = this.add.text(84, 430, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '11px',
      color:      '#000000',
      backgroundColor: '#fffbe6',
      padding:    { x: 4, y: 2 },
      wordWrap:   { width: 160 },
      align:      'center',
    }).setOrigin(0.5, 1).setDepth(20).setVisible(false);
  }

  _tryBabtsyaHeal() {
    if (this._babtsyaHealUsed) return;
    if (this.houseHP / this.houseMaxHP > 0.5) return;
    this._babtsyaHealUsed = true;
    // Heal 20 HP once (spec 8.6.10)
    this.houseHP = Math.min(this.houseMaxHP, this.houseHP + 20);
    this._babtsyaDialogTxt.setText(L[this._lang].babtsya).setVisible(true);
    this.time.delayedCall(3500, () => {
      if (this._babtsyaDialogTxt) this._babtsyaDialogTxt.setVisible(false);
    });
    this._spawnHealParticles(this.house.x, this.house.y);
  }

  _spawnHealParticles(x, y) {
    const em = this.add.particles(x, y, 'particle_neon_green', {
      speed:    { min: 40, max: 160 },
      scale:    { start: 1.2, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 400, max: 800 },
      angle:    { min: 0, max: 360 },
      tint:     [0x00ff44, 0x00ffff],
      emitting: false,
    }).setDepth(15);
    em.explode(20, x, y);
    this.time.delayedCall(900, () => { if (em.active) em.destroy(); });
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

  // ─── Wave Management (Level 1, spec 8.6.10) ──────────────────────────────
  // Music layers per spec 8.6.1:
  //   Wave 1 (Quiet Khutir)   → BGM ×0.85
  //   Wave 2 (Incoming)       → BGM ×1.0
  //   Wave 3 (Combat Rave)    → BGM ×1.1
  //   Wave 4 / Boss Overdrive → BGM ×1.25

  _setMusicLayer(layer) {
    const rates = { 1: 0.85, 2: 1.0, 3: 1.1, 4: 1.25 };
    const bgm = this.sound.get('bgm');
    if (bgm) bgm.setRate(rates[layer] ?? 1.0);
  }

  _startWave() {
    this.waveActive     = true;
    this._waveElapsed   = 0;
    this._aliveEnemies  = 0;
    this._spawnIndex    = 0;
    this._spawnQueue    = [];

    if (this.wave <= 3) {
      // ── Regular waves 1-3 ─────────────────────────────────────────────────
      this._waveLabelTxt.setText(`${L[this._lang].wave}: ${this.wave}`);
      this._setMusicLayer(this.wave);

      const waveDef = LEVEL1_WAVES[this.wave - 1];
      for (const entry of waveDef) {
        for (let i = 0; i < entry.count; i++) {
          this._spawnQueue.push(entry.type);
        }
      }
      Phaser.Utils.Array.Shuffle(this._spawnQueue);

      const interval = Math.max(400, 1800 - this.wave * 150);
      this._spawnTimer = this.time.addEvent({
        delay:         interval,
        loop:          true,
        callbackScope: this,
        callback:      this._spawnNextQueued,
      });
      this._spawnNextQueued();
      this._waveEndTimer = null;
    } else {
      // ── Wave 4: Mini-Boss ─────────────────────────────────────────────────
      this._waveLabelTxt.setText(L[this._lang].bossName);
      this._setMusicLayer(4);
      this._spawnBoss();
      this._spawnTimer   = null;
      this._waveEndTimer = null;
    }
  }

  _spawnNextQueued() {
    if (this.gameOver) return;
    if (this._spawnIndex >= this._spawnQueue.length) {
      if (this._spawnTimer) { this._spawnTimer.remove(); this._spawnTimer = null; }
      return;
    }
    const type = this._spawnQueue[this._spawnIndex++];
    this._spawnEnemy(type);
  }

  _endWave() {
    this.waveActive = false;
    if (this._spawnTimer)   { this._spawnTimer.remove();   this._spawnTimer   = null; }
    if (this._waveEndTimer) { this._waveEndTimer.remove(); this._waveEndTimer = null; }
    this._timerGfx.clear();

    if (this.wave === 3) {
      // Perk screen before boss wave
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

  _onEnemyKilled() {
    this._aliveEnemies--;
    if (this._aliveEnemies < 0) this._aliveEnemies = 0;
    if (
      this.waveActive &&
      this._aliveEnemies === 0 &&
      (this._spawnTimer === null && this._spawnIndex >= this._spawnQueue.length)
    ) {
      this.time.delayedCall(600, () => {
        if (!this.gameOver && this.waveActive) this._endWave();
      });
    }
  }

  // ─── Enemy Spawning ───────────────────────────────────────────────────────

  _spawnEnemy(type) {
    if (this.gameOver) return;
    const { height } = this.scale;
    const profile = ENEMY_PROFILES[type] ?? ENEMY_PROFILES.enemy_clerk;

    const speed = profile.baseSpeed * (1 + (this.wave - 1) * 0.10);
    const y     = Phaser.Math.Between(Math.floor(height * 0.18), Math.floor(height * 0.82));
    const enemy = this.enemiesGroup.create(1340, y, type);
    enemy.setDisplaySize(profile.dispW, profile.dispH);
    enemy.setTint(profile.tint);
    enemy.body.setVelocityX(-speed);

    enemy.maxHp           = Math.round(this.baseEnemyHP * (1 + (this.wave - 1) * 0.30) * profile.hpMult);
    enemy.hp              = enemy.maxHp;
    enemy.isBoss          = false;
    enemy.isAttackingWall = false;
    enemy.reward          = profile.reward;
    enemy.setDepth(4);
    this._aliveEnemies++;
  }

  _spawnBoss() {
    const { height } = this.scale;
    const boss = this.enemiesGroup.create(1200, height / 2, 'boss_vakhtersha');
    boss.setDisplaySize(120, 140);
    boss.setTint(0xff00ff);
    boss.body.setVelocityX(-18);
    // Mini-Vakhtersha HP = 600 per spec 8.6.10
    boss.maxHp           = 600;
    boss.hp              = 600;
    boss.isBoss          = true;
    boss.isAttackingWall = false;
    boss.reward          = 200;
    boss.setDepth(6);
    this.bossActive = true;
    this._bossTitleTxt.setVisible(true);
    this._aliveEnemies++;

    // Screen flash — Neon Pink
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
    // Pysanka-burst hit FX (8.6.2 — fx_hit_01)
    this._spawnPysankaHitFX(proj.x, proj.y);
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
    this.money += enemy.reward ?? 20;
    const wasBoss = enemy.isBoss;
    const ex = enemy.x;
    const ey = enemy.y;

    if (wasBoss) {
      this._spawnBossExplosionFX(ex, ey);
    } else {
      this._spawnPysankaExplosionFX(ex, ey);
    }
    enemy.destroy();
    this._onEnemyKilled();

    if (wasBoss) {
      this.bossActive = false;
      this._bossTitleTxt.setVisible(false);
      this._bossBarGfx.clear();
      this._setMusicLayer(1);
      this._triggerVictory();
    }
  }

  // ─── VFX — FX Guide (8.6.2) ──────────────────────────────────────────────

  /** fx_hit_01 — pysanka burst, Neon Pink + Toxic Green */
  _spawnPysankaHitFX(x, y) {
    const em = this.add.particles(x, y, 'particle_neon_pink', {
      speed:    { min: 40, max: 140 },
      scale:    { start: 1.0, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 200, max: 450 },
      angle:    { min: 0, max: 360 },
      tint:     [0xff00aa, 0x00ff44],
      emitting: false,
    }).setDepth(15);
    em.explode(14, x, y);
    this.time.delayedCall(500, () => { if (em.active) em.destroy(); });
  }

  /** fx_explosion_01 — expanding pysanka mandala, Neon Pink + Electric Blue */
  _spawnPysankaExplosionFX(x, y) {
    const em = this.add.particles(x, y, 'particle_electric_blue', {
      speed:    { min: 60, max: 280 },
      scale:    { start: 1.6, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 350, max: 750 },
      angle:    { min: 0, max: 360 },
      tint:     [0xff00aa, 0x0088ff, 0xffffff],
      emitting: false,
    }).setDepth(15);
    em.explode(32, x, y);
    this.time.delayedCall(850, () => { if (em.active) em.destroy(); });
  }

  /** fx_boss_explosion_01 — glitch storm vortex, Ultra-Violet + Toxic Green */
  _spawnBossExplosionFX(x, y) {
    const em1 = this.add.particles(x, y, 'particle_ultra_violet', {
      speed:    { min: 80, max: 380 },
      scale:    { start: 2.0, end: 0 },
      alpha:    { start: 1, end: 0 },
      lifespan: { min: 500, max: 1200 },
      angle:    { min: 0, max: 360 },
      tint:     [0x8800ff, 0x00ff44, 0xff00ff],
      emitting: false,
    }).setDepth(16);
    em1.explode(60, x, y);
    const em2 = this.add.particles(x, y, 'particle_toxic_green', {
      speed:    { min: 180, max: 420 },
      scale:    { start: 0.8, end: 0 },
      alpha:    { start: 0.9, end: 0 },
      lifespan: { min: 600, max: 1000 },
      angle:    { min: 0, max: 360 },
      tint:     [0x00ff44, 0x8800ff],
      emitting: false,
    }).setDepth(16);
    em2.explode(40, x, y);
    this.cameras.main.shake(700, 0.022);
    this.time.delayedCall(1500, () => {
      if (em1.active) em1.destroy();
      if (em2.active) em2.destroy();
    });
  }

  // ─── Defender Shooting ────────────────────────────────────────────────────

  _defenderShoot(defender) {
    const enemies = this.enemiesGroup.getChildren().filter((e) => e.active);
    if (enemies.length === 0) return;

    let target  = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const dx = e.x - defender.x;
      const dy = e.y - defender.y;
      const d  = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; target = e; }
    }
    if (!target || minDist > 700 * 700) return;

    // Bullet FX — Electric Blue + Ultra-Violet streak (8.6.2)
    const proj = this.projectilesGroup.create(defender.x + 22, defender.y, 'particle_electric_blue');
    if (!proj) return;
    proj.setDisplaySize(18, 10);
    proj.setDepth(6);
    proj.setTint(0x0088ff);

    const angle = Math.atan2(target.y - defender.y, target.x - defender.x);
    proj.body.setVelocity(Math.cos(angle) * 480, Math.sin(angle) * 480);

    const trail = this.add.particles(proj.x, proj.y, 'particle_ultra_violet', {
      speed:     { min: 8, max: 40 },
      scale:     { start: 0.7, end: 0 },
      alpha:     { start: 0.9, end: 0 },
      lifespan:  200,
      frequency: 18,
      quantity:  2,
      tint:      [0x0088ff, 0x8800ff],
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

    // Defender fire timers
    const cooldown = Math.max(300, 1200 * this.modifiers.attackSpeed);
    for (const def of this.defendersGroup.getChildren()) {
      def.fireTimer = (def.fireTimer || 0) + delta;
      if (def.fireTimer >= cooldown) {
        def.fireTimer = 0;
        this._defenderShoot(def);
      }
    }

    // Wall damage from attacking enemies
    const defenseInv = delta / (Math.max(0.1, this.modifiers.wallDefense) * 1000);
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active || !enemy.isAttackingWall) continue;
      const dps = enemy.isBoss ? 2.0 : 0.5;
      this.houseHP -= dps * defenseInv;
    }

    // Babtsya Healer check
    this._tryBabtsyaHeal();

    // HUD
    this._drawHouseHpBar();
    this._drawEnemyHpBars();
    if (this.bossActive) this._drawBossHpBar();

    // Out-of-bounds cleanup
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (enemy.active && enemy.x < -120) {
        enemy.destroy();
        this._onEnemyKilled();
      }
    }

    // Game-over check (hut destroyed — spec 8.6.10 failure condition)
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
    // Rushnyk-style frame (UI guide 8.6.3)
    this._hpGfx.fillStyle(0x110022, 1);
    this._hpGfx.fillRoundedRect(80, 680, 180, 22, 4);
    // Toxic Green fill per UI guide
    const fillColor = ratio > 0.5 ? 0x00ff44 : ratio > 0.25 ? 0xffaa00 : 0xff00aa;
    this._hpGfx.fillStyle(fillColor, 1);
    this._hpGfx.fillRoundedRect(80, 680, 180 * ratio, 22, 4);
    this._hpGfx.lineStyle(2, 0xff00aa, 0.9);
    this._hpGfx.strokeRoundedRect(80, 680, 180, 22, 4);
    const hp = Math.max(0, Math.ceil(this.houseHP));
    this._houseHpLabel.setText(`${L[this._lang].hutHp}: ${hp} / ${this.houseMaxHP}`);
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
      this._hpGfx.fillStyle(0x00ff44, 1);  // Toxic Green
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
    // Ultra-Violet pulsing boss bar (8.6.3)
    const pulse = 0.7 + 0.3 * Math.sin(this.time.now / 200);
    this._bossBarGfx.clear();
    this._bossBarGfx.fillStyle(0x220033, 0.9);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW, 34, 7);
    this._bossBarGfx.fillStyle(0x8800ff, pulse);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW * ratio, 34, 7);
    this._bossBarGfx.lineStyle(2, 0xff00aa, 0.9);
    this._bossBarGfx.strokeRoundedRect(barX, 4, barW, 34, 7);
  }

  // ─── Victory (spec 8.6.10 — boss defeated) ───────────────────────────────

  _triggerVictory() {
    if (this._spawnTimer)   this._spawnTimer.remove();
    this._passiveTimer.remove();
    this.waveActive = false;
    this._victoryTxt.setVisible(true);
    this.cameras.main.shake(600, 0.018);
    this.time.delayedCall(4500, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  // ─── Game Over (spec 8.6.10 — hut destroyed) ─────────────────────────────

  _triggerGameOver() {
    if (this._spawnTimer)   this._spawnTimer.remove();
    if (this._waveEndTimer) this._waveEndTimer.remove();
    this._passiveTimer.remove();
    this._setMusicLayer(1);
    // Localized hut-destroyed message (8.6.9)
    this._gameOverTxt.setText(L[this._lang].hutBurned).setVisible(true);
    this.cameras.main.shake(900, 0.03);
    this.time.delayedCall(4200, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }
}

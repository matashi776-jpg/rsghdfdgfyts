/**
 * BattleScene.js
 * Dynamic battle engine — Оборона Ланчина V3.0
 *
 * State machine:
 *  init()   → reset all per-run state
 *  create() → build physics world, start wave 1, launch UIScene overlay
 *  update() → defender shooting, wall-damage, HP bars, wave-timer bar
 *
 * Wave flow: 60 s per wave → _endWave() → PerkScene on waves 5 & 10.
 * Wave 10 is the boss wave; it ends when the boss is killed.
 * PerkScene calls resumeFromPerk() then resumes this scene.
 */
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  // ─── Init (called fresh every time the scene starts) ─────────────────────

  init() {
    this.wave          = 1;
    this.houseLevel    = 1;
    this.baseEnemyHP   = 100;
    this.money         = 50;
    this.gameOver      = false;
    this.bossActive    = false;
    this.waveActive    = false;
    this._waveElapsed  = 0;
    this._waveDuration = 60000;
    this.modifiers     = {
      damage:        1,
      passiveIncome: 1,
      attackSpeed:   1,   // lower = faster firing
      wallDefense:   1,
    };
    this.houseMaxHP = 2000;
    this.houseHP    = 2000;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);

    // ── The Wall (House) ────────────────────────────────────────────────────
    this.house = this.physics.add.staticImage(150, 360, 'house_1');
    this.house.setDisplaySize(100, 200);
    this.house.refreshBody();

    // ── Physics groups ──────────────────────────────────────────────────────
    this.enemiesGroup     = this.physics.add.group();
    this.projectilesGroup = this.physics.add.group();

    // ── Defenders (Sergiy) ──────────────────────────────────────────────────
    this.defendersGroup = this.add.group();
    this._createDefenders();

    // ── Colliders ───────────────────────────────────────────────────────────
    // Enemy reaches wall → stop and attack
    this.physics.add.overlap(
      this.enemiesGroup,
      this.house,
      (enemy) => this._enemyReachWall(enemy),
      null,
      this,
    );
    // Projectile hits enemy
    this.physics.add.overlap(
      this.projectilesGroup,
      this.enemiesGroup,
      (proj, enemy) => this._hitEnemy(proj, enemy),
      null,
      this,
    );

    // ── HUD graphics (drawn each frame inside update) ───────────────────────
    this._hpGfx        = this.add.graphics().setDepth(10);
    this._timerGfx     = this.add.graphics().setDepth(10);
    this._bossBarGfx   = this.add.graphics().setDepth(10);
    this._waveLabelTxt = this.add.text(width / 2, 8, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '22px',
      color:      '#ffff00',
    }).setOrigin(0.5, 0).setDepth(10);

    // Boss HP label (hidden until boss wave)
    this._bossTitleTxt = this.add.text(width / 2, 10, 'БОС: ТОВАРИШ ВАХТЕРША', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '16px',
      color:      '#ff88ff',
    }).setOrigin(0.5, 0).setDepth(11).setVisible(false);

    // House HP label
    this._houseHpLabel = this.add.text(82, 676, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#ffffff',
    }).setDepth(10);

    // Game-over text
    this._gameOverTxt = this.add.text(width / 2, height / 2, 'ХУТІР ВПАВ!', {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '72px',
      color:      '#ff2200',
    }).setOrigin(0.5).setStroke('#000000', 12).setVisible(false).setDepth(40);

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
    } else if (this.houseLevel === 3) {
      this.houseMaxHP = 12000;
    }
    this.houseHP = this.houseMaxHP; // heal to full
    const newW = 100 + (this.houseLevel - 1) * 10;
    const newH = 200 + (this.houseLevel - 1) * 20;
    this.house.setDisplaySize(newW, newH);
    this.house.refreshBody();
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
      // Boss wave — no 60 s timer; ends when boss is killed
      this._spawnBoss();
      this._spawnTimer    = null;
      this._waveEndTimer  = null;
    } else {
      const interval = Math.max(500, 2000 - this.wave * 100);
      this._spawnTimer = this.time.addEvent({
        delay: interval,
        loop:  true,
        callbackScope: this,
        callback: this._spawnEnemy,
      });
      this._spawnEnemy(); // immediate first enemy

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
      // Roguelike perk selection — pause battle and overlay PerkScene
      this.scene.pause();
      this.scene.launch('PerkScene', { modifiers: this.modifiers, wave: this.wave });
    } else {
      this.wave++;
      this._startWave();
    }
  }

  /** Called by PerkScene after the player has picked a perk. */
  resumeFromPerk() {
    this.wave++;
    this._startWave();
  }

  // ─── Enemy Spawning ───────────────────────────────────────────────────────

  _spawnEnemy() {
    if (this.gameOver) return;
    const { height } = this.scale;
    const roll = Math.random();
    let type, speed, hpMult, dispW, dispH;

    if (roll < 0.5) {
      // enemy_clerk — medium HP, slow
      type = 'enemy_clerk'; speed = 60;  hpMult = 1.0; dispW = 48; dispH = 64;
    } else if (roll < 0.80) {
      // enemy_runner — less HP, fast
      type = 'enemy_runner'; speed = 120; hpMult = 0.7; dispW = 40; dispH = 56;
    } else {
      // enemy_tank — 3× HP, very slow
      type = 'enemy_tank'; speed = 30; hpMult = 3.0; dispW = 80; dispH = 80;
    }

    const y     = Phaser.Math.Between(Math.floor(height * 0.18), Math.floor(height * 0.82));
    const enemy = this.enemiesGroup.create(1340, y, type);
    enemy.setDisplaySize(dispW, dispH);
    enemy.body.setVelocityX(-speed);
    enemy.maxHp          = Math.round(this.baseEnemyHP * (1 + this.wave * 0.35) * hpMult);
    enemy.hp             = enemy.maxHp;
    enemy.isBoss         = false;
    enemy.isAttackingWall = false;
    enemy.setDepth(4);
  }

  _spawnBoss() {
    const { height } = this.scale;
    const boss = this.enemiesGroup.create(1200, height / 2, 'boss_vakhtersha');
    boss.setDisplaySize(120, 140);
    boss.body.setVelocityX(-15);
    boss.maxHp           = 15000;
    boss.hp              = 15000;
    boss.isBoss          = true;
    boss.isAttackingWall = false;
    boss.setDepth(6);
    this.bossActive = true;
    this._bossTitleTxt.setVisible(true);
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
      this._endWave();
    }
  }

  // ─── VFX — Particle Manager ───────────────────────────────────────────────

  /** Blood / virus burst on enemy death (red squares fading out). */
  _spawnDeathExplosion(x, y) {
    const emitter = this.add.particles(x, y, 'particle_red', {
      speed:    { min: 40,  max: 200  },
      scale:    { start: 1.4, end: 0  },
      alpha:    { start: 1,   end: 0  },
      lifespan: { min: 280, max: 620  },
      angle:    { min: 0,   max: 360  },
      tint:     [0xff2200, 0xaa1100, 0xff6600],
      emitting: false,
    });
    emitter.explode(24, x, y);
    this.time.delayedCall(700, () => {
      if (emitter.active) emitter.destroy();
    });
  }

  /** Small spark on projectile impact. */
  _spawnHitParticle(x, y) {
    const emitter = this.add.particles(x, y, 'particle_yellow', {
      speed:    { min: 20, max: 90 },
      scale:    { start: 0.7, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: 240,
      angle:    { min: 0, max: 360 },
      emitting: false,
    });
    emitter.explode(7, x, y);
    this.time.delayedCall(350, () => {
      if (emitter.active) emitter.destroy();
    });
  }

  // ─── Defender Shooting ────────────────────────────────────────────────────

  _defenderShoot(defender) {
    const enemies = this.enemiesGroup.getChildren().filter((e) => e.active);
    if (enemies.length === 0) return;

    // Target nearest enemy
    let target = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const dx = e.x - defender.x;
      const dy = e.y - defender.y;
      const d  = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; target = e; }
    }
    if (!target || minDist > 700 * 700) return; // 700 px range

    const proj = this.projectilesGroup.create(defender.x + 22, defender.y, 'particle_yellow');
    if (!proj) return;
    proj.setDisplaySize(14, 8);
    proj.setDepth(6);

    const angle = Math.atan2(target.y - defender.y, target.x - defender.x);
    const spd   = 420;
    proj.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);

    // Particle trail following the projectile
    const trail = this.add.particles(proj.x, proj.y, 'particle_yellow', {
      speed:     { min: 5, max: 30 },
      scale:     { start: 0.5, end: 0 },
      alpha:     { start: 0.7, end: 0 },
      lifespan:  180,
      frequency: 30,
      quantity:  1,
    });
    trail.startFollow(proj);
    proj.particleTrail = trail;

    // Safety: destroy projectile (and trail) after 2 s if nothing was hit
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

    // ── Defender fire timers ──────────────────────────────────────────────
    // Base cooldown 1200 ms; attackSpeed modifier acts as a multiplier on that interval.
    // "Козацький Драйв" subtracts 0.3 each pick, making the multiplier smaller → faster.
    const cooldown = Math.max(300, 1200 * this.modifiers.attackSpeed);
    for (const def of this.defendersGroup.getChildren()) {
      def.fireTimer = (def.fireTimer || 0) + delta;
      if (def.fireTimer >= cooldown) {
        def.fireTimer = 0;
        this._defenderShoot(def);
      }
    }

    // ── Wall damage from attacking enemies ────────────────────────────────
    const defenseInv = delta / (Math.max(0.1, this.modifiers.wallDefense) * 1000);
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active || !enemy.isAttackingWall) continue;
      const dps = enemy.isBoss ? 2.0 : 0.5;
      this.houseHP -= dps * defenseInv;
    }

    // ── Wave timer bar ────────────────────────────────────────────────────
    if (this.waveActive && this.wave !== 10) {
      this._waveElapsed += delta;
      const ratio = Math.min(1, this._waveElapsed / this._waveDuration);
      this._timerGfx.clear();
      this._timerGfx.fillStyle(0x333333, 0.55);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440, 9);
      this._timerGfx.fillStyle(0xffaa00, 1);
      this._timerGfx.fillRect(width / 2 - 220, 38, 440 * (1 - ratio), 9);
    } else if (this.wave === 10) {
      this._timerGfx.clear();
    }

    // ── Draw HUD ──────────────────────────────────────────────────────────
    this._drawHouseHpBar();
    this._drawEnemyHpBars();
    if (this.bossActive) this._drawBossHpBar();

    // ── Out-of-bounds cleanup ─────────────────────────────────────────────
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (enemy.active && enemy.x < -120) enemy.destroy();
    }

    // ── Game-over check ───────────────────────────────────────────────────
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
    // Background
    this._hpGfx.fillStyle(0x550000, 1);
    this._hpGfx.fillRect(80, 680, 180, 22);
    // Fill — green → yellow → red based on ratio
    const fillColor = ratio > 0.5 ? 0x00cc44 : ratio > 0.25 ? 0xffaa00 : 0xff2200;
    this._hpGfx.fillStyle(fillColor, 1);
    this._hpGfx.fillRect(80, 680, 180 * ratio, 22);
    // Border
    this._hpGfx.lineStyle(2, 0xffffff, 0.9);
    this._hpGfx.strokeRect(80, 680, 180, 22);
    // HP numbers
    const hp  = Math.max(0, Math.ceil(this.houseHP));
    this._houseHpLabel.setText(`Хутір: ${hp} / ${this.houseMaxHP}`);
  }

  _drawEnemyHpBars() {
    for (const enemy of this.enemiesGroup.getChildren()) {
      if (!enemy.active) continue;
      const r   = Math.max(0, enemy.hp / enemy.maxHp);
      const bw  = enemy.isBoss ? 0 : 42; // boss bar drawn separately
      if (bw === 0) continue;
      const bx  = enemy.x - bw / 2;
      const by  = enemy.y - enemy.displayHeight / 2 - 9;
      this._hpGfx.fillStyle(0x440000, 1);
      this._hpGfx.fillRect(bx, by, bw, 5);
      this._hpGfx.fillStyle(0x00cc44, 1);
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
    this._bossBarGfx.clear();
    this._bossBarGfx.fillStyle(0x220022, 0.88);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW, 32, 6);
    this._bossBarGfx.fillStyle(0xcc00cc, 1);
    this._bossBarGfx.fillRoundedRect(barX, 4, barW * ratio, 32, 6);
    this._bossBarGfx.lineStyle(2, 0xffffff, 0.85);
    this._bossBarGfx.strokeRoundedRect(barX, 4, barW, 32, 6);
  }

  // ─── Game Over ────────────────────────────────────────────────────────────

  _triggerGameOver() {
    if (this._spawnTimer)   this._spawnTimer.remove();
    if (this._waveEndTimer) this._waveEndTimer.remove();
    this._passiveTimer.remove();

    this._gameOverTxt.setVisible(true);
    this.cameras.main.shake(900, 0.025);

    this.time.delayedCall(4200, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }
}

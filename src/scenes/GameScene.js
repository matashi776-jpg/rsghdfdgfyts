/**
 * GameScene.js
 * Main battle scene for ACID KHUTIR.
 * Orchestrates Player, WaveSystem, ProjectileSystem, FXSystem, UISystem.
 */
import GameConfig       from '../core/GameConfig.js';
import AudioManager     from '../core/AudioManager.js';
import DifficultyDirector from '../core/DifficultyDirector.js';
import MetaProgression  from '../systems/MetaProgression.js';
import WaveSystem       from '../systems/WaveSystem.js';
import PerkSystem       from '../systems/PerkSystem.js';
import FXSystem         from '../systems/FXSystem.js';
import ProjectileSystem from '../systems/ProjectileSystem.js';
import Player           from '../entities/Player.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init() {
    this.wave          = 1;
    this.houseLevel    = 1;
    this.money         = GameConfig.STARTING_MONEY;
    this.gameOver      = false;
    this.bossActive    = false;
    this.waveActive    = false;
    this.houseMaxHP    = GameConfig.HOUSE_HP_TIER[1];
    this.houseHP       = this.houseMaxHP;
    this.modifiers     = MetaProgression.getStartingBonuses();
    this.modifiers.acidSplash = 0;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // ── Audio ────────────────────────────────────────────────────────────────
    this.audioManager = new AudioManager(this);
    this.audioManager.playBGM();

    // ── Background ───────────────────────────────────────────────────────────
    this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height)
      .setTint(0x8800ff);

    const scanlines = this.add.graphics().setAlpha(0.07).setDepth(1);
    for (let y = 0; y < height; y += 4) {
      scanlines.lineStyle(1, 0x00ffff, 1);
      scanlines.moveTo(0, y);
      scanlines.lineTo(width, y);
    }
    scanlines.strokePath();

    // ── Wall (House) ──────────────────────────────────────────────────────────
    this.house = this.physics.add.staticImage(150, 360, 'house_1');
    this.house.setDisplaySize(100, 200);
    this.house.setTint(0xff88ff);
    this.house.refreshBody();

    this.tweens.add({
      targets: this.house, alpha: 0.8,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── Physics groups ────────────────────────────────────────────────────────
    this.enemiesGroup     = this.physics.add.group();
    this.projectilesGroup = this.physics.add.group();

    // ── Systems ───────────────────────────────────────────────────────────────
    this.fxSystem          = new FXSystem(this);
    this.projectileSystem  = new ProjectileSystem(this, this.projectilesGroup, this.fxSystem);
    this.waveSystem        = new WaveSystem(this, {
      enemiesGroup: this.enemiesGroup,
      onWaveEnd:    (wave) => this._onWaveEnd(wave),
    });
    this.perkSystem        = new PerkSystem(this, this.modifiers);

    // ── Players (Serhiy defenders) ────────────────────────────────────────────
    this._players = [];
    const positions = [
      { x: 230, y: 270 }, { x: 230, y: 360 }, { x: 230, y: 450 },
      { x: 290, y: 315 }, { x: 290, y: 405 },
    ];
    for (const pos of positions) {
      this._players.push(new Player(this, pos.x, pos.y));
    }
    this._fireCooldown = 0;

    // ── Colliders ─────────────────────────────────────────────────────────────
    this.physics.add.overlap(
      this.enemiesGroup, this.house,
      (enemy) => this._enemyReachWall(enemy), null, this,
    );
    this.physics.add.overlap(
      this.projectilesGroup, this.enemiesGroup,
      (proj, enemy) => this.projectileSystem.onHit(proj, enemy, this.modifiers),
      null, this,
    );

    // ── HUD ───────────────────────────────────────────────────────────────────
    this._waveLabelTxt = this.add.text(width / 2, 8, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 14, fill: true },
    }).setOrigin(0.5, 0).setDepth(10);

    this._gameOverTxt = this.add.text(width / 2, height / 2, 'ХУТІР ВПАВ!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 12,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 40, fill: true },
    }).setOrigin(0.5).setVisible(false).setDepth(40);

    // ── Passive income ────────────────────────────────────────────────────────
    this._passiveTimer = this.time.addEvent({
      delay: GameConfig.PASSIVE_INCOME_INTERVAL,
      loop:  true,
      callback: () => {
        if (!this.gameOver) {
          this.money += Math.floor(GameConfig.PASSIVE_INCOME_AMOUNT * this.modifiers.passiveIncome);
        }
      },
    });

    // ── Launch UI overlay and start wave ─────────────────────────────────────
    this.scene.launch('UIScene');
    this._startWave();
  }

  // ─── Wave management ──────────────────────────────────────────────────────

  _startWave() {
    this.waveActive = true;
    this.bossActive = this.wave === GameConfig.BOSS_WAVE;
    this._waveLabelTxt.setText(`Хвиля: ${this.wave}`);
    this.waveSystem.start(this.wave);
  }

  _onWaveEnd(wave) {
    this.waveActive = false;

    if (GameConfig.PERK_WAVES.includes(wave)) {
      this.perkSystem.showSelection(wave);
    } else {
      this._nextWave();
    }
  }

  /** Called by PerkScene after the player picks a perk. */
  resumeFromPerk() {
    this._nextWave();
  }

  _nextWave() {
    this.wave++;
    this._startWave();
  }

  // ─── House upgrade ────────────────────────────────────────────────────────

  upgradeHouse() {
    if (this.houseLevel >= 3) return;
    this.houseLevel++;
    this.house.setTexture('house_' + this.houseLevel);
    if (this.houseLevel === 2) {
      this.houseMaxHP = GameConfig.HOUSE_HP_TIER[2];
      this.house.setTint(0x00ffff);
    } else if (this.houseLevel === 3) {
      this.houseMaxHP = GameConfig.HOUSE_HP_TIER[3];
      this.house.setTint(0xff00aa);
      this.modifiers.attackSpeed = Math.max(0.1, this.modifiers.attackSpeed - 0.35);
      this.fxSystem.spawnUpgradeBurst(this.house.x, this.house.y);
    }
    this.houseHP = this.houseMaxHP;
    const newW = 100 + (this.houseLevel - 1) * 10;
    const newH = 200 + (this.houseLevel - 1) * 20;
    this.house.setDisplaySize(newW, newH);
    this.house.refreshBody();
  }

  // ─── Enemy events ─────────────────────────────────────────────────────────

  _enemyReachWall(enemySprite) {
    if (!enemySprite.active) return;
    enemySprite.body.setVelocityX(0);
    enemySprite.isAttackingWall = true;
  }

  /** Called by Enemy entities via `scene.onEnemyDied`. */
  onEnemyDied(enemy) {
    const reward = DifficultyDirector.goldReward(this.wave);
    this.money  += reward;
    this.fxSystem.spawnDeathExplosion(
      enemy.sprite ? enemy.sprite.x : 0,
      enemy.sprite ? enemy.sprite.y : 0,
    );
    this.waveSystem.onEnemyDied(enemy);
  }

  // ─── Game over ────────────────────────────────────────────────────────────

  _triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.waveSystem.stop();
    this._gameOverTxt.setVisible(true);
    this.cameras.main.shake(600, 0.02);

    const result = MetaProgression.recordRun(this.wave);
    console.info('[GameScene] Run ended. Wave:', this.wave, result);

    this.time.delayedCall(2500, () => {
      this.scene.stop('UIScene');
      this.scene.start('DeathScene', { wave: this.wave, ...result });
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.gameOver) return;

    // Defender shooting
    const cooldown = Math.max(300, GameConfig.DEFENDER_FIRE_RATE * this.modifiers.attackSpeed);
    this._fireCooldown = (this._fireCooldown || 0) + delta;
    if (this._fireCooldown >= cooldown) {
      this._fireCooldown = 0;
      for (const player of this._players) {
        this._playerShoot(player);
      }
    }

    // Wall damage from attacking enemies
    const defenseInv = delta / (Math.max(0.1, this.modifiers.wallDefense) * 1000);
    for (const es of this.enemiesGroup.getChildren()) {
      if (!es.active || !es.isAttackingWall) continue;
      const dps = es.isBoss ? GameConfig.BOSS_WALL_DPS : GameConfig.ENEMY_WALL_DPS;
      this.houseHP -= dps * defenseInv;
    }

    // House destroyed?
    if (this.houseHP <= 0) {
      this.houseHP = 0;
      this._triggerGameOver();
      return;
    }

    // Out-of-bounds cleanup
    for (const es of this.enemiesGroup.getChildren()) {
      if (es.active && es.x < -120) es.destroy();
    }
  }

  _playerShoot(player) {
    const enemies = this.enemiesGroup.getChildren().filter((e) => e.active);
    if (!enemies.length) return;

    let target = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const d  = dx * dx + dy * dy;
      if (d < minDist && d < GameConfig.DEFENDER_RANGE ** 2) {
        minDist = d; target = e;
      }
    }

    if (target) {
      this.projectileSystem.fire(
        { x: player.x, y: player.y },
        target,
        GameConfig.PROJECTILE_BASE_DAMAGE,
      );
      player.flashShoot();
    }
  }
}

import Phaser from 'phaser';

// ─── Constants ──────────────────────────────────────────────────────────────

const GROUND_Y      = 480;   // y-position of ground surface
const HERO_MAX_HP   = 100;
const ENEMY_MAX_HP  = 150;
const HERO_SPEED    = 180;
const JUMP_VEL      = -420;
const PROJ_SPEED    = 380;
const ENEMY_PROJ_SPEED = 240;
const ENEMY_FIRE_INTERVAL = 2200; // ms

// ─── BattleScene ────────────────────────────────────────────────────────────

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    init() {
        this.heroHP   = HERO_MAX_HP;
        this.enemyHP  = ENEMY_MAX_HP;
        this.score    = 0;
        this.gameOver = false;
        this.victory  = false;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    create() {
        this._buildWorld();
        this._buildHero();
        this._buildEnemy();
        this._buildProjectiles();
        this._buildCollisions();
        this._buildInput();
        this._buildEnemyAI();

        // Launch the UI scene in parallel (it overlays on top)
        this.scene.launch('UIScene', {
            heroHP:       this.heroHP,
            heroMaxHP:    HERO_MAX_HP,
            enemyHP:      this.enemyHP,
            enemyMaxHP:   ENEMY_MAX_HP,
            score:        this.score,
            battleScene:  this
        });

        this.uiScene = this.scene.get('UIScene');
    }

    // ── Update ────────────────────────────────────────────────────────────────

    update() {
        if (this.gameOver) return;

        this._handleHeroMovement();
        this._handleEnemyMovement();
        this._wrapHero();
    }

    // ── World ─────────────────────────────────────────────────────────────────

    _buildWorld() {
        // Background
        this.add.image(400, 300, 'background');

        // Static platform group
        this.platforms = this.physics.add.staticGroup();

        // Main ground (invisible physics body at bottom)
        const ground = this.platforms.create(400, GROUND_Y + 24, 'platform');
        ground.setScale(6.5, 1).refreshBody();
        ground.setVisible(false);

        // Visible ground tiles
        for (let x = 0; x <= 800; x += 32) {
            this.add.image(x, GROUND_Y + 8, 'ground_tile');
        }

        // Floating platforms
        [
            { x: 160, y: 360 },
            { x: 400, y: 310 },
            { x: 640, y: 360 },
            { x: 260, y: 230 },
            { x: 560, y: 230 }
        ].forEach(({ x, y }) => {
            this.platforms.create(x, y, 'platform');
        });
    }

    // ── Hero ──────────────────────────────────────────────────────────────────

    _buildHero() {
        this.hero = this.physics.add.sprite(120, GROUND_Y - 48, 'hero');
        this.hero.setCollideWorldBounds(true);
        this.hero.setGravityY(300);
        this.hero.body.setSize(20, 44);
        this.hero.body.setOffset(6, 4);

        // Shoot cooldown flag
        this.heroCanShoot = true;
        this.heroShootDelay = 350;

        // Invincibility frames after getting hit
        this.heroInvincible = false;
    }

    // ── Enemy ─────────────────────────────────────────────────────────────────

    _buildEnemy() {
        this.enemy = this.physics.add.sprite(660, GROUND_Y - 64, 'enemy');
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setGravityY(300);
        this.enemy.body.setSize(40, 60);
        this.enemy.body.setOffset(4, 4);
        this.enemy.setFlipX(true); // Face left toward hero

        // Movement AI state
        this.enemyDir       = -1;
        this.enemyMoveSpeed = 90;
        this.enemyJumpTimer = 0;
    }

    // ── Projectiles ───────────────────────────────────────────────────────────

    _buildProjectiles() {
        this.heroBolts   = this.physics.add.group();
        this.enemyBolts  = this.physics.add.group();
    }

    // ── Collisions ────────────────────────────────────────────────────────────

    _buildCollisions() {
        // Characters stand on platforms
        this.physics.add.collider(this.hero,  this.platforms);
        this.physics.add.collider(this.enemy, this.platforms);

        // Hero projectiles hit enemy
        this.physics.add.overlap(
            this.heroBolts,
            this.enemy,
            this._heroBoltHitsEnemy,
            null,
            this
        );

        // Enemy projectiles hit hero
        this.physics.add.overlap(
            this.enemyBolts,
            this.hero,
            this._enemyBoltHitsHero,
            null,
            this
        );
    }

    // ── Input ─────────────────────────────────────────────────────────────────

    _buildInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            shoot: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    // ── Enemy AI timer ────────────────────────────────────────────────────────

    _buildEnemyAI() {
        // Periodic enemy shooting
        this.enemyFireTimer = this.time.addEvent({
            delay:    ENEMY_FIRE_INTERVAL,
            callback: this._enemyShoot,
            callbackScope: this,
            loop:     true
        });
    }

    // ── Hero movement ─────────────────────────────────────────────────────────

    _handleHeroMovement() {
        const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
        const shoot = Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                      Phaser.Input.Keyboard.JustDown(this.wasd.shoot);

        if (left) {
            this.hero.setVelocityX(-HERO_SPEED);
            this.hero.setFlipX(true);
        } else if (right) {
            this.hero.setVelocityX(HERO_SPEED);
            this.hero.setFlipX(false);
        } else {
            this.hero.setVelocityX(0);
        }

        if (up && this.hero.body.blocked.down) {
            this.hero.setVelocityY(JUMP_VEL);
        }

        if (shoot && this.heroCanShoot) {
            this._heroShoot();
        }
    }

    // ── Enemy simple AI movement ──────────────────────────────────────────────

    _handleEnemyMovement() {
        const dx = this.hero.x - this.enemy.x;

        // Face hero
        this.enemy.setFlipX(dx > 0);

        // Walk toward hero, but keep some distance
        if (Math.abs(dx) > 220) {
            const dir = dx > 0 ? 1 : -1;
            this.enemy.setVelocityX(this.enemyMoveSpeed * dir);
        } else {
            this.enemy.setVelocityX(0);
        }

        // Random jumps
        this.enemyJumpTimer += this.game.loop.delta;
        if (this.enemyJumpTimer > 2500 && this.enemy.body.blocked.down) {
            this.enemy.setVelocityY(JUMP_VEL * 0.85);
            this.enemyJumpTimer = 0;
        }
    }

    // ── Wrap hero at screen edges ──────────────────────────────────────────────

    _wrapHero() {
        if (this.hero.x < 0)   this.hero.x = 800;
        if (this.hero.x > 800) this.hero.x = 0;
    }

    // ── Hero shoot ────────────────────────────────────────────────────────────

    _heroShoot() {
        this.heroCanShoot = false;

        const dir = this.hero.flipX ? -1 : 1;
        const bolt = this.heroBolts.create(
            this.hero.x + dir * 20,
            this.hero.y - 8,
            'projectile'
        );
        bolt.setVelocityX(PROJ_SPEED * dir);
        bolt.setGravityY(-300); // cancel scene gravity so bolt flies straight
        bolt.body.allowGravity = false;

        // Particle trail
        this._spawnTrail(bolt, 0xfbbf24);

        // Cleanup out-of-bounds bolts
        bolt.update = () => {
            if (bolt.x < -20 || bolt.x > 820) bolt.destroy();
        };

        this.time.delayedCall(this.heroShootDelay, () => {
            this.heroCanShoot = true;
        });
    }

    // ── Enemy shoot ───────────────────────────────────────────────────────────

    _enemyShoot() {
        if (this.gameOver) return;

        const dir = this.hero.x < this.enemy.x ? -1 : 1;
        const bolt = this.enemyBolts.create(
            this.enemy.x + dir * 30,
            this.enemy.y - 20,
            'enemy_projectile'
        );
        bolt.setVelocityX(ENEMY_PROJ_SPEED * dir);
        bolt.body.allowGravity = false;

        bolt.update = () => {
            if (bolt.x < -20 || bolt.x > 820) bolt.destroy();
        };
    }

    // ── Particle trail (simple) ───────────────────────────────────────────────

    _spawnTrail(source, color) {
        const trail = this.add.graphics();
        trail.fillStyle(color, 0.7);
        trail.fillCircle(source.x, source.y, 3);
        this.tweens.add({
            targets: trail,
            alpha:   0,
            duration: 200,
            onComplete: () => trail.destroy()
        });
    }

    // ── Hit handlers ─────────────────────────────────────────────────────────

    _heroBoltHitsEnemy(bolt, enemy) {
        bolt.destroy();
        this._spawnHitEffect(enemy.x, enemy.y, 0xfbbf24);

        this.enemyHP = Math.max(0, this.enemyHP - 10);
        this.score  += 10;
        this._notifyUI();

        // Enemy flash red
        this.tweens.add({
            targets:  enemy,
            tint:     0xff0000,
            duration: 80,
            yoyo:     true,
            onComplete: () => enemy.clearTint()
        });

        if (this.enemyHP <= 0) {
            this._triggerVictory();
        }
    }

    _enemyBoltHitsHero(bolt, hero) {
        if (this.heroInvincible) return;

        bolt.destroy();
        this._spawnHitEffect(hero.x, hero.y, 0xef4444);

        this.heroHP = Math.max(0, this.heroHP - 15);
        this._notifyUI();

        // Brief invincibility
        this.heroInvincible = true;
        this.tweens.add({
            targets:  hero,
            alpha:    0.3,
            duration: 100,
            yoyo:     true,
            repeat:   3,
            onComplete: () => {
                hero.setAlpha(1);
                this.heroInvincible = false;
            }
        });

        // Screen flash
        const flash = this.add.image(400, 300, 'hit_flash').setAlpha(0);
        this.tweens.add({
            targets:  flash,
            alpha:    0.5,
            duration: 80,
            yoyo:     true,
            onComplete: () => flash.destroy()
        });

        if (this.heroHP <= 0) {
            this._triggerGameOver();
        }
    }

    // ── Hit particle effect ───────────────────────────────────────────────────

    _spawnHitEffect(x, y, color) {
        for (let i = 0; i < 6; i++) {
            const spark = this.add.graphics();
            spark.fillStyle(color, 1);
            spark.fillRect(-2, -2, 4, 4);
            spark.x = x;
            spark.y = y;

            const angle = (i / 6) * Math.PI * 2;
            const speed = Phaser.Math.Between(60, 140);

            this.tweens.add({
                targets:  spark,
                x:        x + Math.cos(angle) * speed * 0.5,
                y:        y + Math.sin(angle) * speed * 0.5,
                alpha:    0,
                duration: 350,
                ease:     'Power2',
                onComplete: () => spark.destroy()
            });
        }
    }

    // ── Notify UI of stat changes ─────────────────────────────────────────────

    _notifyUI() {
        if (this.uiScene) {
            this.uiScene.updateStats({
                heroHP:   this.heroHP,
                enemyHP:  this.enemyHP,
                score:    this.score
            });
        }
    }

    // ── End states ────────────────────────────────────────────────────────────

    _triggerVictory() {
        this.gameOver = true;
        this.victory  = true;
        this.enemyFireTimer.remove();
        this.hero.setVelocity(0);
        this.enemy.setActive(false).setVisible(false);

        // Celebration animation
        this.tweens.add({
            targets:  this.hero,
            y:        this.hero.y - 60,
            duration: 400,
            yoyo:     true,
            repeat:   2
        });

        if (this.uiScene) this.uiScene.showEndScreen(true, this.score);
    }

    _triggerGameOver() {
        this.gameOver = true;
        this.enemyFireTimer.remove();
        this.hero.setActive(false).setVisible(false);

        if (this.uiScene) this.uiScene.showEndScreen(false, this.score);
    }

    // ── Restart (called from UIScene) ─────────────────────────────────────────

    restart() {
        this.scene.stop('UIScene');
        this.scene.restart();
    }
}

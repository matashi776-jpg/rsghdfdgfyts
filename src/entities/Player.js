/**
 * Player.js
 * Player entity — Сергій — Хранитель Грому — ACID KHUTIR
 *
 * Serhiy is the primary combat hero (Перун school — Thunder).
 * He carries SpellSystem and EquipmentSystem which provide
 * Ukrainian-folklore-rooted abilities and clothing bonuses.
 *
 * Controls:
 *   WASD / Arrow keys — movement
 *   Q               — cast active spell
 *   E               — cycle to next spell
 */
import SpellSystem     from '../systems/SpellSystem.js';
import EquipmentSystem from '../systems/EquipmentSystem.js';
import { HEROES }      from '../core/LoreData.js';
import { DEFAULT_LOADOUT } from '../core/EquipmentData.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_serhiy_idle_01');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const def = HEROES.serhiy;
    this.maxHp       = def.stats.maxHp;
    this.hp          = def.stats.maxHp;
    this.speed       = def.stats.speed;
    this.fireRate    = def.stats.fireRate;
    this._lastFire   = 0;
    this.shieldUntil = 0;
    this.heroId      = 'serhiy';

    this.setCollideWorldBounds(true);
    this.setDepth(5);

    // Input
    this._cursors   = scene.input.keyboard.createCursorKeys();
    this._wasd      = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this._spellKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this._cycleKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Spell system — Перун school (Thunder / Combat)
    this.spellSystem = new SpellSystem(
      scene, this,
      def.startingSpells,
      def.stats.mana,
      def.stats.manaRegen,
    );

    // Equipment system
    this.equipmentSystem = new EquipmentSystem(this, this.spellSystem, {
      maxHp: this.maxHp, speed: this.speed, fireRate: this.fireRate,
    });
    // Apply default Serhiy loadout (Вишиванка-броня, Бурштин Перуна, etc.)
    for (const slot of Object.keys(DEFAULT_LOADOUT.serhiy)) {
      const itemId = DEFAULT_LOADOUT.serhiy[slot];
      if (itemId) this.equipmentSystem.equip(itemId);
    }

    // Animations
    this._buildAnims(scene);
    this.play('player_idle', true);
  }

  update(time, delta) {
    const { _cursors: cur, _wasd: ws } = this;
    let vx = 0, vy = 0;

    if (cur.left.isDown  || ws.left.isDown)  vx -= this.speed;
    if (cur.right.isDown || ws.right.isDown) vx += this.speed;
    if (cur.up.isDown    || ws.up.isDown)    vy -= this.speed;
    if (cur.down.isDown  || ws.down.isDown)  vy += this.speed;

    this.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.play('player_walk', true);
      if (vx < 0) this.setFlipX(true);
      if (vx > 0) this.setFlipX(false);
    } else {
      this.play('player_idle', true);
    }

    // Auto-fire toward nearest enemy
    if (time - this._lastFire > this.fireRate) {
      const target = this._nearestEnemy();
      if (target) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.scene.projectileSystem?.fire(this.x, this.y, angle);
        this.play('player_shoot', true);
        this._lastFire = time;
      }
    }

    // Spell cast — Q
    if (Phaser.Input.Keyboard.JustDown(this._spellKey)) {
      this.spellSystem.castActive(time);
    }

    // Cycle spell — E
    if (Phaser.Input.Keyboard.JustDown(this._cycleKey)) {
      this.spellSystem.cycleNext();
    }

    this.spellSystem.update(time, delta);
  }

  takeDamage(amount) {
    if (this.scene.time.now < this.shieldUntil) return; // shielded
    // Virus/contact damage reduced by equipment (Оберіг, Вишиванка)
    const resist = this.equipmentSystem?.getVirusResist() ?? 0;
    const actual = Math.round(amount * (1 - resist));
    this.hp -= actual;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => this.clearTint());
  }

  _nearestEnemy() {
    const enemies = this.scene.enemies?.getChildren() ?? [];
    let best = null, bestDist = Infinity;
    enemies.forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < bestDist) { bestDist = d; best = e; }
    });
    return best;
  }

  _buildAnims(scene) {
    if (scene.anims.exists('player_idle')) return;

    scene.anims.create({
      key:        'player_idle',
      frames:     Array.from({ length: 12 }, (_, i) =>
        ({ key: `player_serhiy_idle_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate:  10,
      repeat:     -1,
    });

    scene.anims.create({
      key:        'player_walk',
      frames:     Array.from({ length: 12 }, (_, i) =>
        ({ key: `player_serhiy_walk_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate:  12,
      repeat:     -1,
    });

    scene.anims.create({
      key:        'player_shoot',
      frames:     Array.from({ length: 6 }, (_, i) =>
        ({ key: `player_serhiy_shoot_${String(i + 1).padStart(2, '0')}` })
      ),
      frameRate:  18,
      repeat:     0,
    });
  }
}

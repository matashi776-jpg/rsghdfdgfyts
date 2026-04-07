/**
 * HeroMykhas.js
 * Hero entity — Михась — Хранитель Вітрів
 * School: Стрибог (Wind / Chaos)
 *
 * Mykhas is the fastest hero: highest speed, shortest fire rate, but lowest HP.
 * His shots deal bonus AOE on kill (wind scatter).
 * He specialises in mobility spells and area disruption.
 */
import SpellSystem    from '../systems/SpellSystem.js';
import EquipmentSystem from '../systems/EquipmentSystem.js';
import { HEROES }     from '../core/LoreData.js';
import { DEFAULT_LOADOUT } from '../core/EquipmentData.js';

export default class HeroMykhas extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'npc_mykhas_full');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const def = HEROES.mykhas;
    this.maxHp       = def.stats.maxHp;
    this.hp          = def.stats.maxHp;
    this.speed       = def.stats.speed;
    this.fireRate    = def.stats.fireRate;
    this._lastFire   = 0;
    this.shieldUntil = 0;
    this.heroId      = 'mykhas';

    this.setCollideWorldBounds(true);
    this.setDepth(5);
    this.setTint(0x00eeff);  // Cyan tint — wind colour

    // Input
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd    = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this._spellKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    // Spell system — Стрибог school
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
    for (const slot of Object.keys(DEFAULT_LOADOUT.mykhas)) {
      const itemId = DEFAULT_LOADOUT.mykhas[slot];
      if (itemId) this.equipmentSystem.equip(itemId);
    }
  }

  update(time, delta) {
    const { _cursors: cur, _wasd: ws } = this;
    let vx = 0, vy = 0;

    if (cur.left.isDown  || ws.left.isDown)  vx -= this.speed;
    if (cur.right.isDown || ws.right.isDown) vx += this.speed;
    if (cur.up.isDown    || ws.up.isDown)    vy -= this.speed;
    if (cur.down.isDown  || ws.down.isDown)  vy += this.speed;

    this.setVelocity(vx, vy);
    if (vx < 0) this.setFlipX(true);
    if (vx > 0) this.setFlipX(false);

    // Auto-fire toward nearest enemy
    if (time - this._lastFire > this.fireRate) {
      const target = this._nearestEnemy();
      if (target) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.scene.projectileSystem?.fire(this.x, this.y, angle);
        this._lastFire = time;
      }
    }

    // Spell cast on Q
    if (Phaser.Input.Keyboard.JustDown(this._spellKey)) {
      this.spellSystem.castActive(time);
    }

    this.spellSystem.update(time, delta);
  }

  takeDamage(amount) {
    if (this.scene.time.now < this.shieldUntil) return;
    const resist = this.equipmentSystem?.getVirusResist() ?? 0;
    const actual = Math.round(amount * (1 - resist));
    this.hp -= actual;
    this.setTint(0xff4444);
    this.scene.time.delayedCall(150, () => this.setTint(0x00eeff));
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
}

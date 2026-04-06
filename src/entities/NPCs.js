/**
 * NPCs.js
 * Friendly NPCs in ACID KHUTIR:
 *  • Babtsya  — herbal witch-grandma, heals the house wall.
 *  • Mykhas   — young mechanic, boosts defender fire rate.
 */
import GameConfig from '../core/GameConfig.js';

// ─── Base NPC ──────────────────────────────────────────────────────────────

class NPC {
  constructor(scene, x, y, texKey, w, h, tint) {
    this.scene = scene;
    this.sprite = scene.add.image(x, y, texKey)
      .setDisplaySize(w, h)
      .setTint(tint)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });

    this._label = scene.add.text(x, y - h / 2 - 20, this._labelText(), {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '11px',
      color:      this._labelColor(),
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: this._labelColor(), blur: 10, fill: true },
    }).setOrigin(0.5, 1).setDepth(8);

    this.sprite.on('pointerdown', () => this._interact());
    this.sprite.on('pointerover',  () => this.sprite.setAlpha(0.8));
    this.sprite.on('pointerout',   () => this.sprite.setAlpha(1));
  }

  _labelText()  { return ''; }
  _labelColor() { return '#ffffff'; }
  _interact()   {}

  destroy() {
    if (this._label)  { this._label.destroy();  this._label  = null; }
    if (this.sprite)  { this.sprite.destroy();  this.sprite  = null; }
  }
}

// ─── Babtsya Healer ────────────────────────────────────────────────────────

export class Babtsya extends NPC {
  constructor(scene, x, y) {
    super(scene, x, y, 'npc_babtsya', 48, 64, 0xff88ff);
    this._cooldown = false;
  }

  _labelText()  { return `🌿 Бабця (${GameConfig.NPC_HEAL_COST} ₴ → +${GameConfig.NPC_HEAL_AMOUNT} HP)`; }
  _labelColor() { return '#ff88ff'; }

  _interact() {
    if (this._cooldown) return;
    const battle = this.scene.scene ? this.scene.scene.get('GameScene') : this.scene;
    if (!battle || battle.money < GameConfig.NPC_HEAL_COST) return;

    battle.money   -= GameConfig.NPC_HEAL_COST;
    battle.houseHP  = Math.min(battle.houseMaxHP, battle.houseHP + GameConfig.NPC_HEAL_AMOUNT);

    this._cooldown = true;
    this.sprite.setAlpha(0.4);
    this.scene.time.delayedCall(8000, () => {
      this._cooldown = false;
      if (this.sprite) this.sprite.setAlpha(1);
    });
  }
}

// ─── Mykhas Mechanic ───────────────────────────────────────────────────────

export class Mykhas extends NPC {
  constructor(scene, x, y) {
    super(scene, x, y, 'npc_mykhas', 48, 64, 0x00ffcc);
    this._cooldown = false;
  }

  _labelText()  { return `🔧 Михась (безкоштовно → швидкість ×2)`; }
  _labelColor() { return '#00ffcc'; }

  _interact() {
    if (this._cooldown) return;
    const battle = this.scene.scene ? this.scene.scene.get('GameScene') : this.scene;
    if (!battle) return;

    const prev = battle.modifiers.attackSpeed;
    battle.modifiers.attackSpeed = Math.max(0.1, prev * 0.5);

    this._cooldown = true;
    this.sprite.setTint(0xffff00);
    this.scene.time.delayedCall(GameConfig.NPC_MECHANIC_BOOST_DURATION, () => {
      if (battle.modifiers) battle.modifiers.attackSpeed = prev;
      this._cooldown = false;
      if (this.sprite) this.sprite.setTint(0x00ffcc);
    });
  }
}

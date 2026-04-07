/**
 * SpellSystem.js
 * Manages spell casting, mana, cooldowns and visual effects.
 * Inspired by Heroes of Might & Magic 5 spell logic.
 * Each spell is tied to Ukrainian folklore and symbolism.
 */
import { SPELLS } from '../core/SpellData.js';

export default class SpellSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} caster  — entity with { x, y, hp, maxHp, speed, fireRate, shieldUntil }
   * @param {string[]} knownSpellIds — list of spell IDs the caster knows
   * @param {number} mana
   * @param {number} manaRegen — mana per second
   */
  constructor(scene, caster, knownSpellIds = [], mana = 80, manaRegen = 2) {
    this.scene     = scene;
    this.caster    = caster;
    this.mana      = mana;
    this.maxMana   = mana;
    this.manaRegen = manaRegen;

    // Collect spell definitions
    this.knownSpells = knownSpellIds
      .filter(id => SPELLS[id])
      .map(id => ({
        ...SPELLS[id],
        lastCast: 0,
        tier:     0,   // 0 = basic, 1 = advanced, 2 = expert
      }));

    // Active spell slot (index into knownSpells)
    this.activeIndex = 0;

    // School-level bonus applied from equipment
    this.schoolBonuses = {};

    // Spell power multiplier (from city, equipment, perks)
    this.spellPowerMult = 1.0;

    // Regen timer
    this._regenAccum = 0;
  }

  // ─── Update loop ─────────────────────────────────────────────────────────────

  update(_time, delta) {
    // Mana regeneration
    this._regenAccum += delta;
    if (this._regenAccum >= 1000) {
      const ticks = Math.floor(this._regenAccum / 1000);
      this._regenAccum -= ticks * 1000;
      this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * ticks);
    }
  }

  // ─── Cast active spell ────────────────────────────────────────────────────────

  castActive(time) {
    if (this.knownSpells.length === 0) return false;
    const spell = this.knownSpells[this.activeIndex];
    return this._cast(spell, time);
  }

  castById(id, time) {
    const spell = this.knownSpells.find(s => s.id === id);
    if (!spell) return false;
    return this._cast(spell, time);
  }

  _cast(spell, time) {
    const now = time ?? this.scene.time.now;
    if (now - spell.lastCast < spell.cooldown) return false;
    if (this.mana < spell.manaCost) return false;

    this.mana -= spell.manaCost;
    spell.lastCast = now;

    const power = this._spellPower(spell);
    spell.effect(this.scene, this.caster, [], power);

    this._showCastLabel(spell.name, spell.iconColor);
    return true;
  }

  // ─── Spell power calculation ──────────────────────────────────────────────────

  _spellPower(spell) {
    let power = this.spellPowerMult;
    // Tier scaling
    power *= spell.tierScaling[spell.tier] ?? 1;
    // School bonus from equipment
    const sb = this.schoolBonuses[spell.school];
    if (sb) power *= sb;
    // City spellPower bonus
    if (this.scene.citySystem) {
      power *= this.scene.citySystem.getBonuses().spellPower;
    }
    return power;
  }

  // ─── Cycle active spell ───────────────────────────────────────────────────────

  cycleNext() {
    if (this.knownSpells.length === 0) return;
    this.activeIndex = (this.activeIndex + 1) % this.knownSpells.length;
  }

  cyclePrev() {
    if (this.knownSpells.length === 0) return;
    this.activeIndex = (this.activeIndex - 1 + this.knownSpells.length) % this.knownSpells.length;
  }

  // ─── Learn new spell ──────────────────────────────────────────────────────────

  learnSpell(id) {
    if (!SPELLS[id]) return;
    if (this.knownSpells.some(s => s.id === id)) return; // already known
    this.knownSpells.push({ ...SPELLS[id], lastCast: 0, tier: 0 });
  }

  // ─── Upgrade spell tier ───────────────────────────────────────────────────────

  upgradeSpell(id) {
    const spell = this.knownSpells.find(s => s.id === id);
    if (!spell) return;
    if (spell.tier < 2) spell.tier++;
  }

  // ─── Apply equipment school bonus ─────────────────────────────────────────────

  applySchoolBonus(school, mult) {
    this.schoolBonuses[school] = (this.schoolBonuses[school] ?? 1) * mult;
  }

  // ─── Query helpers ────────────────────────────────────────────────────────────

  getActiveSpell() {
    return this.knownSpells[this.activeIndex] ?? null;
  }

  getCooldownFraction(id) {
    const spell = this.knownSpells.find(s => s.id === id);
    if (!spell) return 0;
    const elapsed = this.scene.time.now - spell.lastCast;
    return Math.max(0, 1 - elapsed / spell.cooldown);
  }

  getManaFraction() {
    return this.maxMana > 0 ? this.mana / this.maxMana : 0;
  }

  // ─── Visual feedback ──────────────────────────────────────────────────────────

  _showCastLabel(spellName, color) {
    if (!this.scene.add) return;
    const { x, y } = this.caster;
    const t = this.scene.add.text(x, y - 40, spellName, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '14px',
      color:      `#${color.toString(16).padStart(6, '0')}`,
      stroke:     '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: `#${color.toString(16).padStart(6, '0')}`, blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(30).setAlpha(1);

    this.scene.tweens.add({
      targets:  t,
      y:        y - 80,
      alpha:    0,
      duration: 1100,
      ease:     'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
  }
}

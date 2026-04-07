/**
 * EquipmentSystem.js
 * Manages hero equipment slots and applies gameplay bonuses.
 *
 * Each worn item from EquipmentData modifies hero stats and spell power.
 * Equipment is thematically tied to Ukrainian folk culture:
 *   Vyshyvanka → HP,  Oberig → virus resistance,  Amulet → spell power, etc.
 */
import { EQUIPMENT } from '../core/EquipmentData.js';

export default class EquipmentSystem {
  /**
   * @param {object} entity — player/hero with mutable stat fields
   * @param {object|null} spellSystem — SpellSystem instance (optional)
   * @param {object} baseStats — original stats snapshot before any equipment
   */
  constructor(entity, spellSystem = null, baseStats = null) {
    this.entity      = entity;
    this.spellSystem = spellSystem;

    // Snapshot of unmodified stats — restored before each recalculation
    this.baseStats = baseStats ?? {
      maxHp:    entity.maxHp    ?? 100,
      speed:    entity.speed    ?? 220,
      fireRate: entity.fireRate ?? 350,
    };

    // Equipped items keyed by slot name
    this.equipped = {};

    // Aggregate bonus cache
    this._bonuses = this._emptyBonuses();
  }

  // ─── Equip / Unequip ──────────────────────────────────────────────────────────

  equip(itemId) {
    const item = EQUIPMENT[itemId];
    if (!item) { console.warn(`Unknown equipment: ${itemId}`); return; }
    this.equipped[item.slot] = item;
    this._recalculate();
  }

  unequip(slot) {
    delete this.equipped[slot];
    this._recalculate();
  }

  // ─── Recalculate all bonuses and apply to entity ──────────────────────────────

  _recalculate() {
    const b = this._emptyBonuses();

    for (const item of Object.values(this.equipped)) {
      const bns = item.bonuses ?? {};

      if (bns.hpMult)        b.hpMult        *= bns.hpMult;
      if (bns.speedMult)     b.speedMult      *= bns.speedMult;
      if (bns.fireRateMult)  b.fireRateMult   *= bns.fireRateMult;
      if (bns.damageMult)    b.damageMult     *= bns.damageMult;
      if (bns.spellPower)    b.spellPower     *= bns.spellPower;
      if (bns.manaMult)      b.manaMult       *= bns.manaMult;
      if (bns.virusResist)   b.virusResist    += bns.virusResist;
      if (bns.incomeBonus)   b.incomeBonus    += bns.incomeBonus;

      if (bns.schoolBonus) {
        const { school, mult } = bns.schoolBonus;
        b.schoolBonuses[school] = (b.schoolBonuses[school] ?? 1) * mult;
      }

      if (bns.unlockSpell && this.spellSystem) {
        b.unlockSpells.push(bns.unlockSpell);
      }
    }

    this._bonuses = b;
    this._applyToEntity(b);
  }

  _applyToEntity(b) {
    const { entity, baseStats, spellSystem } = this;

    // HP
    const newMaxHp = Math.round(baseStats.maxHp * b.hpMult);
    if (newMaxHp !== entity.maxHp) {
      const ratio  = entity.maxHp > 0 ? entity.hp / entity.maxHp : 1;
      entity.maxHp = newMaxHp;
      entity.hp    = Math.round(newMaxHp * ratio);
    }

    // Movement & fire rate
    entity.speed    = baseStats.speed    * b.speedMult;
    entity.fireRate = baseStats.fireRate * b.fireRateMult;

    // SpellSystem
    if (spellSystem) {
      spellSystem.spellPowerMult = b.spellPower;
      spellSystem.maxMana = Math.round((spellSystem.maxMana ?? 80) * b.manaMult);
      spellSystem.schoolBonuses = { ...b.schoolBonuses };

      // Unlock spells granted by equipment
      for (const sid of b.unlockSpells) spellSystem.learnSpell(sid);
    }
  }

  // ─── Query bonuses ────────────────────────────────────────────────────────────

  getBonuses() {
    return { ...this._bonuses };
  }

  /** Virus resistance clamped to [0, 0.9] */
  getVirusResist() {
    return Math.min(0.9, this._bonuses.virusResist);
  }

  getDamageMult() {
    return this._bonuses.damageMult;
  }

  getIncomeMult() {
    return 1 + this._bonuses.incomeBonus;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  _emptyBonuses() {
    return {
      hpMult:       1.0,
      speedMult:    1.0,
      fireRateMult: 1.0,
      damageMult:   1.0,
      spellPower:   1.0,
      manaMult:     1.0,
      virusResist:  0,
      incomeBonus:  0,
      schoolBonuses: {},
      unlockSpells:  [],
    };
  }
}

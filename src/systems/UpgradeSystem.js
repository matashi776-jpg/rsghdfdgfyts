/**
 * UpgradeSystem.js
 * Centralised perk / upgrade registry for Оборона Ланчина V4.0.
 *
 * Holds the canonical perk definitions (name, description, accent colour, and
 * effect function) and exposes helpers used by PerkScene and BattleScene.
 *
 * Each perk's `apply(modifiers)` function mutates the shared `modifiers` object
 * that BattleScene owns.  No direct coupling to any scene class is required.
 *
 * Usage:
 *   // BattleScene.create():
 *   this._upgradeSystem = new UpgradeSystem(this);
 *
 *   // PerkScene.create():
 *   const keys  = this._upgradeSystem.chooseRandomPerks(3);
 *   const perk  = this._upgradeSystem.getPerk(keys[0]);
 *   this._upgradeSystem.applyPerk(keys[0], this.modifiers);
 */
export default class UpgradeSystem {
  /**
   * @param {Phaser.Scene} scene – BattleScene (used for future scene-level effects)
   */
  constructor(scene) {
    this.scene = scene;

    this.perks = {
      goldenCoupon: {
        name:      'Золотий Талон',
        desc:      '💰 Пасивний прибуток ×2\n(Нео-монети течуть самі!)',
        color:     0x2a1a00,
        accent:    0xffcc00,
        textColor: '#ffdd44',
        glowColor: '#ffcc00',
        apply: (modifiers) => {
          modifiers.passiveIncome  *= 2;
          modifiers.goldExplosion   = true;
        },
      },

      radioactiveBeet: {
        name:      'Кислотний Буряк',
        desc:      '⚗ Шкода кулі ×1.5\n+ Отруйне уповільнення',
        color:     0x1a0022,
        accent:    0xff00aa,
        textColor: '#ff44ff',
        glowColor: '#ff00aa',
        apply: (modifiers) => {
          modifiers.damage    *= 1.5;
          modifiers.acidSplash = (modifiers.acidSplash || 0) + 1;
          modifiers.poisonSlow  = true;
        },
      },

      ironSeal: {
        name:      'Техно-Печатка',
        desc:      '🛡 Хутір отримує на 30% менше шкоди\n(Нано-щит активовано!)',
        color:     0x001a33,
        accent:    0x00ffff,
        textColor: '#00ffff',
        glowColor: '#00ffff',
        apply: (modifiers) => {
          // Reduce incoming damage to 70 %. wallDefense is used as a divisor
          // in the damage formula, so raising it by 1/0.70 ≈ 1.43 achieves
          // a 30 % damage reduction.
          const KEEP_FACTOR = 0.70; // 70 % of damage passes through
          modifiers.wallDefense *= (1 / KEEP_FACTOR);
        },
      },

      cossackDrive: {
        name:      'Козацький Драйв',
        desc:      '⚡ Швидкість атаки +30%\n(Сергій в кайфі!)',
        color:     0x001122,
        accent:    0x4488ff,
        textColor: '#88aaff',
        glowColor: '#4488ff',
        apply: (modifiers) => {
          modifiers.attackSpeed = Math.max(0.1, modifiers.attackSpeed - 0.3);
        },
      },
    };
  }

  // ─── Public helpers ──────────────────────────────────────────────────────

  /**
   * Returns `count` randomly-ordered perk keys.
   * @param  {number} count
   * @returns {string[]}
   */
  chooseRandomPerks(count = 3) {
    const keys = Object.keys(this.perks);
    return Phaser.Utils.Array.Shuffle([...keys]).slice(0, count);
  }

  /**
   * Apply a perk by key to the given modifiers object.
   * Falls back to the scene's own modifiers when none supplied.
   * @param {string} key
   * @param {object} [modifiers]
   */
  applyPerk(key, modifiers) {
    const perk = this.perks[key];
    if (perk) {
      perk.apply(modifiers || this.scene.modifiers);
    }
  }

  /**
   * Return a single perk definition by key, or null if not found.
   * @param  {string} key
   * @returns {object|null}
   */
  getPerk(key) {
    return this.perks[key] || null;
  }

  /**
   * Return all perks as an array of { key, ...perkDef } objects.
   * Useful for rendering perk cards in a UI scene.
   * @returns {{ key: string }[]}
   */
  getAllPerks() {
    return Object.entries(this.perks).map(([key, def]) => ({ key, ...def }));
  }
}

/**
 * GameConfig.js
 * Central configuration for ACID KHUTIR.
 * All tunable constants live here — change once, applies everywhere.
 */

const GameConfig = {
  // ── Renderer ──────────────────────────────────────────────────────────────
  WIDTH:  1280,
  HEIGHT: 720,

  // ── Economy ───────────────────────────────────────────────────────────────
  STARTING_MONEY: 50,
  PASSIVE_INCOME_AMOUNT: 10,
  PASSIVE_INCOME_INTERVAL: 2000, // ms

  // ── House / Wall ──────────────────────────────────────────────────────────
  HOUSE_HP_TIER: [0, 2000, 5000, 12000], // index = tier level (1–3)

  // ── Waves ─────────────────────────────────────────────────────────────────
  WAVE_DURATION: 80000,          // ms — regular wave duration
  BOSS_WAVE: 10,                 // which wave spawns the boss
  PERK_WAVES: [5, 10],           // waves that trigger perk selection

  // ── Enemy base stats (DifficultyDirector scales these) ────────────────────
  ENEMY_BASE_HP: 60,
  ENEMY_HP_PER_WAVE: 15,
  ENEMY_HP_LOG_FACTOR: 10,
  ENEMY_BASE_SPEED: 40,
  ENEMY_SPEED_PER_WAVE: 2,

  // ── Gold reward formula: 5 * (1 + wave * 0.05) ────────────────────────────
  GOLD_BASE: 5,
  GOLD_WAVE_FACTOR: 0.05,

  // ── Projectile ────────────────────────────────────────────────────────────
  PROJECTILE_SPEED: 460,
  PROJECTILE_BASE_DAMAGE: 20,
  PROJECTILE_LIFETIME: 2000,     // ms

  // ── Defender cooldown ─────────────────────────────────────────────────────
  DEFENDER_FIRE_RATE: 1200,      // ms (before modifiers)
  DEFENDER_RANGE: 700,           // px²

  // ── Perk definitions ──────────────────────────────────────────────────────
  PERKS: [
    {
      id:        'golden_talon',
      name:      'Золотий Талон',
      desc:      '💰 Пасивний прибуток ×2\n(Нео-монети течуть самі!)',
      accent:    0xffcc00,
      textColor: '#ffdd44',
      glowColor: '#ffcc00',
    },
    {
      id:        'techno_pechatka',
      name:      'Техно-Печатка',
      desc:      '🛡 Хутір отримує на 30% менше шкоди\n(Нано-щит активовано!)',
      accent:    0x00ffff,
      textColor: '#00ffff',
      glowColor: '#00ffff',
    },
    {
      id:        'acid_buryak',
      name:      'Кислотний Буряк',
      desc:      '⚗ Шкода кулі ×1.5\n+ Кислотний сплеск (AOE)',
      accent:    0xff00aa,
      textColor: '#ff44ff',
      glowColor: '#ff00aa',
    },
    {
      id:        'cossack_drive',
      name:      'Козацький Драйв',
      desc:      '⚡ Швидкість атаки +30%\n(Сергій в кайфі!)',
      accent:    0x4488ff,
      textColor: '#88aaff',
      glowColor: '#4488ff',
    },
  ],

  // ── NPC dialogue ──────────────────────────────────────────────────────────
  NPC_HEAL_AMOUNT: 500,
  NPC_HEAL_COST: 100,
  NPC_MECHANIC_BOOST_DURATION: 10000, // ms

  // ── Enemy spawn weights ───────────────────────────────────────────────────
  SPAWN_WEIGHTS: {
    zombie_clerk: 0.50,
    inspector:    0.25,
    archivarius:  0.25,
  },

  // HP multiplier per enemy subtype (relative to DifficultyDirector.enemyHP)
  SPAWN_HP_MULT: {
    zombie_clerk: 1.0,
    inspector:    0.7,
    archivarius:  2.5,
  },

  // Wall DPS from attacking enemies
  ENEMY_WALL_DPS: 0.5,
  BOSS_WALL_DPS:  2.0,

  // Techno-Pechatka damage reduction factor (wallDefense multiplier)
  TECHNO_PECHATKA_REDUCTION: 0.7,

  // ── Meta progression ──────────────────────────────────────────────────────
  META_LEVEL_KEY:  'acid_khutir_meta_level',
  META_PERKS_KEY:  'acid_khutir_meta_perks',
  META_RECORD_KEY: 'acid_khutir_wave_record',
};

export default GameConfig;

/**
 * GameConfig.js
 * Central configuration constants for ACID KHUTIR.
 */
const GameConfig = {
  WIDTH: 1280,
  HEIGHT: 720,
  TITLE: 'ACID KHUTIR',
  VERSION: '1.0.0',

  PALETTE: {
    ELECTRIC_BLUE:  0x00BFFF,
    NEON_PINK:      0xFF00AA,
    TOXIC_GREEN:    0x39FF14,
    ULTRA_VIOLET:   0x7F00FF,
    DARK_BG:        0x050010,
    ACID_YELLOW:    0xFFFF00,
  },

  WAVES: {
    COUNT: 10,
    SPAWN_INTERVAL: 1200,
    BOSS_WAVE: 10,
  },

  PLAYER: {
    SPEED: 220,
    BASE_DAMAGE: 25,
    BASE_HP: 100,
    FIRE_RATE: 350,
  },

  GOLD: {
    START: 50,
  },
};

export default GameConfig;

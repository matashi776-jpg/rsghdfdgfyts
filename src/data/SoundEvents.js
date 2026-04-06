/**
 * SoundEvents.js
 * Centralised registry of all sound/game event keys — Оборона Ланчина.
 * Use these constants everywhere instead of raw strings to avoid typos.
 */
export const SoundEvents = Object.freeze({
  // Player
  PLAYER_SHOOT:  'event_player_shoot',
  PLAYER_DAMAGE: 'event_player_damage',
  PLAYER_STEP:   'event_player_step',

  // Enemies
  ENEMY_ZOMBIE_SPAWN:       'event_enemy_zombie_spawn',
  ENEMY_ZOMBIE_ATTACK:      'event_enemy_zombie_attack',
  ENEMY_ARCHIVARIUS_WHIP:   'event_enemy_archivarius_whip',
  ENEMY_INSPECTOR_SLAM:     'event_enemy_inspector_slam',

  // Boss
  BOSS_PHASE1_START: 'event_boss_phase1_start',
  BOSS_PHASE2_START: 'event_boss_phase2_start',
  BOSS_ATTACK:       'event_boss_attack',
  BOSS_DEATH:        'event_boss_death',

  // UI
  UI_CLICK:  'event_ui_click',
  UI_HOVER:  'event_ui_hover',
  UI_SELECT: 'event_ui_select',

  // FX
  FX_EXPLOSION: 'event_fx_explosion',
  FX_HIT:       'event_fx_hit',
  FX_BULLET:    'event_fx_bullet',
});

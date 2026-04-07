/**
 * PreloadScene.js
 * Loads all assets for ACID KHUTIR — Stage 1.
 * Generates neon fallback textures on asset error.
 *
 * Asset paths follow the canonical structure:
 *   assets/characters/player/
 *   assets/characters/npc/
 *   assets/enemies/
 *   assets/bosses/
 *   assets/items/
 *   assets/ui/
 *   assets/fx/
 *   assets/locations/
 *   assets/cutscenes/
 *   assets/comics/
 *   assets/symbols/
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Neon loading background
    this.add.rectangle(width / 2, height / 2, width, height, 0x050010);

    // Loading bar — neon style
    this.add.rectangle(width / 2, height / 2 + 50, 504, 32, 0x220044);
    this.add.rectangle(width / 2, height / 2 + 50, 500, 28, 0x110022);
    const bar = this.add.rectangle(width / 2 - 250, height / 2 + 50, 0, 28, 0xff00ff);
    bar.setOrigin(0, 0.5);

    this.add.text(width / 2, height / 2 - 10, 'ЗАВАНТАЖЕННЯ...', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 20, fill: true },
    }).setOrigin(0.5);

    this.load.on('progress', (v) => { bar.width = 500 * v; });

    this._failedKeys = new Set();
    this.load.on('loaderror', (file) => {
      console.warn(`Asset missing: ${file.key} (${file.url}) — using fallback`);
      this._failedKeys.add(file.key);
    });

    // ── Legacy assets (existing scenes) ────────────────────────────────────
    this.load.image('bg',              'bg.png');
    this.load.image('house_1',         'house_1.png');
    this.load.image('house_2',         'house_2.png');
    this.load.image('house_3',         'house_3.png');
    this.load.image('sergiy',          'sergiy.png');
    this.load.image('enemy_clerk',     'enemy_clerk.png');
    this.load.image('enemy_runner',    'enemy_runner.png');
    this.load.image('enemy_tank',      'enemy_tank.png');
    this.load.image('boss_vakhtersha', 'boss_vakhtersha.png');

    // Audio
    this.load.audio('bgm', 'bgm.mp3');

    // ── Stage 1 — Player (Serhiy) ──────────────────────────────────────────
    const P = 'assets/characters/player/';
    this.load.image('player_serhiy_full', `${P}player_serhiy_full.png`);
    for (let i = 1; i <= 12; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`player_serhiy_idle_${n}`,  `${P}player_serhiy_idle_${n}.png`);
      this.load.image(`player_serhiy_walk_${n}`,  `${P}player_serhiy_walk_${n}.png`);
    }
    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`player_serhiy_shoot_${n}`, `${P}player_serhiy_shoot_${n}.png`);
    }

    // ── Stage 1 — NPC ──────────────────────────────────────────────────────
    const NPC = 'assets/characters/npc/';
    this.load.image('npc_mykhas_full',  `${NPC}npc_mykhas_full.png`);
    this.load.image('npc_babtsya_full', `${NPC}npc_babtsya_full.png`);

    // ── Stage 1 — Enemies ──────────────────────────────────────────────────
    const EN = 'assets/enemies/';
    this.load.image('enemy_zombie_clerk_full', `${EN}enemy_zombie_clerk_full.png`);
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`enemy_zombie_clerk_walk_${n}`, `${EN}enemy_zombie_clerk_walk_${n}.png`);
    }
    this.load.image('enemy_archivarius_full', `${EN}enemy_archivarius_full.png`);
    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`enemy_archivarius_attack_${n}`, `${EN}enemy_archivarius_attack_${n}.png`);
    }
    this.load.image('enemy_inspector_full', `${EN}enemy_inspector_full.png`);
    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`enemy_inspector_slam_${n}`, `${EN}enemy_inspector_slam_${n}.png`);
    }

    // ── Stage 1 — Boss ─────────────────────────────────────────────────────
    const BS = 'assets/bosses/';
    this.load.image('boss_vakhtersha_full', `${BS}boss_vakhtersha_full.png`);
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`boss_vakhtersha_phase1_${n}`, `${BS}boss_vakhtersha_phase1_${n}.png`);
      this.load.image(`boss_vakhtersha_phase2_${n}`, `${BS}boss_vakhtersha_phase2_${n}.png`);
    }

    // ── Stage 1 — Items ────────────────────────────────────────────────────
    const IT = 'assets/items/';
    this.load.image('item_radioactive_beet',  `${IT}item_radioactive_beet.png`);
    this.load.image('item_golden_coupon',     `${IT}item_golden_coupon.png`);
    this.load.image('item_iron_seal',         `${IT}item_iron_seal.png`);
    this.load.image('item_tryzub_fragment',   `${IT}item_tryzub_fragment.png`);

    // ── Stage 1 — UI ───────────────────────────────────────────────────────
    const UI = 'assets/ui/';
    this.load.image('ui_button_start',  `${UI}ui_button_start.png`);
    this.load.image('ui_hp_bar',        `${UI}ui_hp_bar.png`);
    this.load.image('ui_wave_counter',  `${UI}ui_wave_counter.png`);
    this.load.image('ui_perk_card',     `${UI}ui_perk_card.png`);
    this.load.image('ui_dialog_box',    `${UI}ui_dialog_box.png`);
    // Perk icons (one per perk id — used by PerkSystem)
    this.load.image('ui_icon_damage_up',  `${UI}ui_icon_damage_up.png`);
    this.load.image('ui_icon_speed_up',   `${UI}ui_icon_speed_up.png`);
    this.load.image('ui_icon_hp_restore', `${UI}ui_icon_hp_restore.png`);
    this.load.image('ui_icon_fire_rate',  `${UI}ui_icon_fire_rate.png`);
    this.load.image('ui_icon_shield',     `${UI}ui_icon_shield.png`);

    // ── Stage 1 — FX ───────────────────────────────────────────────────────
    const FX = 'assets/fx/';
    this.load.image('fx_bullet_blue',         `${FX}fx_bullet_blue.png`);
    this.load.image('fx_hit_pink',            `${FX}fx_hit_pink.png`);
    this.load.image('fx_explosion_pysanka',   `${FX}fx_explosion_pysanka.png`);
    this.load.image('fx_boss_glitch_storm',   `${FX}fx_boss_glitch_storm.png`);

    // ── Stage 1 — Locations ────────────────────────────────────────────────
    const LO = 'assets/locations/';
    this.load.image('location_khutir_day',      `${LO}location_khutir_day.png`);
    this.load.image('location_khutir_night',    `${LO}location_khutir_night.png`);
    this.load.image('location_forest_neon',     `${LO}location_forest_neon.png`);
    this.load.image('location_field_sunflowers',`${LO}location_field_sunflowers.png`);
    this.load.image('location_boss_arena',      `${LO}location_boss_arena.png`);

    // ── Stage 1 — Cutscenes ────────────────────────────────────────────────
    const CS = 'assets/cutscenes/';
    this.load.image('cutscene_intro_01',    `${CS}cutscene_intro_01.png`);
    this.load.image('cutscene_intro_02',    `${CS}cutscene_intro_02.png`);
    this.load.image('cutscene_boss_arrival',`${CS}cutscene_boss_arrival.png`);

    // ── Stage 1 — Comics ───────────────────────────────────────────────────
    const CM = 'assets/comics/';
    this.load.image('comic_panel_01', `${CM}comic_panel_01.png`);
    this.load.image('comic_panel_02', `${CM}comic_panel_02.png`);

    // ── Stage 1 — Symbols ──────────────────────────────────────────────────
    const SY = 'assets/symbols/';
    this.load.image('symbol_pysanka_glow',    `${SY}symbol_pysanka_glow.png`);
    this.load.image('symbol_vyshyvanka_knot', `${SY}symbol_vyshyvanka_knot.png`);
    this.load.image('symbol_rushnyk_cross',   `${SY}symbol_rushnyk_cross.png`);
  }

  create() {
    this._ensureFallbacks();
    this._makeParticleTextures();
    this.scene.start('MenuScene');
  }

  _ensureFallbacks() {
    const defs = [
      // Legacy
      { key: 'bg',              color: 0x0a0020, w: 1280, h: 720 },
      { key: 'house_1',         color: 0x1a0040, w: 100,  h: 200 },
      { key: 'house_2',         color: 0x002244, w: 110,  h: 220 },
      { key: 'house_3',         color: 0x001a33, w: 120,  h: 240 },
      { key: 'sergiy',          color: 0xff00ff, w: 64,   h: 96  },
      { key: 'enemy_clerk',     color: 0x444466, w: 48,   h: 64  },
      { key: 'enemy_runner',    color: 0x664400, w: 40,   h: 56  },
      { key: 'enemy_tank',      color: 0x223355, w: 80,   h: 80  },
      { key: 'boss_vakhtersha', color: 0x440066, w: 120,  h: 140 },
      // Stage 1 — player full
      { key: 'player_serhiy_full', color: 0xff00ff, w: 80, h: 120 },
      // Stage 1 — player frames (idle, walk, shoot)
      ...[...Array(12)].flatMap((_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return [
          { key: `player_serhiy_idle_${n}`, color: 0xcc00ff, w: 64, h: 96 },
          { key: `player_serhiy_walk_${n}`, color: 0xaa00dd, w: 64, h: 96 },
        ];
      }),
      ...[...Array(6)].map((_, i) => ({
        key: `player_serhiy_shoot_${String(i + 1).padStart(2, '0')}`, color: 0xff4488, w: 64, h: 96,
      })),
      // NPC
      { key: 'npc_mykhas_full',  color: 0x005566, w: 64, h: 96 },
      { key: 'npc_babtsya_full', color: 0x664400, w: 64, h: 96 },
      // Zombie clerk
      { key: 'enemy_zombie_clerk_full', color: 0x334400, w: 56, h: 80 },
      ...[...Array(8)].map((_, i) => ({
        key: `enemy_zombie_clerk_walk_${String(i + 1).padStart(2, '0')}`, color: 0x445500, w: 56, h: 80,
      })),
      // Archivarius
      { key: 'enemy_archivarius_full', color: 0x221155, w: 64, h: 88 },
      ...[...Array(6)].map((_, i) => ({
        key: `enemy_archivarius_attack_${String(i + 1).padStart(2, '0')}`, color: 0x332266, w: 64, h: 88,
      })),
      // Inspector
      { key: 'enemy_inspector_full', color: 0x112233, w: 80, h: 100 },
      ...[...Array(6)].map((_, i) => ({
        key: `enemy_inspector_slam_${String(i + 1).padStart(2, '0')}`, color: 0x113344, w: 80, h: 100,
      })),
      // Boss
      { key: 'boss_vakhtersha_full', color: 0x440066, w: 120, h: 140 },
      ...[...Array(8)].flatMap((_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return [
          { key: `boss_vakhtersha_phase1_${n}`, color: 0x440066, w: 120, h: 140 },
          { key: `boss_vakhtersha_phase2_${n}`, color: 0x880022, w: 120, h: 140 },
        ];
      }),
      // Items
      { key: 'item_radioactive_beet', color: 0x00ff44, w: 40, h: 40 },
      { key: 'item_golden_coupon',    color: 0xffcc00, w: 48, h: 32 },
      { key: 'item_iron_seal',        color: 0x888888, w: 36, h: 36 },
      { key: 'item_tryzub_fragment',  color: 0x0044ff, w: 36, h: 40 },
      // UI
      { key: 'ui_button_start', color: 0x004488, w: 200, h: 56  },
      { key: 'ui_hp_bar',       color: 0x220000, w: 300, h: 28  },
      { key: 'ui_wave_counter', color: 0x002244, w: 180, h: 40  },
      { key: 'ui_perk_card',    color: 0x110033, w: 160, h: 220 },
      { key: 'ui_dialog_box',   color: 0x001122, w: 640, h: 140 },
      // Perk icons
      { key: 'ui_icon_damage_up',  color: 0xff0044, w: 64, h: 64 },
      { key: 'ui_icon_speed_up',   color: 0x39ff14, w: 64, h: 64 },
      { key: 'ui_icon_hp_restore', color: 0xff00aa, w: 64, h: 64 },
      { key: 'ui_icon_fire_rate',  color: 0x00bfff, w: 64, h: 64 },
      { key: 'ui_icon_shield',     color: 0x7f00ff, w: 64, h: 64 },
      // FX
      { key: 'fx_bullet_blue',       color: 0x0066ff, w: 16, h: 8   },
      { key: 'fx_hit_pink',          color: 0xff69b4, w: 32, h: 32  },
      { key: 'fx_explosion_pysanka', color: 0xff9900, w: 64, h: 64  },
      { key: 'fx_boss_glitch_storm', color: 0x8800ff, w: 96, h: 96  },
      // Locations
      { key: 'location_khutir_day',       color: 0x336600, w: 1280, h: 720 },
      { key: 'location_khutir_night',     color: 0x001133, w: 1280, h: 720 },
      { key: 'location_forest_neon',      color: 0x002211, w: 1280, h: 720 },
      { key: 'location_field_sunflowers', color: 0x226600, w: 1280, h: 720 },
      { key: 'location_boss_arena',       color: 0x220022, w: 1280, h: 720 },
      // Cutscenes
      { key: 'cutscene_intro_01',     color: 0x111111, w: 1280, h: 720 },
      { key: 'cutscene_intro_02',     color: 0x111122, w: 1280, h: 720 },
      { key: 'cutscene_boss_arrival', color: 0x220011, w: 1280, h: 720 },
      // Comics
      { key: 'comic_panel_01', color: 0x111111, w: 640, h: 480 },
      { key: 'comic_panel_02', color: 0x111111, w: 640, h: 480 },
      // Symbols
      { key: 'symbol_pysanka_glow',    color: 0xff8800, w: 64, h: 64 },
      { key: 'symbol_vyshyvanka_knot', color: 0xff0044, w: 64, h: 64 },
      { key: 'symbol_rushnyk_cross',   color: 0xff4400, w: 64, h: 64 },
    ];

    for (const fb of defs) {
      if (
        this._failedKeys.has(fb.key) ||
        !this.textures.exists(fb.key) ||
        this.textures.get(fb.key).key === '__MISSING'
      ) {
        this._makeNeonRect(fb.key, fb.color, fb.w, fb.h);
      }
    }
  }

  _makeParticleTextures() {
    // Neon particle textures — glowing circles
    this._makeGlowCircle('particle_neon_pink',   0xff00aa, 8);
    this._makeGlowCircle('particle_neon_orange',  0xff6600, 7);
    this._makeGlowCircle('particle_neon_cyan',    0x00ffff, 6);
    this._makeGlowCircle('particle_neon_green',   0x00ff88, 6);
    // Legacy keys — now neon
    this._makeGlowCircle('particle_red',    0xff0044, 8);
    this._makeGlowCircle('particle_yellow', 0xffff00, 6);
  }

  _makeGlowCircle(key, color, r) {
    const size = r * 4;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer glow
    gfx.fillStyle(color, 0.25);
    gfx.fillCircle(size / 2, size / 2, r * 1.8);
    // Mid glow
    gfx.fillStyle(color, 0.6);
    gfx.fillCircle(size / 2, size / 2, r * 1.2);
    // Core
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(size / 2, size / 2, r * 0.6);
    gfx.generateTexture(key, size, size);
    gfx.destroy();
  }

  _makeNeonRect(key, color, w, h) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
    console.info(`Generated neon fallback texture: ${key}`);
  }
}

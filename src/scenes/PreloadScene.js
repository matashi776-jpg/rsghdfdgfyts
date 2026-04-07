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

    // ── Stage 1 — Hero: Olena ──────────────────────────────────────────────
    this.load.image('player_olena_full', `${P}player_olena_full.png`);
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`player_olena_idle_${n}`, `${P}player_olena_idle_${n}.png`);
      this.load.image(`player_olena_walk_${n}`, `${P}player_olena_walk_${n}.png`);
    }

    // ── Stage 1 — Hero: Mykhas ─────────────────────────────────────────────
    this.load.image('player_mykhas_full', `${P}player_mykhas_full.png`);
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, '0');
      this.load.image(`player_mykhas_idle_${n}`, `${P}player_mykhas_idle_${n}.png`);
      this.load.image(`player_mykhas_walk_${n}`, `${P}player_mykhas_walk_${n}.png`);
    }

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

    // ── Stage 1 — New Enemies ─────────────────────────────────────────────
    this.load.image('enemy_retro_enforcer_full',    `${EN}enemy_retro_enforcer_full.png`);
    this.load.image('enemy_propaganda_herald_full', `${EN}enemy_propaganda_herald_full.png`);
    this.load.image('enemy_factory_warden_full',    `${EN}enemy_factory_warden_full.png`);

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
    this._makeLocationFallbacks();
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
      // Hero Olena frames
      { key: 'player_olena_full', color: 0xff6600, w: 80, h: 120 },
      ...[...Array(8)].flatMap((_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return [
          { key: `player_olena_idle_${n}`, color: 0xff8844, w: 64, h: 96 },
          { key: `player_olena_walk_${n}`, color: 0xff6622, w: 64, h: 96 },
        ];
      }),
      // Hero Mykhas frames
      { key: 'player_mykhas_full', color: 0x9900ff, w: 72, h: 108 },
      ...[...Array(8)].flatMap((_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return [
          { key: `player_mykhas_idle_${n}`, color: 0xaa44ff, w: 56, h: 88 },
          { key: `player_mykhas_walk_${n}`, color: 0x8833dd, w: 56, h: 88 },
        ];
      }),
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
      // New enemies
      { key: 'enemy_retro_enforcer_full',    color: 0x003344, w: 72, h: 96  },
      { key: 'enemy_propaganda_herald_full', color: 0x223300, w: 60, h: 88  },
      { key: 'enemy_factory_warden_full',    color: 0x113300, w: 96, h: 112 },
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
      // FX
      { key: 'fx_bullet_blue',       color: 0x0066ff, w: 16, h: 8   },
      { key: 'fx_hit_pink',          color: 0xff69b4, w: 32, h: 32  },
      { key: 'fx_explosion_pysanka', color: 0xff9900, w: 64, h: 64  },
      { key: 'fx_boss_glitch_storm', color: 0x8800ff, w: 96, h: 96  },
      // Locations — will be overridden by _makeLocationFallbacks() below
      { key: 'location_khutir_day',       color: 0x0d1f00, w: 1280, h: 720 },
      { key: 'location_khutir_night',     color: 0x001133, w: 1280, h: 720 },
      { key: 'location_forest_neon',      color: 0x001a0a, w: 1280, h: 720 },
      { key: 'location_field_sunflowers', color: 0x1a2200, w: 1280, h: 720 },
      { key: 'location_lanchin_city',     color: 0x0a0a1a, w: 1280, h: 720 },
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

  // ── Procedural location backgrounds ──────────────────────────────────────

  _makeLocationFallbacks() {
    this._makeLanchinCity();
    this._makeForestNeon();
    this._makeKhutirDay();
  }

  /**
   * Lanchyn City — industrial quarters, 19th-c factories, wooden houses,
   * neon ritual points. Dark navy base, bright neon accents.
   */
  _makeLanchinCity() {
    const W = 1280, H = 720;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sky gradient: deep navy to dark teal
    for (let y = 0; y < H * 0.55; y++) {
      const t = y / (H * 0.55);
      const r = Math.round(5  + t * 10);
      const gb = Math.round(5 + t * 20);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gb, gb + 10), 1);
      g.fillRect(0, y, W, 1);
    }

    // Ground: dark industrial concrete
    g.fillStyle(0x111118, 1);
    g.fillRect(0, H * 0.55, W, H * 0.45);

    // Ground neon line separating street
    g.lineStyle(2, 0x00ffff, 0.55);
    g.moveTo(0, H * 0.55);
    g.lineTo(W, H * 0.55);
    g.strokePath();

    // ── Factory silhouettes (19th c industrial) ──────────────────────────
    const factories = [
      { x: 80,  w: 160, h: 280, chimney: true },
      { x: 300, w: 220, h: 240, chimney: true },
      { x: 600, w: 180, h: 320, chimney: false },
      { x: 850, w: 200, h: 260, chimney: true },
      { x: 1100, w: 190, h: 300, chimney: false },
    ];
    factories.forEach(({ x, w, h, chimney }) => {
      const baseY = H * 0.55;
      g.fillStyle(0x0d0d18, 1);
      g.fillRect(x, baseY - h, w, h);
      // Window accents — neon orange (factory glow)
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < Math.floor(w / 40); col++) {
          const wx = x + 12 + col * 40;
          const wy = baseY - h + 30 + row * 55;
          const lit = Math.random() > 0.4;
          g.fillStyle(lit ? 0xff8800 : 0x221100, lit ? 0.9 : 0.5);
          g.fillRect(wx, wy, 22, 30);
        }
      }
      // Chimney
      if (chimney) {
        g.fillStyle(0x090912, 1);
        g.fillRect(x + w * 0.65, baseY - h - 60, 22, 60);
        // Chimney smoke glow
        g.fillStyle(0xff6600, 0.2);
        g.fillCircle(x + w * 0.65 + 11, baseY - h - 60, 20);
      }
      // Roof neon line
      g.lineStyle(2, 0x00aaff, 0.6);
      g.moveTo(x, baseY - h);
      g.lineTo(x + w, baseY - h);
      g.strokePath();
    });

    // ── Wooden houses (front row) ─────────────────────────────────────────
    const houses = [180, 460, 720, 980];
    houses.forEach(hx => {
      const bY = H * 0.55;
      const hw = 90, hh = 110;
      g.fillStyle(0x1a0e05, 1);
      g.fillRect(hx, bY - hh, hw, hh);
      // Roof triangle
      g.fillStyle(0x220e00, 1);
      g.fillTriangle(hx - 10, bY - hh, hx + hw + 10, bY - hh, hx + hw / 2, bY - hh - 40);
      // Door
      g.fillStyle(0x331100, 1);
      g.fillRect(hx + 33, bY - 50, 24, 50);
      // Window — neon yellow glow
      g.fillStyle(0xffee00, 0.7);
      g.fillRect(hx + 10, bY - hh + 20, 26, 22);
      g.fillRect(hx + hw - 36, bY - hh + 20, 26, 22);
    });

    // ── Neon ritual points ────────────────────────────────────────────────
    const rituals = [
      { x: 240, color: 0xff00ff },
      { x: 520, color: 0x00ffcc },
      { x: 810, color: 0xff8800 },
      { x: 1060, color: 0x8800ff },
    ];
    rituals.forEach(({ x, color }) => {
      const ry = H * 0.55 - 5;
      g.fillStyle(color, 0.35);
      g.fillCircle(x, ry, 28);
      g.fillStyle(color, 0.8);
      g.fillCircle(x, ry, 8);
      g.lineStyle(1, color, 0.7);
      // Ritual cross lines
      g.moveTo(x - 20, ry); g.lineTo(x + 20, ry); g.strokePath();
      g.moveTo(x, ry - 20); g.lineTo(x, ry + 12); g.strokePath();
    });

    // ── Street neon lane lines ─────────────────────────────────────────────
    for (let lx = 0; lx < W; lx += 80) {
      g.lineStyle(1, 0x004466, 0.45);
      g.moveTo(lx, H * 0.55);
      g.lineTo(lx + 40, H);
      g.strokePath();
    }

    g.generateTexture('location_lanchin_city', W, H);
    g.destroy();

    // Also use as khutir_day (same industrial Lanchyn setting)
    if (
      this._failedKeys.has('location_khutir_day') ||
      !this.textures.exists('location_khutir_day') ||
      this.textures.get('location_khutir_day').key === '__MISSING'
    ) {
      // Re-draw a lighter version for khutir day
      const gd = this.make.graphics({ x: 0, y: 0, add: false });
      gd.fillStyle(0x1a2a05, 1);
      gd.fillRect(0, 0, W, H * 0.6);
      gd.fillStyle(0x0d1505, 1);
      gd.fillRect(0, H * 0.6, W, H * 0.4);
      // Simple rolling hills silhouette
      gd.fillStyle(0x0a1c03, 1);
      [100, 350, 650, 900, 1150].forEach(hx => {
        gd.fillCircle(hx, H * 0.6, 120);
      });
      gd.lineStyle(2, 0x88ff44, 0.4);
      gd.moveTo(0, H * 0.6); gd.lineTo(W, H * 0.6); gd.strokePath();
      gd.generateTexture('location_khutir_day', W, H);
      gd.destroy();
    }
  }

  /**
   * Forest Fields — ancient trees, magical neon flowers, soft mysterious light.
   * Deep green base with scattered neon bloom highlights.
   */
  _makeForestNeon() {
    const key = 'location_forest_neon';
    if (
      !this._failedKeys.has(key) &&
      this.textures.exists(key) &&
      this.textures.get(key).key !== '__MISSING'
    ) return;

    const W = 1280, H = 720;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Deep forest sky
    g.fillStyle(0x010d05, 1);
    g.fillRect(0, 0, W, H);

    // Distant canopy gradient rows
    for (let y = 0; y < H * 0.5; y += 2) {
      const t = y / (H * 0.5);
      const c = Math.round(t * 14);
      g.fillStyle(Phaser.Display.Color.GetColor(0, c, Math.round(c * 0.7)), 1);
      g.fillRect(0, y, W, 2);
    }

    // Ground — dark moss
    g.fillStyle(0x02100a, 1);
    g.fillRect(0, H * 0.55, W, H * 0.45);

    // ── Ancient tree silhouettes ─────────────────────────────────────────
    const treePositions = [60, 200, 370, 540, 700, 860, 1020, 1160];
    treePositions.forEach(tx => {
      const th = Phaser.Math.Between(220, 340);
      const tw = Phaser.Math.Between(50, 80);
      const bY = H * 0.55;
      // Trunk
      g.fillStyle(0x050f03, 1);
      g.fillRect(tx - tw / 4, bY - th, tw / 2, th);
      // Canopy — dark green mound
      g.fillStyle(0x041408, 1);
      g.fillCircle(tx, bY - th, tw * 0.9);
      g.fillCircle(tx - tw * 0.4, bY - th + 30, tw * 0.7);
      g.fillCircle(tx + tw * 0.4, bY - th + 25, tw * 0.7);
      // Neon edge glow on canopy
      g.lineStyle(1, 0x00ff88, 0.4);
      g.strokeCircle(tx, bY - th, tw * 0.9);
    });

    // ── Magical neon flowers ──────────────────────────────────────────────
    const flowerColors = [0xff00aa, 0x00ffcc, 0xffaa00, 0xff44ff, 0x44ffaa];
    for (let i = 0; i < 55; i++) {
      const fx = Phaser.Math.Between(20, W - 20);
      const fy = Phaser.Math.Between(H * 0.52, H - 12);
      const fc = flowerColors[i % flowerColors.length];
      const fr = Phaser.Math.Between(4, 11);
      g.fillStyle(fc, 0.85);
      g.fillCircle(fx, fy, fr);
      g.fillStyle(fc, 0.2);
      g.fillCircle(fx, fy, fr * 2.5);
    }

    // ── Soft light beams from canopy ─────────────────────────────────────
    [250, 550, 830, 1100].forEach(bx => {
      g.fillStyle(0x00ff88, 0.04);
      g.fillTriangle(bx - 40, 0, bx + 40, 0, bx, H * 0.55);
    });

    // ── Forest floor neon path ────────────────────────────────────────────
    g.lineStyle(2, 0x22ff88, 0.3);
    g.moveTo(0, H * 0.68);
    g.lineTo(W * 0.3, H * 0.66);
    g.lineTo(W * 0.6, H * 0.72);
    g.lineTo(W, H * 0.69);
    g.strokePath();

    g.generateTexture(key, W, H);
    g.destroy();
  }

  /**
   * Khutir day (simple green field with wooden fences — fallback only).
   * Actual detailed version is drawn in _makeLanchinCity.
   */
  _makeKhutirDay() {
    // Already handled inside _makeLanchinCity
  }
}

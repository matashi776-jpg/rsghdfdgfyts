/**
 * LanchinCitySystem.js
 * Manages the city of Lanchin as a living organism.
 *
 * The city has 5 tiers (Хутір → Ланчин-Місто-Сонця).
 * Every defended wave increases a "Homestead Points" counter.
 * When enough waves are defended the city upgrades, becomes visually richer,
 * and grants stronger gameplay bonuses (defense, income, spell power, defenders).
 *
 * Visual representation:
 *  - Neon symbols drawn procedurally, pulsating at higher tiers
 *  - House tint changes per tier
 *  - Lore banner shown on level-up
 */
import { LANCHIN_TIERS } from '../core/LoreData.js';

export default class LanchinCitySystem {
  /**
   * @param {Phaser.Scene} scene — BattleScene that owns this system
   */
  constructor(scene) {
    this.scene          = scene;
    this.tier           = 0;   // index into LANCHIN_TIERS (0 = Хутір)
    this.wavesDefended  = 0;

    // Graphics objects owned by this system
    this._symbolGfx = null;
    this._bannerTxt = null;
    this._pulseTimer = null;

    this._buildSymbols();
  }

  // ─── Called after each successful wave ───────────────────────────────────────

  onWaveDefended() {
    this.wavesDefended++;
    this._checkUpgrade();
    this._refreshSymbols();
  }

  // ─── Current bonuses ──────────────────────────────────────────────────────────

  getBonuses() {
    return { ...LANCHIN_TIERS[this.tier].bonuses };
  }

  getCurrentTier() {
    return LANCHIN_TIERS[this.tier];
  }

  // ─── Check for tier upgrade ───────────────────────────────────────────────────

  _checkUpgrade() {
    const nextIdx = this.tier + 1;
    if (nextIdx >= LANCHIN_TIERS.length) return;
    const next = LANCHIN_TIERS[nextIdx];
    if (this.wavesDefended >= next.threshold) {
      this.tier = nextIdx;
      this._onTierUp(LANCHIN_TIERS[nextIdx]);
    }
  }

  // ─── Tier-up event ────────────────────────────────────────────────────────────

  _onTierUp(tier) {
    const scene = this.scene;
    const { width, height } = scene.scale;

    // Update house tint
    if (scene.house) {
      scene.house.setTint(tier.glowColor);
    }

    // Apply defense bonus to scene modifiers
    if (scene.modifiers) {
      scene.modifiers.wallDefense = tier.bonuses.defense;
      scene.modifiers.passiveIncome = tier.bonuses.income;
    }

    // Flash screen in tier colour
    const col = Phaser.Display.Color.IntegerToColor(tier.glowColor);
    scene.cameras.main.flash(600, col.red, col.green, col.blue);
    scene.cameras.main.shake(400, 0.012);

    // Big upgrade banner
    this._showUpgradeBanner(tier);

    // Particle burst from house
    this._burstParticles(tier.glowColor);

    // Rebuild symbols with new glow
    this._buildSymbols();
  }

  // ─── Build / refresh neon symbols ────────────────────────────────────────────

  _buildSymbols() {
    const scene = this.scene;
    if (this._symbolGfx) { this._symbolGfx.destroy(); }
    if (this._pulseTimer) { this._pulseTimer.remove(); }

    const tier     = LANCHIN_TIERS[this.tier];
    const color    = tier.glowColor;
    const alpha    = 0.18 + this.tier * 0.10;   // brighter at higher tiers
    const count    = 3 + this.tier * 2;          // more symbols at higher tiers

    const g = scene.add.graphics().setDepth(2).setAlpha(alpha);
    this._symbolGfx = g;

    const { width, height } = scene.scale;

    // Draw simple Ukrainian cross/diamond symbols around the house
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r     = 90 + this.tier * 15;
      const cx    = 150 + Math.cos(angle) * r;
      const cy    = height / 2 + Math.sin(angle) * r;

      g.lineStyle(2 + this.tier, color, 1);
      // Diamond (rhombus) — folksy embroidery motif
      const s = 10 + this.tier * 2;
      g.moveTo(cx, cy - s);
      g.lineTo(cx + s, cy);
      g.lineTo(cx, cy + s);
      g.lineTo(cx - s, cy);
      g.lineTo(cx, cy - s);
      g.strokePath();

      // Inner cross
      g.lineStyle(1, color, 0.7);
      g.moveTo(cx - s * 0.5, cy);
      g.lineTo(cx + s * 0.5, cy);
      g.moveTo(cx, cy - s * 0.5);
      g.lineTo(cx, cy + s * 0.5);
      g.strokePath();
    }

    // At tier 4+ draw top arc of vyshyvanka pattern
    if (this.tier >= 3) {
      g.lineStyle(3, 0xffd700, 0.6);
      g.arc(150, height / 2, 130, 0, Math.PI * 2, false, 0.5);
      g.strokePath();
    }

    // Pulsing alpha animation
    this._pulseTimer = scene.tweens.add({
      targets:  g,
      alpha:    alpha * 1.6,
      duration: 1200 - this.tier * 120,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
  }

  _refreshSymbols() {
    // Slight brightness bump on each defended wave (capped)
    if (this._symbolGfx) {
      const curAlpha = this._symbolGfx.alpha;
      this._symbolGfx.setAlpha(Math.min(0.95, curAlpha + 0.03));
    }
  }

  // ─── Banner display ───────────────────────────────────────────────────────────

  _showUpgradeBanner(tier) {
    const scene = this.scene;
    const { width, height } = scene.scale;

    // Remove old banner
    if (this._bannerTxt) { this._bannerTxt.destroy(); }

    const col = `#${tier.glowColor.toString(16).padStart(6, '0')}`;

    // Background panel
    const panel = scene.add.graphics().setDepth(50);
    panel.fillStyle(0x000000, 0.80);
    panel.fillRoundedRect(width / 2 - 380, height * 0.30, 760, 140, 12);
    panel.lineStyle(3, tier.glowColor, 1);
    panel.strokeRoundedRect(width / 2 - 380, height * 0.30, 760, 140, 12);

    const nameTxt = scene.add.text(width / 2, height * 0.37, `⚡ ${tier.name.toUpperCase()} ⚡`, {
      fontFamily: 'Arial Black, Arial',
      fontSize:   '30px',
      color:      col,
      stroke:     '#000000',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: col, blur: 20, fill: true },
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    const loreTxt = scene.add.text(width / 2, height * 0.44, tier.lore, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '14px',
      color:      '#ddddee',
      wordWrap:   { width: 720 },
      align:      'center',
    }).setOrigin(0.5).setDepth(51).setAlpha(0);

    scene.tweens.add({ targets: [nameTxt, loreTxt, panel], alpha: 1, duration: 400 });
    scene.time.delayedCall(3800, () => {
      scene.tweens.add({
        targets:  [nameTxt, loreTxt, panel],
        alpha:    0,
        duration: 500,
        onComplete: () => { nameTxt.destroy(); loreTxt.destroy(); panel.destroy(); },
      });
    });

    this._bannerTxt = nameTxt;
  }

  // ─── Particle burst on upgrade ────────────────────────────────────────────────

  _burstParticles(color) {
    const scene = this.scene;
    const pKey  = this.tier >= 3 ? 'particle_neon_cyan' : 'particle_neon_pink';

    const em = scene.add.particles(150, scene.scale.height / 2, pKey, {
      speed:    { min: 80, max: 360 },
      scale:    { start: 2.0, end: 0 },
      alpha:    { start: 1,   end: 0 },
      lifespan: { min: 500,   max: 1100 },
      angle:    { min: 0,     max: 360 },
      tint:     [color, 0xffffff, 0xffdd00],
      emitting: false,
    }).setDepth(20);
    em.explode(60, 150, scene.scale.height / 2);
    scene.time.delayedCall(1200, () => { if (em.active) em.destroy(); });
  }

  // ─── Lore fragment display ─────────────────────────────────────────────────────

  showLoreFragment(fragment) {
    const scene = this.scene;
    const { width, height } = scene.scale;

    const panel = scene.add.graphics().setDepth(52);
    panel.fillStyle(0x000000, 0.72);
    panel.fillRoundedRect(width / 2 - 320, height * 0.80, 640, 70, 8);
    panel.lineStyle(1, 0x00ffff, 0.6);
    panel.strokeRoundedRect(width / 2 - 320, height * 0.80, 640, 70, 8);

    const txt = scene.add.text(width / 2, height * 0.835, fragment.text, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '13px',
      color:      '#aaddff',
      wordWrap:   { width: 620 },
      align:      'center',
    }).setOrigin(0.5).setDepth(53).setAlpha(0);

    scene.tweens.add({ targets: [txt, panel], alpha: 1, duration: 500 });
    scene.time.delayedCall(5000, () => {
      scene.tweens.add({
        targets: [txt, panel],
        alpha:   0,
        duration: 500,
        onComplete: () => { txt.destroy(); panel.destroy(); },
      });
    });
  }

  destroy() {
    if (this._symbolGfx) this._symbolGfx.destroy();
    if (this._pulseTimer) this._pulseTimer.remove();
  }
}

/**
 * TacticalBattleScene.js
 * HoMM5-style turn-based tactical battle — Оборона Ланчина
 *
 * Grid battlefield: heroes (left) vs enemies (right).
 * Turn order: hero phase → enemy phase.
 * Heroes: Serhiy (glowing-field slow) and Olena (resource glyph).
 * Spells have cooldowns upgradeable via runes.
 * XP gained per kill. Every 3 game-rounds → PerkScene (3 folklore bonuses).
 * Enemies scale +10% per round and gain new tactics each wave.
 */

const COLS = 10;
const ROWS = 6;
const CW   = 88;  // cell width
const CH   = 76;  // cell height
const OX   = 60;  // grid origin X
const OY   = 80;  // grid origin Y

// ─── Hero spell catalogue ────────────────────────────────────────────────────
const SPELLS = {
  serhiy: [
    {
      id:       'glow_field',
      name:     'Світлове Поле',
      desc:     'Сповільнює всіх ворогів на 2 ходи',
      icon:     '✨',
      cooldown: 3,
      effect:   'slow_all',
    },
    {
      id:       'shield_bash',
      name:     'Щитовий Удар',
      desc:     'Завдає 40 шкоди найближчому ворогу',
      icon:     '🛡',
      cooldown: 2,
      effect:   'bash',
    },
  ],
  olena: [
    {
      id:       'resource_glyph',
      name:     'Гліф Ресурсів',
      desc:     '+3🌿 +2ᚠ +50💰',
      icon:     '🔮',
      cooldown: 4,
      effect:   'resource_boost',
    },
    {
      id:       'rune_wall',
      name:     'Рунна Стіна',
      desc:     'Захист команди +50% на 1 хід',
      icon:     'ᚠ',
      cooldown: 3,
      effect:   'team_shield',
    },
  ],
};

export default class TacticalBattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TacticalBattleScene' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  init(data) {
    this.resources       = data.resources       ?? { herbs: 5, runes: 3, pysanka: 2, money: 100 };
    this.cordonLevel     = data.cordonLevel     ?? 1;
    this.round           = data.round           ?? 1;
    this.xp              = data.xp              ?? 0;
    this.level           = data.level           ?? 1;
    this.modifiers       = data.modifiers       ?? { damage: 1, speed: 1, defense: 1, income: 1 };
    this.ritualBuff      = data.ritualBuff      ?? null;
    this.ritualDebuff    = data.ritualDebuff    ?? null;
    this.defeatedEnemies = data.defeatedEnemies ?? 0;
    this.interrupted     = data.interrupted     ?? false;

    this.currentTurn  = 'hero';
    this.battleRound  = 1;
    this.battleOver   = false;
    this.selectedHero = null;
    this._gridZones   = [];
    this._logLines    = [];

    this._buildUnits();
    this.grid = this._initGrid();
    this._placeUnitsOnGrid();
  }

  // ─── Unit construction ────────────────────────────────────────────────────

  _buildUnits() {
    const dmgMod  = this.modifiers.damage  ?? 1;
    const defMod  = this.modifiers.defense ?? 1;
    const vuln    = this.interrupted;

    this.heroes = [
      {
        id:     'serhiy',
        name:   'Сергій',
        icon:   '🦸',
        hp:     Math.floor((120 + (this.modifiers.healBonus ?? 0)) * (vuln ? 0.75 : 1)),
        maxHp:  120 + (this.modifiers.healBonus ?? 0),
        atk:    Math.floor(30 * dmgMod),
        def:    Math.floor(10 * defMod),
        speed:  2,
        col: 1, row: 2,
        spells:        SPELLS.serhiy.map(s => ({ ...s, cd: 0 })),
        status:        vuln ? [{ type: 'vulnerable', dur: 2 }] : [],
        moved: false,  acted: false,
        color: 0x0066ff,
        isHero: true,
        xpValue: 0,
      },
      {
        id:     'olena',
        name:   'Олена',
        icon:   '🧙',
        hp:     Math.floor((90  + (this.modifiers.healBonus ?? 0)) * (vuln ? 0.75 : 1)),
        maxHp:  90  + (this.modifiers.healBonus ?? 0),
        atk:    Math.floor(20 * dmgMod),
        def:    Math.floor(15 * defMod),
        speed:  2,
        col: 0, row: 3,
        spells:        SPELLS.olena.map(s => ({ ...s, cd: 0 })),
        status:        vuln ? [{ type: 'vulnerable', dur: 2 }] : [],
        moved: false,  acted: false,
        color: 0x00aaff,
        isHero: true,
        xpValue: 0,
      },
    ];

    const scale    = 1 + (this.round - 1) * 0.1 + this.cordonLevel * 0.05;
    const slowMult = 1 - Math.min(0.7, this.modifiers.enemySlow  ?? 0);
    const weakMult = 1 - Math.min(0.7, this.modifiers.enemyWeak  ?? 0);

    // Enemy roster grows with round
    this.enemies = [];
    const add = (e) => this.enemies.push(e);

    // Wave 1+ : clerks
    add(this._mkEnemy('clerk',       'Клерк',       '👔', 60,  15, 5, 2, 8, 1, 0xaa44ff, 20, 'aggressive', scale, slowMult, weakMult));
    add(this._mkEnemy('clerk',       'Клерк',       '👔', 60,  15, 5, 2, 8, 4, 0xaa44ff, 20, 'aggressive', scale, slowMult, weakMult));

    if (this.round >= 2) {
      add(this._mkEnemy('archivarius', 'Архіваріус', '📚', 100, 20, 12, 1, 9, 2, 0xff8800, 35, 'ranged',    scale, slowMult, weakMult));
    }
    if (this.round >= 3) {
      add(this._mkEnemy('inspector',   'Інспектор',  '🕵', 150, 25, 20, 1, 9, 3, 0x00ff44, 50, 'defensive', scale, slowMult, weakMult));
    }
    if (this.round >= 5) {
      add(this._mkEnemy('elder',       'Старший',    '👹', 200, 30, 25, 1, 9, 5, 0xff0044, 80, 'boss',      scale, slowMult, weakMult));
    }
  }

  _mkEnemy(type, name, icon, hp, atk, def, spd, col, row, color, xpVal, tactics, scale, slowMult, weakMult) {
    const scaledHP  = Math.floor(hp  * scale);
    return {
      id:      `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      type, name, icon, color,
      hp:      scaledHP,
      maxHp:   scaledHP,
      atk:     Math.floor(atk * scale * weakMult),
      def:     Math.floor(def * scale),
      speed:   Math.max(1, Math.floor(spd * slowMult)),
      col, row,
      status:  [],
      xpValue: xpVal,
      tactics,
      isHero:  false,
    };
  }

  _initGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  _placeUnitsOnGrid() {
    for (const u of [...this.heroes, ...this.enemies]) {
      if (u.row >= 0 && u.row < ROWS && u.col >= 0 && u.col < COLS) {
        this.grid[u.row][u.col] = u;
      }
    }
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(800);

    this._drawBackground(width, height);

    this._gridGfx = this.add.graphics().setDepth(3);
    this._drawGrid();

    this._unitContainer = this.add.container(0, 0).setDepth(10);
    this._drawAllUnits();

    this._buildHUD(width, height);
    this._buildSpellPanel(width, height);
    this._buildEndTurnButton(width, height);

    this._showBanner(`⚔ РАУНД ${this.round}`, '#ff00ff');

    if (this.ritualBuff || this.ritualDebuff) this._showRitualNotice();
    if (this.interrupted)                     this._showInterruptedFlash(width, height);
  }

  // ─── Drawing helpers ──────────────────────────────────────────────────────

  _drawBackground(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x050a18).setDepth(0);

    const scanlines = this.add.graphics().setAlpha(0.04).setDepth(1);
    for (let y = 0; y < height; y += 5) {
      scanlines.lineStyle(1, 0x00ffff, 1);
      scanlines.moveTo(0, y); scanlines.lineTo(width, y);
    }
    scanlines.strokePath();

    // Divider line (hero / enemy territory)
    const divX = OX + CW * 4 + CW / 2;
    const dg = this.add.graphics().setDepth(2);
    for (let y = OY; y < OY + ROWS * CH; y += 10) {
      dg.lineStyle(1, 0xff3333, 0.35);
      dg.moveTo(divX, y); dg.lineTo(divX, y + 6);
    }
    dg.strokePath();

    this.add.text(OX + CW * 1.5, OY - 22, 'ГЕРОЇ', {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', color: '#0088ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#0088ff', blur: 8, fill: true },
    }).setOrigin(0.5, 1).setDepth(5);

    this.add.text(OX + CW * 7.5, OY - 22, 'ВОРОГИ', {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', color: '#ff4444',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff4444', blur: 8, fill: true },
    }).setOrigin(0.5, 1).setDepth(5);
  }

  _drawGrid() {
    this._gridGfx.clear();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cx = OX + col * CW;
        const cy = OY + row * CH;
        const isHeroSide = col < 4;
        this._gridGfx.fillStyle(isHeroSide ? 0x001133 : 0x110000, 0.55);
        this._gridGfx.fillRect(cx, cy, CW - 2, CH - 2);
        this._gridGfx.lineStyle(1, isHeroSide ? 0x003366 : 0x330000, 0.8);
        this._gridGfx.strokeRect(cx, cy, CW - 2, CH - 2);
      }
    }
  }

  _highlightCell(col, row, color, alpha = 0.4) {
    const cx = OX + col * CW, cy = OY + row * CH;
    this._gridGfx.fillStyle(color, alpha);
    this._gridGfx.fillRect(cx, cy, CW - 2, CH - 2);
  }

  _cellXY(col, row) {
    return { x: OX + col * CW + CW / 2, y: OY + row * CH + CH / 2 };
  }

  // ─── Unit rendering ───────────────────────────────────────────────────────

  _drawAllUnits() {
    this._unitContainer.removeAll(true);

    for (const hero of this.heroes)   if (hero.hp > 0) this._drawUnit(hero);
    for (const enemy of this.enemies) if (enemy.hp > 0) this._drawUnit(enemy);
  }

  _drawUnit(unit) {
    const { x, y } = this._cellXY(unit.col, unit.row);
    const r         = CW * 0.36;
    const hexColor  = '#' + unit.color.toString(16).padStart(6, '0');

    const gfx = this.add.graphics();
    gfx.fillStyle(unit.color, 0.28);
    gfx.fillCircle(0, 0, r);
    gfx.lineStyle(2, unit.color, unit === this.selectedHero ? 1 : 0.85);
    gfx.strokeCircle(0, 0, r);
    if (unit === this.selectedHero) {
      gfx.lineStyle(3, 0xffffff, 0.9);
      gfx.strokeCircle(0, 0, r + 3);
    }

    const icon = this.add.text(0, -7, unit.icon, { fontSize: '22px' }).setOrigin(0.5);
    const name = this.add.text(0, 14, unit.name, {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', color: hexColor,
    }).setOrigin(0.5);

    // HP bar
    const bw = 40, bh = 5;
    const hpR = Math.max(0, unit.hp / unit.maxHp);
    const hpG = this.add.graphics();
    hpG.fillStyle(0x220000, 0.85); hpG.fillRect(-bw / 2, 22, bw, bh);
    const hpCol = hpR > 0.5 ? 0x00ff88 : hpR > 0.25 ? 0xffaa00 : 0xff2222;
    hpG.fillStyle(hpCol, 1);     hpG.fillRect(-bw / 2, 22, Math.round(bw * hpR), bh);

    // Status icons
    const statusStr = (unit.status ?? []).map(s =>
      s.type === 'vulnerable' ? '💔' : s.type === 'slowed' ? '🐢' : s.type === 'shielded' ? '🛡' : ''
    ).join('');
    const statusTxt = statusStr
      ? this.add.text(0, -28, statusStr, { fontSize: '12px' }).setOrigin(0.5)
      : null;

    const cont = this.add.container(x, y, [gfx, icon, name, hpG, ...(statusTxt ? [statusTxt] : [])]);

    if (unit.isHero && this.currentTurn === 'hero' && !this.battleOver) {
      const zone = this.add.zone(0, 0, CW - 4, CH - 4).setInteractive({ useHandCursor: true });
      cont.add(zone);
      zone.on('pointerdown', () => this._onHeroClick(unit));
    }

    this._unitContainer.add(cont);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  _buildHUD(width, height) {
    const bg = this.add.graphics().setDepth(20);
    bg.fillStyle(0x000c22, 0.92); bg.fillRect(0, 0, width, 55);

    this._roundTxt = this.add.text(width / 2, 28, this._roundLabel(), {
      fontFamily: 'Arial Black, Arial', fontSize: '17px', color: '#00ffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(21);

    this._turnTxt = this.add.text(18, 28, '⚔ ХІД ГЕРОЇВ', {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', color: '#0088ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#0088ff', blur: 8, fill: true },
    }).setOrigin(0, 0.5).setDepth(21);

    this._xpTxt = this.add.text(width - 16, 28, `XP: ${this.xp} | Lvl: ${this.level}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#ffaa00',
    }).setOrigin(1, 0.5).setDepth(21);

    // Bottom resource bar
    this.add.graphics().setDepth(20).fillStyle(0x000c22, 0.88).fillRect(0, height - 44, width, 44);

    this._resTxt = this.add.text(16, height - 22, this._resLabel(), {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#aaffcc',
    }).setOrigin(0, 0.5).setDepth(21);

    // Combat log (top-right overlay)
    this._logTxt = this.add.text(
      OX + COLS * CW + 14,
      OY,
      '',
      { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#9999bb', wordWrap: { width: 210 } }
    ).setDepth(20);
  }

  _roundLabel()  { return `Раунд ${this.round}  |  Хід ${this.battleRound}`; }
  _resLabel()    {
    const r = this.resources;
    return `🌿${r.herbs}  ᚠ${r.runes}  🥚${r.pysanka}  💰${r.money}`;
  }

  // ─── Spell panel ──────────────────────────────────────────────────────────

  _buildSpellPanel(width, height) {
    const panelX = OX + COLS * CW + 10;
    const panelW = width - panelX - 10;
    let   sy     = OY + 30;

    this.add.text(panelX + panelW / 2, OY + 10, 'ЗДІБНОСТІ', {
      fontFamily: 'Arial Black, Arial', fontSize: '12px', color: '#ff00ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 8, fill: true },
    }).setOrigin(0.5, 1).setDepth(21);

    for (const hero of this.heroes) {
      this.add.text(panelX, sy, `${hero.icon} ${hero.name}`, {
        fontFamily: 'Arial Black, Arial', fontSize: '11px',
        color: '#' + hero.color.toString(16).padStart(6, '0'),
      }).setDepth(21);
      sy += 18;

      for (const spell of hero.spells) {
        this._drawSpellBtn(panelX, sy, panelW, spell, hero);
        sy += 42;
      }
      sy += 6;
    }
  }

  _drawSpellBtn(x, y, w, spell, hero) {
    const onCd     = spell.cd > 0;
    const accent   = onCd ? 0x333355 : 0x0088ff;
    const bgColor  = onCd ? 0x111111 : 0x001133;
    const h        = 36;

    const gfx = this.add.graphics().setDepth(21);
    gfx.fillStyle(bgColor, 0.92);
    gfx.fillRoundedRect(x, y, w, h, 5);
    gfx.lineStyle(1, accent, 0.9);
    gfx.strokeRoundedRect(x, y, w, h, 5);

    this.add.text(x + 4, y + 4, `${spell.icon} ${spell.name}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px',
      color: onCd ? '#444466' : '#00ffff', wordWrap: { width: w - 8 },
    }).setDepth(22);

    this.add.text(x + 4, y + 20, onCd ? `⏳ ${spell.cd}` : '● Готово', {
      fontFamily: 'Arial, sans-serif', fontSize: '9px',
      color: onCd ? '#ff4444' : '#44ff88',
    }).setDepth(22);

    if (!onCd) {
      const zone = this.add.zone(x + w / 2, y + h / 2, w, h)
        .setInteractive({ useHandCursor: true }).setDepth(23);
      zone.on('pointerdown', () => this._castSpell(hero, spell));
      zone.on('pointerover', () => this._showTooltip(`${spell.name}: ${spell.desc}`));
      zone.on('pointerout',  () => this._hideTooltip());
    }
  }

  _buildEndTurnButton(width, height) {
    const bx = width - 82, by = height - 22;
    const bg = this.add.graphics().setDepth(21);
    bg.fillStyle(0x003300, 0.92);
    bg.fillRoundedRect(bx - 78, by - 20, 156, 40, 7);
    bg.lineStyle(2, 0x00ff44, 0.9);
    bg.strokeRoundedRect(bx - 78, by - 20, 156, 40, 7);

    const btn = this.add.text(bx, by, '▶ КІНЕЦЬ ХОДУ', {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', color: '#00ff44',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff44', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout',  () => btn.setColor('#00ff44'));
    btn.on('pointerdown', () => { if (this.currentTurn === 'hero') this._endHeroPhase(); });
  }

  _showTooltip(text) {
    this._hideTooltip();
    const { width, height } = this.scale;
    this._tooltip = this.add.text(width / 2, height - 70, text, {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#001122', padding: { x: 6, y: 4 },
    }).setOrigin(0.5).setDepth(30);
  }
  _hideTooltip() { if (this._tooltip) { this._tooltip.destroy(); this._tooltip = null; } }

  _log(msg) {
    this._logLines.push(msg);
    if (this._logLines.length > 7) this._logLines.shift();
    this._logTxt?.setText(this._logLines.join('\n'));
  }

  // ─── Interaction ──────────────────────────────────────────────────────────

  _onHeroClick(hero) {
    if (this.currentTurn !== 'hero' || this.battleOver) return;

    if (this.selectedHero === hero) {
      this.selectedHero = null;
      this._clearGridZones();
      this._drawGrid();
      this._drawAllUnits();
    } else {
      this.selectedHero = hero;
      this._drawGrid();
      this._drawAllUnits();
      this._highlightMovesFor(hero);
    }
  }

  _highlightMovesFor(hero) {
    this._clearGridZones();
    const range = hero.speed;

    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        if (dc === 0 && dr === 0) continue;
        const nr = hero.row + dr, nc = hero.col + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;

        const cell = this.grid[nr][nc];

        if (cell && !cell.isHero) {
          // Enemy in range → attack
          this._highlightCell(nc, nr, 0xff2222, 0.55);
          this._gridZones.push(this._makeZone(nc, nr, () => this._heroAttack(hero, cell)));
        } else if (!cell && nc <= hero.col + range && nc >= 0) {
          // Empty hero-side cell → move
          this._highlightCell(nc, nr, 0x0044ff, 0.3);
          this._gridZones.push(this._makeZone(nc, nr, () => this._heroMove(hero, nc, nr)));
        }
      }
    }
  }

  _makeZone(col, row, cb) {
    const { x, y } = this._cellXY(col, row);
    const z = this.add.zone(x, y, CW - 4, CH - 4)
      .setInteractive({ useHandCursor: true }).setDepth(12);
    z.on('pointerdown', cb);
    return z;
  }

  _clearGridZones() {
    for (const z of this._gridZones) if (z.active) z.destroy();
    this._gridZones = [];
  }

  // ─── Hero actions ─────────────────────────────────────────────────────────

  _heroMove(hero, nc, nr) {
    if (hero.moved) { this._log(`${hero.name}: вже рухався!`); return; }
    this.grid[hero.row][hero.col] = null;
    hero.col = nc; hero.row = nr;
    this.grid[nr][nc] = hero;
    hero.moved = true;
    this._clearGridZones();
    this.selectedHero = null;
    this._drawGrid();
    this._drawAllUnits();
    this._log(`${hero.name} → [${nc},${nr}]`);
    this._checkAutoEndHeroPhase();
  }

  _heroAttack(hero, target) {
    if (hero.acted) { this._log(`${hero.name}: вже діяв!`); return; }
    const vuln = hero.status?.some(s => s.type === 'vulnerable');
    let dmg = Math.max(1, hero.atk - target.def);
    if (vuln) dmg = Math.floor(dmg * 0.6);

    target.hp = Math.max(0, target.hp - dmg);
    hero.acted = true;
    this._showDmg(target, dmg, 0xff4444);
    this.cameras.main.shake(110, 0.005);
    this._log(`${hero.name} → ${target.name}: -${dmg} HP`);
    this._clearGridZones();
    this.selectedHero = null;

    if (target.hp <= 0) this._killEnemy(target);
    else { this._drawGrid(); this._drawAllUnits(); }
    this._checkAutoEndHeroPhase();
  }

  // ─── Spells ───────────────────────────────────────────────────────────────

  _castSpell(hero, spell) {
    if (this.currentTurn !== 'hero' || this.battleOver) return;
    if (spell.cd > 0) return;
    if (hero.acted) { this._log(`${hero.name}: вже діяв!`); return; }

    spell.cd = spell.cooldown;
    hero.acted = true;

    const { x, y } = this._cellXY(hero.col, hero.row);
    const burst = this.add.text(x, y, spell.icon, { fontSize: '40px' }).setOrigin(0.5).setDepth(35);
    this.tweens.add({ targets: burst, y: y - 70, alpha: 0, scaleX: 2, scaleY: 2, duration: 900, onComplete: () => burst.destroy() });

    switch (spell.effect) {
      case 'slow_all':
        for (const e of this.enemies) {
          if (e.hp <= 0) continue;
          e.status.push({ type: 'slowed', dur: 2 });
          e.speed = Math.max(1, e.speed - 1);
        }
        this.cameras.main.flash(300, 80, 80, 200);
        this._log(`✨ Сергій: Світлове Поле — вороги сповільнені!`);
        break;

      case 'bash': {
        const tgt = this._nearestEnemy(hero);
        if (tgt) {
          tgt.hp = Math.max(0, tgt.hp - 40);
          this._showDmg(tgt, 40, 0x0088ff);
          this._log(`🛡 Сергій: Щитовий удар → ${tgt.name} -40 HP`);
          if (tgt.hp <= 0) this._killEnemy(tgt);
        }
        break;
      }

      case 'resource_boost':
        this.resources.herbs  = (this.resources.herbs  ?? 0) + 3;
        this.resources.runes  = (this.resources.runes  ?? 0) + 2;
        this.resources.money  = (this.resources.money  ?? 0) + 50;
        this._resTxt?.setText(this._resLabel());
        this.cameras.main.flash(300, 0, 200, 100);
        this._log(`🔮 Олена: Гліф Ресурсів! +3🌿 +2ᚠ +50💰`);
        break;

      case 'team_shield':
        for (const h of this.heroes) {
          h.status.push({ type: 'shielded', dur: 1 });
          h.def = Math.floor(h.def * 1.5);
        }
        this.cameras.main.flash(300, 0, 50, 200);
        this._log(`ᚠ Олена: Рунна Стіна — команда захищена!`);
        break;
    }

    this._drawAllUnits();
    this._checkAutoEndHeroPhase();
  }

  _nearestEnemy(hero) {
    let best = null, bestD = Infinity;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const d = Math.abs(e.col - hero.col) + Math.abs(e.row - hero.row);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  // ─── Turn management ──────────────────────────────────────────────────────

  _checkAutoEndHeroPhase() {
    if (this.heroes.filter(h => h.hp > 0).every(h => h.acted)) {
      this.time.delayedCall(450, () => this._endHeroPhase());
    }
  }

  _endHeroPhase() {
    if (this.battleOver) return;
    this.currentTurn = 'enemy';
    this._turnTxt?.setText('⚠ ХІД ВОРОГІВ');
    this._turnTxt?.setStyle({ color: '#ff4444' });
    this._clearGridZones();
    this._log('─── Хід ворогів ───');
    this.time.delayedCall(500, () => this._doEnemyPhase());
  }

  _doEnemyPhase() {
    if (this.battleOver) return;
    const alive = this.enemies.filter(e => e.hp > 0);
    let delay = 0;
    for (const enemy of alive) {
      delay += 480;
      this.time.delayedCall(delay, () => {
        if (!this.battleOver) this._enemyAct(enemy);
      });
    }
    this.time.delayedCall(delay + 550, () => {
      if (!this.battleOver) this._startNewHeroTurn();
    });
  }

  _enemyAct(enemy) {
    if (enemy.hp <= 0) return;

    let target = null, bestD = Infinity;
    for (const h of this.heroes) {
      if (h.hp <= 0) continue;
      const d = Math.abs(h.col - enemy.col) + Math.abs(h.row - enemy.row);
      if (d < bestD) { bestD = d; target = h; }
    }
    if (!target) return;

    if (bestD <= 1) {
      // Adjacent — attack
      let dmg = Math.max(1, enemy.atk - target.def);
      if (this.modifiers.teamShield) dmg = Math.floor(dmg * 0.5);
      if (target.status?.some(s => s.type === 'vulnerable')) dmg = Math.floor(dmg * 1.4);
      target.hp = Math.max(0, target.hp - dmg);
      this._showDmg(target, dmg, 0xff2222);
      this.cameras.main.shake(80, 0.004);
      this._log(`${enemy.name} → ${target.name}: -${dmg} HP`);
      if (target.hp <= 0) {
        this._log(`💀 ${target.name} впав!`);
        this._drawAllUnits();
        this._checkBattleEnd();
      } else {
        this._drawAllUnits();
      }
    } else {
      // Move toward target
      const prevCol = enemy.col, prevRow = enemy.row;
      this.grid[prevRow][prevCol] = null;

      const moveCols = Math.min(enemy.speed, Math.abs(enemy.col - target.col));
      enemy.col = Math.max(0, enemy.col - moveCols);
      if      (enemy.row < target.row) enemy.row = Math.min(ROWS - 1, enemy.row + 1);
      else if (enemy.row > target.row) enemy.row = Math.max(0,        enemy.row - 1);

      if (this.grid[enemy.row][enemy.col]) {
        enemy.col = prevCol; enemy.row = prevRow;
      }
      this.grid[enemy.row][enemy.col] = enemy;
      this._drawAllUnits();
    }
  }

  _startNewHeroTurn() {
    if (this.battleOver) return;
    this.battleRound++;
    this.currentTurn = 'hero';
    this._turnTxt?.setText('⚔ ХІД ГЕРОЇВ');
    this._turnTxt?.setStyle({ color: '#0088ff' });

    // Reset hero flags and cool spells
    for (const hero of this.heroes) {
      hero.moved = false; hero.acted = false;
      for (const s of hero.spells) if (s.cd > 0) s.cd--;
      hero.status = (hero.status ?? []).filter(s => { s.dur--; return s.dur > 0; });
    }

    // Reduce enemy status durations
    for (const enemy of this.enemies) {
      enemy.status = (enemy.status ?? []).filter(s => {
        s.dur--;
        if (s.dur <= 0 && s.type === 'slowed') enemy.speed = Math.min(enemy.speed + 1, 3);
        return s.dur > 0;
      });
    }

    // Passive income
    this.resources.money = (this.resources.money ?? 0) + Math.floor(10 * (this.modifiers.income ?? 1));

    // Enemy scaling every 3 battle-rounds
    if (this.battleRound % 3 === 0) {
      for (const e of this.enemies.filter(e => e.hp > 0)) {
        e.atk = Math.floor(e.atk * 1.1);
        e.hp  = Math.min(e.maxHp, e.hp + Math.floor(e.maxHp * 0.05));
      }
      this._log('⚠ Вороги посилились!');
      this.cameras.main.flash(280, 100, 0, 50);
    }

    this._roundTxt?.setText(this._roundLabel());
    this._resTxt?.setText(this._resLabel());
    this._xpTxt?.setText(`XP: ${this.xp} | Lvl: ${this.level}`);
    this._log(`─── Хід ${this.battleRound} ───`);

    // Rebuild spell panel to update cooldown display
    this._rebuildSpellPanel();
    this._drawGrid();
    this._drawAllUnits();
  }

  _rebuildSpellPanel() {
    const { width, height } = this.scale;
    // Destroy old spell panel children by depth range — simplest: restart scene approach
    // Instead, we tag spell objects and recreate
    if (this._spellPanelObjs) {
      for (const o of this._spellPanelObjs) if (o?.active) o.destroy();
    }
    this._spellPanelObjs = [];

    const panelX = OX + COLS * CW + 10;
    const panelW = width - panelX - 10;
    let sy = OY + 30;

    const headerTxt = this.add.text(panelX + panelW / 2, OY + 10, 'ЗДІБНОСТІ', {
      fontFamily: 'Arial Black, Arial', fontSize: '12px', color: '#ff00ff',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 8, fill: true },
    }).setOrigin(0.5, 1).setDepth(21);
    this._spellPanelObjs.push(headerTxt);

    for (const hero of this.heroes) {
      const heroTxt = this.add.text(panelX, sy, `${hero.icon} ${hero.name}`, {
        fontFamily: 'Arial Black, Arial', fontSize: '11px',
        color: '#' + hero.color.toString(16).padStart(6, '0'),
      }).setDepth(21);
      this._spellPanelObjs.push(heroTxt);
      sy += 18;

      for (const spell of hero.spells) {
        const btns = this._drawSpellBtnTracked(panelX, sy, panelW, spell, hero);
        this._spellPanelObjs.push(...btns);
        sy += 42;
      }
      sy += 6;
    }
  }

  _drawSpellBtnTracked(x, y, w, spell, hero) {
    const created = [];
    const onCd   = spell.cd > 0;
    const accent = onCd ? 0x333355 : 0x0088ff;
    const h      = 36;

    const gfx = this.add.graphics().setDepth(21);
    gfx.fillStyle(onCd ? 0x111111 : 0x001133, 0.92);
    gfx.fillRoundedRect(x, y, w, h, 5);
    gfx.lineStyle(1, accent, 0.9);
    gfx.strokeRoundedRect(x, y, w, h, 5);
    created.push(gfx);

    const t1 = this.add.text(x + 4, y + 4, `${spell.icon} ${spell.name}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px',
      color: onCd ? '#444466' : '#00ffff', wordWrap: { width: w - 8 },
    }).setDepth(22);
    created.push(t1);

    const t2 = this.add.text(x + 4, y + 20, onCd ? `⏳ ${spell.cd}` : '● Готово', {
      fontFamily: 'Arial, sans-serif', fontSize: '9px',
      color: onCd ? '#ff4444' : '#44ff88',
    }).setDepth(22);
    created.push(t2);

    if (!onCd) {
      const zone = this.add.zone(x + w / 2, y + h / 2, w, h)
        .setInteractive({ useHandCursor: true }).setDepth(23);
      zone.on('pointerdown', () => this._castSpell(hero, spell));
      zone.on('pointerover', () => this._showTooltip(`${spell.name}: ${spell.desc}`));
      zone.on('pointerout',  () => this._hideTooltip());
      created.push(zone);
    }
    return created;
  }

  // ─── Kill / battle end ────────────────────────────────────────────────────

  _killEnemy(enemy) {
    const xpGained = enemy.xpValue ?? 20;
    this.xp += xpGained;
    this.defeatedEnemies++;
    this._showXP(enemy, xpGained);
    this._log(`💀 ${enemy.name} знищено! +${xpGained} XP`);

    if (this.grid[enemy.row]?.[enemy.col] === enemy) this.grid[enemy.row][enemy.col] = null;
    enemy.hp = 0;

    // Death burst
    const { x, y } = this._cellXY(enemy.col, enemy.row);
    const burst = this.add.text(x, y, '💥', { fontSize: '32px' }).setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: burst, y: y - 44, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 600, onComplete: () => burst.destroy() });

    // Level-up check
    const threshold = this.level * 100;
    if (this.xp >= threshold) {
      this.level++;
      this.xp -= threshold;
      this._showLevelUp();
    }

    this._xpTxt?.setText(`XP: ${this.xp} | Lvl: ${this.level}`);
    this._drawAllUnits();
    this._checkBattleEnd();
  }

  _checkBattleEnd() {
    const heroesAlive  = this.heroes.some(h => h.hp > 0);
    const enemiesAlive = this.enemies.some(e => e.hp > 0);
    if      (!enemiesAlive) this._onVictory();
    else if (!heroesAlive)  this._onDefeat();
  }

  // ─── Victory / defeat ─────────────────────────────────────────────────────

  _onVictory() {
    if (this.battleOver) return;
    this.battleOver = true;

    const { width, height } = this.scale;
    this.cameras.main.flash(500, 0, 180, 100);
    this._showBanner('🏆 ПЕРЕМОГА!', '#ffcc00');

    const moneyReward = Math.floor(50 * (1 + (this.round - 1) * 0.2) * (this.modifiers.income ?? 1));
    const herbReward  = Phaser.Math.Between(1, 3 + this.round);
    const runeReward  = this.round >= 2 ? Phaser.Math.Between(0, 2) : 0;
    this.resources.money  = (this.resources.money  ?? 0) + moneyReward;
    this.resources.herbs  = (this.resources.herbs  ?? 0) + herbReward;
    this.resources.runes  = (this.resources.runes  ?? 0) + runeReward;

    this.time.delayedCall(600, () => {
      this.add.text(width / 2, height * 0.62, `+${moneyReward}💰  +${herbReward}🌿  +${runeReward}ᚠ`, {
        fontFamily: 'Arial Black, Arial', fontSize: '22px', color: '#00ffaa',
        stroke: '#000000', strokeThickness: 5,
      }).setOrigin(0.5).setDepth(50);
    });

    const nextRound      = this.round + 1;
    const showPerks      = (this.round % 3 === 0);

    this.time.delayedCall(3000, () => {
      this.cameras.main.fadeOut(800);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (showPerks) {
          this.scene.start('PerkScene', {
            modifiers:       this.modifiers,
            wave:            this.round,
            resources:       this.resources,
            cordonLevel:     this.cordonLevel,
            xp:              this.xp,
            level:           this.level,
            defeatedEnemies: this.defeatedEnemies,
            nextRound,
            fromTactical:    true,
          });
        } else {
          this.scene.start('ExploreScene', {
            resources:       this.resources,
            cordonLevel:     this.cordonLevel,
            round:           nextRound,
            xp:              this.xp,
            level:           this.level,
            modifiers:       this.modifiers,
            defeatedEnemies: this.defeatedEnemies,
          });
        }
      });
    });
  }

  _onDefeat() {
    if (this.battleOver) return;
    this.battleOver = true;

    const { width, height } = this.scale;
    this.cameras.main.shake(700, 0.02);
    this.cameras.main.flash(500, 200, 0, 0);
    this._showBanner('💀 ПОРАЗКА!', '#ff2222');

    this.add.text(width / 2, height * 0.62, 'Натисни щоб продовжити', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(50);

    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(600);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
  }

  // ─── VFX helpers ──────────────────────────────────────────────────────────

  _showBanner(text, color) {
    const { width, height } = this.scale;
    const t = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Arial Black, Arial', fontSize: '52px', color,
      stroke: '#000000', strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color, blur: 30, fill: true },
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({
      targets: t, alpha: 1, y: height / 2 - 12, duration: 450, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: t, alpha: 0, duration: 400, delay: 1300, onComplete: () => t.destroy() });
      },
    });
  }

  _showDmg(unit, amount, color) {
    const { x, y } = this._cellXY(unit.col, unit.row);
    const hexColor = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(x, y, `-${amount}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', color: hexColor,
      stroke: '#000000', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: hexColor, blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: t, y: y - 52, alpha: 0, duration: 900, ease: 'Power2', onComplete: () => t.destroy() });
  }

  _showXP(unit, amount) {
    const { x, y } = this._cellXY(unit.col, unit.row);
    const t = this.add.text(x, y - 18, `+${amount} XP`, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1300, onComplete: () => t.destroy() });
  }

  _showLevelUp() {
    const { width, height } = this.scale;
    const t = this.add.text(width / 2, height / 2, `⬆ РІВЕНЬ ${this.level}!`, {
      fontFamily: 'Arial Black, Arial', fontSize: '40px', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffcc00', blur: 24, fill: true },
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({
      targets: t, alpha: 1, y: height / 2 - 10, duration: 400, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: t, alpha: 0, duration: 400, delay: 1000, onComplete: () => t.destroy() });
      },
    });
  }

  _showRitualNotice() {
    const { width } = this.scale;
    const msg = this.ritualBuff
      ? `✨ Ефект ритуалу: ${this.ritualBuff}!`
      : `💀 Дебаф на ворогів: ${this.ritualDebuff}`;
    const t = this.add.text(width / 2, 72, msg, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px',
      color: this.ritualBuff ? '#00ffaa' : '#ff8844',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 400 });
    this.time.delayedCall(3000, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() });
    });
  }

  _showInterruptedFlash(width, height) {
    const warn = this.add.text(width / 2, height * 0.85, '⚠ Ритуал перерваний! Герої вразливі!', {
      fontFamily: 'Arial Black, Arial', fontSize: '15px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: warn, alpha: 0.3, duration: 600, yoyo: true, repeat: 4, onComplete: () => warn.destroy() });
  }
}

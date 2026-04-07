/**
 * SpellData.js
 * All spell definitions for ACID KHUTIR — Оборона Ланчина.
 *
 * Magic system inspired by Heroes of Might & Magic 5 (spell schools, mana costs,
 * basic/advanced/expert tiers), fully reinterpreted through Ukrainian folklore.
 *
 * ── Schools ────────────────────────────────────────────────────────────────────
 *  perun      — Перун (Thunder / Combat)    — Serhiy's primary school
 *  bereginya  — Берегиня (Water / Healing)  — Olena's primary school
 *  stribog    — Стрибог (Wind / Chaos)      — Mykhas' primary school
 *  dazhbog    — Дажбог (Light / Holy)       — shared support school
 *  nav        — Навь (Shadow / Debuff)      — shared dark school
 *  zemlia     — Мати-Земля (Earth / Fortify)— city/wall bonus school
 *
 * ── Spell object shape ─────────────────────────────────────────────────────────
 *  id          — unique key
 *  name        — Ukrainian display name
 *  school      — one of the schools above
 *  manaCost    — mana consumed on cast (basic tier)
 *  cooldown    — ms between casts
 *  lore        — short flavour text
 *  icon        — texture key (fallback generated if missing)
 *  iconColor   — neon colour for fallback icon
 *  effect      — function(scene, caster, targets, spellPower) executed on cast
 *  tiers       — ['basic','advanced','expert'] — labels for upgrade levels
 *  tierScaling — multipliers applied per tier for damage/heal/etc
 */

// Helper: spawn a neon AOE blast graphic that fades out quickly
function _neonBlast(scene, x, y, color, radius = 80) {
  const g = scene.add.graphics().setDepth(20);
  g.fillStyle(color, 0.55);
  g.fillCircle(x, y, radius);
  g.lineStyle(3, 0xffffff, 0.9);
  g.strokeCircle(x, y, radius);
  scene.tweens.add({ targets: g, alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 420, onComplete: () => g.destroy() });
}

// Helper: apply damage to all enemies in radius
function _damageRadius(scene, x, y, radius, baseDamage, spellPower, modifiers) {
  const power = baseDamage * (spellPower ?? 1) * (modifiers?.spellPower ?? 1);
  (scene.enemiesGroup?.getChildren() ?? []).forEach(e => {
    if (!e.active) return;
    const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
    if (d <= radius) e.hp -= power;
  });
}

export const SPELLS = {

  // ══════════════════════ ПЕРУН SCHOOL (Thunder / Combat) ══════════════════════

  thunderbolt: {
    id:        'thunderbolt',
    name:      'Громовиця',
    school:    'perun',
    manaCost:  10,
    cooldown:  1200,
    lore:      'Пряма блискавка Перуна — найчистіша зброя проти нечисті. Один удар, одна правда.',
    icon:      'spell_thunderbolt',
    iconColor: 0xffff00,
    tiers:     ['Іскра', 'Блискавка', 'Перунів Удар'],
    tierScaling: [1.0, 1.5, 2.2],

    effect(scene, caster, _targets, spellPower) {
      const enemy = _nearestEnemy(scene, caster, 700);
      if (!enemy) return;
      const dmg = 45 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      enemy.hp -= dmg;
      _neonBlast(scene, enemy.x, enemy.y, 0xffff00, 50);
      _spawnHitParticles(scene, enemy.x, enemy.y, 0xffff00);
    },
  },

  cossack_cry: {
    id:        'cossack_cry',
    name:      'Козацький Клич',
    school:    'perun',
    manaCost:  18,
    cooldown:  8000,
    lore:      'Бойовий клич козацького роду — на 8 секунд урон захисників зростає вдвічі. Предки чують.',
    icon:      'spell_cossack_cry',
    iconColor: 0xff8800,
    tiers:     ['Клич Сотні', 'Клич Полку', 'Клич Запорожжя'],
    tierScaling: [1.0, 1.4, 2.0],

    effect(scene, _caster, _targets, spellPower) {
      const mult = 2.0 * (spellPower ?? 1);
      const prev = scene.modifiers.damage;
      scene.modifiers.damage *= mult;
      _neonBlast(scene, scene.scale.width / 2, scene.scale.height / 2, 0xff8800, 200);
      scene.time.delayedCall(8000, () => { scene.modifiers.damage = prev; });
    },
  },

  perun_wrath: {
    id:        'perun_wrath',
    name:      'Перунів Гнів',
    school:    'perun',
    manaCost:  30,
    cooldown:  12000,
    lore:      'Ланцюгова блискавка б\'є по чотирьох цілях одночасно. Перун не вибирає — він судить усіх.',
    icon:      'spell_perun_wrath',
    iconColor: 0x00ffff,
    tiers:     ['Подвійний Удар', 'Четверний Удар', 'Гроза'],
    tierScaling: [1.0, 1.6, 2.5],

    effect(scene, caster, _targets, spellPower) {
      const baseDmg = 35 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      const enemies = (scene.enemiesGroup?.getChildren() ?? [])
        .filter(e => e.active)
        .sort((a, b) =>
          Phaser.Math.Distance.Between(caster.x, caster.y, a.x, a.y) -
          Phaser.Math.Distance.Between(caster.x, caster.y, b.x, b.y)
        )
        .slice(0, 4);
      enemies.forEach(e => {
        e.hp -= baseDmg;
        _neonBlast(scene, e.x, e.y, 0x00ffff, 40);
      });
    },
  },

  trident_strike: {
    id:        'trident_strike',
    name:      'Тризубець',
    school:    'perun',
    manaCost:  22,
    cooldown:  5000,
    lore:      'Символ держави стає зброєю: три промені одночасно пронизують трьох ворогів.',
    icon:      'spell_trident',
    iconColor: 0x0044ff,
    tiers:     ['Двійний', 'Трійний', 'Золотий Тризубець'],
    tierScaling: [1.0, 1.3, 1.8],

    effect(scene, caster, _targets, spellPower) {
      const baseDmg = 30 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      const enemies = (scene.enemiesGroup?.getChildren() ?? [])
        .filter(e => e.active)
        .slice(0, 3);
      enemies.forEach((e, idx) => {
        scene.time.delayedCall(idx * 80, () => {
          if (!e.active) return;
          e.hp -= baseDmg;
          _neonBlast(scene, e.x, e.y, 0x0044ff, 35);
        });
      });
    },
  },

  lightning_path: {
    id:        'lightning_path',
    name:      'Блискавичний Шлях',
    school:    'perun',
    manaCost:  15,
    cooldown:  4000,
    lore:      'Герой рухається зі швидкістю блискавки — 4 секунди подвоєна швидкість і кожен ворог на шляху отримує удар.',
    icon:      'spell_lightning_path',
    iconColor: 0xffff44,
    tiers:     ['Іскра', 'Блискавка', 'Гром і Блискавка'],
    tierScaling: [1.0, 1.5, 2.0],

    effect(scene, caster, _targets, spellPower) {
      caster.speed *= 2.2;
      const origFireRate = caster.fireRate;
      caster.fireRate = Math.max(50, caster.fireRate * 0.4);
      scene.time.delayedCall(4000, () => {
        caster.speed /= 2.2;
        caster.fireRate = origFireRate;
      });
    },
  },

  tempest: {
    id:        'tempest',
    name:      'Буревій',
    school:    'perun',
    manaCost:  50,
    cooldown:  20000,
    lore:      'Ультимативне заклинання Перуна. Буревій зачищає весь екран від нечисті. Боги пам\'ятають.',
    icon:      'spell_tempest',
    iconColor: 0xffffff,
    tiers:     ['Шторм', 'Буря', 'Кінець Темряви'],
    tierScaling: [1.0, 1.8, 3.0],

    effect(scene, _caster, _targets, spellPower) {
      const dmg = 80 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      _damageRadius(scene, scene.scale.width / 2, scene.scale.height / 2, 900, dmg, 1, null);
      _neonBlast(scene, scene.scale.width / 2, scene.scale.height / 2, 0xffffff, 400);
      scene.cameras.main.shake(600, 0.025);
    },
  },

  // ══════════════════════ БЕРЕГИНЯ SCHOOL (Water / Healing) ════════════════════

  healing_dew: {
    id:        'healing_dew',
    name:      'Цілюща Роса',
    school:    'bereginya',
    manaCost:  12,
    cooldown:  3000,
    lore:      'Крапля роси з листа папороті відновлює 25 HP. Берегиня дбає про тих, хто захищає.',
    icon:      'spell_healing_dew',
    iconColor: 0x00ff88,
    tiers:     ['Крапля', 'Струмок', 'Річка Цілющих Вод'],
    tierScaling: [1.0, 1.5, 2.2],

    effect(scene, caster, _targets, spellPower) {
      const heal = 25 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      caster.hp = Math.min(caster.maxHp, caster.hp + heal);
      _neonBlast(scene, caster.x, caster.y, 0x00ff88, 60);
    },
  },

  living_water: {
    id:        'living_water',
    name:      'Жива Вода',
    school:    'bereginya',
    manaCost:  40,
    cooldown:  15000,
    lore:      'З казки — в реальність: повне відновлення HP. Жива Вода повертає навіть тих, кого вважали загубленими.',
    icon:      'spell_living_water',
    iconColor: 0x0088ff,
    tiers:     ['Жива Вода', 'Вода Безсмертя', 'Купальське Джерело'],
    tierScaling: [1.0, 1.0, 1.0],

    effect(scene, caster, _targets, _spellPower) {
      caster.hp = caster.maxHp;
      // Also partially restore house HP
      if (scene.houseHP !== undefined) {
        scene.houseHP = Math.min(scene.houseMaxHP, scene.houseHP + scene.houseMaxHP * 0.15);
      }
      _neonBlast(scene, caster.x, caster.y, 0x0088ff, 100);
      scene.cameras.main.flash(400, 0, 136, 255);
    },
  },

  cornflower_shield: {
    id:        'cornflower_shield',
    name:      'Волошковий Захист',
    school:    'bereginya',
    manaCost:  20,
    cooldown:  10000,
    lore:      'Синьо-жовтий щит з волошок та сонях укриває хранителя від шкоди на 6 секунд.',
    icon:      'spell_cornflower_shield',
    iconColor: 0x4488ff,
    tiers:     ['Вінок', 'Щит', 'Нездоланний Бар\'єр'],
    tierScaling: [1.0, 1.5, 2.0],

    effect(scene, caster, _targets, spellPower) {
      const duration = 6000 * (spellPower ?? 1);
      caster.shieldUntil = scene.time.now + duration;
      _neonBlast(scene, caster.x, caster.y, 0x4488ff, 70);
    },
  },

  mermaid_touch: {
    id:        'mermaid_touch',
    name:      'Мавчин Дотик',
    school:    'bereginya',
    manaCost:  16,
    cooldown:  6000,
    lore:      'Мавки — лісові духи — уповільнюють ворогів. Кожен крок дається важче, коли ліс не пускає.',
    icon:      'spell_mermaid_touch',
    iconColor: 0x00ffcc,
    tiers:     ['Шепіт Мавки', 'Пута Ліщини', 'Глибокий Сон'],
    tierScaling: [1.0, 1.4, 2.0],

    effect(scene, _caster, _targets, spellPower) {
      const slowFactor = 0.4 / (spellPower ?? 1);
      const duration   = 5000;
      (scene.enemiesGroup?.getChildren() ?? []).forEach(e => {
        if (!e.active) return;
        const origVel = e.body?.velocity ? { x: e.body.velocity.x, y: e.body.velocity.y } : null;
        if (origVel) {
          e.body.setVelocity(origVel.x * slowFactor, origVel.y * slowFactor);
          scene.time.delayedCall(duration, () => {
            if (e.active && e.body) e.body.setVelocity(origVel.x, origVel.y);
          });
        }
        _neonBlast(scene, e.x, e.y, 0x00ffcc, 30);
      });
    },
  },

  bereginya_blessing: {
    id:        'bereginya_blessing',
    name:      'Благословення Берегині',
    school:    'bereginya',
    manaCost:  35,
    cooldown:  18000,
    lore:      'Сама Берегиня спускається на мить — HP захисника зростає на 50% на 10 секунд. Для неї немає різниці між живим і мертвим.',
    icon:      'spell_bereginya',
    iconColor: 0xff88cc,
    tiers:     ['Дотик', 'Обійми', 'Благодать Берегині'],
    tierScaling: [1.0, 1.3, 1.6],

    effect(scene, caster, _targets, spellPower) {
      const bonus = Math.floor(caster.maxHp * 0.5 * (spellPower ?? 1));
      caster.maxHp += bonus;
      caster.hp = Math.min(caster.maxHp, caster.hp + bonus);
      scene.time.delayedCall(10000, () => {
        caster.maxHp -= bonus;
        caster.hp = Math.min(caster.maxHp, caster.hp);
      });
      _neonBlast(scene, caster.x, caster.y, 0xff88cc, 90);
    },
  },

  // ══════════════════════ СТРИБОГ SCHOOL (Wind / Chaos) ════════════════════════

  wind_dash: {
    id:        'wind_dash',
    name:      'Вітровий Прорив',
    school:    'stribog',
    manaCost:  8,
    cooldown:  3500,
    lore:      'Стрибог дає крила: герой телепортується в точку прицілу. Вітер не запитує дозволу.',
    icon:      'spell_wind_dash',
    iconColor: 0xaaffff,
    tiers:     ['Подих Вітру', 'Вихор', 'Стрибогів Стрибок'],
    tierScaling: [1.0, 1.5, 2.0],

    effect(scene, caster, _targets, _spellPower) {
      // Dash: move caster away from nearest enemy
      const enemy = _nearestEnemy(scene, caster, 600);
      if (enemy) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, caster.x, caster.y);
        const dist  = 160;
        const nx = Phaser.Math.Clamp(caster.x + Math.cos(angle) * dist, 50, scene.scale.width  - 50);
        const ny = Phaser.Math.Clamp(caster.y + Math.sin(angle) * dist, 50, scene.scale.height - 50);
        caster.setPosition(nx, ny);
      }
      _neonBlast(scene, caster.x, caster.y, 0xaaffff, 55);
    },
  },

  firebird: {
    id:        'firebird',
    name:      'Жар-Птиця',
    school:    'stribog',
    manaCost:  22,
    cooldown:  5000,
    lore:      'Птах-жар — живий вогонь на крилах вітру. Самонавідний снаряд, що б\'є по найсильнішому ворогу.',
    icon:      'spell_firebird',
    iconColor: 0xff6600,
    tiers:     ['Іскра Жар-Птиці', 'Пір\'я Жар-Птиці', 'Повний Птах'],
    tierScaling: [1.0, 1.6, 2.4],

    effect(scene, caster, _targets, spellPower) {
      // Target highest HP enemy
      const enemy = (scene.enemiesGroup?.getChildren() ?? [])
        .filter(e => e.active)
        .sort((a, b) => b.hp - a.hp)[0];
      if (!enemy) return;

      const dmg = 60 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      const proj = scene.projectilesGroup?.create(caster.x, caster.y, 'particle_neon_orange');
      if (proj) {
        proj.setDisplaySize(20, 14).setDepth(8).setTint(0xff6600);
        const angle = Phaser.Math.Angle.Between(caster.x, caster.y, enemy.x, enemy.y);
        proj.body.setVelocity(Math.cos(angle) * 380, Math.sin(angle) * 380);
        proj._firebird = true;
        proj._fbDmg    = dmg;
      }
    },
  },

  cloud_double: {
    id:        'cloud_double',
    name:      'Хмарний Двійник',
    school:    'stribog',
    manaCost:  25,
    cooldown:  12000,
    lore:      'Стрибог огортає хранителя хмарою — вороги 5 секунд атакують примарного двійника.',
    icon:      'spell_cloud_double',
    iconColor: 0x88aaff,
    tiers:     ['Тінь', 'Двійник', 'Хмарна Армія'],
    tierScaling: [1.0, 1.4, 2.0],

    effect(scene, caster, _targets, spellPower) {
      const duration = 5000 * (spellPower ?? 1);
      caster.shieldUntil = Math.max(caster.shieldUntil, scene.time.now + duration);
      // Decoy visual
      const decoy = scene.add.image(caster.x + 80, caster.y, 'sergiy')
        .setDisplaySize(48, 72).setAlpha(0.55).setTint(0x8888ff).setDepth(5);
      scene.tweens.add({ targets: decoy, x: decoy.x + 40, alpha: 0, duration: duration, onComplete: () => decoy.destroy() });
    },
  },

  mara_illusion: {
    id:        'mara_illusion',
    name:      'Мара',
    school:    'stribog',
    manaCost:  30,
    cooldown:  14000,
    lore:      'Мара — богиня ілюзій — плутає ворогів: вони б\'ють одне одного 4 секунди.',
    icon:      'spell_mara',
    iconColor: 0x9900ff,
    tiers:     ['Марево', 'Мара', 'Великий Обман'],
    tierScaling: [1.0, 1.3, 1.8],

    effect(scene, _caster, _targets, spellPower) {
      const duration = 4000 * (spellPower ?? 1);
      const enemies = (scene.enemiesGroup?.getChildren() ?? []).filter(e => e.active);
      // Slow and confuse: stop enemies, then deal self damage
      enemies.forEach(e => {
        if (!e.body) return;
        const origVelX = e.body.velocity.x;
        const origVelY = e.body.velocity.y;
        e.body.setVelocity(origVelX * 0.1, origVelY * 0.1);
        e.hp -= 15 * (spellPower ?? 1);
        scene.time.delayedCall(duration, () => {
          if (e.active && e.body) e.body.setVelocity(origVelX, origVelY);
        });
        _neonBlast(scene, e.x, e.y, 0x9900ff, 25);
      });
    },
  },

  stribog_whirlwind: {
    id:        'stribog_whirlwind',
    name:      'Стрибогів Вихор',
    school:    'stribog',
    manaCost:  38,
    cooldown:  16000,
    lore:      'Великий вихор Стрибога відкидає і ранить усіх ворогів у великому радіусі.',
    icon:      'spell_whirlwind',
    iconColor: 0x00eeff,
    tiers:     ['Подих', 'Шквал', 'Вихор Стрибога'],
    tierScaling: [1.0, 1.7, 2.6],

    effect(scene, caster, _targets, spellPower) {
      const dmg = 50 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      _damageRadius(scene, caster.x, caster.y, 280, dmg, 1, null);
      _neonBlast(scene, caster.x, caster.y, 0x00eeff, 280);
      // Knockback enemies
      (scene.enemiesGroup?.getChildren() ?? []).forEach(e => {
        if (!e.active || !e.body) return;
        const angle = Phaser.Math.Angle.Between(caster.x, caster.y, e.x, e.y);
        const d = Phaser.Math.Distance.Between(caster.x, caster.y, e.x, e.y);
        if (d < 280) {
          e.body.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
          scene.time.delayedCall(400, () => {
            if (e.active && e.body) e.body.setVelocity(e.body.velocity.x * 0.1, e.body.velocity.y * 0.1);
          });
        }
      });
      scene.cameras.main.shake(400, 0.015);
    },
  },

  azure_lightning: {
    id:        'azure_lightning',
    name:      'Блакитна Блискавка',
    school:    'stribog',
    manaCost:  45,
    cooldown:  18000,
    lore:      'Стрибог і Перун з\'єднуються: найпотужніший одиночний удар. Блакитний вогонь спалює алгоритм вірусу.',
    icon:      'spell_azure_lightning',
    iconColor: 0x44aaff,
    tiers:     ['Синя Іскра', 'Небесний Промінь', 'Блакитна Блискавка'],
    tierScaling: [1.0, 2.0, 3.5],

    effect(scene, caster, _targets, spellPower) {
      const enemy = _nearestEnemy(scene, caster, 1200);
      if (!enemy) return;
      const dmg = 120 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      enemy.hp -= dmg;
      _neonBlast(scene, enemy.x, enemy.y, 0x44aaff, 90);
      _spawnHitParticles(scene, enemy.x, enemy.y, 0x44aaff);
      scene.cameras.main.flash(300, 68, 170, 255);
    },
  },

  // ══════════════════════ ДАЖБОГ SCHOOL (Light / Holy) — shared spells ═════════

  dazhbog_ray: {
    id:        'dazhbog_ray',
    name:      'Промінь Дажбога',
    school:    'dazhbog',
    manaCost:  28,
    cooldown:  8000,
    lore:      'Сонячне промінь Дажбога очищає декількох ворогів від вірусного коду.',
    icon:      'spell_dazhbog',
    iconColor: 0xffdd00,
    tiers:     ['Сонячна Іскра', 'Промінь', 'Сяйво Дажбога'],
    tierScaling: [1.0, 1.5, 2.3],

    effect(scene, caster, _targets, spellPower) {
      const dmg = 40 * (spellPower ?? 1) * (scene.modifiers?.spellPower ?? 1);
      _damageRadius(scene, caster.x, caster.y, 320, dmg, 1, null);
      _neonBlast(scene, caster.x, caster.y, 0xffdd00, 200);
      scene.cameras.main.flash(200, 255, 221, 0);
    },
  },

  // ══════════════════════ НАВЬ SCHOOL (Shadow / Debuff) — shared ═══════════════

  nav_curse: {
    id:        'nav_curse',
    name:      'Прокляття Наві',
    school:    'nav',
    manaCost:  20,
    cooldown:  10000,
    lore:      'Навь — світ мертвих. Прокляття зупиняє ворогів і знижує їх атаку вдвічі на 5 секунд.',
    icon:      'spell_nav_curse',
    iconColor: 0x550088,
    tiers:     ['Тінь', 'Прокляття', 'Навь'],
    tierScaling: [1.0, 1.4, 2.0],

    effect(scene, _caster, _targets, spellPower) {
      const duration = 5000 * (spellPower ?? 1);
      (scene.enemiesGroup?.getChildren() ?? []).forEach(e => {
        if (!e.active || !e.body) return;
        const origVelX = e.body.velocity.x;
        const origVelY = e.body.velocity.y;
        e.body.setVelocity(origVelX * 0.3, origVelY * 0.3);
        scene.time.delayedCall(duration, () => {
          if (e.active && e.body) e.body.setVelocity(origVelX, origVelY);
        });
        _neonBlast(scene, e.x, e.y, 0x550088, 30);
      });
    },
  },

  // ══════════════════════ МАТИ-ЗЕМЛЯ SCHOOL (Earth / Fortify) ══════════════════

  earth_wall: {
    id:        'earth_wall',
    name:      'Земляний Вал',
    school:    'zemlia',
    manaCost:  25,
    cooldown:  12000,
    lore:      'Мати-Земля підіймає захисний вал: хутір отримує +20% захисту на 10 секунд.',
    icon:      'spell_earth_wall',
    iconColor: 0x886600,
    tiers:     ['Горбик', 'Вал', 'Вічний Мур'],
    tierScaling: [1.0, 1.4, 2.0],

    effect(scene, _caster, _targets, spellPower) {
      const mult = 1.2 * (spellPower ?? 1);
      scene.modifiers.wallDefense = (scene.modifiers.wallDefense ?? 1) * mult;
      scene.time.delayedCall(10000, () => {
        scene.modifiers.wallDefense /= mult;
      });
      _neonBlast(scene, 150, scene.scale.height / 2, 0x886600, 80);
    },
  },
};

// ── Helpers (module-private) ──────────────────────────────────────────────────

function _nearestEnemy(scene, from, maxDist) {
  let best = null, bestD = maxDist + 1;
  (scene.enemiesGroup?.getChildren() ?? []).forEach(e => {
    if (!e.active) return;
    const d = Phaser.Math.Distance.Between(from.x, from.y, e.x, e.y);
    if (d < bestD) { bestD = d; best = e; }
  });
  return best;
}

function _spawnHitParticles(scene, x, y, color) {
  if (!scene.add?.particles) return;
  const em = scene.add.particles(x, y, 'particle_neon_pink', {
    speed:    { min: 40, max: 200 },
    scale:    { start: 1.2, end: 0 },
    alpha:    { start: 1, end: 0 },
    lifespan: { min: 250, max: 550 },
    tint:     [color, 0xffffff],
    emitting: false,
  }).setDepth(16);
  em.explode(18, x, y);
  scene.time.delayedCall(700, () => { if (em.active) em.destroy(); });
}

// ── School metadata ───────────────────────────────────────────────────────────

export const SPELL_SCHOOLS = {
  perun:    { name: 'Перун',      color: '#ffff00', description: 'Грім, бій, удар. Школа Сергія.' },
  bereginya:{ name: 'Берегиня',   color: '#00ff88', description: 'Вода, зцілення, захист. Школа Олени.' },
  stribog:  { name: 'Стрибог',    color: '#00eeff', description: 'Вітер, хаос, швидкість. Школа Михася.' },
  dazhbog:  { name: 'Дажбог',     color: '#ffdd00', description: 'Світло, святий вогонь. Спільна школа.' },
  nav:      { name: 'Навь',       color: '#9900ff', description: 'Тінь, прокляття. Спільна школа.' },
  zemlia:   { name: 'Мати-Земля', color: '#886600', description: 'Земля, фортеця. Спільна школа.' },
};

// ── Spells available per school ───────────────────────────────────────────────

export const SCHOOL_SPELLS = {
  perun:     ['thunderbolt', 'cossack_cry', 'perun_wrath', 'trident_strike', 'lightning_path', 'tempest'],
  bereginya: ['healing_dew', 'living_water', 'cornflower_shield', 'mermaid_touch', 'bereginya_blessing'],
  stribog:   ['wind_dash', 'firebird', 'cloud_double', 'mara_illusion', 'stribog_whirlwind', 'azure_lightning'],
  dazhbog:   ['dazhbog_ray'],
  nav:       ['nav_curse'],
  zemlia:    ['earth_wall'],
};

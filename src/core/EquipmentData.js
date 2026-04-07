/**
 * EquipmentData.js
 * Clothing and artifact definitions — Оборона Ланчина.
 *
 * Every piece of equipment is rooted in Ukrainian folk tradition.
 * Equipment gives gameplay bonuses AND lore significance.
 *
 * ── Slots ──────────────────────────────────────────────────────────────────────
 *  shirt   — Вишиванка / сорочка (embroidered shirt)
 *  charm   — Оберіг (protective charm / amulet)
 *  jewelry — Намиста / намисто (necklace / beads)
 *  head    — Хустка / шапка (headscarf / hat)
 *  belt    — Пояс / крайка (belt / sash)
 *  boots   — Чоботи (boots)
 *  wrap    — Рушник-обгортка (ritual towel wrap)
 *  amulet  — Спеціальний амулет (special power amulet)
 *
 * ── Bonus keys ─────────────────────────────────────────────────────────────────
 *  hpMult        — multiplier on maxHp
 *  virusResist   — reduces contact damage from enemies (0–1 scale)
 *  spellPower    — multiplier on all spell effects
 *  fireRateMult  — multiplier on fireRate (< 1 = faster)
 *  speedMult     — multiplier on speed
 *  damageMult    — multiplier on projectile damage
 *  incomeBonus   — flat addition to passive income multiplier
 *  manaMult      — multiplier on mana pool and regen
 *  unlockSpell   — id of a spell unlocked by wearing this item
 *  schoolBonus   — { school, mult } amplifies spells of a specific school
 */

export const EQUIPMENT = {

  // ── Shirts (Вишиванки) ──────────────────────────────────────────────────────

  vyshyvanka_battle: {
    id:    'vyshyvanka_battle',
    slot:  'shirt',
    name:  'Бойова Вишиванка',
    lore:  'Вишита руками матері перед походом. Кожен хрестик — молитва. Кожна нитка — бар\'єр проти вірусу.',
    icon:  'item_iron_seal',
    bonuses: {
      hpMult:      1.30,   // +30% max HP
      virusResist: 0.20,   // -20% contact damage
    },
    glowColor: 0xff4400,
    heroAffinity: 'serhiy',
  },

  vyshyvanka_healer: {
    id:    'vyshyvanka_healer',
    slot:  'shirt',
    name:  'Лікарська Вишиванка',
    lore:  'Вишита ромашками та васильками. Носить у собі пам\'ять про кожну зціленую рану.',
    icon:  'item_radioactive_beet',
    bonuses: {
      hpMult:   1.20,
      manaMult: 1.25,
      schoolBonus: { school: 'bereginya', mult: 1.20 },
    },
    glowColor: 0x00ff88,
    heroAffinity: 'olena',
  },

  vyshyvanka_wind: {
    id:    'vyshyvanka_wind',
    slot:  'shirt',
    name:  'Вітрова Вишиванка',
    lore:  'Легка як вітер. Вишита хвилями і птахами — дає відчуття, що носій сам є вітром.',
    icon:  'item_golden_coupon',
    bonuses: {
      speedMult:   1.15,
      fireRateMult: 0.90,  // -10% fire rate delay (faster shooting)
      schoolBonus: { school: 'stribog', mult: 1.15 },
    },
    glowColor: 0x00eeff,
    heroAffinity: 'mykhas',
  },

  // ── Charms (Обереги) ───────────────────────────────────────────────────────

  oberig_standard: {
    id:    'oberig_standard',
    slot:  'charm',
    name:  'Оберіг',
    lore:  'Стандартний захисний знак, що передається з покоління в покоління. Носити на шиї, думати про предків.',
    icon:  'item_iron_seal',
    bonuses: {
      virusResist: 0.25,
    },
    glowColor: 0xff8800,
  },

  oberig_pysanka: {
    id:    'oberig_pysanka',
    slot:  'charm',
    name:  'Писанка-Оберіг',
    lore:  'Писанка — це закодований всесвіт. Кожен візерунок несе захисний код проти меметичного вірусу.',
    icon:  'symbol_pysanka_glow',
    bonuses: {
      virusResist:  0.40,
      spellPower:   1.10,
    },
    glowColor: 0xff6600,
  },

  oberig_rushnyk: {
    id:    'oberig_rushnyk',
    slot:  'charm',
    name:  'Рушниковий Оберіг',
    lore:  'Вузол з рушника — давній знак захисту. Зав\'язаний на перехресті трьох доріг.',
    icon:  'symbol_rushnyk_cross',
    bonuses: {
      virusResist:  0.35,
      hpMult:       1.10,
    },
    glowColor: 0xffcc00,
  },

  // ── Jewelry (Намиста) ──────────────────────────────────────────────────────

  bereginya_beads: {
    id:    'bereginya_beads',
    slot:  'jewelry',
    name:  'Намисто Берегині',
    lore:  'Коралеві намистини — кров землі. Кожна намистина — це ім\'я тих, кого захищаємо.',
    icon:  'item_tryzub_fragment',
    bonuses: {
      spellPower: 1.20,
      manaMult:   1.15,
      schoolBonus: { school: 'bereginya', mult: 1.25 },
    },
    glowColor: 0x00ff88,
    heroAffinity: 'olena',
  },

  perun_amber: {
    id:    'perun_amber',
    slot:  'jewelry',
    name:  'Бурштин Перуна',
    lore:  'Бурштин — скам\'яніле сонце. Носять ковалі і воїни — дає силу удару.',
    icon:  'item_golden_coupon',
    bonuses: {
      spellPower:  1.15,
      damageMult:  1.20,
      schoolBonus: { school: 'perun', mult: 1.30 },
    },
    glowColor: 0xffbb00,
    heroAffinity: 'serhiy',
  },

  stribog_feather: {
    id:    'stribog_feather',
    slot:  'jewelry',
    name:  'Пір\'їна Стрибога',
    lore:  'Перо вітрового птаха. Хто носить — ходить на пів-кроку між землею і повітрям.',
    icon:  'item_radioactive_beet',
    bonuses: {
      speedMult:   1.20,
      spellPower:  1.10,
      schoolBonus: { school: 'stribog', mult: 1.20 },
    },
    glowColor: 0x00eeff,
    heroAffinity: 'mykhas',
  },

  // ── Headscarves (Хустки) ───────────────────────────────────────────────────

  khustka_standard: {
    id:    'khustka_standard',
    slot:  'head',
    name:  'Хустка',
    lore:  'Чиста біла хустка — знак відповідальності. Хто несе хустку — той іде в бій чистим серцем.',
    icon:  'item_golden_coupon',
    bonuses: {
      fireRateMult: 0.85,  // +15% attack speed
    },
    glowColor: 0xffffff,
  },

  vinok: {
    id:    'vinok',
    slot:  'head',
    name:  'Вінок',
    lore:  'Вінок з живих квітів. Живе квіття дає зв\'язок з землею і підсилює магію природи.',
    icon:  'symbol_vyshyvanka_knot',
    bonuses: {
      fireRateMult: 0.88,
      spellPower:   1.12,
      schoolBonus: { school: 'bereginya', mult: 1.10 },
    },
    glowColor: 0x88ff44,
  },

  // ── Belts (Пояси) ──────────────────────────────────────────────────────────

  stribog_belt: {
    id:    'stribog_belt',
    slot:  'belt',
    name:  'Пояс Стрибога',
    lore:  'Тканий пояс з візерунком вітрових хвиль. Той, хто носить — ніколи не стомлюється в русі.',
    icon:  'symbol_rushnyk_cross',
    bonuses: {
      speedMult:    1.10,
      fireRateMult: 0.92,
    },
    glowColor: 0x00eeff,
    heroAffinity: 'mykhas',
  },

  kraika: {
    id:    'kraika',
    slot:  'belt',
    name:  'Крайка',
    lore:  'Вузька декоративна стрічка — пасок. У давнину зберігала силу воїна в поході.',
    icon:  'item_iron_seal',
    bonuses: {
      speedMult:  1.08,
      hpMult:     1.05,
    },
    glowColor: 0xff8800,
  },

  // ── Boots (Чоботи) ─────────────────────────────────────────────────────────

  choboty_kozak: {
    id:    'choboty_kozak',
    slot:  'boots',
    name:  'Козацькі Чоботи',
    lore:  'Жовті козацькі чоботи — символ свободи та шляху. Хто носить — не втомлюється в дорозі.',
    icon:  'item_golden_coupon',
    bonuses: {
      speedMult: 1.25,
    },
    glowColor: 0xffcc00,
  },

  choboty_earth: {
    id:    'choboty_earth',
    slot:  'boots',
    name:  'Земляні Чоботи',
    lore:  'Взуття, зроблене зі шкіри, що пам\'ятає кожну дорогу. Дають зв\'язок з Матір\'ю-Землею.',
    icon:  'symbol_rushnyk_cross',
    bonuses: {
      speedMult:   1.15,
      virusResist: 0.10,
      schoolBonus: { school: 'zemlia', mult: 1.20 },
    },
    glowColor: 0x886600,
  },

  // ── Rushnyk Wraps ──────────────────────────────────────────────────────────

  rushnyk_warrior: {
    id:    'rushnyk_warrior',
    slot:  'wrap',
    name:  'Рушник Воїна',
    lore:  'Бойовий рушник — не просто тканина. Кожен мотив вишивки — закляття захисту і сили.',
    icon:  'symbol_rushnyk_cross',
    bonuses: {
      damageMult:   1.20,
      virusResist:  0.15,
    },
    glowColor: 0xff4444,
  },

  rushnyk_healer: {
    id:    'rushnyk_healer',
    slot:  'wrap',
    name:  'Цілющий Рушник',
    lore:  'Вишитий з любов\'ю рушник — несе в собі силу всіх матерів, що зцілювали рани своїх дітей.',
    icon:  'symbol_vyshyvanka_knot',
    bonuses: {
      spellPower:   1.25,
      schoolBonus: { school: 'bereginya', mult: 1.30 },
    },
    glowColor: 0x00ff88,
  },

  // ── Special Amulets (Спеціальні Амулети) ──────────────────────────────────

  golden_tryzub: {
    id:    'golden_tryzub',
    slot:  'amulet',
    name:  'Золотий Тризубець',
    lore:  'Прадавній символ держави і сили. Хто несе тризубець — несе відповідальність за всіх.',
    icon:  'item_tryzub_fragment',
    bonuses: {
      hpMult:      1.15,
      spellPower:  1.30,
      damageMult:  1.15,
      unlockSpell: 'trident_strike',
    },
    glowColor: 0xffd700,
  },

  pysanka_amulet: {
    id:    'pysanka_amulet',
    slot:  'amulet',
    name:  'Амулет Писанки',
    lore:  'Писанка — це жива карта всесвіту. Вона підсилює всі заклинання, бо несе в собі весь Код Буття.',
    icon:  'symbol_pysanka_glow',
    bonuses: {
      spellPower:   1.40,
      virusResist:  0.30,
    },
    glowColor: 0xff8800,
  },

  sunflower_crown: {
    id:    'sunflower_crown',
    slot:  'amulet',
    name:  'Корона Соняшника',
    lore:  'Соняшник завжди дивиться на сонце — Дажбога. Корона несе його захист і дарує союзникам надію.',
    icon:  'item_radioactive_beet',
    bonuses: {
      hpMult:      1.20,
      incomeBonus: 0.5,
      spellPower:  1.15,
      schoolBonus: { school: 'dazhbog', mult: 1.50 },
      unlockSpell: 'dazhbog_ray',
    },
    glowColor: 0xffee00,
  },
};

// ── Default loadout per hero ───────────────────────────────────────────────────

export const DEFAULT_LOADOUT = {
  serhiy: {
    shirt:   'vyshyvanka_battle',
    charm:   'oberig_standard',
    jewelry: 'perun_amber',
    belt:    'kraika',
    boots:   'choboty_kozak',
    wrap:    null,
    head:    null,
    amulet:  null,
  },
  olena: {
    shirt:   'vyshyvanka_healer',
    charm:   'oberig_pysanka',
    jewelry: 'bereginya_beads',
    belt:    null,
    boots:   null,
    wrap:    'rushnyk_healer',
    head:    'vinok',
    amulet:  null,
  },
  mykhas: {
    shirt:   'vyshyvanka_wind',
    charm:   'oberig_standard',
    jewelry: 'stribog_feather',
    belt:    'stribog_belt',
    boots:   'choboty_kozak',
    wrap:    null,
    head:    'khustka_standard',
    amulet:  null,
  },
};

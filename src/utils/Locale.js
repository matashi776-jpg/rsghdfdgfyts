/**
 * Locale.js
 * Centralized localization — UA (Прикарпатська) + EN (dark comedy).
 * Part 8.5.6 — full string set: UI, system messages, NPC dialogues,
 *              FX texts, upgrade labels, perk names.
 *
 * Usage:
 *   import Locale from '../utils/Locale.js';
 *   Locale.setLang('en');
 *   Locale.t('start');                    // → "START"
 *   Locale.t('wave_complete', 3);         // → "Wave 3 complete!"
 *   Locale.t('house_hp', 1200, 2000);     // → "Hut: 1200 / 2000"
 */

const STRINGS = {
  ua: {
    // ── UI ────────────────────────────────────────────────────────────────────
    start:          'СТАРТ',
    wave:           'ХВИЛЯ',
    hp:             'ЗДОРОВ\'Я',
    perks:          'ПЕРКИ',
    level:          'Рівень',
    neon:           'Неон',
    time:           'Час',
    sec:            'сек',
    loading:        'ЗАВАНТАЖЕННЯ...',

    // ── Boss ──────────────────────────────────────────────────────────────────
    boss_title:     'КІБЕР-БОС: ТОВАРИШ ВАХТЕРША',
    boss_phase2:    'ФАЗА 2: ГЛІЧ-ОВЕРДРАЙВ!',

    // ── System messages ───────────────────────────────────────────────────────
    died:           'Та ти впав, Сергію…',
    hut_burned:     'Хата згоріла, як минулорічний сніг.',
    victory:        'Перемога! Та файно!',

    // ── House / upgrade ───────────────────────────────────────────────────────
    house_t1:       'Затишна Хата',
    house_t2:       'Цегляний Дім',
    house_t3:       'КІБЕР-ФОРТЕЦЯ',
    upgrade_btn:    '⬆ Покращити',
    max_level:      'МАКСИМУМ',
    house_hp:       'Хутір: %d / %d',

    // ── Battle UI ─────────────────────────────────────────────────────────────
    status_line:    'Рівень: %d  |  Неон: ₴%d  |  Час: %d сек',
    wave_label:     'Хвиля: %d',

    // ── Wave / perk screen ────────────────────────────────────────────────────
    wave_complete:  'Хвиля %d завершена!',
    choose_perk:    'ОБЕРИ ЗДІБНІСТЬ:',
    pick:           'ОБРАТИ',

    // ── Perk names ────────────────────────────────────────────────────────────
    perk_coupon:    'Золотий Талон',
    perk_seal:      'Техно-Печатка',
    perk_beet:      'Кислотний Буряк',
    perk_drive:     'Козацький Драйв',

    // ── Perk descriptions ─────────────────────────────────────────────────────
    perk_coupon_desc: '💰 Пасивний прибуток ×2\n(Нео-монети течуть самі!)',
    perk_seal_desc:   '🛡 Хутір отримує на 30% менше шкоди\n(Нано-щит активовано!)',
    perk_beet_desc:   '⚗ Шкода кулі ×1.5\n+ Кислотний сплеск (AOE)',
    perk_drive_desc:  '⚡ Швидкість атаки +30%\n(Сергій в кайфі!)',

    // ── NPC dialogues ─────────────────────────────────────────────────────────
    npc_babtsya:    'Та йди сюди, я тебе вичухаю, як кота на Спаса!',
    npc_mykhas:     'Та я то всьо на коліні скручу!',

    // ── Cutscene captions ─────────────────────────────────────────────────────
    cutscene_intro:       'Ланчин, 2026. Сергій стоїть на горбі над кіберхутором…',
    cutscene_boss_header: '☢ КІБЕР-БОС З\'ЯВЛЯЄТЬСЯ ☢',

    // ── Comic captions ────────────────────────────────────────────────────────
    comic_caption:  'Та що вони всі хочуть від моєї хати?!',

    // ── FX / combat floating texts ────────────────────────────────────────────
    fx_splat:       'ШКВАРУЄМО!',
    fx_boss_hit:    'БОЛЯЧЕ!',
    fx_beet:        'КИСЛОТА!',
    fx_victory:     '🎉 ПЕРЕМОГА!',
    fx_game_over:   'ХУТІР ВПАВ!',
  },

  en: {
    // ── UI ────────────────────────────────────────────────────────────────────
    start:          'START',
    wave:           'WAVE',
    hp:             'HP',
    perks:          'PERKS',
    level:          'Level',
    neon:           'Neon',
    time:           'Time',
    sec:            'sec',
    loading:        'LOADING...',

    // ── Boss ──────────────────────────────────────────────────────────────────
    boss_title:     'CYBER-BOSS: COMRADE VAKHTERSHA',
    boss_phase2:    'PHASE 2: GLITCH OVERDRIVE!',

    // ── System messages ───────────────────────────────────────────────────────
    died:           'You died, Serhiy… again.',
    hut_burned:     'The hut burned down like last year\'s tax records.',
    victory:        'Victory! Miracles do happen.',

    // ── House / upgrade ───────────────────────────────────────────────────────
    house_t1:       'Cozy Hut',
    house_t2:       'Brick House',
    house_t3:       'CYBER-FORTRESS',
    upgrade_btn:    '⬆ Upgrade',
    max_level:      'MAX LEVEL',
    house_hp:       'Hut: %d / %d',

    // ── Battle UI ─────────────────────────────────────────────────────────────
    status_line:    'Level: %d  |  Neon: ₴%d  |  Time: %d sec',
    wave_label:     'Wave: %d',

    // ── Wave / perk screen ────────────────────────────────────────────────────
    wave_complete:  'Wave %d complete!',
    choose_perk:    'CHOOSE A PERK:',
    pick:           'PICK',

    // ── Perk names ────────────────────────────────────────────────────────────
    perk_coupon:    'Golden Coupon',
    perk_seal:      'Techno-Seal',
    perk_beet:      'Acid Beet',
    perk_drive:     'Cossack Drive',

    // ── Perk descriptions ─────────────────────────────────────────────────────
    perk_coupon_desc: '💰 Passive income ×2\n(Neo-coins flow freely!)',
    perk_seal_desc:   '🛡 Hut takes 30% less damage\n(Nano-shield activated!)',
    perk_beet_desc:   '⚗ Bullet damage ×1.5\n+ Acid splash (AOE)',
    perk_drive_desc:  '⚡ Attack speed +30%\n(Serhiy is on fire!)',

    // ── NPC dialogues ─────────────────────────────────────────────────────────
    npc_babtsya:    'Come here, I\'ll fix you up like a cat on a holy day.',
    npc_mykhas:     'I can fix it with duct tape and trauma.',

    // ── Cutscene captions ─────────────────────────────────────────────────────
    cutscene_intro:       'Lanchyn, 2026. Serhiy stands on a hill above the cyber-hut…',
    cutscene_boss_header: '☢ CYBER-BOSS ARRIVES ☢',

    // ── Comic captions ────────────────────────────────────────────────────────
    comic_caption:  'What do all these people want from my hut?!',

    // ── FX / combat floating texts ────────────────────────────────────────────
    fx_splat:       'FRIED!',
    fx_boss_hit:    'OUCH!',
    fx_beet:        'ACID!',
    fx_victory:     '🎉 VICTORY!',
    fx_game_over:   'THE HUT FELL!',
  },
};

let _lang = 'ua';

const Locale = {
  /** Switch language — 'ua' | 'en' */
  setLang(lang) {
    if (STRINGS[lang]) _lang = lang;
  },

  getLang() {
    return _lang;
  },

  /**
   * Get a localized string by key.
   * Supports sequential %d placeholder substitution.
   * @param {string} key
   * @param {...(number|string)} args – values to substitute into %d placeholders
   * @returns {string}
   */
  t(key, ...args) {
    const src = STRINGS[_lang] || STRINGS.ua;
    let str = src[key] ?? STRINGS.ua[key] ?? key;
    for (const v of args) {
      str = str.replace('%d', String(v));
    }
    return str;
  },
};

export default Locale;

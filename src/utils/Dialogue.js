/**
 * Dialogue.js
 * Ukrainian Prykarpattia dialect dialogue lines for Сергій and NPCs.
 */
const Dialogue = {
  SERHIY_SPAWN: [
    'Та шо воно йде сюди?!',
    'Ану, геть від хутора!',
    'Плазмовим ключем тебе, мумія паперова!',
    'Не пройдеш, вірусний бюрократе!',
    'Ланчин не здається!',
  ],

  SERHIY_LOW_HP: [
    'Ой, пробиває вже...',
    'Ще трохи й кіну вишиванку на них...',
    'Тримаємось, тримаємось!',
  ],

  SERHIY_KILL: [
    'Йди до архіву, звідки прийшов!',
    'Так тобі й треба, печатко!',
    'Плазма > бюрократія!',
    'Аяяй, довідки більше не треба!',
  ],

  BOSS_INTRO: [
    'Вахтерша! Mausoleum Protocol 2.1 активовано...',
    'О ні. ОНА прийшла.',
  ],

  NPC_BABTSYA: [
    'Їж борщ, синку, буде сила!',
    'Я тебе залікую, тільки не помри!',
    'Від злого ока — рушник і плазма!',
  ],

  NPC_MYKHAS: [
    'Підкрутив твою гарматку, тепер швидше стріляє!',
    'Дрон готовий до бою!',
    'Технологія + вишиванка = перемога!',
  ],

  random(category) {
    const lines = Dialogue[category];
    if (!lines || lines.length === 0) return '';
    return lines[Math.floor(Math.random() * lines.length)];
  },
};

export default Dialogue;

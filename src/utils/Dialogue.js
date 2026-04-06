/**
 * Dialogue.js
 * Manages character speech bubbles and NPC dialogue lines for ACID KHUTIR.
 * All text is in Ukrainian (Прикарпатська говірка for Serhiy).
 */

export const ENEMY_PHRASES = {
  zombie_clerk:  ['Приходьте завтра!', 'У нас обід!', 'Де довідка?', 'Не по регламенту!'],
  archivarius:   ['Це заархівовано!', 'Форма № 18-Б!', 'Без печатки не можна!'],
  inspector:     ['ПЕРЕВІРКА!', 'Штраф!', 'Порушення протоколу!', 'Де дозвіл?!'],
  boss:          [
    'Mausoleum Protocol 2.1 — ACTIVATED!',
    'ВАШІ ДОКУМЕНТИ ЗАСТАРІЛИ!',
    'ВИ НЕ ПРОЙДЕТЕ ЧЕРЕЗ МОЮ ХАТУ!',
  ],
};

export const PLAYER_PHRASES = [
  'Та йди ти!',
  'Зараз я вам покажу!',
  'Кислота — моя зброя!',
  'Хутір не здамо!',
  'Іди до свого мавзолею!',
];

export const NPC_BABTSYA_PHRASES = [
  'Тримай, синку, це тобі поможе!',
  'Трава свята, сила свята!',
  'Бережи хату — бережи душу.',
];

export const NPC_MYKHAS_PHRASES = [
  'Зараз налагоджу!',
  'Ось тобі апгрейд, брате!',
  'Технологія — наша сила!',
];

// ── Dialogue helper ────────────────────────────────────────────────────────

export default class Dialogue {
  /**
   * Get a random phrase for an enemy tier.
   * @param {string} tier
   * @returns {string}
   */
  static forEnemy(tier) {
    const phrases = ENEMY_PHRASES[tier] || ENEMY_PHRASES.zombie_clerk;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Get a random player combat phrase.
   * @returns {string}
   */
  static forPlayer() {
    return PLAYER_PHRASES[Math.floor(Math.random() * PLAYER_PHRASES.length)];
  }

  /**
   * Show a floating speech bubble attached to a game object.
   * @param {Phaser.Scene}              scene
   * @param {number}                    x
   * @param {number}                    y
   * @param {string}                    text
   * @param {object}                    [style]
   * @param {number}                    [duration=2500]  ms
   * @returns {Phaser.GameObjects.Text}
   */
  static showBubble(scene, x, y, text, style = {}, duration = 2500) {
    const t = scene.add.text(x, y, text, {
      fontSize:        '9px',
      fontFamily:      'Arial',
      color:           '#000000',
      backgroundColor: '#fffbe6',
      padding:         { x: 4, y: 2 },
      ...style,
    }).setOrigin(0.5, 1).setDepth(20);

    scene.time.delayedCall(duration, () => {
      if (t && t.active) t.destroy();
    });

    return t;
  }
}

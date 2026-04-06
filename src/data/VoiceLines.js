/**
 * VoiceLines.js
 * Character voice-line data (UA Прикарпатська dialect + EN dark-comedy).
 * Each entry has { ua, en } strings.
 */
export const VoiceLines = Object.freeze({
  serhiy: [
    {
      ua: 'Та шо ти, я туй всьо пороблю, лиш не пищіть!',
      en: "Relax, I'll fix it. Eventually. Maybe.",
    },
    {
      ua: 'Та стріляй вже, бо тоті клерки лізут як черви з мокрого пня!',
      en: "Shoot already — these clerks crawl out like worms after a rainy funeral.",
    },
    {
      ua: 'Йой, та шо за день…',
      en: "Oh great, another Tuesday.",
    },
  ],

  zombieClerk: [
    {
      ua: 'Печатку… дай… бо я не виджу…',
      en: "Stamp… give… can't see… bureaucracy… consuming…",
    },
    {
      ua: 'Форма… 27-Б…',
      en: "Form… 27-B… submit… or perish…",
    },
  ],

  archivarius: [
    {
      ua: 'Та де твій формуляр, га?',
      en: "Where's your form, sweetheart?",
    },
    {
      ua: 'Архів… живе…',
      en: "The archive… breathes…",
    },
  ],

  inspector: [
    {
      ua: 'Та я тебе зараз так штемплюну…',
      en: "I'm gonna stamp you into a new tax bracket.",
    },
  ],

  miniVakhtersha: [
    {
      ua: 'Документи маєш? Нє? Та йди гет!',
      en: "Got your papers? No? Then scram, sunshine!",
    },
  ],
});

/**
 * Returns a random voice line object for the given character key.
 * @param {keyof VoiceLines} character
 * @returns {{ ua: string, en: string }}
 */
export function randomLine(character) {
  const lines = VoiceLines[character];
  if (!lines || lines.length === 0) return null;
  return lines[Math.floor(Math.random() * lines.length)];
}

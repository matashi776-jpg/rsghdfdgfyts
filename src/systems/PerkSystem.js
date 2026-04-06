/**
 * PerkSystem.js
 * Perks offered to the player between waves.
 */
const PERKS = [
  {
    id: 'plasma_boost',
    name: 'Плазмовий Буст',
    desc: '+30% шкоди',
    apply: (player) => { player.damage = Math.floor(player.damage * 1.3); },
  },
  {
    id: 'acid_shield',
    name: 'Кислотний Щит',
    desc: '+25 HP',
    apply: (player) => { player.maxHP += 25; player.hp += 25; },
  },
  {
    id: 'turbo_fire',
    name: 'Турбо-Вогонь',
    desc: '-20% часу між пострілами',
    apply: (player) => { player.fireRate = Math.max(80, Math.floor(player.fireRate * 0.8)); },
  },
  {
    id: 'neon_regen',
    name: 'Неонова Регенерація',
    desc: 'Відновлення 15 HP/хвилю',
    apply: (player, scene) => {
      scene.events.on('wave-start', () => player.heal(15));
    },
  },
  {
    id: 'ghost_step',
    name: 'Примарний Крок',
    desc: '+20% швидкості руху',
    apply: (player) => { player.speed = Math.floor(player.speed * 1.2); },
  },
];

export default class PerkSystem {
  constructor(player) {
    this.player = player;
    this.active = [];
  }

  getOffering(count = 3) {
    const shuffled = [...PERKS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  applyPerk(perkId, scene) {
    const perk = PERKS.find(p => p.id === perkId);
    if (!perk) return;
    perk.apply(this.player, scene);
    this.active.push(perkId);
  }

  hasPerk(perkId) {
    return this.active.includes(perkId);
  }
}

/**
 * AmuletSystem.js
 * Ukrainian folklore amulet pickup system for ACID KHUTIR — Stage 1
 *
 * Amulets are scattered across Lanchin. Serhiy walks over them to collect.
 * Each amulet shows a brief card with its name, description, and bonus.
 * Vyshyvanka embroideries boost Serhiy's resistance (damage reduction).
 */

/** All available amulets — rooted in Ukrainian folklore */
export const AMULETS = [
  {
    id:      'veselka',
    name:    'Веселка',
    desc:    'Веселковий оберег Ланчина. Сім кольорів неба захищають воїна.',
    bonus:   '+20% шанс ритуального пострілу',
    texture: 'amulet_veselka',
    color:   0xff88ff,
    apply:   (player) => {
      player.ritualChance = Math.min(0.9, player.ritualChance + 0.20);
    },
  },
  {
    id:      'zemnyi_oberih',
    name:    'Земний оберіг',
    desc:    'Магія рідної землі захищає серце воїна Ланчина.',
    bonus:   '+25 макс. HP',
    texture: 'amulet_zemnyi',
    color:   0x88ff44,
    apply:   (player) => {
      player.maxHp += 25;
      player.hp = Math.min(player.hp + 25, player.maxHp);
    },
  },
  {
    id:      'soniachne_kolo',
    name:    'Сонячне коло',
    desc:    'Стародавній символ сонця додає силу кожному удару.',
    bonus:   '+15% урон',
    texture: 'amulet_soniachne',
    color:   0xffcc00,
    apply:   (player) => {
      if (player.scene.projectileSystem) {
        player.scene.projectileSystem.damage *= 1.15;
      }
    },
  },
  {
    id:      'misiachnyi_kamin',
    name:    'Місячний камінь',
    desc:    'Камінь повного місяця пришвидшує руки стрільця.',
    bonus:   '+20% швидкість вогню',
    texture: 'amulet_misiachnyi',
    color:   0xaaccff,
    apply:   (player) => {
      player.fireRate = Math.max(80, player.fireRate * 0.80);
    },
  },
  {
    id:      'voloshy_vuzol',
    name:    'Волошковий вузол',
    desc:    'Синій квіт степів несе легкість у ногах захисника.',
    bonus:   '+15% швидкість руху',
    texture: 'amulet_voloshy',
    color:   0x4488ff,
    apply:   (player) => {
      player.speed *= 1.15;
    },
  },
  {
    id:      'ptashynyi_oberih',
    name:    'Пташиний оберіг',
    desc:    'Вільна птаха береже від злого ока та лікує рани.',
    bonus:   'Відновлення 2 HP/сек',
    texture: 'amulet_ptashynyi',
    color:   0x00ffaa,
    apply:   (player) => {
      player.hpRegen += 2;
    },
  },
  {
    id:      'vohniana_ptashka',
    name:    'Вогняна пташка',
    desc:    'Легендарний птах-фенікс запалює кожну кулю вогнем.',
    bonus:   'Вибухові кулі (AoE урон)',
    texture: 'amulet_vohniana',
    color:   0xff4400,
    apply:   (player) => {
      player.explosiveBullets = true;
    },
  },
  {
    id:      'rusalky_sloza',
    name:    'Русалчина сльоза',
    desc:    'Магія річкової русалки зцілює найтяжчі рани у бою.',
    bonus:   'Відновити 40 HP',
    texture: 'amulet_rusalky',
    color:   0x00ccff,
    apply:   (player) => {
      player.hp = Math.min(player.maxHp, player.hp + 40);
    },
  },
];

/** Vyshyvanka embroidery pickup — each one boosts Serhiy's resistance */
export const VYSHYVANKA_PICKUP = {
  id:      'vyshyvanka_stitch',
  name:    'Вишивана нитка',
  desc:    'Кожна нова вишивка на сорочці Сергія посилює його захист від ворогів.',
  bonus:   '+10% опір пошкодженням',
  texture: 'vyshyvanka_stitch',
  color:   0xff0055,
  apply:   (player) => {
    player.vyshyvankaCount += 1;
    player.resistance = Math.min(0.75, player.resistance + 0.10);
  },
};

// ─── Card display constants ─────────────────────────────────────────────────
const CARD_DEPTH      = 70;
const CARD_DURATION   = 3500; // ms before auto-dismiss
const PICKUP_DEPTH    = 4;
const PICKUP_BOB_AMP  = 6;    // floating bob amplitude (px)
const PICKUP_BOB_FREQ = 0.002; // floating bob frequency

export default class AmuletSystem {
  constructor(scene) {
    this.scene    = scene;
    /** @type {Phaser.Physics.Arcade.Group} */
    this.pickups  = scene.physics.add.staticGroup();
    this._cards   = []; // active card UI elements
  }

  /**
   * Wire up overlap detection with the player.
   * Call this after the player is created.
   * @param {Player} player
   */
  setupOverlap(player) {
    this.scene.physics.add.overlap(
      player,
      this.pickups,
      (p, pickup) => this._onCollect(p, pickup),
    );
  }

  /**
   * Spawn `count` random pickup items scattered across the scene.
   * Includes a ~25% chance to spawn a vyshyvanka instead of an amulet.
   * @param {number} count
   */
  spawnPickups(count) {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < count; i++) {
      const isVyshyvanka = Math.random() < 0.25;
      const data = isVyshyvanka
        ? VYSHYVANKA_PICKUP
        : AMULETS[Math.floor(Math.random() * AMULETS.length)];

      const x = Phaser.Math.Between(160, width  - 160);
      const y = Phaser.Math.Between(120, height - 120);
      this._createPickup(data, x, y);
    }
  }

  /**
   * Spawn a specific amulet by id at (x, y).
   */
  spawnById(id, x, y) {
    const data = AMULETS.find(a => a.id === id) ?? VYSHYVANKA_PICKUP;
    this._createPickup(data, x, y);
  }

  update(time) {
    // Floating bob animation for all pickups
    this.pickups.getChildren().forEach((pickup, idx) => {
      if (!pickup.active) return;
      pickup.y = pickup._baseY + Math.sin(time * PICKUP_BOB_FREQ + idx) * PICKUP_BOB_AMP;
      pickup.refreshBody();
    });
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  _createPickup(data, x, y) {
    const sprite = this.scene.add.image(x, y, data.texture)
      .setDepth(PICKUP_DEPTH)
      .setDisplaySize(40, 40);

    // Glow tint
    sprite.setTint(data.color);

    // Store base Y for bobbing
    sprite._baseY    = y;
    sprite._amuletData = data;

    // Add to static group for overlap
    this.scene.physics.add.existing(sprite, true);
    this.pickups.add(sprite);

    // Gentle pulse tween
    this.scene.tweens.add({
      targets:  sprite,
      scaleX:   1.2,
      scaleY:   1.2,
      duration: 900,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    return sprite;
  }

  _onCollect(player, pickup) {
    if (!pickup.active) return;
    pickup.setActive(false).setVisible(false);

    const data = pickup._amuletData;
    if (!data) return;

    // Apply the amulet's stat bonus
    data.apply(player);

    // Track collected amulet
    player.amulets.push(data.id);

    // Show info card
    this._showCard(data);

    // Spawn a neon burst FX
    this.scene.fxSystem?.spawnExplosion?.(pickup.x, pickup.y);
  }

  _showCard(data) {
    const { width, height } = this.scene.scale;
    const cx = width  - 220;
    const cy = height - 160;
    const elements = [];

    // Card background
    const bg = this.scene.add.rectangle(cx, cy, 380, 140, 0x110033, 0.92)
      .setDepth(CARD_DEPTH)
      .setStrokeStyle(2, data.color);
    elements.push(bg);

    // Amulet icon
    const icon = this.scene.add.image(cx - 155, cy, data.texture)
      .setDisplaySize(48, 48)
      .setDepth(CARD_DEPTH + 1)
      .setTint(data.color);
    elements.push(icon);

    // Name
    const nameTxt = this.scene.add.text(cx - 120, cy - 46, data.name, {
      fontFamily:      'Arial Black, Arial',
      fontSize:        '18px',
      color:           `#${data.color.toString(16).padStart(6, '0')}`,
      stroke:          '#000000',
      strokeThickness: 4,
    }).setDepth(CARD_DEPTH + 1);
    elements.push(nameTxt);

    // Description
    const descTxt = this.scene.add.text(cx - 120, cy - 20, data.desc, {
      fontFamily: 'Arial, sans-serif',
      fontSize:   '12px',
      color:      '#cccccc',
      wordWrap:   { width: 240 },
    }).setDepth(CARD_DEPTH + 1);
    elements.push(descTxt);

    // Bonus
    const bonusTxt = this.scene.add.text(cx - 120, cy + 40, `✦ ${data.bonus}`, {
      fontFamily:      'Arial Black, Arial',
      fontSize:        '14px',
      color:           '#ffee00',
      stroke:          '#000000',
      strokeThickness: 3,
    }).setDepth(CARD_DEPTH + 1);
    elements.push(bonusTxt);

    // Fade in
    elements.forEach(el => el.setAlpha(0));
    this.scene.tweens.add({
      targets:  elements,
      alpha:    1,
      duration: 250,
    });

    // Auto-dismiss after CARD_DURATION
    const dismiss = () => {
      this.scene.tweens.add({
        targets:    elements,
        alpha:      0,
        duration:   300,
        onComplete: () => elements.forEach(el => el.destroy()),
      });
    };

    this.scene.time.delayedCall(CARD_DURATION, dismiss);

    // Click to dismiss early
    bg.setInteractive();
    bg.once('pointerdown', dismiss);
  }
}

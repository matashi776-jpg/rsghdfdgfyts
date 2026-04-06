/**
 * Boss_Vakhtersha.js
 * Вахтерша — Mausoleum Protocol 2.1.
 * Бетонний моноліт + багаторука жінка + глитч-монітор.
 */
import Enemy from '../classes/Enemy.js';

export default class Boss_Vakhtersha extends Enemy {
  constructor(scene, x, y, wave = 10) {
    const hp = 600 + wave * 80;
    const speed = 28;
    super(scene, x, y, hp, speed, 'boss');
    this.type = 'boss_vakhtersha';
    this.goldValue = 150;
    this.phase = 1;
    this._phaseTriggered = false;
  }

  update() {
    super.update();
    if (!this._phaseTriggered && this.hp < this.maxHP * 0.5) {
      this._phaseTriggered = true;
      this.phase = 2;
      this.speed = 48;
      if (this.sprite) this.sprite.setTint(0xff0055);
      if (this.scene.onBossPhase2) this.scene.onBossPhase2(this);
    }
  }
}

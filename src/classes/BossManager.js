/**
 * BossManager.js
 * Finite-State Machine that drives Товариш Вахтерша's attack phases.
 *
 * Phase transitions (based on % of max HP):
 *   Phase 1 → Phase 2  when HP < 75 %  ("Перевірка документів")
 *   Phase 2 → Phase 3  when HP < 50 %  ("Кипяток-Овердрайв")
 *   Phase 3 → Phase 4  when HP < 20 %  ("Бюрократичний Апокаліпсис")
 *
 * Each phase has its own attack pattern and timing.
 * BossManager is updated every frame by BattleScene.update().
 */
export default class BossManager {
  constructor(scene, bossEntity, bossAttacks) {
    this.scene   = scene;
    this.boss    = bossEntity;
    this.attacks = bossAttacks;

    this.phase       = 1;
    this.attackTimer = 0;

    // One-shot flags prevent re-triggering the same transition
    this._phase2Done = false;
    this._phase3Done = false;
    this._phase4Done = false;
  }

  // ── Main tick ──────────────────────────────────────────────────────────────

  update(time, delta) {
    if (!this.boss.alive) return;
    this.attackTimer += delta;
    this._checkPhaseTransitions();
    this._runPhaseAttack();
  }

  // ── Phase transitions ──────────────────────────────────────────────────────

  _checkPhaseTransitions() {
    const { hp, maxHP } = this.boss;

    if (!this._phase4Done && hp < maxHP * 0.20) {
      this._phase4Done = true;
      this._enterPhase(4);
    } else if (!this._phase3Done && hp < maxHP * 0.50) {
      this._phase3Done = true;
      this._enterPhase(3);
    } else if (!this._phase2Done && hp < maxHP * 0.75) {
      this._phase2Done = true;
      this._enterPhase(2);
    }
  }

  _enterPhase(phase) {
    this.phase       = phase;
    this.attackTimer = 0;

    this.boss.setPhase(phase);

    // Phase announcement speech
    const speeches = {
      2: 'КЛЕРКИ, КО МНЕ!',
      3: '**КИПИТЬ**',
      4: 'НЕ ПОЛОЖЕНО ІСНУВАТИ!',
    };
    if (speeches[phase]) this.boss.say(speeches[phase]);

    // Colour flash to signal the phase change
    const flashColors = { 2: 0xffff00, 3: 0xff6600, 4: 0xff0000 };
    const col = flashColors[phase];
    if (col) {
      const flash = this.scene.add.rectangle(
        this.scene.scale.width  / 2,
        this.scene.scale.height / 2,
        this.scene.scale.width,
        this.scene.scale.height,
        col, 0,
      ).setDepth(50);
      this.scene.tweens.add({
        targets:   flash,
        fillAlpha: 0.38,
        duration:  160,
        yoyo:      true,
        repeat:    1,
        onComplete: () => flash.destroy(),
      });
    }
  }

  // ── Per-phase attack logic ─────────────────────────────────────────────────

  _runPhaseAttack() {
    switch (this.phase) {
      case 1: this._phase1(); break;
      case 2: this._phase2(); break;
      case 3: this._phase3(); break;
      case 4: this._phase4(); break;
    }
  }

  /** Phase 1 — fires a stamp every 1.8 s */
  _phase1() {
    if (this.attackTimer > 1800) {
      this.attackTimer = 0;
      this.boss.say('Пропуск є?');
      this.attacks.stampShot(this.boss.sprite.x, this.boss.sprite.y);
    }
  }

  /** Phase 2 — summons clerks every 3.5 s and also stamps every 2.2 s */
  _phase2() {
    if (this.attackTimer > 3500) {
      this.attackTimer = 0;
      this.boss.say('КЛЕРКИ, КО МНЕ!');
      this.attacks.summonClerks();
      // Also fire a stamp during summon phase
      this.scene.time.delayedCall(1000, () => {
        if (this.boss.alive) {
          this.attacks.stampShot(this.boss.sprite.x, this.boss.sprite.y);
        }
      });
    }
  }

  /** Phase 3 — fires varenyk bombs every 2 s and stamps every 1.2 s */
  _phase3() {
    if (this.attackTimer > 2000) {
      this.attackTimer = 0;
      this.boss.say('Куди прёшь без бланка 27-Б?');
      this.attacks.varenykBomb(this.boss.sprite.x, this.boss.sprite.y);
      // Interleaved stamp
      this.scene.time.delayedCall(700, () => {
        if (this.boss.alive) {
          this.attacks.stampShot(this.boss.sprite.x, this.boss.sprite.y);
        }
      });
    }
  }

  /** Phase 4 — meteors every 2.5 s + varenyk every 1.8 s + stamps continuously */
  _phase4() {
    if (this.attackTimer > 2500) {
      this.attackTimer = 0;
      this.boss.say('Не положено!');
      this.attacks.bureaucraticMeteor();
      this.scene.time.delayedCall(800, () => {
        if (this.boss.alive) this.attacks.varenykBomb(this.boss.sprite.x, this.boss.sprite.y);
      });
      this.scene.time.delayedCall(1400, () => {
        if (this.boss.alive) this.attacks.stampShot(this.boss.sprite.x, this.boss.sprite.y);
      });
    }
  }
}

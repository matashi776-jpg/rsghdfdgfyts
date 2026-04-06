/**
 * Player.js
 * Represents a single defender unit (Sergiy) on the battlefield.
 * Uses StateMachine to track idle / shooting states.
 * Defenders are passive — they auto-target the nearest enemy.
 */
import StateMachine from '../core/StateMachine.js';

export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.add.image(x, y, 'sergiy')
      .setDisplaySize(48, 72)
      .setTint(0xff88ff)
      .setDepth(5);

    /** Accumulated time since last shot (ms). */
    this.fireTimer = 0;

    this.stateMachine = new StateMachine(
      'idle',
      {
        idle: {
          // Idle state: defender is ready to fire but no target is in range.
          enter:   () => {},
          execute: () => {},
          exit:    () => {},
        },
        shooting: {
          // Shooting state: defender has acquired a target (managed by BattleScene update loop).
          enter:   () => {},
          execute: () => {},
          exit:    () => {},
        },
      },
      this,
    );
  }

  /**
   * Advance the state machine and accumulate the fire timer.
   * @param {number} delta - Frame delta in ms
   */
  update(delta) {
    this.stateMachine.step();
    this.fireTimer += delta;
  }
}

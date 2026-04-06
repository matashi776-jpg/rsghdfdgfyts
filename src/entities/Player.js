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
          enter:   () => {},
          execute: () => {},
          exit:    () => {},
        },
        shooting: {
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

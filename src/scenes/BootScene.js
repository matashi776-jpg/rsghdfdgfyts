/**
 * BootScene.js
 * First scene to run. Applies game config, registers global animations,
 * then immediately transitions to PreloadScene.
 */
import AnimationSystem from '../systems/AnimationSystem.js';
import MetaProgression  from '../systems/MetaProgression.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Register all sprite animations (silently skipped if atlas not yet loaded)
    AnimationSystem.registerAll(this);

    // Log meta state on boot
    console.info(
      `[ACID KHUTIR] Meta Level: ${MetaProgression.level} | Wave Record: ${MetaProgression.waveRecord}`,
    );

    this.scene.start('PreloadScene');
  }
}

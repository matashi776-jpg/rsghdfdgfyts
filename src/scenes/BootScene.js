/**
 * BootScene.js
 * First scene — sets global game settings, then starts PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Minimal boot assets only (e.g. loading screen logo)
  }

  create() {
    // Set global pixel-art scaling if needed
    this.scale.fullscreenTarget = document.body;
    this.scene.start('PreloadScene');
  }
}

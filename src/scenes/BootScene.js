/**
 * BootScene.js
 * First scene — loads the loading screen asset then hands off to PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.image('loading', 'assets/ui/loading.png');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}

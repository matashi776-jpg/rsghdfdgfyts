/**
 * AnimationSystem.js
 * Registers all Phaser sprite animations for ACID KHUTIR.
 * Call AnimationSystem.registerAll(scene) once in PreloadScene (or BootScene).
 *
 * Animations are defined as atlas-frame ranges.
 * If the atlas is not yet available, each registration is silently skipped
 * so the game still runs with fallback textures.
 */
export default class AnimationSystem {
  /**
   * Register all game animations.
   * @param {Phaser.Scene} scene
   */
  static registerAll(scene) {
    const defs = [
      // Player
      { key: 'player_idle',  atlas: 'sprites', prefix: 'player_idle_',  start: 1, end: 4, frameRate: 8,  repeat: -1 },
      { key: 'player_walk',  atlas: 'sprites', prefix: 'player_walk_',  start: 1, end: 6, frameRate: 12, repeat: -1 },
      { key: 'player_shoot', atlas: 'sprites', prefix: 'player_shoot_', start: 1, end: 3, frameRate: 16, repeat: 0  },

      // Enemies
      { key: 'clerk_walk',      atlas: 'sprites', prefix: 'enemy_clerk_walk_',      start: 1, end: 4, frameRate: 8,  repeat: -1 },
      { key: 'archivarius_walk',atlas: 'sprites', prefix: 'enemy_archivarius_walk_',start: 1, end: 4, frameRate: 5,  repeat: -1 },
      { key: 'inspector_walk',  atlas: 'sprites', prefix: 'enemy_inspector_walk_',  start: 1, end: 6, frameRate: 12, repeat: -1 },

      // Boss
      { key: 'boss_walk',       atlas: 'sprites', prefix: 'boss_vakhtersha_walk_',  start: 1, end: 4, frameRate: 4,  repeat: -1 },
      { key: 'boss_slam',       atlas: 'sprites', prefix: 'boss_vakhtersha_slam_',  start: 1, end: 6, frameRate: 12, repeat: 0  },
    ];

    for (const def of defs) {
      if (scene.anims.exists(def.key)) continue;
      try {
        scene.anims.create({
          key:       def.key,
          frames:    scene.anims.generateFrameNames(def.atlas, {
            prefix: def.prefix,
            start:  def.start,
            end:    def.end,
            zeroPad: 2,
          }),
          frameRate: def.frameRate,
          repeat:    def.repeat,
        });
      } catch {
        // Atlas not yet available — skip silently
      }
    }
  }

  /**
   * Play an animation on a sprite, falling back gracefully if not found.
   * @param {Phaser.GameObjects.Sprite} sprite
   * @param {string}                    key
   * @param {boolean}                   ignoreIfPlaying
   */
  static play(sprite, key, ignoreIfPlaying = true) {
    if (!sprite || !sprite.active) return;
    if (sprite.anims && sprite.anims.exists && sprite.anims.exists(key)) {
      sprite.play(key, ignoreIfPlaying);
    }
  }
}

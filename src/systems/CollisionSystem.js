/**
 * CollisionSystem.js
 * Hybrid collision handler: Phaser Arcade overlap + per-frame raycast.
 *
 * Why two methods?
 *   Phaser's Arcade overlap works well for normal-speed projectiles but can
 *   miss fast bullets that travel more than one body-width per frame (tunnelling).
 *   The per-frame raycast check in update() catches those edge cases by tracing
 *   a line segment from the projectile's previous position to its current one
 *   and testing for intersection with each enemy's bounding rectangle.
 *
 * Usage (in BattleScene.create):
 *   this._collisionSystem = new CollisionSystem(
 *     this, this.projectilesGroup, this.enemiesGroup,
 *     (proj, enemy) => this._hitEnemy(proj, enemy),
 *   );
 *
 * Usage (in BattleScene.update):
 *   this._collisionSystem.update();
 */
export default class CollisionSystem {
  /**
   * @param {Phaser.Scene}         scene
   * @param {Phaser.Physics.Arcade.Group} projectilesGroup
   * @param {Phaser.Physics.Arcade.Group} enemiesGroup
   * @param {Function}             hitCallback  – (proj, enemy) => void
   */
  constructor(scene, projectilesGroup, enemiesGroup, hitCallback) {
    this.scene            = scene;
    this.projectilesGroup = projectilesGroup;
    this.enemiesGroup     = enemiesGroup;
    this.hitCallback      = hitCallback;

    // Standard Arcade overlap handles normal-speed projectiles automatically
    scene.physics.add.overlap(
      projectilesGroup,
      enemiesGroup,
      hitCallback,
      null,
      scene,
    );
  }

  // ─── Raycast helper ──────────────────────────────────────────────────────

  /**
   * Returns true if the line from (prevX, prevY) → (x, y) intersects the
   * enemy's axis-aligned bounding rectangle.
   */
  _raycastCheck(proj, enemy) {
    const prevX = proj.prevX !== undefined ? proj.prevX : proj.x;
    const prevY = proj.prevY !== undefined ? proj.prevY : proj.y;

    const line   = new Phaser.Geom.Line(prevX, prevY, proj.x, proj.y);
    const bounds = enemy.getBounds();

    return Phaser.Geom.Intersects.LineToRectangle(line, bounds);
  }

  // ─── Per-frame check (call from BattleScene.update) ──────────────────────

  update() {
    const projs   = this.projectilesGroup.getChildren();
    const enemies = this.enemiesGroup.getChildren();

    for (const proj of projs) {
      if (!proj.active) continue;

      let hit = false;

      for (const enemy of enemies) {
        if (!enemy.active) continue;

        if (this._raycastCheck(proj, enemy)) {
          this.hitCallback(proj, enemy);
          hit = true;
          break; // break after first hit to avoid processing an already-hit projectile
        }
      }

      // Store current position for the next frame's raycast start point.
      // Only update when we haven't just destroyed the projectile.
      if (!hit && proj.active) {
        proj.prevX = proj.x;
        proj.prevY = proj.y;
      }
    }
  }
}

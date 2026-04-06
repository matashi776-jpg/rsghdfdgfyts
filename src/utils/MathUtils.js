/**
 * MathUtils.js
 * Mathematical helpers for ACID KHUTIR.
 * Encapsulates all progression and combat formulas in one place.
 */
export default class MathUtils {
  /**
   * Clamp a value between min and max.
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation.
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Random integer in [min, max] inclusive.
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Distance squared between two points (faster than distance for comparisons).
   */
  static distSq(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return dx * dx + dy * dy;
  }

  /**
   * Distance between two points.
   */
  static dist(ax, ay, bx, by) {
    return Math.sqrt(MathUtils.distSq(ax, ay, bx, by));
  }

  /**
   * Angle in radians from point A toward point B.
   */
  static angle(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
  }

  /**
   * Wrap an angle to [-π, π].
   */
  static wrapAngle(radians) {
    while (radians >  Math.PI) radians -= 2 * Math.PI;
    while (radians < -Math.PI) radians += 2 * Math.PI;
    return radians;
  }

  /**
   * Format a large number with k/M suffix (e.g. 1500 → "1.5k").
   */
  static formatNumber(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return String(Math.floor(n));
  }

  /**
   * Probability check: returns true with `chance` probability (0–1).
   */
  static chance(probability) {
    return Math.random() < probability;
  }
}

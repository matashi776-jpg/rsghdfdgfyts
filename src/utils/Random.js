/**
 * Random.js
 * Seeded pseudo-random number generator (LCG) for reproducible runs.
 */
export default class Random {
  constructor(seed = Date.now()) {
    this._seed = seed >>> 0;
  }

  next() {
    this._seed = (Math.imul(1664525, this._seed) + 1013904223) >>> 0;
    return this._seed / 0x100000000;
  }

  int(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  pick(array) {
    return array[this.int(0, array.length - 1)];
  }

  shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

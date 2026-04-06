/**
 * EventBus.js
 * Singleton global event emitter — Оборона Ланчина V4.0
 *
 * Provides a shared Phaser EventEmitter for cross-system communication
 * without tight coupling between scenes and game objects.
 *
 * Usage:
 *   import { GlobalEvents } from '../systems/EventBus.js';
 *   GlobalEvents.emit('waveChanged', 3);
 *   GlobalEvents.on('waveChanged', (wave) => { ... });
 */
export default class EventBus extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }
}

export const GlobalEvents = new EventBus();

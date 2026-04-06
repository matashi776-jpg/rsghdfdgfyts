/**
 * StateMachine.js
 * Generic finite-state machine used by game entities.
 *
 * Usage:
 *   const sm = new StateMachine('idle', { idle: { enter, execute, exit }, ... }, context);
 *   sm.step();                  // called every frame
 *   sm.transition('shooting');  // move to a new state
 */
export default class StateMachine {
  /**
   * @param {string} initialState - Key of the starting state
   * @param {Object} possibleStates - Map of state key → { enter(), execute(), exit() }
   * @param {*} context - Owner object passed to states (available as stateMachine.context)
   */
  constructor(initialState, possibleStates, context) {
    this.initialState  = initialState;
    this.possibleStates = possibleStates;
    this.context       = context;
    this.state         = null;

    // Give every state a back-reference to this machine
    for (const state of Object.values(this.possibleStates)) {
      state.stateMachine = this;
    }
  }

  /** Advance the machine one tick (call every frame). */
  step() {
    if (this.state === null) {
      this.state = this.initialState;
      this.possibleStates[this.state].enter();
    }
    this.possibleStates[this.state].execute();
  }

  /**
   * Transition to a new state.
   * @param {string} newState - Key of the target state
   * @param {...*} args - Optional arguments forwarded to the new state's enter()
   */
  transition(newState, ...args) {
    this.possibleStates[this.state].exit();
    this.state = newState;
    this.possibleStates[this.state].enter(...args);
  }
}

import RingBuffer from "./RingBuffer";

export default class UndoableStorage<Type> {
  private undoHistory: RingBuffer<Type>;
  private subscribers: Array<(value: Type) => void> = new Array();

  constructor(private _state: Type, historyLength: number) {
    this.undoHistory = new RingBuffer(historyLength);
  }

  get state(): Type {
    return this._state;
  }

  subscribe(callback: (value: Type) => void) {
    this.subscribers.push(callback);
  }

  action(action: (value: Type) => Type) {
    this.undoHistory.put(this._state);
    this._state = action(this._state);
    this.subscribers.forEach((callback) => callback(this._state));
  }

  undo() {
    if (this.undoHistory.count === 0) {
      return;
    }
    const previousState = this.undoHistory.popHead();
    if (previousState === null) {
      return;
    }
    this._state = previousState;
    this.subscribers.forEach((callback) => callback(this._state));
  }
}

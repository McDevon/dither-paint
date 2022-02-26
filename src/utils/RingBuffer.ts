export default class RingBuffer<Type> {
  private headIndex: number = 0;
  private buffer: Array<Type> = [];
  private _count: number = 0;

  constructor(readonly size: number) {
    this.buffer.length = size;
  }

  put(value: Type) {
    this.headIndex = (this.headIndex + 1) % this.size;
    this.buffer[this.headIndex] = value;
    this._count = Math.min(this.size, this._count + 1);
  }

  get count(): number {
    return this._count;
  }

  getHead(): Type | null {
    if (this._count === 0) {
      return null;
    }
    return this.buffer[this.headIndex];
  }

  popHead(): Type | null {
    if (this._count === 0) {
      return null;
    }
    const head = this.buffer[this.headIndex];
    if (this.headIndex === 0) {
      this.headIndex = this.size - 1;
    } else {
      this.headIndex -= 1;
    }
    this._count -= 1;
    return head;
  }

  getAll(): Array<Type> {
    let index = (this.headIndex + 1) % this.size;
    const ret: Array<Type> = [];
    for (let i = 0; i < this.size; i++) {
      if (this.buffer[index] === null || this.buffer[index] === undefined) {
        continue;
      }
      ret.push(this.buffer[index]);
      index = (index + 1) % this.size;
    }
    return ret;
  }
}

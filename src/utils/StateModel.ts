type PaintDirection = 1 | -1;

export default class StateModel {
  public direction: PaintDirection = 1;
  public position: number = 0;
  public values: Array<number>;

  constructor(
    public readonly width: number = 16,
    public readonly height: number = 16,
    public levels: number = width * height
  ) {
    this.values = new Array(width * height);
  }

  clone(): StateModel {
    const ret = { ...this, values: [...this.values] };
    Object.setPrototypeOf(ret, Object.getPrototypeOf(this));
    return ret;
  }
}

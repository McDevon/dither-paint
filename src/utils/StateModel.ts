import { runInThisContext } from "vm";

type PaintDirection = 1 | -1;

export default class StateModel {
  public direction: PaintDirection = 1;
  public position: number = 0;

  private _width: number;
  private _height: number;
  private _values: Array<number>;

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get values(): Array<number> {
    return this._values;
  }

  constructor(
    width: number = 16,
    height: number = 16,
    public levels: number = width * height
  ) {
    this._width = width;
    this._height = height;
    this._values = new Array(width * height);
  }

  public setImage(image: HTMLImageElement): void {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    this._width = image.width;
    this._height = image.height;
    this._values = new Array(this.width * this.height);
    canvas.width = this.width;
    canvas.height = this.height;
    context.drawImage(image, 0, 0);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const pixel = context.getImageData(x, y, 1, 1).data;
        this.values[index] = (pixel[0] + pixel[1] + pixel[2]) / 3;
      }
    }
  }

  clone(): StateModel {
    const ret = { ...this, values: [...this.values] };
    Object.setPrototypeOf(ret, Object.getPrototypeOf(this));
    return ret;
  }
}

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

  public setImage(image: HTMLImageElement): void {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
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

import React from "react";
import ReactSlider from "react-slider";
import StateModel from "../Utils/StateModel";
import UndoableStorage from "../Utils/UndoableStorage";
import Button from "./Button";
import "./DitherPaint.css";

const pixelSize = 16;
const maxImageSize = 16;
const previewPixelSize = 4;
const previewGridSize = 3;

class DitherPreview extends React.Component {
  canvasElement: React.RefObject<HTMLCanvasElement>;
  exportCanvasElement: React.RefObject<HTMLCanvasElement>;
  previewCanvasElement: React.RefObject<HTMLCanvasElement>;

  imageSet: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updatePreview: () => void;
  sliderChanged: (value: number, thumbIndex: number) => void;

  image: HTMLImageElement | null = null;
  model: StateModel = new StateModel();
  previewPosition: number = 120;

  constructor(props: {}) {
    super(props);
    this.canvasElement = React.createRef();
    this.exportCanvasElement = React.createRef();
    this.previewCanvasElement = React.createRef();

    const drawToCanvas = (
      canvas: HTMLCanvasElement,
      state: StateModel,
      size: number,
      bgColor: string
    ) => {
      const ctx = canvas.getContext("2d");
      if (ctx === null || ctx === undefined) {
        return;
      }
      for (let i = 0; i < state.width * state.height; ++i) {
        let color =
          state.values[i] == null
            ? bgColor
            : `rgb(${state.values[i]}, ${state.values[i]}, ${state.values[i]})`;
        const x = i % state.width;
        const y = Math.floor(i / state.width);

        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);
      }
    };

    this.imageSet = (event: React.ChangeEvent<HTMLInputElement>) => {
      let img = new Image();
      img.onload = () => {
        this.model.setImage(img);
        this.resetCanvas();
        const canvas = this.canvasElement.current;
        if (canvas) {
          drawToCanvas(canvas, this.model, pixelSize, "#FF00FF");
        }
        this.updatePreview();
      };
      img.onerror = () => {
        console.log("error");
      };

      const file = event.target.files?.[0];
      if (file) {
        img.src = URL.createObjectURL(file);
      }
    };

    this.updatePreview = () => {
      const canvas = this.previewCanvasElement.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      const bgColor = "#FF00FF";
      const state = this.model;
      for (let i = 0; i < state.width * state.height; ++i) {
        let color =
          state.values[i] == null
            ? bgColor
            : state.values[i] < this.previewPosition
            ? "#000000"
            : "#FFFFFF";
        const x = i % state.width;
        const y = Math.floor(i / state.width);

        for (let k = 0; k < previewGridSize; ++k) {
          for (let j = 0; j < previewGridSize; ++j) {
            const offsetX = j * previewPixelSize * state.width;
            const offsetY = k * previewPixelSize * state.height;
            ctx.fillStyle = color;
            ctx.fillRect(
              offsetX + x * previewPixelSize,
              offsetY + y * previewPixelSize,
              previewPixelSize,
              previewPixelSize
            );
          }
        }
      }
    };

    this.sliderChanged = (value: number, thumbIndex: number) => {
      console.log("slider: ", value, "thumb: ", thumbIndex);
      this.previewPosition = value;
      this.updatePreview();
    };
  }

  resetCanvas() {
    const ctx = this.canvasElement.current?.getContext("2d");
    if (ctx === null || ctx === undefined) {
      return;
    }

    const image = this.image;
    const width =
      (image ? Math.min(image.width, maxImageSize) : maxImageSize) * pixelSize;
    const height =
      (image ? Math.min(image.height, maxImageSize) : maxImageSize) * pixelSize;

    ctx.canvas.height = height;
    ctx.canvas.width = width;
    ctx.fillStyle = "#FF00FF";
    ctx.fillRect(0, 0, width, height);
  }

  componentDidMount() {
    this.resetCanvas();
  }

  render(): React.ReactNode {
    const image = this.image;
    const width = image ? Math.min(image.width, maxImageSize) : maxImageSize;
    const height = image ? Math.min(image.height, maxImageSize) : maxImageSize;
    return (
      <div>
        <canvas
          ref={this.canvasElement}
          width={width * pixelSize}
          height={height * pixelSize}
        />
        <canvas
          ref={this.exportCanvasElement}
          width={width}
          height={height}
          style={{ display: "none" }}
        />
        <input type="file" onChange={this.imageSet}></input>
        <img
          id="exportImage"
          width={width * 4}
          height={height * 4}
          className="crispy"
        />
        <canvas
          ref={this.previewCanvasElement}
          width={width * previewPixelSize * previewGridSize}
          height={height * previewPixelSize * previewGridSize}
        />
        <ReactSlider
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={0}
          max={256}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
          onChange={this.sliderChanged}
        />
      </div>
    );
  }
}

export default DitherPreview;

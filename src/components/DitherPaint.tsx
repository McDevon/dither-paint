import React from "react";
import StateModel from "../Utils/StateModel";
import UndoableStorage from "../Utils/UndoableStorage";
import Button from "./Button";
import "./DitherPaint.css";

const pixelSize = 16;

class DitherPaint extends React.Component {
  canvasElement: React.RefObject<HTMLCanvasElement>;
  exportCanvasElement: React.RefObject<HTMLCanvasElement>;
  storage: UndoableStorage<StateModel> = new UndoableStorage(
    new StateModel(16, 16, 256),
    30
  );
  isMouseDown: boolean = false;
  mouseDownListener: (event: MouseEvent) => void;
  mouseUpListener: (event: MouseEvent) => void;
  mouseMoveListener: (event: MouseEvent) => void;
  keyboardListener: (event: KeyboardEvent) => void;

  drawStateDirty: boolean = false;

  exportSelected: (event: React.MouseEvent) => void;

  constructor(props: {}) {
    super(props);
    this.canvasElement = React.createRef();
    this.exportCanvasElement = React.createRef();

    const paint = (x: number, y: number) => {
      const state = this.storage.state;
      const next = state.position + state.direction;
      if (
        next < 0 ||
        next > state.width * state.height ||
        x < 0 ||
        y < 0 ||
        x >= state.width ||
        y >= state.height
      ) {
        return;
      }
      const index = x + y * state.width;
      const newVal =
        Math.floor(
          state.position / ((state.width * state.height) / state.levels)
        ) *
        (256 / state.levels);
      if (
        state.values[index] === null ||
        state.values[index] === undefined ||
        (state.direction === 1 && state.values[index] > newVal) ||
        (state.direction === -1 && state.values[index] < newVal)
      ) {
        this.storage.action((state: StateModel) => {
          const ret = state.clone();
          ret.values[index] = newVal;
          ret.position = next;
          return ret;
        });
        this.drawStateDirty = true;
      }
    };

    const mouseAct = (mouseX: number, mouseY: number) => {
      const rect = this.canvasElement.current?.getBoundingClientRect();
      if (rect == undefined) {
        return;
      }

      const x = (mouseX - rect.left) / (rect.right - rect.left);
      const y = (mouseY - rect.top) / (rect.bottom - rect.top);
      const pixelX = Math.floor(x * this.storage.state.width);
      const pixelY = Math.floor(y * this.storage.state.height);

      paint(pixelX, pixelY);
    };

    this.mouseDownListener = (event: MouseEvent) => {
      const rect = this.canvasElement.current?.getBoundingClientRect();
      if (rect === undefined) {
        return;
      }
      if (
        event.clientX < rect.left ||
        event.clientY < rect.top ||
        event.clientX > rect.right ||
        event.clientY > rect.bottom
      ) {
        return;
      }
      event.preventDefault();
      this.isMouseDown = true;
      mouseAct(event.clientX, event.clientY);
    };
    this.mouseUpListener = (_: MouseEvent) => {
      if (!this.isMouseDown) {
        return;
      }
      this.isMouseDown = false;
      if (this.drawStateDirty) {
        this.storage.saveUndoState();
        this.drawStateDirty = false;
      } else {
      }
    };
    this.mouseMoveListener = (event: MouseEvent) => {
      if (!this.isMouseDown) {
        return;
      }
      const rect = this.canvasElement.current?.getBoundingClientRect();
      if (rect === undefined) {
        return;
      }
      if (
        event.clientX < rect.left ||
        event.clientY < rect.top ||
        event.clientX > rect.right ||
        event.clientY > rect.bottom
      ) {
        return;
      }
      event.preventDefault();
      mouseAct(event.clientX, event.clientY);
    };
    this.keyboardListener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      const undoKey = 26;
      if (
        (event.ctrlKey || event.metaKey) &&
        ((event.key !== undefined && event.key === "z") ||
          (event.keyCode !== undefined && event.keyCode === undoKey))
      ) {
        event.preventDefault();
        this.storage.undo();
      }
    };

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

    this.storage.subscribe((value: StateModel) => {
      const canvas = this.canvasElement.current;
      if (canvas === null || canvas === undefined) {
        return;
      }
      drawToCanvas(canvas, value, pixelSize, "#FF00FF");
    });

    this.exportSelected = (_: React.MouseEvent) => {
      const canvas = this.exportCanvasElement.current;
      if (canvas === null || canvas === undefined) {
        return;
      }
      drawToCanvas(canvas, this.storage.state, 1, "#FFFFFF");
      const image = canvas.toDataURL("image/png");
      (document.getElementById("exportImage") as HTMLImageElement).src = image;
    };

    this.storage.saveUndoState();
  }

  resetCanvas() {
    const ctx = this.canvasElement.current?.getContext("2d");
    if (ctx === null || ctx === undefined) {
      return;
    }

    ctx.fillStyle = "#FF00FF";
    ctx.fillRect(
      0,
      0,
      this.storage.state.width * pixelSize,
      this.storage.state.height * pixelSize
    );
  }

  componentDidMount() {
    this.resetCanvas();

    window.addEventListener("mousedown", this.mouseDownListener);
    window.addEventListener("mouseup", this.mouseUpListener);
    window.addEventListener("mousemove", this.mouseMoveListener);
    window.addEventListener("keydown", this.keyboardListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.mouseDownListener);
    window.removeEventListener("mouseup", this.mouseUpListener);
    window.removeEventListener("mousemove", this.mouseMoveListener);
    window.removeEventListener("keydown", this.keyboardListener);
  }

  render(): React.ReactNode {
    return (
      <div>
        <canvas
          ref={this.canvasElement}
          width={this.storage.state.width * pixelSize}
          height={this.storage.state.height * pixelSize}
        />
        <canvas
          ref={this.exportCanvasElement}
          width={this.storage.state.width}
          height={this.storage.state.height}
          style={{ display: "none" }}
        />
        <Button
          {...{ onClick: this.exportSelected, text: "Export", disabled: false }}
        />
        <img
          id="exportImage"
          width={this.storage.state.width * 4}
          height={this.storage.state.height * 4}
          className="crispy"
        />
      </div>
    );
  }
}

export default DitherPaint;

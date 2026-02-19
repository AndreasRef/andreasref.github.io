import { GRID_COLS, GRID_ROWS, GRID_LINE_COLOR } from '../utils/constants.js';
import { ColorProcessor } from './color-processor.js';

export class GridRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colorProcessor = new ColorProcessor();
    this.cellW = 1;
    this.cellH = 1;
    this.dataOpacity = 1.0;    // controlled by face presence (fade in/out)
    this.cameraOpacity = 0;    // 0 = all white, 1 = full camera feed
  }

  resize(totalW, totalH) {
    this.canvas.width = totalW;
    this.canvas.height = totalH;
    this.cellW = totalW / GRID_COLS;
    this.cellH = totalH / GRID_ROWS;
  }

  /**
   * Render a frame.
   * @param {ImageData} imageData — GRID_COLS x GRID_ROWS pixel data
   * @param {Uint8Array|null} segMask — grid-resolution mask (1=person, 0=background)
   * @param {Array|null} mergedCells — merged cell definitions from CellDataMapper
   */
  render(imageData, segMask = null, mergedCells = null) {
    const { ctx, cellW, cellH, colorProcessor } = this;

    colorProcessor.processBuffer(imageData);
    const d = imageData.data;

    const camO = this.cameraOpacity;

    for (let row = 0; row < GRID_ROWS; row++) {
      const y = row * cellH;
      for (let col = 0; col < GRID_COLS; col++) {
        const i = row * GRID_COLS + col;
        const idx = i * 4;

        if (segMask && segMask[i] !== 0) {
          ctx.fillStyle = '#FFF';
        } else if (camO >= 0.99) {
          ctx.fillStyle = `rgb(${d[idx]},${d[idx + 1]},${d[idx + 2]})`;
        } else {
          const r = Math.round(255 + (d[idx] - 255) * camO);
          const g = Math.round(255 + (d[idx + 1] - 255) * camO);
          const b = Math.round(255 + (d[idx + 2] - 255) * camO);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        }

        ctx.fillRect(col * cellW, y, cellW + 0.5, cellH + 0.5);
      }
    }

    this.drawGridLines();

    if (mergedCells && mergedCells.length && this.dataOpacity > 0.01) {
      this.drawMergedCells(mergedCells, this.dataOpacity);
    }
  }

  drawGridLines() {
    const { ctx, cellW, cellH } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;

    ctx.beginPath();
    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = Math.round(row * cellH) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    for (let col = 0; col <= GRID_COLS; col++) {
      const x = Math.round(col * cellW) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  /**
   * Fit font size to fill available space. O(1) linear scaling.
   */
  _fitFontSize(ctx, text, maxWidth, maxHeight, minSize, maxSize) {
    let size = Math.min(maxHeight, maxSize);
    ctx.font = size + 'px "Courier New", monospace';
    const measured = ctx.measureText(text).width;
    if (measured > maxWidth && measured > 0) {
      size = size * (maxWidth / measured);
    }
    return Math.max(minSize, Math.min(size, maxSize));
  }

  /**
   * Draw merged cell regions.
   */
  drawMergedCells(mergedCells, opacity) {
    const { ctx } = this;

    for (let idx = 0; idx < mergedCells.length; idx++) {
      const mc = mergedCells[idx];
      const x = mc.col * this.cellW;
      const y = mc.row * this.cellH;
      const w = mc.spanCols * this.cellW;
      const h = mc.spanRows * this.cellH;

      this._drawMetricCell(mc, x, y, w, h, idx, opacity);
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * Normal metric cell — label top, value below divider line.
   */
  _drawMetricCell(mc, x, y, w, h, idx, opacity) {
    const { ctx } = this;

    // 6% horizontal padding
    const padX = w * 0.06;
    const innerW = w - padX * 2;

    // Alternating background
    ctx.globalAlpha = 0.92 * opacity;
    ctx.fillStyle = idx % 2 === 0 ? '#F5F6F8' : '#EBEEF3';
    ctx.fillRect(x, y, w, h);

    // Thin border around entire block
    ctx.globalAlpha = 0.35 * opacity;
    ctx.strokeStyle = '#B0B0B0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    // --- Label: top ~28% of cell height ---
    const labelHeight = h * 0.28;

    // Dividing line between label cell and value cell
    ctx.beginPath();
    const divY = Math.round(y + labelHeight) + 0.5;
    ctx.moveTo(x, divY);
    ctx.lineTo(x + w, divY);
    ctx.stroke();

    const labelSize = this._fitFontSize(ctx, mc.label, innerW, labelHeight * 0.8, 10, 40);
    ctx.globalAlpha = opacity;
    ctx.font = labelSize + 'px "Courier New", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#555';
    ctx.fillText(mc.label, x + padX, y + labelHeight * 0.1, innerW);

    // --- Value: middle ~55% of cell height ---
    const valueTop = y + labelHeight;
    const valueHeight = h * 0.55;
    const valueSize = this._fitFontSize(ctx, mc.value, innerW, valueHeight * 0.85, 12, 80);

    ctx.font = 'bold ' + valueSize + 'px "Courier New", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#111';
    const valueTextY = valueTop + (valueHeight - valueSize) * 0.4;
    ctx.fillText(mc.value, x + padX, valueTextY, innerW);
  }
}

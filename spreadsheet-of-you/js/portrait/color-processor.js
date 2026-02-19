import { DESATURATION, QUANTIZATION_LEVELS } from '../utils/constants.js';

const QUANT_STEP = 256 / QUANTIZATION_LEVELS; // ~4

export class ColorProcessor {
  /**
   * Process a single pixel: desaturate, apply CCTV levels correction, quantize.
   * Returns [r, g, b] clamped to 0-255.
   */
  processPixel(r, g, b) {
    // 1. Desaturate 30% — blend toward perceptual grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = r + (gray - r) * DESATURATION;
    g = g + (gray - g) * DESATURATION;
    b = b + (gray - b) * DESATURATION;

    // 2. CCTV / clinical lighting correction
    //    Lift shadows (input black point 20), clip highlights (235)
    //    This crushes the tonal range into a flatter, surveillance-camera look
    r = levelsAdjust(r);
    g = levelsAdjust(g);
    b = levelsAdjust(b);

    // 3. Quantize to ~64 levels per channel (slight posterization)
    r = Math.round(r / QUANT_STEP) * QUANT_STEP;
    g = Math.round(g / QUANT_STEP) * QUANT_STEP;
    b = Math.round(b / QUANT_STEP) * QUANT_STEP;

    return [
      clamp(r),
      clamp(g),
      clamp(b)
    ];
  }

  /**
   * Process an entire 80x60 ImageData buffer in-place for efficiency.
   * Returns the same ImageData (modified).
   */
  processBuffer(imageData) {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b] = this.processPixel(d[i], d[i + 1], d[i + 2]);
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
    return imageData;
  }
}

function levelsAdjust(value) {
  const IN_BLACK = 20;
  const IN_WHITE = 235;
  return clamp((value - IN_BLACK) / (IN_WHITE - IN_BLACK) * 255);
}

function clamp(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

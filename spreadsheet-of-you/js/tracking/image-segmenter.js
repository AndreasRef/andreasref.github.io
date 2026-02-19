import { SELFIE_SEGMENTER_MODEL, GRID_COLS, GRID_ROWS } from '../utils/constants.js';

let ImageSegmenter;

export class SegmenterTracker {
  constructor() {
    this.imageSegmenter = null;
    this.rawMask = null;
    this.maskWidth = 0;
    this.maskHeight = 0;
    this.gridMask = new Uint8Array(GRID_COLS * GRID_ROWS);
    this.ready = false;
  }

  async init(vision) {
    console.log('[ImageSegmenter] Creating segmenter...');

    const module = await import('@mediapipe/tasks-vision');
    ImageSegmenter = module.ImageSegmenter;

    this.imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: SELFIE_SEGMENTER_MODEL,
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      outputCategoryMask: true,
      outputConfidenceMasks: false
    });

    this.ready = true;
    console.log('[ImageSegmenter] Ready');
  }

  /**
   * Run segmentation and return a grid-resolution mask (GRID_COLS x GRID_ROWS).
   * 1 = person (foreground), 0 = background.
   */
  segment(video, timestamp) {
    if (!this.ready || video.readyState < 2) return null;

    try {
      const result = this.imageSegmenter.segmentForVideo(video, timestamp);

      if (result.categoryMask) {
        const data = result.categoryMask.getAsFloat32Array();
        this.maskWidth = result.categoryMask.width;
        this.maskHeight = result.categoryMask.height;
        // Copy to persistent buffer (the source may be recycled by MediaPipe)
        if (!this.rawMask || this.rawMask.length !== data.length) {
          this.rawMask = new Float32Array(data.length);
        }
        this.rawMask.set(data);
        result.categoryMask.close();
      }
    } catch (e) {
      // Silently continue — segmentation is non-critical
      return this.gridMask;
    }

    if (!this.rawMask) return null;
    return this.computeGridMask();
  }

  /**
   * Downsample and mirror the full-resolution mask to grid resolution.
   */
  computeGridMask() {
    const { rawMask, maskWidth, maskHeight, gridMask } = this;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const normY = row / GRID_ROWS;
        const normX = (GRID_COLS - 1 - col) / GRID_COLS;
        const srcY = Math.min(maskHeight - 1, Math.floor(normY * maskHeight));
        const srcX = Math.min(maskWidth - 1, Math.floor(normX * maskWidth));
        gridMask[row * GRID_COLS + col] = rawMask[srcY * maskWidth + srcX] > 0.5 ? 1 : 0;
      }
    }
    return gridMask;
  }
}

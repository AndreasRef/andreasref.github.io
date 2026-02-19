import { GRID_COLS, GRID_ROWS } from './utils/constants.js';

export class Camera {
  constructor() {
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('autoplay', '');
    this.video.muted = true;

    // Small offscreen canvas for downsampled + mirrored frame
    this.sampleCanvas = document.createElement('canvas');
    this.sampleCanvas.width = GRID_COLS;
    this.sampleCanvas.height = GRID_ROWS;
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

    this.ready = false;
  }

  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    });

    this.video.srcObject = stream;
    await this.video.play();
    this.ready = true;
  }

  /**
   * Capture a mirror-flipped, downsampled frame as ImageData.
   */
  sampleFrame() {
    if (!this.ready) return null;

    const { sampleCtx, sampleCanvas, video } = this;
    const w = sampleCanvas.width;
    const h = sampleCanvas.height;

    sampleCtx.save();
    // Mirror flip: translate to right edge, scale -1 horizontally
    sampleCtx.translate(w, 0);
    sampleCtx.scale(-1, 1);
    sampleCtx.drawImage(video, 0, 0, w, h);
    sampleCtx.restore();
    return sampleCtx.getImageData(0, 0, w, h);
  }
}

import { GRID_COLS, GRID_ROWS } from './utils/constants.js';

export class Camera {
  constructor() {
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('autoplay', '');
    this.video.muted = true;

    // One unmirrored crop shared by every tracker and the portrait.
    this.inputCanvas = document.createElement('canvas');
    this.inputCtx = this.inputCanvas.getContext('2d');
    this.zoom = 1;

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
   * Draw a centered digital crop. Preview and confirmed input use the same crop.
   */
  drawCrop(ctx, zoom = this.zoom) {
    if (!this.ready || this.video.readyState < 2) return false;
    const { video } = this;
    const width = video.videoWidth / zoom;
    const height = video.videoHeight / zoom;
    ctx.drawImage(
      video,
      (video.videoWidth - width) / 2, (video.videoHeight - height) / 2,
      width, height,
      0, 0, ctx.canvas.width, ctx.canvas.height
    );
    return true;
  }

  setZoom(zoom) {
    if (Number.isFinite(zoom)) this.zoom = Math.max(1, Math.min(3, zoom));
  }

  getFrame() {
    if (!this.ready || this.video.readyState < 2) return null;
    // Keep the original input at 1×; crop at camera resolution when zoomed.
    if (this.zoom === 1) return this.video;
    if (this.inputCanvas.width !== this.video.videoWidth ||
        this.inputCanvas.height !== this.video.videoHeight) {
      this.inputCanvas.width = this.video.videoWidth;
      this.inputCanvas.height = this.video.videoHeight;
    }
    this.drawCrop(this.inputCtx);
    return this.inputCanvas;
  }

  /**
   * Capture a mirror-flipped, downsampled frame as ImageData.
   */
  sampleFrame(frame = this.getFrame()) {
    if (!frame) return null;

    const { sampleCtx, sampleCanvas } = this;
    const w = sampleCanvas.width;
    const h = sampleCanvas.height;

    sampleCtx.save();
    // Mirror flip: translate to right edge, scale -1 horizontally
    sampleCtx.translate(w, 0);
    sampleCtx.scale(-1, 1);
    sampleCtx.drawImage(frame, 0, 0, w, h);
    sampleCtx.restore();
    return sampleCtx.getImageData(0, 0, w, h);
  }
}

import { CLOSE_RANGE_IPD } from '../utils/constants.js';
import { FaceLandmarkerTracker } from './face-landmarker.js';
import { SegmenterTracker } from './image-segmenter.js';
import { FaceApiTracker } from './faceapi-tracker.js';

/**
 * Coordinates all trackers:
 *   - MediaPipe FaceLandmarker (primary, every frame)
 *   - MediaPipe ImageSegmenter (every frame)
 *   - face-api.js (secondary, using the same cropped image)
 *
 * Face size is diagnostic only: digital zoom must never disable classification.
 */
export class TrackerManager {
  constructor() {
    this.faceLandmarker = new FaceLandmarkerTracker();
    this.segmenter = new SegmenterTracker();
    this.faceApi = new FaceApiTracker();
    this.closeRange = false;
    this.currentIpd = 0;
  }

  async init(onProgress) {
    const progress = onProgress || (() => {});

    // MediaPipe trackers (sequential — segmenter reuses vision WASM)
    progress(0, 'Initializing face detection...');
    await this.faceLandmarker.init();
    progress(1, 'Initializing segmentation...');
    await this.segmenter.init(this.faceLandmarker.getVision());
    console.log('[TrackerManager] MediaPipe trackers ready');
    progress(2, 'Loading classification models...');

    // face-api.js (independent, can fail without breaking MediaPipe)
    try {
      await this.faceApi.init();
    } catch (err) {
      console.warn('[TrackerManager] face-api.js init failed — continuing without it:', err);
    }
    progress(3, 'Ready');
  }

  /**
   * Run all trackers for the current frame.
   * @param {HTMLVideoElement|HTMLCanvasElement} video — confirmed camera crop
   * @param {number} timestamp — rAF timestamp (strictly increasing)
   * @param {boolean} segmentationEnabled — whether to run segmentation
   * @returns {{ face, segMask, faceApiResult }}
   */
  update(video, timestamp, segmentationEnabled = true) {
    let face = null;
    let segMask = null;

    // --- MediaPipe FaceLandmarker (always runs) ---
    if (this.faceLandmarker.ready) {
      face = this.faceLandmarker.detect(video, timestamp);
    }

    // --- MediaPipe ImageSegmenter ---
    if (this.segmenter.ready && segmentationEnabled) {
      const mask = this.segmenter.segment(video, timestamp);
      if (mask) segMask = mask;
    }

    // Measure apparent face size without automatically pausing classification.
    this.currentIpd = 0;
    if (face && face.faceLandmarks?.[0]?.length > 473) {
      const lm = face.faceLandmarks[0];
      const lIris = lm[468];
      const rIris = lm[473];
      this.currentIpd = Math.hypot(rIris.x - lIris.x, rIris.y - lIris.y);
    }

    this.closeRange = this.currentIpd > CLOSE_RANGE_IPD;

    // --- face-api.js (fire-and-forget, reads last result) ---
    this.faceApi.detect(video);
    const faceApiResult = this.faceApi.getResult();

    return { face, segMask, faceApiResult };
  }

  toggleFaceApi() {
    if (this.faceApi.paused) {
      this.faceApi.resume();
      return true;
    } else {
      this.faceApi.pause();
      return false;
    }
  }

  get faceLandmarkerReady() { return this.faceLandmarker.ready; }
  get segmenterReady() { return this.segmenter.ready; }
  get faceApiReady() { return this.faceApi.ready; }
  get faceApiEnabled() { return !this.faceApi.paused; }
  get isCloseRange() { return this.closeRange; }
}

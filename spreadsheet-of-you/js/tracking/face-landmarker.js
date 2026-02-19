import { WASM_PATH, FACE_LANDMARKER_MODEL } from '../utils/constants.js';

let FaceLandmarker, FilesetResolver;

export class FaceLandmarkerTracker {
  constructor() {
    this.faceLandmarker = null;
    this.results = null;
    this.vision = null;
    this.ready = false;
  }

  async init() {
    console.log('[FaceLandmarker] Loading WASM runtime...');

    // Dynamic import from CDN — the importmap in index.html resolves this
    const module = await import('@mediapipe/tasks-vision');
    FaceLandmarker = module.FaceLandmarker;
    FilesetResolver = module.FilesetResolver;

    this.vision = await FilesetResolver.forVisionTasks(WASM_PATH);

    console.log('[FaceLandmarker] Creating face landmarker...');
    this.faceLandmarker = await FaceLandmarker.createFromOptions(this.vision, {
      baseOptions: {
        modelAssetPath: FACE_LANDMARKER_MODEL,
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true
    });

    this.ready = true;
    console.log('[FaceLandmarker] Ready');
  }

  /** Return shared WASM runtime for other tasks to reuse. */
  getVision() {
    return this.vision;
  }

  /**
   * Run face detection on the current video frame.
   * Returns the full result or null if no face found.
   */
  detect(video, timestamp) {
    if (!this.ready || video.readyState < 2) return null;
    try {
      this.results = this.faceLandmarker.detectForVideo(video, timestamp);
    } catch (e) {
      return null;
    }
    if (!this.results?.faceLandmarks?.length) {
      this.results = null;
      return null;
    }
    return this.results;
  }

  get landmarks()       { return this.results?.faceLandmarks?.[0] || null; }
  get blendshapes()     { return this.results?.faceBlendshapes?.[0]?.categories || null; }
  get transformMatrix() { return this.results?.facialTransformationMatrixes?.[0] || null; }
}

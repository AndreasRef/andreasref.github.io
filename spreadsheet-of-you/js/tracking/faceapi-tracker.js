import { FACEAPI_INTERVAL, FACEAPI_MODEL_URL } from '../utils/constants.js';

/**
 * Secondary tracker using face-api.js for age, gender, and 7 expression scores.
 * Runs every FACEAPI_INTERVAL frames (fire-and-forget async pattern).
 * Can be paused for close-range handoff when the face is too large for TinyFaceDetector.
 */
export class FaceApiTracker {
  constructor() {
    this.ready = false;
    this.frameCount = 0;
    this.lastResult = null;
    this.detecting = false;
    this.paused = false;
  }

  async init() {
    const faceapi = window.faceapi;
    if (!faceapi) {
      console.warn('[FaceApi] face-api.js not loaded — skipping');
      return;
    }

    console.log('[FaceApi] Loading models...');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACEAPI_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACEAPI_MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(FACEAPI_MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(FACEAPI_MODEL_URL)
    ]);

    this.ready = true;
    console.log('[FaceApi] Ready');
  }

  /**
   * Fire-and-forget detection. Called every frame from the render loop,
   * but only actually starts a detection every FACEAPI_INTERVAL frames.
   * Results are stored asynchronously and read via getResult().
   */
  detect(video) {
    if (!this.ready || this.paused || this.detecting) return;
    if (video.readyState < 2) return;

    this.frameCount++;
    if (this.frameCount % FACEAPI_INTERVAL !== 0) return;

    this.detecting = true;
    const faceapi = window.faceapi;
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: 0.3
    });

    faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .then(detection => {
        this.detecting = false;
        if (detection) {
          this.lastResult = {
            age: detection.age,
            gender: detection.gender,
            genderProbability: detection.genderProbability,
            expressions: detection.expressions,
            score: detection.detection.score,
            timestamp: performance.now()
          };
        }
      })
      .catch(() => {
        this.detecting = false;
      });
  }

  getResult() {
    return this.lastResult;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}

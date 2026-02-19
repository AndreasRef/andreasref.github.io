import { ALPHA_FAST, ALPHA_MEDIUM, ALPHA_SLOW, ALPHA_CLASSIFICATION } from '../utils/constants.js';
import { SmootherBank } from './smoother.js';

/**
 * Computes derived metrics from FaceLandmarker results (landmarks + blendshapes)
 * and face-api.js results (age, gender, expressions).
 * All values are smoothed through EMA with appropriate time constants.
 */
export class ComputedMetrics {
  constructor() {
    this.smoother = new SmootherBank();
    this.bs = {};                    // blendshape map {name: score}
    this.prevLandmarks = null;
    this.blinkTimestamps = [];
    this.blinkCount = 0;             // running total blink count
    this.smileCount = 0;             // running total smile count
    this._smiling = false;           // currently in a smile?
    this.microMovementBuf = [];
    this._lastBlinkT = 0;
    this.faceDetected = false;
    this._lastFaceApiTimestamp = 0;

    // Raw face-api targets — re-applied every frame so EMA runs at frame rate
    this._faceApiTargets = null; // { age, maleness, conf, expressions }
    this.faceApiHasResult = false; // true after first face-api classification

    // --- Fast metrics (expressions, eye/mouth) ---
    this.smoother.register('eyeOpenL',    ALPHA_FAST, 1.0);
    this.smoother.register('eyeOpenR',    ALPHA_FAST, 1.0);
    this.smoother.register('mouthOpen',   ALPHA_FAST, 0);
    this.smoother.register('lipPress',    ALPHA_FAST, 0);
    this.smoother.register('smileL',      ALPHA_FAST, 0);
    this.smoother.register('smileR',      ALPHA_FAST, 0);
    this.smoother.register('browInnerUp', ALPHA_FAST, 0);
    this.smoother.register('browDownL',   ALPHA_FAST, 0);
    this.smoother.register('browDownR',   ALPHA_FAST, 0);
    this.smoother.register('cheekPuff',   ALPHA_FAST, 0);
    this.smoother.register('jawOpen',     ALPHA_FAST, 0);
    this.smoother.register('eyeSquintL',  ALPHA_FAST, 0);
    this.smoother.register('eyeSquintR',  ALPHA_FAST, 0);
    this.smoother.register('mouthFunnel', ALPHA_FAST, 0);
    this.smoother.register('mouthPucker', ALPHA_FAST, 0);

    // --- Medium metrics (head pose, distance) ---
    this.smoother.register('yaw',   ALPHA_MEDIUM, 0);
    this.smoother.register('pitch', ALPHA_MEDIUM, 0);
    this.smoother.register('roll',  ALPHA_MEDIUM, 0);
    this.smoother.register('ipd',   ALPHA_MEDIUM, 0.06);

    // --- Slow / derived metrics ---
    this.smoother.register('blinkRate',      ALPHA_SLOW, 15);
    this.smoother.register('symmetry',       ALPHA_SLOW, 1.0);
    this.smoother.register('microMovement',  ALPHA_SLOW, 0);
    this.smoother.register('browAsymmetry',  ALPHA_MEDIUM, 0);

    // --- Classification metrics (face-api.js: age, gender, expressions, score) ---
    this.smoother.register('age',              0.03, 30);
    this.smoother.register('genderMale',       ALPHA_CLASSIFICATION, 0.5);
    this.smoother.register('faceapiScore',     ALPHA_CLASSIFICATION, 0);
    this.smoother.register('exprNeutral',      1.0, 1.0);
    this.smoother.register('exprHappy',        1.0, 0);
    this.smoother.register('exprSad',          1.0, 0);
    this.smoother.register('exprAngry',        1.0, 0);
    this.smoother.register('exprSurprised',    1.0, 0);
    this.smoother.register('exprFearful',      1.0, 0);
    this.smoother.register('exprDisgusted',    1.0, 0);
  }

  /**
   * Update all metrics from a FaceLandmarker result.
   */
  update(faceResults, timestamp) {
    const landmarks  = faceResults.faceLandmarks?.[0];
    const categories = faceResults.faceBlendshapes?.[0]?.categories;

    if (!landmarks || !categories) {
      this.faceDetected = false;
      this.smoother.driftAll();
      return;
    }

    this.faceDetected = true;
    const conf = 1.0;

    // Build blendshape lookup
    this.bs = {};
    for (const c of categories) this.bs[c.categoryName] = c.score;

    // ---- Key face landmarks (used by multiple sections below) ----
    const lEye  = landmarks[33];   // left eye outer corner
    const rEye  = landmarks[263];  // right eye outer corner
    const nose  = landmarks[1];    // nose tip
    const chin  = landmarks[152];
    const fhead = landmarks[10];
    const faceW  = Math.abs(rEye.x - lEye.x) || 0.001;
    const faceH  = Math.abs(chin.y - fhead.y) || 0.001;

    // ---- Eye openness (inverted blink score) ----
    const eyeOpenL = 1 - (this.bs.eyeBlinkLeft  || 0);
    const eyeOpenR = 1 - (this.bs.eyeBlinkRight || 0);
    this.smoother.update('eyeOpenL', eyeOpenL, conf);
    this.smoother.update('eyeOpenR', eyeOpenR, conf);

    // ---- Blink detection ----
    if (eyeOpenL < 0.5 || eyeOpenR < 0.5) {
      if (timestamp - this._lastBlinkT > 200) {
        this.blinkTimestamps.push(timestamp);
        this.blinkCount++;
        this._lastBlinkT = timestamp;
      }
    }
    const cutoff = timestamp - 60000;
    this.blinkTimestamps = this.blinkTimestamps.filter(t => t > cutoff);
    this.smoother.update('blinkRate', this.blinkTimestamps.length, conf);

    // ---- Mouth / Jaw (landmark-based for reliable measurement) ----
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const mouthDist = Math.abs(lowerLip.y - upperLip.y);
    const mouthNorm = Math.min(1.0, (mouthDist / faceH) * 6.5);
    this.smoother.update('mouthOpen',   mouthNorm, conf);
    this.smoother.update('jawOpen',     this.bs.jawOpen         || 0, conf);
    this.smoother.update('lipPress',    ((this.bs.mouthPressLeft || 0) + (this.bs.mouthPressRight || 0)) / 2, conf);
    this.smoother.update('mouthFunnel', this.bs.mouthFunnel     || 0, conf);
    this.smoother.update('mouthPucker', this.bs.mouthPucker     || 0, conf);

    // ---- Smile ----
    this.smoother.update('smileL', this.bs.mouthSmileLeft  || 0, conf);
    this.smoother.update('smileR', this.bs.mouthSmileRight || 0, conf);

    // ---- Smile count (hysteresis: enter at 0.4, exit at 0.15) ----
    const smileAvg = ((this.bs.mouthSmileLeft || 0) + (this.bs.mouthSmileRight || 0)) / 2;
    if (!this._smiling && smileAvg > 0.4) {
      this._smiling = true;
      this.smileCount++;
    } else if (this._smiling && smileAvg < 0.15) {
      this._smiling = false;
    }

    // ---- Eyebrows ----
    this.smoother.update('browInnerUp', this.bs.browInnerUp   || 0, conf);
    this.smoother.update('browDownL',   this.bs.browDownLeft  || 0, conf);
    this.smoother.update('browDownR',   this.bs.browDownRight || 0, conf);
    this.smoother.update('browAsymmetry',
      Math.abs((this.bs.browDownLeft || 0) - (this.bs.browDownRight || 0)), conf);

    // ---- Cheek / Squint ----
    this.smoother.update('cheekPuff',  this.bs.cheekPuff      || 0, conf);
    this.smoother.update('eyeSquintL', this.bs.eyeSquintLeft  || 0, conf);
    this.smoother.update('eyeSquintR', this.bs.eyeSquintRight || 0, conf);

    // ---- Head pose from landmarks ----
    // Roll: tilt of the eye-line
    const roll = Math.atan2(rEye.y - lEye.y, rEye.x - lEye.x) * (180 / Math.PI);
    this.smoother.update('roll', roll, conf);

    // Yaw: nose offset from face center
    const faceCX = (lEye.x + rEye.x) / 2;
    this.smoother.update('yaw', ((nose.x - faceCX) / faceW) * 90, conf);

    // Pitch: nose offset vertically
    const faceCY = (fhead.y + chin.y) / 2;
    this.smoother.update('pitch', ((nose.y - faceCY) / faceH) * 90, conf);

    // ---- Inter-pupil distance (iris landmarks 468, 473) ----
    if (landmarks.length > 473) {
      const lIris = landmarks[468];
      const rIris = landmarks[473];
      const ipd = Math.hypot(rIris.x - lIris.x, rIris.y - lIris.y);
      this.smoother.update('ipd', ipd, conf);
    }

    // ---- Facial symmetry (blendshape-based, rotation-invariant) ----
    const blendshapePairs = [
      ['eyeBlinkLeft', 'eyeBlinkRight'],
      ['mouthSmileLeft', 'mouthSmileRight'],
      ['eyeSquintLeft', 'eyeSquintRight'],
      ['browDownLeft', 'browDownRight'],
      ['cheekSquintLeft', 'cheekSquintRight'],
      ['mouthPressLeft', 'mouthPressRight'],
    ];
    let asymSum = 0;
    for (const [l, r] of blendshapePairs) {
      asymSum += Math.abs((this.bs[l] || 0) - (this.bs[r] || 0));
    }
    this.smoother.update('symmetry', 1 - asymSum / blendshapePairs.length, conf);

    // ---- Micro-movement (landmark jitter) ----
    if (this.prevLandmarks) {
      let total = 0;
      const len = Math.min(landmarks.length, this.prevLandmarks.length);
      for (let i = 0; i < len; i++) {
        const dx = landmarks[i].x - this.prevLandmarks[i].x;
        const dy = landmarks[i].y - this.prevLandmarks[i].y;
        total += dx * dx + dy * dy;
      }
      this.microMovementBuf.push(Math.sqrt(total / len));
      if (this.microMovementBuf.length > 30) this.microMovementBuf.shift();
      const avg = this.microMovementBuf.reduce((a, b) => a + b, 0) / this.microMovementBuf.length;
      this.smoother.update('microMovement', avg * 1000, conf);
    }
    this.prevLandmarks = landmarks.map(l => ({ x: l.x, y: l.y }));

    // Re-apply face-api targets every frame so age/gender/expressions
    // glide at the same rate as MediaPipe metrics
    this._smoothFaceApiTargets();
  }

  /**
   * Update classification targets from a face-api.js result.
   * Stores raw targets; actual EMA smoothing happens every frame in update().
   */
  updateFaceApi(faceApiResult) {
    if (!faceApiResult) return;
    if (faceApiResult.timestamp === this._lastFaceApiTimestamp) return;
    this._lastFaceApiTimestamp = faceApiResult.timestamp;

    const conf = faceApiResult.score || 0.8;
    const maleness = faceApiResult.gender === 'male'
      ? faceApiResult.genderProbability
      : 1 - faceApiResult.genderProbability;

    this._faceApiTargets = {
      age: faceApiResult.age,
      maleness,
      conf,
      score: faceApiResult.score || 0,
      expressions: faceApiResult.expressions || null,
    };
    this.faceApiHasResult = true;
  }

  /**
   * Re-apply face-api targets through EMA every frame so classification
   * metrics glide at the same rate as MediaPipe metrics.
   */
  _smoothFaceApiTargets() {
    const t = this._faceApiTargets;
    if (!t) return;

    this.smoother.update('faceapiScore', t.score, t.conf);
    this.smoother.update('age', t.age, t.conf);
    this.smoother.update('genderMale', t.maleness, t.conf);

    if (t.expressions) {
      const e = t.expressions;
      this.smoother.update('exprNeutral',   e.neutral   || 0, t.conf);
      this.smoother.update('exprHappy',     e.happy     || 0, t.conf);
      this.smoother.update('exprSad',       e.sad       || 0, t.conf);
      this.smoother.update('exprAngry',     e.angry     || 0, t.conf);
      this.smoother.update('exprSurprised', e.surprised || 0, t.conf);
      this.smoother.update('exprFearful',   e.fearful   || 0, t.conf);
      this.smoother.update('exprDisgusted', e.disgusted || 0, t.conf);
    }
  }

  getSmoothedValues() {
    const vals = this.smoother.getAll();
    vals.blinkCount = this.blinkCount;
    vals.smileCount = this.smileCount;
    return vals;
  }
}

/**
 * Fake data streams that feel coherent with real metrics.
 * Heart rate correlates with movement, attractiveness shifts with angle.
 * All numeric values use multi-sine organic drift — never random jitter.
 */

export class FakeStreams {
  constructor() {
    // Heart rate state
    this.baseHeartRate = 68 + Math.random() * 10; // 68-78 bpm baseline
    this.heartRate = this.baseHeartRate;

    // Breathing rate
    this.baseBreathRate = 13 + Math.random() * 3; // 13-16 /min
    this.breathRate = this.baseBreathRate;

    // CelebA-style attributes
    this.attractiveness = 0.5 + Math.random() * 0.2;
    this.bagsUnderEyes = 0.2 + Math.random() * 0.3;
    this.paleSkin = 0.3 + Math.random() * 0.3;

    // Tracking confidence (exposed for drift mode visual)
    this.trackingConfidence = 1.0;

    // Internal state for organic variation
    this._initialHR = this.baseHeartRate;
  }

  /**
   * Update all fake streams. Call every frame.
   * @param {number} timestamp - rAF timestamp
   * @param {Object} realMetrics - smoothed metrics from ComputedMetrics
   * @param {boolean} faceDetected - whether face is currently tracked
   * @returns {Object} all fake values
   */
  update(timestamp, realMetrics, faceDetected) {
    const t = timestamp / 1000;
    const out = {};

    // --- Tracking confidence ---
    const confTarget = faceDetected ? 1.0 : 0;
    this.trackingConfidence += 0.02 * (confTarget - this.trackingConfidence);
    out.trackingConfidence = this.trackingConfidence;

    // --- Heart rate (correlated with micro-movement) ---
    const movement = realMetrics?.microMovement || 0;
    const hrBump = Math.min(20, movement * 4); // movement pushes HR up
    const hrTarget = this.baseHeartRate + hrBump
      + Math.sin(t * 0.08) * 3     // slow respiratory sinus arrhythmia
      + Math.sin(t * 0.31) * 1.5;  // secondary drift
    this.heartRate += 0.03 * (hrTarget - this.heartRate);
    out.heartRate = this.heartRate;
    out.hrDelta = this.heartRate - this._initialHR;

    // --- Breathing rate (slow drift, slight correlation with movement) ---
    const brTarget = this.baseBreathRate
      + Math.sin(t * 0.05) * 1.5
      + Math.sin(t * 0.17) * 0.8
      + Math.min(3, movement * 0.5);
    this.breathRate += 0.02 * (brTarget - this.breathRate);
    out.breathRate = this.breathRate;

    // --- CelebA-style attractiveness (shifts with head angle) ---
    const yaw = Math.abs(realMetrics?.yaw || 0);
    const pitch = Math.abs(realMetrics?.pitch || 0);
    // Slightly higher when facing forward (flattering angle)
    const anglePenalty = (yaw / 45) * 0.1 + (pitch / 30) * 0.05;
    out.attractiveness = clamp(
      this.attractiveness - anglePenalty
      + Math.sin(t * 0.11) * 0.04
      + Math.sin(t * 0.29) * 0.03
    );

    // --- Other CelebA attributes ---
    out.bagsUnderEyes = clamp(this.bagsUnderEyes + Math.sin(t * 0.07) * 0.05);
    out.paleSkin = clamp(this.paleSkin + Math.sin(t * 0.09) * 0.04);

    return out;
  }

  /**
   * Reset for new person.
   */
  reset() {
    this.baseHeartRate = 68 + Math.random() * 10;
    this.heartRate = this.baseHeartRate;
    this._initialHR = this.baseHeartRate;
    this.baseBreathRate = 13 + Math.random() * 3;
    this.breathRate = this.baseBreathRate;
    this.attractiveness = 0.5 + Math.random() * 0.2;
    this.trackingConfidence = 1.0;
  }
}

function clamp(v) { return Math.max(0, Math.min(1, v)); }

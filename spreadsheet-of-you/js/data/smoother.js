import { DRIFT_RATE, DRIFT_JITTER, CONFIDENCE_THRESHOLD } from '../utils/constants.js';

/**
 * Exponential Moving Average with drift mode.
 * When confidence drops below threshold, value drifts toward neutral
 * with small random perturbation instead of freezing.
 */
export class EMA {
  constructor(alpha, neutralValue = 0) {
    this.alpha = alpha;
    this.value = null;
    this.neutralValue = neutralValue;
    this.drifting = false;
  }

  update(rawValue, confidence = 1.0) {
    if (confidence > CONFIDENCE_THRESHOLD && rawValue != null) {
      this.drifting = false;
      if (this.value === null) {
        this.value = rawValue;
      } else {
        const effectiveAlpha = this.alpha * confidence;
        this.value += effectiveAlpha * (rawValue - this.value);
      }
    } else {
      // Drift mode
      this.drifting = true;
      if (this.value === null) {
        this.value = this.neutralValue;
      } else {
        this.value += (this.neutralValue - this.value) * DRIFT_RATE;
        this.value += (Math.random() - 0.5) * DRIFT_JITTER;
      }
    }
    return this.value;
  }

  reset() {
    this.value = null;
    this.drifting = false;
  }
}

/**
 * Manages a bank of named EMA smoothers.
 */
export class SmootherBank {
  constructor() {
    this.smoothers = new Map();
  }

  register(name, alpha, neutralValue = 0) {
    this.smoothers.set(name, new EMA(alpha, neutralValue));
  }

  update(name, rawValue, confidence = 1.0) {
    const s = this.smoothers.get(name);
    if (!s) return rawValue;
    return s.update(rawValue, confidence);
  }

  driftAll() {
    for (const s of this.smoothers.values()) {
      s.update(null, 0);
    }
  }

  get(name) {
    return this.smoothers.get(name)?.value;
  }

  getAll() {
    const result = {};
    for (const [name, s] of this.smoothers) {
      if (s.value !== null) result[name] = s.value;
    }
    return result;
  }
}

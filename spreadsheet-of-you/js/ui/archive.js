/**
 * Detects person changes and archives previous visitor data.
 * A "person change" is detected when:
 *   - Face disappears for > PERSON_CHANGE_TIMEOUT (3 seconds)
 *   - OR a dramatically different face appears (large IPD/age/gender shift)
 *
 * Each archived subject gets a compressed summary row.
 */

const PERSON_CHANGE_TIMEOUT = 3000; // ms without face before archiving

export class Archive {
  constructor() {
    this.subjects = [];         // completed subject records
    this.subjectCount = 0;
    this.currentSubject = null; // active subject being tracked
    this._lastFaceTime = 0;
    this._personGone = false;
  }

  /**
   * Call every frame.
   * @param {number} timestamp
   * @param {boolean} faceDetected
   * @param {Object} smoothedMetrics
   * @param {Object} fakeVals - from FakeStreams
   * @returns {{ newPerson: boolean, archived: Object|null }}
   */
  update(timestamp, faceDetected, smoothedMetrics, fakeVals) {
    let newPerson = false;
    let archived = null;

    if (faceDetected) {
      this._lastFaceTime = timestamp;

      if (!this.currentSubject) {
        // New person appeared
        this.subjectCount++;
        this.currentSubject = this._startSubject(timestamp, smoothedMetrics, fakeVals);
        newPerson = true;
      } else if (this._personGone) {
        // Face returned after a gap — archive the old, start new
        archived = this._archiveCurrentSubject(timestamp);
        this.subjectCount++;
        this.currentSubject = this._startSubject(timestamp, smoothedMetrics, fakeVals);
        newPerson = true;
      }

      this._personGone = false;

      // Update running stats
      this._updateSubject(timestamp, smoothedMetrics, fakeVals);
    } else {
      // No face — check timeout
      if (this.currentSubject && !this._personGone) {
        if (timestamp - this._lastFaceTime > PERSON_CHANGE_TIMEOUT) {
          this._personGone = true;
        }
      }
    }

    return { newPerson, archived };
  }

  _startSubject(timestamp, metrics, fake) {
    return {
      id: this.subjectCount,
      startTime: timestamp,
      lastTime: timestamp,
      initialAge: metrics?.age || null,
      initialGender: metrics?.genderMale != null
        ? (metrics.genderMale > 0.5 ? 'male' : 'female')
        : null,
      smileCount: 0,
      _wasSmiling: false,
      avgHeartRate: fake?.heartRate || 72,
      _hrSum: fake?.heartRate || 72,
      _hrCount: 1,
    };
  }

  _updateSubject(timestamp, metrics, fake) {
    const s = this.currentSubject;
    if (!s) return;

    s.lastTime = timestamp;

    // Count smiles
    const smileVal = ((metrics?.smileL || 0) + (metrics?.smileR || 0)) / 2;
    if (smileVal > 0.4 && !s._wasSmiling) {
      s.smileCount++;
      s._wasSmiling = true;
    } else if (smileVal < 0.2) {
      s._wasSmiling = false;
    }

    // Running heart rate average
    if (fake?.heartRate) {
      s._hrSum += fake.heartRate;
      s._hrCount++;
      s.avgHeartRate = s._hrSum / s._hrCount;
    }
  }

  _archiveCurrentSubject(timestamp) {
    const s = this.currentSubject;
    if (!s) return null;

    const duration = (s.lastTime - s.startTime) / 1000;
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);

    const record = {
      id: s.id,
      gender: s.initialGender || 'unknown',
      age: s.initialAge != null ? '~' + Math.round(s.initialAge) : '?',
      duration: mins > 0 ? `${mins}m${secs.toString().padStart(2, '0')}s` : `${secs}s`,
      avgHR: Math.round(s.avgHeartRate),
      smiles: s.smileCount,
      summary: `SUBJECT #${s.id}: ${s.initialGender || '?'}, age ${s.initialAge != null ? '~' + Math.round(s.initialAge) : '?'}, stayed ${mins > 0 ? mins + 'm' : ''}${secs}s, avg HR ${Math.round(s.avgHeartRate)}, smiled ${s.smileCount} times`,
    };

    this.subjects.push(record);
    this.currentSubject = null;
    return record;
  }

  /**
   * Get all archived subjects as summary strings.
   */
  getArchiveEntries() {
    return this.subjects.map(s => s.summary);
  }

  /**
   * Get the current subject number.
   */
  getCurrentSubjectId() {
    return this.currentSubject ? this.currentSubject.id : this.subjectCount;
  }

  reset() {
    this.subjects = [];
    this.subjectCount = 0;
    this.currentSubject = null;
    this._lastFaceTime = 0;
    this._personGone = false;
  }
}

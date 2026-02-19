import { GRID_COLS, GRID_ROWS } from '../utils/constants.js';

// --- 5 right-side metrics (always visible) ---
const METRIC_DEFS = [
  { key: 'gender',     label: 'gender',     fmt: v => String(v) },
  { key: 'yearsLeft',  label: 'years left', fmt: v => String(v) },
  { key: 'income',     label: 'monthly income', fmt: v => String(v) },
  { key: 'mouthOpen',  label: 'yawn',       fmt: v => v.toFixed(2) },
  { key: 'blinkCount', label: 'blinks',     fmt: v => Math.floor(v).toString() },
];

// --- 5 left-side demographic cells ---
const DEMO_DEFS = [
  { key: 'name',       label: 'likely name',     fmt: v => String(v) },
  { key: 'age',        label: 'age',             fmt: v => v.toFixed(1) },
  { key: 'expression', label: 'expression',      fmt: v => String(v) },
  { key: 'symmetry',   label: 'symmetry',        fmt: v => v.toFixed(2) },
  { key: 'smileCount', label: 'smiles',           fmt: v => Math.floor(v).toString() },
];

// Expression key → display label mapping
const EXPR_MAP = {
  exprNeutral: 'neutral', exprHappy: 'happy', exprSad: 'sad',
  exprAngry: 'angry', exprSurprised: 'surprised',
  exprFearful: 'fearful', exprDisgusted: 'disgusted',
};

// --- Layout constants ---
const NUM_ENTRIES   = 5;
const ROW_PADDING   = 1;   // top/bottom padding rows per entry
const MIN_BLOCK_COLS = 8;  // minimum block width
const PERSON_GAP    = 2;   // columns gap between person edge and block

// --- EMA smoothing for person edges ---
const EMA_ALPHA = 0.12;
const EMA_DRIFT_ALPHA = 0.03;

// --- Default fallback ---
const DEFAULT_RIGHT_START = GRID_COLS - MIN_BLOCK_COLS;
const DEFAULT_LEFT_END = MIN_BLOCK_COLS;

/**
 * Produces "merged cell" regions: 5 right-side metrics + 5 left-side demographics.
 */
export class CellDataMapper {
  constructor() {
    this.mergedCells = [];

    // Smoothed person edge tracking
    this.smoothPersonRight = DEFAULT_RIGHT_START - PERSON_GAP;
    this.smoothPersonLeft = DEFAULT_LEFT_END + PERSON_GAP;
    this._personEverDetected = false;
  }

  /**
   * Recomputes merged cell data every frame.
   */
  update(metrics, _lm, _crop, segMask, _frame, _imageData, timestamp, _fakeVals, _mockVals, demographics) {
    this.mergedCells = [];

    const m = metrics || {};

    // --- Detect person right edge from segmentation mask ---
    const person = this._detectPerson(segMask);
    const pos = this._computeBlockPosition(person);

    // Vertical layout
    const bandHeight = Math.floor(GRID_ROWS / NUM_ENTRIES);

    // Build derived values
    const vals = this._buildValues(m, demographics);

    // --- Right block: 5 metric cells (always visible) ---
    if (pos.rightCols >= MIN_BLOCK_COLS) {
      METRIC_DEFS.forEach((def, i) => {
        const v = vals[def.key];
        const row = i * bandHeight + ROW_PADDING;
        const spanRows = bandHeight - ROW_PADDING * 2;

        this.mergedCells.push({
          col: pos.rightStart,
          row,
          spanCols: pos.rightCols,
          spanRows,
          label: def.label,
          value: v != null ? def.fmt(v) : '\u2014',
        });
      });
    }

    // --- Left block: 5 demographic cells (always visible) ---
    if (pos.leftCols >= MIN_BLOCK_COLS) {
      const demoVals = this._buildDemoValues(m, demographics);
      DEMO_DEFS.forEach((def, i) => {
        const v = demoVals[def.key];
        const row = i * bandHeight + ROW_PADDING;
        const spanRows = bandHeight - ROW_PADDING * 2;

        this.mergedCells.push({
          col: 0,
          row,
          spanCols: pos.leftCols,
          spanRows,
          label: def.label,
          value: v != null ? def.fmt(v) : '\u2014',
        });
      });
    }

    return null;
  }

  /**
   * Detect person left and right edges from seg mask.
   */
  _detectPerson(segMask) {
    if (!segMask) return null;

    let minCol = GRID_COLS;
    let maxCol = -1;

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (segMask[row * GRID_COLS + col] !== 0) {
          if (col > maxCol) maxCol = col;
          if (col < minCol) minCol = col;
        }
      }
    }

    if (maxCol < 0) return null;

    return { personRight: maxCol, personLeft: minCol };
  }

  /**
   * Compute left and right block positions from person edges.
   */
  _computeBlockPosition(person) {
    if (person) {
      if (!this._personEverDetected) {
        // Snap to first real detection — no slow EMA from default
        this.smoothPersonRight = person.personRight;
        this.smoothPersonLeft = person.personLeft;
        this._personEverDetected = true;
      } else {
        this.smoothPersonRight = ema(this.smoothPersonRight, person.personRight, EMA_ALPHA);
        this.smoothPersonLeft = ema(this.smoothPersonLeft, person.personLeft, EMA_ALPHA);
      }
    } else {
      const defaultRight = DEFAULT_RIGHT_START - PERSON_GAP;
      const defaultLeft = DEFAULT_LEFT_END + PERSON_GAP;
      this.smoothPersonRight = ema(this.smoothPersonRight, defaultRight, EMA_DRIFT_ALPHA);
      this.smoothPersonLeft = ema(this.smoothPersonLeft, defaultLeft, EMA_DRIFT_ALPHA);
    }

    // Right block
    const maxPersonRight = GRID_COLS - MIN_BLOCK_COLS - PERSON_GAP;
    const pRight = Math.min(maxPersonRight, Math.round(this.smoothPersonRight));
    const rightStart = pRight + PERSON_GAP;
    const rightCols = GRID_COLS - rightStart;

    // Left block: col 0 to personLeft - gap
    const minPersonLeft = MIN_BLOCK_COLS + PERSON_GAP;
    const pLeft = Math.max(minPersonLeft, Math.round(this.smoothPersonLeft));
    const leftCols = pLeft - PERSON_GAP;

    return { rightStart, rightCols, leftCols };
  }

  /**
   * Build right-side metric values: gender, years left, income, yawn, blinks.
   */
  _buildValues(m, demographics) {
    const vals = {};
    const d = demographics || {};

    // Gender
    if (m.genderMale != null) {
      vals.gender = m.genderMale > 0.5 ? 'male' : 'female';
    } else {
      vals.gender = null;
    }

    vals.yearsLeft = d.yearsLeft || '\u2014';
    vals.income = d.income || '\u2014';
    vals.mouthOpen = m.mouthOpen;
    vals.blinkCount = m.blinkCount;

    return vals;
  }

  /**
   * Build left-side demographic values: name, age, expression, symmetry, smiles.
   */
  _buildDemoValues(m, demographics) {
    const d = demographics || {};

    // Dominant expression
    let bestScore = -1;
    let bestLabel = null;
    for (const [key, label] of Object.entries(EXPR_MAP)) {
      const val = m[key];
      if (val != null && val > bestScore) {
        bestScore = val;
        bestLabel = label;
      }
    }

    return {
      name: d.name || '\u2014',
      age: m.age != null ? m.age : null,
      expression: bestLabel,
      symmetry: m.symmetry != null ? m.symmetry : null,
      smileCount: m.smileCount != null ? m.smileCount : null,
    };
  }

  getFormulaEntries() {
    return this.mergedCells.map(mc => ({
      label: mc.label,
      value: mc.value,
      cellRef: colToLetter(mc.col) + (mc.row + 1),
    }));
  }
}

function ema(prev, curr, alpha) {
  return prev + alpha * (curr - prev);
}

function colToLetter(n) {
  let s = '';
  n++;
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}

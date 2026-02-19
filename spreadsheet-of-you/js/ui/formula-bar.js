import { FORMULA_CYCLE_SPEED } from '../utils/constants.js';

/**
 * Cycling formula bar — rotates through cell references + metric data.
 * Shows one entry at a time in the existing #cell-name and #formula-input elements.
 */
export class FormulaBar {
  constructor() {
    this.cellNameEl = document.getElementById('cell-name');
    this.formulaEl = document.getElementById('formula-input');
    this.entries = [];
    this.currentIdx = 0;
    this._lastCycle = 0;
  }

  /**
   * Called every frame. Cycles to next entry when FORMULA_CYCLE_SPEED elapses.
   * @param {Array} entries - from CellDataMapper.getFormulaEntries()
   * @param {number} timestamp - rAF timestamp
   */
  update(entries, timestamp) {
    if (entries && entries.length) {
      this.entries = entries;
    }
    if (!this.entries.length) return;

    if (timestamp - this._lastCycle >= FORMULA_CYCLE_SPEED) {
      this._lastCycle = timestamp;
      this.currentIdx = (this.currentIdx + 1) % this.entries.length;
      this.display(this.entries[this.currentIdx]);
    }
  }

  display(entry) {
    if (!entry) return;

    this.cellNameEl.textContent = entry.cellRef || 'A1';
    this.formulaEl.textContent = '=' + entry.label + '(' + entry.value + ')';
  }
}

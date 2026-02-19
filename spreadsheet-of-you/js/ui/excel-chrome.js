import { GRID_COLS, GRID_ROWS, ROW_HEADER_WIDTH, COL_HEADER_HEIGHT } from '../utils/constants.js';

export class ExcelChrome {
  constructor() {
    this.colHeadersEl = document.getElementById('col-headers');
    this.rowHeadersEl = document.getElementById('row-headers');
    this.cornerEl = document.getElementById('corner-cell');
    this.setupFullscreen();
  }

  buildHeaders(cellW, cellH) {
    this.cornerEl.style.width = ROW_HEADER_WIDTH + 'px';
    this.cornerEl.style.height = COL_HEADER_HEIGHT + 'px';

    this.colHeadersEl.innerHTML = '';
    this.colHeadersEl.style.height = COL_HEADER_HEIGHT + 'px';
    for (let col = 0; col < GRID_COLS; col++) {
      const el = document.createElement('div');
      el.className = 'col-header-cell';
      el.textContent = colToLetter(col);
      el.style.width = cellW + 'px';
      el.style.height = COL_HEADER_HEIGHT + 'px';
      el.style.lineHeight = COL_HEADER_HEIGHT + 'px';
      this.colHeadersEl.appendChild(el);
    }

    this.rowHeadersEl.innerHTML = '';
    this.rowHeadersEl.style.width = ROW_HEADER_WIDTH + 'px';
    for (let row = 0; row < GRID_ROWS; row++) {
      const el = document.createElement('div');
      el.className = 'row-header-cell';
      el.textContent = row + 1;
      el.style.width = ROW_HEADER_WIDTH + 'px';
      el.style.height = cellH + 'px';
      el.style.lineHeight = Math.round(cellH) + 'px';
      this.rowHeadersEl.appendChild(el);
    }
  }

  setupFullscreen() {
    const maxBtn = document.querySelector('.win-btn.maximize');
    if (!maxBtn) return;

    maxBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    });

    document.addEventListener('fullscreenchange', () => {
      const win = document.getElementById('excel-window');
      win.classList.toggle('fullscreen', !!document.fullscreenElement);
    });
  }
}

function colToLetter(n) {
  let s = '';
  n++;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

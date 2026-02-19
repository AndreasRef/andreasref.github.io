/**
 * L-shaped data panel: right sidebar + bottom bar.
 * Flat ATTRIBUTE | VALUE list with subtle category tinting:
 *   - blue  (#E8EEF7) = physiological
 *   - yellow (#F7F3E0) = behavioral
 *   - red   (#F7E8E8) = judgmental / problematic classifications
 */

const ROWS = [
  // --- Physiological ---
  { key: 'eyeOpenL',    label: 'eye_open_L',       cat: 'phys', fmt: v => v.toFixed(2) },
  { key: 'eyeOpenR',    label: 'eye_open_R',       cat: 'phys', fmt: v => v.toFixed(2) },
  { key: 'blinkRate',   label: 'blink_rate',       cat: 'phys', fmt: v => v.toFixed(0) + '/min' },
  { key: 'mouthOpen',   label: 'mouth_open',       cat: 'phys', fmt: v => v.toFixed(3) },
  { key: 'lipPress',    label: 'lip_compress',     cat: 'phys', fmt: v => v.toFixed(2) },
  { key: 'jawOpen',     label: 'jaw_open',         cat: 'phys', fmt: v => v.toFixed(2) },
  { key: 'ipd',         label: 'inter_pupil_dist', cat: 'phys', fmt: v => v.toFixed(4) },

  // --- Behavioral ---
  { key: 'yaw',          label: 'head_yaw',         cat: 'behav', fmt: v => v.toFixed(1) + '\u00B0' },
  { key: 'pitch',        label: 'head_pitch',       cat: 'behav', fmt: v => v.toFixed(1) + '\u00B0' },
  { key: 'roll',         label: 'head_roll',        cat: 'behav', fmt: v => v.toFixed(1) + '\u00B0' },
  { key: 'smileL',       label: 'smile_L',          cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'smileR',       label: 'smile_R',          cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'browInnerUp',  label: 'brow_raise',       cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'browAsymmetry',label: 'brow_asymmetry',   cat: 'behav', fmt: v => v.toFixed(3) },
  { key: 'symmetry',     label: 'facial_symmetry',  cat: 'behav', fmt: v => v.toFixed(3) },
  { key: 'microMovement',label: 'micro_movement',   cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'cheekPuff',    label: 'cheek_puff',       cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'eyeSquintL',   label: 'eye_squint_L',     cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'eyeSquintR',   label: 'eye_squint_R',     cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'mouthFunnel',  label: 'mouth_funnel',     cat: 'behav', fmt: v => v.toFixed(2) },
  { key: 'mouthPucker',  label: 'mouth_pucker',     cat: 'behav', fmt: v => v.toFixed(2) },

  // --- Judgmental / classification ---
  { key: 'age',            label: 'est_age',          cat: 'judge', fmt: v => v.toFixed(1) },
  { key: 'genderMale',     label: 'gender_male_prob', cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprNeutral',    label: 'expr_neutral',     cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprHappy',      label: 'expr_happy',       cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprSad',        label: 'expr_sad',         cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprAngry',      label: 'expr_angry',       cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprSurprised',  label: 'expr_surprised',   cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprFearful',    label: 'expr_fearful',     cat: 'judge', fmt: v => v.toFixed(3) },
  { key: 'exprDisgusted',  label: 'expr_disgusted',   cat: 'judge', fmt: v => v.toFixed(3) },
];

export class Sidebar {
  constructor() {
    this.rightEl = document.getElementById('sidebar-right');
    this.bottomEl = document.getElementById('sidebar-bottom');
    this.valueEls = {};
    this._built = false;
  }

  build() {
    if (this._built) return;
    this._built = true;

    // ---- Right sidebar: physiological + behavioral ----
    const rightRows = ROWS.filter(r => r.cat === 'phys' || r.cat === 'behav');
    this.buildPanel(this.rightEl, rightRows);

    // ---- Bottom sidebar: judgmental / classification ----
    const bottomRows = ROWS.filter(r => r.cat === 'judge');
    this.buildPanel(this.bottomEl, bottomRows);
  }

  buildPanel(container, rows) {
    const table = document.createElement('div');
    table.className = 'sidebar-table';

    for (const def of rows) {
      const row = document.createElement('div');
      row.className = `sidebar-row cat-${def.cat}`;

      const attr = document.createElement('span');
      attr.className = 'sidebar-attr';
      attr.textContent = def.label;

      const val = document.createElement('span');
      val.className = 'sidebar-val';
      val.textContent = '\u2014';

      row.appendChild(attr);
      row.appendChild(val);
      table.appendChild(row);

      this.valueEls[def.key] = val;
    }

    container.appendChild(table);
  }

  /** Update all displayed values from smoothed metrics. */
  update(metrics) {
    if (!metrics) return;

    for (const def of ROWS) {
      const v = metrics[def.key];
      const el = this.valueEls[def.key];
      if (!el) continue;
      el.textContent = v != null ? def.fmt(v) : '\u2014';
    }
  }
}

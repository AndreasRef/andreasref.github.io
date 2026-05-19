import {
  GRID_COLS,
  GRID_ROWS,
  ROW_HEADER_WIDTH,
  COL_HEADER_HEIGHT,
} from "./utils/constants.js";
import { Camera } from "./camera.js";
import { GridRenderer } from "./portrait/grid-renderer.js";
import { CellDataMapper } from "./portrait/cell-data-mapper.js";
import { ExcelChrome } from "./ui/excel-chrome.js";
import { FormulaBar } from "./ui/formula-bar.js";
import { TrackerManager } from "./tracking/tracker-manager.js";
import { ComputedMetrics } from "./data/computed-metrics.js";
import { FakeStreams } from "./data/fake-streams.js";
import { DemographicLookup } from "./data/demographic-lookup.js";
import { Archive } from "./ui/archive.js";

// ── Loading overlay i18n ────────────────────────────────────────────────
const LOADING_I18N = {
  en: {
    opening: "Opening: spreadsheet-of-you.xlsx",
    securityTitle: "Security Warning",
    securityBody:
      "This workbook contains macros that access your camera and analyze your appearance in real time.",
    enableMacros: "Enable Macros",
    cancel: "Cancel",
    languageLabel: "Language:",
    detail: {
      initFace: "Initializing face detection...",
      initSeg: "Initializing segmentation...",
      loadClass: "Loading classification models...",
      ready: "Ready",
    },
  },
  da: {
    opening: "Åbner: spreadsheet-of-you.xlsx",
    securityTitle: "Sikkerhedsadvarsel",
    securityBody:
      "Denne projektmappe indeholder makroer, der får adgang til dit kamera og analyserer dit udseende i realtid.",
    enableMacros: "Aktivér makroer",
    cancel: "Annullér",
    languageLabel: "Sprog:",
    detail: {
      initFace: "Initialiserer ansigtsgenkendelse...",
      initSeg: "Initialiserer segmentering...",
      loadClass: "Indlæser klassifikationsmodeller...",
      ready: "Klar",
    },
  },
};

const DETAIL_KEY_BY_MILESTONE = {
  0: "initFace",
  1: "initSeg",
  2: "loadClass",
  3: "ready",
};

class App {
  constructor() {
    this.camera = new Camera();
    this.canvas = document.getElementById("portrait");
    this.renderer = new GridRenderer(this.canvas);
    this.cellMapper = new CellDataMapper();
    this.chrome = new ExcelChrome();
    this.formulaBar = new FormulaBar();
    this.trackers = new TrackerManager();
    this.metrics = new ComputedMetrics();
    this.fakeStreams = new FakeStreams();
    this.demographics = new DemographicLookup();
    this.mockGen = new MockDataGenerator();
    this.archive = new Archive();
    this.running = false;
    this.lastTimestamp = 0;
    this.frameCount = 0;
    this.segMask = null;
    this.lastFaceLandmarks = null;
    this.cameraEnabled = true;
    this.segmentationEnabled = true;

    // Loading state
    this._loadingOverlay = null;
    this._loadingDismissed = false;
    this._loadingProgress = 0; // 0-3 milestones
    this._loadingComplete = false;
    this._dataHoldUntil = Infinity; // suppress data+seg until after reveal delay
  }

  async init() {
    this.calculateLayout();
    window.addEventListener("resize", () => this.calculateLayout());
    document.addEventListener("fullscreenchange", () => {
      setTimeout(() => this.calculateLayout(), 100);
    });

    try {
      await this.camera.start();
    } catch (err) {
      document.getElementById("viewport").innerHTML =
        '<div style="color:#333;padding:40px;text-align:center;font-family:Verdana,sans-serif;">' +
        '<p style="font-size:16px;margin-bottom:8px;">Camera access required</p>' +
        '<p style="font-size:12px;color:#666;">Please allow camera permissions and reload.</p></div>';
      return;
    }

    this._createLoadingOverlay();
    this.initTrackers();
    this.demographics
      .init()
      .catch((err) => console.warn("[Demographics] CSV load failed:", err));
    this.setupToggles();

    this.running = true;
    requestAnimationFrame((t) => this.loop(t));
  }

  _createLoadingOverlay() {
    // Hide the entire Excel window until user clicks Enable Macros
    document.getElementById("excel-window").style.display = "none";

    if (!window.__LANG) window.__LANG = "en";
    this._lastDetailKey = "initFace";

    const el = document.createElement("div");
    el.id = "loading-overlay";
    el.style.cssText =
      "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
      "background:#3A6EA5;z-index:1000;font-family:Verdana,Tahoma,sans-serif;font-size:11px;color:#000;";

    // Windows XP-style dialog box + bottom-right language toggle
    el.innerHTML = `
      <div id="loading-dialog" style="
        width:380px;
        background:#ECE9D8;
        border:2px solid;
        border-color:#FFF #808080 #808080 #FFF;
        box-shadow:2px 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          height:22px;
          background:linear-gradient(180deg, #0A246A 0%, #3168D5 8%, #4E91E2 40%, #3168D5 88%, #0A246A 100%);
          display:flex;align-items:center;padding:0 5px;
          font-size:11px;color:#FFF;font-weight:bold;
        ">
          <span style="margin-right:4px;width:14px;height:14px;background:#217346;border:1px solid #185C37;
            border-radius:1px;font-size:8px;display:flex;align-items:center;justify-content:center;
            font-family:Arial;font-weight:bold;color:#FFF;">X</span>
          Microsoft Excel
        </div>
        <div id="loading-body" style="padding:16px 20px 18px;"></div>
      </div>
      <div id="loading-lang" style="
        position:absolute;bottom:14px;right:14px;
        display:flex;align-items:center;gap:6px;
        background:#ECE9D8;
        border:2px solid;border-color:#FFF #808080 #808080 #FFF;
        padding:4px 8px;font-size:11px;color:#000;
        font-family:Verdana,Tahoma,sans-serif;
      ">
        <span id="lang-label">Language:</span>
        <button id="btn-lang-en" data-lang="en" style="
          font-family:inherit;font-size:11px;background:transparent;
          border:none;padding:1px 4px;cursor:pointer;color:#000;
        ">English</button>
        <span style="color:#808080;">|</span>
        <button id="btn-lang-da" data-lang="da" style="
          font-family:inherit;font-size:11px;background:transparent;
          border:none;padding:1px 4px;cursor:pointer;color:#000;
        ">Dansk</button>
      </div>
    `;
    document.body.appendChild(el);
    this._loadingOverlay = el;

    el.querySelectorAll("#loading-lang button").forEach((b) => {
      b.addEventListener("click", () => this._setLanguage(b.dataset.lang));
    });

    this._renderLoadingBody();
    this._updateLangToggleStyles();
  }

  _setLanguage(lang) {
    if (lang !== "en" && lang !== "da") return;
    if (window.__LANG === lang) return;
    window.__LANG = lang;
    this._updateLangToggleStyles();
    if (this._loadingComplete) {
      this._renderSecurityBody();
    } else {
      this._renderLoadingBody();
    }
  }

  _updateLangToggleStyles() {
    const lang = window.__LANG === "da" ? "da" : "en";
    const labelEl = document.getElementById("lang-label");
    if (labelEl) labelEl.textContent = LOADING_I18N[lang].languageLabel;
    document.querySelectorAll("#loading-lang button").forEach((b) => {
      const active = b.dataset.lang === lang;
      b.style.fontWeight = active ? "bold" : "normal";
      b.style.textDecoration = active ? "underline" : "none";
    });
  }

  _renderLoadingBody() {
    const body = document.getElementById("loading-body");
    if (!body) return;
    const txt = LOADING_I18N[window.__LANG === "da" ? "da" : "en"];
    const pct = Math.round((this._loadingProgress / 3) * 100);
    const detail = txt.detail[this._lastDetailKey] || "";
    body.innerHTML = `
      <div id="loading-status" style="margin-bottom:10px;font-size:11px;">
        ${txt.opening}
      </div>
      <div style="
        border:1px solid;border-color:#808080 #FFF #FFF #808080;
        background:#FFF;height:18px;padding:2px;
      ">
        <div id="loading-bar" style="
          height:100%;width:${pct}%;
          background:linear-gradient(90deg, #3168D5 0%, #4E91E2 50%, #3168D5 100%);
          background-size:30px 100%;
          transition:width 0.4s ease;
        "></div>
      </div>
      <div id="loading-detail" style="margin-top:6px;font-size:10px;color:#555;">
        ${detail}
      </div>
    `;
  }

  _updateLoadingProgress(milestone, detail) {
    this._loadingProgress = milestone;
    this._lastDetailKey =
      DETAIL_KEY_BY_MILESTONE[milestone] || this._lastDetailKey;
    const pct = Math.round((milestone / 3) * 100);
    const bar = document.getElementById("loading-bar");
    const detailEl = document.getElementById("loading-detail");
    const txt = LOADING_I18N[window.__LANG === "da" ? "da" : "en"];
    if (bar) bar.style.width = pct + "%";
    if (detailEl)
      detailEl.textContent = txt.detail[this._lastDetailKey] || detail;

    if (milestone >= 3) {
      this._loadingComplete = true;
      this._showSecurityDialog();
    }
  }

  _showSecurityDialog() {
    this._renderSecurityBody();
  }

  _renderSecurityBody() {
    const body = document.getElementById("loading-body");
    if (!body) return;
    const txt = LOADING_I18N[window.__LANG === "da" ? "da" : "en"];

    body.innerHTML = `
      <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
        <span style="font-size:28px;margin-right:10px;line-height:1;color:#D4A017;">&#9888;</span>
        <div>
          <div style="font-weight:bold;margin-bottom:6px;">${txt.securityTitle}</div>
          <div style="font-size:11px;line-height:1.4;">
            ${txt.securityBody}
          </div>
        </div>
      </div>
      <div style="text-align:right;">
        <button id="btn-enable-macros" style="
          min-width:110px;height:24px;
          font-family:Verdana,Tahoma,sans-serif;font-size:11px;
          background:#ECE9D8;
          border:2px solid;border-color:#FFF #808080 #808080 #FFF;
          cursor:pointer;
        ">${txt.enableMacros}</button>
        <button style="
          min-width:80px;height:24px;margin-left:8px;
          font-family:Verdana,Tahoma,sans-serif;font-size:11px;
          background:#ECE9D8;
          border:2px solid;border-color:#FFF #808080 #808080 #FFF;
          cursor:pointer;color:#888;
        " disabled>${txt.cancel}</button>
      </div>
    `;
    const btn = document.getElementById("btn-enable-macros");
    btn.addEventListener("mousedown", () => {
      btn.style.borderColor = "#808080 #FFF #FFF #808080";
    });
    btn.addEventListener("mouseup", () => {
      btn.style.borderColor = "#FFF #808080 #808080 #FFF";
    });
    btn.addEventListener("click", () => this._beginExperience());
  }

  _beginExperience() {
    // Reveal the Excel window
    document.getElementById("excel-window").style.display = "";

    // Try fullscreen
    const target = document.documentElement;
    const requestFs =
      target.requestFullscreen ||
      target.webkitRequestFullscreen ||
      target.msRequestFullscreen;
    if (requestFs) {
      requestFs.call(target).catch(() => {});
    }

    // Recalculate layout, then wait 1.5s before showing data
    this._dismissLoading();
    setTimeout(() => this.calculateLayout(), 100);
    this._dataHoldUntil = performance.now() + 1500;
  }

  _dismissLoading() {
    if (this._loadingDismissed || !this._loadingOverlay) return;
    this._loadingDismissed = true;
    this._loadingOverlay.style.transition = "opacity 0.6s ease";
    this._loadingOverlay.style.opacity = "0";
    setTimeout(() => this._loadingOverlay.remove(), 700);
  }

  setupToggles() {
    const camBtn = document.getElementById("btn-camera");
    const segBtn = document.getElementById("btn-segmentation");

    camBtn.addEventListener("click", () => {
      this.cameraEnabled = !this.cameraEnabled;
      camBtn.classList.toggle("active", this.cameraEnabled);
      if (this.cameraEnabled) {
        this.camera.video.play();
      } else {
        this.camera.video.pause();
      }
    });

    segBtn.addEventListener("click", () => {
      this.segmentationEnabled = !this.segmentationEnabled;
      segBtn.classList.toggle("active", this.segmentationEnabled);
      if (!this.segmentationEnabled) {
        this.segMask = null;
      }
    });
  }

  async initTrackers() {
    try {
      await this.trackers.init((milestone, detail) => {
        this._updateLoadingProgress(milestone, detail);
      });
      console.log("[App] All trackers ready");
    } catch (err) {
      console.warn(
        "[App] Tracker init failed — running without tracking:",
        err,
      );
    }
  }

  calculateLayout() {
    const workspace = document.getElementById("workspace");
    const availW = workspace.clientWidth - ROW_HEADER_WIDTH;
    const availH = workspace.clientHeight - COL_HEADER_HEIGHT;

    if (availW < 1 || availH < 1) return;

    const cellW = availW / GRID_COLS;
    const cellH = availH / GRID_ROWS;

    this.renderer.resize(availW, availH);
    this.chrome.buildHeaders(cellW, cellH);
  }

  loop(timestamp) {
    if (!this.running) return;

    if (timestamp <= this.lastTimestamp) timestamp = this.lastTimestamp + 1;
    this.lastTimestamp = timestamp;

    const video = this.camera.video;

    // --- Run all trackers ---
    const { face, segMask, faceApiResult } = this.trackers.update(
      video,
      timestamp,
      this.segmentationEnabled,
      null,
    );

    // --- Update MediaPipe metrics ---
    if (face) {
      this.metrics.update(face, timestamp);
      this.lastFaceLandmarks = face.faceLandmarks?.[0] || null;
    } else if (this.trackers.faceLandmarkerReady) {
      this.metrics.faceDetected = false;
      this.metrics.smoother.driftAll();
    }

    // --- Update face-api.js metrics ---
    this.metrics.updateFaceApi(faceApiResult);

    // --- Segmentation mask (clear when no face so silhouette doesn't linger) ---
    if (segMask) {
      this.segMask = segMask;
    } else if (!this.metrics.faceDetected) {
      this.segMask = null;
    }

    // --- Get smoothed values ---
    const smoothed = this.metrics.getSmoothedValues();

    // --- Update fake streams ---
    const fakeVals = this.fakeStreams.update(
      timestamp,
      smoothed,
      this.metrics.faceDetected,
    );
    const mockVals = this.mockGen.update(timestamp, smoothed);

    // --- Archive: detect person changes ---
    const { newPerson, archived } = this.archive.update(
      timestamp,
      this.metrics.faceDetected,
      smoothed,
      fakeVals,
    );
    if (newPerson) {
      this.fakeStreams.reset();
    }
    if (archived) {
      console.log("[Archive]", archived.summary);
    }

    // --- Data + camera opacity: suppressed until loading dismissed + hold delay ---
    const dataReady =
      this._loadingDismissed && performance.now() >= this._dataHoldUntil;
    if (!dataReady) {
      this.renderer.dataOpacity = 0;
      this.renderer.cameraOpacity = 0;
    } else {
      // Fade camera in from white (~1.5s)
      this.renderer.cameraOpacity += 0.04 * (1.0 - this.renderer.cameraOpacity);
      if (this.metrics.faceDetected) {
        // Fade in (~1 second)
        this.renderer.dataOpacity += 0.08 * (1.0 - this.renderer.dataOpacity);
      } else {
        // Fade out (~2.5 seconds)
        this.renderer.dataOpacity += 0.02 * (0.0 - this.renderer.dataOpacity);
      }
    }

    // --- Compute demographic lookup from smoothed age + gender ---
    const demoResult =
      this.demographics.ready &&
      smoothed.age != null &&
      smoothed.genderMale != null
        ? this.demographics.lookup(smoothed.age, smoothed.genderMale)
        : null;

    // --- Render grid ---
    const imageData = this.camera.sampleFrame();
    if (imageData) {
      this.cellMapper.update(
        smoothed,
        this.lastFaceLandmarks,
        null,
        this.segMask,
        this.frameCount,
        imageData,
        timestamp,
        fakeVals,
        mockVals,
        demoResult,
      );

      this.renderer.render(
        imageData,
        this.segMask,
        this.cellMapper.mergedCells,
      );
    }

    // --- Update formula bar ---
    if (!this._loadingDismissed) {
      this.formulaBar.cellNameEl.textContent = "A1";
      this.formulaBar.formulaEl.textContent = "=LOADING(trackers)";
    } else if (this.metrics.faceDetected) {
      // Live formula cycling when face is present
      const formulaEntries = this.cellMapper.getFormulaEntries();
      this.formulaBar.update(formulaEntries, timestamp);
    } else {
      // Waiting state when no face detected
      this.formulaBar.cellNameEl.textContent = "A1";
      this.formulaBar.formulaEl.textContent = "=AWAITING(subject_id)";
    }

    // --- Periodic console log ---
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.logMetrics(fakeVals);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  logMetrics(fakeVals) {
    const v = this.metrics.getSmoothedValues();
    if (!Object.keys(v).length) return;

    const f = (n, d = 2) => (n != null ? n.toFixed(d) : "\u2014");

    const exprKeys = [
      "exprNeutral",
      "exprHappy",
      "exprSad",
      "exprAngry",
      "exprSurprised",
      "exprFearful",
      "exprDisgusted",
    ];
    let dominantExpr = "\u2014";
    let maxExpr = -1;
    for (const k of exprKeys) {
      if (v[k] != null && v[k] > maxExpr) {
        maxExpr = v[k];
        dominantExpr = k.replace("expr", "").toLowerCase();
      }
    }

    const gender =
      v.genderMale != null
        ? v.genderMale > 0.5
          ? `M(${f(v.genderMale)})`
          : `F(${f(1 - v.genderMale)})`
        : "\u2014";

    const hr = fakeVals?.heartRate ? f(fakeVals.heartRate, 1) : "\u2014";
    const subj = this.archive.getCurrentSubjectId();

    console.log(
      `[#${subj}] face:${this.metrics.faceDetected ? "YES" : "no "}` +
        `  yaw:${f(v.yaw, 1)}\u00B0  pitch:${f(v.pitch, 1)}\u00B0  roll:${f(v.roll, 1)}\u00B0` +
        `  IPD:${f(v.ipd, 3)}  HR:${hr}` +
        `\n          eyeL:${f(v.eyeOpenL)}  eyeR:${f(v.eyeOpenR)}  blinks/min:${f(v.blinkRate, 0)}` +
        `  mouth:${f(v.mouthOpen)}  smile:${f(((v.smileL || 0) + (v.smileR || 0)) / 2)}` +
        `\n          symmetry:${f(v.symmetry)}  movement:${f(v.microMovement)}` +
        `  browUp:${f(v.browInnerUp)}  browAsym:${f(v.browAsymmetry)}` +
        `\n          age:${f(v.age, 1)}  gender:${gender}` +
        `  expr:${dominantExpr}(${f(maxExpr)})` +
        `  closeRange:${this.trackers.isCloseRange ? "YES" : "no"}`,
    );
  }
}

// --- Mock data generator for subjective/categorical data ---
// Kept separate from FakeStreams — handles expression classification,
// mood, profession, and other categorical values.

class MockDataGenerator {
  constructor() {
    this.lastShuffle = 0;
    this.shuffleInterval = 12000;
    this.profession = "analyst";
    this.income = "middle";
    this.mood = "contemplative";
    this.threat = "low";
  }

  update(timestamp, realMetrics) {
    const t = timestamp / 1000;
    const out = {};

    if (realMetrics && Object.keys(realMetrics).length) {
      const exprMap = {
        exprNeutral: "neutral",
        exprHappy: "happy",
        exprSad: "sad",
        exprAngry: "angry",
        exprSurprised: "surprised",
        exprFearful: "fearful",
        exprDisgusted: "disgusted",
      };
      let best = "neutral",
        bestV = -1;
      for (const [k, label] of Object.entries(exprMap)) {
        if ((realMetrics[k] || 0) > bestV) {
          bestV = realMetrics[k] || 0;
          best = label;
        }
      }
      out.dominant_expr = best;

      const blink = Math.min(1, (realMetrics.blinkRate || 15) / 30);
      const move = Math.min(1, (realMetrics.microMovement || 0) / 5);
      out.stress = clamp(
        blink * 0.4 + move * 0.3 + 0.15 + Math.sin(t * 0.3) * 0.08,
      );

      const yawAbs = Math.abs(realMetrics.yaw || 0);
      out.engagement = clamp(1 - yawAbs / 45 + Math.sin(t * 0.2) * 0.05);
    } else {
      out.dominant_expr = "neutral";
      out.stress = 0.3 + Math.sin(t * 0.3) * 0.1;
      out.engagement = 0.5 + Math.sin(t * 0.2) * 0.1;
    }

    out.trustworthy = clamp(
      0.62 + Math.sin(t * 0.22) * 0.1 + Math.sin(t * 0.41) * 0.06,
    );
    out.deception = clamp(
      0.18 + Math.sin(t * 0.19) * 0.08 + Math.sin(t * 0.53) * 0.05,
    );

    if (
      timestamp - this.lastShuffle > this.shuffleInterval ||
      this.lastShuffle === 0
    ) {
      this.lastShuffle = timestamp;
      this.profession = pick([
        "designer",
        "engineer",
        "student",
        "artist",
        "manager",
        "teacher",
        "analyst",
        "researcher",
      ]);
      this.income = pick([
        "lower",
        "lower-mid",
        "middle",
        "upper-mid",
        "upper",
      ]);
      this.mood = pick([
        "contemplative",
        "distracted",
        "curious",
        "self-conscious",
        "relaxed",
        "performing",
      ]);
      this.threat = pick(["negligible", "low", "moderate", "elevated"]);
    }

    out.profession = this.profession;
    out.income = this.income;
    out.mood = this.mood;
    out.threat = this.threat;

    return out;
  }
}

function clamp(v) {
  return Math.max(0, Math.min(1, v));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const app = new App();
app.init();

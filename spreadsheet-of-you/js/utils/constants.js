// Grid
export const GRID_COLS = 80;
export const GRID_ROWS = 80;

// Color processing
export const DESATURATION = 0.3;
export const QUANTIZATION_LEVELS = 64;

// Layout
export const ROW_HEADER_WIDTH = 40;
export const COL_HEADER_HEIGHT = 20;

// Colors
export const GRID_LINE_COLOR = '#C0C0C0';
export const HEADER_BG = '#D4D0C8';

// Smoothing alphas
export const ALPHA_FAST = 0.25;        // expressions, eye openness
export const ALPHA_MEDIUM = 0.12;      // head pose, lean
export const ALPHA_SLOW = 0.04;        // heart rate, breathing
export const ALPHA_CLASSIFICATION = 0.75; // age, gender, expressions — very reactive for installation

// Drift
export const DRIFT_RATE = 0.002;
export const DRIFT_JITTER = 0.001;
export const CONFIDENCE_THRESHOLD = 0.3;

// face-api.js
export const FACEAPI_INTERVAL = 1;       // Run face-api every frame
export const FACEAPI_MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';
export const CLOSE_RANGE_IPD = 0.11;     // IPD above this → face-api pauses (face too close)

// Sidebar & Formula bar
export const FORMULA_CYCLE_SPEED = 2000;   // ms per cell in formula bar
export const SIDEBAR_WIDTH = 200;          // px for right sidebar
export const SIDEBAR_BOTTOM_HEIGHT = 60;   // px for bottom sidebar

// MediaPipe CDN paths
export const MEDIAPIPE_VERSION = '0.10.18';
export const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
export const FACE_LANDMARKER_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
export const SELFIE_SEGMENTER_MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

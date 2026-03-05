// --- Difficulty (continuous 0–100) ---
// Easy (0) and Hard (100) endpoints — values are linearly interpolated
const EASY =  { distMax: 22000, distMin: 4000, threshold: 0.5, holdFrames: 25 };
const HARD =  { distMax: 8000,  distMin: 100,  threshold: 0.95, holdFrames: 120 };

function difficultyFromSlider(val) {
  const t = val / 100;
  return {
    distMax:    EASY.distMax    + t * (HARD.distMax    - EASY.distMax),
    distMin:    EASY.distMin    + t * (HARD.distMin    - EASY.distMin),
    threshold:  EASY.threshold  + t * (HARD.threshold  - EASY.threshold),
    holdFrames: Math.round(EASY.holdFrames + t * (HARD.holdFrames - EASY.holdFrames)),
  };
}

let difficulty = difficultyFromSlider(65);

// --- DOM ---
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const elem = document.documentElement;

// --- Images ---
const img = new Image();
const imgFull = new Image();
let imgCounter = 4;
img.src = imgCounter + '.jpg';
imgFull.src = imgCounter + 'full.jpg';

// --- State ---
let showDebugPoints = false;
let totalDist = 0;
let lerpedScore = 0;
let expressionCounter = 0;
let keepLastEmoji = false;
let emojiCounter = 0;

const symbols = ["\u2B50\uFE0F\u2B50\uFE0F\u2B50\uFE0F\u2B50\uFE0F\u2B50\uFE0F", "3\uFE0F\u20E3", "2\uFE0F\u20E3", "1\uFE0F\u20E3", "\uD83C\uDF89"];
const clap = new Audio('clapTrimmed.mp3');
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const lipsPoints = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
  146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
  20, 238, 241, 125, 19, 354, 461, 458, 250, 462, 370, 94, 141, 242, 2, 1, 4, 5
];

// --- Settings UI ---
const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');
const difficultySlider = document.getElementById('difficulty-slider');
const debugToggle = document.getElementById('debug-toggle');

settingsToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsPanel.classList.toggle('hidden');
});

settingsPanel.addEventListener('mousedown', (e) => e.stopPropagation());
settingsPanel.addEventListener('mouseup', (e) => e.stopPropagation());
settingsToggle.addEventListener('mousedown', (e) => e.stopPropagation());
settingsToggle.addEventListener('mouseup', (e) => e.stopPropagation());

difficultySlider.addEventListener('input', (e) => {
  difficulty = difficultyFromSlider(parseInt(e.target.value));
});

debugToggle.addEventListener('change', (e) => {
  showDebugPoints = e.target.checked;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 's' || e.key === 'S') {
    settingsPanel.classList.toggle('hidden');
  }
});

// --- Interaction ---
document.body.addEventListener('mousedown', () => openFullscreen());
document.body.addEventListener('mouseup', () => expressionHold());

// --- Confetti ---
const confettiDefaults = { origin: { y: 0.6, x: 0.35 } };

function fireConfetti(particleRatio, opts) {
  confetti(Object.assign({}, confettiDefaults, opts, {
    particleCount: Math.floor(50 * particleRatio)
  }));
}

function fireAllConfetti() {
  fireConfetti(0.25, { spread: 126, startVelocity: 55, scalar: 1.5 });
  fireConfetti(0.2, { spread: 60, scalar: 1.5 });
  fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 1.0 });
  fireConfetti(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fireConfetti(0.1, { spread: 120, startVelocity: 45, scalar: 1.5 });
}

// --- Game Logic ---
function nextImage() {
  imgCounter = (imgCounter + 1) % 8;
  img.src = imgCounter + '.jpg';
  imgFull.src = imgCounter + 'full.jpg';
  keepLastEmoji = false;
}

function expressionHold() {
  fireAllConfetti();
  clap.play();
  setTimeout(nextImage, 2000);
}

// --- Rendering ---
function onResults(results) {
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw full painting on the main area
  canvasCtx.drawImage(imgFull, 540, 0, 1380, 1080);
  canvasCtx.strokeStyle = 'black';
  canvasCtx.lineWidth = 5;
  canvasCtx.strokeRect(540, 0, 1380, 1080);

  // Clip webcam feed to the face region in the painting
  let p = staticPaintings[imgCounter];
  canvasCtx.beginPath();
  canvasCtx.moveTo(canvasElement.width - p.x, p.y);
  canvasCtx.lineTo(canvasElement.width - (p.x + p.w), p.y);
  canvasCtx.lineTo(canvasElement.width - (p.x + p.w), p.y + p.h);
  canvasCtx.lineTo(canvasElement.width - p.x, p.y + p.h);
  canvasCtx.closePath();
  canvasCtx.clip();

  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.restore();

  // --- Sidebar: face mesh preview + reference image ---
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  // White background for mesh preview
  canvasCtx.fillStyle = '#FFFFFF';
  canvasCtx.fillRect(0, 0, 540, 540);
  canvasCtx.strokeStyle = 'black';
  canvasCtx.lineWidth = 5;
  canvasCtx.strokeRect(0, 0, 540, 540);

  // Reference image below
  canvasCtx.drawImage(img, 0, 540, 540, 540);
  canvasCtx.strokeRect(0, 540, 540, 540);

  // Draw face mesh in sidebar
  if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
    let landmarks0 = results.multiFaceLandmarks[0][0];
    canvasCtx.scale(0.6, 0.6);
    canvasCtx.translate(
      canvasElement.height / 4 - landmarks0.x * canvasElement.width + 100,
      canvasElement.height / 4 - landmarks0.y * canvasElement.height + 250
    );

    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
    }
  }
  canvasCtx.restore();

  // --- Score calculation ---
  if (results.multiFaceLandmarks) {
    totalDist = 0;

    if (!results.multiFaceLandmarks[0]) {
      totalDist = 10000;
    }

    if (results.multiFaceLandmarks[0]) {
      let allLandMarks = results.multiFaceLandmarks[0];
      let p = staticPaintings[imgCounter];

      for (let i = 0; i < allLandMarks.length - 10; i++) {
        if (showDebugPoints && lipsPoints.includes(i)) {
          canvasCtx.beginPath();
          canvasCtx.arc(canvasElement.width - allLandMarks[i].x * canvasElement.width, allLandMarks[i].y * canvasElement.height, 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#00FF00';
          canvasCtx.fill();

          canvasCtx.beginPath();
          canvasCtx.arc(1380 - p.coordinates[i][0], p.coordinates[i][1], 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#FF0000';
          canvasCtx.fill();
        }

        if (lipsPoints.includes(i)) {
          totalDist += dist(
            canvasElement.width - allLandMarks[i].x * canvasElement.width,
            allLandMarks[i].y * canvasElement.height,
            1380 - p.coordinates[i][0],
            p.coordinates[i][1]
          );
        }
      }
    }

    // --- Score bar ---
    const gradient = canvasCtx.createLinearGradient(20, 0, 1380 - 40, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.4, 'orange');
    gradient.addColorStop(0.8, 'green');
    gradient.addColorStop(1.0, 'LawnGreen');
    canvasCtx.fillStyle = gradient;

    canvasCtx.restore();
    canvasCtx.save();
    canvasCtx.translate(0, 1080 - 150);

    let score = map(totalDist, difficulty.distMax, difficulty.distMin, 0, 1);
    score = clamp(score, 0, 1);
    lerpedScore = lerp(lerpedScore, score, 0.2);

    // Filled bar
    canvasCtx.fillRect(20, 20, lerpedScore * (1380 - 40), 100);

    // Bar outline with pulse effect when matching
    if (expressionCounter === 0) {
      canvasCtx.strokeStyle = 'rgb(255,255,255)';
      canvasCtx.lineWidth = 5;
    } else {
      canvasCtx.strokeStyle = lerpColor('#FFFFFF', '#00FF00', Math.sin((expressionCounter % 100) * 0.4) * 0.3 + 0.7);
      canvasCtx.lineWidth = 10 + Math.sin((expressionCounter % 100) * 0.4) * 1.5;
    }
    canvasCtx.strokeRect(20, 20, 1380 - 40, 100);

    // Star ticks on the bar
    canvasCtx.fillStyle = 'white';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    let fontSize = 35;
    let stars = '';
    for (let i = 0; i < 5; i++) {
      fontSize += 2;
      canvasCtx.font = fontSize + 'px serif';
      stars += '\u2B50\uFE0F';
      if (i > 0) canvasCtx.fillRect(20 + i * (1380 - 40) / 5, 100, 5, 20);
      if (i < 4) canvasCtx.fillText(stars, 20 + i * (1380 - 40) / 5 + (1380 - 40) / 10, 70);
      if (i === 4) {
        canvasCtx.font = '45px serif';
        canvasCtx.fillText(symbols[emojiCounter], 20 + i * (1380 - 40) / 5 + (1380 - 40) / 10, 70);
      }
    }
    canvasCtx.restore();

    // --- Expression hold detection ---
    const hf = difficulty.holdFrames;

    if (lerpedScore > difficulty.threshold) {
      expressionCounter++;

      if (expressionCounter === 1) {
        emojiCounter = 1;
      } else if (expressionCounter === Math.floor(hf * 0.23)) {
        emojiCounter = 2;
      } else if (expressionCounter === Math.floor(hf * 0.46)) {
        emojiCounter = 3;
      } else if (expressionCounter >= hf) {
        emojiCounter = 4;
        keepLastEmoji = true;
      }
    } else {
      expressionCounter = 0;
      emojiCounter = 0;
    }

    if (keepLastEmoji) emojiCounter = 4;

    if (expressionCounter > hf) {
      expressionHold();
      expressionCounter = 0;
    }
  }
}

// --- FaceMesh Setup ---
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => { await faceMesh.send({ image: videoElement }); },
  width: 1280,
  height: 720
});
camera.start();

// --- Utility Functions ---
function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function lerpColor(a, b, amount) {
  const ah = parseInt(a.replace(/#/g, ''), 16);
  const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const bh = parseInt(b.replace(/#/g, ''), 16);
  const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = ar + amount * (br - ar);
  const rg = ag + amount * (bg - ag);
  const rb = ab + amount * (bb - ab);
  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function openFullscreen() {
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

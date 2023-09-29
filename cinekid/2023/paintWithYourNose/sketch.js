const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let mouseDown = false;
let mouse = { x: .5 * canvasElement.width, y: .5 * canvasElement.height, tX: 0, tY: 0 };
let needsUpdate = false;
let hue = 0; // Start hue value

let params = {
  pointsNumber: 50,  
  widthFactor: .4, 
  mouseThreshold: .6,
  spring: .35,
  friction: .4
};

document.body.onmousedown = () => {
    mouseDown = true;
    enterFullscreen();
};
document.body.onmouseup = () => mouseDown = false;

const touchTrail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
    touchTrail[i] = {
        x: mouse.x,
        y: mouse.y,
        vx: 0,
        vy: 0,
    }
}

function updateBubbles() {
  hue += 0.2; // Increase the hue over time
  if (hue > 360) hue -= 360; // Reset if hue goes over 360

  canvasCtx.lineCap = 'round';
  canvasCtx.lineJoin = 'round';

  touchTrail.forEach((p, pIdx) => {
      if (pIdx === 0) {
          p.x = mouse.x;
          p.y = mouse.y;
      } else {
          p.vx += (touchTrail[pIdx - 1].x - p.x) * params.spring;
          p.vy += (touchTrail[pIdx - 1].y - p.y) * params.spring;
          p.vx *= params.friction;
          p.vy *= params.friction;
          p.x += p.vx;
          p.y += p.vy;
      }

      if (pIdx > 0) {
          canvasCtx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
          canvasCtx.lineWidth = params.widthFactor * (params.pointsNumber - pIdx);
          canvasCtx.beginPath();
          canvasCtx.moveTo(touchTrail[pIdx - 1].x, touchTrail[pIdx - 1].y);
          canvasCtx.lineTo(p.x, p.y);
          canvasCtx.stroke();
      }
  });

  mouse.x += (mouse.tX - mouse.x) * params.mouseThreshold;
  mouse.y += (mouse.tY - mouse.y) * params.mouseThreshold;
}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
      let nose = results.multiFaceLandmarks[0][1];
      mouse.tX = nose.x * canvasElement.width;
      mouse.tY = nose.y * canvasElement.height;
      needsUpdate = true;
  } else {
      needsUpdate = true;
  }
  
  if (needsUpdate) {
      updateBubbles();
  }

  canvasCtx.restore();
}

const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => await faceMesh.send({ image: videoElement }),
    width: 1280,
    height: 720
});
camera.start();

// Function to enter fullscreen
function enterFullscreen() {
    if (document.fullscreenEnabled) {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

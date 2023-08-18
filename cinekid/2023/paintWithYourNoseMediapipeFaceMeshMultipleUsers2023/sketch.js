const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let mouseDown = false;
let hue = 0; // Start hue value

let params = {
  maxNumFaces: 4, // max number of faces to detect
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

const touchTrails = Array(params.maxNumFaces).fill().map(() => {
    const defaultPosition = { x: .5 * canvasElement.width, y: .5 * canvasElement.height };
    return {
        lastKnownNosePosition: { ...defaultPosition },
        trail: Array(params.pointsNumber).fill().map(() => ({
            x: defaultPosition.x,
            y: defaultPosition.y,
            vx: 0,
            vy: 0
        }))
    };
});

function distance(pt1, pt2) {
    return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
}

function updateBubbles(mouse, trail) {
    hue += 0.2; // Increase the hue over time
    if (hue > 360) hue -= 360; // Reset if hue goes over 360

    canvasCtx.lineCap = 'round';
    canvasCtx.lineJoin = 'round';

    trail.forEach((p, pIdx) => {
        if (pIdx === 0) {
            p.x = mouse.x;
            p.y = mouse.y;
        } else {
            p.vx += (trail[pIdx - 1].x - p.x) * params.spring;
            p.vy += (trail[pIdx - 1].y - p.y) * params.spring;
            p.vx *= params.friction;
            p.vy *= params.friction;
            p.x += p.vx;
            p.y += p.vy;
        }

        if (pIdx > 0) {
            canvasCtx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            canvasCtx.lineWidth = params.widthFactor * (params.pointsNumber - pIdx);
            canvasCtx.beginPath();
            canvasCtx.moveTo(trail[pIdx - 1].x, trail[pIdx - 1].y);
            canvasCtx.lineTo(p.x, p.y);
            canvasCtx.stroke();
        }
    });
}


function onResults(results) {
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks) {
    results.multiFaceLandmarks.forEach(face => {
        const nose = face[1];
        const currentNosePosition = {
            x: nose.x * canvasElement.width,
            y: nose.y * canvasElement.height
        };

        // Find the closest trail to the current nose position
        let closestTrail = null;
        let minDistance = Infinity;

        touchTrails.forEach(trailData => {
            const d = distance(trailData.lastKnownNosePosition, currentNosePosition);
            if (d < minDistance) {
                minDistance = d;
                closestTrail = trailData;
            }
        });

        // Update the closest trail
        if (closestTrail) {
            closestTrail.lastKnownNosePosition = currentNosePosition;
            updateBubbles(currentNosePosition, closestTrail.trail);
        }
    });
  }

  canvasCtx.restore();
}

const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: params.maxNumFaces, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
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
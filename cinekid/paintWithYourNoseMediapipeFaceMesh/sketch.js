const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let mouseDown = false;

let nosePath = [];

document.body.onmousedown = () => {
  mouseDown = true;
};
document.body.onmouseup = () => {
  mouseDown = false;
};

function onResults(results) {
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiFaceLandmarks && mouseDown) {
    for (const landmarks of results.multiFaceLandmarks) {
      //canvasCtx.translate(400, 100);
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                     {color: '#C0C0C070', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
    }
  }
  canvasCtx.restore();


  //Find a keypoint and draw it
  if (results.multiFaceLandmarks) {      

    //Find the first landmark and print out its coordinates
    if (results.multiFaceLandmarks[0]) { //if we got a face (not very elegant)
    let nose = results.multiFaceLandmarks[0][1];     
    nosePath.push(nose);
    }
  }


  //Draw the nosePath
  canvasCtx.beginPath();
  canvasCtx.lineWidth = 10;
  canvasCtx.lineCap = "round";
  

    for (let i = 0; i<nosePath.length; i++) {
      canvasCtx.strokeStyle = "rgb(230, 80, 0)";
      canvasCtx.lineTo(canvasElement.width - nosePath[i].x*canvasElement.width, nosePath[i].y*canvasElement.height);
      canvasCtx.moveTo(canvasElement.width - nosePath[i].x*canvasElement.width, nosePath[i].y*canvasElement.height);
    }
    canvasCtx.stroke();

    if (nosePath.length > 360) {
      nosePath = [];
    }
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 1280,
  height: 720,
  
});
camera.start();

document.body.onmousedown = () => {
  openFullscreen();
};

//Full screen
var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}
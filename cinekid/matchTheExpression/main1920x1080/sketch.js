const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');


const img = new Image();  
img.src = 'rightBottomImg.jpg'; // Set source path


const img2 = new Image();  
img2.src = 'paintingWithHoles.png'; // Set source path



let mouseDown = false;
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

  //Draw a rectangle at the upper right corner of the canvas
  canvasCtx.fillStyle = '#FFFFFF';
  canvasCtx.fillRect(0, 0, 540, 540);

  //Lets draw the current image as reference to the right
  canvasCtx.drawImage(img, 0, 540, 540, 540);

  //Lets draw the current image with the mask to the left
  canvasCtx.drawImage(img2, 540, 0, 1380, 1080);

  if (results.multiFaceLandmarks) {

    if (results.multiFaceLandmarks[0]) { //if we got a face (not very elegant)
      let landmarks = results.multiFaceLandmarks[0][0]; 

      console.log(landmarks.x*canvasElement.width);

      //First we translate to the left of the screen based on the face's position so it is locked indepentendtly of where you are - this works!

      //Could we perhaps also scale this??
      canvasCtx.scale(0.65, 0.65);
      canvasCtx.translate(canvasElement.height/4 - landmarks.x*canvasElement.width + 100, canvasElement.height/4  - landmarks.y*canvasElement.height + 250);
      //canvasCtx.translate(landmarks.x*100, landmarks.y*100);
    }

    
    

    for (const landmarks of results.multiFaceLandmarks) {
      //canvasCtx.translate(400, 100); //This works, but mirrored translation

      //let landmarks = results.multiFaceLandmarks[0][0]; 
      //translate the drawing to the upper left corner of the canvas based on the x and y values of the landmarks
      //

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

  //Draw a B to check stuff
  canvasCtx.font = 'bold 100px Arial';
  canvasCtx.fillStyle = '#FF0000';
  //canvasCtx.fillText('B', 100, 100);


  //Find a keypoint and draw it
  if (results.multiFaceLandmarks) {      

    //Find the first landmark and print out its coordinates
    if (results.multiFaceLandmarks[0]) { //if we got a face (not very elegant)
    let landmarks = results.multiFaceLandmarks[0][0]; 
     
    //console.log(landmarks);

    //Make a green circle at the x and y position of the first landmark
    canvasCtx.beginPath();
    //canvasCtx.arc(canvasElement.width - landmarks.x*canvasElement.width, landmarks.y*canvasElement.height, 10, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fill();
    }
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

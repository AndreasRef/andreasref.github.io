/*
To fix
- Smaller paintings
- Clean DALLE markers
- Countdown timer needs to keep the confettiicon until the next picture

Nice to have
- Take a picture effect / perfect!
- Different clap sounds
*/


const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

const img = new Image();
img.src = '4.jpg'; // Set source path

const img2 = new Image();
img2.src = '4full.jpg'; // Set source path

let imgCounter = 4;

let showDebugPoints = false;
let mouseDown = false;

let totalDist = 0;

let lerpedScore = 0;

let expressionCounter = 0;

let keepLastEmoji = false;

let borderGreen = 255;

//let snapShotImage;

// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

document.body.onmousedown = () => {
  mouseDown = true;
  openFullscreen();
};
document.body.onmouseup = () => {

   mouseDown = false;
   expressionHold();
  // imgCounter++;
  // if (imgCounter > 6) {
  //   imgCounter = 0;
  // }
  // img.src = imgCounter + '.jpg';
  // img2.src = imgCounter + 'full.jpg';
};


//Countdown stuff
let symbols = ["⭐️⭐️⭐️⭐️⭐️", "3️⃣", "2️⃣", "1️⃣", "🎉"]

let emojiCounter = 0;

let to1, to2, to3, to4;


let clap = new Audio('clapTrimmed.mp3');

let lipsPoints = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, //lipsUpperOuter
  146, 91, 181, 84, 17, 314, 405, 321, 375, 291, //lipsLowerOuter
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, //lipsUpperInner
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, //lipsLowerInner
  20, 238, 241, 125, 19, 354, 461, 458, 250, 462, 370, 94, 141, 242, 2, 1, 4, 5//nose quick points
]

//full screen
var elem = document.documentElement;

//Confetti stuff
var count = 50;
var defaults = {
  origin: { y: 0.6, x: 0.35 }
};

function fire(particleRatio, opts) {
  confetti(Object.assign({}, defaults, opts, {
    particleCount: Math.floor(count * particleRatio)
  }));
}

function fireAllConfetti() {
  fire(0.25, {
    spread: 126,
    startVelocity: 55,
    scalar: 1.5
  });
  fire(0.2, {
    spread: 60,
    scalar: 1.5
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 1.0
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    scalar: 1.5
  });  
}



function nextImage() {

  imgCounter++;
  if (imgCounter > 7) {
    imgCounter = 0;
  }
  img.src = imgCounter + '.jpg';
  img2.src = imgCounter + 'full.jpg';
  keepLastEmoji = false;
  //clap.play();
}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  //Lets draw the current image with the mask to the left
  canvasCtx.drawImage(img2, 540, 0, 1380, 1080);

  //Outline
  canvasCtx.strokeStyle = "black"
  canvasCtx.lineWidth = 5;
  canvasCtx.strokeRect(540, 0, 1380, 1080);

  let x = 700;
  let y = 500;
  let w = 300;
  let h = 300;

  let p = staticPaintings[imgCounter];
  
  canvasCtx.beginPath();
  canvasCtx.moveTo(canvasElement.width - p.x, p.y);
  canvasCtx.lineTo(canvasElement.width - (p.x+p.w), p.y);
  canvasCtx.lineTo(canvasElement.width - (p.x+p.w), p.y+p.h);
  canvasCtx.lineTo(canvasElement.width - p.x, p.y+p.h);
  canvasCtx.closePath();
  canvasCtx.clip();

  //webcam feed
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height); 

  canvasCtx.restore();
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  //Draw a white rectangle at the upper right corner of the canvas
  canvasCtx.fillStyle = '#FFFFFF';
  canvasCtx.fillRect(0, 0, 540, 540);

  //Draw outlines
  canvasCtx.strokeStyle = "black"
  canvasCtx.lineWidth = 5;
  canvasCtx.strokeRect(0, 0, 540, 540);

  //Lets draw the current image as reference in the right bottom
  canvasCtx.drawImage(img, 0, 540, 540, 540);
  //Draw outline
  canvasCtx.strokeRect(0, 540, 540, 540);
  

  //Draw a scaled version of the facetracker mesh in the upper right corner
  if (results.multiFaceLandmarks) {
    if (results.multiFaceLandmarks[0]) { //if we got a face (not very elegant)
      let landmarks = results.multiFaceLandmarks[0][0];

      //Could we perhaps also scale this??
      canvasCtx.scale(0.6, 0.6);
      canvasCtx.translate(canvasElement.height / 4 - landmarks.x * canvasElement.width + 100, canvasElement.height / 4 - landmarks.y * canvasElement.height + 250);
      //only mouth
      //canvasCtx.translate(canvasElement.height / 4 - landmarks.x * canvasElement.width + 100, canvasElement.height / 4 - landmarks.y * canvasElement.height);
    }

    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
      //drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
      //drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
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

  if (results.multiFaceLandmarks) {

    //Reset totalDist
    totalDist=0;

    //if no face
    if (!results.multiFaceLandmarks[0]) {
      totalDist=10000;
    }


    if (results.multiFaceLandmarks[0]) { //if we got a face (not very elegant)
      //Make green circles that compare the landmarks to the current one from the face tracker
      let allLandMarks = results.multiFaceLandmarks[0];
      let p = staticPaintings[imgCounter];
      for (let i = 0; i<allLandMarks.length-10; i++) { //-10 because we ignore the last 10
        if (showDebugPoints && lipsPoints.includes(i)) {
          canvasCtx.beginPath();
          canvasCtx.arc(canvasElement.width - allLandMarks[i].x*canvasElement.width, allLandMarks[i].y*canvasElement.height, 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#00FF00';
          canvasCtx.fill();

          //Load existing keypoints from static images and display them 
          //Make a red circle at the x and y position of each loaded landmark 
          canvasCtx.beginPath();
          canvasCtx.arc(1380 - p.coordinates[i][0], p.coordinates[i][1], 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#FF0000';
          canvasCtx.fill();
        }
        
        //Very crude comparison of all points!
        //totalDist += dist(canvasElement.width - allLandMarks[i].x*canvasElement.width, allLandMarks[i].y*canvasElement.height, 1380 - p.coordinates[i][0], p.coordinates[i][1]);
        //only compare lip points

        if(lipsPoints.includes(i)) {
          totalDist += dist(canvasElement.width - allLandMarks[i].x*canvasElement.width, allLandMarks[i].y*canvasElement.height, 1380 - p.coordinates[i][0], p.coordinates[i][1]);
        }

      }
    }
    //console.log(totalDist);


    //Gradient
    // Create a linear gradient
    // The start gradient point is at x=20, y=0
    // The end gradient point is at x=220, y=0
    const gradient = canvasCtx.createLinearGradient(20, 0, 1380-40, 0);

    // Add three color stops
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.4, "orange");
    gradient.addColorStop(0.8, "green");
    gradient.addColorStop(1.0, "LawnGreen");

    // Set the fill style and draw a rectangle
    canvasCtx.fillStyle = gradient;
    //canvasCtx.fillRect(20, 220, 200, 100);

    //Translate test for moving bar down
    canvasCtx.restore();
    canvasCtx.save();
    canvasCtx.translate(0,1080-150)
    //Sloppy score bar
    let score = map(totalDist, 15000,1000, 0, 1)
    score = clamp(score, 0, 1);

    lerpedScore = lerp(lerpedScore, score, 0.2);
    //canvasCtx.fillStyle = lerpColor("#FF0000", "#00FF00", score);
    canvasCtx.fillRect(20, 20, lerpedScore*(1380-40), 100);
    //canvasCtx.strokeStyle = "white"
    if (expressionCounter == 0) {
      canvasCtx.strokeStyle = "rgb(255,255,255)";
      canvasCtx.lineWidth = 5;
    } else {
      let thergb = "rgb(" + 0 + "," + (expressionCounter%10)*25+ "," + 0 + ")"; 
      //canvasCtx.strokeStyle = thergb;
      canvasCtx.strokeStyle = lerpColor("#FFFFFF", "#00FF00",(Math.sin((expressionCounter%100)*0.4)*0.3+0.7));
      canvasCtx.lineWidth = 10+ Math.sin((expressionCounter%100)*0.4)*1.5;
    }
    
    canvasCtx.strokeRect(20, 20, 1380-40, 100);

    //Ticks
    canvasCtx.fillStyle = "white"
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    //Icons
    //canvasCtx.font = "35px serif";
    let fontSize = 35;
    let stars = "";
    for (let i = 0; i<5; i++) {
      fontSize +=2;
      canvasCtx.font = fontSize+"px serif";
      stars+="⭐️"
      if (i>0) canvasCtx.fillRect(20 + i* (1380-40) / 5, 100, 5, 20);
      if (i<4) canvasCtx.fillText(stars, 20 + i* (1380-40) / 5 + ((1380-40) / 10), 70);
      if (i==4) {
        canvasCtx.font = "45px serif";
        canvasCtx.fillText(symbols[emojiCounter], 20 + i* (1380-40) / 5 + ((1380-40) / 10), 70);
      } 
    }
    
    canvasCtx.restore();


    if (lerpedScore > 0.8) {
      expressionCounter++;

      if (expressionCounter == 1) {
        emojiCounter = 1;
      } else if (expressionCounter == 15) {
        emojiCounter = 2;
      } else if (expressionCounter == 30) {
        emojiCounter = 3;
      } else if (expressionCounter == 65) {
        emojiCounter = 4;
        keepLastEmoji = true;
      } 
    } else {
      expressionCounter = 0;
      emojiCounter = 0;
      // clearTimeout(to1);
      // clearTimeout(to2);
      // clearTimeout(to3);
      // clearTimeout(to4);
    }

    if (keepLastEmoji) emojiCounter = 4;

    if (expressionCounter > 65) {
      expressionHold();
      //nextImage();
      expressionCounter = 0;
    }
    //console.log(expressionCounter);

  }
}

function expressionHold() {
  

//  to1 = setTimeout(updateEmoji, 100)
//  to2 = setTimeout(updateEmoji, 200)
//  to3 = setTimeout(updateEmoji, 300)
//  to4 = setTimeout(updateEmoji, 400)

  fireAllConfetti();

  clap.play();
  setTimeout(nextImage, 2000)
}


const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  }
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,

});
camera.start();


function dist(x1, y1, x2, y2){
  let y = x2 - x1;
  let x = y2 - y1;
  return Math.sqrt(x * x + y * y);
}


function map(value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

//Full screen
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

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}

//function updateEmoji() {
  // emojiCounter++;
  // if (emojiCounter == 4) emojiCounter = 0;
//}

function lerpColor(a, b, amount) { 

  var ah = parseInt(a.replace(/#/g, ''), 16),
      ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
      bh = parseInt(b.replace(/#/g, ''), 16),
      br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);

  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}
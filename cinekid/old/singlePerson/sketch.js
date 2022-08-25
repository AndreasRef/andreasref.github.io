//See this alternative as well by Sabrina for loading blazepose from mediaPipe instead of from tensorflow: https://glitch.com/~p5js-mediapipe-blazepose

//FIX THE EASING: https://editor.p5js.org/AndreasRef/sketches/Ut1y1AdKZ

let capture
let blazeFaceModel;
let predictions;

let pg;

let currentNose;
let prevNose = [0, 0];
let lerpedNose = [0, 0];
let biggestFace;

let xLerped = 0;
let yLerped = 0;

let pXLerped = 0;
let pYLerped = 0;

let lerpSpeed = 0.08;


// make preload function asynchronous to await the blazeface.load()
async function preload() {
  blazeFaceModel = await blazeface.load();
}

function setup() {
  createCanvas(640, 480);

  capture = createCapture(VIDEO);
  capture.hide();

  pg = createGraphics(width, height);
}


// asynchronous function to load the predictions
async function loadPredictions() {
  if (capture.loadedmetadata) {
    predictions = await blazeFaceModel.estimateFaces(capture.elt);
  }
}

function draw() {
  background(255);
  image(capture, 0, 0);

  image(pg, 0, 0, width, height);
  pg.stroke(230, 80, 0);
  pg.fill(230, 80, 0);
  pg.strokeWeight(5);

  text(frameRate(), 10, 10)

  loadPredictions(); // =>loads the predictions into the predictions array
  currentNose = [0, 0];
  biggestFace = 0;


  if (predictions != null && predictions.length > 0) {
    
    for (let i = 0; i < predictions.length; i++) {
      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const keypoints = predictions[i].landmarks;
      const faceSize = [end[0] - start[0], end[1] - start[1]];

      //drawDebug(i);
      calculateBiggestFace(faceSize, keypoints)  
      
    }
    //drawPg(currentNose[0], currentNose[1], prevNose[0], prevNose[1]);

    //if (dist(currentNose[0], currentNose[1], prevNose[0], prevNose[1])<50) {
      drawPg(xLerped, yLerped, pXLerped, pYLerped);
    //}
    
    console.log(xLerped, yLerped, pXLerped, pYLerped);
  }
  //prevNose = currentNose;
}

function mousePressed() {
  pg.clear();
}


function drawPg(x, y, px, py) {
  //if (dist(x, y, px, py) < 20 && x != 0 && y != 0 && px != 0 && py != 0) {
  if (x != 0 && y != 0 && px != 0 && py != 0) {
    pg.line(x, y, px, py);
  }
}

function drawDebug(i) {
  const start = predictions[i].topLeft;
  const end = predictions[i].bottomRight;
  const keypoints = predictions[i].landmarks;
  const faceSize = [end[0] - start[0], end[1] - start[1]];

  fill(255, 100);
  rect(start[0], start[1], faceSize[0], faceSize[1]);
  text("face #" + i + " probability: " + nf(predictions[i].probability, 1, 3) + " area: " + round(faceSize[0] * faceSize[1]), start[0], start[1] + 10);
  ellipse(keypoints[2][0], keypoints[2][1], 20, 20); //nose
}

function calculateBiggestFace(faceSize, keypoints) {
  if (faceSize[0] * faceSize[1] > biggestFace) {
    biggestFace = faceSize[0] * faceSize[1];
    currentNose = keypoints[2];

      //Lerping
    xLerped = lerp(xLerped, currentNose[0], lerpSpeed);
    yLerped = lerp(yLerped, currentNose[1], lerpSpeed);
    
    pXLerped = lerp(pXLerped, prevNose[0], lerpSpeed);
    pYLerped = lerp(pYLerped, prevNose[1], lerpSpeed);
    prevNose = currentNose;
  }
}
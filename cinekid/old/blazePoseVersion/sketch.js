//BlazeFace stuff
let capture;
let blazeFaceModel;
let predictions;
let noseVector;

//Drawing stuff
//let brushLength = 200; // how many points to keep?
let points = []; // list of points

//Debug and info text
let drawDebug = false;
let infoScreen = false;

//GUI - NEEDS TO BE of type var for whatever reason
var brushSize = 12;
var brushSizeMin = 1;
var brushSizeMax = 100;
var brushSizeStep = 1;

var brushLength = 200;
var brushLengthMin = 0;
var brushLengthMax = 1000;
var brushLengthStep = 1;
var brushColor = '#df5814';

var lerpStability = 0.9;
var lerpStabilityMin = 0.0;
var lerpStabilityMax = 1.0;
var lerpStabilityStep = 0.01;

let gui;


async function preload() {
  blazeFaceModel = await blazeface.load();
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  let constraints = {
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720
      },
      optional: [{ maxFrameRate: 60 }]
    },
    audio: false
  };
  capture = createCapture(constraints, function(stream) {
    console.log(stream);
  });
  
  capture.hide();


  // Create the GUI
  //sliderRange(0, 90, 1);
  gui = createGui('p5.gui');
  gui.addGlobals('brushSize', 'brushLength', 'lerpStability', 'brushColor');


  curveTightness(-0.3);
  noseVector = createVector(width / 2, height / 2);
}

async function loadPredictions() {
  if (capture.loadedmetadata) {
    predictions = await blazeFaceModel.estimateFaces(capture.elt);
  }
}

function draw() {
  background(255);

  //Flip the video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0, width, height);
  pop();
  
  push();
  let fs = fullscreen();
    if(!fs) text("press any key to enter full screen", 10, 10)
  pop();

  //Drawing the lines
  push();
  
  //Adjust points array when a changed gui slider
  if (points.length > brushLength) {
    points = points.slice(-brushLength);
  } 

  // remove the oldest element using shift() if the list is longer than brushLength
  if (points.length > brushLength) points.shift();

  let lastPoint = points[points.length - 1];

  let lerpedPoint = p5.Vector.lerp(noseVector, lastPoint, lerpStability);
  points.push(lerpedPoint);

  // draw a line using the points!
  //stroke(230, 80, 0);
  stroke(brushColor)
  strokeWeight(brushSize);
  strokeJoin(ROUND);
  noFill();
  beginShape();
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    curveVertex(pt.x, pt.y);
  }
  endShape();
  pop();
  //End of drawing stuff

  //BlazeFace stuff
  loadPredictions(); // =>loads the predictions into the predictions array

  if (predictions != null && predictions.length > 0) {
    //Grab the nose of the first (biggest) person and save in noseVector
    noseVector.set(
      width - predictions[0].landmarks[2][0] * (width/capture.width), //we have to reverse in order to flip
      predictions[0].landmarks[2][1] * (height/capture.height)
    );

    if (drawDebug) {
      text(frameRate(), 10, 10);
      fill(255, 0, 0);
      ellipse(noseVector.x, noseVector.y, 20);
      
      push();
      translate(width, 0);
      scale(-1 * (width/capture.width) , 1 * (height/capture.height));
      
      for (let i = 0; i < predictions.length; i++) {
        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        const keypoints = predictions[i].landmarks;
        const faceSize = [end[0] - start[0], end[1] - start[1]];

        // Render a rectangle over each detected face.
        fill(0, 255, 0);
        text("face#: " + i, start[0], start[1]);
        fill(255, 100);
        rect(start[0], start[1], faceSize[0], faceSize[1]);
        ellipse(keypoints[2][0], keypoints[2][1], 20, 20); //nose
      }
      pop();
    }
  }
}


function keyPressed() {  
  let fs = fullscreen();
  fullscreen(!fs);
}
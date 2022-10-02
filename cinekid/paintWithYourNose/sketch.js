/* To do:
Figure out what is happing with the lerpStability
Improve colors?
*/

//BlazeFace stuff
let capture;
let blazeFaceModel;
let predictions;
let noseVector;

//Debug and info text
let drawDebug = false;
let infoScreen = false;

//GUI - NEEDS TO BE of type var for whatever reason
let gui;
var brushSize = 40;
var brushSizeMin = 1;
var brushSizeMax = 100;
var brushSizeStep = 1;

var lerpStability = 0.9;
var lerpStabilityMin = 0.0;
var lerpStabilityMax = 1.0;
var lerpStabilityStep = 0.01;

//New rainbow path logic
let path;
var pathLength = 120;
var pathLengthMin = 1;
var pathLengthMax = 300;

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
  capture = createCapture(constraints, function (stream) {
    console.log(stream);
  });

  capture.hide();
  noCursor();

  // Create the GUI
  //gui = createGui('p5.gui');
  //gui.addGlobals('brushSize', 'pathLength', 'lerpStability');

  noseVector = createVector(width / 2, height / 2);
  prevNoseVector = createVector(0, 0);

  //New rainbow path logic
  colorMode(HSB, 360, 100, 100)
  noStroke()
  path = new Path()
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

  //BlazeFace stuff
  loadPredictions(); // =>loads the predictions into the predictions array

  if (predictions != null && predictions.length > 0) {


    if (predictions.length > 1) {
      lerpStability = 0.9;
    } else {
      lerpStability = 0.6;
    }

    //Grab the nose of the first (biggest) person and save in noseVector
    noseVector.set(
      width - predictions[0].landmarks[2][0] * (width / capture.width), //we have to reverse in order to flip
      predictions[0].landmarks[2][1] * (height / capture.height)
    );

    if (drawDebug) {
      text(frameRate(), 10, 10);
      fill(255, 0, 0);
      ellipse(noseVector.x, noseVector.y, 20);

      push();
      translate(width, 0);
      scale(-1 * (width / capture.width), 1 * (height / capture.height));

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
  } else {

  }

  //New rainbow path logic
  //How far did the nose travel last frame (messy since we are comparing the lerped and the unlerped value?
  let lastPoint = path.pts[path.pts.length - 1];
  let lerpedPoint = p5.Vector.lerp(noseVector, lastPoint, lerpStability);

  noseMovement = dist(lerpedPoint.x, lerpedPoint.y, noseVector.x, noseVector.y);

  if (noseMovement < 10 && path.pts.length > 1) {
    path.pts.shift();
  }

  if (path.pts.length > pathLength || !(predictions != null && predictions.length > 0)) {
    // remove the oldest element using shift()
    path.pts.shift();
  }

  //Only add new points when there is a visible person
  if (predictions != null && predictions.length > 0) {
    path.addPoint(lerpedPoint.x, lerpedPoint.y)
  }

  path.display()
}


function mousePressed() {
  let fs = fullscreen();
  fullscreen(!fs);
}

class Path {
  constructor() {
    this.pts = [];
    this.size = 40; // size of brush // BUT OVERRULED BY BRUSHSIZE FROM GUI
    this.spacing = 10; // spacing between points; lower value gives you smoother path, but frame rate will drop
    this.hue = random(360) // start value
    this.hues = [] // keep track of the hues for each point
  }

  get lastPt() {
    return this.pts[this.pts.length - 1];
  }

  addPoint(x, y) {
    if (this.pts.length < 1) {
      this.pts.push(new p5.Vector(x, y));
      this.hues.push(this.hue)
      return;
    }

    const nextPt = new p5.Vector(x, y);
    let d = p5.Vector.dist(nextPt, this.lastPt);

    while (d > this.spacing) {
      const diff = p5.Vector.sub(nextPt, this.lastPt);
      diff.normalize();
      diff.mult(this.spacing)
      this.pts.push(p5.Vector.add(this.lastPt, diff));
      d -= this.spacing;
      this.hue = (this.hue + 3) % 360; // for each new point, update the hue //before this value was 1
      this.hues.push(this.hue)
    }
  }

  display() {
    noStroke()
    for (let i = 0; i < this.pts.length; i++) {
      const p = this.pts[i];
      fill(this.hues[i], 100, 100)
      ellipse(p.x, p.y, brushSize, brushSize);
    }
  }
}
// https://github.com/pzp1997/p5-matter/blob/master/examples/physics-sign/physics-sign.js

// Using a specific version of handsfree.js that has the (commercial, trial) BRFv4 tracker baked in:
// https://unpkg.com/handsfree@4.0.2/dist/handsfree.js
// more information about the BRFv4 tracker is at: https://github.com/Tastenkunst/brfv4_javascript_examples

/*
To do:
Could textrects from matter be smaller? Edit https://github.com/pzp1997/p5-matter/blob/master/src/p5-matter.js and the MakeSign function, line 694 in p5-matter-remixed
A button to delete all text
A slider for controlling pace

*/

var myHandsfree;
let capture;

var _oldFaceShapeVertices = [];
var _blinked = false;
var _timeOut = -1;

var ground;
var signs = [];

let face0;
let nPoints;

let writtenText = "Jeg har det rigtig skidt i dag , men jeg har ikke lyst til at snakke om det med hverken min kæreste eller mine forældre . Jeg synes ikke at folk forstår mig ! ! ! Jeg er lidt forvirret og ved ikke helt hvad jeg føler . . . Måske kunne jeg også bare være mere åben omkring hvordan jeg har det , men det er svært at sætte ord på det .";
let myWords = [];
let wordIndex = 0;

let reply = ". . ."
let bot;
let user_input; //Used?
let output; //Used?

let button

function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  textSize(18);
  text("loading...", 20, 40);

  button = createButton('slet alt');
  button.position(0, height+100);
  button.mousePressed(deleteAllBlocks);

  capture = createCapture(VIDEO);
  capture.size(width, height);
  capture.hide();

  var myConfig = {
    hideCursor: true,
  };
  myHandsfree = new Handsfree(myConfig);
  myHandsfree.start();

  ground = matter.makeBarrier(width / 2, height+25, width, 50);
}


function draw() {
  writtenText = document.getElementById("inputText").value;
  myWords = trim(writtenText.split(" "));

  //background(0);
  if (myHandsfree.isTracking) image(capture, 0, 0)

  fill(127);
  ground.show();

  fill(255);
  

  for (i = 0; i < signs.length; i++) {
    signs[i].show();
  }
  if (myHandsfree.isTracking) {
    if (myHandsfree.pose.length > 0) {
      face0 = myHandsfree.pose[0].face;
      nPoints = face0.vertices.length;

      
      if (yawnScore() > 0.95) {
        fill(0,255,0)
        textFromMouth();
      }
      drawLandsmarks();
    }
  }
}


function deleteAllBlocks() {
  for (i = 0; i < signs.length; i++) {
    matter.forget(signs[i]);
  }
  signs = [];
}


function textFromMouth() {
  var v = face0.vertices;

  var mouthUpperInnerLipX = face0.vertices[62 * 2];
  var mouthUpperInnerLipY = face0.vertices[62 * 2 + 1];
  var mouthLowerInnerLipX = face0.vertices[66 * 2];
  var mouthLowerInnerLipY = face0.vertices[66 * 2 + 1];

  if (frameCount % 12 == 0) {
    signs.push(matter.makeSign(myWords[wordIndex], mouthUpperInnerLipX/2+mouthLowerInnerLipX/2, mouthUpperInnerLipY/2 + mouthLowerInnerLipY/2, {
      restitution: 0.8,
      density: 0.001
    }));

    wordIndex++;
    if (wordIndex > myWords.length - 1) wordIndex = 0;
  }
}


function drawLandsmarks() {
  //fill(255, 255, 0);
  for (var i = 0; i < nPoints; i += 2) {
    var x = face0.vertices[i + 0];
    var y = face0.vertices[i + 1];
    ellipse(x, y, 5, 5);
  }
}

function yawnScore() {
  //Eyes
  var leftEyeInnerX = face0.vertices[39 * 2];
  var leftEyeInnerY = face0.vertices[39 * 2 + 1];
  var rightEyeInnerX = face0.vertices[42 * 2];
  var rightEyeInnerY = face0.vertices[42 * 2 + 1];

  var eyeDist = dist(leftEyeInnerX, leftEyeInnerY, rightEyeInnerX, rightEyeInnerY);

  //Mouth inner points (for yawn detection)
  //var mouthUpperInnerLipX = face0.vertices[62 * 2];
  var mouthUpperInnerLipY = face0.vertices[62 * 2 + 1];
  //var mouthLowerInnerLipX = face0.vertices[66 * 2];
  var mouthLowerInnerLipY = face0.vertices[66 * 2 + 1];
  var mouthOpen = max(mouthLowerInnerLipY - mouthUpperInnerLipY, 0);

  var yawnFactor = mouthOpen / eyeDist;
  yawnFactor *= 2.0; // scale up a bit
  yawnFactor = constrain(yawnFactor, 0, 1);
  return yawnFactor;
}


function storeFaceShapeVertices(vertices) {
  for (var i = 0, l = vertices.length; i < l; i++) {
    _oldFaceShapeVertices[i] = vertices[i];
  }
}
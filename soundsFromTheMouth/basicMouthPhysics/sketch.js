/*
To do:
- ADD SOUNDS BY FOLLOWING https://b-g.github.io/p5-matter-examples/5-hit-sound/ 
- https://github.com/b-g/p5-matter-examples/blob/master/5-hit-sound/sketch.js
*/
let pg;

let track = true;


let facemesh;
let video;
let predictions = [];
let isMouthOpen = false;

let pallette = ["#D5E6CF", "#D1D2E8", "#E0E8DC", "#E8D8D1", "#9C918C"]


//Face keypoints
var leftEyeInnerX = 0;
var leftEyeInnerY = 0;
var rightEyeInnerX = 0;
var rightEyeInnerY = 0;

var mouthUpperInnerLipX = 0;
var mouthUpperInnerLipY = 0;

var mouthLowerInnerLipX = 0;
var mouthLowerInnerLipY = 0;

//For face graphics 
let mouthKeypoints = [];

let pgMouths = [];

//Matter
var ground;
var signs = [];

let extraHeight = 220;

let sketchW = 640;
let sketchH = 480 + extraHeight;

let selectedRow;

let modelLoaded = false;



function preload() {

}

function setup() {
  pixelDensity(2);

  var canvas = createCanvas(sketchW, sketchH);
  canvas.parent('sketch-holder');
  pg = createGraphics(width, height);

  pg.background(255)

  pg.textSize(20);
  textSize(20);

  //pg.textFont('Gill Sans');
  pg.textFont('Courier New');
  textFont('Courier New');

  //createCanvas(640, 480);
  if (track) { //For easier dev and debugging of non face stuff
    video = createCapture(VIDEO);
    video.size(width, height - extraHeight);


    facemesh = ml5.facemesh(video, modelReady);

    // This sets up an event that fills the global variable "predictions"
    // with an array every time new predictions are made
    facemesh.on("predict", (results) => {
      predictions = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();
  }
  ground = matter.makeBarrier(width / 2, height - extraHeight, width, 50);  //Sloppy 


  setCanvasSize();
}

function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  if (track) {
    //image(video, 0, 0, width, height - 80);
    pg.background(0);
    pg.image(video, 0, 0);
    // pg.push();
    // pg.fill(0,50)
    // pg.rect(0,0,pg.width, pg.height);
    // pg.pop();

    //Make ellipses over the mouth keypoints
    //pg.ellipse(mouthUpperInnerLipX, mouthUpperInnerLipY, 5, 5);
    //pg.ellipse(mouthLowerInnerLipX, mouthLowerInnerLipY, 5, 5);


  } else {
    pg.background(220);
  }

  if (!modelLoaded && track) {
    pg.push();
    pg.fill(220);
    pg.textSize(28);
    pg.text("Loader...", 10, 50)
    pg.pop();
  }


    //drawKeypoints();
    if (track) yawnScore();

    if (isMouthOpen) {
      //text("open", 10, 10);
      textFromMouth();
    }


  pg.fill(0);
  //ground.show();

  //instead of showing ground - which does not work well with pg, we draw it here
  pg.push();
  pg.translate(ground.getPositionX(), ground.getPositionY());
  pg.rotate(ground.getAngle());
  pg.rectMode(CENTER);
  pg.fill(0)
  pg.rect(0, 0, ground.getWidth(), ground.getHeight());
  pg.pop();

  //cover the rest up
  pg.fill(0);
  pg.rect(0, ground.getPositionY(), pg.width, pg.height - ground.getPositionY())

  //rect(0,height-105,width, 105)
  //pg.fill(0)
  //pg.rect(0,height-extraHeight - 50/2,width, extraHeight+50/2 + 500); //Sloppy 

  pg.fill(255);
  //Make the signs
  for (i = 0; i < signs.length; i++) {
    //signs[i].show();


    

    //Boxes
    pg.push();
    //pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.25);
    pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.0);
    pg.rotate(signs[i].getAngle());
    //pg.textAlign(CENTER);
    pg.fill(0);
    pg.rectMode(CENTER);
    //pg.rect(0, 0, signs[i].getWidth() * 1, signs[i].getHeight() * 1)
    pg.imageMode(CENTER);
    pg.image(pgMouths[i], 0, 0, signs[i].getWidth(), signs[i].getHeight());
    pg.pop();

    //Signs
    pg.push();
    //pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.25);
    pg.translate(signs[i].getPositionX(), signs[i].getPositionY() + signs[i].getHeight() * 0.0);
    pg.rotate(signs[i].getAngle());
    pg.textAlign(CENTER);
    //pg.text(signs[i].getText(), 0, signs[i].getHeight() * 0.25);
    pg.pop();
    

  }



  //pg.rect(mouthKeypoints[0], mouthKeypoints[1], mouthKeypoints[2], mouthKeypoints[3]);

  image(pg, 0, 0, width, height);
  if (pgMouths.length > 0) {
    image(pgMouths[pgMouths.length - 1], 0, 0, 100, 100);
  }
  ////image(pgMouths[0], 0, 0, 100, 100);
}


function keyPressed() {
  if (!track) clearAll();
  // for (i = 0; i < signs.length; i++) {
  //   matter.forget(signs[i]);
  // }
  // signs = [];
  // document.getElementById("poem").innerHTML = "";
  // wordIndex = 0;
}

function mousePressed() {
  if (!track) addWord(mouseX * (sketchW / width), mouseY * (sketchH / height));
}

function clearAll() {
  for (i = 0; i < signs.length; i++) {
    matter.forget(signs[i]);
  }
  signs = [];
}

function addWord(x, y, w, h) {
  //signs.push(matter.makeSign("hello", x, y, {
    signs.push(matter.makeBlock(x, y, w, h, {
    //signs.push(matter.makeSign(myWords[wordIndex], width/2, height/2, {
    restitution: 0.8,
    density: 0.01
  }));
}

function textFromMouth() {
  if (frameCount % 10 == 0) {
    //addWord(mouthUpperInnerLipX / 2 + mouthLowerInnerLipX / 2, mouthUpperInnerLipY / 2 + mouthLowerInnerLipY / 2);
    pgMouths.push(pg.get(mouthKeypoints[0], mouthKeypoints[1], mouthKeypoints[2], mouthKeypoints[3]));
    addWord(mouthKeypoints[0]+mouthKeypoints[2]/2, mouthKeypoints[1] + mouthKeypoints[3]/2, mouthKeypoints[2], mouthKeypoints[3]);
  }
}

// A debug function to draw ellipses over selected detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      pg.fill(0, 255, 0);
      //pg.text(j, x, y);
      //Mouth cutout keypoints
      if (j == 164 || j == 57 || j == 18 || j == 287) {
        pg.ellipse(x, y, 2, 2);
      }
    }
  }

  //Draw debug points
  pg.fill(255, 0, 255);
  pg.ellipse(leftEyeInnerX, leftEyeInnerY, 5, 5);
  pg.ellipse(rightEyeInnerX, rightEyeInnerY, 5, 5);

  pg.ellipse(mouthUpperInnerLipX, mouthUpperInnerLipY, 5, 5);
  pg.ellipse(mouthLowerInnerLipX, mouthLowerInnerLipY, 5, 5);
}

function yawnScore() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    //save the mouth keypoints (164, 57, 18 & 287) in an array (x, y, w, h)
    mouthKeypoints = [keypoints[57][0], keypoints[164][1], keypoints[287][0] - keypoints[57][0], keypoints[18][1] - keypoints[164][1]];


    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      if (j == 133) {
        //left inner Eye
        leftEyeInnerX = x;
        leftEyeInnerY = y;
      } else if (j == 362) {
        //right inner Eye
        rightEyeInnerX = x;
        rightEyeInnerY = y;
      } else if (j == 13) {
        //mouth upper inner lip 
        mouthUpperInnerLipX = x;
        mouthUpperInnerLipY = y;
      } else if (j == 14) {
        //mouth lower inner lip 
        mouthLowerInnerLipX = x;
        mouthLowerInnerLipY = y;
      }
    }

    var eyeDist = dist(
      leftEyeInnerX,
      leftEyeInnerY,
      rightEyeInnerX,
      rightEyeInnerY
    );

    var mouthOpen = max(mouthLowerInnerLipY - mouthUpperInnerLipY, 0);

    var yawnFactor = mouthOpen / eyeDist;
    yawnFactor = constrain(yawnFactor, 0, 1);
    //console.log(yawnFactor);

    if (yawnFactor > 0.4) {
      isMouthOpen = true;
    } else {
      isMouthOpen = false;
    }
  }
}

// Resizing canvas
function windowResized() {
  setCanvasSize();
}


function setCanvasSize() {
  var clientWidth = document.getElementById('sketch-holder').clientWidth;
  resizeCanvas(clientWidth, clientWidth * 480 / 640);
}
/*
Face Collage

The example analyzes images of faces, detects the eyes and the mouth and allows you to make silly collages

Built with faceApi model from ml5js and p5js

Created by Andreas Refsgaard 2020

Example is inspired by http://lassekorsgaard.com/experiments/google-faces by Lasse Korsgaard
*/

let faceapi;
let img = [];
let detections;
let index = 0;
let n = 4;

let leftEyes = [];
let rightEyes = [];
let mouths = [];

let whichMouth = 0;
let whichLeftEye = 0;
let whichRightEye = 0;

const detection_options = {
  withLandmarks: true,
  withDescriptors: false,
}

function preload() {
  for (let i = 0; i < n; i++) {
    img[i] = loadImage('assets/face' + i + '.jpg')
  }
}

function setup() {
  createCanvas(600, 600);
  for (let i = 0; i < n; i++) {
    img[i].resize(width, height);
  }
  faceapi = ml5.faceApi(detection_options, modelReady)
}

function drawCollage() {
  image(img[index], 0, 0, width, height);

    //left eye 👀
    let leftEyeImg = img[whichLeftEye].get(leftEyes[whichLeftEye][0], leftEyes[whichLeftEye][1], leftEyes[whichLeftEye][2], leftEyes[whichLeftEye][3]);

    image(leftEyeImg, leftEyes[index][0], leftEyes[index][1], leftEyes[index][2] * 1.2, leftEyes[index][3] * 1.2);

    //right eye 👀
    let rightEyeImg = img[whichRightEye].get(rightEyes[whichRightEye][0], rightEyes[whichRightEye][1], rightEyes[whichRightEye][2], rightEyes[whichRightEye][3]);

    image(rightEyeImg, rightEyes[index][0], rightEyes[index][1], rightEyes[index][2] * 1.2, rightEyes[index][3] * 1.2);

    //mouth 👄
    let mouthImg = img[whichMouth].get(mouths[whichMouth][0], mouths[whichMouth][1], mouths[whichMouth][2], mouths[whichMouth][3]);

    image(mouthImg, mouths[index][0], mouths[index][1], mouths[index][2] * 1.2, mouths[index][3] * 1.2); //make mouth bigger because it is fun!  
  
}

function mouseClicked() {
  randomize();
  drawCollage();
}


function randomize() {
  whichMouth = floor(random(n));
  whichLeftEye = floor(random(n));
  whichRightEye = floor(random(n));
  index = floor(random(n));
}

function modelReady() {
  select('#modelStatus').html('Model loaded! Analyzing faces...');
  for (let i = 0; i < n; i++) {
    faceapi.detectSingle(img[i], gotResults);
  }
}

function gotResults(err, result) {
  if (err) {
    console.log(err)
    return
  }
  select('#modelStatus').html("Done! Click the canvas to randomize images");
  detections = result;
  image(img[index], 0, 0, width, height)
  if (detections) {
    leftEyes.push(getPartBox(detections.parts.leftEye));
    rightEyes.push(getPartBox(detections.parts.rightEye));
    mouths.push(getPartBox(detections.parts.mouth));
  }
  randomize();
}

function getPartBox(facePart) {
  //find the bounding boxes of the face parts...
  let bBox = [];
  let highX = 0;
  let highY = 0;
  let lowX = width;
  let lowY = height;

  facePart.forEach(item => {
    if (item._x > highX) highX = item._x;
    if (item._y > highY) highY = item._y;
    if (item._x < lowX) lowX = item._x;
    if (item._y < lowY) lowY = item._y;
  })

  //Outputs from face-API tend to be a bit too narrow (especially for for the eyes), so we make them slightly bigger with offSetX and offSetY
  const offSetX = width / 35;
  const offSetY = height / 25;

  bBox.push(lowX - offSetX); //box x 
  bBox.push(lowY - offSetY); //box y
  bBox.push(highX - lowX + offSetX * 2); //box width
  bBox.push(highY - lowY + offSetY * 2); //box height

  return bBox;
}
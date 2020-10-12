/* To do
- Upload image functionality
- Random button
- Step through button
- Click on facepart to replace it
*/

let faceapi;
let img;
let detections;

let nFaceParts = 12;

let mouths = [];
let noses = [];
let leftEyes = [];
let rightEyes = [];

let leftEyeIndex = 0;
let rightEyeIndex = 0;
let mouthIndex = 0;
let noseIndex = 0;

let masterIndex = 1;
leftEyeIndex = rightEyeIndex = mouthIndex = noseIndex = masterIndex;

const detection_options = {
  withLandmarks: true,
  withDescriptors: false,
}

//Load the face
function preload() {
  img = loadImage('assets/face.jpg')

  for (let i = 0; i < nFaceParts; i++) {
    mouths[i] = loadImage('assets/mouth' + i + '.png')
    noses[i] = loadImage('assets/nose' + i + '.png')
    leftEyes[i] = loadImage('assets/leftEye' + i + '.png')
    rightEyes[i] = loadImage('assets/rightEye' + i + '.png')
  }
}

function setup() {
  createCanvas(600, 600);
  img.resize(width, height);
  faceapi = ml5.faceApi(detection_options, modelReady)
}

//Load the model and detect face
function modelReady() {
  select('#modelStatus').html('Model loaded! Analyzing face.');
  console.log(faceapi)
  faceapi.detectSingle(img, gotResults)
}

//Get the results
function gotResults(err, result) {
  if (err) {
    console.log(err)
    return
  }
  detections = result;
  

  //if there is a face, get the positions of pixels that correspond to the landmarks
  if (detections) {

    drawStuff();
  }
  select('#modelStatus').html('Done!');
}

function drawStuff() {
  image(img, 0, 0, width, height)
  //left eye
  let leftEyeBox = getPartBox(detections.parts.leftEye);
  //let leftEyeImg = get(leftEyeBox[0], leftEyeBox[1], leftEyeBox[2], leftEyeBox[3]);

  //right eye
  let rightEyeBox = getPartBox(detections.parts.rightEye);
  //let rightEyeImg = get(rightEyeBox[0], rightEyeBox[1], rightEyeBox[2], rightEyeBox[3]);

  //Switch the eye positions and make them bigger 👀!
  //image(rightEyeImg, leftEyeBox[0], leftEyeBox[1], leftEyeBox[2]*1.2, leftEyeBox[3]*1.2); 
  //image(leftEyeImg, rightEyeBox[0], rightEyeBox[1], rightEyeBox[2]*1.2, rightEyeBox[3]*1.2); 

  image(leftEyes[leftEyeIndex], leftEyeBox[0], leftEyeBox[1], leftEyeBox[2] * 1.2, leftEyeBox[3] * 1.2);
  image(rightEyes[rightEyeIndex], rightEyeBox[0], rightEyeBox[1], rightEyeBox[2] * 1.2, rightEyeBox[3] * 1.2);

  let mouthBox = getPartBox(detections.parts.mouth);
  //let mouthImg = get(mouthBox[0], mouthBox[1], mouthBox[2], mouthBox[3]);

  //make mouth bigger because it is fun 👄!
  //image(mouthImg, mouthBox[0], mouthBox[1], mouthBox[2]*1.2, mouthBox[3]*1.2);   
  image(mouths[mouthIndex], mouthBox[0], mouthBox[1]*0.95, mouthBox[2] * 1.2, mouthBox[3] * 1.2);

  //nose 👃    
  let noseBox = getPartBox(detections.parts.nose);
  //let noseImg = get(noseBox[0], noseBox[1], noseBox[2], noseBox[3]);
  image(noses[noseIndex], noseBox[0], noseBox[1], noseBox[2] * 1.2, noseBox[3] * 1);

}

function getPartBox(facePart) {
  //find the bounding boxes of the face parts
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

  //Outputs from face-API tend to be a bit too narrow (especially for for the eyes), so we make them slightly bigger with offSet

  const offSetX = width / 35;
  const offSetY = height / 25;

  bBox.push(lowX - offSetX); //box x 
  bBox.push(lowY - offSetY); //box y
  bBox.push(highX - lowX + offSetX * 2); //box width
  bBox.push(highY - lowY + offSetY * 2); //box height

  return bBox;
}

function mousePressed() {
  masterIndex++;

  if (masterIndex === nFaceParts) {
    masterIndex = 0;
  }

  leftEyeIndex = rightEyeIndex = mouthIndex = noseIndex = masterIndex;
  drawStuff();
}
  
function keyPressed() {
  
  leftEyeIndex = floor(random(nFaceParts));
  rightEyeIndex = floor(random(nFaceParts));
  mouthIndex = floor(random(nFaceParts));
  noseIndex = floor(random(nFaceParts));
  
  drawStuff();
}  
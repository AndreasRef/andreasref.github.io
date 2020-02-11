// Teachable Machine ml5 image example - modified from The Coding Train https://thecodingtrain.com/TeachableMachine/1-teachable-machine.html
let video;
let label = "waiting...";
let confidence = 0.0;
let classifier;
//let modelURL = 'https://teachablemachine.withgoogle.com/models/K4q78yen/';

let modelURL = ""; //load it locally

function setup() {
  createCanvas(640, 520);
  classifier = ml5.imageClassifier('model.json', modelReady);
  video = createCapture(VIDEO);
  video.hide();
  classifyVideo();
}


// STEP 1: Load the model
function modelReady() {
  console.log("ready");
}

function draw() {
  background(0);
  image(video, 0, 0);

  // STEP 4: Show current label
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label + " " + confidence, width / 2, height - 16);
}

// STEP 2: Do the classifying
function classifyVideo() {
  classifier.classify(video, gotResults);
}

// STEP 3: Get the classification
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // Store the label and classify again
  label = results[0].label;
  confidence = nf(results[0].confidence, 0, 2);
  classifyVideo();
}
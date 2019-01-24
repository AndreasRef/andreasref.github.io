// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Creating a regression extracting features of MobileNet. Build with p5js.
=== */

let featureExtractor;
let classifier;
let video;
let loss;
let imagesOfA = 0;
let imagesOfB = 0;
let classificationResult;
let samples = 0;
let fontSize = 50;
let fontWidth = 100;
let lastResult = .5;
let resultThreshold = .25;

function setup() {
  var canvas = createCanvas(340, 280);
  canvas.parent('canvasContainer');

  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.hide();
  // Extract the features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  // Create a new classifier using those features and give the video we want to use
  classifier = featureExtractor.classification(video, videoReady);
  // Create the UI buttons
  setupButtons();
}

function draw() {
  image(video, 0, 0, 340, 280);
  select('#font-container').style('font-size',`${fontSize}px`);
  //select('#font-container').style('font-variation-settings', `'SKLA' ${fontWidth}`);
  select('#font-container').style('font-variation-settings', `'wght' ${fontWidth}`);
    
  if (classificationResult == 'A') {
    //fontWidth = lerp(fontWidth, 100, 0.05);
      fontWidth = 100;
  } else if (classificationResult == 'B') {
    //fontWidth = lerp(fontWidth, 1000, 0.05);
      fontWidth = 1000;
  }
}

// A function to be called when the model has been loaded
function modelReady() {
  select('#modelStatus').html('Model loaded!');
}

// A function to be called when the video has loaded
function videoReady() {
  select('#videoStatus').html('Video ready!');
}

// Classify the current frame.
function classify() {
  classifier.classify(gotResults);
}

// A util function to create UI buttons
function setupButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "A" to the classifier
  buttonA = select('#ButtonA');
  buttonA.mousePressed(function() {
    classifier.addImage('A');
    select('#amountOfAImages').html(imagesOfA++);
  });

  // When the B button is pressed, add the current frame
  // from the video with a label of "B" to the classifier
  buttonB = select('#ButtonB');
  buttonB.mousePressed(function() {
    classifier.addImage('B');
    select('#amountOfBImages').html(imagesOfB++);
  });

  // Train Button
  train = select('#train');
  train.mousePressed(function() {
    classifier.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        select('#loss').html('Loss: ' + loss);
      } else {
        select('#loss').html('Done Training! Final Loss: ' + loss);
      }
    });
  });

  // Predict Button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);
}

// Show the results
function gotResults(err, result) {
 // Display any error
  if (err) {
    console.error(err);
  }
  select('#result').html(result);

  classificationResult = result;
    
  classify();
}
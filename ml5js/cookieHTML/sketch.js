// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */


let classifier;
let video;
let currentPrediction;

var rhymes = "nothing";
var rhymesList;
var word = "band aid";

let randomN1 = 0;
let randomN2 = 0;

//fortunes that end with a singular noun
var fortunes = ["A good way to keep healthy is to eat more Chinese food.", 
"You are the master of every situation.", "Wherever you go, whenever you can, try to leave a gift.", 
"Reach out your hand today to support others who need you.", 
"Understanding the nature of change, changes the nature.",
"Your ingenuity and imagination will get results.",
"Example is better than perception.",
"If you have a job without aggravations, you don't have a job.",
"Everything you add to the truth subtracts from the truth."];

function generateRandomIndex(upperBound){
    return Math.floor(Math.random()*(upperBound-1));
}

function setup() {
  //prevent scrollbar to appear in browser
  //createCanvas(windowWidth, windowHeight);
  // Create a camera input
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();
  var canvas = createCanvas(640,480);
  canvas.parent('sketch-holder');

  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);  
    
  lexicon = new RiLexicon();
  //rhymes = lexicon.rhymes(word);   
  frameRate(1);
}

function windowResized() {
}

function draw() {
    tint(255, 228, 129);
    image(video,0,0,width, height);
    textSize(20);
    textAlign(CENTER);
    fill(220,20,60);
    text(rhymes, width/2, height*0.8);
}

function modelReady() {
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
classifier.predict(gotResult);
  //setTimeout(classifyVideo, 2000);
}

// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by probability.

    console.log(results);
    currentPrediction = results[0].className;
    
    currentPrediction = RiTa.tokenize(currentPrediction)[0];
    select('#result').html(currentPrediction);
    
    rhymesList=lexicon.rhymes(currentPrediction);
    
    var nounRhymes = [];
    
    if (rhymesList.length > 0) {
        for (var i = 0; i<rhymesList.length; i++){
            //check if the word that rhymes is a noun, if so save it into a list of all rhymes that are nouns
            if(RiTa.isNoun(rhymesList[i])){
                nounRhymes.push(rhymesList[i]);
            }
        }
        if(nounRhymes.length >= 1){
            //set rhyme to rhyme at random index
            var rhyme = nounRhymes[generateRandomIndex(nounRhymes.length)];
            //var rhyme = nounRhymes[0];
        } else {
            rhyme = "There are no nouns that rhyme."
        }
        var newFortune = RiTa.tokenize(fortunes[generateRandomIndex(fortunes.length)]);
        //var newFortune = RiTa.tokenize(fortunes[0]);
        newFortune[newFortune.length - 2] = rhyme;
        rhymes = RiTa.untokenize(newFortune);
    
    } else {
        rhymes = "nothing for you today"; 
    }
    
  //select('#rhyme').html(rhymes);
    
  classifyVideo();
}
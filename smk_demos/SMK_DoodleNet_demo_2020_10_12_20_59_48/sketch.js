/*
//Changing images: https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_img_src2 
*/

// Initialize the Image Classifier method with DoodleNet.
let classifier;

// A variable to hold the canvas image we want to classify
let canvas;

// Two variable to hold the label and confidence of the result
let label;
let confidence;

function preload() {
  // Load the DoodleNet Image Classification model
  classifier = ml5.imageClassifier('DoodleNet');
}

function setup() {
  // Create a canvas with 280 x 280 px
  canvas = createCanvas(280, 280);
  canvas.parent('sketch-holder');
  // Set canvas background to white
  background(255);
  // Whenever mouseReleased event happens on canvas, call "classifyCanvas" function
  canvas.mouseReleased(classifyCanvas);
  // Create a clear canvas button
  let lineBreak = createDiv("");
  let button = createButton('Clear Canvas');
  //button.position(7, 44);
  button.mousePressed(clearCanvas);
  // Create 'label' and 'confidence' div to hold results
  label = createDiv('Label: ...');
  confidence = createDiv('Confidence: ...');
}

function clearCanvas() {
  background(255);
}

function draw() {
  // Set stroke weight to 10
  strokeWeight(15);
  // Set stroke color to black
  stroke(0);
  // If mouse is pressed, draw line between previous and current mouse positions
  if (mouseIsPressed) {
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

function classifyCanvas() {
  classifier.classify(canvas, gotResult);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  console.log(results);
  // Show the first label and confidence
  label.html('Label: ' + results[0].label);
  confidence.html('Confidence: ' + nf(results[0].confidence, 0, 2)); // Round the confidence to 0.01
  
//apple, banana, bear, bed, boat, book, bottle, bowl, car, cat, chair, couch, cow, cup, table, dog, elephant, fork, glas, horse, knife, orange, person, potted plant, sheep, spoon, vase, zebra

  for (let i = 9; i>-1; i--) {

  if (results[i].label === "apple") {
    document.getElementById("element1").src = "images/apple.jpg";
  } else if (results[i].label === "banana") {
    document.getElementById("element1").src = "images/banana.jpg";
  } else if (results[i].label === "bear") {
    document.getElementById("element1").src = "images/bear.jpg";
  } else if (results[i].label === "bed") {
    document.getElementById("element1").src = "images/bed.jpg";
  } else if (results[i].label === "speedboat") {
    document.getElementById("element1").src = "images/boat.jpg";
  } else if (results[i].label === "sailboat") {
    document.getElementById("element1").src = "images/boat.jpg";
  } else if (results[i].label === "book") {
    document.getElementById("element1").src = "images/book.jpg";
  } else if (results[i].label === "bottle") {
    document.getElementById("element1").src = "images/bottle.jpg";
  } else if (results[i].label === "bowl") {
    document.getElementById("element1").src = "images/bowl.jpg";
  } else if (results[i].label === "car") {
    document.getElementById("element1").src = "images/car.jpg";
  } else if (results[i].label === "police_car") {
    document.getElementById("element1").src = "images/car.jpg";
  } else if (results[i].label === "cat") {
    document.getElementById("element1").src = "images/cat.jpg";
  } else if (results[i].label === "chair") {
    document.getElementById("element1").src = "images/chair.jpg";
  } else if (results[i].label === "couch") {
    document.getElementById("element1").src = "images/couch.jpg";
  } else if (results[i].label === "cow") {
    document.getElementById("element1").src = "images/cow.jpg";
  } else if (results[i].label === "cup") {
    document.getElementById("element1").src = "images/cup.jpg";
  } else if (results[i].label === "table") {
    document.getElementById("element1").src = "images/table.jpg";
  } else if (results[i].label === "dog") {
    document.getElementById("element1").src = "images/dog.jpg";
  } else if (results[i].label === "elephant") {
    document.getElementById("element1").src = "images/elephant.jpg";
  } else if (results[i].label === "fork") {
    document.getElementById("element1").src = "images/fork.jpg";
  } else if (results[i].label === "wine_glas") {
    document.getElementById("element1").src = "images/glas.jpg";
  } else if (results[i].label === "horse") {
    document.getElementById("element1").src = "images/horse.jpg";
  } else if (results[i].label === "knife") {
    document.getElementById("element1").src = "images/knife.jpg";
  } else if (results[i].label === "orange") {
    document.getElementById("element1").src = "images/orange.jpg";
  } else if (results[i].label === "person") {
    document.getElementById("element1").src = "images/person.jepg";
  } else if (results[i].label === "monkey") {
    document.getElementById("element1").src = "images/person.jpeg";
  } else if (results[i].label === "house_plant") {
    document.getElementById("element1").src = "images/potted_plant.jpg";
  } else if (results[i].label === "sheep") {
    document.getElementById("element1").src = "images/sheep.jpg";
  } else if (results[i].label === "spoon") {
    document.getElementById("element1").src = "images/spoon.jpg";
  } else if (results[i].label === "vase") {
    document.getElementById("element1").src = "images/vase.jpg";
  } else if (results[i].label === "zebra") {
    document.getElementById("element1").src = "images/zebra.jpg";
  } else {
    document.getElementById("element1").src = "nothing.jpg";
  }      
}
}

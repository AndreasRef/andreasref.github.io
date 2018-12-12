// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Interactive Selection
// http://www.genarts.com/karl/papers/siggraph91.html

//To do: Add an array that keeps track of past generations

var population;
var info;

var rectSize = 190;
var margin = 10;

var pastGenerations = [];

function setup() {
  createCanvas(1000,600);
  var popmax = 10;
  var mutationRate = 0.05;  // A pretty high mutation rate here, our population is rather small we need to enforce variety
  // Create a population with a target phrase, mutation rate, and population max
  population = new Population(mutationRate,popmax);
  // A simple button class
  button = createButton("evolve new generation");
  button.mousePressed(nextGen);
  button.position(10,500);
  info = createDiv('');
  info.position(10,535);

  console.log(pastGenerations);
}

function draw() {
  background(255);
  // Display the recipes
  population.display();
  if (mouseIsPressed) population.rollover(mouseX,mouseY); //Changed it so you have to press mouse
  info.html("Generation #:" + population.getGenerations());
}

// If the button is clicked, evolve next generation
function nextGen() {
  population.selection();
  population.reproduction();

  console.log(pastGenerations);
}

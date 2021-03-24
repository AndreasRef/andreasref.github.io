//Noise Start
var yoff = 0.0;

//Genetic start
var population;
var info;

//Counter
var iterations = 0;
var animate = true;
var maxIterations = 500;


//Booleans
var selectedStroke = false;
var showInfo = true;

var rectWidthStart = rectWidth = 280;
var rectHeightStart = rectHeight = 175;

var spacing = 15;
var rows = 4;
var columns = 4;
var popmax = rows * columns;
var buttonText = "Add votes first...";

//sloppy update with control variables
var counter = 0;
var votes = 0;



function setup() {
  createCanvas(1200, 800);
  background(0);
  pixelDensity(2);

  var mutationRate = 0.05; // A pretty high mutation rate here, our population is rather small we need to enforce variety
  // Create a population with a target phrase, mutation rate, and population max
  population = new Population(mutationRate, popmax);
  // A simple button class
  button = createButton(buttonText);
  button.mousePressed(nextGen);
  button.position(spacing, height + 25);
  info = createDiv('');
  info.position(spacing, height - 25);
  info.style("color", "#FFFFFF");

  fill(255);
  stroke(255);
  //frameRate(10);
  background(0);
}

function draw() {

  if (iterations < maxIterations) {
    population.display();
    iterations++;
    info.html("");
  }
  if (population.getGenerations() < 3) {
    if (showInfo) population.displayFitness();

    info.html("Generation #:" + population.getGenerations() + "   Press the mouse over the paintings you like. Press the button below to evolve the next generation.");
  }


  if (mouseIsPressed) {
    population.rollover(mouseX, mouseY);
  }

  if (votes > 0) button.html("Evolve new generation");

}

// If the button is clicked, evolve next generation
function nextGen() {
  if (votes > 0 || counter == 3) {
  votes = 0;
  button.html("Add votes first...");
  


    //Messy, but works
    if (counter == 3) {
      counter = 0;
      votes = 0;
    } else {
      counter++;
    }

    background(0);
    animate = true;
    iterations = 0;
    population.selection();
    population.reproduction();

    if (counter == 3) {
      button.html("Start over")
    } else {
      //button.html("Evolve new generation")
    }

    /*
    if (population.getGenerations() == 2) {
      info.html("");
    }
    */
  }
}


//NOISE
function updateNoise() {
  var yoff = 0;
  for (var y = 0; y < rowsNoise; y++) {
    var xoff = 0;
    for (var x = 0; x < colsNoise; x++) {
      var index = x + y * colsNoise;
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0003;
  }
}
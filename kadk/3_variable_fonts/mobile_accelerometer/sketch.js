
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var maxWght = 1000;
var minWght = 0;

var target = 500;

var lerpSpeed = 0.05;

var x, y, z;
var xpos, ypos;

function setup() { 
    createCanvas(400, 400);

    // default values
    xpos = 200;
    ypos = 200;
    x = 0;
    y = 0;
    myText = document.getElementById("text");
}

function draw() { 
    wghtValue = map(x,-10,10,minWght,maxWght);

    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";

    myText.setAttribute("style", settings);
     // set background color to white
  
    background(255);


  // display variables
  fill(0);
  noStroke();
  text("x: " + x, 25, 25);
  text("y: " + y, 25, 50);
  text("z: " + z, 25, 75); 
}

// accelerometer Data
window.addEventListener('devicemotion', function(e) 
{
  // get accelerometer values
  x = parseInt(e.accelerationIncludingGravity.x);
  y = parseInt(e.accelerationIncludingGravity.y);
  z = parseInt(e.accelerationIncludingGravity.z); 
});
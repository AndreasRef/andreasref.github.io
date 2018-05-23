
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var lerpSpeed = 0.05;

function setup() { 
    myText = document.getElementById("text");
    createCanvas(windowWidth, windowHeight);
}

function draw() { 
    wghtValue = lerp(wghtValue, height, lerpSpeed);
    
    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";
    
    myText.setAttribute("style", settings);
    
    console.log(width);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
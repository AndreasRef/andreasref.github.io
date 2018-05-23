
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var maxWght = 1000;
var minWght = 0;

var target = 500;

var lerpSpeed = 0.05;

function setup() { 
    myText = document.getElementById("text");
}

function draw() { 
    wghtValue = mouseX;
    
    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";
    
    myText.setAttribute("style", settings);
}
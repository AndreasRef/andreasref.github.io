
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var maxWght = 1000;
var minWght = 0;

var speed = 0.05;

function setup() { 
    myText = document.getElementById("text");
}

function draw() { 
    //The variable wghtValue controls the wght of your font.
    //Drag and drop it onto https://www.axis-praxis.org/ to see its boundaries
    wghtValue = sin(frameCount*speed)*maxWght/2 + maxWght/2;

    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";
    
    myText.setAttribute("style", settings);
}
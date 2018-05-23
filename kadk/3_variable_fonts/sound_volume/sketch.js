
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var maxWght = 1000;
var minWght = 0;

var mic;
var micLevelLerped = 0; 
var lerpSpeed = 0.25;

function setup() { 
    myText = document.getElementById("text");

    mic = new p5.AudioIn();
    mic.start();
}

function draw() { 
    
    // Get the overall volume (between 0 and 1.0)
    var vol = mic.getLevel();
    micLevelLerped = lerp(micLevelLerped, vol, lerpSpeed);
    
    //The variable wghtValue controls the wght of your font.
    //Drag and drop it onto https://www.axis-praxis.org/ to see its boundaries
    wghtValue = micLevelLerped*maxWght;

    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";

    myText.setAttribute("style", settings);
}
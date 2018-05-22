
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

function setup() { 
    myText = document.getElementById("text");
}

function draw() { 
    //The variable wghtValue controls the wght of your font.
    //Drag and drop it onto https://www.axis-praxis.org/ to see its boundaries
    wghtValue = sin(frameCount/10.0)*500 + 500;

    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";
    
    myText.setAttribute("style", settings);
}

var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var lerpSpeed = 0.05;

function setup() { 
    myText = document.getElementById("text");
    createCanvas(windowWidth, 400);
}

function draw() { 

    background(255);
    
    fill(0);
    var squeezeFactor = 90;
    var rectHeight = squeezeFactor+sin(frameCount/60.0)*squeezeFactor
    var rectHeight2 = squeezeFactor+sin(frameCount/60.0)*squeezeFactor
    rect(5,5, width-10, rectHeight);

    rect(5,height-5, width-10, -rectHeight);
    
    
    
    wghtValue = map(sin(frameCount/60.0),-1,1,700,100);
    
    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";

    myText.setAttribute("style", settings);

    console.log(width);

    
    

    

}

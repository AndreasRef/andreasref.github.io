
var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var maxWght = 1000;
var minWght = 0;

var target = 500;

var lerpSpeed = 0.05;

var fire = false;
var img;
var img2;

var target = 0;

function setup() { 
    myText = document.getElementById("text");
    
    createCanvas(400, 400);
    img = loadImage("matchbox.png");
    img2 =loadImage("MatchStick.png");
    noCursor();
}

function draw() { 
    
    
    var noiseFactor = 0;
    
    if (fire == true) {
          target = 100;
         noiseFactor = 600;
            //myText.setAttribute("style", "color: blue");
    }   else {
        target = 100;
        noiseFactor = 0;
    }
    
    wghtValue = target + noise(frameCount/10.0)*noiseFactor;
    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";
    
    myText.setAttribute("style", settings);
    
    background(255);
	image(img, 200, 200, 100, 100); //Tændstiksæske
    image(img2, mouseX, mouseY, 70, 100); //Tændstik
    
}

function mousePressed() {
  
   if (dist(mouseX, mouseY, 250,250) < 50 && random(100)>50) {
  	fire = true;
  }
  
}
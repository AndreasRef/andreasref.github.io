var capture;

var k = 3; //k can be any integer
var machine = new kNear(k);

var currentClass = 0;
var pixelColors = [];
var nSamples = 0;
showCapture = false;

var test = 0;

var myText; //Your text
var wghtValue = 0; //Variable for controlling the wght parameter of your font

var maxWght = 1000;
var minWght = 0;

var target = 500;

var lerpSpeed = 0.05;

function setup() {
    createCanvas(640, 480);
    capture = createCapture(VIDEO);
    capture.size(640, 480);
    capture.hide();

    myText = document.getElementById("text");
}

function draw() {
    background(0);
    capture.loadPixels();

    var boxWidth = 64;
    var boxHeight = 48

    var tot = boxWidth * boxHeight;

    pixelColors = [];

    for (var y = 0; y < height; y += boxHeight) {
        for (var x = 0; x < width; x += boxWidth) {
            var r = 0,
                g = 0,
                b = 0;

            for (var i = 0; i < boxWidth; i++) {
                for (var j = 0; j < boxHeight; j++) {
                    var index = (x + i) + (y + j) * 640;
                    r += capture.pixels[index * 4];
                    g += capture.pixels[index * 4 + 1];
                    b += capture.pixels[index * 4 + 2];
                }
            }

            r = r / tot;
            g = g / tot;
            b = b / tot;

            noStroke();
            fill(r, g, b);
            pixelColors.push(r + g + b);
            rect(x, y, boxWidth, boxHeight);
        }
    }

    if (mouseIsPressed) {
        machine.learn(pixelColors, currentClass);
        nSamples++;
        //print(pixelColors.length);
        fill(255,0,0);
        ellipse(width-25,25,25,25);
    } else if (nSamples >0)  {
        fill(0,255,0);
        test = machine.classify(pixelColors);
        textSize(56);
        text(test, width/2, height/2);

    }

    fill(0);
    textSize(12);
    text("press [0-9] to change current class --- hold mouse to record samples", 10, 25);
    textSize(24);
    text("trainingClass: " + currentClass, 10, 75);
    text(" nSamples: " + nSamples, width -175, 75);

    image(capture, width-160, height-120,160,120);
    
    //Variable font stuff
    //Set your targets
    if (test == 0) {
        target = minWght;
    } else if (test == 1) {
        target = maxWght;
    }
    
    
    wghtValue = lerp(wghtValue, target, lerpSpeed);

    var settings = "font-variation-settings: " + '"' + "wght" + '" ' + wghtValue + ";";

    myText.setAttribute("style", settings);

}

function keyPressed() {
    if (key == '0') {
        currentClass = 0;
    } else if (key == '1') {
        currentClass = 1;
    } else if (key == '2') {
        currentClass = 2;
    } else if (key == '3') {
        currentClass = 3;
    } else if (key == '4') {
        currentClass = 4;
    } else if (key == '5') {
        currentClass = 5;
    } else if (key == '6') {
        currentClass = 6;
    } else if (key == '7') {
        currentClass = 7;
    } else if (key == '8') {
        currentClass = 8;
    } else if (key == '9') {
        currentClass = 9;
    } 
}

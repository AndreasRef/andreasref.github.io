var glockenSamples = [];
var bassonSamples = [];
var nSamples = 8;
var img;
var positions = [];
var startY;

var keys = new Array("a", "s", "d", "f", "g", "h", "w", " "); //Change these to MakeyMakey keys

var glockenTrueBassonFalse = true;

function setup() {
    createCanvas(displayWidth, displayHeight-100);
    startY = height-50;

    img = loadImage('assets/' + 'doremi_red.png');
    img.resize(50, 100);

    for (var i = 0; i<nSamples; i++) {
        glockenSamples [i] = loadSound('assets/glocken/' + i + '.mp3');
        bassonSamples [i] = loadSound('assets/basson/' + i + '.mp3');
        positions [i] = 0;
    }
}

function draw() {
    background(255);
    fill(0);
    text("Play notes by pressing a, s, d, f, g, w and space. Change instrument on mouse click.", 50, 50);
    
    for (var i = 0; i<nSamples; i++) {
        tint(255,map(height-positions[i],0,height,255,50))
        image(img, i * (displayWidth/(nSamples+1)) + displayWidth/(nSamples+2) , positions[i]);
        positions[i] -= height/45;
    }
}

function mousePressed() {
    glockenTrueBassonFalse = !glockenTrueBassonFalse;
}

function keyTyped() {
    for (var i = 0; i<nSamples;i++) {
        if (key === keys[i]) {
            if (glockenTrueBassonFalse) {
                glockenSamples[i].play();
            }
            else {
                bassonSamples[i].play();
            }
            positions[i] = startY;
        }
    }
}






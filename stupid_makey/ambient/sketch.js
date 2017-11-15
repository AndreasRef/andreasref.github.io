var ambientSamples = [];
var nSamples = 3;
var img;
var volumens = [];
var imgs = [];

var keys = new Array("a", "s", "d"); //Change these to MakeyMakey keys


function preload() {
    ambientSamples[0] = loadSound('assets/Pad.mp3');
    ambientSamples[1] = loadSound('assets/Piano.mp3');
    ambientSamples[2] = loadSound('assets/Bells.mp3');
    
    imgs[0] = loadImage('assets/Pad.png');
    imgs[1] = loadImage('assets/Piano.png');
    imgs[2] = loadImage('assets/Bells.png');
    
}

function setup() {
    createCanvas(displayWidth, displayHeight-100);

    for (var i = 0; i<nSamples;i++) {
        volumens [i] = 1.0;
        ambientSamples[i].play();
        ambientSamples[i].loop();
    }    
    imageMode(CENTER);
}

function draw() {
    background(255);
    fill(0);
    text("Press a, s or d to turn up the volume of each ambient instrument.", 50, 50);
    
    for (var i = 0; i<nSamples;i++) {
        volumens[i]-=0.01;
        volumens[i]=constrain(volumens[i],0.001,2);   
        ambientSamples[i].amp(volumens[i]);
        //text(volumens[i], 50, i*50 + 100);
        image(imgs[i], width/2, height/2, imgs[i].width * volumens[i], 835 * volumens[i]);
    }


    if (keyIsPressed) {
        for (var i = 0; i<nSamples;i++) {
            if (key === keys[i]) {
                volumens[i] +=0.03;
            }
        }
    }
}








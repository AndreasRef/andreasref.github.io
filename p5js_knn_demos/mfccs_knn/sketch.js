//Basic KNN classification of MFFCs

var k = 3; //k can be any integer
var machine = new kNear(k);
var test;
var currentClass = 0;
var nSamples = 0;

var audio;
var normalized = [];

var mfcc;
var loudness = 0;
var loudnessThreshold = 10;

var soundReady = false;


//TRIGGER MODE
var predictionAlpha = 255;

var singleTrigger = true;
var startTime;
var triggerTimerThreshold = 300;
var timer; 
var test = 0;

function setup() {
    createCanvas(640, 480);
    audio = new MicrophoneInput(512);
    startTime = millis();
}

function draw() {
    background(255);
    textSize(12);

    timer = millis() - startTime;
    if (timer>triggerTimerThreshold) {
        singleTrigger = true;
    }


    if (soundReady) {
        fill(0);
        noStroke();
        text("LOUDNESS " + nf(loudness, 1, 2), width/2 + 25, 375);
        text("MFCCs", + 10,  375);

        if (loudness > loudnessThreshold) {
            fill(0,255,0);
        } else {
            fill(122);
        }

        if (singleTrigger == false) {
            fill (255,0,0);
        }

        stroke(0);
        ellipse(width /2 + 175, 375, loudness*3, loudness*3);

        fill(0,255,0);
        for (var i = 0; i < 13; i++) {
            rect(i*(15)+ 100, 375, 10, mfcc[i]*5);
        }
    }

    //TEST
    if (mouseIsPressed && (loudness > loudnessThreshold) && singleTrigger ) {
        machine.learn(mfcc, currentClass);
        nSamples++;

        fill(255, 0, 0);
        noStroke();
        ellipse(width - 25, 25, 25, 25);

        singleTrigger = false;
        startTime = millis();


    } else if (nSamples >0 && (loudness > loudnessThreshold) && singleTrigger)  {
        fill(0,255,0);
        if (loudness > loudnessThreshold) {

            test = machine.classify(mfcc);
            singleTrigger = false;
            startTime = millis();
            predictionAlpha = 255;
        }
    }

    noStroke();
    fill(0, 255, 0, predictionAlpha);
    textSize(126);
    text(test, width/3, height/2);

    noStroke();
    fill(0);
    textSize(12);
    text("press [0-9] to change current class --- hold mouse to record samples", 10, 15);
    textSize(12);
    text("trainingClass: " + currentClass, 10, 35);
    text(" nSamples: " + nSamples, width -350, 35);

    if (predictionAlpha > 0) predictionAlpha-=5;


}

function soundDataCallback(soundData) {
    soundReady = true;
    mfcc = soundData.mfcc;
    loudness= soundData.loudness.total;

    var peaked = false;

    for (var i = 0; i < 13; i++) {
        normalized[i] = map(mfcc[i],-10,30,0,1);
    }
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
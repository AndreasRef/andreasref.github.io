var soundclips = [];
// var button;
// var backtrackButton;
var backtrack;

function preload() {
    
    for (var i = 0; i<280; i++) {
        soundclips[i] = loadSound("mp3/" + i + ".mp3");
        console.log(i + "loaded");
    }
    //backtrack.loop();
}

function setup() {
    noCanvas();
    backtrack = loadSound('backtrack.mp3', backTrackLoaded);
    //backtrack = loadSound('unknown.mp3', playSoundtrack);
   
    // button = createButton('start Hammerslag');
    // button.position(0, 0);
    // button.mousePressed(afspil);
    // backtrackButton = createButton('start backtrack');
    // backtrackButton.position(150, 0);
    // backtrackButton.mousePressed(playBacktrack);

}

function draw() {
  
}

function backTrackLoaded() {
    console.log("backTrackLoaded");
}

function playNewClip () {
    var n = floor(random(soundclips.length));
    soundclips[n].play();
    soundclips[n].onended(playNewClip);
}

function afspil() {
    console.log("play hammerslag");
    soundclips[0].play();
    soundclips[0].onended(playNewClip);
}

function mousePressed() {
    // soundclips[0].play();
    // soundclips[0].onended(playNewClip);
}

function playBacktrack() {
    console.log("play backtrack");
    backtrack.play();
    backtrack.onended(playBacktrack);
}
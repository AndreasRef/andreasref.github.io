var soundclips = [];

function preload() {
    for (var i = 0; i<280; i++) {
        soundclips[i] = loadSound("mp3/" + i + ".mp3");
        console.log(i + "loaded");
    }
}

function setup() {
    soundclips[0].play();
    soundclips[0].onended(playNewClip);
}

function draw() {
  
}

function playNewClip () {
    var n = floor(random(soundclips.length));
    soundclips[n].play();
    soundclips[n].onended(playNewClip);
}
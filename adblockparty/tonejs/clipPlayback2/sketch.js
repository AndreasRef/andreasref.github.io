/*To do:
Connect back with the visuals?
Switch between clips once finished?
Make tutorial/screenshot on how to do this for the musicians
Clearly state your role (where it starts and ends)
*/

//TONE.JS STUFF
var drumMeter = new Tone.Meter();
var bassMeter = new Tone.Meter();
var synthMeter = new Tone.Meter();

var drums = [];
var bass = [];
var synths = [];

var nLoops = 3;

var currentBass;
var currentDrums;
var currentSynths;

Tone.Transport.bpm.value = 129;
Tone.Transport.setLoopPoints(0, "1m");
Tone.Transport.loop = true;

    for (var i = 0; i<nLoops; i++) {
      drums[i] = new Tone.Player({
        url : "audioClips/ableton/drums_"+i+".mp3",
        loop : true
      }).toMaster().sync().start(0);

      bass[i] = new Tone.Player({
        url : "audioClips/ableton/bass_"+i+".mp3",
        loop : true
      }).toMaster().sync().start(0);

      synths[i] = new Tone.Player({
        url : "audioClips/ableton/synth_"+i+".mp3",
        loop : true
      }).toMaster().sync().start(0);
    }

    disconnectLoops(drums);
    disconnectLoops(bass);
    disconnectLoops(synths);

    currentDrums = Math.floor(Math.random() * 3);
    currentBass = Math.floor(Math.random() * 3);
    currentSynths = Math.floor(Math.random() * 3);


    startRandomLoop(drums, currentDrums);
    startRandomLoop(bass, currentBass);
    startRandomLoop(synths, currentSynths);



function setup() {
  createCanvas(400, 400);
  background(255);
  text("click mouse to start music \npress 's' to stop music \nreload page to set new random clips", 20, 20);

  text("drum clip: " + currentDrums, 20, 100);
  text("bass clip: " + currentBass, 20, 120);
  text("synth clip: " + currentSynths, 20, 140);
}

function draw() {

 }

function mousePressed() {
  started = true;
  musicPlaying = true;
  Tone.Transport.start("+0.1");
}


function keyTyped() {
  if (key === 's') {
    started = false;
    musicPlaying = false;
    Tone.Transport.pause();
  }
  if (key === 'd') {
    // drums.disconnect();
    // drums1.toMaster();
  }
  if (key === 'e') {
    // drums.toMaster();
    // drums1.disconnect();
  }
}

function startRandomLoop(instrument, clip) {
  instrument[clip].toMaster();
}

function disconnectLoops(instrument) {
  for (var i = 0; i<nLoops; i++) {
    instrument[i].disconnect();
  }
}

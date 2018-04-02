// ADVERTISING STUFF
var bg;
var leftAd;
var rightAd;
var topAd;

var bLeftAd;
var bRightAd;

var leftAdPg;
var rightAdPg;
var topAdPg;

var bLeftAdPg;
var bRightAdPg;

var margin = 50;

var musicPlaying = false;


//TONE.JS STUFF
var bassMeter = new Tone.Meter();
var drumMeter = new Tone.Meter();
var guitarMeter = new Tone.Meter();
var voxMeter = new Tone.Meter();

    var bass = new Tone.Player({
      url : "audioClips/bowie/basse_2.[mp3|ogg]",
      loop : true,
      volume : - 10
    }).connect(bassMeter).toMaster().sync().start(0);

    var drums = new Tone.Player({
      url : "audioClips/bowie/batterie_2.[mp3|ogg]",
      loop : true
    }).connect(drumMeter).toMaster().sync().start(0);

    var guitar = new Tone.Player({
      url : "audioClips/bowie/guitare_2.[mp3|ogg]",
      loop : true
    }).connect(guitarMeter).toMaster().sync().start(0);


    var vox = new Tone.Player({
      url : "audioClips/bowie/voix_2.[mp3|ogg]",
      loop : true
    }).connect(voxMeter).toMaster().sync().start(0);

    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "10m";
    Tone.Transport.loopEnd = "256m";

  function preload() {
        bg = loadImage('data/bg.jpg')


        leftAd = loadImage('data/leftAd.jpg')

        rightAd = loadImage('data/rightAd.jpg')

        topAd = loadImage('data/topAd.jpg')

        bLeftAd = loadImage('data/bLeftAd.png');

        bRightAd = loadImage('data/bRightAd.png');

  }


function setup() {
  createCanvas(1350/2, 1045/2);

  bg.resize(bg.width/2,bg.height/2);
  //leftAd.resize(leftAd.width/2,leftAd.height/2);

  leftAdPg = createGraphics(leftAd.width/2, leftAd.height/2);
  rightAdPg = createGraphics(rightAd.width/2, rightAd.height/2)
  topAdPg = createGraphics(topAd.width/2, topAd.height/2)
  //
   bLeftAdPg = createGraphics(bLeftAd.width/2, bLeftAd.height/2)
  // bRightAdPg = createGraphics(bRightAd.width, bRightAd.height)
  //
   leftAdPg.noStroke();
   rightAdPg.noStroke();
   topAdPg.noStroke();
  //
   bLeftAdPg.noStroke();
  // bRightAdPg.noStroke();

  nMuted = 0;

  if (random(1) > 0.5) {
    bass.mute = true;
    nMuted++;
  }
  if (random(1) > 0.5) {
    drums.mute = true;
    nMuted++;
  }
  if (random(1) > 0.5) {
    guitar.mute = true;
    nMuted++;
  }
  if (random(1) > 0.5) {
    vox.mute = true;
    nMuted++;
  }

//Make sure something exciting happens
if (nMuted === 4) {
  bass.mute = false;
  drums.mute = false;
  guitar.mute = false;
  vox.mute = false;
} else if (nMuted === 3 && vox.mute) {
  bass.mute = false;
}
}

function draw() {
   var bassLevel = bassMeter.getLevel();
   bassLevel = Tone.dbToGain(bassLevel);

   var drumLevel = drumMeter.getLevel();
   drumLevel = Tone.dbToGain(drumLevel);
  //
  var guitarLevel = guitarMeter.getLevel();
  guitarLevel = Tone.dbToGain(guitarLevel);

  var voxLevel = voxMeter.getLevel();
  voxLevel = Tone.dbToGain(voxLevel);
  //
   //background(0);
   image(bg,0,0);

   //LEFT AD
   leftAdPg.image(leftAd,0,0, leftAd.width/4, leftAd.height/4);
   leftAdPg.fill(255, 255 - bassLevel*355);
   leftAdPg.rect(0, 0, leftAd.width, leftAd.height);
   image(leftAdPg,150/2, 295/2);

   //RIGHT AD
    rightAdPg.image(rightAd,0,0, rightAd.width/4, rightAd.height/4);
    rightAdPg.fill( 255, 255 - drumLevel*355);
    rightAdPg.rect(0, 0, rightAd.width, rightAd.height);
    image(rightAdPg, 935/2, 295/2);

    //TOP AD
    topAdPg.image(topAd,0,0, topAd.width/4, topAd.height/4);
    topAdPg.fill(255, 255 -guitarLevel*355);
    topAdPg.rect(0, 0, topAd.width, topAd.height);
    image(topAdPg, 276/2, 152/2);

    //bLeftAd
    bLeftAdPg.image(bLeftAd, 0, 0, bLeftAd.width/4, bLeftAd.width/4);
    bLeftAdPg.fill(255, 255 -voxLevel*355);
    bLeftAdPg.rect(0,0, leftAdPg.width, leftAdPg.height);
    image(bLeftAdPg, 50/2, 295 + leftAd.height/4 + margin/2);


    if (musicPlaying == false) {
      textSize(12);
      fill(255,0,0, min(frameCount,255));
      text("Press mouse to play \nReload page to get new ads", 10, 110);
    } else {
      textSize(8);
      fill(0);
      text("Press a key to pause \nReload page to get new ads", 10, 110);
    }
}


function mousePressed() {
  started = true;
  musicPlaying = true;
  Tone.Transport.start("+0.1");
}


function keyPressed() {
  started = false;
  musicPlaying = false;
  Tone.Transport.pause();
}
